enum ENV {
  mock = 'mock',
  local = 'local',
  development = 'development',
  production = 'production',
}

const getOverrideEnv = (): ENV | null => {
  const env = (import.meta.env.VITE_APP_ENV ?? '').toString().toLowerCase();
  if (env === ENV.mock) return ENV.mock;
  if (env === ENV.local) return ENV.local;
  return null;
};

const getEnvironment = (): ENV => {
  const override = getOverrideEnv();
  if (override) return override;
  if (window.location.href.includes('dev.nav.no')) {
    return ENV.development;
  }
  if (window.location.href.includes('ansatt.nav.no')) {
    return ENV.production;
  }
  return ENV.mock;
};

const BASE_URL: { [key in ENV]: string } = {
  mock: 'http://localhost:4321',
  local: 'http://localhost:4322',
  development: `${process.env.WONDERWALL_INGRESS}`,
  production: `${process.env.WONDERWALL_INGRESS}`
};

const API_PROXY_URL = `${BASE_URL[getEnvironment()]}/api/proxy`;

export const apiProxyUrl = API_PROXY_URL;
