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

const getDevBaseUrl = () => {
  if (window.location.href.includes('beta.ansatt.dev.nav.no')) {
    return 'https://reops-a11y-statement-ny-beta.ansatt.dev.nav.no';
  }
  return 'https://reops-a11y-statement-ny.ansatt.dev.nav.no';
};

const BASE_URL: { [key in ENV]: string } = {
  mock: 'http://localhost:4321',
  local: 'http://localhost:4322',
  development: getDevBaseUrl(),
  production: 'https://reops-a11y-statement-ny.ansatt.nav.no',
};

const API_PROXY_URL = `${BASE_URL[getEnvironment()]}/api/proxy`;

export const apiProxyUrl = API_PROXY_URL;
