from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.dashboard import router as dashboard_router

app = FastAPI(title="Helios FI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(dashboard_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
def health() -> dict:
    return {"status": "ok", "service": "helios-fi-api"}

