"""RAG query request/response with mandatory evidence trail."""

from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.common import EvidenceItem


class QueryRequest(BaseModel):
    """Semantic query against ingested documents."""

    query: str = Field(..., min_length=1, max_length=16_384)
    document_id: Optional[str] = Field(default=None, description="Optional filter to a single document.")
    created_after: Optional[str] = Field(
        default=None,
        description="ISO-8601 timestamp; only chunks ingested after this instant.",
    )
    top_k: Optional[int] = Field(default=None, ge=1, le=50)


class QueryResponse(BaseModel):
    """Grounded answer plus citations."""

    answer: str
    evidence: List[EvidenceItem] = Field(default_factory=list)
    model: str
    latency_ms: int = Field(..., ge=0)
