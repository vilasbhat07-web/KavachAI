"""Chunk records used between chunking, embedding, and vector storage."""

from typing import Optional

from pydantic import BaseModel, Field


class Chunk(BaseModel):
    """A token-bounded text span with enough metadata for evidence tracking."""

    chunk_id: str
    document_id: str
    text: str
    token_count: int = Field(..., ge=0)
    page: Optional[int] = Field(default=None, ge=1)
    filename: Optional[str] = None
    source_type: Optional[str] = None
    chunk_index: int = Field(..., ge=0)
