"""RAG query endpoint. Logic lives in query_service."""

import time

from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession, EmbeddingsDep, LLMDep, SettingsDep, VectorStoreDep
from app.exceptions import KavachError
from app.schemas.query import QueryRequest, QueryResponse
from app.services import audit_service, query_service

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=QueryResponse)
async def query_documents(
    body: QueryRequest,
    db: DbSession,
    settings: SettingsDep,
    embedder: EmbeddingsDep,
    store: VectorStoreDep,
    llm: LLMDep,
    user_id: CurrentUser,
) -> QueryResponse:
    """Retrieve evidence and generate a grounded local-LLM answer."""
    started = time.perf_counter()
    try:
        result = await query_service.answer_query(
            body, embedder=embedder, store=store, llm=llm, settings=settings
        )
        audit_service.record(
            db,
            action_type="query.rag",
            status="ok",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={
                "query": body.query[:500],
                "document_id": body.document_id,
                "top_k": body.top_k,
            },
            output_payload={
                "model": result.model,
                "evidence_count": len(result.evidence),
            },
        )
        return result
    except KavachError as exc:
        audit_service.record(
            db,
            action_type="query.rag",
            status="error",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={"query": body.query[:500], "document_id": body.document_id},
            output_payload={"error_code": exc.error_code},
        )
        raise
