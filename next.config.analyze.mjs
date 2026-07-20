import bundleAnalyzer from "@next/bundle-analyzer";
import nextConfig from "./next.config.js";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
