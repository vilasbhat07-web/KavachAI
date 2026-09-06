"""SHA-256 helpers. Audit logs store hashes, never raw bytes."""

import hashlib
from pathlib import Path
from typing import BinaryIO


def sha256_file(path: Path, chunk_size: int = 1024 * 64) -> str:
    """Hash a file on disk in streaming chunks."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while True:
            block = handle.read(chunk_size)
            if not block:
                break
            digest.update(block)
    return digest.hexdigest()


def sha256_stream(handle: BinaryIO, chunk_size: int = 1024 * 64) -> str:
    """Hash an already-open binary stream from the current position."""
    digest = hashlib.sha256()
    while True:
        block = handle.read(chunk_size)
        if not block:
            break
        digest.update(block)
    return digest.hexdigest()
