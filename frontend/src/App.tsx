import { useEffect, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CasesPage } from "./features/cases/CasesPage";
import { VendorsPage } from "./features/vendors/VendorsPage";
import { ReportsPage } from "./features/reports/ReportsPage";
import { ChatPage } from "./features/chat/ChatPage";

type DashboardData = {
  period: string;
  kpis: { label: string; value: string; change: string; trend: "up" | "down"; tone: string; icon: string }[];
  exposure_series: { month: string; exposure: number; investigations: number }[];
  vendor_heatmap: { name: string; category: string; score: number; exposure: string }[];
  cases: { id: string; title: string; vendor: string; risk: number; status: string; time: string }[];
  cfo_summary: { headline: string; body: string; actions: number; confidence: number };
};

const iconMap = { case: BriefcaseBusiness, exposure: TrendingUp, vendor: ShieldAlert, recovered: FileCheck2 };

export function App() {
  return <BrowserRouter><AppShell /></BrowserRouter>;
}

function AppShell() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/dashboard")
      .then((response) => {
        if (!response.ok) throw new Error("Dashboard unavailable");
        return response.json() as Promise<DashboardData>;
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const location = useLocation();
  const pageNames: Record<string, string> = { "/": "Command center", "/cases": "Investigations", "/vendors": "Vendors", "/reports": "Reports", "/chat": "AI investigator" };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={17} /></div>
          <div><strong>helios</strong><span>FI</span></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="workspace-switcher"><div className="workspace-icon">A</div><div><strong>Acme Corporation</strong><span>Finance workspace</span></div><ChevronDown size={15} /></div>
        <nav>
          <p className="nav-label">Workspace</p>
          <NavItem to="/" icon={<LayoutDashboard size={17} />} label="Command center" />
          <NavItem to="/cases" icon={<BriefcaseBusiness size={17} />} label="Investigations" count="24" />
          <NavItem to="/vendors" icon={<Users size={17} />} label="Vendors" />
          <NavItem to="/chat" icon={<MessageSquare size={17} />} label="AI investigator" />
          <NavItem to="/reports" icon={<FileCheck2 size={17} />} label="Reports" />
          <p className="nav-label nav-label-spaced">Manage</p>
          <NavItem icon={<Settings size={17} />} label="Settings" />
          <NavItem icon={<CircleHelp size={17} />} label="Help center" />
        </nav>
        <div className="sidebar-footer"><div className="avatar">JS</div><div><strong>Jeevan S R</strong><span>Administrator</span></div><ChevronDown size={15} /></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{pageNames[location.pathname] ?? "Command center"}</strong></div>
          <div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">JS</div></div>
        </header>

        <div className="content">
          <section className="page-heading"><div><p className="eyebrow">Monday, June 30, 2025</p><h1>Good morning, Jeevan <span>✦</span></h1><p className="subheading">Here’s what needs your attention today.</p></div><button className="period-selector">{data?.period ?? "Q2 2025"} <ChevronDown size={15} /></button></section>
          <Routes>
            <Route path="/" element={loading ? <LoadingState /> : data ? <Dashboard data={data} /> : <ErrorState />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, count }: { to: string; icon: React.ReactNode; label: string; count?: string }) {
  return <NavLink end={to === "/"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={to}><span>{icon}</span>{label}{count && <em>{count}</em>}</NavLink>;
}

function Dashboard({ data }: { data: DashboardData }) {
  return <div className="dashboard-grid">
    <section className="kpi-grid">{data.kpis.map((kpi) => { const Icon = iconMap[kpi.icon as keyof typeof iconMap]; return <article className={`kpi-card ${kpi.tone}`} key={kpi.label}><div className="kpi-top"><div className="kpi-icon"><Icon size={18} /></div><span className={`trend ${kpi.trend}`}>{kpi.trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{kpi.change}</span></div><p>{kpi.label}</p><strong>{kpi.value}</strong><small>vs. previous quarter</small></article>; })}</section>
    <section className="panel exposure-panel"><PanelHeading title="Risk exposure" detail="Total exposure by month" action="View analytics" /><div className="chart-legend"><span><i className="legend-cyan" /> Exposure ($M)</span><span><i className="legend-line" /> Investigations</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.exposure_series} margin={{ top: 15, right: 12, left: -20, bottom: 0 }}><defs><linearGradient id="exposureFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38d5d0" stopOpacity={0.26} /><stop offset="100%" stopColor="#38d5d0" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#27313d" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#708093", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#708093", fontSize: 11 }} tickFormatter={(value) => `$${value}M`} /><Tooltip contentStyle={{ background: "#151d27", border: "1px solid #303d4b", borderRadius: 8, fontSize: 12 }} formatter={(value, name) => [name === "exposure" ? `$${value}M` : value, name === "exposure" ? "Exposure" : "Investigations"]} /><Area type="monotone" dataKey="exposure" stroke="#42d6d0" strokeWidth={2} fill="url(#exposureFill)" /><Area type="monotone" dataKey="investigations" stroke="#e5a954" strokeWidth={1.5} strokeDasharray="4 4" fill="none" /></AreaChart></ResponsiveContainer></div></section>
    <section className="panel cfo-panel"><PanelHeading title="CFO brief" detail="AI-generated summary" action="Open brief" /><div className="cfo-badge"><Sparkles size={15} /> Executive signal</div><h2>{data.cfo_summary.headline}</h2><p>{data.cfo_summary.body}</p><div className="cfo-footer"><div><strong>{data.cfo_summary.actions}</strong><span>actions need review</span></div><div><strong>{data.cfo_summary.confidence}%</strong><span>confidence</span></div></div></section>
    <section className="panel vendors-panel"><PanelHeading title="Vendor risk heatmap" detail="Highest exposure counterparties" action="View all vendors" /><div className="vendor-list">{data.vendor_heatmap.map((vendor) => <div className="vendor-row" key={vendor.name}><div className="vendor-name"><span className={`risk-dot ${riskTone(vendor.score)}`} /><div><strong>{vendor.name}</strong><small>{vendor.category}</small></div></div><div className="vendor-score"><div className="score-track"><span className={riskTone(vendor.score)} style={{ width: `${vendor.score}%` }} /></div><b>{vendor.score}</b></div><span className="vendor-exposure">{vendor.exposure}</span></div>)}</div></section>
    <section className="panel cases-panel"><PanelHeading title="Live investigations" detail="Cases requiring attention" action="View case queue" /><div className="case-list">{data.cases.map((item) => <div className="case-row" key={item.id}><div className="case-risk"><strong>{item.risk}</strong><span>risk</span></div><div className="case-copy"><span>{item.id} · {item.time}</span><strong>{item.title}</strong><small>{item.vendor}</small></div><span className={`status status-${item.status.toLowerCase()}`}>{item.status}</span></div>)}</div></section>
  </div>;
}

function PanelHeading({ title, detail, action }: { title: string; detail: string; action: string }) { return <div className="panel-heading"><div><h2>{title}</h2><p>{detail}</p></div><a href="#">{action} <ArrowUpRight size={14} /></a></div>; }
function riskTone(score: number) { return score >= 75 ? "high" : score >= 50 ? "medium" : "low"; }
function LoadingState() { return <div className="loading-state"><div className="loader" />Loading command center…</div>; }
function ErrorState() { return <div className="error-state"><ShieldAlert size={24} /><h2>Dashboard unavailable</h2><p>Start the FastAPI service and refresh this page.</p></div>; }
