import { headers } from "next/headers";
import { getToken, validateToken } from "@navikt/oasis";
import { isMock, isLocal } from "./environment";
import { redirect } from "next/navigation";
import { loginUrl } from "./urls";

/**
 * Get and validate the authentication token
 * This function must be called from Server Components or Server Actions
 */
export async function getAuthToken(): Promise<string> {
  // In mock mode, return a fake token
  if (isMock) {
    return "mock-token";
  }

  const headersList = await headers();
  const token = getToken(headersList);

  // In local mode, return token without validation
  if (isLocal) {
    return token || "";
  }

  // In production, validate the token
  if (!token) {
    console.log("Token not found");
    redirect(loginUrl());
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    console.log("Validation failed!");
    redirect(loginUrl());
  }

  return token;
}
