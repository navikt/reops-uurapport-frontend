import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import { apiUrl } from "@/utils/server/urls";
import ReportList from "@/components/ReportList/ReportList";
import CreateReportModal from "@/components/Modal/createReportModal/CreateReportModal";
import styles from "./reports.module.css";
import type { Report } from "@src/types";

async function getReports(): Promise<Report[]> {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const response = await fetch(`${apiUrl}/api/reports`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${oboToken}`,
    },
  });

  return response.json();
}

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
