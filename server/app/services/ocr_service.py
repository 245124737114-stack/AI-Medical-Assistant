"""Text extraction and OCR service for PDF and image medical reports."""

import base64
from io import BytesIO
import logging
import shutil
from typing import Tuple

from PIL import Image
from pypdf import PdfReader

from app.core.config import get_settings

logger = logging.getLogger("ai_medical_assistant.ocr")


def _extract_pdf_text(raw_bytes: bytes) -> Tuple[str, str]:
    reader = PdfReader(BytesIO(raw_bytes))
    pages = []
    for idx, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if text:
            pages.append(f"--- Page {idx} ---\n{text}")
    combined = "\n\n".join(pages).strip()
    if combined:
        return combined, "pypdf"
    return "", "pypdf_empty"


def _tesseract_available() -> str | None:
    settings = get_settings()
    if settings.tesseract_cmd:
        return settings.tesseract_cmd
    return shutil.which("tesseract")


def _extract_with_tesseract(raw_bytes: bytes) -> Tuple[str, str]:
    import pytesseract

    cmd = _tesseract_available()
    if cmd:
        pytesseract.pytesseract.tesseract_cmd = cmd

    with Image.open(BytesIO(raw_bytes)) as img:
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        text = pytesseract.image_to_string(img) or ""
    return text.strip(), "tesseract_ocr"


async def _extract_with_vision_ocr(raw_bytes: bytes, mime_type: str) -> Tuple[str, str]:
    from openai import AsyncOpenAI

    settings = get_settings()
    client = AsyncOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
    )
    b64 = base64.b64encode(raw_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{b64}"

    response = await client.chat.completions.create(
        model=settings.openai_vision_model,
        temperature=0.0,
        max_tokens=2000,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a precise medical document OCR transcriber. "
                    "Transcribe ONLY the exact text, numbers, units, and reference ranges visible in the image. "
                    "Do NOT invent, estimate, or interpret missing values. "
                    "If part of the image is blurry or unreadable, write [UNREADABLE]."
                ),
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Transcribe all visible text from this medical report image verbatim."},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            },
        ],
    )
    text = (response.choices[0].message.content or "").strip()
    return text, "openai_vision_ocr"


async def extract_report_text(raw_bytes: bytes, mime_type: str) -> Tuple[str, str]:
    """
    Extract text from PDF or image report.
    Returns (extracted_text, extraction_method).
    """
    if mime_type == "application/pdf":
        return _extract_pdf_text(raw_bytes)

    # Image OCR: try local Tesseract first, then server-side Vision OCR if configured
    if _tesseract_available():
        try:
            text, method = _extract_with_tesseract(raw_bytes)
            if text:
                return text, method
        except Exception as exc:
            logger.warning("Tesseract OCR failed: %s", exc)

    settings = get_settings()
    if settings.is_ai_configured:
        try:
            return await _extract_with_vision_ocr(raw_bytes, mime_type)
        except Exception as exc:
            logger.warning("Vision OCR failed: %s", exc)
            return "", "vision_ocr_failed"

    return "", "ocr_unavailable"
