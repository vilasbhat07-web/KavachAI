"""Agent orchestration request/response and per-step traces."""

from typing import Any, List, Optional

from pydantic import BaseModel, Field

from app.schemas.common import EvidenceItem


class AgentQueryRequest(BaseModel):
    """Closed-loop agent request: the orchestrator picks tools, not the client."""

    query: str = Field(..., min_length=1, max_length=16_384)
    document_id: Optional[str] = None
    image_document_id: Optional[str] = Field(
        default=None,
        description="Optional previously stored image reference; never send raw bytes here.",
    )


class AgentStep(BaseModel):
    """One audited tool-routing step."""

    step_index: int = Field(..., ge=0)
    action: str
    input_summary: Optional[str] = None
    output_summary: Optional[str] = None
    latency_ms: int = Field(..., ge=0)


class AgentQueryResponse(BaseModel):
    """Final agent answer with evidence and a bounded step trace."""

    answer: str
    evidence: List[EvidenceItem] = Field(default_factory=list)
    steps: List[AgentStep] = Field(default_factory=list)
    model: str
    latency_ms: int = Field(..., ge=0)
    extra: Optional[dict[str, Any]] = None
