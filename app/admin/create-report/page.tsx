import CreateAggregatedReport from "@src/components/aggregated-reports/CreateAggregatedReport";
import { getReports, getUserDetails } from "@src/actions/reportActions";
import styles from "./create-report.module.css";
import Forbidden from "@src/components/forbidden/Forbidden";
import { PageHeader } from "@components/layout/PageHeader";
import { Heading } from "@navikt/ds-react";

export default async function CreateReportPage() {
  const [reports, user] = await Promise.all([getReports(), getUserDetails()]);

  if (!user.isAdmin) {
    return <Forbidden />;
  }

  return (
    <div className={styles.content}>
      <PageHeader>
        <Heading level="1" size="xlarge">
          Opprett samlerapport
        </Heading>
      </PageHeader>
      <CreateAggregatedReport reports={reports} userTeams={user.teams} />
    </div>
  );
}
