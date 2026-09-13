from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Investigation
from app.db.schemas import (
    ApprovalAction,
    ApprovalResponse,
    CaseAssignmentUpdate,
    CaseListItem,
    CaseNoteCreate,
    CasePriorityUpdate,
    CaseStatusUpdate,
    InvestigationResponse,
)
from app.services.export_service import generate_excel, generate_pdf

router = APIRouter(prefix="/cases", tags=["cases"])


def _case_or_404(case_id: str, db: Session) -> Investigation:
    case = db.get(Investigation, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found.")
    return case


@router.get("", response_model=list[CaseListItem])
def list_cases(db: Session = Depends(get_db)) -> list[Investigation]:
    return list(db.scalars(select(Investigation).order_by(Investigation.last_updated.desc())).all())


@router.get("/{case_id}", response_model=InvestigationResponse)
def get_case(case_id: str, db: Session = Depends(get_db)) -> Investigation:
    return _case_or_404(case_id, db)


@router.patch("/{case_id}/status", response_model=CaseListItem)
def update_case_status(case_id: str, payload: CaseStatusUpdate, db: Session = Depends(get_db)) -> Investigation:
    case = _case_or_404(case_id, db)
    case.status = payload.status
    case.last_updated = datetime.now(timezone.utc)
    db.commit()
    db.refresh(case)
    return case


@router.patch("/{case_id}/priority", response_model=CaseListItem)
def update_case_priority(case_id: str, payload: CasePriorityUpdate, db: Session = Depends(get_db)) -> Investigation:
    case = _case_or_404(case_id, db)
    case.priority = payload.priority
    case.last_updated = datetime.now(timezone.utc)
    db.commit()
    db.refresh(case)
    return case


@router.patch("/{case_id}/assign", response_model=CaseListItem)
def assign_case(case_id: str, payload: CaseAssignmentUpdate, db: Session = Depends(get_db)) -> Investigation:
    case = _case_or_404(case_id, db)
    case.assigned_to = payload.assigned_to.strip() or None
    case.last_updated = datetime.now(timezone.utc)
    db.commit()
    db.refresh(case)
    return case


@router.post("/{case_id}/notes", response_model=InvestigationResponse)
def add_case_note(case_id: str, payload: CaseNoteCreate, db: Session = Depends(get_db)) -> Investigation:
    case = _case_or_404(case_id, db)
    notes = list(case.notes or [])
    notes.append({
        "text": payload.note.strip(),
        "author": "Jeevan S R",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    case.notes = notes
    case.last_updated = datetime.now(timezone.utc)
    db.commit()
    db.refresh(case)
    return case


def _approval_response(case: Investigation) -> ApprovalResponse:
    return ApprovalResponse(
        status=case.approval_status,
        approved_by=case.approved_by,
        approved_at=case.approved_at,
        notes=case.approval_notes,
        history=case.approval_history or [],
    )


@router.get("/{case_id}/approval", response_model=ApprovalResponse)
def get_case_approval(case_id: str, db: Session = Depends(get_db)) -> ApprovalResponse:
    return _approval_response(_case_or_404(case_id, db))


def _apply_approval(case: Investigation, status: str, payload: ApprovalAction) -> ApprovalResponse:
    now = datetime.now(timezone.utc)
    case.approval_status = status
    case.approved_by = payload.approver.strip()
    case.approved_at = now
    case.approval_notes = payload.notes.strip() or None
    history = list(case.approval_history or [])
    history.append({
        "status": status,
        "approver": case.approved_by,
        "notes": case.approval_notes or "",
        "created_at": now.isoformat(),
    })
    case.approval_history = history
    case.last_updated = now
    return _approval_response(case)


@router.post("/{case_id}/approve", response_model=ApprovalResponse)
def approve_case(case_id: str, payload: ApprovalAction, db: Session = Depends(get_db)) -> ApprovalResponse:
    case = _case_or_404(case_id, db)
    result = _apply_approval(case, "Approved", payload)
    db.commit()
    db.refresh(case)
    return result


@router.post("/{case_id}/reject", response_model=ApprovalResponse)
def reject_case(case_id: str, payload: ApprovalAction, db: Session = Depends(get_db)) -> ApprovalResponse:
    case = _case_or_404(case_id, db)
    result = _apply_approval(case, "Rejected", payload)
    db.commit()
    db.refresh(case)
    return result


@router.get("/{case_id}/export/pdf")
def export_case_pdf(case_id: str, db: Session = Depends(get_db)) -> StreamingResponse:
    case = _case_or_404(case_id, db)
    filename = f"helios-fi-case-{case.id}.pdf"
    return StreamingResponse(generate_pdf(case), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.get("/{case_id}/export/excel")
def export_case_excel(case_id: str, db: Session = Depends(get_db)) -> StreamingResponse:
    case = _case_or_404(case_id, db)
    filename = f"helios-fi-case-{case.id}.xlsx"
    return StreamingResponse(generate_excel(case), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
