const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
};

module.exports = nextConfig;

