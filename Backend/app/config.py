"""Environment-driven application settings. No model names, ports, or URLs are hardcoded at call sites."""

from functools import lru_cache
from typing import FrozenSet

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded exclusively from environment variables / `.env`."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Application ---
    app_name: str = Field(default="KAVACH", description="Product name exposed in health/docs.")
    app_env: str = Field(default="development", description="development | staging | production")
    api_host: str = Field(default="127.0.0.1", description="Bind address for uvicorn.")
    api_port: int = Field(default=8000, ge=1, le=65535)
    log_level: str = Field(default="INFO")
    correlation_id_header: str = Field(default="X-Correlation-ID")

    # --- Persistence ---
    database_url: str = Field(
        default="sqlite:///./data/kavach.db",
        description="SQLAlchemy URL. SQLite for local; Postgres for production.",
    )

    # --- Uploads ---
    upload_dir: str = Field(default="./data/uploads")
    max_upload_bytes: int = Field(default=52_428_800, ge=1, description="Default 50 MiB.")
    allowed_mime_types: str = Field(
        default="application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,application/csv",
        description="Comma-separated MIME allowlist for document upload.",
    )
    image_allowed_mime_types: str = Field(
        default="image/jpeg,image/png,image/webp,image/jpg",
        description="Comma-separated MIME allowlist for image analysis.",
    )

    # --- Chunking ---
    chunk_size: int = Field(default=512, ge=32, description="Target tokens per chunk.")
    chunk_overlap: int = Field(default=64, ge=0, description="Token overlap between chunks.")
    tiktoken_encoding: str = Field(default="cl100k_base")

    # --- Ollama (local LLM + embeddings + optional vision) ---
    ollama_base_url: str = Field(default="http://127.0.0.1:11434")
    ollama_llm_model: str = Field(default="llama3.1")
    ollama_embed_model: str = Field(default="nomic-embed-text")
    ollama_vision_model: str = Field(
        default="",
        description="Empty disables vision LLM and uses local CV fallback when implemented.",
    )
    ollama_timeout_seconds: float = Field(default=120.0, gt=0)
    ollama_max_retries: int = Field(default=3, ge=0)
    ollama_retry_backoff_seconds: float = Field(default=1.0, ge=0)
    embedding_batch_size: int = Field(default=32, ge=1)
    llm_temperature: float = Field(default=0.1, ge=0.0, le=2.0)

    # --- Qdrant ---
    qdrant_host: str = Field(default="127.0.0.1")
    qdrant_port: int = Field(default=6333, ge=1, le=65535)
    qdrant_collection: str = Field(default="kavach_chunks")
    qdrant_vector_size: int = Field(
        default=768,
        ge=1,
        description="Must match the embedding model output dimension.",
    )
    vector_store_backend: str = Field(
        default="qdrant",
        description="qdrant (production) or memory (tests / no Qdrant).",
    )
    retrieval_top_k: int = Field(default=8, ge=1)
    default_user_id: str = Field(default="anonymous")

    # --- Agent / tools ---
    agent_max_steps: int = Field(default=6, ge=1, le=32)
    analysis_timeout_seconds: float = Field(default=10.0, gt=0)
    analysis_memory_mb: int = Field(default=256, ge=32)
    analysis_allowed_imports: str = Field(default="pandas,numpy,math,statistics,json,csv")

    @model_validator(mode="after")
    def overlap_must_be_less_than_size(self) -> "Settings":
        """Reject overlap that would produce zero-length strides."""
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError("CHUNK_OVERLAP must be strictly less than CHUNK_SIZE")
        return self

    @property
    def allowed_mime_type_set(self) -> FrozenSet[str]:
        """Parsed MIME allowlist."""
        return frozenset(part.strip() for part in self.allowed_mime_types.split(",") if part.strip())

    @property
    def image_allowed_mime_type_set(self) -> FrozenSet[str]:
        """Parsed image MIME allowlist."""
        return frozenset(
            part.strip() for part in self.image_allowed_mime_types.split(",") if part.strip()
        )

    @property
    def analysis_allowed_import_set(self) -> FrozenSet[str]:
        """Parsed import whitelist for the Python analysis sandbox."""
        return frozenset(part.strip() for part in self.analysis_allowed_imports.split(",") if part.strip())

    @property
    def vision_enabled(self) -> bool:
        """True when a local vision model name is configured."""
        return bool(self.ollama_vision_model.strip())


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a process-wide Settings singleton. Clear the cache in tests after env changes."""
    return Settings()
