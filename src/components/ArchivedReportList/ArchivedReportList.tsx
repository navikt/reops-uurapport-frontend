"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BodyShort, Heading, Link, Table, Tag } from "@navikt/ds-react";
import type { ArchivedReportSummary } from "@src/types";
import { formatDate } from "@src/utils/client/date";
import DeletionContacts from "@components/DeletionContacts/DeletionContacts";
import DeleteReportModal from "@components/Modal/deleteReportModal/DeleteReportModal";
import RestoreReportButton from "@components/Modal/restoreReport/RestoreReportButton";
import styles from "./ArchivedReportList.module.css";

interface ArchivedReportListProps {
  reports: ArchivedReportSummary[];
  isAdmin: boolean;
}

const reportHref = (report: ArchivedReportSummary) =>
  report.reportType === "AGGREGATED"
    ? `/reports/aggregated/${report.id}`
    : `/reports/${report.id}`;

const displayName = (report: ArchivedReportSummary) =>
  report.title?.trim() || "Uten navn";

const ArchivedReportList = ({ reports, isAdmin }: ArchivedReportListProps) => {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [message, setMessage] = useState("");

  // Rows disappear after an action, so focus would be lost. Move it to the
  // heading and announce the result.
  const announce = (text: string) => {
    setMessage(text);
    router.refresh();
    headingRef.current?.focus();
  };

  return (
    <section aria-labelledby="archived-heading" className={styles.section}>
      <Heading
        id="archived-heading"
        ref={headingRef}
        tabIndex={-1}
        level="1"
        size="xlarge"
      >
        Arkiverte rapporter
      </Heading>
      <div role="status" aria-live="polite" className={styles.status}>
        {message && <BodyShort>{message}</BodyShort>}
      </div>
      <BodyShort className={styles.intro}>
        Arkiverte rapporter vises ikke i rapportlistene. Alle med tilgang til en
        rapport kan gjenopprette den.
      </BodyShort>
      {!isAdmin && (
        <div className={styles.intro}>
          <DeletionContacts headingLevel="2" />
        </div>
      )}
      {reports.length === 0 ? (
        <BodyShort>Ingen rapporter er arkivert.</BodyShort>
      ) : (
        <Table aria-labelledby="archived-heading" zebraStripes>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
              <Table.HeaderCell scope="col">Team</Table.HeaderCell>
              <Table.HeaderCell scope="col">Arkivert</Table.HeaderCell>
              <Table.HeaderCell scope="col">Årsak</Table.HeaderCell>
              <Table.HeaderCell scope="col">Handlinger</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.map((report) => (
              <Table.Row key={report.id}>
                <Table.HeaderCell scope="row">
                  <Link href={reportHref(report)}>{displayName(report)}</Link>
                  {report.reportType === "AGGREGATED" && (
                    <Tag size="xsmall" variant="neutral" className={styles.tag}>
                      Samlerapport
                    </Tag>
                  )}
                </Table.HeaderCell>
                <Table.DataCell>
                  {report.teamId && report.teamName ? (
                    <Link href={`/teams/${report.teamId}`}>
                      {report.teamName}
                    </Link>
                  ) : (
                    "–"
                  )}
                </Table.DataCell>
                <Table.DataCell>
                  {formatDate(report.archive.archivedAt)}
                  <br />
                  <span className={styles.secondary}>
                    av {report.archive.archivedBy}
                  </span>
                </Table.DataCell>
                <Table.DataCell>{report.archive.reason ?? "–"}</Table.DataCell>
                <Table.DataCell>
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
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </section>
  );
};

export default ArchivedReportList;
