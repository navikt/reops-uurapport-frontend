enum ServerEnv {
  mock = "mock",
  local = "local",
  devGcp = "dev-gcp",
  prodGcp = "prod-gcp",
}

import { getEnvironment, isMock, isLocal } from "@src/utils/server/environment";

const API_URLS: Record<ServerEnv, string> = {
  [ServerEnv.mock]: "http://127.0.0.1:8787",
  [ServerEnv.local]: "http://localhost:8787",
  [ServerEnv.devGcp]: `http://${process.env.BACKEND_APP_NAME}`,
  [ServerEnv.prodGcp]: `http://${process.env.BACKEND_APP_NAME}`,
};

export const loginUrl = (redirectUrl: string = "") =>
  `/oauth2/login?redirect=${redirectUrl}`;

export const apiUrl = API_URLS[getEnvironment() as ServerEnv];

const AUTH_SERVER_URL = "http://localhost:8080/issueissue/token";
const AUTH_CLIENT_ID = "a11y";
const AUTH_CLIENT_SECRET = "ignored";
const AUTH_SCOPE = "a11y";

export const tokenEndpoint = AUTH_SERVER_URL;
export const tokenRequestBody = new URLSearchParams({
  grant_type: "client_credentials",
  client_id: AUTH_CLIENT_ID,
  client_secret: AUTH_CLIENT_SECRET,
  scope: AUTH_SCOPE,
});

export const isUsingRealBackend = !isMock;
export const isUsingLocalBackend = isLocal;
