"use client";
import { BodyLong, Link, TextField } from "@navikt/ds-react";
import { DataGrid } from "@navikt/ds-react/PREVIEW";
import { useMemo, useState } from "react";
import { formatDate } from "@src/utils/client/date";
import { useQueryParam } from "@src/hooks/useQueryParam";
import type { ReportSummary } from "@src/types";
import cell from "@components/cellText.module.css";
import { matchesReport } from "@src/utils/client/reportSearch";
import { usePagination } from "@src/hooks/usePagination";
import ReportPagination from "./ReportPagination";
import styles from "./ReportList.module.css";

interface ReportListProps {
  reports: ReportSummary[];
}

type SortOrder = NonNullable<DataGrid.Table.Sorting["sortOrder"]>;

const SORTABLE_COLUMNS = new Set(["title", "teamName", "date"]);

function parseSortOrder(raw: string): SortOrder {
  if (raw === "") return [];
  const [columnId, direction] = raw.split(":");
  if (
    SORTABLE_COLUMNS.has(columnId) &&
    (direction === "asc" || direction === "desc")
  ) {
    return [{ columnId, direction }];
  }
  return [];
}

const columns: DataGrid.Columns<ReportSummary> = [
  {
    id: "title",
    header: "Navn",
    isRowHeader: true,
    isSortable: true,
    bodyCell: (report) =>
      report.reportType === "AGGREGATED" ? (
        <Link
          className={cell.wrap}
          data-color="accent"
          href={`/reports/aggregated/${report.id}`}
        >
          {report.title === "" ? "(Uten navn)" : report.title}
        </Link>
      ) : (
        <Link
          className={cell.wrap}
          data-color="accent"
          href={`/reports/${report.id}`}
        >
          {report.title === "" ? "Uten navn" : report.title}
        </Link>
      ),
  },
  {
    id: "teamName",
    header: "Team",
    isSortable: true,
    bodyCell: (report) =>
      report.teamId && report.teamName ? (
        <Link className={cell.wrap} href={`/teams/${report.teamId}`}>
          {report.teamName}
        </Link>
      ) : (
        <span>-</span>
      ),
  },
  {
    id: "date",
    header: "Sist endret",
    isSortable: true,
    bodyCell: (report) => formatDate(report.date),
  },
];

const comparator = (
  a: ReportSummary,
  b: ReportSummary,
  orderBy: keyof ReportSummary,
) => {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  if (bValue === undefined && aValue === undefined) return 0;
  if (bValue === undefined) return -1;
  if (aValue === undefined) return 1;
  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
};

const ReportList = ({ reports }: ReportListProps) => {
  const [query, setQuery] = useState("");
  const [sortParam, setSortParam] = useQueryParam("sort", "");
  const sortOrder = useMemo(() => parseSortOrder(sortParam), [sortParam]);

  const handleSortOrderChange: DataGrid.Table.Sorting["onSortOrderChange"] = (
    newSortOrder,
  ) => {
    const first = newSortOrder[0];
    setSortParam(first ? `${first.columnId}:${first.direction}` : undefined);
  };

  const sortedData = useMemo(() => {
    const first = sortOrder[0];
    const filtered = reports.filter((report) => matchesReport(report, query));
    if (!first) return filtered;
    const orderBy = first.columnId as keyof ReportSummary;
    return filtered.sort((a, b) => {
      const result = comparator(a, b, orderBy);
      return first.direction === "asc" ? -result : result;
    });
  }, [reports, sortOrder, query]);
  const pagination = usePagination(
    sortedData,
    JSON.stringify([query, sortOrder]),
  );

  return (
    <>
      <TextField
        size="small"
        label="Finn rapport"
        description="Søk i navn og nettadresse"
        className={styles.search}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <DataGrid
        columns={columns}
        data={pagination.items}
        getRowId={(row) => row.id}
        defaultSettings={{ zebraStripes: true, truncateContent: false }}
      >
        <DataGrid.Table
          aria-label="Rapporter"
          emptyContent={<BodyLong>Ingen rapporter passer med søket</BodyLong>}
          layout="auto"
          sorting={{
            allowMultiSort: false,
            sortOrder,
            onSortOrderChange: handleSortOrderChange,
          }}
        />
      </DataGrid>
      <ReportPagination
        total={sortedData.length}
        page={pagination.page}
        onPageChange={pagination.onPageChange}
      />
    </>
  );
};

export default ReportList;
