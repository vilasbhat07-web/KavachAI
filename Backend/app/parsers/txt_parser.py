"""Plain-text parser."""

from pathlib import Path

from app.exceptions import ParseFailedError
from app.schemas.parsed import Page, ParsedDocument, ParsedDocumentMetadata

_ENCODINGS = ("utf-8-sig", "utf-8", "cp1252")


def parse_txt(path: Path, *, filename: str) -> ParsedDocument:
    """Parse a `.txt` file. Tries UTF-8 (with BOM) then Windows-1252."""
    raw = path.read_bytes()
    text: str | None = None
    last_error: UnicodeDecodeError | None = None
    for encoding in _ENCODINGS:
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError as exc:
            last_error = exc

    if text is None:
        raise ParseFailedError(
            "Unable to decode text file.",
            detail={"filename": filename, "reason": str(last_error) if last_error else "undecodable"},
        )

    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    return ParsedDocument(
        text=normalized,
        metadata=ParsedDocumentMetadata(
            filename=filename,
            page_count=1,
            source_type="txt",
        ),
        pages=[Page(page_number=1, text=normalized)],
    )
