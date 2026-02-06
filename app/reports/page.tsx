import ReportList from "@/components/ReportList/ReportList";
import CreateReportModal from "@/components/Modal/createReportModal/CreateReportModal";
import { getReports } from "@src/services/reportServices";
import styles from "./reports.module.css";

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <>
      <div className={styles.headingAndButton}>
        <h1 className={styles.h1}>Alle rapporter</h1>
        <CreateReportModal />
      </div>
      <div className={styles.content}>
        <ReportList reports={reports} />
      </div>
    </>
  );
}
