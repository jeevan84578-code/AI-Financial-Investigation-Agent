from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


FindingSeverity = Literal["high", "medium", "low"]
FindingType = Literal["duplicate_invoice", "unusual_amount", "rapid_payment", "concentration"]
CaseStatus = Literal["Open", "Under Review", "Escalated", "Closed"]
CasePriority = Literal["Low", "Medium", "High", "Critical"]
ApprovalStatus = Literal["Pending", "Under Review", "Approved", "Rejected"]


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
    ai_report: dict | None = None
    recommendations: list[str] = Field(default_factory=list)
    confidence_score: float | None = None
    report_generated_at: datetime | None = None
    status: CaseStatus
    priority: CasePriority
    assigned_to: str | None = None
    notes: list[dict] = Field(default_factory=list)
    last_updated: datetime
    approval_status: ApprovalStatus
    approved_by: str | None = None
    approved_at: datetime | None = None
    approval_notes: str | None = None
    approval_history: list[dict] = Field(default_factory=list)


class CaseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    risk_score: int
    status: CaseStatus
    priority: CasePriority
    assigned_to: str | None = None
    last_updated: datetime
    approval_status: ApprovalStatus


class CaseStatusUpdate(BaseModel):
    status: CaseStatus


class CasePriorityUpdate(BaseModel):
    priority: CasePriority


class CaseAssignmentUpdate(BaseModel):
    assigned_to: str


class CaseNoteCreate(BaseModel):
    note: str = Field(min_length=1, max_length=2000)


class CaseNote(BaseModel):
    text: str
    author: str
    created_at: datetime


class ApprovalResponse(BaseModel):
    status: ApprovalStatus
    approved_by: str | None = None
    approved_at: datetime | None = None
    notes: str | None = None
    history: list[dict] = Field(default_factory=list)


class ApprovalAction(BaseModel):
    approver: str = Field(min_length=1, max_length=120)
    notes: str = Field(default="", max_length=2000)


class InvestigationCreate(BaseModel):
    filename: str
    risk_score: int
    executive_summary: str
    findings: list[InvestigationFindingResponse]
    timeline: list[InvestigationTimelineResponse]
