"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BodyShort, Heading, Link } from "@navikt/ds-react";
import type { DataGrid } from "@navikt/ds-react/PREVIEW";
import type { ArchivedReportSummary, ReportSummary } from "@src/types";
import { formatShortDate } from "@src/utils/client/date";
import DeletionContacts from "@components/DeletionContacts/DeletionContacts";
import DeleteReportModal from "@components/Modal/deleteReportModal/DeleteReportModal";
import RestoreReportButton from "@components/Modal/restoreReport/RestoreReportButton";
import ReportFilters from "@components/ReportList/ReportFilters";
import ReportGrid, { type ReportRow } from "@components/ReportList/ReportGrid";
import { PageHeader } from "@components/layout/PageHeader";
import styles from "./ArchivedReportList.module.css";

const displayName = (report: ArchivedReportSummary) =>
  report.title?.trim() || "Uten navn";

export default function ArchivedReportList({
  reports,
  isAdmin,
}: {
  reports: ArchivedReportSummary[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [teamId, setTeamId] = useState("");
  const announce = (text: string) => {
    setMessage(text);
    router.refresh();
    headingRef.current?.focus();
  };
  const byId = new Map(reports.map((report) => [report.id, report]));
  const summaries: ReportSummary[] = reports.map((report) => ({
    ...report,
    title: displayName(report),
    // Archive summaries do not include the report's last-changed date.
    date: "",
    isPartOfNavNo: false,
  }));
  const selectedTeam = summaries.some(
    (report) => report.teamId === teamId && report.teamName,
  )
    ? teamId
    : "";
  const extraColumns: DataGrid.Columns<ReportRow> = [
    {
      id: "archivedAt",
      header: "Arkivert",
      width: { defaultValue: 200 },
      bodyCell: (row) => {
        const archive = byId.get(row.id)!.archive;
        return (
          <>
            <time dateTime={archive.archivedAt} title={archive.archivedAt}>
              {formatShortDate(archive.archivedAt)}
            </time>
            <br />
            <span className={styles.secondary}>av {archive.archivedBy}</span>
          </>
        );
      },
    },
    {
      id: "reason",
      header: "Årsak",
      width: { defaultValue: 220 },
      bodyCell: (row) => byId.get(row.id)!.archive.reason ?? "–",
    },
    {
      id: "actions",
      header: "Handlinger",
      width: { defaultValue: 280 },
      bodyCell: (row) => {
        const report = byId.get(row.id)!;
        return (
          <div className={styles.actions}>
            {report.canRestore && (
              <RestoreReportButton
                reportId={report.id}
                reportName={displayName(report)}
                size="small"
                onRestored={() =>
                  announce(`«${displayName(report)}» er gjenopprettet.`)
                }
                onError={() =>
                  setMessage(
                    `Kunne ikke gjenopprette «${displayName(report)}». Prøv igjen.`,
                  )
                }
              />
            )}
            {isAdmin && (
              <DeleteReportModal
                reportId={report.id}
                reportName={displayName(report)}
                isArchived
                size="small"
                onDeleted={() =>
                  announce(`«${displayName(report)}» er slettet.`)
                }
              />
            )}
          </div>
        );
      },
    },
  ];
  return (
    <>
      <PageHeader
        actions={<Link href="/reports">Tilbake til alle rapporter</Link>}
      >
        <Heading
          id="archived-heading"
          ref={headingRef}
          tabIndex={-1}
          level="1"
          size="xlarge"
        >
          Arkiverte rapporter
        </Heading>
      </PageHeader>
      <section aria-labelledby="archived-heading" className={styles.section}>
        <div role="status" aria-live="polite" className={styles.status}>
          {message && <BodyShort>{message}</BodyShort>}
        </div>
        <BodyShort className={styles.intro}>
          Arkiverte rapporter vises ikke i rapportlistene. Alle med tilgang til
          en rapport kan gjenopprette den.
        </BodyShort>
        {!isAdmin && (
          <div className={styles.intro}>
            <DeletionContacts headingLevel="2" />
          </div>
        )}
        {reports.length === 0 ? (
          <BodyShort>Ingen rapporter er arkivert.</BodyShort>
        ) : (
          <>
            <ReportFilters
              reports={summaries}
              query={query}
              onQueryChange={setQuery}
              teamId={selectedTeam}
              onTeamChange={setTeamId}
            />
            <ReportGrid
              reports={
                selectedTeam
                  ? summaries.filter((report) => report.teamId === selectedTeam)
                  : summaries
              }
              query={query}
              filterKey={selectedTeam}
              retry={() => {}}
              label="Arkiverte rapporter"
              showTeam
              showStatuses={false}
              lazyDetails
              truncateContent={false}
              showTypeTag
              extraColumns={extraColumns}
              emptyContent={
                <BodyShort>Ingen rapporter passer med søket</BodyShort>
              }
            />
          </>
        )}
      </section>
    </>
  );
}
