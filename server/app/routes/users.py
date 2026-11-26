"""User profile, password management, and personal activity history routes."""

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, hash_password, verify_password
from app.database.session import get_db
from app.models.entities import User, UserActivity, UserProfile
from app.routes.auth import serialize_user
from app.schemas.auth import ChangePasswordRequest, UserProfileUpdate, UserResponse
from app.schemas.medical import ActivityItemResponse
from app.utils.activity import log_activity

router = APIRouter(prefix="/api/users", tags=["User Management"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        cleaned = payload.full_name.strip()
        if len(cleaned) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name must be at least 2 characters.",
            )
        current_user.full_name = cleaned

    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    for field in (
        "date_of_birth",
        "age",
        "gender",
        "blood_type",
        "allergies",
        "chronic_conditions",
        "emergency_contact",
        "preferred_units",
    ):
        val = getattr(payload, field)
        if val is not None:
            setattr(profile, field, val.strip() if isinstance(val, str) else val)

    log_activity(
        db,
        user_id=current_user.id,
        activity_type="profile_update",
        description="Updated personal health profile details.",
        resource_type="user_profile",
        resource_id=profile.id,
    )
    db.commit()
    db.refresh(current_user)
    return serialize_user(current_user)


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.password_hash = hash_password(payload.new_password)
    log_activity(
        db,
        user_id=current_user.id,
        activity_type="password_changed",
        description="Updated account password.",
        resource_type="user",
        resource_id=current_user.id,
    )
    db.commit()
    return {"message": "Password changed successfully."}


@router.get("/activity", response_model=List[ActivityItemResponse])
def get_activity_history(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == current_user.id)
        .order_by(UserActivity.created_at.desc())
        .limit(limit)
        .all()
    )
    items: List[ActivityItemResponse] = []
    for row in rows:
        meta = None
        if row.metadata_json:
            try:
                meta = json.loads(row.metadata_json)
            except json.JSONDecodeError:
                meta = None
        items.append(
            ActivityItemResponse(
                id=row.id,
                activity_type=row.activity_type,
                description=row.description,
                resource_type=row.resource_type,
                resource_id=row.resource_id,
                metadata=meta,
                created_at=row.created_at,
            )
        )
    return items


@router.delete("/activity/{activity_id}")
def delete_activity_entry(
    activity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(UserActivity)
        .filter(UserActivity.id == activity_id, UserActivity.user_id == current_user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity entry not found.")
    db.delete(row)
    db.commit()
    return {"message": "Activity entry deleted."}
