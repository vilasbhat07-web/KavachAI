"""Local Ollama chat/completion client with optional streaming."""

import json
from collections.abc import AsyncIterator
from typing import Any, Optional, Sequence

import httpx

from app.config import Settings, get_settings
from app.exceptions import UpstreamUnavailableError

ChatMessage = dict[str, Any]


class LLMClient:
    """Chat completions against a local Ollama model. No cloud providers."""

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

    @property
    def model_name(self) -> str:
        """Configured local chat model."""
        return self._settings.ollama_llm_model

    async def chat(self, messages: Sequence[ChatMessage], *, temperature: Optional[float] = None) -> str:
        """Return a full assistant message from local Ollama."""
        http = await self._http()
        base = self._settings.ollama_base_url.rstrip("/")
        payload = {
            "model": self._settings.ollama_llm_model,
            "messages": list(messages),
            "stream": False,
            "options": {
                "temperature": self._settings.llm_temperature if temperature is None else temperature,
            },
        }
        try:
            response = await http.post(f"{base}/api/chat", json=payload)
            response.raise_for_status()
        except (httpx.TransportError, httpx.HTTPStatusError) as exc:
            raise UpstreamUnavailableError(
                "Local LLM is unavailable.",
                detail={"reason": str(exc)},
            ) from exc
        body = response.json()
        message = body.get("message") or {}
        content = message.get("content")
        if not isinstance(content, str):
            raise UpstreamUnavailableError(
                "Ollama chat response missing message content.",
                detail={"keys": list(body.keys())},
            )
        return content

    async def chat_stream(
        self,
        messages: Sequence[ChatMessage],
        *,
        temperature: Optional[float] = None,
    ) -> AsyncIterator[str]:
        """Yield content deltas from a streaming Ollama chat response."""
        http = await self._http()
        base = self._settings.ollama_base_url.rstrip("/")
        payload = {
            "model": self._settings.ollama_llm_model,
            "messages": list(messages),
            "stream": True,
            "options": {
                "temperature": self._settings.llm_temperature if temperature is None else temperature,
            },
        }
        try:
            async with http.stream("POST", f"{base}/api/chat", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    data = json.loads(line)
                    content = (data.get("message") or {}).get("content") or ""
                    if content:
                        yield content
                    if data.get("done"):
                        break
        except (httpx.TransportError, httpx.HTTPStatusError, json.JSONDecodeError) as exc:
            raise UpstreamUnavailableError(
                "Local LLM streaming failed.",
                detail={"reason": str(exc)},
            ) from exc

    async def generate_vision(self, prompt: str, image_b64: str) -> str:
        """Call a local vision model (e.g. llava) with a base64 image. No cloud APIs."""
        if not self._settings.vision_enabled:
            raise UpstreamUnavailableError("No local vision model is configured.")
        http = await self._http()
        base = self._settings.ollama_base_url.rstrip("/")
        payload = {
            "model": self._settings.ollama_vision_model,
            "prompt": prompt,
            "images": [image_b64],
            "stream": False,
        }
        try:
            response = await http.post(f"{base}/api/generate", json=payload)
            response.raise_for_status()
        except (httpx.TransportError, httpx.HTTPStatusError) as exc:
            raise UpstreamUnavailableError(
                "Local vision model is unavailable.",
                detail={"reason": str(exc)},
            ) from exc
        body = response.json()
        text = body.get("response")
        if not isinstance(text, str):
            raise UpstreamUnavailableError(
                "Ollama generate response missing text.",
                detail={"keys": list(body.keys())},
            )
        return text
