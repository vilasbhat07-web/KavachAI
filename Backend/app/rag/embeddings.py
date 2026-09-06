"""Local Ollama embedding client: batched requests, retries, no cloud APIs."""

import asyncio
from typing import List, Optional, Sequence

import httpx

from app.config import Settings, get_settings
from app.exceptions import UpstreamUnavailableError


class EmbeddingClient:
    """Calls a local Ollama embedding model over HTTP."""

    def __init__(self, settings: Optional[Settings] = None, client: Optional[httpx.AsyncClient] = None) -> None:
        self._settings = settings or get_settings()
        self._client = client
        self._owns_client = client is None

    async def _http(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=self._settings.ollama_timeout_seconds)
        return self._client

    async def aclose(self) -> None:
        """Close the owned HTTP client."""
        if self._owns_client and self._client is not None:
            await self._client.aclose()
            self._client = None

    async def embed_texts(self, texts: Sequence[str]) -> List[List[float]]:
        """Embed texts in batches. Empty input returns an empty list."""
        if not texts:
            return []
        vectors: List[List[float]] = []
        batch_size = self._settings.embedding_batch_size
        for offset in range(0, len(texts), batch_size):
            batch = list(texts[offset : offset + batch_size])
            vectors.extend(await self._embed_batch(batch))
        expected = self._settings.qdrant_vector_size
        for index, vector in enumerate(vectors):
            if len(vector) != expected:
                raise UpstreamUnavailableError(
                    "Embedding dimension does not match QDRANT_VECTOR_SIZE.",
                    detail={"index": index, "got": len(vector), "expected": expected},
                )
        return vectors

    async def embed_query(self, text: str) -> List[float]:
        """Embed a single query string."""
        result = await self.embed_texts([text])
        return result[0]

    async def _embed_batch(self, batch: List[str]) -> List[List[float]]:
        settings = self._settings
        last_error: Exception | None = None
        attempts = settings.ollama_max_retries + 1
        for attempt in range(attempts):
            try:
                return await self._call_ollama(batch)
            except (httpx.TransportError, httpx.HTTPStatusError, UpstreamUnavailableError) as exc:
                last_error = exc
                if attempt >= attempts - 1:
                    break
                await asyncio.sleep(settings.ollama_retry_backoff_seconds * (attempt + 1))
        raise UpstreamUnavailableError(
            "Local embedding service is unavailable.",
            detail={"reason": str(last_error) if last_error else "unknown"},
        ) from last_error

    async def _call_ollama(self, batch: List[str]) -> List[List[float]]:
        http = await self._http()
        base = self._settings.ollama_base_url.rstrip("/")
        model = self._settings.ollama_embed_model
        payload = {"model": model, "input": batch}
        response = await http.post(f"{base}/api/embed", json=payload)
        if response.status_code == 404:
            # Older Ollama: one vector per request on /api/embeddings
            vectors: List[List[float]] = []
            for item in batch:
                legacy = await http.post(
                    f"{base}/api/embeddings",
                    json={"model": model, "prompt": item},
                )
                legacy.raise_for_status()
                body = legacy.json()
                embedding = body.get("embedding")
                if not isinstance(embedding, list):
                    raise UpstreamUnavailableError(
                        "Ollama embeddings response missing embedding.",
                        detail={"keys": list(body.keys())},
                    )
                vectors.append(embedding)
            return vectors
        response.raise_for_status()
        body = response.json()
        embeddings = body.get("embeddings")
        if isinstance(embeddings, list) and embeddings and isinstance(embeddings[0], list):
            return embeddings
        raise UpstreamUnavailableError(
            "Ollama embed response missing embeddings.",
            detail={"keys": list(body.keys())},
        )
