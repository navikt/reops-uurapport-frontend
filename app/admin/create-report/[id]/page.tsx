import { apiUrl } from "@src/utils/server/urls";
import { getOboToken } from "@src/utils/server/getOboToken";
import { getAuthToken } from "@src/utils/server/getAuthToken";
import CreateAggregatedReport from "@src/components/aggregated-reports/CreateAggregatedReport";
import Forbidden from "@src/components/forbidden/Forbidden";
import { getReports, getUserDetails } from "@src/actions/reportActions";
import type { AggregatedReport } from "@src/types";
import styles from "../create-report.module.css";

async function getAggregatedReport(id: string): Promise<AggregatedReport> {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const response = await fetch(`${apiUrl}/api/reports/aggregated/${id}`, {
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
    throw new Error(`Failed to fetch aggregated report: ${response.status}`);
  }

  return response.json();
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAggregatedReportPage({ params }: PageProps) {
  const { id } = await params;
  const [reports, aggregatedReport, user] = await Promise.all([
    getReports(),
    getAggregatedReport(id),
    getUserDetails(),
  ]);

  if (!user.isAdmin) {
    return <Forbidden />;
  }

  return (
    <span className={styles.content}>
      <h1 className={styles.h1}>Opprett samlerapport</h1>
      <CreateAggregatedReport
        reports={reports}
        aggregatedReport={aggregatedReport}
        userTeams={user.teams}
      />
    </span>
  );
}
