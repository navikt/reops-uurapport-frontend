import ReportList from "@/components/ReportList/ReportList";
import CreateReportModal from "@/components/Modal/createReportModal/CreateReportModal";
import { getReports } from "@src/actions/reportActions";
import styles from "./reports.module.css";
import { Suspense } from "react";
import { ArchiveIcon } from "@navikt/aksel-icons";
import { LinkButton } from "@components/LinkButton";

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <>
      <div className={styles.headingAndButton}>
        <h1 className={styles.h1}>Alle rapporter</h1>
        <div className={styles.actions}>
          <LinkButton
            href="/reports/archived"
            variant="secondary"
            icon={<ArchiveIcon aria-hidden />}
          >
            Arkiverte rapporter
          </LinkButton>
          <CreateReportModal />
        </div>
      </div>
      <div className={styles.content}>
        <Suspense fallback={null}>
          <ReportList reports={reports} />
        </Suspense>
      </div>
    </>
  );
}
