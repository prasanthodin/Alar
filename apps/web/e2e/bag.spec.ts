import { readFileSync } from "node:fs"
import { join } from "node:path"
import { expect, request as playwrightRequest, test, type APIRequestContext, type Page } from "@playwright/test"
import en from "../messages/en.json"

test.skip(!process.env.E2E_BASE_URL, "Set E2E_BASE_URL to run against a running kernel and website")
test.describe.configure({ mode: "serial" })

/** A website variable from the environment, else from the website's own .env.local (what `next start` reads). */
function websiteEnv(name: string): string | undefined {
  if (process.env[name]?.trim()) return process.env[name]!.trim()
  try {
    const file = readFileSync(join(process.cwd(), ".env.local"), "utf8")
    const line = file.split("\n").find((l) => l.startsWith(`${name}=`))
    const value = line?.slice(name.length + 1).trim()
    return value?.replace(/^(["'])(.*)\1$/, "$2") || undefined
  } catch {
    return undefined
  }
}

// The Owner's side is set up through the admin shop routes, as the Admin does it:
// an admin made with `medusa user`, signed in to a session cookie, writes from an admin origin.
const KERNEL = (websiteEnv("NEXT_PUBLIC_MEDUSA_BACKEND_URL") ?? "http://localhost:9000").replace(/\/+$/, "")
const ADMIN_ORIGIN = process.env.ADMIN_E2E_ORIGIN ?? new URL(KERNEL).origin
const EMAIL = process.env.ADMIN_E2E_EMAIL ?? "owner-e2e@example.test"
const PASSWORD = process.env.ADMIN_E2E_PASSWORD ?? "owner-e2e-pass-1"
const MOCK = join(process.cwd(), "../mobile/public/mock")
const SCREENSHOTS = join(process.cwd(), "../../docs/screenshots")

const stamp = `${Date.now()}`
const NAMES = {
  available: `Arani silk saree ${stamp}`,
  soldOut: `Banarasi silk saree ${stamp}`,
  draft: `Kasavu cotton saree ${stamp}`,
}

type Made = { id: string; handle: string }
let admin: APIRequestContext
let available: Made
let soldOut: Made
let draft: Made

async function ok<T>(res: Awaited<ReturnType<APIRequestContext["post"]>>, what: string): Promise<T> {
  if (!res.ok()) throw new Error(`${what}: HTTP ${res.status()} ${await res.text()}`)
  return (await res.json()) as T
}

/** A Design with two photos and a price, published or not, with this many Pieces. */
async function makeDesign(name: string, opts: { publish: boolean; stock: number }): Promise<Made> {
  const headers = { origin: ADMIN_ORIGIN }
  const form = new FormData()
  form.append("files", new Blob([readFileSync(join(MOCK, "1-1-maroon.jpg"))], { type: "image/jpeg" }), "drape.jpg")
  form.append("files", new Blob([readFileSync(join(MOCK, "2-1-closeup-maroon.jpg"))], { type: "image/jpeg" }), "closeup.jpg")
  const { files } = await ok<{ files: { id: string }[] }>(
    await admin.post("/admin/shop/uploads", { headers, multipart: form }),
    "upload photos"
  )
  const { design } = await ok<{ design: { id: string } }>(
    await admin.post("/admin/shop/designs", {
      headers,
      data: {
        name,
        description: "Maroon with a temple border, woven on a pit loom.",
        attributes: {
          fibre: "Silk",
          weave: "Arani",
          lengthM: 6.3,
          widthM: 1.14,
          blousePieceIncluded: true,
          care: "Dry clean only",
          countryOfOrigin: "India",
          taxCode: "saree",
        },
        photos: [
          { fileId: files[0]!.id, role: "other", position: 0 },
          { fileId: files[1]!.id, role: "close_up", position: 1 },
        ],
        priceRupees: 3150,
      },
    }),
    "create design"
  )
  if (opts.publish) {
    await ok(await admin.post(`/admin/shop/designs/${design.id}/publish`, { headers, data: { trueColourConfirmed: true } }), "publish")
  }
  if (opts.stock > 0) {
    await ok(
      await admin.post(`/admin/shop/designs/${design.id}/stock`, { headers, data: { set: opts.stock, reason: "End-to-end test stock" } }),
      "set stock"
    )
  }
  // The handle is the Design's address on the website; read it from the preview link.
  const { url } = await ok<{ url: string }>(await admin.post(`/admin/shop/designs/${design.id}/preview`, { headers }), "preview")
  return { id: design.id, handle: decodeURIComponent(new URL(url).pathname.split("/").pop()!) }
}

test.beforeAll(async () => {
  admin = await playwrightRequest.newContext({ baseURL: KERNEL })
  const { token } = await ok<{ token: string }>(
    await admin.post("/auth/user/emailpass", { data: { email: EMAIL, password: PASSWORD } }),
    "admin sign-in"
  )
  // The session cookie stays in this request context for the shop admin routes.
  await ok(await admin.post("/auth/session", { headers: { authorization: `Bearer ${token}` } }), "admin session")
  available = await makeDesign(NAMES.available, { publish: true, stock: 2 })
  soldOut = await makeDesign(NAMES.soldOut, { publish: true, stock: 0 })
  draft = await makeDesign(NAMES.draft, { publish: false, stock: 3 })
})

test.afterAll(async () => {
  await admin?.dispose()
})

async function screenshot(page: Page, name: string) {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    // A full-page picture shows photos below the fold too, which a lazy photo only loads when scrolled to;
    // load them all now, then wait for every one, so the picture shows what a Shopper sees.
    await page.evaluate(() => {
      for (const img of Array.from(document.images)) img.loading = "eager"
    })
    await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete))
    // The development server's own indicator is not part of the page.
    await page.screenshot({
      path: join(SCREENSHOTS, `web-${name}-${width}.png`),
      fullPage: true,
      style: "nextjs-portal { display: none !important; }",
    })
  }
  await page.setViewportSize({ width: 1280, height: 720 })
}

const card = (page: Page, name: string) => page.getByTestId("design-card").filter({ hasText: name })

test("home lists the published Designs with photo, name and price, and not the unpublished one", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: en["home.title"], level: 1 })).toBeVisible()
  const arani = card(page, NAMES.available)
  await expect(arani).toBeVisible()
  await expect(arani.getByTestId("design-card-price")).toHaveText("₹3,150")
  await expect(arani.locator("img")).toHaveAttribute("alt", NAMES.available)
  await expect(card(page, NAMES.soldOut)).toContainText(en["design.soldOut"])
  await expect(card(page, NAMES.draft)).toHaveCount(0)
  // No filters and no search in Epic 1.
  await expect(page.getByRole("searchbox")).toHaveCount(0)
})

test("the Design page shows photos, price with the tax note, description, details and In stock", async ({ page }) => {
  await page.goto("/")
  await card(page, NAMES.available).click()
  await expect(page).toHaveURL(new RegExp(`/designs/${available.handle}$`))
  await expect(page.getByTestId("design-name")).toHaveText(NAMES.available)
  await expect(page.getByTestId("design-price")).toHaveText("₹3,150")
  await expect(page.getByTestId("tax-note")).toHaveText(en["price.taxNote"])
  await expect(page.getByTestId("design-description")).toContainText("pit loom")
  const details = page.getByTestId("design-details")
  for (const [label, value] of [
    [en["detail.fibre"], "Silk"],
    [en["detail.weave"], "Arani"],
    [en["detail.length"], "6.3 m"],
    [en["detail.width"], "1.14 m"],
    [en["detail.blousePiece"], en["detail.blousePieceIncluded"]],
    [en["detail.care"], "Dry clean only"],
    [en["detail.countryOfOrigin"], "India"],
  ]) {
    await expect(details.locator("div").filter({ hasText: label! }).locator("dd")).toHaveText(value!)
  }
  await expect(page.locator("main img")).toHaveCount(2)
  await expect(page.getByTestId("stock-status")).toHaveText(en["design.inStock"])
  await expect(page.getByTestId("add-to-bag")).toBeEnabled()
  await expect(page.locator("body")).not.toContainText(/weaver/i)
  await expect(page.locator("body")).not.toContainText(/\bcart\b/i)
  await screenshot(page, "design")
})

test("a sold-out Design is shown, with Add to bag disabled", async ({ page }) => {
  await page.goto(`/designs/${soldOut.handle}`)
  await expect(page.getByTestId("design-name")).toHaveText(NAMES.soldOut)
  await expect(page.getByTestId("stock-status")).toHaveText(en["design.soldOut"])
  await expect(page.getByTestId("add-to-bag")).toBeDisabled()
  await expect(page.getByTestId("add-to-bag")).toHaveText(en["design.soldOut"])
})

test("an unpublished Design is not found, except through the Admin's preview link", async ({ page }) => {
  const res = await page.goto(`/designs/${draft.handle}`)
  expect(res?.status()).toBe(404)
  await expect(page.getByRole("heading", { name: en["notFound.title"] })).toBeVisible()

  const { url } = await ok<{ url: string }>(
    await admin.post(`/admin/shop/designs/${draft.id}/preview`, { headers: { origin: ADMIN_ORIGIN } }),
    "preview"
  )
  const link = new URL(url)
  const previewPage = await page.goto(`${link.pathname}${link.search}`)
  // The token is in the address: never cached, never sent on as a referrer.
  expect(previewPage?.headers()["referrer-policy"]).toBe("no-referrer")
  expect(previewPage?.headers()["cache-control"]).toContain("no-store")
  await expect(page.getByTestId("design-name")).toHaveText(NAMES.draft)
  await expect(page.getByTestId("preview-note")).toBeVisible()
  await expect(page.getByTestId("add-to-bag")).toBeDisabled()

  const tampered = new URLSearchParams(link.search)
  tampered.set("preview", `${tampered.get("preview")!.slice(0, -2)}xx`)
  expect((await page.goto(`${link.pathname}?${tampered}`))?.status()).toBe(404)
})

test("add, change and remove: every amount from the server, delivery shown before checkout", async ({ page }) => {
  await page.goto(`/designs/${available.handle}`)
  await page.getByTestId("add-to-bag").click()
  await expect(page.getByTestId("add-to-bag-done")).toContainText(en["design.added"])
  await expect(page.getByTestId("bag-count")).toHaveText("1")

  await page.getByRole("link", { name: en["design.goToBag"] }).click()
  await expect(page).toHaveURL(/\/bag$/)
  await expect(page.getByRole("heading", { name: en["bag.title"], level: 1 })).toBeVisible()
  const line = page.getByTestId("bag-line").filter({ hasText: NAMES.available })
  await expect(line.getByTestId("bag-quantity")).toHaveText("1")
  await expect(line.getByTestId("bag-line-total")).toHaveText("₹3,150")
  await expect(page.getByTestId("bag-delivery")).toHaveText("₹0")
  await expect(page.getByTestId("bag-total")).toHaveText("₹3,150")
  await expect(page.getByTestId("bag-summary")).toContainText(en["bag.totalMrpOne"])

  await line.getByTestId("bag-increase").click()
  await expect(line.getByTestId("bag-quantity")).toHaveText("2")
  await expect(line.getByTestId("bag-line-total")).toHaveText("₹6,300")
  await expect(page.getByTestId("bag-total")).toHaveText("₹6,300")
  // Two Pieces are all there are: the stepper stops and says why.
  await expect(line.getByTestId("bag-increase")).toBeDisabled()
  await expect(line.getByTestId("bag-stock-limit")).toHaveText(en["bag.onlyAvailable"].replace("{n}", "2"))
  await screenshot(page, "bag")

  await line.getByTestId("bag-decrease").click()
  await expect(line.getByTestId("bag-quantity")).toHaveText("1")
  await expect(page.getByTestId("bag-total")).toHaveText("₹3,150")

  await line.getByTestId("bag-remove").click()
  await expect(page.getByTestId("bag-empty")).toBeVisible()
  await expect(page.getByTestId("bag-count")).toHaveCount(0)
})

test("asking for more Pieces than are available is refused and the Bag keeps its quantity", async ({ page }) => {
  await page.goto(`/designs/${available.handle}`)
  const add = page.getByTestId("add-to-bag")
  await add.click()
  await expect(page.getByTestId("bag-count")).toHaveText("1")
  await add.click()
  await expect(page.getByTestId("bag-count")).toHaveText("2")
  // A third would be more than the two available.
  await add.click()
  await expect(page.getByTestId("add-to-bag-error")).toHaveText(en["error.bag.stock_exceeded"])

  await page.goto("/bag")
  const line = page.getByTestId("bag-line").filter({ hasText: NAMES.available })
  await expect(line.getByTestId("bag-quantity")).toHaveText("2")
  await expect(page.getByTestId("bag-total")).toHaveText("₹6,300")
})

test("the Bag survives closing the browser: a lasting httpOnly cookie, the same Bag when she comes back", async ({
  browser,
  page,
  context,
}) => {
  await page.goto(`/designs/${available.handle}`)
  await page.getByTestId("add-to-bag").click()
  await expect(page.getByTestId("bag-count")).toHaveText("1")

  const cookie = (await context.cookies()).find((c) => c.name === "shop_bag")
  expect(cookie?.httpOnly).toBe(true)
  expect(cookie?.sameSite).toBe("Lax")
  // Not a session cookie: it outlives the browser.
  expect(cookie!.expires).toBeGreaterThan(Date.now() / 1000 + 7 * 24 * 60 * 60)
  expect(await page.evaluate(() => document.cookie)).not.toContain("shop_bag")

  // "Close the browser": keep only what a browser keeps on disk (lasting cookies), in a new context.
  const lasting = (await context.storageState()).cookies.filter((c) => c.expires > 0)
  await context.close()
  const reopened = await browser.newContext({ storageState: { cookies: lasting, origins: [] } })
  const again = await reopened.newPage()
  await again.goto("/bag")
  const line = again.getByTestId("bag-line").filter({ hasText: NAMES.available })
  await expect(line.getByTestId("bag-quantity")).toHaveText("1")
  await expect(again.getByTestId("bag-total")).toHaveText("₹3,150")
  await reopened.close()
})

test("when the stock falls below the Bag's quantity, the line says so and offers to change to what is left", async ({
  page,
}) => {
  await page.goto(`/designs/${available.handle}`)
  await page.getByTestId("add-to-bag").click()
  await expect(page.getByTestId("bag-count")).toHaveText("1")
  await page.getByTestId("add-to-bag").click()
  await expect(page.getByTestId("bag-count")).toHaveText("2")

  // The Owner takes one Piece out of stock meanwhile.
  await ok(
    await admin.post(`/admin/shop/designs/${available.id}/stock`, {
      headers: { origin: ADMIN_ORIGIN },
      data: { set: 1, reason: "End-to-end test: one piece sold elsewhere" },
    }),
    "lower stock"
  )
  try {
    await page.goto("/bag")
    const line = page.getByTestId("bag-line").filter({ hasText: NAMES.available })
    await expect(line.getByTestId("bag-over-stock")).toContainText(en["bag.overStock"].replace("{n}", "1"))
    await expect(line.getByTestId("bag-increase")).toBeDisabled()
    await line.getByTestId("bag-set-to-stock").click()
    await expect(line.getByTestId("bag-quantity")).toHaveText("1")
    await expect(line.getByTestId("bag-over-stock")).toHaveCount(0)
    await expect(page.getByTestId("bag-total")).toHaveText("₹3,150")
  } finally {
    await ok(
      await admin.post(`/admin/shop/designs/${available.id}/stock`, {
        headers: { origin: ADMIN_ORIGIN },
        data: { set: 2, reason: "End-to-end test: stock back" },
      }),
      "restore stock"
    )
  }
})

test("the header offers Sign in and Create account at every width when signed out", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto("/")
    await expect(page.getByTestId("nav-sign-in")).toBeVisible()
    await expect(page.getByTestId("nav-sign-up")).toBeVisible()
    await expect(page.getByTestId("nav-account")).toHaveCount(0)
  }
  await page.getByTestId("nav-sign-up").click()
  await expect(page).toHaveURL(/\/sign-up$/)
})

test("the header shows Account, not Sign in, to a signed-in Shopper", async ({ page }) => {
  const email = `bag-e2e-${Date.now()}@example.com`
  await page.goto("/sign-up")
  await page.getByLabel(en["form.email"]).fill(email)
  await page.getByLabel(en["form.password"]).fill("correct-horse-1")
  await page.getByRole("button", { name: en["signUp.submit"] }).click()
  await expect(page).toHaveURL(/\/account$/)
  await page.goto("/")
  await expect(page.getByTestId("nav-account")).toBeVisible()
  await expect(page.getByTestId("nav-sign-in")).toHaveCount(0)
})

test("screenshots of home", async ({ page }) => {
  await page.goto("/")
  await expect(card(page, NAMES.available)).toBeVisible()
  await screenshot(page, "home")
})
