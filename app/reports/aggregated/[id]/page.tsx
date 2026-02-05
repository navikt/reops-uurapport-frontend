import CreateReport from "@/components/reportPages/CreateReport";
import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import { apiUrl } from "@/utils/server/urls";
import type { AggregatedReport, User } from "@src/types";

async function getData(id: string) {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const [aggregatedReportResponse, userResponse] = await Promise.all([
    fetch(`${apiUrl}/api/reports/aggregated/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${oboToken}`,
      },
    }),
    fetch(`${apiUrl}/api/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${oboToken}`,
      },
    }),
  ]);

  const aggregatedReport: AggregatedReport =
    await aggregatedReportResponse.json();
  const user: User = await userResponse.json();

  return { aggregatedReport, user };
}

export default async function AggregatedReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { aggregatedReport, user } = await getData(id);

  return (
    <CreateReport
      report={aggregatedReport}
      reportType="AGGREGATED"
      isAdmin={user.isAdmin}
    />
  );
}
