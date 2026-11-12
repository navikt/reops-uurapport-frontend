"use client";

import { Loader } from "@navikt/ds-react";
import type { ReportSummary } from "@src/types";
import { useReportStatuses } from "./useReportStatuses";
import styles from "./TeamDashboard.module.css";

const categories = [
  { key: "COMPLIANT", label: "Oppfylt", color: "var(--ax-bg-success-strong)" },
  {
    key: "NON_COMPLIANT",
    label: "Ikke oppfylt",
    color: "var(--ax-bg-danger-strong)",
  },
  {
    key: "NOT_TESTED",
    label: "Ikke testet",
    color: "var(--ax-bg-warning-strong)",
  },
  {
    key: "NOT_APPLICABLE",
    label: "Ikke aktuelt",
    color: "var(--ax-bg-neutral-strong)",
  },
] as const;

export default function TeamStatusSummary({
  reports,
}: {
  reports: ReportSummary[];
}) {
  const { data: statuses } = useReportStatuses(reports);
  const singleReports = reports.filter(
    (report) => report.reportType !== "AGGREGATED",
  );
  if (!singleReports.length) return null;
  const pending = singleReports.some(
    (report) => !statuses?.[report.id]?.data && !statuses?.[report.id]?.error,
  );
  if (pending) return <Loader size="small" title="Laster samlet kravstatus" />;
  const loaded = singleReports.flatMap((report) => {
    const result = statuses?.[report.id];
    return result?.data && !result.error ? [result.data] : [];
  });
  const counts = {
    COMPLIANT: 0,
    NON_COMPLIANT: 0,
    NOT_TESTED: 0,
    NOT_APPLICABLE: 0,
  };
  for (const report of loaded) {
    for (const { key } of categories) counts[key] += report.counts[key];
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  let position = 0;
  const segments = categories.map(({ key, color }) => {
    const start = position;
    position += total ? (counts[key] / total) * 100 : 0;
    return `${color} ${start}% ${position}%`;
  });
  const failed = singleReports.length - loaded.length;

  return (
    <section aria-label="Samlet kravstatus" className={styles.summary}>
      <div
        className={styles.donut}
        aria-hidden="true"
        style={{
          background: total
            ? `conic-gradient(${segments.join(", ")})`
            : "var(--ax-bg-neutral-moderate)",
        }}
      />
      <div>
        <p className={styles.summaryCaption}>
          Krav i {loaded.length}
          {failed > 0 ? ` av ${singleReports.length}` : ""} enkeltrapporter
        </p>
        <dl className={styles.summaryCounts}>
          {categories.map(({ key, label }) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd className={`${styles.statusNumber} ${styles[key]}`}>
                {counts[key]}
              </dd>
            </div>
          ))}
        </dl>
        {failed > 0 && (
          <p className={styles.summaryWarning}>
            Mangler status for {failed} {failed === 1 ? "rapport" : "rapporter"}
            .
          </p>
        )}
      </div>
    </section>
  );
}
