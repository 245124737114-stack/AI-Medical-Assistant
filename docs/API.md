# AI Medical Assistant — REST API Documentation

All protected endpoints require an `Authorization: Bearer <jwt_token>` header.

## Health & System Status
- `GET /api/health` — Returns backend health, AI provider configuration status (`ai_configured`), active chat/vision models, and Tesseract availability.

## Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user (`full_name`, `email`, strong `password`), creates `users` + `user_profiles`, returns JWT token.
- `POST /api/auth/login` — Authenticate with `email` and `password`, returns JWT token.
- `POST /api/auth/logout` — Authenticated logout audit log.
- `POST /api/auth/forgot-password` — Generates a 30-minute reset token hash.
- `POST /api/auth/reset-password` — Resets password using `token` and strong `new_password`.
- `GET /api/auth/me` — Returns current authenticated user and profile.

## User Management (`/api/users`)
- `GET /api/users/profile` — Fetch current user & profile.
- `PUT /api/users/profile` — Update full name, age, DOB, gender, blood type, allergies, chronic conditions, emergency contact, preferred units.
- `POST /api/users/change-password` — Change password with current password check.
- `GET /api/users/activity` — Retrieve user's personal activity log.
- `DELETE /api/users/activity/{activity_id}` — Delete an activity item owned by the user.

## AI Medical Chatbot (`/api/chat`)
- `GET /api/chat/sessions` — List user's chat sessions.
- `POST /api/chat/sessions` — Create a new conversation session.
- `GET /api/chat/sessions/{session_id}/messages` — Retrieve messages for an owned session.
- `DELETE /api/chat/sessions/{session_id}/messages` — Clear messages in a session.
- `DELETE /api/chat/sessions/{session_id}` — Delete a chat session.
- `POST /api/chat/message` — Send a health education prompt; runs emergency detection, calls server-side LLM, and persists messages.

## Symptom Information Checker (`/api/symptoms`)
- `POST /api/symptoms/analyze` — Accepts `age`, optional `gender`, `main_symptom`, `duration`, `severity`, `additional_symptoms`, `relevant_context`; returns structured non-diagnostic educational overview, possible explanations, next steps, warning signs, and questions for a doctor.
- `GET /api/symptoms/history` — Returns user's saved symptom checks.

## Medical Reports (`/api/reports`)
- `POST /api/reports/upload` — Multipart upload (`PDF`, `JPG`, `JPEG`, `PNG`, max 10 MB), verifies binary magic bytes, extracts text (`pypdf` / OCR), saves private record.
- `POST /api/reports/{report_id}/summarize` — Generates structured plain-English summary and lab marker table strictly using report-supplied reference ranges.
- `GET /api/reports/` — List user's reports.
- `GET /api/reports/{report_id}` — Get report details & summary.
- `GET /api/reports/{report_id}/parsed-markers` — Deterministic marker extraction from extracted report text.
- `GET /api/reports/{report_id}/file` — Authenticated download/preview of original file.
- `GET /api/reports/{report_id}/summary/download` — Authenticated download of Markdown summary report.
- `DELETE /api/reports/{report_id}` — Permanently deletes report, summary, and stored file.

## Medical Image Analysis (`/api/images`)
- `POST /api/images/analyze` — Upload `JPG`, `JPEG`, or `PNG` with optional `image_context`; sends securely to server-side Vision AI and stores non-diagnostic observations & limitations.
- `GET /api/images/` — List user's uploaded images.
- `GET /api/images/{image_id}/file` — Authenticated image preview.
- `DELETE /api/images/{image_id}` — Deletes image record and stored file.

## Health Information Library (`/api/library`)
- `GET /api/library/categories` — List the 6 wellness categories.
- `GET /api/library/articles?category=&q=` — Search and filter articles backed by MedlinePlus, WHO, and CDC.
- `GET /api/library/articles/{article_id}` — Retrieve full article details.

## Personalized Dashboard (`/api/dashboard`)
- `GET /api/dashboard/overview` — Real database counts, recent reports, recent conversations, profile snapshot, and server AI status.
