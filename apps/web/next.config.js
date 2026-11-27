const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source.
  transpilePackages: ["@shop/api-client", "@shop/contracts", "@shop/tokens"],
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
