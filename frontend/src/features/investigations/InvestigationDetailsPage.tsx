import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { generateInvestigationReport, getInvestigation } from "../../services/api";
import type { InvestigationResponse } from "../../services/types";

export function InvestigationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);
  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    getInvestigation(id).then(setInvestigation).catch((requestError: Error) => setError(requestError.message));
  }, [id]);

  const generateReport = async () => {
    if (!id) return;
    setGenerating(true);
    setReportError("");
    try {
      setInvestigation(await generateInvestigationReport(id));
    } catch (requestError) {
      setReportError(requestError instanceof Error ? requestError.message : "Unable to generate AI report.");
    } finally {
      setGenerating(false);
    }
  };

  if (error) return <div className="history-state detail-state"><AlertTriangle size={22} /><h2>Investigation unavailable</h2><span>{error}</span><Link className="secondary-action" to="/investigations"><ArrowLeft size={14} /> Back to history</Link></div>;
  if (!investigation) return <div className="history-state detail-state"><div className="loader" />Loading investigation…</div>;

  return <><section className="page-heading feature-heading"><div><p className="eyebrow">Persisted investigation · {formatDate(investigation.created_at)}</p><h1>{investigation.filename}</h1><p className="subheading">Investigation ID {investigation.id}</p></div><div className="detail-actions"><button className="primary-action" onClick={generateReport} disabled={generating}>{generating ? <><LoaderCircle className="spin-icon" size={14} /> Generating report…</> : <><Sparkles size={14} /> {investigation.ai_report ? "Regenerate AI report" : "Generate AI report"}</>}</button><Link className="secondary-action" to="/investigations"><ArrowLeft size={14} /> History</Link></div></section>{reportError && <div className="form-error report-error"><AlertTriangle size={14} />{reportError}</div>}<section className="investigation-results"><div className="investigation-result-grid"><article className="risk-score-card"><div className="score-ring"><strong>{investigation.risk_score}</strong><span>/ 100</span></div><p>Overall risk score</p><small>{investigation.transaction_count} transactions · {investigation.vendor_count} vendors</small></article><article className="feature-panel summary-card"><div className="result-label"><ShieldCheck size={15} /> Executive summary</div><p>{investigation.executive_summary}</p><small>${investigation.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} analyzed transaction value</small></article></div><ReportSection investigation={investigation} /><div className="investigation-result-columns"><section className="feature-panel"><div className="panel-heading"><div><h2>Findings</h2><p>{investigation.findings.length} risk signals identified</p></div></div>{investigation.findings.length ? <div className="findings-table">{investigation.findings.map((finding, index) => <div className="finding-row" key={`${finding.type}-${index}`}><div><strong>{finding.title}</strong><small>{finding.detail}</small></div><span>{finding.vendor}</span><b className={`severity-${finding.severity}`}>{finding.severity}</b></div>)}</div> : <div className="no-findings"><CheckCircle2 size={20} /> No anomalies detected.</div>}</section><section className="feature-panel"><div className="panel-heading"><div><h2>Investigation timeline</h2><p>Analysis steps</p></div></div><div className="investigation-timeline">{investigation.timeline.map((event) => <div className="timeline-event" key={event.step}><span><CheckCircle2 size={14} /></span><div><strong>{event.step}</strong><small>{event.detail}</small></div></div>)}</div></section></div></section></>;
}

function ReportSection({ investigation }: { investigation: InvestigationResponse }) {
  if (!investigation.ai_report) return <section className="feature-panel report-empty"><FileText size={20} /><div><h2>AI investigation report</h2><p>Generate an evidence-grounded narrative, risk assessment, and recommendations using Qwen via OpenRouter.</p></div></section>;
  return <section className="feature-panel ai-report"><div className="ai-report-heading"><div><div className="result-label"><Sparkles size={15} /> AI investigation report</div><small>Generated {investigation.report_generated_at ? formatDate(investigation.report_generated_at) : "recently"}</small></div><div className="confidence-score"><strong>{investigation.confidence_score ?? 0}%</strong><span>confidence</span></div></div><div className="ai-report-grid"><ReportBlock title="Executive narrative" content={investigation.ai_report.executive_narrative} /><ReportBlock title="Risk assessment" content={investigation.ai_report.risk_assessment} /><ReportBlock title="Business impact" content={investigation.ai_report.business_impact} /><div className="report-block"><h3>Key evidence</h3><ul>{investigation.ai_report.key_evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul></div><div className="report-block recommendations-block"><h3>Recommendations</h3><ol>{investigation.recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ol></div></div></section>;
}

function ReportBlock({ title, content }: { title: string; content: string }) {
  return <div className="report-block"><h3>{title}</h3><p>{content}</p></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
