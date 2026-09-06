"""Health and readiness: API process, local Ollama, Qdrant, database."""

import httpx
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import get_db
from app.rag.vector_store import get_vector_store

router = APIRouter(tags=["health"])


@router.get("/health")
def health(settings: Settings = Depends(get_settings)) -> dict:
    """Liveness: process is up. Does not probe dependencies."""
    return {"status": "ok", "app": settings.app_name}


@router.get("/health/ready")
def ready(settings: Settings = Depends(get_settings), db: Session = Depends(get_db)) -> dict:
    """Readiness: local Ollama, vector store, and DB are reachable."""
    checks: dict[str, str] = {}

    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:  # noqa: BLE001
        checks["database"] = f"error:{type(exc).__name__}"

    try:
        with httpx.Client(timeout=3.0) as client:
            response = client.get(f"{settings.ollama_base_url.rstrip('/')}/api/tags")
            checks["ollama"] = "ok" if response.status_code < 500 else f"http:{response.status_code}"
    except Exception as exc:  # noqa: BLE001
        checks["ollama"] = f"error:{type(exc).__name__}"

    try:
        store = get_vector_store(settings)
        store.ensure_collection()
        checks["vector_store"] = "ok"
    except Exception as exc:  # noqa: BLE001
        checks["vector_store"] = f"error:{type(exc).__name__}"

    overall = "ok" if all(value == "ok" for value in checks.values()) else "degraded"
    return {"status": overall, "app": settings.app_name, "checks": checks}
