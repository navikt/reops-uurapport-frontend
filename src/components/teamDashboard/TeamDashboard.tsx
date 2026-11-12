"use client";

import { useState } from "react";
import {
  BodyLong,
  Button,
  Heading,
  Link,
  LocalAlert,
  Loader,
  TextField,
} from "@navikt/ds-react";
import useSWR from "swr";
import EditTeamModal from "@components/Modal/TeamModals/EditTeamModal";
import CreateReportModal from "@components/Modal/createReportModal/CreateReportModal";
import { fetcher } from "@src/utils/client/api";
import { apiProxyUrl } from "@src/utils/client/urls";
import type { ReportSummary, Team } from "@src/types";
import TeamReportList from "./TeamReportList";
import TeamStatusSummary from "./TeamStatusSummary";
import styles from "./TeamDashboard.module.css";

interface TeamDashboardProps {
  teamId: string;
  isMyTeam: boolean;
}

function TeamDashboard({ teamId, isMyTeam }: TeamDashboardProps) {
  const [query, setQuery] = useState("");
  const {
    data: reports,
    error: reportsError,
    isLoading: isLoadingReports,
    mutate: reloadReports,
  } = useSWR<ReportSummary[]>(
    { url: `${apiProxyUrl}/teams/${teamId}/reports` },
    fetcher,
  );
  const {
    data: team,
    error: teamError,
    isLoading: isLoadingTeam,
    mutate: reloadTeam,
  } = useSWR<Team>({ url: `${apiProxyUrl}/teams/${teamId}` }, fetcher);

  if (isLoadingReports || isLoadingTeam) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="xlarge" title="Laster teamets rapporter" />
      </div>
    );
  }

  if (reportsError || teamError) {
    return (
      <LocalAlert status="error">
        <LocalAlert.Header>
          <LocalAlert.Title>Kunne ikke laste teamet</LocalAlert.Title>
        </LocalAlert.Header>
        <LocalAlert.Content>
          <Button
            variant="secondary"
            onClick={() => {
              void reloadReports();
              void reloadTeam();
            }}
          >
            Prøv igjen
          </Button>
        </LocalAlert.Content>
      </LocalAlert>
    );
  }

  const allReports = reports ?? [];

  return (
    <div className={styles.teamDashboard}>
      <header className={styles.teamHeader}>
        <div className={styles.teamInfo}>
          <Heading level="1" size="medium">
            {team?.name ?? "Ukjent team"}
          </Heading>
          <dl className={styles.teamDetails}>
            <div>
              <dt>Teamansvarlig</dt>
              <dd>
                {team?.email ? (
                  <Link href={`mailto:${team.email}`}>{team.email}</Link>
                ) : (
                  "Ikke satt"
                )}
              </dd>
            </div>
            <div>
              <dt>Medlemmer</dt>
              <dd>
                {team?.members?.length ? (
                  <ul className={styles.members}>
                    {team.members.map((member) => (
                      <li key={member}>{member}</li>
                    ))}
                  </ul>
                ) : (
                  "Ingen medlemmer registrert"
                )}
              </dd>
            </div>
          </dl>
        </div>
        <div className={styles.teamSide}>
          {isMyTeam && (
            <div
              role="group"
              aria-label="Teamadministrasjon"
              className={styles.teamActions}
            >
              <EditTeamModal teamId={teamId} size="small" />
            </div>
          )}
          <TeamStatusSummary reports={allReports} />
        </div>
      </header>

      <section aria-label="Rapporter" className={styles.reports}>
        <div className={styles.toolbar}>
          {allReports.length > 0 && (
            <TextField
              label="Finn rapport"
              description="Søk i navn og nettadresse"
              size="small"
              className={styles.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          )}
          {isMyTeam && (
            <CreateReportModal
              key={teamId}
              preselectedTeamId={teamId}
              size="small"
            />
          )}
        </div>
        {allReports.length > 0 ? (
          <>
            <TeamReportList
              reports={allReports}
              groupByType
              query={query}
              emptyContent={
                <div className={styles.emptyState}>
                  <BodyLong>Ingen rapporter passer med søket</BodyLong>
                  <Button variant="tertiary" onClick={() => setQuery("")}>
                    Nullstill søket
                  </Button>
                </div>
              }
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <BodyLong>Teamet har ingen rapporter ennå.</BodyLong>
          </div>
        )}
      </section>
    </div>
  );
}

export default TeamDashboard;
