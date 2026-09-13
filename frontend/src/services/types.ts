export type TrendDirection = "up" | "down";
export type RiskTone = "cyan" | "amber" | "red" | "green";

export interface DashboardKpi {
  label: string;
  value: string;
  change: string;
  trend: TrendDirection;
  tone: RiskTone;
  icon: "case" | "exposure" | "vendor" | "recovered";
}

export interface ExposurePoint {
  month: string;
  exposure: number;
  investigations: number;
}

export interface VendorRisk {
  name: string;
  category: string;
  score: number;
  exposure: string;
}

export interface InvestigationCase {
  id: string;
  title: string;
  vendor: string;
  risk: number;
  status: string;
  time: string;
}

export interface CfoSummary {
  headline: string;
  body: string;
  actions: number;
  confidence: number;
}

export interface DashboardResponse {
  period: string;
  updated_at: string;
  kpis: DashboardKpi[];
  exposure_series: ExposurePoint[];
  vendor_heatmap: VendorRisk[];
  cases: InvestigationCase[];
  cfo_summary: CfoSummary;
}

export interface InvestigationFinding {
  type: "duplicate_invoice" | "unusual_amount" | "rapid_payment" | "concentration";
  title: string;
  detail: string;
  vendor: string;
  severity: "high" | "medium" | "low";
}

export interface InvestigationTimelineEvent {
  step: string;
  detail: string;
  status: "complete" | "in_progress";
}

export interface InvestigationResponse {
  id: string;
  filename: string;
  created_at: string;
  transaction_count: number;
  vendor_count: number;
  total_amount: number;
  risk_score: number;
  findings: InvestigationFinding[];
  executive_summary: string;
  timeline: InvestigationTimelineEvent[];
}

export interface InvestigationListItem {
  id: string;
  filename: string;
  risk_score: number;
  created_at: string;
}

export interface AnalyticsOverview {
  total_investigations: number;
  average_risk_score: number;
  high_risk_count: number;
  vendor_count: number;
}

export interface RiskTrendPoint {
  date: string;
  investigations: number;
  average_risk: number;
}

export interface VendorConcentrationPoint {
  vendor: string;
  spend: number;
}

export interface FindingCategoryPoint {
  category: string;
  count: number;
}

export interface RecentInvestigation {
  id: string;
  filename: string;
  risk_score: number;
  created_at: string;
  status: string;
}

export interface AnalyticsCharts {
  trend: RiskTrendPoint[];
  vendor_concentration: VendorConcentrationPoint[];
  finding_categories: FindingCategoryPoint[];
  recent_investigations: RecentInvestigation[];
}
