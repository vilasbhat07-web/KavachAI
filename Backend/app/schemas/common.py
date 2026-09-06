"""Shared API schemas: errors, evidence trail, pagination."""

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Consistent error body for all HTTP failures."""

    error_code: str = Field(..., description="Stable machine-readable code, e.g. UNSUPPORTED_MEDIA_TYPE.")
    message: str = Field(..., description="Human-readable summary.")
    detail: Optional[Any] = Field(default=None, description="Safe extra context; never raw file bytes.")


class EvidenceItem(BaseModel):
    """Traceable citation attached to every AI or tool-produced answer."""

    source_type: Literal["document", "tool", "image"] = Field(
        ...,
        description="Origin of this evidence item.",
    )
    document_id: Optional[str] = Field(default=None)
    chunk_id: Optional[str] = Field(default=None)
    page: Optional[int] = Field(default=None, ge=1)
    snippet: Optional[str] = Field(default=None, description="Short quoted text, not the full chunk.")
    tool_name: Optional[str] = Field(default=None)
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    filename: Optional[str] = Field(default=None)


class Pagination(BaseModel):
    """Offset pagination metadata."""

    limit: int = Field(..., ge=1)
    offset: int = Field(..., ge=0)
    total: int = Field(..., ge=0)
