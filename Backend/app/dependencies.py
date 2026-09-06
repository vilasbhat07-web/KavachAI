"""FastAPI dependencies: settings, DB, user identity."""

from typing import Annotated, Optional

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.middleware.correlation import get_correlation_id
from app.rag.embeddings import EmbeddingClient
from app.rag.llm_client import LLMClient
from app.rag.vector_store import VectorStore, get_vector_store


def current_user_id(
    x_user_id: Annotated[Optional[str], Header()] = None,
    settings: Settings = Depends(get_settings),
) -> str:
    """On-prem identity from X-User-ID, else DEFAULT_USER_ID."""
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()[:128]
    return settings.default_user_id


def embeddings_client(settings: Settings = Depends(get_settings)) -> EmbeddingClient:
    """Local Ollama embedding client."""
    return EmbeddingClient(settings)


def llm_client(settings: Settings = Depends(get_settings)) -> LLMClient:
    """Local Ollama chat client."""
    return LLMClient(settings)


def vector_store(settings: Settings = Depends(get_settings)) -> VectorStore:
    """Configured vector store (Qdrant or memory)."""
    return get_vector_store(settings)


DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[str, Depends(current_user_id)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
EmbeddingsDep = Annotated[EmbeddingClient, Depends(embeddings_client)]
LLMDep = Annotated[LLMClient, Depends(llm_client)]
VectorStoreDep = Annotated[VectorStore, Depends(vector_store)]
