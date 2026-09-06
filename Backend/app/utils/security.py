"""Input sanitization, upload guards, and Python-sandbox static checks."""

import ast
import re
from pathlib import Path
from typing import FrozenSet, Iterable, Optional

from app.exceptions import PayloadTooLargeError, ToolRejectedError, UnsupportedMediaTypeError

_UNSAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")
_BANNED_NAMES = {
    "eval",
    "exec",
    "compile",
    "open",
    "__import__",
    "input",
    "breakpoint",
    "globals",
    "locals",
    "getattr",
    "setattr",
    "delattr",
    "vars",
    "dir",
    "memoryview",
    "exit",
    "quit",
}


def safe_filename(filename: str) -> str:
    """Return a basename with path separators stripped."""
    name = Path(filename.replace("\\", "/")).name
    name = _UNSAFE_NAME.sub("_", name).strip("._") or "upload"
    return name[:255]


def assert_allowed_mime(content_type: Optional[str], allowed: FrozenSet[str], filename: str) -> str:
    """Validate MIME against an allowlist. Returns the normalized MIME."""
    mime = (content_type or "").split(";")[0].strip().lower()
    if mime in {"application/octet-stream", "binary/octet-stream", ""}:
        # Caller may resolve via extension; still reject empty unknown at the route if needed.
        return mime
    if mime not in allowed:
        raise UnsupportedMediaTypeError(
            "Unsupported media type.",
            detail={"content_type": content_type, "filename": filename},
        )
    return mime


def assert_size_limit(size_bytes: int, max_bytes: int) -> None:
    """Reject oversized uploads."""
    if size_bytes > max_bytes:
        raise PayloadTooLargeError(
            "Upload exceeds configured size limit.",
            detail={"size_bytes": size_bytes, "max_bytes": max_bytes},
        )


def validate_analysis_code(code: str, allowed_imports: Iterable[str]) -> None:
    """Static check before subprocess execution. Highest-risk gate besides the sandbox itself."""
    if len(code) > 32_768:
        raise ToolRejectedError("Analysis code exceeds maximum length.")
    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        raise ToolRejectedError("Analysis code is not valid Python.", detail={"reason": str(exc)}) from exc

    allowed = set(allowed_imports)
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                root = alias.name.split(".")[0]
                if root not in allowed:
                    raise ToolRejectedError(
                        "Import is not on the sandbox whitelist.",
                        detail={"import": alias.name},
                    )
        elif isinstance(node, ast.ImportFrom):
            if node.level and node.level > 0:
                raise ToolRejectedError("Relative imports are not allowed.")
            root = (node.module or "").split(".")[0]
            if root not in allowed:
                raise ToolRejectedError(
                    "Import is not on the sandbox whitelist.",
                    detail={"import": node.module},
                )
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in _BANNED_NAMES:
                raise ToolRejectedError(
                    "Call to a banned builtin is not allowed.",
                    detail={"name": node.func.id},
                )
        elif isinstance(node, ast.Attribute) and node.attr.startswith("_"):
            raise ToolRejectedError("Access to private attributes is not allowed.")
        elif isinstance(node, ast.Name) and node.id in _BANNED_NAMES:
            raise ToolRejectedError(
                "Use of a banned name is not allowed.",
                detail={"name": node.id},
            )
