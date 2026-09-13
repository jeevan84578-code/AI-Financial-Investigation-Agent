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
  ai_report: AiReport | null;
  recommendations: string[];
  confidence_score: number | null;
  report_generated_at: string | null;
}

export type CaseStatus = "Open" | "Under Review" | "Escalated" | "Closed";
export type CasePriority = "Low" | "Medium" | "High" | "Critical";
export type ApprovalStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

export interface ApprovalHistoryEntry {
  status: ApprovalStatus;
  approver: string;
  notes: string;
  created_at: string;
}

export interface ApprovalResponse {
  status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  history: ApprovalHistoryEntry[];
}

export interface CaseListItem {
  id: string;
  filename: string;
  risk_score: number;
  status: CaseStatus;
  priority: CasePriority;
  assigned_to: string | null;
  last_updated: string;
  approval_status: ApprovalStatus;
}

export interface CaseNote {
  text: string;
  author: string;
  created_at: string;
}

export interface CaseResponse extends InvestigationResponse {
  status: CaseStatus;
  priority: CasePriority;
  assigned_to: string | null;
  notes: CaseNote[];
  last_updated: string;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  approval_history: ApprovalHistoryEntry[];
}

export interface AiReport {
  executive_narrative: string;
  risk_assessment: string;
  key_evidence: string[];
  business_impact: string;
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
  pending_approvals: number;
  approved_cases: number;
  rejected_cases: number;
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
