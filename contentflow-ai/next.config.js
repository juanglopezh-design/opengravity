const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Fija la raiz del proyecto para que Next.js no se confunda
  // cuando hay multiples package-lock.json en el monorepo.
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;