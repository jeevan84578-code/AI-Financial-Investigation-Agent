from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


FindingSeverity = Literal["high", "medium", "low"]
FindingType = Literal["duplicate_invoice", "unusual_amount", "rapid_payment", "concentration"]


class InvestigationFindingResponse(BaseModel):
    type: FindingType
    title: str
    detail: str
    vendor: str
    severity: FindingSeverity


class InvestigationTimelineResponse(BaseModel):
    step: str
    detail: str
    status: Literal["complete", "in_progress"]


class InvestigationListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    risk_score: int
    created_at: datetime


class InvestigationResponse(InvestigationListItem):
    transaction_count: int
    vendor_count: int
    total_amount: float
    executive_summary: str
    findings: list[InvestigationFindingResponse]
    timeline: list[InvestigationTimelineResponse]


class InvestigationCreate(BaseModel):
    filename: str
    risk_score: int
    executive_summary: str
    findings: list[InvestigationFindingResponse]
    timeline: list[InvestigationTimelineResponse]
