// Pins the AD-2 boundary for the app: code in apps/mobile may not import any @medusajs/* package.
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import path from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const mobile = path.join(root, "apps/mobile")
const { ESLint } = createRequire(path.join(mobile, "package.json"))("eslint")

const eslint = new ESLint({
  cwd: mobile,
  overrideConfigFile: path.join(mobile, "eslint.config.mjs"),
})

for (const specifier of ["@medusajs/js-sdk", "@medusajs/types", "@medusajs/framework/utils"]) {
  test(`apps/mobile may not import ${specifier}`, async () => {
    const [result] = await eslint.lintText(`import x from "${specifier}"\nexport default x\n`, {
      filePath: path.join(mobile, "src/x.ts"),
    })
    const hits = result.messages.filter((m) => m.ruleId === "no-restricted-imports")
    assert.equal(hits.length, 1, JSON.stringify(result.messages))
    assert.match(hits[0].message, /@shop\/api-client \(AD-2\)/)
    assert.equal(hits[0].severity, 2)
  })
}

test("apps/mobile may import @shop/api-client", async () => {
  const [result] = await eslint.lintText(`import { createApiClient } from "@shop/api-client"\nexport default createApiClient\n`, {
    filePath: path.join(mobile, "src/x.ts"),
  })
  assert.equal(result.messages.filter((m) => m.ruleId === "no-restricted-imports").length, 0)
})
