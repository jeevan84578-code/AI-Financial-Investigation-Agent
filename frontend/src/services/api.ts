import type { AnalyticsCharts, AnalyticsOverview, ApprovalResponse, CaseListItem, CaseResponse, CaseStatus, CasePriority, DashboardResponse, InvestigationListItem, InvestigationResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.");
    }

    throw new ApiError("Unable to connect to the Helios FI API.");
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>("/api/v1/dashboard");
}

export function runInvestigation(file: File): Promise<InvestigationResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return request<InvestigationResponse>("/api/v1/investigations/run", {
    method: "POST",
    body: formData,
  });
}

export function getInvestigations(): Promise<InvestigationListItem[]> {
  return request<InvestigationListItem[]>("/api/v1/investigations");
}

export function getInvestigation(id: string): Promise<InvestigationResponse> {
  return request<InvestigationResponse>(`/api/v1/investigations/${encodeURIComponent(id)}`);
}

export function generateInvestigationReport(id: string): Promise<InvestigationResponse> {
  return request<InvestigationResponse>(`/api/v1/investigations/${encodeURIComponent(id)}/generate-report`, {
    method: "POST",
  });
}

export function getCases(): Promise<CaseListItem[]> {
  return request<CaseListItem[]>("/api/v1/cases");
}

export function getCase(id: string): Promise<CaseResponse> {
  return request<CaseResponse>(`/api/v1/cases/${encodeURIComponent(id)}`);
}

export function updateCaseStatus(id: string, status: CaseStatus): Promise<CaseListItem> {
  return request<CaseListItem>(`/api/v1/cases/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function updateCasePriority(id: string, priority: CasePriority): Promise<CaseListItem> {
  return request<CaseListItem>(`/api/v1/cases/${encodeURIComponent(id)}/priority`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priority }),
  });
}

export function assignCase(id: string, assignedTo: string): Promise<CaseListItem> {
  return request<CaseListItem>(`/api/v1/cases/${encodeURIComponent(id)}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigned_to: assignedTo }),
  });
}

export function addCaseNote(id: string, note: string): Promise<CaseResponse> {
  return request<CaseResponse>(`/api/v1/cases/${encodeURIComponent(id)}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
}

export function getCaseApproval(id: string): Promise<ApprovalResponse> {
  return request<ApprovalResponse>(`/api/v1/cases/${encodeURIComponent(id)}/approval`);
}

export function approveCase(id: string, approver: string, notes: string): Promise<ApprovalResponse> {
  return request<ApprovalResponse>(`/api/v1/cases/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approver, notes }),
  });
}

export function rejectCase(id: string, approver: string, notes: string): Promise<ApprovalResponse> {
  return request<ApprovalResponse>(`/api/v1/cases/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approver, notes }),
  });
}

export async function exportCase(id: string, format: "pdf" | "excel"): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/v1/cases/${encodeURIComponent(id)}/export/${format}`, {
    headers: { Accept: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  });
  if (!response.ok) {
    throw new ApiError(`Export failed with status ${response.status}`, response.status);
  }
  return response.blob();
}

export function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return request<AnalyticsOverview>("/api/v1/analytics/overview");
}

export function getAnalyticsCharts(): Promise<AnalyticsCharts> {
  return request<AnalyticsCharts>("/api/v1/analytics/charts");
}
