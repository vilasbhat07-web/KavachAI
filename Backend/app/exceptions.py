"""Domain errors mapped to the API error schema. Services raise these, not HTTPExceptions."""

from typing import Any, Optional


class KavachError(Exception):
    """Base error with a stable error_code and intended HTTP status."""

    def __init__(
        self,
        message: str,
        *,
        error_code: str,
        http_status: int = 400,
        detail: Optional[Any] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.http_status = http_status
        self.detail = detail


class UnsupportedMediaTypeError(KavachError):
    """Raised when MIME type or extension is not in the allowlist (HTTP 415)."""

    def __init__(self, message: str, *, detail: Optional[Any] = None) -> None:
        super().__init__(
            message,
            error_code="UNSUPPORTED_MEDIA_TYPE",
            http_status=415,
            detail=detail,
        )


class ParseFailedError(KavachError):
    """Raised when a supported file cannot be parsed (HTTP 422)."""

    def __init__(self, message: str, *, detail: Optional[Any] = None) -> None:
        super().__init__(
            message,
            error_code="PARSE_FAILED",
            http_status=422,
            detail=detail,
        )


class PayloadTooLargeError(KavachError):
    """Raised when an upload exceeds MAX_UPLOAD_BYTES (HTTP 413)."""

    def __init__(self, message: str, *, detail: Optional[Any] = None) -> None:
        super().__init__(
            message,
            error_code="PAYLOAD_TOO_LARGE",
            http_status=413,
            detail=detail,
        )


class NotFoundError(KavachError):
    """Raised when a document or resource does not exist (HTTP 404)."""

    def __init__(self, message: str, *, detail: Optional[Any] = None) -> None:
        super().__init__(
            message,
            error_code="NOT_FOUND",
            http_status=404,
            detail=detail,
        )


class UpstreamUnavailableError(KavachError):
    """Raised when local Ollama or Qdrant cannot be reached (HTTP 503)."""

    def __init__(self, message: str, *, detail: Optional[Any] = None) -> None:
        super().__init__(
            message,
            error_code="UPSTREAM_UNAVAILABLE",
            http_status=503,
            detail=detail,
        )


class ToolRejectedError(KavachError):
    """Raised when a tool refuses unsafe or invalid input (HTTP 400)."""

    def __init__(self, message: str, *, detail: Optional[Any] = None) -> None:
        super().__init__(
            message,
            error_code="TOOL_REJECTED",
            http_status=400,
            detail=detail,
        )


class ToolExecutionError(KavachError):
    """Raised when a sandboxed tool fails at runtime (HTTP 422)."""

    def __init__(self, message: str, *, detail: Optional[Any] = None) -> None:
        super().__init__(
            message,
            error_code="TOOL_EXECUTION_FAILED",
            http_status=422,
            detail=detail,
        )
