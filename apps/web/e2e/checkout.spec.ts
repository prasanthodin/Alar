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

const KERNEL = (websiteEnv("NEXT_PUBLIC_MEDUSA_BACKEND_URL") ?? "http://localhost:9000").replace(/\/+$/, "")
const ADMIN_ORIGIN = process.env.ADMIN_E2E_ORIGIN ?? new URL(KERNEL).origin
const EMAIL = process.env.ADMIN_E2E_EMAIL ?? "owner-e2e@example.test"
const PASSWORD = process.env.ADMIN_E2E_PASSWORD ?? "owner-e2e-pass-1"
const MOCK = join(process.cwd(), "../mobile/public/mock")
const SCREENSHOTS = join(process.cwd(), "../../docs/screenshots")

const NAME = `Kanchipuram silk saree ${Date.now()}`
const SHOPPER = { email: `checkout-e2e-${Date.now()}@example.com`, password: "correct-horse-1" }
const ADDRESS = {
  name: "Meena Iyer",
  mobile: "98765 43210",
  addressLine: "12 Temple Street, Big Kanchipuram",
  city: "Kanchipuram",
  pincode: "631501",
  state: "Tamil Nadu",
}

let admin: APIRequestContext
let design: { id: string; handle: string }

async function ok<T>(res: Awaited<ReturnType<APIRequestContext["post"]>>, what: string): Promise<T> {
  if (!res.ok()) throw new Error(`${what}: HTTP ${res.status()} ${await res.text()}`)
  return (await res.json()) as T
}

/** A published Design with two photos, Rs 3,150, and one Piece: the last one. */
async function makeDesign(): Promise<{ id: string; handle: string }> {
  const headers = { origin: ADMIN_ORIGIN }
  const form = new FormData()
  form.append("files", new Blob([readFileSync(join(MOCK, "1-1-maroon.jpg"))], { type: "image/jpeg" }), "drape.jpg")
  form.append("files", new Blob([readFileSync(join(MOCK, "2-1-closeup-maroon.jpg"))], { type: "image/jpeg" }), "closeup.jpg")
  const { files } = await ok<{ files: { id: string }[] }>(
    await admin.post("/admin/shop/uploads", { headers, multipart: form }),
    "upload photos"
  )
  const { design: made } = await ok<{ design: { id: string } }>(
    await admin.post("/admin/shop/designs", {
      headers,
      data: {
        name: NAME,
        description: "Maroon with a temple border.",
        attributes: {
          fibre: "Silk",
          weave: "Kanchipuram",
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
  await ok(await admin.post(`/admin/shop/designs/${made.id}/publish`, { headers, data: { trueColourConfirmed: true } }), "publish")
  await ok(
    await admin.post(`/admin/shop/designs/${made.id}/stock`, { headers, data: { set: 1, reason: "Checkout end-to-end test" } }),
    "set stock"
  )
  const { url } = await ok<{ url: string }>(await admin.post(`/admin/shop/designs/${made.id}/preview`, { headers }), "preview")
  return { id: made.id, handle: decodeURIComponent(new URL(url).pathname.split("/").pop()!) }
}

test.beforeAll(async () => {
  admin = await playwrightRequest.newContext({ baseURL: KERNEL })
  const { token } = await ok<{ token: string }>(
    await admin.post("/auth/user/emailpass", { data: { email: EMAIL, password: PASSWORD } }),
    "admin sign-in"
  )
  await ok(await admin.post("/auth/session", { headers: { authorization: `Bearer ${token}` } }), "admin session")
  design = await makeDesign()
})

test.afterAll(async () => {
  await admin?.dispose()
})

async function screenshot(page: Page, name: string) {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await page.evaluate(() => {
      for (const img of Array.from(document.images)) img.loading = "eager"
    })
    await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete))
    await page.screenshot({
      path: join(SCREENSHOTS, `web-${name}-${width}.png`),
      fullPage: true,
      style: "nextjs-portal { display: none !important; }",
    })
  }
  await page.setViewportSize({ width: 1280, height: 720 })
}

/** Minutes since midnight of an "h:mm am/pm" time. */
function minutesOf(text: string): number {
  const m = /(\d{1,2}):(\d{2})\s*([ap]m)/i.exec(text)
  if (!m) throw new Error(`No time in "${text}"`)
  const hour = (Number(m[1]) % 12) + (m[3]!.toLowerCase() === "pm" ? 12 : 0)
  return hour * 60 + Number(m[2])
}

/** Minutes since midnight in the shop's time zone (Asia/Kolkata), `ahead` minutes from now. */
function istMinutes(ahead: number): number {
  const at = new Date(Date.now() + ahead * 60_000)
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Kolkata" })
    .format(at)
    .split(":")
  return Number(parts[0]) * 60 + Number(parts[1])
}

test("sign in from the Bag, begin checkout, see the total and when the Hold ends; the Bag is locked; cancel unlocks it", async ({
  page,
  browser,
}) => {
  // Signed out, with the saree in her Bag: Checkout sends her to sign in, and back.
  await page.goto(`/designs/${design.handle}`)
  await page.getByTestId("add-to-bag").click()
  await expect(page.getByTestId("bag-count")).toHaveText("1")
  await page.goto("/bag")
  await page.getByTestId("bag-checkout").click()
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fcheckout$/)
  await page.getByRole("link", { name: en["signIn.signUpLink"] }).click()
  await expect(page).toHaveURL(/\/sign-up\?next=%2Fcheckout$/)
  await page.getByLabel(en["form.email"]).fill(SHOPPER.email)
  await page.getByLabel(en["form.password"]).fill(SHOPPER.password)
  await page.getByRole("button", { name: en["signUp.submit"] }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  // Her Bag was kept.
  await expect(page.getByTestId("checkout-bag-total")).toHaveText("₹3,150")

  // A 5-digit pincode is refused and nothing is held.
  await page.getByLabel(en["checkout.name"]).fill(ADDRESS.name)
  await page.getByLabel(en["checkout.mobile"]).fill(ADDRESS.mobile)
  await page.getByLabel(en["checkout.addressLine"]).fill(ADDRESS.addressLine)
  await page.getByLabel(en["checkout.city"]).fill(ADDRESS.city)
  await page.getByLabel(en["checkout.pincode"]).fill("63150")
  await page.getByLabel(en["checkout.state"]).selectOption(ADDRESS.state)
  await page.getByTestId("checkout-submit").click()
  await expect(page.getByTestId("checkout-error")).toHaveText(en["checkout.inputInvalid"])
  await expect(page.getByLabel(en["checkout.pincode"])).toHaveAttribute("aria-invalid", "true")

  await page.getByLabel(en["checkout.pincode"]).fill(ADDRESS.pincode)
  await page.getByTestId("checkout-submit").click()
  await expect(page.getByTestId("checkout-held")).toBeVisible()
  await expect(page.getByTestId("checkout-total")).toHaveText("₹3,150")
  await expect(page.getByTestId("checkout-line")).toContainText(NAME)
  // The end of the Hold, from the server: 15 minutes from now, shown as a plain time.
  const ends = await page.getByTestId("checkout-hold-ends").innerText()
  const shown = minutesOf(ends)
  const window = [istMinutes(14), istMinutes(15), istMinutes(16)]
  expect(window.some((m) => Math.abs(((shown - m + 1440) % 1440)) <= 1)).toBe(true)
  await expect(page.locator("main")).toContainText(ADDRESS.addressLine)
  await expect(page.locator("body")).not.toContainText(/\bcart\b/i)
  await screenshot(page, "checkout")

  // The Bag is locked while she pays.
  await page.goto("/bag")
  await expect(page.getByTestId("bag-held")).toBeVisible()
  const line = page.getByTestId("bag-line").filter({ hasText: NAME })
  await expect(line.getByTestId("bag-remove")).toBeDisabled()
  await expect(page.getByTestId("bag-checkout")).toHaveText(en["bag.continueCheckout"])

  // Another Shopper sees the last Piece as unavailable for now, and cannot add it.
  const other = await browser.newContext()
  const otherPage = await other.newPage()
  await otherPage.goto(`/designs/${design.handle}`)
  await expect(otherPage.getByTestId("stock-status")).toHaveText(en["design.held"])
  await expect(otherPage.getByTestId("add-to-bag")).toBeDisabled()
  await expect(otherPage.getByTestId("held-note")).toHaveText(en["design.heldNote"])

  // Cancel: the Bag can be changed again, and the saree is back in stock.
  await page.getByTestId("bag-checkout").click()
  await expect(page).toHaveURL(/\/checkout$/)
  await page.getByTestId("checkout-cancel").click()
  await expect(page).toHaveURL(/\/bag$/)
  await expect(page.getByTestId("bag-held")).toHaveCount(0)
  await expect(page.getByTestId("bag-line").filter({ hasText: NAME }).getByTestId("bag-remove")).toBeEnabled()
  await expect(page.getByTestId("bag-checkout")).toHaveText(en["bag.checkout"])
  await otherPage.goto(`/designs/${design.handle}`)
  await expect(otherPage.getByTestId("stock-status")).toHaveText(en["design.inStock"])
  await other.close()

  // Leave the Bag empty for the next run.
  await page.getByTestId("bag-line").filter({ hasText: NAME }).getByTestId("bag-remove").click()
  await expect(page.getByTestId("bag-empty")).toBeVisible()
})
