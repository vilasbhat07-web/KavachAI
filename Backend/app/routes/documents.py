"""Document upload, list, and delete. Routes stay thin."""

import time
from typing import Annotated

from fastapi import APIRouter, Depends, File, Query, UploadFile

from app.dependencies import CurrentUser, DbSession, EmbeddingsDep, SettingsDep, VectorStoreDep
from app.exceptions import KavachError
from app.schemas.document import DocumentDeleteResponse, DocumentListResponse, DocumentUploadResponse
from app.services import audit_service, document_service

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    db: DbSession,
    settings: SettingsDep,
    embedder: EmbeddingsDep,
    store: VectorStoreDep,
    user_id: CurrentUser,
    file: Annotated[UploadFile, File()],
) -> DocumentUploadResponse:
    """Stream a PDF/TXT/DOCX/CSV to disk, ingest, and return document_id."""
    started = time.perf_counter()
    filename = file.filename
    content_type = file.content_type
    try:
        result = await document_service.ingest_upload(
            db, file, settings=settings, embedder=embedder, store=store, user_id=user_id
        )
        audit_service.record(
            db,
            action_type="document.upload",
            status="ok",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={"filename": filename, "content_type": content_type},
            output_payload={"document_id": result.document_id, "status": result.status},
        )
        return result
    except KavachError as exc:
        audit_service.record(
            db,
            action_type="document.upload",
            status="error",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={"filename": filename, "content_type": content_type},
            output_payload={"error_code": exc.error_code},
        )
        raise


@router.get("", response_model=DocumentListResponse)
def list_documents(
    db: DbSession,
    user_id: CurrentUser,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> DocumentListResponse:
    """List document metadata (no file bytes)."""
    started = time.perf_counter()
    result = document_service.list_documents(db, limit=limit, offset=offset)
    audit_service.record(
        db,
        action_type="document.list",
        status="ok",
        latency_ms=int((time.perf_counter() - started) * 1000),
        user_id=user_id,
        input_payload={"limit": limit, "offset": offset},
        output_payload={"total": result.pagination.total},
    )
    return result


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
def delete_document(
    document_id: str,
    db: DbSession,
    store: VectorStoreDep,
    user_id: CurrentUser,
) -> DocumentDeleteResponse:
    """Delete metadata, file, and vectors."""
    started = time.perf_counter()
    try:
        result = document_service.delete_document(db, document_id, store=store)
        audit_service.record(
            db,
            action_type="document.delete",
            status="ok",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={"document_id": document_id},
            output_payload={"deleted": True},
        )
        return result
    except KavachError as exc:
        audit_service.record(
            db,
            action_type="document.delete",
            status="error",
            latency_ms=int((time.perf_counter() - started) * 1000),
            user_id=user_id,
            input_payload={"document_id": document_id},
            output_payload={"error_code": exc.error_code},
        )
        raise
