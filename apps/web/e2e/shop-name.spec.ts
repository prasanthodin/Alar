import { readFileSync } from "node:fs"
import { join } from "node:path"
import { expect, test } from "@playwright/test"

test.skip(!process.env.E2E_BASE_URL, "Set E2E_BASE_URL to run against a running kernel and website")

/** A website variable from the environment, else from the website's own .env.local (what `next start` reads). */
function websiteEnv(name: string): string | undefined {
  if (process.env[name]?.trim()) return process.env[name]!.trim()
  try {
    // Playwright runs from apps/web (where playwright.config.ts is).
    const file = readFileSync(join(process.cwd(), ".env.local"), "utf8")
    const line = file.split("\n").find((l) => l.startsWith(`${name}=`))
    return line?.slice(name.length + 1).trim() || undefined
  } catch {
    return undefined
  }
}

test("the header and the page title show the shop name from settings", async ({ page, request }) => {
  const kernel = websiteEnv("NEXT_PUBLIC_MEDUSA_BACKEND_URL") ?? "http://localhost:9000"
  const key = websiteEnv("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
  test.skip(!key, "Needs the publishable key (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) to read the settings")

  const res = await request.get(`${kernel}/store/shop/settings`, { headers: { "x-publishable-api-key": key! } })
  expect(res.ok()).toBe(true)
  const { name } = (await res.json()) as { name: string }
  expect(name.length).toBeGreaterThan(0)

  for (const path of ["/", "/sign-in"]) {
    await page.goto(path)
    await expect(page.getByTestId("wordmark").first()).toHaveText(name.toLowerCase())
  }
  await page.goto("/")
  await expect(page).toHaveTitle(name.toLowerCase())
})
