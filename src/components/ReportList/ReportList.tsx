"use client";
import { Link } from "@navikt/ds-react";
import { DataGrid } from "@navikt/ds-react/PREVIEW";
import { useMemo } from "react";
import { formatDate } from "@src/utils/client/date";
import { useQueryParam } from "@src/hooks/useQueryParam";
import type { ReportSummary } from "@src/types";

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
        <Link data-color="accent" href={`/reports/aggregated/${report.id}`}>
          {report.title === "" ? "(Uten navn)" : report.title}
        </Link>
      ) : (
        <Link data-color="accent" href={`/reports/${report.id}`}>
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
        <Link href={`/teams/${report.teamId}`}>{report.teamName}</Link>
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
    if (!first) return reports;
    const orderBy = first.columnId as keyof ReportSummary;
    return reports.slice().sort((a, b) => {
      const result = comparator(a, b, orderBy);
      return first.direction === "asc" ? -result : result;
    });
  }, [reports, sortOrder]);

  return (
    <DataGrid
      columns={columns}
      data={sortedData}
      getRowId={(row) => row.id}
      defaultSettings={{ zebraStripes: true }}
    >
      <DataGrid.Table
        layout="auto"
        sorting={{
          allowMultiSort: false,
          sortOrder,
          onSortOrderChange: handleSortOrderChange,
        }}
      />
    </DataGrid>
  );
};

export default ReportList;
