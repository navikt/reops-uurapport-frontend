import NextLink from "next/link";
import { Button } from "@navikt/ds-react";
import { apiUrl } from "@src/utils/server/urls";
import { getOboToken } from "@src/utils/server/getOboToken";
import { getAuthToken } from "@src/utils/server/getAuthToken";
import ReportList from "@src/components/ReportList/ReportList";
import Forbidden from "@src/components/forbidden/Forbidden";
import type { ReportSummary, User } from "@src/types";
import styles from "./admin.module.css";

async function getUserDetails(): Promise<User> {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const response = await fetch(`${apiUrl}/api/user`, {
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
    throw new Error(`Failed to fetch user: ${response.status}`);
  }

  return response.json();
}

async function getAggregatedReports(): Promise<ReportSummary[]> {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const response = await fetch(`${apiUrl}/api/reports/aggregated`, {
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
    throw new Error(`Failed to fetch aggregated reports: ${response.status}`);
  }

  return response.json();
}

export default async function AdminPage() {
  const user = await getUserDetails();
  const reports = await getAggregatedReports();

  if (!user.isAdmin) {
    return <Forbidden />;
  }

  return (
    <span>
      <div className={styles.headingAndButton}>
        <h1>Admin</h1>
        <NextLink href="/admin/create-report" passHref legacyBehavior>
          <Button as="a">Opprett en samslått rapport</Button>
        </NextLink>
        <NextLink
          href="https://myaccount.microsoft.com/groups/07bca51b-e5dc-484a-ac09-685e61244b6b"
          passHref
          legacyBehavior
        >
          <Button as="a">Legg til admin i Azure</Button>
        </NextLink>
      </div>
      <div className={styles.content}>
        <ReportList reports={reports} />
      </div>
    </span>
  );
}
