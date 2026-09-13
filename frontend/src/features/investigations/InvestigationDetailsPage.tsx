import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getInvestigation } from "../../services/api";
import type { InvestigationResponse } from "../../services/types";

export function InvestigationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getInvestigation(id).then(setInvestigation).catch((requestError: Error) => setError(requestError.message));
  }, [id]);

  if (error) return <div className="history-state detail-state"><AlertTriangle size={22} /><h2>Investigation unavailable</h2><span>{error}</span><Link className="secondary-action" to="/investigations"><ArrowLeft size={14} /> Back to history</Link></div>;
  if (!investigation) return <div className="history-state detail-state"><div className="loader" />Loading investigation…</div>;

  return <><section className="page-heading feature-heading"><div><p className="eyebrow">Persisted investigation · {formatDate(investigation.created_at)}</p><h1>{investigation.filename}</h1><p className="subheading">Investigation ID {investigation.id}</p></div><Link className="secondary-action" to="/investigations"><ArrowLeft size={14} /> History</Link></section><section className="investigation-results"><div className="investigation-result-grid"><article className="risk-score-card"><div className="score-ring"><strong>{investigation.risk_score}</strong><span>/ 100</span></div><p>Overall risk score</p><small>{investigation.transaction_count} transactions · {investigation.vendor_count} vendors</small></article><article className="feature-panel summary-card"><div className="result-label"><ShieldCheck size={15} /> Executive summary</div><p>{investigation.executive_summary}</p><small>${investigation.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} analyzed transaction value</small></article></div><div className="investigation-result-columns"><section className="feature-panel"><div className="panel-heading"><div><h2>Findings</h2><p>{investigation.findings.length} risk signals identified</p></div></div>{investigation.findings.length ? <div className="findings-table">{investigation.findings.map((finding, index) => <div className="finding-row" key={`${finding.type}-${index}`}><div><strong>{finding.title}</strong><small>{finding.detail}</small></div><span>{finding.vendor}</span><b className={`severity-${finding.severity}`}>{finding.severity}</b></div>)}</div> : <div className="no-findings"><CheckCircle2 size={20} /> No anomalies detected.</div>}</section><section className="feature-panel"><div className="panel-heading"><div><h2>Investigation timeline</h2><p>Analysis steps</p></div></div><div className="investigation-timeline">{investigation.timeline.map((event) => <div className="timeline-event" key={event.step}><span><CheckCircle2 size={14} /></span><div><strong>{event.step}</strong><small>{event.detail}</small></div></div>)}</div></section></div></section></>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
