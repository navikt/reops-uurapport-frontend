"use client";

import { Loader } from "@navikt/ds-react";
import type { ReportSummary } from "@src/types";
import {
  CRITERION_STATUS,
  isCriterionStatus,
  type CriterionStatus,
} from "@src/utils/criterionStatus";
import styles from "./TeamDashboard.module.css";

const statusLabels: Record<CriterionStatus, string> = {
  NON_COMPLIANT: "Ikke oppfylt",
  NOT_TESTED: "Ikke testet",
  COMPLIANT: "Oppfylt",
  NOT_APPLICABLE: "Ikke aktuelt",
};

export type StatusColumn = CriterionStatus;

export type StatusData = ReturnType<typeof summarizeStatus>;
export type StatusResult = {
  data?: StatusData;
  metadata?: { created?: string; lastChanged?: string; url?: string };
  error?: boolean;
};

export function summarizeStatus(report: {
  successCriteria?: { status?: string }[] | null;
}) {
  const criteria = report.successCriteria;
  const counts: Record<CriterionStatus, number> = {
    NON_COMPLIANT: 0,
    NOT_TESTED: 0,
    COMPLIANT: 0,
    NOT_APPLICABLE: 0,
  };
  for (const criterion of criteria ?? []) {
    // Missing or unrecognised statuses must never appear as tested.
    const status = isCriterionStatus(criterion.status)
      ? criterion.status
      : CRITERION_STATUS.NOT_TESTED;
    counts[status]++;
  }
  const total = criteria?.length ?? 0;
  return { counts, total };
}

export default function ReportStatus({
  report,
  column,
  status,
}: {
  report: ReportSummary;
  column: StatusColumn;
  status?: StatusResult;
}) {
  const { data, error } = status ?? {};
  const { counts, total } = data ?? {
    counts: undefined,
    total: 0,
  };

  if (error) return <span aria-label="Kunne ikke laste status">—</span>;
  if (!data)
    return (
      <Loader
        size="small"
        title={`Laster ${statusLabels[column]} for ${report.title || "Uten navn"}`}
      />
    );
  if (!total || !counts)
    return <span aria-label="Ingen testkriterier tilgjengelig">—</span>;
  return (
    <span className={`${styles.statusNumber} ${styles[column]}`}>
      {counts[column]}
    </span>
  );
}
