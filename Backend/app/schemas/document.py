"""Document upload, list, and delete API models."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.common import Pagination


class DocumentRead(BaseModel):
    """Stored document metadata (never includes file bytes)."""

    document_id: str
    filename: str
    content_type: str
    size_bytes: int = Field(..., ge=0)
    sha256: str
    status: str
    page_count: Optional[int] = None
    created_at: datetime


class DocumentUploadResponse(BaseModel):
    """Returned after a successful upload is accepted for ingestion."""

    document_id: str
    filename: str
    status: str


class DocumentListResponse(BaseModel):
    """Paginated document metadata list."""

    items: List[DocumentRead]
    pagination: Pagination


class DocumentDeleteResponse(BaseModel):
    """Confirmation of document (and vector) removal."""

    document_id: str
    deleted: bool = True
