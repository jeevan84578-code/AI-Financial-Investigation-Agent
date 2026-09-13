import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Download, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../shared/PageHeader";
import { addCaseNote, approveCase, assignCase, exportCase, getCase, getCases, rejectCase, updateCasePriority, updateCaseStatus } from "../../services/api";
import type { ApprovalStatus, CaseListItem, CasePriority, CaseResponse, CaseStatus } from "../../services/types";

const statuses: CaseStatus[] = ["Open", "Under Review", "Escalated", "Closed"];
const priorities: CasePriority[] = ["Low", "Medium", "High", "Critical"];

export function CaseManagementPage() {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selected, setSelected] = useState<CaseResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCases = () => {
    setLoading(true);
    getCases().then(setCases).catch((requestError: Error) => setError(requestError.message)).finally(() => setLoading(false));
  };
  useEffect(loadCases, []);

  const filteredCases = useMemo(() => cases.filter((item) =>
    (!statusFilter || item.status === statusFilter) &&
    (!priorityFilter || item.priority === priorityFilter) &&
    item.filename.toLowerCase().includes(search.toLowerCase())
  ), [cases, priorityFilter, search, statusFilter]);

  const openCase = async (id: string) => {
    try {
      setSelected(await getCase(id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load case.");
    }
  };

  const updateStatus = async (status: CaseStatus) => {
    if (!selected) return;
    const updated = await updateCaseStatus(selected.id, status);
    setSelected({ ...selected, ...updated });
    setCases((current) => current.map((item) => item.id === updated.id ? updated : item));
  };
  const updatePriority = async (priority: CasePriority) => {
    if (!selected) return;
    const updated = await updateCasePriority(selected.id, priority);
    setSelected({ ...selected, ...updated });
    setCases((current) => current.map((item) => item.id === updated.id ? updated : item));
  };
  const updateAssignment = async (assignedTo: string) => {
    if (!selected) return;
    const updated = await assignCase(selected.id, assignedTo);
    setSelected({ ...selected, ...updated });
    setCases((current) => current.map((item) => item.id === updated.id ? updated : item));
  };
  const addNote = async (note: string) => {
    if (!selected || !note.trim()) return;
    setSelected(await addCaseNote(selected.id, note));
  };
  const updateApproval = async (status: "Approved" | "Rejected", approver: string, notes: string) => {
    if (!selected) return;
    const approval = status === "Approved" ? await approveCase(selected.id, approver, notes) : await rejectCase(selected.id, approver, notes);
    setSelected({ ...selected, approval_status: approval.status, approved_by: approval.approved_by, approved_at: approval.approved_at, approval_notes: approval.notes, approval_history: approval.history });
    setCases((current) => current.map((item) => item.id === selected.id ? { ...item, approval_status: approval.status } : item));
  };

  return <><PageHeader eyebrow="Case management" title="Investigation cases" description="Assign ownership, prioritize risk, and keep every investigation moving." action="Run investigation" actionTo="/investigations/new" /><section className="feature-panel case-management-panel"><div className="case-filters"><div className="search-field"><Search size={15} /><input aria-label="Search filename" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by filename" /></div><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="">All priorities</option>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></div>{error && <p className="form-error"><AlertTriangle size={14} />{error}</p>}{loading ? <div className="history-state"><div className="loader" />Loading cases…</div> : filteredCases.length === 0 ? <div className="history-state"><CheckCircle2 size={20} /><strong>No matching cases</strong><span>Try changing the filters or upload a new investigation.</span></div> : <div className="case-management-table"><div className="case-management-row case-management-header"><span>Case ID</span><span>File name</span><span>Risk score</span><span>Status</span><span>Priority</span><span>Approval</span><span>Assigned to</span><span>Last updated</span><span /></div>{filteredCases.map((item) => <button className="case-management-row" key={item.id} onClick={() => openCase(item.id)}><span className="mono">{item.id.slice(0, 8)}…</span><strong>{item.filename}</strong><b className={`table-risk ${riskTone(item.risk_score)}`}>{item.risk_score}</b><span className={`case-badge status-${slug(item.status)}`}>{item.status}</span><span className={`case-badge priority-${slug(item.priority)}`}>{item.priority}</span><span className={`approval-badge approval-${slug(item.approval_status)}`}>{item.approval_status}</span><span>{item.assigned_to || "Unassigned"}</span><span>{formatDate(item.last_updated)}</span><ArrowUpRight size={15} /></button>)}</div>}</section>{selected && <CaseDrawer caseData={selected} onClose={() => setSelected(null)} onStatus={updateStatus} onPriority={updatePriority} onAssign={updateAssignment} onNote={addNote} onApproval={updateApproval} />}</>;
}

function CaseDrawer({ caseData, onClose, onStatus, onPriority, onAssign, onNote, onApproval }: { caseData: CaseResponse; onClose: () => void; onStatus: (value: CaseStatus) => Promise<void>; onPriority: (value: CasePriority) => Promise<void>; onAssign: (value: string) => Promise<void>; onNote: (value: string) => Promise<void>; onApproval: (status: "Approved" | "Rejected", approver: string, notes: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState(caseData.assigned_to || "");
  const [approver, setApprover] = useState(caseData.approved_by || "");
  const [approvalNotes, setApprovalNotes] = useState(caseData.approval_notes || "");
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const submitApproval = async (status: "Approved" | "Rejected") => { setApprovalBusy(true); try { await onApproval(status, approver, approvalNotes); } finally { setApprovalBusy(false); } };
  const downloadExport = async (format: "pdf" | "excel") => { setExporting(format); try { const blob = await exportCase(caseData.id, format); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `helios-fi-case-${caseData.id}.${format === "pdf" ? "pdf" : "xlsx"}`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); } finally { setExporting(null); } };
  return <aside className="case-drawer"><div className="case-drawer-head"><div><p className="eyebrow">Case detail</p><h2>{caseData.filename}</h2><span className="mono">{caseData.id}</span></div><button className="icon-button" onClick={onClose} aria-label="Close case detail"><X size={18} /></button></div><div className="case-export-actions"><button className="secondary-action" disabled={exporting !== null} onClick={() => void downloadExport("pdf")}><Download size={13} />{exporting === "pdf" ? "Exporting…" : "Export PDF"}</button><button className="secondary-action" disabled={exporting !== null} onClick={() => void downloadExport("excel")}><Download size={13} />{exporting === "excel" ? "Exporting…" : "Export Excel"}</button></div><div className="case-drawer-controls"><label>Status<select value={caseData.status} onChange={(event) => onStatus(event.target.value as CaseStatus)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label><label>Priority<select value={caseData.priority} onChange={(event) => onPriority(event.target.value as CasePriority)}>{priorities.map((value) => <option key={value}>{value}</option>)}</select></label><label>Assign investigator<div className="assignment-control"><input value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Investigator name" /><button className="secondary-action" onClick={() => onAssign(assignee)}>Save</button></div></label></div><ApprovalPanel status={caseData.approval_status} approver={approver} notes={approvalNotes} history={caseData.approval_history} onApprover={setApprover} onNotes={setApprovalNotes} onApprove={() => submitApproval("Approved")} onReject={() => submitApproval("Rejected")} busy={approvalBusy} /><DrawerSection title="Executive summary"><p>{caseData.executive_summary}</p></DrawerSection><DrawerSection title="Findings"><div className="drawer-findings">{caseData.findings.map((finding, index) => <div key={`${finding.type}-${index}`}><strong>{finding.title}</strong><small>{finding.detail}</small></div>)}</div></DrawerSection><DrawerSection title="AI report">{caseData.ai_report ? <><p>{caseData.ai_report.executive_narrative}</p><small className="drawer-confidence">Confidence: {caseData.confidence_score ?? 0}%</small></> : <p className="muted">No AI report generated yet. <Link to={`/investigations/${caseData.id}`}>Open full details</Link></p>}</DrawerSection><DrawerSection title="Timeline"><div className="drawer-timeline">{caseData.timeline.map((event) => <span key={event.step}><CheckCircle2 size={13} />{event.step}</span>)}</div></DrawerSection><DrawerSection title={`Notes (${caseData.notes.length})`}><div className="notes-history">{caseData.notes.map((item, index) => <div key={`${item.created_at}-${index}`}><p>{item.text}</p><small>{item.author} · {formatDate(item.created_at)}</small></div>)}</div><div className="note-composer"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a case note…" /><button className="primary-action" onClick={() => { void onNote(note); setNote(""); }}>Add note</button></div></DrawerSection></aside>;
}

function ApprovalPanel({ status, approver, notes, history, onApprover, onNotes, onApprove, onReject, busy }: { status: ApprovalStatus; approver: string; notes: string; history: CaseResponse["approval_history"]; onApprover: (value: string) => void; onNotes: (value: string) => void; onApprove: () => Promise<void>; onReject: () => Promise<void>; busy: boolean }) {
  return <section className="approval-panel"><div className="approval-panel-heading"><div><p className="eyebrow">Finance approval</p><h3>Approval workflow</h3></div><span className={`approval-badge approval-${slug(status)}`}>{status}</span></div><div className="approval-meta"><span>Approver <strong>{approver || "Not assigned"}</strong></span><span>Date <strong>{history.length ? formatDate(history[history.length - 1].created_at) : "Awaiting action"}</strong></span></div><input value={approver} onChange={(event) => onApprover(event.target.value)} placeholder="Approver name" /><textarea value={notes} onChange={(event) => onNotes(event.target.value)} placeholder="Approval notes" /><div className="approval-actions"><button className="primary-action" disabled={busy || !approver.trim()} onClick={() => void onApprove()}>Approve</button><button className="danger-action" disabled={busy || !approver.trim()} onClick={() => void onReject()}>Reject</button></div>{history.length > 0 && <div className="approval-timeline">{history.map((entry, index) => <div key={`${entry.created_at}-${index}`}><span className={`approval-dot approval-${slug(entry.status)}`} /><div><strong>{entry.status}</strong><small>{entry.approver} · {formatDate(entry.created_at)}</small>{entry.notes && <p>{entry.notes}</p>}</div></div>)}</div>}</section>;
}

function DrawerSection({ title, children }: { title: string; children: ReactNode }) { return <section className="drawer-section"><h3>{title}</h3>{children}</section>; }
function slug(value: string) { return value.toLowerCase().replace(/\s+/g, "-"); }
function riskTone(score: number) { return score >= 75 ? "high" : score >= 50 ? "medium" : "low"; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
