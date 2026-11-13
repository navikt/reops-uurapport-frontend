"use client";

import { BodyLong } from "@navikt/ds-react";
import { useState } from "react";
import { useQueryParam } from "@src/hooks/useQueryParam";
import type { ReportSummary } from "@src/types";
import { useReportStatuses } from "@components/teamDashboard/useReportStatuses";
import ReportFilters from "./ReportFilters";
import ReportGrid, { type SortOrder } from "./ReportGrid";

const SORTABLE_COLUMNS = new Set([
  "title",
  "teamName",
  "date",
  "created",
  "COMPLIANT",
  "NON_COMPLIANT",
  "NOT_TESTED",
  "NOT_APPLICABLE",
  "isPartOfNavNo",
]);

function parseSortOrder(raw: string): SortOrder {
  const [columnId, direction, extra] = raw.split(":");
  return !extra &&
    SORTABLE_COLUMNS.has(columnId) &&
    (direction === "asc" || direction === "desc")
    ? [{ columnId, direction }]
    : [];
}

export default function ReportList({ reports }: { reports: ReportSummary[] }) {
  const [query, setQuery] = useState("");
  const [teamId, setTeamId] = useState("");
  const [sortParam, setSortParam] = useQueryParam("sort", "");
  const { data: statuses, retry } = useReportStatuses(reports);
  const selectedTeam = reports.some(
    (report) => report.teamId === teamId && report.teamName,
  )
    ? teamId
    : "";
  const filtered = selectedTeam
    ? reports.filter((report) => report.teamId === selectedTeam)
    : reports;
  return (
    <>
      <ReportFilters
        reports={reports}
        query={query}
        onQueryChange={setQuery}
        teamId={selectedTeam}
        onTeamChange={setTeamId}
      />
      <ReportGrid
        reports={filtered}
        query={query}
        filterKey={selectedTeam}
        statuses={statuses}
        retry={retry}
        label="Rapporter"
        showTeam
        sortOrder={parseSortOrder(sortParam)}
        onSortOrderChange={(order) => {
          const first = order[0];
          setSortParam(
            first ? `${first.columnId}:${first.direction}` : undefined,
          );
        }}
        emptyContent={<BodyLong>Ingen rapporter passer med søket</BodyLong>}
      />
    </>
  );
}
