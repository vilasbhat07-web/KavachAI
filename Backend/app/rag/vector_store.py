"""Vector store: Qdrant wrapper plus an in-memory backend for tests."""

from __future__ import annotations

import math
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, List, Optional, Sequence

from app.config import Settings, get_settings
from app.exceptions import UpstreamUnavailableError
from app.schemas.chunk import Chunk

NAMESPACE = uuid.UUID("8b2a6a9e-4c1f-4d2a-9f3e-1a7c0b5d2e91")


class ScoredChunk:
    """Search hit with similarity score and evidence payload."""

    def __init__(self, chunk: Chunk, score: float, created_at: Optional[str] = None) -> None:
        self.chunk = chunk
        self.score = score
        self.created_at = created_at


class VectorStore(ABC):
    """Collection upsert/search/delete used by ingestion and retrieval."""

    @abstractmethod
    def ensure_collection(self) -> None:
        """Create the collection if it does not exist."""

    @abstractmethod
    def upsert_chunks(
        self,
        chunks: Sequence[Chunk],
        vectors: Sequence[Sequence[float]],
        *,
        created_at: Optional[str] = None,
    ) -> None:
        """Upsert chunk vectors with evidence payload (never file bytes)."""

    @abstractmethod
    def search(
        self,
        vector: Sequence[float],
        *,
        top_k: int,
        document_id: Optional[str] = None,
        created_after: Optional[str] = None,
    ) -> List[ScoredChunk]:
        """Similarity search with optional document and date filters."""

    @abstractmethod
    def delete_by_document(self, document_id: str) -> None:
        """Remove all points for a document."""


def _payload(chunk: Chunk, created_at: Optional[str]) -> dict[str, Any]:
    return {
        "document_id": chunk.document_id,
        "chunk_id": chunk.chunk_id,
        "page": chunk.page,
        "source": chunk.source_type,
        "filename": chunk.filename,
        "text": chunk.text,
        "chunk_index": chunk.chunk_index,
        "token_count": chunk.token_count,
        "created_at": created_at,
    }


def _chunk_from_payload(payload: dict[str, Any]) -> Chunk:
    return Chunk(
        chunk_id=str(payload["chunk_id"]),
        document_id=str(payload["document_id"]),
        text=str(payload.get("text") or ""),
        token_count=int(payload.get("token_count") or 0),
        page=payload.get("page"),
        filename=payload.get("filename"),
        source_type=payload.get("source"),
        chunk_index=int(payload.get("chunk_index") or 0),
    )


class InMemoryVectorStore(VectorStore):
    """Cosine search in process memory. For tests and VECTOR_STORE_BACKEND=memory."""

    def __init__(self) -> None:
        self._points: dict[str, tuple[list[float], dict[str, Any]]] = {}

    def ensure_collection(self) -> None:
        return None

    def upsert_chunks(
        self,
        chunks: Sequence[Chunk],
        vectors: Sequence[Sequence[float]],
        *,
        created_at: Optional[str] = None,
    ) -> None:
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors length mismatch")
        stamp = created_at or datetime.now(timezone.utc).isoformat()
        for chunk, vector in zip(chunks, vectors, strict=True):
            self._points[chunk.chunk_id] = (list(vector), _payload(chunk, stamp))

    def search(
        self,
        vector: Sequence[float],
        *,
        top_k: int,
        document_id: Optional[str] = None,
        created_after: Optional[str] = None,
    ) -> List[ScoredChunk]:
        scored: list[ScoredChunk] = []
        query = list(vector)
        for _chunk_id, (stored, payload) in self._points.items():
            if document_id and payload.get("document_id") != document_id:
                continue
            created = payload.get("created_at")
            if created_after and created and created < created_after:
                continue
            score = _cosine(query, stored)
            scored.append(ScoredChunk(_chunk_from_payload(payload), score, created))
        scored.sort(key=lambda item: item.score, reverse=True)
        return scored[:top_k]

    def delete_by_document(self, document_id: str) -> None:
        to_delete = [
            key for key, (_, payload) in self._points.items() if payload.get("document_id") == document_id
        ]
        for key in to_delete:
            del self._points[key]


def _cosine(left: Sequence[float], right: Sequence[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    dot = sum(a * b for a, b in zip(left, right, strict=True))
    n1 = math.sqrt(sum(a * a for a in left))
    n2 = math.sqrt(sum(b * b for b in right))
    if n1 == 0 or n2 == 0:
        return 0.0
    return dot / (n1 * n2)


class QdrantVectorStore(VectorStore):
    """qdrant-client wrapper. All AI vectors stay on local Qdrant."""

    def __init__(self, settings: Optional[Settings] = None, client: Any = None) -> None:
        self._settings = settings or get_settings()
        self._client = client

    def _qdrant(self) -> Any:
        if self._client is None:
            from qdrant_client import QdrantClient

            try:
                self._client = QdrantClient(
                    host=self._settings.qdrant_host,
                    port=self._settings.qdrant_port,
                )
            except Exception as exc:  # noqa: BLE001
                raise UpstreamUnavailableError(
                    "Unable to connect to local Qdrant.",
                    detail={"reason": type(exc).__name__},
                ) from exc
        return self._client

    def ensure_collection(self) -> None:
        from qdrant_client.models import Distance, VectorParams

        client = self._qdrant()
        name = self._settings.qdrant_collection
        try:
            existing = {c.name for c in client.get_collections().collections}
            if name in existing:
                return
            client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(
                    size=self._settings.qdrant_vector_size,
                    distance=Distance.COSINE,
                ),
            )
        except UpstreamUnavailableError:
            raise
        except Exception as exc:  # noqa: BLE001
            raise UpstreamUnavailableError(
                "Unable to ensure Qdrant collection.",
                detail={"reason": str(exc)},
            ) from exc

    def upsert_chunks(
        self,
        chunks: Sequence[Chunk],
        vectors: Sequence[Sequence[float]],
        *,
        created_at: Optional[str] = None,
    ) -> None:
        from qdrant_client.models import PointStruct

        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors length mismatch")
        stamp = created_at or datetime.now(timezone.utc).isoformat()
        points = [
            PointStruct(
                id=str(uuid.uuid5(NAMESPACE, chunk.chunk_id)),
                vector=list(vector),
                payload=_payload(chunk, stamp),
            )
            for chunk, vector in zip(chunks, vectors, strict=True)
        ]
        if not points:
            return
        try:
            self._qdrant().upsert(collection_name=self._settings.qdrant_collection, points=points)
        except Exception as exc:  # noqa: BLE001
            raise UpstreamUnavailableError(
                "Qdrant upsert failed.",
                detail={"reason": str(exc)},
            ) from exc

    def search(
        self,
        vector: Sequence[float],
        *,
        top_k: int,
        document_id: Optional[str] = None,
        created_after: Optional[str] = None,
    ) -> List[ScoredChunk]:
        from qdrant_client.models import FieldCondition, Filter, MatchValue

        must: list[Any] = []
        if document_id:
            must.append(FieldCondition(key="document_id", match=MatchValue(value=document_id)))
        query_filter = Filter(must=must) if must else None
        try:
            hits = self._qdrant().search(
                collection_name=self._settings.qdrant_collection,
                query_vector=list(vector),
                limit=top_k,
                query_filter=query_filter,
            )
        except Exception as exc:  # noqa: BLE001
            raise UpstreamUnavailableError(
                "Qdrant search failed.",
                detail={"reason": str(exc)},
            ) from exc

        results: list[ScoredChunk] = []
        for hit in hits:
            payload = hit.payload or {}
            created = payload.get("created_at")
            if created_after and created and created < created_after:
                continue
            results.append(ScoredChunk(_chunk_from_payload(payload), float(hit.score), created))
        return results[:top_k]

    def delete_by_document(self, document_id: str) -> None:
        from qdrant_client.models import FieldCondition, Filter, MatchValue

        try:
            self._qdrant().delete(
                collection_name=self._settings.qdrant_collection,
                points_selector=Filter(
                    must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
                ),
            )
        except Exception as exc:  # noqa: BLE001
            raise UpstreamUnavailableError(
                "Qdrant delete failed.",
                detail={"reason": str(exc)},
            ) from exc


_STORE: VectorStore | None = None


def get_vector_store(settings: Optional[Settings] = None) -> VectorStore:
    """Process-wide vector store. Use memory backend in tests via env or injection."""
    global _STORE
    cfg = settings or get_settings()
    if _STORE is None:
        backend = cfg.vector_store_backend.strip().lower()
        if backend == "memory":
            _STORE = InMemoryVectorStore()
        else:
            _STORE = QdrantVectorStore(cfg)
            _STORE.ensure_collection()
    return _STORE


def reset_vector_store() -> None:
    """Clear the singleton (tests)."""
    global _STORE
    _STORE = None
