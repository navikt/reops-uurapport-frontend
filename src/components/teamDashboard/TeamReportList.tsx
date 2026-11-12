"use client";

import { useState, type ReactNode } from "react";
import { BodyLong, Button, Heading, Link, Loader } from "@navikt/ds-react";
import { DataGrid } from "@navikt/ds-react/PREVIEW";
import type { ReportSummary } from "@src/types";
import { matchesReport } from "@src/utils/client/reportSearch";
import { usePagination } from "@src/hooks/usePagination";
import ReportPagination from "@components/ReportList/ReportPagination";
import { useReportStatuses } from "./useReportStatuses";
import { formatDate } from "@src/utils/client/date";
import ReportStatus, {
  type StatusColumn,
  type StatusResult,
} from "./ReportStatus";
import styles from "./TeamDashboard.module.css";

type ReportRow = ReportSummary & { status?: StatusResult; retry: () => void };

function timestamp(value?: string) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isNaN(parsed) ? undefined : parsed;
}

function ReportDetails({ report }: { report: ReportRow }) {
  if (!report.status)
    return (
      <div className={styles.reportDetails}>
        <Loader title="Laster rapportdetaljer" />
      </div>
    );
  const metadata = report.status?.metadata;
  const created = metadata?.created;
  const changed = metadata?.lastChanged || report.date;
  return (
    <div className={styles.reportDetails}>
      <BodyLong weight="semibold">{report.title || "Uten navn"}</BodyLong>
      <dl className={styles.reportDetailFields}>
        <div>
          <dt>Nettadresse</dt>
          <dd>{metadata?.url || "Ikke oppgitt"}</dd>
        </div>
        <div>
          <dt>Rapporttype</dt>
          <dd>
            {report.reportType === "AGGREGATED"
              ? "Samlerapport"
              : "Enkeltrapport"}
          </dd>
        </div>
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
      {report.status?.error && (
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
        <time dateTime={created}>
          {new Date(created).toLocaleDateString("nb-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
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
                  />
                </section>
              ),
          )}
    </div>
  );
}

function ReportGrid({
  reports,
  emptyContent,
  query = "",
  statuses,
  retry,
  label = "Teamets rapporter",
  idPrefix = "",
  announceCount = true,
}: {
  reports: ReportSummary[];
  emptyContent?: ReactNode;
  query?: string;
  statuses?: Record<string, StatusResult>;
  retry: (report: ReportSummary) => void;
  label?: string;
  idPrefix?: string;
  announceCount?: boolean;
}) {
  const [sortOrder, setSortOrder] = useState<
    NonNullable<DataGrid.Table.Sorting["sortOrder"]>
  >([{ columnId: `${idPrefix}created`, direction: "desc" }]);
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
      if (columnId !== "title") {
        const value = (row: ReportRow) => {
          if (columnId === "isPartOfNavNo") return Number(row.isPartOfNavNo);
          if (row.status?.error) return undefined;
          if (columnId === "created")
            return timestamp(row.status?.metadata?.created);
          const status = row.status?.data;
          if (!status?.total) return undefined;
          return status.counts[columnId as StatusColumn];
        };
        const aValue = value(a);
        const bValue = value(b);
        if (aValue === undefined) return bValue === undefined ? 0 : 1;
        if (bValue === undefined) return -1;
        return first.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      const comparison = (a.title || "Uten navn").localeCompare(
        b.title || "Uten navn",
        "nb-NO",
      );
      return first.direction === "asc" ? comparison : -comparison;
    });
  const pagination = usePagination(
    sortedReports,
    JSON.stringify([query, sortOrder]),
  );

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
      <DataGrid
        columns={columns.map((column) => ({
          ...column,
          id: `${idPrefix}${column.id}`,
        }))}
        data={pagination.items}
        getRowId={(report) => report.id}
        defaultSettings={{
          zebraStripes: true,
          truncateContent: true,
          columnDividers: true,
          rowDensity: "tight",
          textSize: "small",
        }}
      >
        <DataGrid.Table<ReportRow>
          layout="fixed"
          stickyHeader={false}
          aria-label={label}
          emptyContent={emptyContent}
          detailsPanel={{
            showExpandAll: true,
            getContent: (report) => <ReportDetails report={report} />,
          }}
          sorting={{
            allowMultiSort: false,
            sortOrder,
            onSortOrderChange: setSortOrder,
          }}
        />
      </DataGrid>
      <ReportPagination
        total={sortedReports.length}
        page={pagination.page}
        onPageChange={pagination.onPageChange}
        label={
          label === "Teamets rapporter"
            ? "Sider med rapporter"
            : `Sider med ${label.toLocaleLowerCase("nb-NO")}`
        }
      />
    </>
  );
}
