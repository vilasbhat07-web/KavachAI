"""Image analysis response. Upload is multipart; this is the JSON body returned."""

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import EvidenceItem


class ImageAnalyzeResponse(BaseModel):
    """Structured description from a local vision model or CV fallback."""

    document_id: str
    description: str
    labels: list[str] = Field(default_factory=list)
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    model: str
    used_vision_llm: bool
    evidence: list[EvidenceItem] = Field(default_factory=list)
    latency_ms: int = Field(..., ge=0)
