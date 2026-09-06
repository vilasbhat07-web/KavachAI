"""Parser dispatcher: MIME + extension → parser. Unsupported types raise 415."""

from pathlib import Path
from typing import Optional

from app.config import Settings, get_settings
from app.exceptions import ParseFailedError, UnsupportedMediaTypeError
from app.parsers.csv_parser import parse_csv
from app.parsers.docx_parser import parse_docx
from app.parsers.pdf_parser import parse_pdf
from app.parsers.txt_parser import parse_txt
from app.schemas.parsed import ParsedDocument

SourceType = str

_MIME_TO_SOURCE: dict[str, SourceType] = {
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/csv": "csv",
    "application/csv": "csv",
}

_EXT_TO_SOURCE: dict[str, SourceType] = {
    ".pdf": "pdf",
    ".txt": "txt",
    ".docx": "docx",
    ".csv": "csv",
}

_PARSERS = {
    "pdf": parse_pdf,
    "txt": parse_txt,
    "docx": parse_docx,
    "csv": parse_csv,
}


def resolve_source_type(
    *,
    filename: str,
    content_type: Optional[str],
    settings: Optional[Settings] = None,
) -> SourceType:
    """Map MIME type (preferred) and file extension to a parser key.

    Raises:
        UnsupportedMediaTypeError: MIME not allowlisted, or neither MIME nor extension is known.
    """
    cfg = settings or get_settings()
    mime = (content_type or "").split(";")[0].strip().lower()
    suffix = Path(filename).suffix.lower()

    if mime and mime not in {"application/octet-stream", "binary/octet-stream"}:
        if mime not in cfg.allowed_mime_type_set:
            raise UnsupportedMediaTypeError(
                "Unsupported media type.",
                detail={"content_type": content_type, "filename": filename},
            )
        source = _MIME_TO_SOURCE.get(mime)
        if source is None:
            raise UnsupportedMediaTypeError(
                "Unsupported media type.",
                detail={"content_type": content_type, "filename": filename},
            )
        return source

    source = _EXT_TO_SOURCE.get(suffix)
    if source is None:
        raise UnsupportedMediaTypeError(
            "Unsupported media type.",
            detail={"content_type": content_type, "filename": filename},
        )
    implied_mimes = [m for m, src in _MIME_TO_SOURCE.items() if src == source]
    if not any(m in cfg.allowed_mime_type_set for m in implied_mimes):
        raise UnsupportedMediaTypeError(
            "Unsupported media type.",
            detail={"content_type": content_type, "filename": filename},
        )
    return source


def parse_document(
    path: Path,
    *,
    filename: str,
    content_type: Optional[str] = None,
    settings: Optional[Settings] = None,
) -> ParsedDocument:
    """Parse a file on disk into `ParsedDocument`.

    `path` is a filesystem reference already streamed to disk by the upload layer.
    This function never logs or returns raw bytes.
    """
    if not path.is_file():
        raise ParseFailedError(
            "File not found for parsing.",
            detail={"filename": filename},
        )

    source = resolve_source_type(filename=filename, content_type=content_type, settings=settings)
    return _PARSERS[source](path, filename=filename)
