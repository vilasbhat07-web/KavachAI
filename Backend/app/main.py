"""KAVACH FastAPI application factory."""

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app import __product_name__, __version__
from app.config import get_settings
from app.db import init_db
from app.exceptions import KavachError
from app.middleware.correlation import CorrelationIdMiddleware
from app.routes import agent, analysis, documents, health, image, query
from app.schemas.common import ErrorResponse
from app.utils.logging import get_logger, setup_logging

logger = get_logger(__name__)


def create_app() -> FastAPI:
    """Build the ASGI app with routers, middleware, and consistent errors."""
    settings = get_settings()
    setup_logging(settings.log_level)
    app = FastAPI(
        title=__product_name__,
        version=__version__,
        description="Private, on-premise industrial AI copilot. Local Ollama + Qdrant only.",
    )
    app.add_middleware(CorrelationIdMiddleware)

    @app.exception_handler(KavachError)
    async def kavach_error_handler(_request: Request, exc: KavachError) -> JSONResponse:
        body = ErrorResponse(error_code=exc.error_code, message=exc.message, detail=exc.detail)
        return JSONResponse(status_code=exc.http_status, content=body.model_dump())

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
        body = ErrorResponse(
            error_code="VALIDATION_ERROR",
            message="Request validation failed.",
            detail=exc.errors(),
        )
        return JSONResponse(status_code=422, content=body.model_dump())

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        """Normalize framework 404/405 and explicit HTTP errors to the public error schema."""
        if exc.status_code == 404:
            error_code = "NOT_FOUND"
            message = "Resource not found."
        elif exc.status_code == 405:
            error_code = "METHOD_NOT_ALLOWED"
            message = "HTTP method is not allowed for this resource."
        else:
            error_code = "HTTP_ERROR"
            message = "Request could not be completed."
        body = ErrorResponse(error_code=error_code, message=message, detail=exc.detail)
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @app.exception_handler(Exception)
    async def unhandled_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_error")
        body = ErrorResponse(
            error_code="INTERNAL_ERROR",
            message="An unexpected error occurred.",
            detail={"type": type(exc).__name__},
        )
        return JSONResponse(status_code=500, content=body.model_dump())

    app.include_router(health.router)
    app.include_router(documents.router)
    app.include_router(query.router)
    app.include_router(agent.router)
    app.include_router(analysis.router)
    app.include_router(image.router)

    @app.on_event("startup")
    def _startup() -> None:
        Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
        init_db()
        try:
            from app.rag.vector_store import get_vector_store

            get_vector_store(settings).ensure_collection()
        except Exception as exc:  # noqa: BLE001
            logger.warning("vector_store_init_deferred", extra={"extra_payload": {"reason": str(exc)}})

    return app


app = create_app()
