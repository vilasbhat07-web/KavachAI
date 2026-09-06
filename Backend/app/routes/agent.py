"""Agent orchestration endpoint. Logic lives in agents.orchestrator."""

import time

from fastapi import APIRouter

from app.agents import orchestrator
from app.dependencies import CurrentUser, DbSession, EmbeddingsDep, LLMDep, SettingsDep, VectorStoreDep
from app.exceptions import KavachError
from app.schemas.agent import AgentQueryRequest, AgentQueryResponse
from app.services import audit_service

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/run", response_model=AgentQueryResponse)
async def run_agent(
    body: AgentQueryRequest,
    db: DbSession,
    settings: SettingsDep,
    embedder: EmbeddingsDep,
    store: VectorStoreDep,
    llm: LLMDep,
    user_id: CurrentUser,
) -> AgentQueryResponse:
    """Closed tool-routing loop with cited evidence."""
    started = time.perf_counter()
    try:
        result = await orchestrator.run(
            body, settings=settings, embedder=embedder, store=store, llm=llm, db=db, user_id=user_id
        )
        audit_service.record(
            db,
            action_type="agent.run",
            status="ok",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={"query": body.query[:500], "document_id": body.document_id},
            output_payload={
                "steps": [step.action for step in result.steps],
                "evidence_count": len(result.evidence),
            },
        )
        return result
    except KavachError as exc:
        audit_service.record(
            db,
            action_type="agent.run",
            status="error",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={"query": body.query[:500]},
            output_payload={"error_code": exc.error_code},
        )
        raise
