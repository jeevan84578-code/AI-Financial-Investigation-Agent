# Helios FI

Helios FI is an AI-powered financial investigation workspace for finance, audit, and risk teams.

## First vertical slice

This repository currently contains the command dashboard foundation:

- `backend/` — FastAPI service with dashboard, investigation, analytics, and case-management APIs.
- `frontend/` — Vite + React + TypeScript dashboard shell.

Investigations and case-management updates are persisted through SQLAlchemy.

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `DATABASE_URL` for PostgreSQL, for example:

```env
DATABASE_URL=postgresql+psycopg://helios:password@localhost:5432/helios_fi
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=qwen/qwen-2.5-72b-instruct
```

If `DATABASE_URL` is omitted, local development uses `backend/helios-fi.db` (SQLite).
The investigation table is initialized on startup. For migration workflows:

```bash
cd backend
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:8000`.

Investigation history is available at `/investigations`, with persisted detail pages at
`/investigations/{id}`. New CSV analyses start at `/investigations/new`.
On an investigation detail page, `Generate AI report` calls OpenRouter and persists the
Qwen-generated report sections to the investigation record.
Case management is available at `/cases`. It supports status, priority, assignment,
filters, notes, and a detail drawer. The corresponding APIs are:
`GET /api/v1/cases`, `GET /api/v1/cases/{id}`, `PATCH /api/v1/cases/{id}/status`,
`PATCH /api/v1/cases/{id}/priority`, `PATCH /api/v1/cases/{id}/assign`, and
`POST /api/v1/cases/{id}/notes`.
Finance approval is available from the case detail drawer. Approval state and audit
history are persisted by migration `0004_add_approval_workflow_fields`. The approval
APIs are `GET /api/v1/cases/{id}/approval`, `POST /api/v1/cases/{id}/approve`, and
`POST /api/v1/cases/{id}/reject`. Analytics also reports pending, approved, and
rejected case totals.
Case details can be downloaded as PDF or Excel from the drawer through
`GET /api/v1/cases/{id}/export/pdf` and
`GET /api/v1/cases/{id}/export/excel`.
