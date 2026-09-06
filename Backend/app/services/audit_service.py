"""Persistent audit logging. Never stores raw file bytes."""

from typing import Any, Optional

from sqlalchemy.orm import Session

from app.middleware.correlation import get_correlation_id
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditLogRead
from app.utils.logging import get_logger, log_event

logger = get_logger(__name__)


def record(
    db: Session,
    *,
    action_type: str,
    status: str,
    latency_ms: int,
    user_id: Optional[str] = None,
    input_payload: Optional[dict[str, Any]] = None,
    output_payload: Optional[dict[str, Any]] = None,
) -> AuditLog:
    """Insert an audit row and emit a JSON log line.

    Callers must pass references/hashes in payloads (document_id, sha256, snippet
    lengths) — never file contents or images.
    """
    row = AuditLog(
        user_id=user_id,
        correlation_id=get_correlation_id(),
        action_type=action_type,
        input_payload=input_payload,
        output_payload=output_payload,
        latency_ms=max(0, int(latency_ms)),
        status=status,
    )
    db.add(row)
    db.flush()
    log_event(
        logger,
        "audit",
        action_type=action_type,
        status=status,
        user_id=user_id,
        latency_ms=latency_ms,
        audit_id=row.id,
    )
    return row


def to_read(row: AuditLog) -> AuditLogRead:
    """Map an ORM row to the public schema."""
    return AuditLogRead(
        id=row.id,
        timestamp=row.timestamp,
        user_id=row.user_id,
        correlation_id=row.correlation_id,
        action_type=row.action_type,
        input_payload=row.input_payload,
        output_payload=row.output_payload,
        latency_ms=row.latency_ms,
        status=row.status,
    )
