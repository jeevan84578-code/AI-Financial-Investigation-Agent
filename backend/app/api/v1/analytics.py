from collections import Counter, defaultdict
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.analytics_schemas import (
    AnalyticsCharts,
    AnalyticsOverview,
    FindingCategoryPoint,
    RecentInvestigation,
    RiskTrendPoint,
    VendorConcentrationPoint,
)
from app.db.database import get_db
from app.db.models import Investigation

router = APIRouter(prefix="/analytics", tags=["analytics"])

FINDING_LABELS = {
    "duplicate_invoice": "Duplicate invoices",
    "rapid_payment": "Rapid payments",
    "concentration": "Concentration findings",
    "unusual_amount": "Unusual amounts",
}


def _investigations(db: Session) -> list[Investigation]:
    return list(db.scalars(select(Investigation).order_by(Investigation.created_at.desc())).all())


@router.get("/overview", response_model=AnalyticsOverview)
def get_overview(db: Session = Depends(get_db)) -> AnalyticsOverview:
    records = _investigations(db)
    scores = [record.risk_score for record in records]
    vendors = {
        finding.get("vendor", "Unknown vendor")
        for record in records
        for finding in record.findings_json
        if finding.get("vendor")
    }
    return AnalyticsOverview(
        total_investigations=len(records),
        average_risk_score=round(sum(scores) / len(scores), 1) if scores else 0,
        high_risk_count=sum(score >= 70 for score in scores),
        vendor_count=len(vendors),
    )


@router.get("/charts", response_model=AnalyticsCharts)
def get_charts(db: Session = Depends(get_db)) -> AnalyticsCharts:
    records = _investigations(db)
    trend_by_date: dict[date, list[int]] = defaultdict(list)
    vendor_spend: Counter[str] = Counter()
    category_counts: Counter[str] = Counter()

    for record in records:
        record_date = record.created_at.date()
        trend_by_date[record_date].append(record.risk_score)
        findings = record.findings_json
        vendors = [finding.get("vendor", "Unknown vendor") for finding in findings if finding.get("vendor")]
        for vendor in vendors:
            vendor_spend[vendor] += record.total_amount / len(vendors) if vendors else 0
        for finding in findings:
            finding_type = finding.get("type")
            if finding_type in FINDING_LABELS:
                category_counts[FINDING_LABELS[finding_type]] += 1

    trend = [
        RiskTrendPoint(date=record_date, investigations=len(scores), average_risk=round(sum(scores) / len(scores), 1))
        for record_date, scores in sorted(trend_by_date.items())
    ]
    vendors = [
        VendorConcentrationPoint(vendor=vendor, spend=round(spend, 2))
        for vendor, spend in vendor_spend.most_common(6)
    ]
    categories = [
        FindingCategoryPoint(category=label, count=category_counts.get(label, 0))
        for label in FINDING_LABELS.values()
    ]
    recent = [
        RecentInvestigation(
            id=record.id,
            filename=record.filename,
            risk_score=record.risk_score,
            created_at=record.created_at,
            status="Completed",
        )
        for record in records[:10]
    ]
    return AnalyticsCharts(
        trend=trend,
        vendor_concentration=vendors,
        finding_categories=categories,
        recent_investigations=recent,
    )
