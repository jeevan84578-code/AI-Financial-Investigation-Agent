import { PageHeader } from "../shared/PageHeader";

const vendors = [["Apex Logistics", "Logistics", 84, "$420K"], ["Cobalt Systems", "Technology", 77, "$312K"], ["Northstar Supplies", "Materials", 68, "$286K"], ["Vertex Consulting", "Professional services", 52, "$174K"], ["Bluebird Media", "Marketing", 41, "$98K"], ["Greenline Energy", "Utilities", 29, "$86K"]];
const tone = (score: number) => score >= 75 ? "high" : score >= 50 ? "medium" : "low";

export function VendorsPage() {
  return <><PageHeader eyebrow="Counterparty intelligence" title="Vendor risk" description="Monitor exposure concentration and investigate counterparties with unusual activity." action="Export vendor data" /><div className="feature-columns"><section className="feature-panel"><div className="panel-heading"><div><h2>Risk heatmap</h2><p>Risk score by vendor exposure</p></div></div><div className="vendor-heatmap">{vendors.map(([name, category, score, exposure]) => <div className={`heatmap-tile ${tone(Number(score))}`} key={name}><span>{category}</span><strong>{name}</strong><b>{score}</b><small>{exposure} exposure</small></div>)}</div></section><section className="feature-panel"><div className="panel-heading"><div><h2>Vendor directory</h2><p>All monitored counterparties</p></div></div><div className="directory-list">{vendors.map(([name, category, score, exposure]) => <div className="directory-row" key={name}><span className={`risk-dot ${tone(Number(score))}`} /><div><strong>{name}</strong><small>{category}</small></div><b>{exposure}</b><em>{score}</em></div>)}</div></section></div></>;
}
