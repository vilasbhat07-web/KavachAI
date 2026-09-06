"""PDF parser: per-page text extraction via pypdf."""

from pathlib import Path

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.exceptions import ParseFailedError
from app.schemas.parsed import Page, ParsedDocument, ParsedDocumentMetadata


def parse_pdf(path: Path, *, filename: str) -> ParsedDocument:
    """Parse a PDF into a normalized `ParsedDocument`.

    Empty pages are kept so `page_number` stays aligned with the source file.
    Encrypted or corrupt PDFs raise `ParseFailedError` (not a 500).
    """
    try:
        reader = PdfReader(str(path))
        if reader.is_encrypted:
            raise ParseFailedError(
                "Encrypted PDFs are not supported.",
                detail={"filename": filename},
            )
        pages: list[Page] = []
        for index, pdf_page in enumerate(reader.pages, start=1):
            extracted = pdf_page.extract_text() or ""
            pages.append(Page(page_number=index, text=extracted.strip()))
    except ParseFailedError:
        raise
    except PdfReadError as exc:
        raise ParseFailedError(
            "Unable to read PDF.",
            detail={"filename": filename, "reason": str(exc)},
        ) from exc
    except Exception as exc:  # noqa: BLE001 — pypdf raises a wide set of errors
        raise ParseFailedError(
            "Unable to parse PDF.",
            detail={"filename": filename, "reason": type(exc).__name__},
        ) from exc

    text = "\n\n".join(page.text for page in pages if page.text)
    return ParsedDocument(
        text=text,
        metadata=ParsedDocumentMetadata(
            filename=filename,
            page_count=len(pages),
            source_type="pdf",
        ),
        pages=pages,
    )
