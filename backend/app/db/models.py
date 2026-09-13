from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Investigation(Base):
    __tablename__ = "investigations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_score: Mapped[int] = mapped_column(nullable=False)
    transaction_count: Mapped[int] = mapped_column(nullable=False, default=0)
    vendor_count: Mapped[int] = mapped_column(nullable=False, default=0)
    total_amount: Mapped[float] = mapped_column(nullable=False, default=0)
    executive_summary: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    findings_json: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    timeline_json: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    ai_report: Mapped[dict] = mapped_column(JSON, nullable=True)
    recommendations: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=True)
    report_generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Open")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="Medium")
    assigned_to: Mapped[str] = mapped_column(String(120), nullable=True)
    notes: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    approval_status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pending")
    approved_by: Mapped[str] = mapped_column(String(120), nullable=True)
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    approval_notes: Mapped[str] = mapped_column(Text, nullable=True)
    approval_history: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)

    @property
    def findings(self) -> list[dict]:
        return self.findings_json

    @property
    def timeline(self) -> list[dict]:
        return self.timeline_json

    @property
    def report(self) -> dict | None:
        return self.ai_report
