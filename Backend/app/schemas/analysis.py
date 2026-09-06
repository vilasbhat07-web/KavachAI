"""Controlled Python analysis API models."""

from typing import Any, Optional

from pydantic import BaseModel, Field

from app.schemas.common import EvidenceItem


class AnalysisRequest(BaseModel):
    """User-supplied analysis code. Execution is sandboxed in the tool layer, not here."""

    code: str = Field(..., min_length=1, max_length=32_768)
    document_id: Optional[str] = Field(
        default=None,
        description="If set, the sandbox may load this document's parsed tabular data only.",
    )


class AnalysisResponse(BaseModel):
    """Separated streams from sandboxed execution. No secrets, no host filesystem dumps."""

    stdout: str = ""
    stderr: str = ""
    return_value: Optional[Any] = None
    timed_out: bool = False
    evidence: list[EvidenceItem] = Field(
        ...,
        min_length=1,
        description="Traceable tool or document evidence for this analysis result.",
    )
    latency_ms: int = Field(..., ge=0)
