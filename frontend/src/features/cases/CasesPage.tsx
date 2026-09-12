import { ArrowUpRight, Filter, Search } from "lucide-react";
import { PageHeader } from "../shared/PageHeader";

const cases = [
  ["INV-2048", "Duplicate invoices across regional entities", "Apex Logistics", "84", "Investigating", "12 min ago"],
  ["INV-2045", "Unusual payment velocity detected", "Cobalt Systems", "77", "Review", "38 min ago"],
  ["INV-2041", "Vendor bank account changed before payout", "Northstar Supplies", "68", "Open", "1 hr ago"],
  ["INV-2038", "Round-dollar payments outside policy", "Vertex Consulting", "52", "Open", "3 hrs ago"],
  ["INV-2032", "Inactive vendor received new purchase order", "Bluebird Media", "41", "Review", "Yesterday"],
];

export function CasesPage() {
  return <><PageHeader eyebrow="Investigation workspace" title="Investigation queue" description="Triage anomalies, assign owners, and follow the highest-risk signals." action="+ New investigation" /><section className="feature-panel"><div className="toolbar"><div className="search-field"><Search size={15} /><input placeholder="Search cases" /></div><button className="secondary-action"><Filter size={14} /> Filters</button></div><div className="table-wrap"><table><thead><tr><th>Case</th><th>Investigation</th><th>Vendor</th><th>Risk</th><th>Status</th><th>Updated</th><th /></tr></thead><tbody>{cases.map(([id, title, vendor, risk, status, time]) => <tr key={id}><td className="mono">{id}</td><td><strong>{title}</strong></td><td>{vendor}</td><td><span className={`table-risk ${Number(risk) >= 75 ? "high" : Number(risk) >= 50 ? "medium" : "low"}`}>{risk}</span></td><td><span className={`status status-${status.toLowerCase()}`}>{status}</span></td><td>{time}</td><td><ArrowUpRight size={15} /></td></tr>)}</tbody></table></div></section></>;
}
