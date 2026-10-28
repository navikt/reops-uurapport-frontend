"use client";

import ReportList from "@components/ReportList/ReportList";
import CreateReportModal from "@components/Modal/createReportModal/CreateReportModal";
import { Tabs, Select, Heading } from "@navikt/ds-react";
import { Suspense } from "react";
import { ArchiveIcon } from "@navikt/aksel-icons";
import { LinkButton } from "@components/LinkButton";
import TeamDashboard from "./TeamDashboard";
import styles from "./MyTeam.module.css";
import type { Team, User } from "@src/types";
import { useQueryParam } from "@src/hooks/useQueryParam";

interface MyTeamProps {
  user: User;
}

function MyTeamInner({ user }: MyTeamProps) {
  const [tabState, setTabState] = useQueryParam("tab", "teamView", {
    history: "push",
  });
  const [currentTeamId, setCurrentTeamId] = useQueryParam(
    "team",
    user.teams[0].id,
  );
  const userName = user.name.split(",");
  const isMyTeam = user.teams.map((team) => team.id).includes(currentTeamId);

  return (
    <div className={styles.teamContent}>
      <Heading level="1" size="large" className={styles.h1}>
        Hei {userName[1]}! 👋
      </Heading>

      <Tabs value={tabState} onChange={setTabState}>
        <Tabs.List>
          <Tabs.Tab value="teamView" label="Mitt team" />
          <Tabs.Tab value="myReports" label="Mine rapporter" />
        </Tabs.List>
        <Tabs.Panel value="teamView">
          <div className={styles.myTeamHeader}>
            <Select
              className={styles.selector}
              label="Velg team"
              value={currentTeamId}
              onChange={(e) => setCurrentTeamId(e.target.value)}
            >
              {user.teams.map((team: Team) => {
                return (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                );
              })}
            </Select>
          </div>

          <TeamDashboard teamId={currentTeamId} isMyTeam={isMyTeam} />
        </Tabs.Panel>
        <Tabs.Panel value="myReports">
          <header className={styles.myReportsHeader}>
            <LinkButton
              href="/reports/archived"
              variant="secondary"
              icon={<ArchiveIcon aria-hidden />}
            >
              Arkiverte rapporter
            </LinkButton>
            <CreateReportModal preselectedTeamId={currentTeamId} />
          </header>
          <section className={styles.myReportsContainer}>
            <section>
              <Heading size="large">Mine rapporter</Heading>
            </section>
            <ReportList reports={user.reports} />
          </section>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

function MyTeam({ user }: MyTeamProps) {
  return (
    <Suspense fallback={null}>
      <MyTeamInner user={user} />
    </Suspense>
  );
}

export default MyTeam;
