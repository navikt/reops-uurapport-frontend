export type Environment = 'mock' | 'local' | 'dev' | 'prod';

const deriveEnvironment = (): Environment => {
  const overrideEnv = (process.env.APP_ENV ?? process.env.VITE_APP_ENV ?? '').toLowerCase();

  if (overrideEnv === 'mock') {
    return 'mock';
  }

  if (overrideEnv === 'local') {
    return 'local';
  }

  if (process.env.NAIS_CLUSTER_NAME === 'dev-gcp') {
    return 'dev';
  }

  if (process.env.NODE_ENV === 'development') {
    return 'dev';
  }

  return 'prod';
};

const environment = deriveEnvironment();

export const isMock = environment === 'mock';
export const isLocal = environment === 'local';

export const getEnvironment = () => environment;
