"""Schema contracts for evidence, parse output, and errors."""

import pytest
from pydantic import ValidationError

from app.schemas import (
    ErrorResponse,
    EvidenceItem,
    ParsedDocument,
    ParsedDocumentMetadata,
    QueryResponse,
)


def test_parsed_document_requires_source_metadata() -> None:
    doc = ParsedDocument(
        text="hello",
        metadata=ParsedDocumentMetadata(filename="a.txt", page_count=1, source_type="txt"),
        pages=[{"page_number": 1, "text": "hello"}],
    )
    assert doc.metadata.source_type == "txt"


def test_evidence_item_bounds_confidence() -> None:
    with pytest.raises(ValidationError):
        EvidenceItem(source_type="document", confidence=1.5)


def test_query_response_requires_evidence_list() -> None:
    body = QueryResponse(answer="ok", evidence=[], model="llama3.1", latency_ms=12)
    dumped = body.model_dump()
    assert "evidence" in dumped
    assert dumped["latency_ms"] == 12


def test_error_schema_shape() -> None:
    err = ErrorResponse(error_code="UNSUPPORTED_MEDIA_TYPE", message="Not allowed", detail={"mime": "image/gif"})
    assert set(err.model_dump()) == {"error_code", "message", "detail"}
