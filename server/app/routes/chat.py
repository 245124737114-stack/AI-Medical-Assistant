"""AI Medical Chatbot routes with persistent conversation history and emergency detection."""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.safety import EMERGENCY_GUIDANCE, GENERAL_DISCLAIMER, detect_emergency_signals
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.entities import ChatMessage, ChatSession, User
from app.schemas.medical import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)
from app.services.ai_service import generate_chat_reply
from app.utils.activity import log_activity

router = APIRouter(prefix="/api/chat", tags=["AI Medical Chatbot"])


def _serialize_session(session: ChatSession) -> ChatSessionResponse:
    messages = session.messages or []
    last_preview = messages[-1].content[:110] if messages else None
    return ChatSessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=len(messages),
        last_message_preview=last_preview,
    )


@router.get("/sessions", response_model=List[ChatSessionResponse])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [_serialize_session(s) for s in sessions]


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    title = (payload.title or "New Health Conversation").strip() or "New Health Conversation"
    session = ChatSession(user_id=current_user.id, title=title[:200])
    db.add(session)
    log_activity(
        db,
        user_id=current_user.id,
        activity_type="chat_session_created",
        description=f"Started conversation '{session.title}'.",
        resource_type="chat_session",
        resource_id=session.id,
    )
    db.commit()
    db.refresh(session)
    return _serialize_session(session)


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")

    return [
        ChatMessageResponse(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            content=m.content,
            emergency_flagged=m.emergency_flagged,
            created_at=m.created_at,
        )
        for m in session.messages
    ]


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")

    title = session.title
    db.delete(session)
    log_activity(
        db,
        user_id=current_user.id,
        activity_type="record_deleted",
        description=f"Deleted chat conversation '{title}'.",
        resource_type="chat_session",
        resource_id=session_id,
    )
    db.commit()
    return {"message": "Conversation deleted."}


@router.delete("/sessions/{session_id}/messages")
def clear_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")

    db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id,
        ChatMessage.user_id == current_user.id,
    ).delete()
    session.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Conversation messages cleared."}


@router.post("/message")
async def send_chat_message(
    payload: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    clean_message = payload.message.strip()
    if not clean_message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty.")

    if payload.session_id:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == payload.session_id, ChatSession.user_id == current_user.id)
            .first()
        )
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")
    else:
        auto_title = clean_message[:60] + ("..." if len(clean_message) > 60 else "")
        session = ChatSession(user_id=current_user.id, title=auto_title)
        db.add(session)
        db.flush()

    if session.title == "New Health Conversation" and len(session.messages) == 0:
        session.title = clean_message[:60] + ("..." if len(clean_message) > 60 else "")

    emergency_detected, emergency_reasons = detect_emergency_signals(clean_message)

    history = [{"role": m.role, "content": m.content} for m in session.messages]

    user_msg = ChatMessage(
        session_id=session.id,
        user_id=current_user.id,
        role="user",
        content=clean_message,
        emergency_flagged=emergency_detected,
    )
    db.add(user_msg)
    db.flush()

    try:
        reply_text, model_used = await generate_chat_reply(history, clean_message, emergency_detected)
    except HTTPException as exc:
        # Even if AI provider is unconfigured, save emergency safety response if red flags were detected
        if emergency_detected and exc.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
            safety_text = (
                f"**{EMERGENCY_GUIDANCE}**\n\n"
                f"Detected warning indicators: {', '.join(emergency_reasons)}.\n\n"
                f"*Note: Full conversational AI responses require `OPENAI_API_KEY` to be configured in `server/.env`.*"
            )
            assistant_msg = ChatMessage(
                session_id=session.id,
                user_id=current_user.id,
                role="assistant",
                content=safety_text,
                emergency_flagged=True,
            )
            db.add(assistant_msg)
            session.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(assistant_msg)
            return {
                "session": _serialize_session(session),
                "user_message": ChatMessageResponse.model_validate(user_msg, from_attributes=True),
                "assistant_message": ChatMessageResponse.model_validate(assistant_msg, from_attributes=True),
                "emergency_detected": True,
                "emergency_reasons": emergency_reasons,
                "emergency_banner": EMERGENCY_GUIDANCE,
                "disclaimer": GENERAL_DISCLAIMER,
                "ai_model": "safety-guardrail",
            }
        db.rollback()
        raise

    assistant_msg = ChatMessage(
        session_id=session.id,
        user_id=current_user.id,
        role="assistant",
        content=reply_text,
        emergency_flagged=emergency_detected,
    )
    db.add(assistant_msg)
    session.updated_at = datetime.now(timezone.utc)
    log_activity(
        db,
        user_id=current_user.id,
        activity_type="chat_message",
        description=f"AI health chat query in '{session.title}'.",
        resource_type="chat_session",
        resource_id=session.id,
        metadata={"emergency_flagged": emergency_detected, "ai_model": model_used},
    )
    db.commit()
    db.refresh(session)
    db.refresh(user_msg)
    db.refresh(assistant_msg)

    return {
        "session": _serialize_session(session),
        "user_message": ChatMessageResponse.model_validate(user_msg, from_attributes=True),
        "assistant_message": ChatMessageResponse.model_validate(assistant_msg, from_attributes=True),
        "emergency_detected": emergency_detected,
        "emergency_reasons": emergency_reasons,
        "emergency_banner": EMERGENCY_GUIDANCE if emergency_detected else None,
        "disclaimer": GENERAL_DISCLAIMER,
        "ai_model": model_used,
    }
