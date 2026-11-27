import { defineConfig, devices } from "@playwright/test"

// Runs against an already running website and kernel. Skipped unless E2E_BASE_URL is set.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: "off",
    // Optional: a locally installed Chrome when Playwright's own browser is not installed.
    ...(process.env.E2E_CHROME_PATH
      ? { launchOptions: { executablePath: process.env.E2E_CHROME_PATH } }
      : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
