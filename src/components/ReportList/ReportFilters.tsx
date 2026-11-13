"use client";

import { Select, TextField } from "@navikt/ds-react";
import type { ReportSummary } from "@src/types";
import styles from "./ReportList.module.css";

export default function ReportFilters({
  reports,
  query,
  onQueryChange,
  teamId,
  onTeamChange,
}: {
  reports: ReportSummary[];
  query: string;
  onQueryChange: (value: string) => void;
  teamId: string;
  onTeamChange: (value: string) => void;
}) {
  const teams = Array.from(
    new Map(
      reports
        .filter((report) => report.teamId && report.teamName)
        .map((report) => [report.teamId, report.teamName]),
    ).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1], "nb-NO"));
  return (
    <div className={styles.filters}>
      <TextField
        size="small"
        label="Finn rapport"
        description="Søk i navn og nettadresse"
        className={styles.search}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <Select
        size="small"
        label="Team"
        value={teamId}
        onChange={(event) => onTeamChange(event.target.value)}
      >
        <option value="">Alle team</option>
        {teams.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
    </div>
  );
}
