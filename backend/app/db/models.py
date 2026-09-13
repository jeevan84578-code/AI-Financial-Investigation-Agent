from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, JSON, String, Text
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

    @property
    def findings(self) -> list[dict]:
        return self.findings_json

    @property
    def timeline(self) -> list[dict]:
        return self.timeline_json
