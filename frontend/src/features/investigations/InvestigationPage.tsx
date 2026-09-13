import { useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { AlertTriangle, CheckCircle2, FileUp, ShieldCheck, UploadCloud } from "lucide-react";
import { PageHeader } from "../shared/PageHeader";
import { runInvestigation } from "../../services/api";
import type { InvestigationResponse } from "../../services/types";

export function InvestigationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<InvestigationResponse | null>(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const selectFile = (candidate: File | undefined) => {
    setError("");
    if (!candidate) return;
    if (!candidate.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are supported.");
      return;
    }
    setFile(candidate);
    setResult(null);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => selectFile(event.target.files?.[0]);
  const analyze = async () => {
    if (!file) {
      setError("Choose a CSV file before starting the investigation.");
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      setResult(await runInvestigation(file));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Investigation failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  return <><PageHeader eyebrow="Financial investigation workspace" title="Run an investigation" description="Upload transaction data and let Helios identify financial risk signals." action="View case queue" actionTo="/cases" /><section className="investigation-upload feature-panel"><label className="upload-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}><input type="file" accept=".csv,text/csv" onChange={onFileChange} /><UploadCloud size={27} /><strong>{file ? file.name : "Drop a transaction CSV here"}</strong><span>{file ? `${(file.size / 1024).toFixed(1)} KB selected` : "or click to browse · UTF-8 CSV up to 10 MB"}</span></label>{error && <p className="form-error"><AlertTriangle size={14} />{error}</p>}<div className="investigation-controls"><span><FileUp size={15} /> Expected columns: vendor, amount, invoice_id, timestamp</span><button className="primary-action" onClick={analyze} disabled={analyzing}>{analyzing ? "Analyzing…" : "Analyze transactions"}</button></div></section>{result && <InvestigationResults result={result} />}</>;
}

function InvestigationResults({ result }: { result: InvestigationResponse }) {
  return <section className="investigation-results"><div className="investigation-result-grid"><article className="risk-score-card"><div className="score-ring"><strong>{result.risk_score}</strong><span>/ 100</span></div><p>Overall risk score</p><small>{result.transaction_count} transactions · {result.vendor_count} vendors</small></article><article className="feature-panel summary-card"><div className="result-label"><ShieldCheck size={15} /> Executive summary</div><p>{result.executive_summary}</p><small>${result.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} analyzed transaction value</small></article></div><div className="investigation-result-columns"><section className="feature-panel"><div className="panel-heading"><div><h2>Findings</h2><p>{result.findings.length} risk signals identified</p></div></div>{result.findings.length ? <div className="findings-table"><div className="finding-header"><span>Signal</span><span>Vendor</span><span>Severity</span></div>{result.findings.map((finding, index) => <div className="finding-row" key={`${finding.type}-${index}`}><div><strong>{finding.title}</strong><small>{finding.detail}</small></div><span>{finding.vendor}</span><b className={`severity-${finding.severity}`}>{finding.severity}</b></div>)}</div> : <div className="no-findings"><CheckCircle2 size={20} /> No anomalies detected.</div>}</section><section className="feature-panel"><div className="panel-heading"><div><h2>Investigation timeline</h2><p>Analysis steps</p></div></div><div className="investigation-timeline">{result.timeline.map((event) => <div className="timeline-event" key={event.step}><span><CheckCircle2 size={14} /></span><div><strong>{event.step}</strong><small>{event.detail}</small></div></div>)}</div></section></div></section>;
}
