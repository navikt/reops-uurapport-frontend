import { getReportDiagnostics } from "@src/actions/reportActions";
import { getAuthToken } from "@src/utils/server/getAuthToken";
import { getOboToken } from "@src/utils/server/getOboToken";
import { apiUrl } from "@src/utils/server/urls";
import Forbidden from "@src/components/forbidden/Forbidden";
import type { User } from "@src/types";
import { Table, Heading, BodyLong, Link } from "@navikt/ds-react";
import styles from "./diagnostics.module.css";

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

export default async function DiagnosticsPage() {
  const user = await getUserDetails();

  if (!user.isAdmin) {
    return <Forbidden />;
  }

  const diagnostics = await getReportDiagnostics();

  return (
    <div className={styles.container}>
      <Heading level="1" size="xlarge" spacing>
        Rapport Diagnostikk
      </Heading>

      <div className={styles.summary}>
        <BodyLong size="large" spacing>
          Totalt antall rapporter: <strong>{diagnostics.totalReports}</strong>
        </BodyLong>
        <BodyLong size="large" spacing>
          Rapporter uten team:{" "}
          <strong>{diagnostics.reportsWithNullOrganizationUnit}</strong>
        </BodyLong>
      </div>

      {diagnostics.nullOrgReportIds.length > 0 && (
        <>
          <Heading level="2" size="large" spacing>
            Rapporter som mangler team
          </Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Rapport Type</Table.ColumnHeader>
                <Table.ColumnHeader>Navn</Table.ColumnHeader>
                <Table.ColumnHeader>URL</Table.ColumnHeader>
                <Table.ColumnHeader>Rapport ID</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {diagnostics.nullOrgReportIds.map((report) => (
                <Table.Row key={report.reportId}>
                  <Table.DataCell>
                    {report.reportType === "SINGLE" ? "Enkelt" : "Samslått"}
                  </Table.DataCell>
                  <Table.DataCell>
                    {report.reportType === "SINGLE" ? (
                      <Link href={`/reports/${report.reportId}`}>
                        {report.descriptiveName || "(Uten navn)"}
                      </Link>
                    ) : (
                      <Link href={`/reports/aggregated/${report.reportId}`}>
                        {report.descriptiveName || "(Uten navn)"}
                      </Link>
                    )}
                  </Table.DataCell>
                  <Table.DataCell>
                    <Link
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {report.url}
                    </Link>
                  </Table.DataCell>
                  <Table.DataCell>
                    <code>{report.reportId}</code>
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      )}
    </div>
  );
}
