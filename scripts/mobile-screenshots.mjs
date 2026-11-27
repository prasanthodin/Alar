#!/usr/bin/env node
// Serves the exported web build of apps/mobile and captures phone-size screenshots of the
// shell's main screens: Home, Categories, Listing (Silk), Product, and Bag after one add.
//
// Usage (from the repository root):
//   pnpm --filter @shop/mobile export:web
//   node scripts/mobile-screenshots.mjs
//
// Chrome: set CHROME_PATH, else /usr/bin/google-chrome is used when present, else Playwright's own.

import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const mobile = path.join(root, "apps/mobile")
const dist = path.join(mobile, "dist")
const outDir = path.join(root, "docs/screenshots")
const { chromium } = createRequire(path.join(mobile, "package.json"))("@playwright/test")

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
}

/**
 * A static server. Route paths (no file extension) fall back to index.html; a missing file
 * is a 404, so a broken picture or font fails the run instead of hiding behind the page.
 */
function serve(dir) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost")
    const pathname = decodeURIComponent(url.pathname)
    let file = path.resolve(dir, `.${pathname}`)
    const inside = file === dir || file.startsWith(dir + path.sep)
    const isFile = inside && existsSync(file) && statSync(file).isFile()
    if (!isFile) {
      if (!inside || path.extname(pathname)) {
        res.writeHead(404, { "content-type": "text/plain" })
        res.end("Not found")
        return
      }
      file = path.join(dir, "index.html")
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" })
    res.end(readFileSync(file))
  })
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)))
}

async function settle(page) {
  await page.waitForLoadState("networkidle")
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
}

async function main() {
  if (!existsSync(path.join(dist, "index.html"))) {
    console.error("mobile-screenshots: apps/mobile/dist is missing. Run `pnpm --filter @shop/mobile export:web` first.")
    return 2
  }
  mkdirSync(outDir, { recursive: true })
  const server = await serve(dist)
  const base = `http://127.0.0.1:${server.address().port}`
  const executablePath =
    process.env.CHROME_PATH || (existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined)
  const browser = await chromium.launch({ executablePath })
  const errors = []
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
    const page = await context.newPage()
    page.on("pageerror", (e) => errors.push(e.message))
    page.on("response", (r) => {
      if (["image", "font"].includes(r.request().resourceType()) && r.status() >= 400) errors.push(`${r.request().resourceType()} ${r.status()}: ${r.url()}`)
    })
    page.on("requestfailed", (r) => {
      if (["image", "font"].includes(r.resourceType())) errors.push(`${r.resourceType()} failed: ${r.url()}`)
    })
    // Tab and stack screens stay mounted when hidden (inert), so every lookup takes the live match.
    const visible = (locator) =>
      locator.and(page.locator(":not([inert], [inert] *)")).filter({ visible: true }).first()
    const shot = async (name) => {
      await settle(page)
      const file = path.join(outDir, `mobile-${name}.png`)
      await page.screenshot({ path: file })
      console.log(`mobile-screenshots: ${path.relative(root, file)}`)
    }

    await page.goto(base)
    await visible(page.getByText("New this week")).waitFor()
    await shot("home")

    await visible(page.getByRole("tab", { name: "Categories" })).click()
    const silk = visible(page.getByRole("link", { name: "Silk", exact: true }))
    await silk.waitFor()
    await shot("categories")

    await silk.click()
    await visible(page.getByText(/^\d+ items$/)).waitFor()
    await shot("listing-silk")

    await visible(page.getByRole("link", { name: /^Arani silk saree/ })).click()
    const add = visible(page.getByRole("button", { name: "Add to bag" }))
    await add.waitFor()
    await shot("product")

    await add.click()
    await visible(page.getByText("Added to bag.")).waitFor()
    await visible(page.getByText("View bag")).click()
    await visible(page.getByText("Price details")).waitFor()
    await shot("bag")
  } finally {
    await browser.close()
    server.close()
  }
  if (errors.length > 0) {
    console.error(`mobile-screenshots: the page threw or a picture failed:\n${errors.join("\n")}`)
    return 1
  }
  return 0
}

process.exitCode = await main()
