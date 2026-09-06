"""CSV parser: tabular text plus column metadata. Never stores raw file bytes."""

import csv
from pathlib import Path

from app.exceptions import ParseFailedError
from app.schemas.parsed import Page, ParsedDocument, ParsedDocumentMetadata

_ENCODINGS = ("utf-8-sig", "utf-8", "cp1252")


def parse_csv(path: Path, *, filename: str) -> ParsedDocument:
    """Parse CSV into a single logical page of pipe-delimited rows.

    `extra` carries column names and row counts for downstream analysis tools.
    """
    raw = path.read_bytes()
    decoded: str | None = None
    last_error: UnicodeDecodeError | None = None
    for encoding in _ENCODINGS:
        try:
            decoded = raw.decode(encoding)
            break
        except UnicodeDecodeError as exc:
            last_error = exc

    if decoded is None:
        raise ParseFailedError(
            "Unable to decode CSV file.",
            detail={"filename": filename, "reason": str(last_error) if last_error else "undecodable"},
        )

    try:
        sample = decoded[:4096]
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
    except csv.Error:
        dialect = csv.excel

    try:
        reader = csv.reader(decoded.splitlines(), dialect)
        rows = list(reader)
    except csv.Error as exc:
        raise ParseFailedError(
            "Unable to parse CSV.",
            detail={"filename": filename, "reason": str(exc)},
        ) from exc

    if not rows:
        body = ""
        columns: list[str] = []
        data_row_count = 0
    else:
        columns = [str(cell).strip() for cell in rows[0]]
        data_rows = rows[1:] if len(rows) > 1 else []
        data_row_count = len(data_rows)
        lines = [" | ".join(columns)]
        for row in data_rows:
            lines.append(" | ".join(str(cell).strip() for cell in row))
        body = "\n".join(lines)

    return ParsedDocument(
        text=body,
        metadata=ParsedDocumentMetadata(
            filename=filename,
            page_count=1,
            source_type="csv",
        ),
        pages=[Page(page_number=1, text=body)],
        extra={
            "columns": columns,
            "row_count": data_row_count,
        },
    )
