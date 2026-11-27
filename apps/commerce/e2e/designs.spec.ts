import { join } from "node:path"
import { expect, test } from "@playwright/test"

test.skip(!process.env.ADMIN_E2E_BASE_URL, "Set ADMIN_E2E_BASE_URL to run against a running kernel")

// An admin made with `medusa user` (admins exist only that way; see docs/designs.md).
const EMAIL = process.env.ADMIN_E2E_EMAIL ?? "owner-e2e@example.test"
const PASSWORD = process.env.ADMIN_E2E_PASSWORD ?? "owner-e2e-pass-1"
const MOCK = join(__dirname, "../../mobile/public/mock")
const SCREENSHOT = join(__dirname, "../../../docs/screenshots/admin-designs.png")
const STOCK_SCREENSHOT = join(__dirname, "../../../docs/screenshots/admin-design-stock.png")

test("the Owner creates a Design with two photos, sees what is missing, confirms, publishes and sets its stock", async ({ page }) => {
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

  // Stock (Story 1.7): set it to 10 Pieces with a reason and see the row in the history.
  const stock = panel.getByTestId("design-stock")
  await expect(stock.getByTestId("stock-stocked")).toHaveText("0")
  await expect(stock.getByText("No stock changes yet.")).toBeVisible()
  // A reason is required: without one nothing is sent.
  await stock.getByLabel("Set stock to (pieces)").fill("10")
  await stock.getByRole("button", { name: "Set stock" }).click()
  await expect(stock.getByText("Enter a reason of up to 200 characters.")).toBeVisible()
  await expect(stock.getByTestId("stock-stocked")).toHaveText("0")
  await stock.getByLabel("Reason (required)").fill("First delivery from the weaver")
  await stock.getByRole("button", { name: "Set stock" }).click()
  await expect(page.getByText("Stock changed. In stock: 10.")).toBeVisible()
  await expect(stock.getByTestId("stock-stocked")).toHaveText("10")
  await expect(stock.getByTestId("stock-reserved")).toHaveText("0")
  await expect(stock.getByTestId("stock-available")).toHaveText("10")
  const movement = stock.getByTestId("stock-movement")
  await expect(movement).toHaveCount(1)
  await expect(movement.first()).toContainText("Manual adjustment")
  await expect(movement.first().getByTestId("stock-movement-change")).toHaveText("+10")
  await expect(movement.first()).toContainText(EMAIL)
  await expect(movement.first()).toContainText("First delivery from the weaver")

  // Add 1 piece, then remove 1 piece: each a row of its own, newest first.
  await stock.getByLabel("Reason (required)").fill("Found one more in the back room")
  await stock.getByRole("button", { name: "Add 1 piece" }).click()
  await expect(stock.getByTestId("stock-stocked")).toHaveText("11")
  await expect(movement).toHaveCount(2)
  await expect(movement.first().getByTestId("stock-movement-change")).toHaveText("+1")
  await expect(movement.first()).toContainText("Found one more in the back room")
  await stock.getByLabel("Reason (required)").fill("Damaged while folding")
  await stock.getByRole("button", { name: "Remove 1 piece" }).click()
  await expect(stock.getByTestId("stock-stocked")).toHaveText("10")
  await expect(movement).toHaveCount(3)
  await expect(movement.first().getByTestId("stock-movement-change")).toHaveText("-1")

  // A refused change shows its message and leaves the count as it was. (Pieces are
  // reserved only from Story 1.9, so the refusal is answered here by the test.)
  const stockUrl = /\/admin\/shop\/designs\/[^/]+\/stock$/
  await page.route(stockUrl, (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ code: "stock.below_reserved", message: "below reserved" }),
        })
      : route.fallback()
  )
  await stock.getByLabel("Reason (required)").fill("Miscount")
  await stock.getByRole("button", { name: "Remove 1 piece" }).click()
  await expect(page.getByText("Stock cannot go below the pieces already held for shoppers.")).toBeVisible()
  await page.unroute(stockUrl)
  await expect(stock.getByTestId("stock-stocked")).toHaveText("10")
  await expect(movement).toHaveCount(3)
  await stock.scrollIntoViewIfNeeded()
  await page.screenshot({ path: STOCK_SCREENSHOT })

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
