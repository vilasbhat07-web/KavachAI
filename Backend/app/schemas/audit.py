"""Audit log read models. Payloads are references/hashes, never raw file bytes."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class AuditLogRead(BaseModel):
    """Persisted audit row as returned to operators (not an ingest API)."""

    id: str
    timestamp: datetime
    user_id: Optional[str] = None
    correlation_id: Optional[str] = None
    action_type: str
    input_payload: Optional[dict[str, Any]] = None
    output_payload: Optional[dict[str, Any]] = None
    latency_ms: int = Field(..., ge=0)
    status: str
