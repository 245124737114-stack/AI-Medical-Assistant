<<<<<<< HEAD
# AI-Medical-Assistant
=======
# AI Medical Assistant — Your Intelligent Healthcare Companion

A full-stack, educational AI-powered healthcare support web application built with **React + TypeScript + Vite + Tailwind CSS + Shadcn UI** on the frontend and **Python FastAPI + SQLAlchemy + PostgreSQL/Supabase (with local SQLite fallback)** on the backend.

> **Important Medical Safety Disclaimer:** AI Medical Assistant is strictly an educational healthcare support platform. It does **not** provide medical diagnoses, prescribe medications, or replace care from a qualified healthcare professional. In an emergency, call your local emergency services immediately.

---

## Core Features

1. **Public Landing Page & Medical Safety Center**
   - Modern healthcare UI (`#2563EB` Medical Blue & `#06B6D4` Cyan), custom SVG healthcare illustration, feature overview, workflow walkthrough, benefits, and safety disclaimers.
2. **Secure Authentication & User Isolation**
   - Registration with password complexity rules, JWT login, logout, forgot/reset password flow, profile management, and strict user-level ownership on every record and file endpoint.
3. **Personalized Dashboard**
   - Live counts from the database (uploaded reports, AI summaries, conversations, symptom checks, medical images), recent reports, recent chats, health library shortcuts, and AI provider status.
4. **AI Medical Chatbot**
   - Real-time Markdown responses, persistent conversation sessions, new/clear/delete chat controls, suggested questions, and automatic emergency warning detection.
5. **Symptom Information Checker**
   - Structured form (age, optional gender, main symptom, duration, severity, additional symptoms, context) returning educational explanations labelled as possibilities, next steps, warning signs, and questions for your doctor.
6. **Medical Report Summarizer (PDF, JPG, JPEG, PNG)**
   - Drag-and-drop upload with binary magic-byte validation, progress bar, secure preview, PDF text extraction (`pypdf`), OCR support (`pytesseract` or Vision OCR), deterministic lab marker extraction, AI plain-language summary without inventing reference ranges, and Markdown summary download.
7. **Medical Image Analysis**
   - Secure image upload, preview, Vision AI observations, explicit limitations and uncertainty, and clinician review recommendations.
8. **Health Information Library**
   - Searchable across 6 categories (*General Health*, *Nutrition*, *Fitness and Exercise*, *Preventive Healthcare*, *Common Health Conditions*, *Mental Wellness*) with links to **MedlinePlus**, **WHO**, and **CDC**.
9. **Personal Health Dashboard**
   - Manage uploaded reports, summaries, chat history, health profile, password changes, and account activity logs with full record deletion.

---

## Project Structure

```text
AI-Medical-Assistant/
├── client/                     # React + TypeScript + Vite + Tailwind + Shadcn UI
│   └── src/
│       ├── assets/             # Custom SVG illustrations
│       ├── components/         # Reusable & Shadcn UI components
│       ├── hooks/              # Auth context & protected blob hook
│       ├── layouts/            # PublicLayout & DashboardLayout
│       ├── pages/              # Landing, Auth, Dashboard, Chat, Symptoms, Reports, Images, Library, Records
│       ├── services/           # Typed API client & upload progress helper
│       ├── types/              # TypeScript interfaces
│       └── utils/              # Validation, formatting, class merging
├── server/                     # Python FastAPI Backend
│   ├── app/
│   │   ├── core/               # Config, JWT/bcrypt security, safety guardrails, logging
│   │   ├── database/           # SQLAlchemy engine & session initialization
│   │   ├── models/             # 8 relational ORM models
│   │   ├── routes/             # Auth, Users, Chat, Symptoms, Reports, Images, Library, Dashboard
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Server-side AI service, OCR service, parser, Health Library
│   │   └── utils/              # Secure file validation & activity logging
│   ├── .env.example
│   └── requirements.txt
├── database/
│   └── schema.sql              # PostgreSQL / Supabase DDL schema (8 tables)
└── docs/
    └── API.md                  # REST API reference
```

---

## Setup & Running Locally

### 1. Backend Setup (`server/`)

```bash
cd server
pip install -r requirements.txt
```

Copy `server/.env.example` to `server/.env` and configure your environment variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET_KEY=replace-with-a-strong-32-char-secret
# For PostgreSQL or Supabase:
# DATABASE_URL=postgresql+psycopg://postgres:password@host:5432/ai_medical_assistant
# Or leave default SQLite for zero-setup local testing:
DATABASE_URL=sqlite:///./ai_medical_assistant.db
```

Start the FastAPI backend:

```bash
cd server
uvicorn app.main:app --reload --port 8000
```

Interactive Swagger API docs are automatically available at `http://localhost:8000/docs`.

### 2. Frontend Setup (`client/`)

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Vite proxies `/api/*` requests directly to `http://127.0.0.1:8000`.

### 3. Production Build Check

```bash
cd client
npm run build
```

---

## Optional OCR for Scanned Images/PDFs

- **PDFs with embedded text** are extracted automatically via `pypdf`.
- **Image reports (JPG/PNG)** use local **Tesseract OCR** if `tesseract` is installed on your PATH (or `TESSERACT_CMD` is set), and automatically fall back to your configured **Vision AI model** when `OPENAI_API_KEY` is set.
>>>>>>> 4f4507f (initial commit)
