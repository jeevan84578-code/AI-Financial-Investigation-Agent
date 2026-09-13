from datetime import date, datetime

from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_investigations: int
    average_risk_score: float
    high_risk_count: int
    vendor_count: int
    pending_approvals: int
    approved_cases: int
    rejected_cases: int


class RiskTrendPoint(BaseModel):
    date: date
    investigations: int
    average_risk: float


class VendorConcentrationPoint(BaseModel):
    vendor: str
    spend: float


class FindingCategoryPoint(BaseModel):
    category: str
    count: int


class RecentInvestigation(BaseModel):
    id: str
    filename: str
    risk_score: int
    created_at: datetime
    status: str


class AnalyticsCharts(BaseModel):
    trend: list[RiskTrendPoint]
    vendor_concentration: list[VendorConcentrationPoint]
    finding_categories: list[FindingCategoryPoint]
    recent_investigations: list[RecentInvestigation]
