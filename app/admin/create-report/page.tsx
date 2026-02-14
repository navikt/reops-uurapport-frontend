import CreateAggregatedReport from "@src/components/aggregated-reports/CreateAggregatedReport";
import { getReports, getUserDetails } from "@src/actions/reportActions";
import styles from "./create-report.module.css";
import Forbidden from "@src/components/forbidden/Forbidden";

export default async function CreateReportPage() {
  const [reports, user] = await Promise.all([getReports(), getUserDetails()]);

  if (!user.isAdmin) {
    return <Forbidden />;
  }

  return (
    <div className={styles.content}>
      <h1 className={styles.h1}>Opprett samlerapport</h1>
      <CreateAggregatedReport reports={reports} userTeams={user.teams} />
    </div>
  );
}
