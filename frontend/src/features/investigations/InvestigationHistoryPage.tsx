import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3, RefreshCw, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../shared/PageHeader";
import { getInvestigations } from "../../services/api";
import type { InvestigationListItem } from "../../services/types";

type SortMode = "newest" | "risk";

export function InvestigationHistoryPage() {
  const [items, setItems] = useState<InvestigationListItem[]>([]);
  const [sort, setSort] = useState<SortMode>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getInvestigations()
      .then((data) => {
        setItems(data);
        setError("");
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  const sorted = [...items].sort((a, b) => sort === "risk" ? b.risk_score - a.risk_score : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return <><PageHeader eyebrow="Investigation workspace" title="Investigation history" description="Review persisted CSV analyses and open a complete investigation record." action="Run investigation" actionTo="/investigations/new" /><section className="feature-panel history-panel"><div className="history-toolbar"><div><h2>Saved investigations</h2><p>{items.length} completed analysis{items.length === 1 ? "" : "es"}</p></div><div className="history-actions"><button className={`sort-button ${sort === "newest" ? "selected" : ""}`} onClick={() => setSort("newest")}>Newest</button><button className={`sort-button ${sort === "risk" ? "selected" : ""}`} onClick={() => setSort("risk")}>Highest risk</button><button className="icon-button" onClick={load} aria-label="Refresh history"><RefreshCw size={15} /></button></div></div>{loading ? <div className="history-state"><div className="loader" />Loading investigation history…</div> : error ? <div className="history-state"><ShieldAlert size={20} /><strong>Unable to load history</strong><span>{error}</span><button className="secondary-action" onClick={load}>Try again</button></div> : sorted.length === 0 ? <div className="history-state"><Clock3 size={20} /><strong>No completed investigations</strong><span>Upload a CSV to create your first persisted investigation.</span></div> : <div className="history-table"><div className="history-row history-header"><span>Investigation ID</span><span>File name</span><span>Risk score</span><span>Created</span><span /></div>{sorted.map((item) => <Link to={`/investigations/${item.id}`} className="history-row" key={item.id}><span className="mono">{item.id.slice(0, 8)}…</span><strong>{item.filename}</strong><b className={`table-risk ${riskTone(item.risk_score)}`}>{item.risk_score}</b><span>{formatDate(item.created_at)}</span><ArrowUpRight size={15} /></Link>)}</div>}</section></>;
}

function riskTone(score: number) {
  return score >= 75 ? "high" : score >= 50 ? "medium" : "low";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
