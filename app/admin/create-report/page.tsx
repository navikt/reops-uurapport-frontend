import CreateAggregatedReport from "@src/components/aggregated-reports/CreateAggregatedReport";
import { getReports } from "@src/actions/reportActions";
import styles from "./create-report.module.css";

export default async function CreateReportPage() {
  const reports = await getReports();

  return (
    <div className={styles.content}>
      <h1 className={styles.h1}>Opprett samlerapport</h1>
      <CreateAggregatedReport reports={reports} />
    </div>
  );
}
