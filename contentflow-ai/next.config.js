const path = require("path");

/** @type {import("next").NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Habilita el hook de instrumentacion (keep-alive loop interno)
  // Ver: src/instrumentation.ts
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
