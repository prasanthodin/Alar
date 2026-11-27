import { join } from "node:path"
import { expect, test } from "@playwright/test"

test.skip(!process.env.ADMIN_E2E_BASE_URL, "Set ADMIN_E2E_BASE_URL to run against a running kernel")

// An admin made with `medusa user` (admins exist only that way; see docs/designs.md).
const EMAIL = process.env.ADMIN_E2E_EMAIL ?? "owner-e2e@example.test"
const PASSWORD = process.env.ADMIN_E2E_PASSWORD ?? "owner-e2e-pass-1"
const MOCK = join(__dirname, "../../mobile/public/mock")
const SCREENSHOT = join(__dirname, "../../../docs/screenshots/admin-designs.png")

test("the Owner creates a Design with two photos, sees what is missing, confirms and publishes", async ({ page }) => {
  const name = `Arani silk saree ${Date.now()}`

  await page.goto("/app/login")
  await page.locator('input[name="email"]').fill(EMAIL)
  await page.locator('input[name="password"]').fill(PASSWORD)
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 })

  // The Designs page is in the sidebar.
  await page.getByRole("link", { name: "Designs" }).click()
  await expect(page.getByRole("heading", { name: "Designs", level: 1 })).toBeVisible()

  // Create: every field, two photos, a whole-rupee price.
  await page.getByRole("button", { name: "Create design" }).click()
  const panel = page.getByRole("dialog")
  await panel.getByLabel("Name").fill(name)
  await panel.getByLabel("Description").fill("Maroon with a temple border")
  await panel.getByLabel("Fibre").fill("Silk")
  await panel.getByLabel("Weave").fill("Arani")
  await panel.getByLabel("Length (metres)").fill("6.3")
  await panel.getByLabel("Width (metres)").fill("1.14")
  await panel.getByLabel("Care").fill("Dry clean only")
  await panel.getByLabel("Country of origin").fill("India")
  // Tax codes come from the settings (codes with a band now); nothing is chosen for the Owner.
  await expect(panel.getByLabel("Tax code")).toContainText("Choose a tax code")
  await panel.getByLabel("Tax code").click()
  await page.getByRole("option", { name: "saree", exact: true }).click()
  await panel.getByLabel("Blouse piece included").click()
  await panel.getByLabel(/Price in rupees/).fill("3150")
  await panel.locator('input[type="file"]').setInputFiles([
    join(MOCK, "1-1-maroon.jpg"),
    join(MOCK, "2-1-closeup-maroon.jpg"),
  ])
  await expect(panel.getByTestId("design-photo")).toHaveCount(2, { timeout: 30_000 })
  await panel.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText("Design saved as unpublished.")).toBeVisible()
  await expect(panel.getByRole("heading", { name: "Edit design" })).toBeVisible()

  // Publishing without a close-up or the confirmation is refused, naming both.
  await panel.getByRole("button", { name: "Publish", exact: true }).click()
  const missing = panel.getByTestId("publish-missing")
  await expect(missing).toBeVisible()
  await expect(missing.locator("[data-requirement]")).toHaveCount(2)
  await expect(missing.locator('[data-requirement="fabricCloseUpPhoto"]')).toHaveText("A fabric close-up photo")
  await expect(missing.locator('[data-requirement="trueColourConfirmation"]')).toHaveText(
    "Your confirmation that the photos show the true colour"
  )

  // Mark the second photo as the close-up, save, confirm the true colour and publish.
  await panel.getByLabel("Fabric close-up").nth(1).click()
  await panel.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText("Design saved.")).toBeVisible()
  await panel.getByLabel("I confirm the photos show the saree's true colour.").click()
  await panel.getByRole("button", { name: "Publish", exact: true }).click()
  await expect(panel.getByText("This design is published.")).toBeVisible()

  // The list shows it published, at Rs 3,150.
  await panel.getByRole("button", { name: "Cancel" }).click()
  const row = page.getByTestId("design-row").filter({ hasText: name })
  await expect(row).toContainText("₹3,150")
  await expect(row).toContainText("Published")
  // A fresh load (no notices over the list) for the screenshot.
  await page.reload()
  await expect(page.getByTestId("design-row").filter({ hasText: name })).toContainText("Published")
  await page.screenshot({ path: SCREENSHOT, fullPage: true })
})
