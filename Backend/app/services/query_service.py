"""RAG answer assembly: retrieve → local LLM → EvidenceItem[]."""

import time
from typing import List

from app.config import Settings
from app.rag.embeddings import EmbeddingClient
from app.rag.llm_client import LLMClient
from app.rag.vector_store import ScoredChunk, VectorStore
from app.schemas.query import QueryRequest, QueryResponse
from app.services import retrieval_service

_SYSTEM = (
    "You are KAVACH, an on-premise industrial copilot. Answer only from the provided "
    "source excerpts. Cite chunk_id values in square brackets. If the sources are "
    "insufficient, say so. Do not invent documents, measurements, or procedures."
)


def _context_block(hits: List[ScoredChunk]) -> str:
    parts: list[str] = []
    for hit in hits:
        chunk = hit.chunk
        parts.append(
            f"[chunk_id={chunk.chunk_id} page={chunk.page} file={chunk.filename}]\n{chunk.text}"
        )
    return "\n\n".join(parts) if parts else "(no sources retrieved)"


async def answer_query(
    request: QueryRequest,
    *,
    embedder: EmbeddingClient,
    store: VectorStore,
    llm: LLMClient,
    settings: Settings,
) -> QueryResponse:
    """Retrieve evidence and generate a grounded answer from the local LLM."""
    started = time.perf_counter()
    hits = await retrieval_service.search(
        request.query,
        embedder=embedder,
        store=store,
        settings=settings,
        document_id=request.document_id,
        created_after=request.created_after,
        top_k=request.top_k,
    )
    messages = [
        {"role": "system", "content": _SYSTEM},
        {
            "role": "user",
            "content": f"Question:\n{request.query}\n\nSources:\n{_context_block(hits)}",
        },
    ]
    answer = await llm.chat(messages)
    latency_ms = int((time.perf_counter() - started) * 1000)
    return QueryResponse(
        answer=answer,
        evidence=retrieval_service.to_evidence(hits),
        model=llm.model_name,
        latency_ms=latency_ms,
    )
