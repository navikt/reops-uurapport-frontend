"use client";

import useSWR from "swr";
import type { Report, ReportSummary } from "@src/types";
import { fetcher } from "@src/utils/client/api";
import { apiProxyUrl } from "@src/utils/client/urls";
import { summarizeStatus, type StatusResult } from "./ReportStatus";

type StatusRequest = { reports: { id: string; url: string }[] };

export async function loadReportStatuses({
  reports,
}: StatusRequest): Promise<Record<string, StatusResult>> {
  const results: Record<string, StatusResult> = {};
  let next = 0;
  // Totals and sorting need every report, but must not flood the API.
  await Promise.all(
    Array.from({ length: Math.min(6, reports.length) }, async () => {
      while (next < reports.length) {
        const { id, url } = reports[next++];
        try {
          const report: Report = await fetcher({ url });
          results[id] = {
            data: summarizeStatus(report),
            metadata: {
              created: report.created,
              lastChanged: report.lastChanged,
              url: report.url,
            },
          };
        } catch {
          results[id] = { error: true };
        }
      }
    }),
  );
  return results;
}

export function useReportStatuses(reports: ReportSummary[]) {
  const response = useSWR(
    reports.length
      ? {
          reports: reports
            .map((report) => ({
              id: report.id,
              url: `${apiProxyUrl}/reports/${report.reportType === "AGGREGATED" ? "aggregated/" : ""}${report.id}`,
            }))
            .sort((a, b) => a.id.localeCompare(b.id)),
        }
      : null,
    loadReportStatuses,
  );
  const retry = (report: ReportSummary) => {
    const url = `${apiProxyUrl}/reports/${report.reportType === "AGGREGATED" ? "aggregated/" : ""}${report.id}`;
    void response.mutate(
      async (current) => ({
        ...current,
        ...(await loadReportStatuses({ reports: [{ id: report.id, url }] })),
      }),
      { revalidate: false },
    );
  };
  return { ...response, retry };
}
