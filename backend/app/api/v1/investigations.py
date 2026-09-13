import csv
import io
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Investigation
from app.db.schemas import InvestigationListItem, InvestigationResponse

router = APIRouter(prefix="/investigations", tags=["investigations"])

REQUIRED_COLUMNS = {"vendor", "amount"}
COLUMN_ALIASES = {
    "vendor_name": "vendor",
    "supplier": "vendor",
    "vendor_id": "vendor",
    "value": "amount",
    "total": "amount",
    "transaction_amount": "amount",
    "invoice": "invoice_id",
    "invoice_number": "invoice_id",
    "date": "timestamp",
    "transaction_date": "timestamp",
    "paid_at": "timestamp",
}


@router.post("/run", response_model=InvestigationResponse)
async def run_investigation(file: UploadFile = File(...), db: Session = Depends(get_db)) -> Investigation:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    raw = await file.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="CSV files must be smaller than 10 MB.")

    try:
        rows = _parse_csv(raw)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    findings: list[dict] = []
    findings.extend(_duplicate_invoice_findings(rows))
    findings.extend(_unusual_amount_findings(rows))
    findings.extend(_rapid_payment_findings(rows))
    findings.extend(_concentration_findings(rows))

    risk_score = min(100, sum(finding["impact"] for finding in findings))
    vendors = len({row["vendor"] for row in rows})
    exposure = sum(row["amount"] for row in rows)
    high_risk_vendors = len({finding["vendor"] for finding in findings if finding["type"] == "concentration"})

    result = {
        "filename": file.filename,
        "transaction_count": len(rows),
        "vendor_count": vendors,
        "total_amount": round(exposure, 2),
        "risk_score": risk_score,
        "findings": [{key: value for key, value in finding.items() if key != "impact"} for finding in findings],
        "executive_summary": _summary(risk_score, len(findings), exposure, high_risk_vendors),
        "timeline": [
            {"step": "File uploaded", "detail": f"{file.filename} received", "status": "complete"},
            {"step": "Transactions parsed", "detail": f"{len(rows)} transactions across {vendors} vendors", "status": "complete"},
            {"step": "Risk rules evaluated", "detail": f"{len(findings)} findings identified", "status": "complete"},
            {"step": "Investigation ready", "detail": "Review findings and assign follow-up actions", "status": "complete"},
        ],
    }
    investigation = Investigation(
        filename=result["filename"],
        risk_score=result["risk_score"],
        transaction_count=result["transaction_count"],
        vendor_count=result["vendor_count"],
        total_amount=result["total_amount"],
        executive_summary=result["executive_summary"],
        findings_json=result["findings"],
        timeline_json=result["timeline"],
        created_at=datetime.now(timezone.utc),
    )
    db.add(investigation)
    db.commit()
    db.refresh(investigation)
    return investigation


@router.get("", response_model=list[InvestigationListItem])
def list_investigations(db: Session = Depends(get_db)) -> list[Investigation]:
    return list(db.scalars(select(Investigation).order_by(Investigation.created_at.desc())).all())


@router.get("/{investigation_id}", response_model=InvestigationResponse)
def get_investigation(investigation_id: str, db: Session = Depends(get_db)) -> Investigation:
    investigation = db.get(Investigation, investigation_id)
    if investigation is None:
        raise HTTPException(status_code=404, detail="Investigation not found.")
    return investigation


def _parse_csv(raw: bytes) -> list[dict]:
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise ValueError("CSV must be UTF-8 encoded.") from error

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV must include a header row.")

    headers = {_normalise(header): header for header in reader.fieldnames if header}
    for alias, canonical in COLUMN_ALIASES.items():
        if alias in headers and canonical not in headers:
            headers[canonical] = headers[alias]
    missing = REQUIRED_COLUMNS - headers.keys()
    if missing:
        raise ValueError(f"CSV is missing required columns: {', '.join(sorted(missing))}.")

    rows = []
    for line_number, source in enumerate(reader, start=2):
        vendor = (source.get(headers["vendor"]) or "").strip()
        amount_text = (source.get(headers["amount"]) or "").replace(",", "").replace("$", "").strip()
        if not vendor and not amount_text:
            continue
        try:
            amount = float(amount_text)
        except ValueError as error:
            raise ValueError(f"Invalid amount on CSV row {line_number}.") from error
        if amount < 0:
            raise ValueError(f"Amount cannot be negative on CSV row {line_number}.")
        timestamp = source.get(headers.get("timestamp", ""), "") if "timestamp" in headers else ""
        rows.append({
            "row": line_number,
            "vendor": vendor or "Unknown vendor",
            "amount": amount,
            "invoice_id": (source.get(headers.get("invoice_id", ""), "") if "invoice_id" in headers else "").strip(),
            "timestamp": _parse_timestamp(timestamp),
        })

    if not rows:
        raise ValueError("CSV does not contain any valid transactions.")
    return rows


def _normalise(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.strip().lower()).strip("_")


def _parse_timestamp(value: str) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        for format_string in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(value, format_string)
            except ValueError:
                continue
    return None


def _finding(kind: str, title: str, detail: str, vendor: str, severity: str, impact: int) -> dict:
    return {"type": kind, "title": title, "detail": detail, "vendor": vendor, "severity": severity, "impact": impact}


def _duplicate_invoice_findings(rows: list[dict]) -> list[dict]:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        if row["invoice_id"]:
            grouped[row["invoice_id"].lower()].append(row)
    findings = []
    for invoice, matches in grouped.items():
        if len(matches) > 1:
            findings.append(_finding("duplicate_invoice", "Duplicate invoice detected", f"Invoice {invoice} appears {len(matches)} times for {matches[0]['vendor']}.", matches[0]["vendor"], "high", min(30, 15 + len(matches) * 3)))
    return findings


def _unusual_amount_findings(rows: list[dict]) -> list[dict]:
    amounts = sorted(row["amount"] for row in rows)
    if len(amounts) < 3:
        return []
    median = amounts[len(amounts) // 2]
    findings = []
    for row in rows:
        if median and row["amount"] >= median * 3:
            findings.append(_finding("unusual_amount", "Unusual transaction amount", f"${row['amount']:,.2f} is more than 3x the dataset median of ${median:,.2f}.", row["vendor"], "medium", 12))
    return findings[:10]


def _rapid_payment_findings(rows: list[dict]) -> list[dict]:
    by_vendor: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        if row["timestamp"]:
            by_vendor[row["vendor"]].append(row)
    findings = []
    for vendor, vendor_rows in by_vendor.items():
        vendor_rows.sort(key=lambda row: row["timestamp"])
        for previous, current in zip(vendor_rows, vendor_rows[1:]):
            delta = current["timestamp"] - previous["timestamp"]
            if delta.total_seconds() <= 24 * 60 * 60:
                findings.append(_finding("rapid_payment", "Rapid repeated payment", f"Payments of ${previous['amount']:,.2f} and ${current['amount']:,.2f} occurred within 24 hours.", vendor, "medium", 10))
                break
    return findings


def _concentration_findings(rows: list[dict]) -> list[dict]:
    totals = Counter()
    grand_total = sum(row["amount"] for row in rows)
    for row in rows:
        totals[row["vendor"]] += row["amount"]
    return [
        _finding("concentration", "High vendor concentration risk", f"{vendor} represents {total / grand_total:.0%} of total transaction value.", vendor, "high", 18)
        for vendor, total in totals.items()
        if grand_total and total / grand_total >= 0.4
    ]


def _summary(score: int, finding_count: int, exposure: float, high_risk_vendors: int) -> str:
    posture = "high" if score >= 70 else "moderate" if score >= 35 else "low"
    return f"The investigation identified {finding_count} finding(s) across ${exposure:,.2f} of transactions. Overall risk is {posture} at {score}/100, with {high_risk_vendors} vendor concentration concern(s) requiring review."
