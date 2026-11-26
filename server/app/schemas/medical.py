"""Pydantic schemas for chat, symptoms, reports, images, library, and dashboard."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class ChatSessionCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)


class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=4000)


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    emergency_flagged: bool
    created_at: datetime


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message_preview: Optional[str] = None


class SymptomAnalyzeRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: Optional[str] = Field(None, max_length=40)
    main_symptom: str = Field(..., min_length=2, max_length=500)
    duration: str = Field(..., min_length=1, max_length=200)
    severity: Literal["Mild", "Moderate", "Severe"]
    additional_symptoms: Optional[str] = Field(None, max_length=1500)
    relevant_context: Optional[str] = Field(None, max_length=1500)


class LabMarkerItem(BaseModel):
    name: str
    value: str
    unit: str = ""
    reference_range: str = "Not specified in report"
    status: Literal["high", "low", "normal", "unknown"] = "unknown"
    explanation: str = ""


class MedicalTermItem(BaseModel):
    term: str
    simple_explanation: str


class ReportSummaryResponse(BaseModel):
    id: str
    report_id: str
    plain_summary: str
    lab_markers: List[LabMarkerItem]
    medical_terms: List[MedicalTermItem]
    questions_for_doctor: List[str]
    warnings: List[str]
    ai_model: Optional[str] = None
    disclaimer: str
    created_at: datetime


class MedicalReportResponse(BaseModel):
    id: str
    original_filename: str
    mime_type: str
    file_size_bytes: int
    extraction_method: str
    extracted_text: Optional[str] = None
    status: str
    created_at: datetime
    summary: Optional[ReportSummaryResponse] = None


class UploadedImageResponse(BaseModel):
    id: str
    original_filename: str
    mime_type: str
    file_size_bytes: int
    image_context: Optional[str] = None
    analysis_summary: Optional[str] = None
    observations: List[str] = []
    limitations: Optional[str] = None
    recommended_next_steps: Optional[str] = None
    ai_model: Optional[str] = None
    status: str
    disclaimer: str
    created_at: datetime


class ActivityItemResponse(BaseModel):
    id: str
    activity_type: str
    description: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
