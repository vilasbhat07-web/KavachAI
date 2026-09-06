"""Closed tool-routing loop. Not an open-ended ReAct agent."""

import json
import re
import time
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.agents import prompts
from app.config import Settings
from app.rag.embeddings import EmbeddingClient
from app.rag.llm_client import LLMClient
from app.rag.vector_store import VectorStore
from app.schemas.agent import AgentQueryRequest, AgentQueryResponse, AgentStep
from app.schemas.common import EvidenceItem
from app.schemas.query import QueryRequest
from app.services import query_service
from app.services import audit_service
from app.tools import CALCULATOR, IMAGE_ANALYSIS, PYTHON_ANALYSIS, RETRIEVE
from app.tools.calculator_tool import evaluate
from app.tools.python_analysis_tool import run_analysis
from app.utils.logging import get_logger, log_event

logger = get_logger(__name__)

_CALC_RE = re.compile(
    r"^\s*[-+(]*\d[\d\s+\-*/().%eE]*\s*$"
)


def _audit_step(
    db: Session,
    *,
    user_id: str,
    request: AgentQueryRequest,
    step: AgentStep,
    status: str,
    output_payload: dict[str, Any],
) -> None:
    """Persist one agent routing or tool-execution step without storing raw tool input."""
    audit_service.record(
        db,
        action_type="agent.step",
        status=status,
        latency_ms=step.latency_ms,
        user_id=user_id,
        input_payload={
            "step_index": step.step_index,
            "action": step.action,
            "query": request.query[:500],
            "document_id": request.document_id,
            "image_document_id": request.image_document_id,
        },
        output_payload=output_payload,
    )


def _rule_route(request: AgentQueryRequest) -> dict[str, Any]:
    query = request.query.strip()
    lowered = query.lower()
    if request.image_document_id or "image" in lowered and "describe" in lowered:
        return {"action": "image"}
    if lowered.startswith("analyze with python") or lowered.startswith("```python"):
        return {"action": "python_analysis", "code": query}
    if _CALC_RE.match(query) or lowered.startswith("calculate ") or lowered.startswith("compute "):
        expression = query
        for prefix in ("calculate ", "compute ", "what is ", "what's "):
            if lowered.startswith(prefix):
                expression = query[len(prefix) :]
                break
        return {"action": "calculator", "expression": expression}
    return {"action": "retrieve"}


async def _llm_route(request: AgentQueryRequest, llm: LLMClient) -> dict[str, Any]:
    raw = await llm.chat(
        [
            {"role": "system", "content": prompts.ROUTER_SYSTEM},
            {"role": "user", "content": request.query},
        ],
        temperature=0.0,
    )
    raw = raw.strip()
    start = raw.find("{")
    end = raw.rfind("}")
    if start < 0 or end < 0:
        return _rule_route(request)
    try:
        data = json.loads(raw[start : end + 1])
    except json.JSONDecodeError:
        return _rule_route(request)
    if not isinstance(data, dict) or "action" not in data:
        return _rule_route(request)
    return data


async def run(
    request: AgentQueryRequest,
    *,
    settings: Settings,
    embedder: EmbeddingClient,
    store: VectorStore,
    llm: LLMClient,
    db: Session,
    user_id: str,
    use_llm_router: bool = True,
) -> AgentQueryResponse:
    """Bounded tool-routing loop. Every step is logged; evidence is always returned."""
    started = time.perf_counter()
    steps: list[AgentStep] = []
    evidence: list[EvidenceItem] = []
    tool_notes: list[str] = []

    step_started = time.perf_counter()
    decision = _rule_route(request)
    if use_llm_router:
        try:
            decision = await _llm_route(request, llm)
        except Exception as exc:  # noqa: BLE001 — fall back to deterministic router
            log_event(logger, "agent_router_fallback", reason=type(exc).__name__)
            decision = _rule_route(request)

    action = str(decision.get("action") or "retrieve").lower()
    route_step = AgentStep(
        step_index=0,
        action=f"route:{action}",
        input_summary=request.query[:200],
        output_summary=action,
        latency_ms=int((time.perf_counter() - step_started) * 1000),
    )
    steps.append(route_step)
    _audit_step(
        db,
        user_id=user_id,
        request=request,
        step=route_step,
        status="ok",
        output_payload={"decision": action},
    )

    answer = ""
    try:
        if action == "final":
            answer = str(decision.get("answer") or "")
            tool_step = AgentStep(
                step_index=len(steps),
                action="final",
                input_summary=request.query[:200],
                output_summary=answer[:200],
                latency_ms=int((time.perf_counter() - step_started) * 1000),
            )
            steps.append(tool_step)
            _audit_step(
                db,
                user_id=user_id,
                request=request,
                step=tool_step,
                status="ok",
                output_payload={"answer_chars": len(answer)},
            )
        elif action == "calculator":
            step_started = time.perf_counter()
            value = evaluate(str(decision.get("expression") or request.query))
            answer = str(value)
            evidence.append(
                EvidenceItem(source_type="tool", tool_name=CALCULATOR, snippet=str(value), confidence=1.0)
            )
            tool_step = AgentStep(
                step_index=len(steps),
                action=CALCULATOR,
                input_summary=str(decision.get("expression") or "")[:200],
                output_summary=str(value),
                latency_ms=int((time.perf_counter() - step_started) * 1000),
            )
            steps.append(tool_step)
            _audit_step(
                db, user_id=user_id, request=request, step=tool_step, status="ok", output_payload={"result": str(value)}
            )
        elif action == "python_analysis":
            step_started = time.perf_counter()
            code = str(decision.get("code") or request.query)
            result = run_analysis(
                code,
                settings=settings,
                db=db,
                user_id=user_id,
                document_id=request.document_id,
            )
            answer = result.stdout or repr(result.return_value)
            if result.timed_out:
                answer = result.stderr
            evidence.extend(result.evidence)
            tool_step = AgentStep(
                step_index=len(steps),
                action=PYTHON_ANALYSIS,
                input_summary="python sandbox",
                output_summary=("timeout" if result.timed_out else "ok"),
                latency_ms=int((time.perf_counter() - step_started) * 1000),
            )
            steps.append(tool_step)
            _audit_step(
                db,
                user_id=user_id,
                request=request,
                step=tool_step,
                status="timeout" if result.timed_out else "ok",
                output_payload={"timed_out": result.timed_out, "stdout_chars": len(result.stdout)},
            )
        elif action == "image":
            answer = (
                "Image analysis is available at POST /image/analyze. "
                "This agent endpoint does not accept raw image bytes."
            )
            evidence.append(
                EvidenceItem(source_type="tool", tool_name=IMAGE_ANALYSIS, snippet=answer, confidence=1.0)
            )
            tool_step = AgentStep(
                step_index=len(steps),
                action=IMAGE_ANALYSIS,
                input_summary=request.image_document_id,
                output_summary="delegated",
                latency_ms=0,
            )
            steps.append(tool_step)
            _audit_step(
                db, user_id=user_id, request=request, step=tool_step, status="ok", output_payload={"delegated": True}
            )
        else:
            step_started = time.perf_counter()
            rag = await query_service.answer_query(
                QueryRequest(query=request.query, document_id=request.document_id),
                embedder=embedder,
                store=store,
                llm=llm,
                settings=settings,
            )
            answer = rag.answer
            evidence.extend(rag.evidence)
            tool_notes.append(RETRIEVE)
            tool_step = AgentStep(
                step_index=len(steps),
                action=RETRIEVE,
                input_summary=request.query[:200],
                output_summary=f"hits={len(rag.evidence)}",
                latency_ms=int((time.perf_counter() - step_started) * 1000),
            )
            steps.append(tool_step)
            _audit_step(
                db,
                user_id=user_id,
                request=request,
                step=tool_step,
                status="ok",
                output_payload={"evidence_count": len(rag.evidence)},
            )
    except Exception as exc:
        failed_step = AgentStep(
            step_index=len(steps),
            action=action,
            input_summary=request.query[:200],
            output_summary="error",
            latency_ms=int((time.perf_counter() - step_started) * 1000),
        )
        _audit_step(
            db,
            user_id=user_id,
            request=request,
            step=failed_step,
            status="error",
            output_payload={"error_type": type(exc).__name__},
        )
        raise

    if len(steps) > settings.agent_max_steps:
        steps = steps[: settings.agent_max_steps]

    latency_ms = int((time.perf_counter() - started) * 1000)
    log_event(logger, "agent_complete", action=action, steps=len(steps), latency_ms=latency_ms)
    return AgentQueryResponse(
        answer=answer,
        evidence=evidence,
        steps=steps,
        model=llm.model_name,
        latency_ms=latency_ms,
    )
