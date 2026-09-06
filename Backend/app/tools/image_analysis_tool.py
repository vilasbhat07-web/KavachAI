"""Local image analysis: Ollama vision model or a deterministic CV fallback (Pillow)."""

import base64
import time
from pathlib import Path
from typing import Optional

from app.config import Settings, get_settings
from app.exceptions import UnsupportedMediaTypeError
from app.rag.llm_client import LLMClient
from app.schemas.common import EvidenceItem
from app.schemas.image import ImageAnalyzeResponse
from app.utils.hashing import sha256_file
from app.utils.security import safe_filename


def _cv_fallback(path: Path) -> tuple[str, list[str], float]:
    """Local, non-LLM description from image statistics. No external APIs."""
    from PIL import Image, ImageStat

    with Image.open(path) as image:
        image.load()
        width, height = image.size
        mode = image.mode
        converted = image.convert("RGB")
        stats = ImageStat.Stat(converted)
        means = [round(value, 1) for value in stats.mean]
        extrema = converted.getextrema()
        brightness = sum(means) / 3.0
        if brightness < 60:
            lighting = "dark"
        elif brightness > 180:
            lighting = "bright"
        else:
            lighting = "moderate"
        labels = [mode.lower(), lighting, f"{width}x{height}"]
        description = (
            f"Local CV fallback (no vision LLM configured): {width}x{height} {mode} image. "
            f"Mean RGB {means}. Channel extrema {list(extrema)}. Lighting appears {lighting}."
        )
        return description, labels, 0.4


async def analyze_image(
    path: Path,
    *,
    filename: str,
    content_type: str,
    document_id: str,
    settings: Optional[Settings] = None,
    llm: Optional[LLMClient] = None,
) -> ImageAnalyzeResponse:
    """Analyze an image file already stored on disk."""
    cfg = settings or get_settings()
    mime = (content_type or "").split(";")[0].strip().lower()
    if mime not in cfg.image_allowed_mime_type_set:
        raise UnsupportedMediaTypeError(
            "Unsupported image type.",
            detail={"content_type": content_type, "filename": filename},
        )
    started = time.perf_counter()
    digest = sha256_file(path)
    used_vision = False
    model = "local-cv-fallback"
    confidence: float | None = 0.4

    if cfg.vision_enabled:
        client = llm or LLMClient(cfg)
        raw = path.read_bytes()
        b64 = base64.b64encode(raw).decode("ascii")
        prompt = (
            "Describe this industrial/site image factually. Note equipment, text, hazards, "
            "and uncertainty. Do not invent unreadable values."
        )
        description = await client.generate_vision(prompt, b64)
        labels = []
        used_vision = True
        model = cfg.ollama_vision_model
        confidence = None
    else:
        description, labels, confidence = _cv_fallback(path)

    latency_ms = int((time.perf_counter() - started) * 1000)
    evidence = [
        EvidenceItem(
            source_type="image",
            document_id=document_id,
            snippet=f"{safe_filename(filename)} sha256={digest[:12]}…",
            tool_name="image_analysis",
            filename=safe_filename(filename),
            confidence=confidence,
        )
    ]
    return ImageAnalyzeResponse(
        document_id=document_id,
        description=description,
        labels=labels,
        confidence=confidence,
        model=model,
        used_vision_llm=used_vision,
        evidence=evidence,
        latency_ms=latency_ms,
    )
