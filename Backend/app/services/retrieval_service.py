"""Semantic retrieval with evidence-shaped results."""

from typing import List, Optional

from app.config import Settings
from app.rag.embeddings import EmbeddingClient
from app.rag.vector_store import ScoredChunk, VectorStore
from app.schemas.common import EvidenceItem


async def search(
    query: str,
    *,
    embedder: EmbeddingClient,
    store: VectorStore,
    settings: Settings,
    document_id: Optional[str] = None,
    created_after: Optional[str] = None,
    top_k: Optional[int] = None,
) -> List[ScoredChunk]:
    """Top-k similarity search with optional document and date filters."""
    vector = await embedder.embed_query(query)
    k = top_k or settings.retrieval_top_k
    return store.search(
        vector,
        top_k=k,
        document_id=document_id,
        created_after=created_after,
    )


def to_evidence(hits: List[ScoredChunk], snippet_chars: int = 280) -> List[EvidenceItem]:
    """Map scored chunks to the standardized evidence trail."""
    items: List[EvidenceItem] = []
    for hit in hits:
        chunk = hit.chunk
        text = chunk.text
        snippet = text if len(text) <= snippet_chars else text[: snippet_chars - 1] + "…"
        items.append(
            EvidenceItem(
                source_type="document",
                document_id=chunk.document_id,
                chunk_id=chunk.chunk_id,
                page=chunk.page,
                snippet=snippet,
                filename=chunk.filename,
                confidence=max(0.0, min(1.0, float(hit.score))),
            )
        )
    return items
