import CreateReport from "@/components/reportPages/CreateReport";
import NotFound from "@/components/notFound/NotFound";
import { getOboToken } from "@/utils/server/getOboToken";
import { getAuthToken } from "@/utils/server/getAuthToken";
import { apiUrl } from "@/utils/server/urls";
import type { Report, User } from "@src/types";

async function getData(id: string) {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const [reportResponse, userResponse] = await Promise.all([
    fetch(`${apiUrl}/api/reports/${id}`, {
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

  if (!reportResponse.ok) {
    const reportText = await reportResponse.text();
    console.error(`Report API error (${reportResponse.status}):`, reportText);
    return { report: null, user: null, notFound: true };
  }

  if (!userResponse.ok) {
    const userText = await userResponse.text();
    console.error(`User API error (${userResponse.status}):`, userText);
    throw new Error(`Failed to fetch user: ${userResponse.status}`);
  }

  const report: Report = await reportResponse.json();
  const user: User = await userResponse.json();

  return { report, user, notFound: false };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { report, user, notFound } = await getData(id);

  if (notFound || !report || !user) {
    return <NotFound resourceType="rapport" />;
  }

  return (
    <CreateReport report={report} reportType="SINGLE" isAdmin={user.isAdmin} />
  );
}
