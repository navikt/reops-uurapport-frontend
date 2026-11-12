import type { ReportSummary } from "@src/types";

export function matchesReport(
  report: ReportSummary,
  query: string,
  detailUrl?: string,
) {
  const needle = query.trim().toLocaleLowerCase("nb-NO");
  return [report.title || "Uten navn", report.url, detailUrl].some((value) =>
    value?.toLocaleLowerCase("nb-NO").includes(needle),
  );
}
