"use client";

import type { ReactNode } from "react";
import { Heading } from "@navikt/ds-react";
import type { ReportSummary } from "@src/types";
import { matchesReport } from "@src/utils/client/reportSearch";
import ReportGrid from "@components/ReportList/ReportGrid";
import { useReportStatuses } from "./useReportStatuses";
import styles from "./TeamDashboard.module.css";

interface TeamReportListProps {
  reports: ReportSummary[];
  emptyContent?: ReactNode;
  query?: string;
  groupByType?: boolean;
}

export default function TeamReportList({
  reports,
  query = "",
  emptyContent,
  groupByType = false,
}: TeamReportListProps) {
  const { data: statuses, retry } = useReportStatuses(reports);
  if (!groupByType)
    return (
      <ReportGrid
        reports={reports}
        query={query}
        emptyContent={emptyContent}
        statuses={statuses}
        retry={retry}
      />
    );
  const visibleCount = reports.filter((report) =>
    matchesReport(report, query, statuses?.[report.id]?.metadata?.url),
  ).length;
  const groups = [
    {
      id: "aggregated-",
      label: "Samlerapporter",
      reports: reports.filter((report) => report.reportType === "AGGREGATED"),
    },
    {
      id: "single-",
      label: "Enkeltrapporter",
      reports: reports.filter((report) => report.reportType !== "AGGREGATED"),
    },
  ];
  return (
    <div className={styles.reportGroups}>
      <p className={styles.srOnly} role="status">
        Viser {visibleCount} av {reports.length} rapporter
      </p>
      {!visibleCount
        ? emptyContent
        : groups.map(
            (group) =>
              group.reports.some((report) =>
                matchesReport(
                  report,
                  query,
                  statuses?.[report.id]?.metadata?.url,
                ),
              ) && (
                <section key={group.id} aria-label={group.label}>
                  <Heading
                    level="2"
                    size="small"
                    className={styles.groupHeading}
                  >
                    {group.label}
                  </Heading>
                  <ReportGrid
                    reports={group.reports}
                    query={query}
                    emptyContent={emptyContent}
                    statuses={statuses}
                    retry={retry}
                    label={group.label}
                    idPrefix={group.id}
                    announceCount={false}
                    showReportType={false}
                  />
                </section>
              ),
          )}
    </div>
  );
}
