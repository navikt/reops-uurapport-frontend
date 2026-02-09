export type Environment = "mock" | "local" | "dev-gcp" | "prod-gcp";

const deriveEnvironment = (): Environment => {
  const overrideEnv = (
    process.env.APP_ENV ??
    process.env.VITE_APP_ENV ??
    ""
  ).toLowerCase();

  if (overrideEnv === "mock") {
    return "mock";
  }

  if (overrideEnv === "local") {
    return "local";
  }

  if (process.env.NAIS_CLUSTER_NAME === "dev-gcp") {
    return "dev-gcp";
  }

  if (process.env.NAIS_CLUSTER_NAME === "prod-gcp") {
    return "prod-gcp";
  }

  if (process.env.NODE_ENV === "development") {
    return "dev-gcp";
  }

  return "prod-gcp";
};

const environment = deriveEnvironment();

export const isMock = environment === "mock";
export const isLocal = environment === "local";

export const getEnvironment = () => environment;
