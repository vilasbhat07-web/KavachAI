"""Normalized parser output. All parsers must emit this shape."""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class Page(BaseModel):
    """Single page (or logical page) of extracted text."""

    page_number: int = Field(..., ge=1)
    text: str = Field(default="")


class ParsedDocumentMetadata(BaseModel):
    """Source metadata preserved through chunking and retrieval."""

    filename: str
    page_count: int = Field(..., ge=0)
    source_type: Literal["pdf", "docx", "txt", "csv"]


class ParsedDocument(BaseModel):
    """Canonical parse result: full text, pages, and source metadata."""

    text: str
    metadata: ParsedDocumentMetadata
    pages: List[Page] = Field(default_factory=list)
    extra: Optional[dict] = Field(
        default=None,
        description="Parser-specific extras (e.g. CSV column names). Never file bytes.",
    )
