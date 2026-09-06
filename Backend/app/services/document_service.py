"""Upload orchestration: stream to disk, parse, ingest, persist metadata."""

import csv
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import Settings
from app.exceptions import NotFoundError, PayloadTooLargeError, ToolRejectedError
from app.models.document import Document
from app.parsers import parse_document, resolve_source_type
from app.rag.embeddings import EmbeddingClient
from app.rag.vector_store import VectorStore
from app.schemas.common import Pagination
from app.schemas.document import (
    DocumentDeleteResponse,
    DocumentListResponse,
    DocumentRead,
    DocumentUploadResponse,
)
from app.services import ingestion_service
from app.utils.hashing import sha256_file
from app.utils.logging import get_logger
from app.utils.security import safe_filename

logger = get_logger(__name__)

_STREAM_CHUNK = 64 * 1024


@dataclass(frozen=True)
class TabularDocumentData:
    """Safe, normalized CSV data made available to the analysis sandbox."""

    document_id: str
    filename: str
    columns: list[str]
    rows: list[dict[str, str]]


def _to_read(row: Document) -> DocumentRead:
    return DocumentRead(
        document_id=row.id,
        filename=row.filename,
        content_type=row.content_type,
        size_bytes=row.size_bytes,
        sha256=row.sha256,
        status=row.status,
        page_count=row.page_count,
        created_at=row.created_at,
    )


async def stream_upload_to_disk(
    upload: UploadFile,
    *,
    settings: Settings,
) -> tuple[str, Path, str, str, int, str]:
    """Stream to disk. Returns document_id, path, filename, mime, size, sha256."""
    filename = safe_filename(upload.filename or "upload")
    content_type = (upload.content_type or "").split(";")[0].strip().lower()
    resolve_source_type(filename=filename, content_type=content_type or None, settings=settings)

    document_id = str(uuid.uuid4())
    suffix = Path(filename).suffix.lower()
    dest_dir = Path(settings.upload_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{document_id}{suffix}"

    size = 0
    try:
        with dest.open("wb") as handle:
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
    except Exception:
        dest.unlink(missing_ok=True)
        raise

    return document_id, dest, filename, content_type or "application/octet-stream", size, sha256_file(dest)


async def ingest_upload(
    db: Session,
    upload: UploadFile,
    *,
    settings: Settings,
    embedder: EmbeddingClient,
    store: VectorStore,
    user_id: Optional[str] = None,
) -> DocumentUploadResponse:
    """Accept an upload, persist metadata, parse, chunk, embed, and index."""
    document_id, dest, filename, mime, size, digest = await stream_upload_to_disk(upload, settings=settings)
    row = Document(
        id=document_id,
        filename=filename,
        content_type=mime,
        size_bytes=size,
        sha256=digest,
        status="processing",
        storage_path=str(dest),
    )
    db.add(row)
    db.flush()

    try:
        parsed = parse_document(dest, filename=filename, content_type=mime, settings=settings)
        await ingestion_service.ingest_parsed_document(
            parsed,
            document_id=document_id,
            embedder=embedder,
            store=store,
            settings=settings,
            db=db,
            user_id=user_id,
        )
        row.page_count = parsed.metadata.page_count
        row.status = "ready"
        row.error_message = None
    except Exception as exc:
        row.status = "failed"
        row.error_message = type(exc).__name__
        logger.exception("document_ingest_failed")
        db.flush()
        raise

    db.flush()
    return DocumentUploadResponse(document_id=row.id, filename=row.filename, status=row.status)


def list_documents(db: Session, *, limit: int, offset: int) -> DocumentListResponse:
    """Paginated document metadata."""
    total = db.scalar(select(func.count()).select_from(Document)) or 0
    rows = db.scalars(select(Document).order_by(Document.created_at.desc()).limit(limit).offset(offset)).all()
    return DocumentListResponse(
        items=[_to_read(row) for row in rows],
        pagination=Pagination(limit=limit, offset=offset, total=total),
    )


def get_document(db: Session, document_id: str) -> Document:
    """Load a document row or 404."""
    row = db.get(Document, document_id)
    if row is None:
        raise NotFoundError("Document not found.", detail={"document_id": document_id})
    return row


def load_tabular_document(db: Session, document_id: str) -> TabularDocumentData:
    """Load a ready CSV document into JSON-compatible rows for controlled analysis."""
    row = get_document(db, document_id)
    if row.status != "ready":
        raise ToolRejectedError(
            "Document is not ready for analysis.",
            detail={"document_id": document_id, "status": row.status},
        )
    if row.content_type not in {"text/csv", "application/csv"} and Path(row.filename).suffix.lower() != ".csv":
        raise ToolRejectedError(
            "Document is not tabular CSV data.",
            detail={"document_id": document_id, "content_type": row.content_type},
        )

    path = Path(row.storage_path)
    if not path.is_file():
        raise ToolRejectedError(
            "Document source file is unavailable for analysis.",
            detail={"document_id": document_id},
        )
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            columns = list(reader.fieldnames or [])
            if not columns:
                raise ToolRejectedError(
                    "CSV document has no header row.",
                    detail={"document_id": document_id},
                )
            rows = [{column: value or "" for column, value in item.items()} for item in reader]
    except UnicodeDecodeError as exc:
        raise ToolRejectedError(
            "CSV document is not UTF-8 encoded.",
            detail={"document_id": document_id},
        ) from exc
    except csv.Error as exc:
        raise ToolRejectedError(
            "CSV document could not be read for analysis.",
            detail={"document_id": document_id},
        ) from exc
    return TabularDocumentData(
        document_id=row.id,
        filename=row.filename,
        columns=columns,
        rows=rows,
    )


def delete_document(db: Session, document_id: str, *, store: VectorStore) -> DocumentDeleteResponse:
    """Remove metadata, on-disk file, and vector points."""
    row = get_document(db, document_id)
    store.delete_by_document(document_id)
    path = Path(row.storage_path)
    path.unlink(missing_ok=True)
    db.delete(row)
    db.flush()
    return DocumentDeleteResponse(document_id=document_id, deleted=True)
