import { expect, test } from "@playwright/test"
import en from "../messages/en.json"

test.skip(!process.env.E2E_BASE_URL, "Set E2E_BASE_URL to run against a running kernel and website")
test.describe.configure({ mode: "serial" })

const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
const password = "correct-horse-1"

test("sign up shows the account with the email", async ({ page }) => {
  await page.goto("/sign-up")
  await page.getByLabel(en["form.email"]).fill(email)
  await page.getByLabel(en["form.password"]).fill(password)
  await page.getByRole("button", { name: en["signUp.submit"] }).click()

  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByTestId("shopper-email")).toHaveText(email)
})

test("the session cookie is httpOnly", async ({ page, context }) => {
  await page.goto("/sign-in")
  await page.getByLabel(en["form.email"]).fill(email)
  await page.getByLabel(en["form.password"]).fill(password)
  await page.getByRole("button", { name: en["signIn.submit"] }).click()
  await expect(page).toHaveURL(/\/account$/)

  const session = (await context.cookies()).find((c) => c.name === "shop_session")
  expect(session?.httpOnly).toBe(true)
  expect(session?.sameSite).toBe("Lax")
  expect(await page.evaluate(() => document.cookie)).not.toContain("shop_session")
})

test("sign out clears the session and /account redirects to sign in", async ({ page }) => {
  await page.goto("/sign-in")
  await page.getByLabel(en["form.email"]).fill(email)
  await page.getByLabel(en["form.password"]).fill(password)
  await page.getByRole("button", { name: en["signIn.submit"] }).click()
  await expect(page).toHaveURL(/\/account$/)

  await page.getByRole("button", { name: en["account.signOut"] }).click()
  await expect(page).toHaveURL(/\/sign-in$/)

  await page.goto("/account")
  await expect(page).toHaveURL(/\/sign-in$/)
})

test("sign in shows the account", async ({ page }) => {
  await page.goto("/sign-in")
  await page.getByLabel(en["form.email"]).fill(email)
  await page.getByLabel(en["form.password"]).fill(password)
  await page.getByRole("button", { name: en["signIn.submit"] }).click()

  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByTestId("shopper-email")).toHaveText(email)
})

test("wrong password and unknown email show the same message and no session", async ({ page, context }) => {
  for (const attempt of [
    { email, password: "wrong-password-1" },
    { email: `nobody-${Date.now()}@example.com`, password },
  ]) {
    await context.clearCookies()
    await page.goto("/sign-in")
    await page.getByLabel(en["form.email"]).fill(attempt.email)
    await page.getByLabel(en["form.password"]).fill(attempt.password)
    await page.getByRole("button", { name: en["signIn.submit"] }).click()

    await expect(page.getByTestId("form-error")).toHaveText(en["error.auth.invalid_credentials"])
    await expect(page).toHaveURL(/\/sign-in$/)
    expect((await context.cookies()).find((c) => c.name === "shop_session")).toBeUndefined()
  }
})

test("signing up again with the same email fails without a session", async ({ page, context }) => {
  await context.clearCookies()
  await page.goto("/sign-up")
  await page.getByLabel(en["form.email"]).fill(email)
  await page.getByLabel(en["form.password"]).fill(password)
  await page.getByRole("button", { name: en["signUp.submit"] }).click()

  await expect(page.getByTestId("form-error")).toHaveText(en["error.auth.sign_up_failed"])
  expect((await context.cookies()).find((c) => c.name === "shop_session")).toBeUndefined()
})
