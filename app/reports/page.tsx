import ReportList from "@/components/ReportList/ReportList";
import CreateReportModal from "@/components/Modal/createReportModal/CreateReportModal";
import { getAllReports } from "@src/actions/reportActions";
import { Suspense } from "react";
import { ArchiveIcon } from "@navikt/aksel-icons";
import { LinkButton } from "@components/LinkButton";
import { PageHeader } from "@components/layout/PageHeader";
import { Heading } from "@navikt/ds-react";

export default async function ReportsPage() {
  const reports = await getAllReports();

  return (
    <>
      <PageHeader
        actions={
          <>
            <LinkButton
              href="/reports/archived"
              variant="secondary"
              icon={<ArchiveIcon aria-hidden />}
            >
              Arkiverte rapporter
            </LinkButton>
            <CreateReportModal />
          </>
        }
      >
        <Heading level="1" size="xlarge">
          Alle rapporter
        </Heading>
      </PageHeader>
      <Suspense fallback={null}>
        <ReportList reports={reports} />
      </Suspense>
    </>
  );
}
