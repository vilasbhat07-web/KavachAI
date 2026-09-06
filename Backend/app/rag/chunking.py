"""Token-aware chunking that preserves page and source metadata for evidence."""

from typing import List, Optional

import tiktoken

from app.config import Settings, get_settings
from app.schemas.chunk import Chunk
from app.schemas.parsed import Page, ParsedDocument


def _encoding(settings: Settings) -> tiktoken.Encoding:
    return tiktoken.get_encoding(settings.tiktoken_encoding)


def chunk_text(
    text: str,
    *,
    document_id: str,
    filename: Optional[str],
    source_type: Optional[str],
    page: Optional[int],
    start_index: int,
    settings: Settings,
) -> List[Chunk]:
    """Split `text` into overlapping token windows. Empty text yields no chunks."""
    stripped = text.strip()
    if not stripped:
        return []

    enc = _encoding(settings)
    tokens = enc.encode(stripped)
    size = settings.chunk_size
    overlap = settings.chunk_overlap
    chunks: List[Chunk] = []
    start = 0
    index = start_index

    while start < len(tokens):
        end = min(start + size, len(tokens))
        window = tokens[start:end]
        piece = enc.decode(window).strip()
        if piece:
            chunk_id = f"{document_id}:{index}"
            chunks.append(
                Chunk(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    text=piece,
                    token_count=len(window),
                    page=page,
                    filename=filename,
                    source_type=source_type,
                    chunk_index=index,
                )
            )
            index += 1
        if end >= len(tokens):
            break
        next_start = end - overlap
        if next_start <= start:
            next_start = start + 1
        start = next_start

    return chunks


def chunk_parsed_document(
    parsed: ParsedDocument,
    *,
    document_id: str,
    settings: Optional[Settings] = None,
) -> List[Chunk]:
    """Chunk each page independently so `page` on a chunk is the true source page."""
    cfg = settings or get_settings()
    filename = parsed.metadata.filename
    source_type = parsed.metadata.source_type
    all_chunks: List[Chunk] = []
    pages: List[Page] = parsed.pages or [Page(page_number=1, text=parsed.text)]

    for page in pages:
        page_chunks = chunk_text(
            page.text,
            document_id=document_id,
            filename=filename,
            source_type=source_type,
            page=page.page_number,
            start_index=len(all_chunks),
            settings=cfg,
        )
        all_chunks.extend(page_chunks)

    if not all_chunks and parsed.text.strip():
        all_chunks = chunk_text(
            parsed.text,
            document_id=document_id,
            filename=filename,
            source_type=source_type,
            page=1,
            start_index=0,
            settings=cfg,
        )
    return all_chunks
