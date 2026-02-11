import CreateReport from "@/components/reportPages/CreateReport";
import NotFound from "@/components/notFound/NotFound";
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

  if (!aggregatedReportResponse.ok) {
    return { aggregatedReport: null, user: null, notFound: true };
  }

  const aggregatedReport: AggregatedReport =
    await aggregatedReportResponse.json();
  const user: User = await userResponse.json();

  return { aggregatedReport, user, notFound: false };
}

export default async function AggregatedReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { aggregatedReport, user, notFound } = await getData(id);

  if (notFound || !aggregatedReport || !user) {
    return <NotFound resourceType="rapport" />;
  }

  return (
    <CreateReport
      report={aggregatedReport}
      reportType="AGGREGATED"
      isAdmin={user.isAdmin}
    />
  );
}
