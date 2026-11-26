"""Secure file upload validation and private local storage helpers."""

from io import BytesIO
from pathlib import Path
from typing import Set, Tuple
import uuid

from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError
from pypdf import PdfReader

from app.core.config import get_settings

REPORT_EXTENSIONS: Set[str] = {".pdf", ".jpg", ".jpeg", ".png"}
REPORT_MIME_TYPES: Set[str] = {"application/pdf", "image/jpeg", "image/png"}

IMAGE_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png"}
IMAGE_MIME_TYPES: Set[str] = {"image/jpeg", "image/png"}


def _safe_extension(filename: str) -> str:
    return Path(filename or "").suffix.lower()


async def validate_and_store_upload(
    file: UploadFile,
    user_id: str,
    kind: str,
) -> Tuple[str, str, str, str, int, bytes]:
    """
    Validate file extension, MIME type, size, and binary signature, then store safely.
    Returns: (original_filename, stored_filename, storage_path, normalized_mime, size_bytes, raw_bytes)
    """
    settings = get_settings()
    allowed_exts = REPORT_EXTENSIONS if kind == "reports" else IMAGE_EXTENSIONS
    allowed_mimes = REPORT_MIME_TYPES if kind == "reports" else IMAGE_MIME_TYPES

    original_name = Path(file.filename or "upload").name
    ext = _safe_extension(original_name)
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(allowed_exts))}.",
        )

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in allowed_mimes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file MIME type '{content_type}'.",
        )

    raw_bytes = await file.read()
    size_bytes = len(raw_bytes)
    if size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if size_bytes > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the maximum allowed size of {settings.max_upload_size_mb} MB.",
        )

    # Verify actual binary content rather than trusting filename/Content-Type
    normalized_mime: str
    if ext == ".pdf":
        if not raw_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File does not appear to be a valid PDF document.",
            )
        try:
            PdfReader(BytesIO(raw_bytes))
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF file is corrupted or unreadable.",
            ) from exc
        normalized_mime = "application/pdf"
    else:
        try:
            with Image.open(BytesIO(raw_bytes)) as img:
                img.verify()
            with Image.open(BytesIO(raw_bytes)) as img:
                fmt = (img.format or "").upper()
                if fmt not in {"JPEG", "PNG"}:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Image must be a valid JPEG or PNG file.",
                    )
                normalized_mime = "image/jpeg" if fmt == "JPEG" else "image/png"
        except HTTPException:
            raise
        except (UnidentifiedImageError, OSError) as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded image is invalid or corrupted.",
            ) from exc

    target_dir = (settings.upload_path / kind / user_id).resolve()
    target_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = f"{uuid.uuid4()}{ext}"
    destination = (target_dir / stored_filename).resolve()
    if target_dir not in destination.parents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid storage path.",
        )

    destination.write_bytes(raw_bytes)
    return original_name, stored_filename, str(destination), normalized_mime, size_bytes, raw_bytes


def delete_stored_file(storage_path: str) -> None:
    """Safely delete an uploaded file if it exists within the configured upload root."""
    settings = get_settings()
    try:
        target = Path(storage_path).resolve()
        root = settings.upload_path.resolve()
        if root in target.parents and target.is_file():
            target.unlink()
    except OSError:
        pass
