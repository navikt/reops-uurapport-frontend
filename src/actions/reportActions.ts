"use server";

import type { ReportSummary } from "@src/types";
import { apiUrl } from "@src/utils/server/urls";
import { getOboToken } from "@src/utils/server/getOboToken";
import { getAuthToken } from "@src/utils/server/getAuthToken";

/**
 * Server Action to fetch all reports with OBO token
 * This can be called from Server Components directly
 */
export async function getReports(): Promise<ReportSummary[]> {
  const token = await getAuthToken();
  const oboToken = await getOboToken(token);

  const response = await fetch(`${apiUrl}/api/reports`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${oboToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.status}`);
  }

  return response.json();
}
