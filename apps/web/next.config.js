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
  // A Design page opened with a preview token (Story 1.8): the token is in the
  // address, so the page is never cached and never sent on as a referrer.
  async headers() {
    return [
      {
        source: "/designs/:handle",
        has: [{ type: "query", key: "preview" }],
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
