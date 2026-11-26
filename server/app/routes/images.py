"""Medical Image Analysis routes using secure upload validation and Vision AI."""

import json
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.safety import IMAGE_DISCLAIMER
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.entities import UploadedImage, User
from app.schemas.medical import UploadedImageResponse
from app.services.ai_service import analyze_medical_image_with_vision
from app.utils.activity import log_activity
from app.utils.file_validation import delete_stored_file, validate_and_store_upload

router = APIRouter(prefix="/api/images", tags=["Medical Image Analysis"])


def _serialize_image(img: UploadedImage) -> UploadedImageResponse:
    return UploadedImageResponse(
        id=img.id,
        original_filename=img.original_filename,
        mime_type=img.mime_type,
        file_size_bytes=img.file_size_bytes,
        image_context=img.image_context,
        analysis_summary=img.analysis_summary,
        observations=json.loads(img.observations_json or "[]"),
        limitations=img.limitations,
        recommended_next_steps=img.recommended_next_steps,
        ai_model=img.ai_model,
        status=img.status,
        disclaimer=IMAGE_DISCLAIMER,
        created_at=img.created_at,
    )


@router.post("/analyze", response_model=UploadedImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_analyze_image(
    file: UploadFile = File(...),
    image_context: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    original_name, stored_name, storage_path, mime_type, size_bytes, raw_bytes = (
        await validate_and_store_upload(file, current_user.id, kind="images")
    )

    clean_context = image_context.strip()[:1000] if image_context else None
    record = UploadedImage(
        user_id=current_user.id,
        original_filename=original_name,
        stored_filename=stored_name,
        storage_path=storage_path,
        mime_type=mime_type,
        file_size_bytes=size_bytes,
        image_context=clean_context,
        status="uploaded",
    )
    db.add(record)
    db.flush()

    try:
        vision_data, model_used = await analyze_medical_image_with_vision(
            raw_bytes, mime_type, clean_context
        )
    except HTTPException:
        # Remove orphan record and file if AI service isn't configured or failed
        db.rollback()
        delete_stored_file(storage_path)
        raise

    record.analysis_summary = vision_data.get("analysis_summary", "")
    record.observations_json = json.dumps(vision_data.get("observations", []))
    record.limitations = vision_data.get("limitations", "")
    record.recommended_next_steps = vision_data.get("recommended_next_steps", "")
    record.ai_model = model_used
    record.status = "analyzed"

    log_activity(
        db,
        user_id=current_user.id,
        activity_type="image_analysis",
        description=f"Ran educational Vision AI review on '{original_name}'.",
        resource_type="uploaded_image",
        resource_id=record.id,
        metadata={"ai_model": model_used},
    )
    db.commit()
    db.refresh(record)
    return _serialize_image(record)


@router.get("/", response_model=List[UploadedImageResponse])
def list_uploaded_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(UploadedImage)
        .filter(UploadedImage.user_id == current_user.id)
        .order_by(UploadedImage.created_at.desc())
        .all()
    )
    return [_serialize_image(i) for i in items]


@router.get("/{image_id}/file")
def get_uploaded_image_file(
    image_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    img = (
        db.query(UploadedImage)
        .filter(UploadedImage.id == image_id, UploadedImage.user_id == current_user.id)
        .first()
    )
    if not img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image record not found.")
    path = Path(img.storage_path)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored image file not found.")
    return FileResponse(path=str(path), media_type=img.mime_type, filename=img.original_filename)


@router.delete("/{image_id}")
def delete_uploaded_image(
    image_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    img = (
        db.query(UploadedImage)
        .filter(UploadedImage.id == image_id, UploadedImage.user_id == current_user.id)
        .first()
    )
    if not img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image record not found.")
    filename = img.original_filename
    storage_path = img.storage_path
    db.delete(img)
    log_activity(
        db,
        user_id=current_user.id,
        activity_type="record_deleted",
        description=f"Deleted uploaded medical image '{filename}'.",
        resource_type="uploaded_image",
        resource_id=image_id,
    )
    db.commit()
    delete_stored_file(storage_path)
    return {"message": "Uploaded image deleted successfully."}
