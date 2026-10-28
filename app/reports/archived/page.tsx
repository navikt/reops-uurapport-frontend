import ArchivedReportList from "@/components/ArchivedReportList/ArchivedReportList";
import { getArchivedReports, getUserDetails } from "@src/actions/reportActions";
import { Link } from "@navikt/ds-react";

export default async function ArchivedReportsPage() {
  const [reports, user] = await Promise.all([
    getArchivedReports(),
    getUserDetails(),
  ]);

  return (
    <>
      <p>
        <Link href="/reports">Tilbake til alle rapporter</Link>
      </p>
      <ArchivedReportList reports={reports} isAdmin={user.isAdmin} />
    </>
  );
}
