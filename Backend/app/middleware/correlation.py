"""Correlation ID contextvar used by JSON logs and audit rows."""

from contextvars import ContextVar
from typing import Optional
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import get_settings

correlation_id_var: ContextVar[Optional[str]] = ContextVar("correlation_id", default=None)


def get_correlation_id() -> Optional[str]:
    """Return the current request correlation ID, if any."""
    return correlation_id_var.get()


def set_correlation_id(value: str) -> None:
    """Bind a correlation ID (tests and non-HTTP callers)."""
    correlation_id_var.set(value)


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Assign or propagate a correlation ID on every HTTP request."""

    async def dispatch(self, request: Request, call_next) -> Response:
        settings = get_settings()
        header = settings.correlation_id_header
        incoming = request.headers.get(header) or request.headers.get("x-correlation-id")
        cid = incoming.strip() if incoming else str(uuid4())
        token = correlation_id_var.set(cid)
        try:
            response = await call_next(request)
            response.headers[header] = cid
            return response
        finally:
            correlation_id_var.reset(token)
