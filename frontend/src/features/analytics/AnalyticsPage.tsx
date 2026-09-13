import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, BarChart3, CheckCircle2, PieChart as PieChartIcon, ShieldAlert, TrendingUp, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { PageHeader } from "../shared/PageHeader";
import { getAnalyticsCharts, getAnalyticsOverview } from "../../services/api";
import type { AnalyticsCharts, AnalyticsOverview } from "../../services/types";

const chartColors = ["#48d4ce", "#e4aa58", "#e47770", "#9a7ed2", "#67c49f", "#6595d4"];

export function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [charts, setCharts] = useState<AnalyticsCharts | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsOverview(), getAnalyticsCharts()])
      .then(([overviewData, chartData]) => {
        setOverview(overviewData);
        setCharts(chartData);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return <><PageHeader eyebrow="Financial intelligence" title="Risk analytics" description="Monitor investigation trends, vendor exposure, and emerging risk signals." action="Run investigation" actionTo="/investigations/new" />{loading ? <div className="history-state"><div className="loader" />Loading risk analytics…</div> : error ? <div className="history-state"><ShieldAlert size={21} /><strong>Unable to load analytics</strong><span>{error}</span></div> : overview && charts ? <AnalyticsDashboard overview={overview} charts={charts} /> : <div className="history-state"><AlertTriangle size={21} /><strong>No analytics data available</strong><span>Complete an investigation to populate risk monitoring.</span></div>}</>;
}

function AnalyticsDashboard({ overview, charts }: { overview: AnalyticsOverview; charts: AnalyticsCharts }) {
  return <div className="analytics-dashboard"><section className="analytics-kpis"><MetricCard label="Total investigations" value={overview.total_investigations.toString()} icon={<BarChart3 size={17} />} tone="cyan" /><MetricCard label="Average risk score" value={overview.average_risk_score.toFixed(1)} icon={<TrendingUp size={17} />} tone="amber" /><MetricCard label="High risk cases" value={overview.high_risk_count.toString()} icon={<ShieldAlert size={17} />} tone="red" /><MetricCard label="Vendors flagged" value={overview.vendor_count.toString()} icon={<PieChartIcon size={17} />} tone="green" /><MetricCard label="Pending approvals" value={overview.pending_approvals.toString()} icon={<ShieldAlert size={17} />} tone="amber" /><MetricCard label="Approved cases" value={overview.approved_cases.toString()} icon={<CheckCircle2 size={17} />} tone="green" /><MetricCard label="Rejected cases" value={overview.rejected_cases.toString()} icon={<XCircle size={17} />} tone="red" /></section><section className="analytics-chart-grid"><ChartPanel title="Risk trend" subtitle="Investigations and average risk over time" className="risk-trend-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={charts.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="#27313d" vertical={false} /><XAxis dataKey="date" tickFormatter={formatShortDate} axisLine={false} tickLine={false} tick={{ fill: "#708093", fontSize: 10 }} /><YAxis yAxisId="count" axisLine={false} tickLine={false} tick={{ fill: "#708093", fontSize: 10 }} /><YAxis yAxisId="risk" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#708093", fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} labelFormatter={formatDate} /><Legend wrapperStyle={{ fontSize: 10, color: "#81909e" }} /><Line yAxisId="count" type="monotone" dataKey="investigations" name="Investigations" stroke="#48d4ce" strokeWidth={2} dot={{ r: 3, fill: "#48d4ce" }} /><Line yAxisId="risk" type="monotone" dataKey="average_risk" name="Average risk" stroke="#e4aa58" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: "#e4aa58" }} /></LineChart></ResponsiveContainer></ChartPanel><ChartPanel title="Vendor concentration" subtitle="Top vendors by flagged spend" className="vendor-concentration-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.vendor_concentration} dataKey="spend" nameKey="vendor" innerRadius={54} outerRadius={85} paddingAngle={3}>{charts.vendor_concentration.map((vendor, index) => <Cell key={vendor.vendor} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`$${Number(value).toLocaleString()}`, String(name)]} /><Legend wrapperStyle={{ fontSize: 9, color: "#81909e" }} /></PieChart></ResponsiveContainer></ChartPanel><ChartPanel title="Finding categories" subtitle="Signals across persisted investigations" className="finding-categories-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={charts.finding_categories} layout="vertical" margin={{ top: 0, right: 15, left: 20, bottom: 0 }}><CartesianGrid stroke="#27313d" horizontal={false} /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#708093", fontSize: 10 }} /><YAxis type="category" dataKey="category" width={115} axisLine={false} tickLine={false} tick={{ fill: "#a0afbc", fontSize: 9 }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" name="Findings" fill="#48d4ce" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></ChartPanel></section><RecentInvestigations rows={charts.recent_investigations} /></div>;
}

function MetricCard({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return <article className={`kpi-card ${tone}`}><div className="kpi-top"><div className="kpi-icon">{icon}</div><ArrowUpRight size={14} className="metric-arrow" /></div><p>{label}</p><strong>{value}</strong><small>from persisted investigations</small></article>;
}

function ChartPanel({ title, subtitle, className, children }: { title: string; subtitle: string; className: string; children: React.ReactNode }) {
  return <section className={`feature-panel chart-panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div><div className="analytics-chart">{children}</div></section>;
}

function RecentInvestigations({ rows }: { rows: AnalyticsCharts["recent_investigations"] }) {
  return <section className="feature-panel analytics-recent"><div className="panel-heading"><div><h2>Recent investigations</h2><p>Latest persisted analyses</p></div><Link to="/investigations">View history <ArrowUpRight size={14} /></Link></div><div className="history-table"><div className="history-row history-header"><span>File name</span><span>Risk score</span><span>Date</span><span>Status</span><span /></div>{rows.map((row) => <Link className="history-row" to={`/investigations/${row.id}`} key={row.id}><strong>{row.filename}</strong><b className={`table-risk ${riskTone(row.risk_score)}`}>{row.risk_score}</b><span>{formatDate(row.created_at)}</span><span className="status status-open">{row.status}</span><ArrowUpRight size={15} /></Link>)}</div>{rows.length === 0 && <div className="history-state"><span>No completed investigations yet.</span></div>}</section>;
}

const tooltipStyle = { background: "#151d27", border: "1px solid #303d4b", borderRadius: 8, fontSize: 11 };
function riskTone(score: number) { return score >= 75 ? "high" : score >= 50 ? "medium" : "low"; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function formatShortDate(value: string) { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value)); }
