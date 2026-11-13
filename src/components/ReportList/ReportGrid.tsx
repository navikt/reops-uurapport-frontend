"use client";

import { useState, type ReactNode } from "react";
import { BodyLong, Button, Link, Loader, Tag } from "@navikt/ds-react";
import { DataGrid } from "@navikt/ds-react/PREVIEW";
import type { ReportSummary } from "@src/types";
import { formatDate, formatShortDate } from "@src/utils/client/date";
import { matchesReport } from "@src/utils/client/reportSearch";
import { usePagination } from "@src/hooks/usePagination";
import ReportStatus, {
  type StatusColumn,
  type StatusResult,
} from "@components/teamDashboard/ReportStatus";
import { useReportStatuses } from "@components/teamDashboard/useReportStatuses";
import ReportPagination from "./ReportPagination";
import styles from "./ReportGrid.module.css";
import { compactGridSettings } from "@components/gridSettings";
import { useReportTitleWidth } from "./useReportTitleWidth";

export type ReportRow = ReportSummary & {
  status?: StatusResult;
  retry: () => void;
};
export type SortOrder = NonNullable<DataGrid.Table.Sorting["sortOrder"]>;

function timestamp(value?: string) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isNaN(parsed) ? undefined : parsed;
}

function ReportDetails({
  report,
  showReportType,
}: {
  report: ReportRow;
  showReportType: boolean;
}) {
  if (!report.status)
    return (
      <div className={styles.reportDetails}>
        <Loader title="Laster rapportdetaljer" />
      </div>
    );
  const metadata = report.status.metadata;
  const created = metadata?.created;
  const changed = metadata?.lastChanged || report.date;
  return (
    // Let pointer focus stay in the panel instead of DataGrid redirecting it
    // to the active cell and clearing text selection. No extra Tab stop.
    <div className={styles.reportDetails} tabIndex={-1}>
      <BodyLong weight="semibold">{report.title || "Uten navn"}</BodyLong>
      <dl className={styles.reportDetailFields}>
        <div>
          <dt>Nettadresse</dt>
          <dd>{metadata?.url || report.url || "Ikke oppgitt"}</dd>
        </div>
        {showReportType && (
          <div>
            <dt>Rapporttype</dt>
            <dd>
              {report.reportType === "AGGREGATED"
                ? "Samlerapport"
                : "Enkeltrapport"}
            </dd>
          </div>
        )}
        <div>
          <dt>Opprettet</dt>
          <dd>
            {created && timestamp(created) !== undefined
              ? formatDate(created)
              : "Ukjent"}
          </dd>
        </div>
        <div>
          <dt>Sist endret</dt>
          <dd>
            {timestamp(changed) !== undefined ? formatDate(changed) : "Ukjent"}
          </dd>
        </div>
      </dl>
      {metadata?.notes?.trim() && (
        <dl className={styles.reportNotes}>
          <div>
            <dt>Notater</dt>
            <dd className={styles.notes}>{metadata.notes}</dd>
          </div>
        </dl>
      )}
      {report.status.error && (
        <div className={styles.statusMessage}>
          <BodyLong>Kunne ikke laste rapportdetaljer og kravstatus.</BodyLong>
          <Button size="small" variant="tertiary" onClick={report.retry}>
            Prøv igjen
          </Button>
        </div>
      )}
    </div>
  );
}

function LazyReportDetails({
  report,
  showReportType,
}: {
  report: ReportRow;
  showReportType: boolean;
}) {
  const { data, retry } = useReportStatuses([report]);
  return (
    <ReportDetails
      report={{
        ...report,
        status: data?.[report.id],
        retry: () => retry(report),
      }}
      showReportType={showReportType}
    />
  );
}

const columns: DataGrid.Columns<ReportRow> = [
  {
    id: "title",
    header: "Rapport",
    isRowHeader: true,
    isSortable: true,
    width: { defaultValue: 300, resizeMin: 200 },
    bodyCell: (report) => (
      <Link
        className={styles.reportTitle}
        title={report.title || "Uten navn"}
        href={`/reports/${report.reportType === "AGGREGATED" ? "aggregated/" : ""}${report.id}`}
      >
        {report.title || "Uten navn"}
      </Link>
    ),
  },
  {
    id: "created",
    header: "Opprettet",
    isSortable: true,
    width: { defaultValue: 136 },
    bodyCell: (report) => {
      const created = report.status?.metadata?.created;
      if (!report.status)
        return (
          <Loader
            size="small"
            title={`Laster opprettelsesdato for ${report.title || "Uten navn"}`}
          />
        );
      return created && timestamp(created) !== undefined ? (
        <time dateTime={created} title={created}>
          {formatShortDate(created)}
        </time>
      ) : (
        <span aria-label="Opprettelsesdato ukjent">—</span>
      );
    },
  },
  ...(
    [
      { key: "COMPLIANT", label: "Oppfylt" },
      { key: "NON_COMPLIANT", label: "Ikke oppfylt" },
      { key: "NOT_TESTED", label: "Ikke testet" },
      { key: "NOT_APPLICABLE", label: "Ikke aktuelt" },
    ] as const
  ).map(({ key, label }) => ({
    id: key,
    header: label,
    isSortable: true,
    width: {
      defaultValue:
        key === "NOT_APPLICABLE" || key === "NON_COMPLIANT" ? 136 : 120,
    },
    align: "right" as const,
    bodyCell: (report: ReportRow) => (
      <ReportStatus report={report} column={key} status={report.status} />
    ),
  })),
  {
    id: "isPartOfNavNo",
    header: "Del av nav.no",
    isSortable: true,
    width: { defaultValue: 136 },
    bodyCell: (report) => (report.isPartOfNavNo ? "Ja" : "Nei"),
  },
];

const teamColumn: DataGrid.Columns<ReportRow>[number] = {
  id: "teamName",
  header: "Team",
  isSortable: true,
  width: { defaultValue: 200 },
  bodyCell: (report) =>
    report.teamId && report.teamName ? (
      <Link className={styles.reportTitle} href={`/teams/${report.teamId}`}>
        {report.teamName}
      </Link>
    ) : (
      "—"
    ),
};
const changedColumn: DataGrid.Columns<ReportRow>[number] = {
  id: "date",
  header: "Sist endret",
  isSortable: true,
  width: { defaultValue: 136 },
  bodyCell: (report) =>
    timestamp(report.date) !== undefined ? (
      <time dateTime={report.date} title={report.date}>
        {formatShortDate(report.date)}
      </time>
    ) : (
      "Ukjent"
    ),
};

export default function ReportGrid({
  reports,
  emptyContent,
  query = "",
  statuses,
  retry,
  label = "Teamets rapporter",
  idPrefix = "",
  announceCount = true,
  showReportType = true,
  showTeam = false,
  showStatuses = true,
  lazyDetails = false,
  truncateContent = true,
  showTypeTag = false,
  extraColumns = [],
  sortOrder: controlledSort,
  onSortOrderChange,
  filterKey = "",
}: {
  reports: ReportSummary[];
  emptyContent?: ReactNode;
  query?: string;
  statuses?: Record<string, StatusResult>;
  retry: (report: ReportSummary) => void;
  label?: string;
  idPrefix?: string;
  announceCount?: boolean;
  showReportType?: boolean;
  showTeam?: boolean;
  showStatuses?: boolean;
  lazyDetails?: boolean;
  truncateContent?: boolean;
  showTypeTag?: boolean;
  extraColumns?: DataGrid.Columns<ReportRow>;
  sortOrder?: SortOrder;
  onSortOrderChange?: DataGrid.Table.Sorting["onSortOrderChange"];
  filterKey?: string;
}) {
  const [localSort, setLocalSort] = useState<SortOrder>(
    showStatuses ? [{ columnId: `${idPrefix}created`, direction: "desc" }] : [],
  );
  const sortOrder = controlledSort ?? localSort;
  const sortedReports: ReportRow[] = reports
    .filter((report) =>
      matchesReport(report, query, statuses?.[report.id]?.metadata?.url),
    )
    .map((report) => ({
      ...report,
      status: statuses?.[report.id],
      retry: () => retry(report),
    }))
    .sort((a, b) => {
      const first = sortOrder[0];
      if (!first) return 0;
      const columnId = first.columnId.slice(idPrefix.length);
      if (columnId === "title" || columnId === "teamName") {
        const aValue =
          columnId === "title" ? a.title || "Uten navn" : a.teamName;
        const bValue =
          columnId === "title" ? b.title || "Uten navn" : b.teamName;
        if (!aValue) return bValue ? 1 : 0;
        if (!bValue) return -1;
        const comparison = aValue.localeCompare(bValue, "nb-NO");
        return first.direction === "asc" ? comparison : -comparison;
      }
      const value = (row: ReportRow) => {
        if (columnId === "isPartOfNavNo") return Number(row.isPartOfNavNo);
        if (columnId === "date") return timestamp(row.date);
        if (row.status?.error) return undefined;
        if (columnId === "created")
          return timestamp(row.status?.metadata?.created);
        const status = row.status?.data;
        if (!status?.total) return undefined;
        return status.counts[columnId as StatusColumn];
      };
      const aValue = value(a),
        bValue = value(b);
      if (aValue === undefined) return bValue === undefined ? 0 : 1;
      if (bValue === undefined) return -1;
      return first.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  const pagination = usePagination(
    sortedReports,
    JSON.stringify([
      query,
      filterKey,
      sortOrder,
      reports.map((report) => report.id).sort(),
    ]),
  );
  const titleColumn = showTypeTag
    ? {
        ...columns[0],
        bodyCell: (report: ReportRow) => (
          <>
            {columns[0].bodyCell?.(report)}
            {report.reportType === "AGGREGATED" && (
              <Tag size="xsmall" variant="neutral">
                Samlerapport
              </Tag>
            )}
          </>
        ),
      }
    : columns[0];
  const otherColumns = [
    ...(showTeam ? [teamColumn] : []),
    ...(showTeam && showStatuses ? [changedColumn] : []),
    ...(showStatuses ? columns.slice(1) : []),
    ...extraColumns,
  ];
  const otherColumnWidths = otherColumns.reduce((total, column) => {
    const width = column.width?.value ?? column.width?.defaultValue ?? 140;
    return total + (typeof width === "number" ? width : 140);
  }, 0);
  const {
    wrapperRef,
    width: titleWidth,
    onChange: onTitleWidthChange,
  } = useReportTitleWidth(otherColumnWidths);
  const visibleColumns = [
    {
      ...titleColumn,
      width: {
        ...titleColumn.width,
        value: titleWidth,
        onChange: onTitleWidthChange,
      },
    },
    ...otherColumns,
  ];
  return (
    <>
      {announceCount && (
        <p className={styles.srOnly} role="status">
          Viser {sortedReports.length} av {reports.length} rapporter
        </p>
      )}
      <p className={styles.scrollHint}>
        Rull sidelengs for å se alle kolonnene på små skjermer.
      </p>
      <div ref={wrapperRef}>
        <DataGrid
          columns={visibleColumns.map((column) => ({
            ...column,
            id: `${idPrefix}${column.id}`,
          }))}
          data={pagination.items}
          getRowId={(report) => report.id}
          defaultSettings={{
            ...compactGridSettings,
            truncateContent,
            columnDividers: true,
          }}
        >
          <DataGrid.Table<ReportRow>
            layout="fixed"
            stickyHeader={false}
            aria-label={label}
            emptyContent={emptyContent}
            detailsPanel={{
              showExpandAll: true,
              getContent: (report) =>
                lazyDetails ? (
                  <LazyReportDetails
                    report={report}
                    showReportType={showReportType}
                  />
                ) : (
                  <ReportDetails
                    report={report}
                    showReportType={showReportType}
                  />
                ),
            }}
            sorting={{
              allowMultiSort: false,
              sortOrder,
              onSortOrderChange: onSortOrderChange ?? setLocalSort,
            }}
          />
        </DataGrid>
      </div>
      <ReportPagination
        total={sortedReports.length}
        page={pagination.page}
        onPageChange={pagination.onPageChange}
        label={
          label === "Teamets rapporter" || label === "Rapporter"
            ? "Sider med rapporter"
            : `Sider med ${label.toLocaleLowerCase("nb-NO")}`
        }
      />
    </>
  );
}
