import ArchivedReportList from "@/components/ArchivedReportList/ArchivedReportList";
import { getArchivedReports, getUserDetails } from "@src/actions/reportActions";

export default async function ArchivedReportsPage() {
  const [reports, user] = await Promise.all([
    getArchivedReports(),
    getUserDetails(),
  ]);

  return <ArchivedReportList reports={reports} isAdmin={user.isAdmin} />;
}
