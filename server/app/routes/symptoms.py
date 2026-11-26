"""Symptom Information Checker routes (educational, non-diagnostic)."""

import json
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.safety import detect_emergency_signals
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.entities import User, UserActivity
from app.schemas.medical import SymptomAnalyzeRequest
from app.services.ai_service import generate_symptom_guidance
from app.utils.activity import log_activity

router = APIRouter(prefix="/api/symptoms", tags=["Symptom Information"])


@router.post("/analyze")
async def analyze_symptoms(
    payload: SymptomAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    combined_text = " ".join(
        part
        for part in [
            payload.main_symptom,
            payload.additional_symptoms or "",
            payload.relevant_context or "",
        ]
        if part
    )
    emergency_detected, emergency_reasons = detect_emergency_signals(combined_text)

    guidance, model_used = await generate_symptom_guidance(
        payload.model_dump(),
        emergency_detected=emergency_detected,
        emergency_reasons=emergency_reasons,
    )
    guidance["ai_model"] = model_used
    guidance["input_summary"] = payload.model_dump()

    log_activity(
        db,
        user_id=current_user.id,
        activity_type="symptom_check",
        description=f"Symptom education check for '{payload.main_symptom}' ({payload.severity}, {payload.duration}).",
        resource_type="symptom_check",
        metadata={
            "input": payload.model_dump(),
            "result": guidance,
        },
    )
    db.commit()
    return guidance


@router.get("/history")
def get_symptom_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries: List[UserActivity] = (
        db.query(UserActivity)
        .filter(
            UserActivity.user_id == current_user.id,
            UserActivity.activity_type == "symptom_check",
        )
        .order_by(UserActivity.created_at.desc())
        .limit(20)
        .all()
    )
    history = []
    for entry in entries:
        meta = {}
        if entry.metadata_json:
            try:
                meta = json.loads(entry.metadata_json)
            except json.JSONDecodeError:
                meta = {}
        history.append(
            {
                "id": entry.id,
                "description": entry.description,
                "created_at": entry.created_at,
                "input": meta.get("input"),
                "result": meta.get("result"),
            }
        )
    return history
