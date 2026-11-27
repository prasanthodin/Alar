import { tmpdir } from "node:os"
import { join } from "node:path"
import { defineConfig, devices } from "@playwright/test"

// Admin smoke tests against an already running kernel (its dashboard at /app).
// Skipped unless ADMIN_E2E_BASE_URL is set (for example http://localhost:9000).
export default defineConfig({
  testDir: "./e2e",
  // Outside the app: `medusa develop` restarts the kernel when files in it change.
  outputDir: join(tmpdir(), "shop-commerce-e2e-results"),
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  timeout: 120_000,
  use: {
    baseURL: process.env.ADMIN_E2E_BASE_URL,
    trace: "off",
    viewport: { width: 1440, height: 900 },
    // Optional: a locally installed Chrome when Playwright's own browser is not installed.
    ...(process.env.E2E_CHROME_PATH ? { launchOptions: { executablePath: process.env.E2E_CHROME_PATH } } : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
})
