"""Personalized Dashboard overview route backed by real user database records."""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.entities import (
    ChatSession,
    MedicalReport,
    ReportSummary,
    UploadedImage,
    User,
    UserActivity,
)
from app.routes.auth import serialize_user
from app.routes.chat import _serialize_session
from app.routes.reports import _serialize_report

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings = get_settings()

    total_reports = (
        db.query(func.count(MedicalReport.id))
        .filter(MedicalReport.user_id == current_user.id)
        .scalar()
        or 0
    )
    total_summaries = (
        db.query(func.count(ReportSummary.id))
        .filter(ReportSummary.user_id == current_user.id)
        .scalar()
        or 0
    )
    total_chats = (
        db.query(func.count(ChatSession.id))
        .filter(ChatSession.user_id == current_user.id)
        .scalar()
        or 0
    )
    total_images = (
        db.query(func.count(UploadedImage.id))
        .filter(UploadedImage.user_id == current_user.id)
        .scalar()
        or 0
    )
    total_symptom_checks = (
        db.query(func.count(UserActivity.id))
        .filter(
            UserActivity.user_id == current_user.id,
            UserActivity.activity_type == "symptom_check",
        )
        .scalar()
        or 0
    )

    recent_reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == current_user.id)
        .order_by(MedicalReport.created_at.desc())
        .limit(5)
        .all()
    )
    recent_chats = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .limit(5)
        .all()
    )
    recent_activity = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == current_user.id)
        .order_by(UserActivity.created_at.desc())
        .limit(8)
        .all()
    )

    return {
        "user": serialize_user(current_user),
        "stats": {
            "total_reports": total_reports,
            "total_summaries": total_summaries,
            "total_conversations": total_chats,
            "total_images": total_images,
            "total_symptom_checks": total_symptom_checks,
        },
        "recent_reports": [_serialize_report(r) for r in recent_reports],
        "recent_conversations": [_serialize_session(c) for c in recent_chats],
        "recent_activity": [
            {
                "id": a.id,
                "activity_type": a.activity_type,
                "description": a.description,
                "created_at": a.created_at,
            }
            for a in recent_activity
        ],
        "system_status": {
            "ai_configured": settings.is_ai_configured,
            "ai_provider": settings.ai_provider,
            "chat_model": settings.openai_chat_model,
            "vision_model": settings.openai_vision_model,
        },
    }
