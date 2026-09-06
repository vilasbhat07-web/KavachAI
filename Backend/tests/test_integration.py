"""Integration coverage for routes, auditing, ingestion, and agent tool routing."""

import json
from io import BytesIO
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.config import get_settings
from app.db import get_session_factory, reset_engine
from app.dependencies import embeddings_client, llm_client, vector_store
from app.main import create_app
from app.models.audit_log import AuditLog
from app.models.document import Document
from app.rag.vector_store import InMemoryVectorStore, reset_vector_store


class FakeEmbedder:
    """Deterministic local substitute for Ollama embeddings in route tests."""

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return [[float(len(text) or 1)] for text in texts]

    async def embed_query(self, text: str) -> list[float]:
        return [float(len(text) or 1)]


class FakeLLM:
    """Deterministic local substitute for Ollama chat in route tests."""

    model_name = "test-local-model"

    async def chat(self, messages: list[dict], *, temperature: float | None = None) -> str:
        system = str(messages[0].get("content", "")).lower()
        query = str(messages[-1].get("content", "")).lower()
        if "tool router" in system:
            if "final" in query:
                return json.dumps({"action": "final", "answer": "Direct local answer."})
            if "calculate" in query:
                return json.dumps({"action": "calculator", "expression": "2+2"})
            if "python evidence" in query:
                return json.dumps({"action": "python_analysis", "code": "len(document_data['rows'])"})
            return json.dumps({"action": "retrieve"})
        return "Grounded local test answer."


class FakeEncoding:
    """Offline token encoding substitute so tests never fetch tiktoken assets."""

    def encode(self, text: str) -> list[int]:
        return [ord(char) for char in text]

    def decode(self, tokens: list[int]) -> str:
        return "".join(chr(token) for token in tokens)


@pytest.fixture
def client(tmp_path, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    """Build an application with isolated SQLite, files, vectors, and local-client doubles."""
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{(tmp_path / 'kavach.db').as_posix()}")
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "uploads"))
    monkeypatch.setenv("VECTOR_STORE_BACKEND", "memory")
    monkeypatch.setenv("TEMP", str(tmp_path))
    monkeypatch.setenv("TMP", str(tmp_path))
    monkeypatch.setattr("app.rag.chunking._encoding", lambda _settings: FakeEncoding())
    get_settings.cache_clear()
    reset_engine()
    reset_vector_store()
    app = create_app()
    store = InMemoryVectorStore()
    app.dependency_overrides[embeddings_client] = lambda: FakeEmbedder()
    app.dependency_overrides[llm_client] = lambda: FakeLLM()
    app.dependency_overrides[vector_store] = lambda: store
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    reset_engine()
    reset_vector_store()
    get_settings.cache_clear()


def _upload_csv(client: TestClient) -> str:
    response = client.post(
        "/documents/upload",
        files={"file": ("readings.csv", b"temperature,pressure\n20,1.0\n21,1.1\n", "text/csv")},
    )
    assert response.status_code == 200, response.text
    return response.json()["document_id"]


def test_document_ingestion_query_analysis_and_audit_routes(client: TestClient) -> None:
    """Document routes exercise ingestion, retrieval, document-backed analysis, and audit rows."""
    document_id = _upload_csv(client)

    query = client.post("/query", json={"query": "What temperatures are recorded?"})
    assert query.status_code == 200, query.text
    assert query.json()["evidence"][0]["document_id"] == document_id

    analysis = client.post(
        "/analysis/python",
        json={"document_id": document_id, "code": "len(document_data['rows'])"},
    )
    assert analysis.status_code == 200, analysis.text
    assert analysis.json()["return_value"] == 2, analysis.text
    assert analysis.json()["evidence"][0]["document_id"] == document_id

    with get_session_factory()() as db:
        actions = set(db.scalars(select(AuditLog.action_type)).all())
    assert {"document.ingest", "query.rag", "tool.python_analysis"} <= actions


def test_agent_calculator_and_final_actions_are_audited(client: TestClient) -> None:
    """The agent executes calculator/final actions without unintended retrieval fallback."""
    calculator = client.post("/agent/run", json={"query": "calculate 2 + 2"})
    assert calculator.status_code == 200, calculator.text
    assert calculator.json()["answer"] == "4"
    assert "calculator" in [step["action"] for step in calculator.json()["steps"]]

    final = client.post("/agent/run", json={"query": "final response please"})
    assert final.status_code == 200, final.text
    assert final.json()["answer"] == "Direct local answer."
    assert "retrieve" not in [step["action"] for step in final.json()["steps"]]

    with get_session_factory()() as db:
        steps = db.scalars(select(AuditLog).where(AuditLog.action_type == "agent.step")).all()
    assert any(row.input_payload["action"] == "calculator" for row in steps)
    assert any(row.input_payload["action"] == "final" for row in steps)


def test_agent_forwards_document_evidence_from_python_analysis(client: TestClient) -> None:
    """Agent Python routing preserves the analysis tool's document-grounded evidence."""
    document_id = _upload_csv(client)
    response = client.post(
        "/agent/run",
        json={"query": "python evidence", "document_id": document_id},
    )
    assert response.status_code == 200, response.text
    assert response.json()["evidence"][0]["document_id"] == document_id
    assert response.json()["evidence"][0]["source_type"] == "document"


def test_image_route_creates_document_and_framework_errors_are_normalized(client: TestClient) -> None:
    """Image uploads become durable documents, and framework 404s use the common error body."""
    from PIL import Image

    buffer = BytesIO()
    Image.new("RGB", (1, 1), color="white").save(buffer, format="PNG")
    image_bytes = buffer.getvalue()
    response = client.post("/image/analyze", files={"file": ("site.png", image_bytes, "image/png")})
    assert response.status_code == 200, response.text
    document_id = response.json()["document_id"]
    assert response.json()["evidence"][0]["document_id"] == document_id

    with get_session_factory()() as db:
        image_document = db.get(Document, document_id)
        image_audit = db.scalars(select(AuditLog).where(AuditLog.action_type == "image.analyze")).one()
    assert image_document is not None
    assert image_document.status == "ready"
    assert image_audit.output_payload["document_id"] == document_id

    not_found = client.get("/does-not-exist")
    assert not_found.status_code == 404
    assert set(not_found.json()) == {"error_code", "message", "detail"}
    assert not_found.json()["error_code"] == "NOT_FOUND"


def test_analysis_rejects_missing_and_non_tabular_documents(client: TestClient) -> None:
    """Document-backed analysis returns structured errors for invalid document references."""
    missing = client.post(
        "/analysis/python",
        json={"document_id": "missing-document", "code": "1 + 1"},
    )
    assert missing.status_code == 404
    assert missing.json()["error_code"] == "NOT_FOUND"

    upload = client.post(
        "/documents/upload",
        files={"file": ("note.txt", b"not tabular", "text/plain")},
    )
    assert upload.status_code == 200, upload.text
    non_tabular = client.post(
        "/analysis/python",
        json={"document_id": upload.json()["document_id"], "code": "1 + 1"},
    )
    assert non_tabular.status_code == 400
    assert non_tabular.json()["error_code"] == "TOOL_REJECTED"
    assert "not tabular" in non_tabular.json()["message"].lower()


def test_framework_method_not_allowed_uses_common_error_schema(client: TestClient) -> None:
    """Framework-generated 405 errors retain the API's stable error contract."""
    response = client.get("/query")
    assert response.status_code == 405
    assert response.json()["error_code"] == "METHOD_NOT_ALLOWED"
    assert set(response.json()) == {"error_code", "message", "detail"}
