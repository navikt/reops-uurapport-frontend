import { apiUrl } from "@src/utils/server/urls";
import { getOboToken } from "@src/utils/server/getOboToken";
import { getAuthToken } from "@src/utils/server/getAuthToken";
import CreateAggregatedReport from "@src/components/aggregated-reports/CreateAggregatedReport";
import type { ReportSummary } from "@src/types";
import styles from "./create-report.module.css";

async function getReports(): Promise<ReportSummary[]> {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const response = await fetch(`${apiUrl}/api/reports`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${oboToken}`,
    },
    // @ts-expect-error - This is a valid option for duplex streaming
    duplex: "half",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.status}`);
  }

  return response.json();
}

export default async function CreateReportPage() {
  const reports = await getReports();

  return (
    <div className={styles.content}>
      <h1 className={styles.h1}>Opprett samlerapport</h1>
      <CreateAggregatedReport reports={reports} />
    </div>
  );
}
