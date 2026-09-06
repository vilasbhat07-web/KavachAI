"""Parse → chunk → embed → upsert. Isolated from HTTP."""

from datetime import datetime, timezone
import time
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.config import Settings
from app.rag.chunking import chunk_parsed_document
from app.rag.embeddings import EmbeddingClient
from app.rag.vector_store import VectorStore
from app.schemas.chunk import Chunk
from app.schemas.parsed import ParsedDocument
from app.services import audit_service


async def ingest_parsed_document(
    parsed: ParsedDocument,
    *,
    document_id: str,
    embedder: EmbeddingClient,
    store: VectorStore,
    settings: Settings,
    db: Session,
    user_id: Optional[str] = None,
) -> Sequence[Chunk]:
    """Chunk, embed, index, and persist an audit record for one document ingestion."""
    started = time.perf_counter()
    audit_input = {
        "document_id": document_id,
        "filename": parsed.metadata.filename,
        "source_type": parsed.metadata.source_type,
        "page_count": parsed.metadata.page_count,
    }
    try:
        chunks = chunk_parsed_document(parsed, document_id=document_id, settings=settings)
        if chunks:
            vectors = await embedder.embed_texts([chunk.text for chunk in chunks])
            store.upsert_chunks(
                chunks,
                vectors,
                created_at=datetime.now(timezone.utc).isoformat(),
            )
        audit_service.record(
            db,
            action_type="document.ingest",
            status="ok",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload=audit_input,
            output_payload={"chunk_count": len(chunks)},
        )
        return chunks
    except Exception as exc:
        audit_service.record(
            db,
            action_type="document.ingest",
            status="error",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload=audit_input,
            output_payload={"error_type": type(exc).__name__},
        )
        raise
