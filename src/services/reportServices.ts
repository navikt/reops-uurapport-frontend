import type {
  Report,
  ReportSummary,
  InitialReport,
  InitializeAggregatedReport,
  AggregatedReport,
} from "@src/types";
import { apiProxyUrl } from "@src/utils/client/urls";
import { apiUrl } from "@src/utils/server/urls";
import { getOboToken } from "@src/utils/server/getOboToken";
import { getAuthToken } from "@src/utils/server/getAuthToken";

// GET operations
export const getReports = async (): Promise<ReportSummary[]> => {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const response = await fetch(`${apiUrl}/api/reports`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${oboToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.status}`);
  }

  return response.json();
};

export const getReport = async (url: string): Promise<Report> => {
  const response = await fetch(`${apiProxyUrl}${url}`, {
    method: "GET",
    credentials: "include",
  });

  if (response.ok) {
    const report = await response.json();
    return report;
  } else {
    console.log("Failed to fetch report", response.status);
    throw new Error("Failed to fetch report");
  }
};

// CREATE operations
export const createReport = async (initReport: InitialReport) => {
  const response = await fetch(`${apiProxyUrl}/reports/new`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(initReport),
    credentials: "include",
  });

  if (response.ok) {
    const report = await response.json();
    console.log("Report created", report, response.status);
    window.location.href = `/reports/${report.id}`;
  } else {
    console.log("Failed to create report", response.status);
    throw new Error("Failed to create report");
  }
};

export const createAggregatedReport = async (
  aggregatedReport: InitializeAggregatedReport,
) => {
  const response = await fetch(`${apiProxyUrl}/admin/reports/aggregated/new`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(aggregatedReport),
    credentials: "include",
  });

  if (response.ok) {
    const report = await response.json();
    console.log("Aggregated report created", report, response.status);
    window.location.href = `/reports/aggregated/${report.id}`;
  } else {
    console.log("Failed to create aggregated report", response.status);
    throw new Error("Failed to create aggregated report");
  }
};

// UPDATE operations
export const updateReport = async (id: string, updates: Partial<Report>) => {
  const response = await fetch(`${apiProxyUrl}/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
    credentials: "include",
  });
  if (response.ok) {
    console.log("Report updated", response.status);
  } else {
    console.log("Failed to update report-", response.status);
    throw new Error("Failed to update report");
  }
};

export const updateAggregatedReport = async (
  id: string,
  updates: Partial<AggregatedReport>,
) => {
  const response = await fetch(
    `${apiProxyUrl}/admin/reports/aggregated/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
      credentials: "include",
    },
  );
  if (response.ok) {
    console.log("Report updated", response.status);
  } else {
    console.log("Failed to update report-", response.status);
    throw new Error("Failed to update report");
  }
};

// DELETE operations
export const deleteReport = async (id: string) => {
  const response = await fetch(
    `${apiProxyUrl}/admin/reports/aggregated/${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    },
  );

  if (response.ok) {
    window.location.href = "/reports";
  } else {
    console.log("Failed to delete report", response.status);
    throw new Error("Failed to delete report");
  }
};
