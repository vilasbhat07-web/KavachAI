"""Image upload lifecycle: validate, persist as a document, analyze, and audit."""

import time
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import Settings
from app.exceptions import KavachError, PayloadTooLargeError, UnsupportedMediaTypeError
from app.models.document import Document
from app.rag.llm_client import LLMClient
from app.schemas.image import ImageAnalyzeResponse
from app.services import audit_service
from app.tools.image_analysis_tool import analyze_image
from app.utils.hashing import sha256_file
from app.utils.security import safe_filename

_STREAM_CHUNK = 64 * 1024


async def analyze_upload(
    db: Session,
    upload: UploadFile,
    *,
    settings: Settings,
    llm: LLMClient,
    user_id: str,
) -> ImageAnalyzeResponse:
    """Validate, store, hash, analyze, and audit an image as a durable document."""
    started = time.perf_counter()
    filename = safe_filename(upload.filename or "image")
    mime = (upload.content_type or "").split(";")[0].strip().lower()
    destination: Path | None = None
    document: Document | None = None
    size = 0

    try:
        if mime not in settings.image_allowed_mime_type_set:
            raise UnsupportedMediaTypeError(
                "Unsupported image type.",
                detail={"content_type": upload.content_type, "filename": filename},
            )

        destination_dir = Path(settings.upload_dir) / "images"
        destination_dir.mkdir(parents=True, exist_ok=True)
        destination = destination_dir / f"{uuid.uuid4()}{Path(filename).suffix.lower()}"
        with destination.open("wb") as handle:
            while True:
                block = await upload.read(_STREAM_CHUNK)
                if not block:
                    break
                size += len(block)
                if size > settings.max_upload_bytes:
                    raise PayloadTooLargeError(
                        "Upload exceeds configured size limit.",
                        detail={"max_bytes": settings.max_upload_bytes},
                    )
                handle.write(block)

        digest = sha256_file(destination)
        document = Document(
            id=str(uuid.uuid4()),
            filename=filename,
            content_type=mime,
            size_bytes=size,
            sha256=digest,
            status="processing",
            storage_path=str(destination),
        )
        db.add(document)
        db.flush()
        result = await analyze_image(
            destination,
            filename=filename,
            content_type=mime,
            document_id=document.id,
            settings=settings,
            llm=llm,
        )
        document.status = "ready"
        db.flush()
        audit_service.record(
            db,
            action_type="image.analyze",
            status="ok",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={
                "filename": filename,
                "content_type": mime,
                "sha256": digest,
                "size_bytes": size,
                "document_id": document.id,
            },
            output_payload={
                "document_id": document.id,
                "model": result.model,
                "used_vision_llm": result.used_vision_llm,
            },
        )
        return result
    except KavachError as exc:
        if document is not None:
            document.status = "failed"
            document.error_message = exc.error_code
            db.flush()
        audit_service.record(
            db,
            action_type="image.analyze",
            status="error",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={
                "filename": filename,
                "content_type": mime,
                "size_bytes": size,
                "document_id": document.id if document else None,
            },
            output_payload={"error_code": exc.error_code},
        )
        raise
    except Exception as exc:
        if document is not None:
            document.status = "failed"
            document.error_message = type(exc).__name__
            db.flush()
        audit_service.record(
            db,
            action_type="image.analyze",
            status="error",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={
                "filename": filename,
                "content_type": mime,
                "size_bytes": size,
                "document_id": document.id if document else None,
            },
            output_payload={"error_type": type(exc).__name__},
        )
        raise
