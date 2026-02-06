/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Node.js deployment
  output: "standalone",

  // Enable React strict mode
  reactStrictMode: true,

  // Configure environment variables
  env: {
    // Server-side environment variables
    APP_ENV: process.env.APP_ENV || "local",
    VITE_APP_ENV: process.env.VITE_APP_ENV || "local",
    NAIS_CLUSTER_NAME: process.env.NAIS_CLUSTER_NAME,
    NAIS_NAMESPACE: process.env.NAIS_NAMESPACE,
    BACKEND_APP_NAME: process.env.BACKEND_APP_NAME,
    VITE_WONDERWALL_INGRESS: process.env.VITE_WONDERWALL_INGRESS,

    // Client-side environment variables (must have NEXT_PUBLIC_ prefix)
    NEXT_PUBLIC_APP_ENV:
      process.env.APP_ENV || process.env.VITE_APP_ENV || "local",
    NEXT_PUBLIC_WONDERWALL_INGRESS: process.env.VITE_WONDERWALL_INGRESS,
  },

  // Transpile NAV packages
  transpilePackages: ["@navikt/ds-react", "@navikt/aksel-icons"],

  // Configure serverExternalPackages for server-only modules
  serverExternalPackages: ["@navikt/oasis"],

  // Experimental features
  experimental: {
    // Enable server actions for mutations
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
