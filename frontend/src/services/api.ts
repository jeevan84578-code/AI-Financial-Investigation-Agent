import type { AnalyticsCharts, AnalyticsOverview, DashboardResponse, InvestigationListItem, InvestigationResponse } from "./types";

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

export function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return request<AnalyticsOverview>("/api/v1/analytics/overview");
}

export function getAnalyticsCharts(): Promise<AnalyticsCharts> {
  return request<AnalyticsCharts>("/api/v1/analytics/charts");
}
