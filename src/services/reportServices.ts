import type {
  Report,
  InitialReport,
  InitializeAggregatedReport,
  AggregatedReport,
} from "@src/types";
import { apiProxyUrl } from "@src/utils/client/urls";

/**
 * Client-safe functions that use the API proxy
 * These can be called from both client and server components
 */

// GET operations
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
    const report: { id: string } = await response.json();
    return report.id;
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
    const report: { id: string } = await response.json();
    return report.id;
  } else {
    console.log("Failed to create aggregated report", response.status);
    throw new Error("Failed to create aggregated report");
  }
};

// UPDATE operations

// Serializes PATCH calls per report so a new update always waits for the
// previous one to settle, instead of firing concurrently and racing the
// backend (which can reject overlapping writes to the same report).
const pendingUpdates = new Map<string, Promise<void>>();

const serializeReportUpdate = (id: string, run: () => Promise<void>) => {
  const previous = pendingUpdates.get(id) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(run);
  pendingUpdates.set(id, next);
  return next;
};

export const updateReport = (id: string, updates: Partial<Report>) => {
  return serializeReportUpdate(id, async () => {
    const response = await fetch(`${apiProxyUrl}/reports/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      credentials: "include",
    });
    if (response.ok) {
      console.log("Report updated", response.status);
    } else {
      console.log("Failed to update report-", response.status);
      throw new Error("Failed to update report");
    }
  });
};

export const updateAggregatedReport = (
  id: string,
  updates: Partial<AggregatedReport>,
) => {
  return serializeReportUpdate(id, async () => {
    const response = await fetch(
      `${apiProxyUrl}/admin/reports/aggregated/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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
  });
};

// ARCHIVE operations
export const archiveReport = async (id: string, reason?: string) => {
  const response = await fetch(`${apiProxyUrl}/reports/${id}/archive`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({ reason: reason?.trim() || null }),
    credentials: "include",
  });

  if (!response.ok) {
    console.log("Failed to archive report", response.status);
    throw new Error("Failed to archive report");
  }
};

export const unarchiveReport = async (id: string) => {
  const response = await fetch(`${apiProxyUrl}/reports/${id}/archive`, {
    headers: { "Content-Type": "application/json" },
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    console.log("Failed to restore report", response.status);
    throw new Error("Failed to restore report");
  }
};

// DELETE operations (admin only, permanent)
export const deleteReport = async (id: string) => {
  const response = await fetch(`${apiProxyUrl}/admin/reports/${id}`, {
    headers: { "Content-Type": "application/json" },
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    console.log("Failed to delete report", response.status);
    throw new Error("Failed to delete report");
  }
};
