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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:8000`.

