# Helios FI

Helios FI is an AI-powered financial investigation workspace for finance, audit, and risk teams.

## First vertical slice

This repository currently contains the command dashboard foundation:

- `backend/` — FastAPI service with `GET /health` and `GET /api/v1/dashboard`.
- `frontend/` — Vite + React + TypeScript dashboard shell.

The dashboard uses seeded data until PostgreSQL and the investigation services are introduced.

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
