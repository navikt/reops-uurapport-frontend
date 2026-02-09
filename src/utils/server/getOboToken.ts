import { requestOboToken } from "@navikt/oasis";
import { isMock, isLocal } from "@src/utils/server/environment";
import { tokenEndpoint, tokenRequestBody } from "@src/utils/server/urls";

const API_SCOPE = `api://${process.env.NAIS_CLUSTER_NAME}.${process.env.NAIS_NAMESPACE}.${process.env.BACKEND_APP_NAME}/.default`;

export const getOboToken = async (token: string): Promise<string> => {
  if (isMock) {
    return "fake token";
  }

  if (isLocal) {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestBody.toString(),
    });

    if (!response.ok) {
      throw new Error(
        "Failed to fetch docker auth token while running local backend",
      );
    }

    const payload = await response.json();
    const oboToken = payload?.access_token;

    if (!oboToken) {
      throw new Error("Docker auth response did not include access_token");
    }

    return oboToken;
  }

  const oboResult = await requestOboToken(token, API_SCOPE);

  if (!oboResult.ok) {
    console.error("Fail on-behalf-of token for api", {
      error: oboResult.error,
      details: oboResult,
    });
    throw new Error(
      `Request oboToken for uurapport-backend failed: ${oboResult.error || "Unknown error"}`,
    );
  }

  return oboResult.token;
};
