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

