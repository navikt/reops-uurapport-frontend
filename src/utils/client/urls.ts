enum ENV {
  mock = 'mock',
  local = 'local',
  development = 'development',
  production = 'production',
}

const sanitizeBase = (value: string) => value.replace(/\/$/, '');

const resolveHostedBase = () => {
  const configuredIngress = import.meta.env.VITE_WONDERWALL_INGRESS?.trim();
  if (configuredIngress) {
    return sanitizeBase(configuredIngress);
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return sanitizeBase(window.location.origin);
  }

  return '';
};

const getOverrideEnv = (): ENV | null => {
  const env = (import.meta.env.VITE_APP_ENV ?? '').toString().toLowerCase();
  if (env === ENV.mock) return ENV.mock;
  if (env === ENV.local) return ENV.local;
  return null;
};

const getEnvironment = (): ENV => {
  // Use local when running in Vite dev server (npm run dev)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    return ENV.local;
  }
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
  local: 'http://localhost:4321',
  development: resolveHostedBase(),
  production: resolveHostedBase(),
};

const withProxyPath = (base: string) => {
  if (!base) {
    return '/api/proxy';
  }

  return `${sanitizeBase(base)}/api/proxy`;
};

const API_PROXY_URL = withProxyPath(BASE_URL[getEnvironment()]);

export const apiProxyUrl = API_PROXY_URL;
