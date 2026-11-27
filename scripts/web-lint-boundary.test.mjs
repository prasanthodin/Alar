// Pins the AD-2 boundary: UI code in apps/web may not import the kernel SDK or kernel types.
import assert from "node:assert/strict"
import { createRequire } from "node:module"
import path from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const web = path.join(root, "apps/web")
const { ESLint } = createRequire(path.join(web, "package.json"))("eslint")

const eslint = new ESLint({
  cwd: web,
  overrideConfigFile: path.join(web, "eslint.config.mjs"),
})

for (const specifier of ["@medusajs/js-sdk", "@medusajs/types/dist/http"]) {
  test(`apps/web may not import ${specifier}`, async () => {
    const [result] = await eslint.lintText(`import x from "${specifier}"\nexport default x\n`, {
      filePath: path.join(web, "src/x.ts"),
    })
    const hits = result.messages.filter((m) => m.ruleId === "no-restricted-imports")
    assert.equal(hits.length, 1, JSON.stringify(result.messages))
    assert.match(hits[0].message, /@shop\/api-client \(AD-2\)/)
    assert.equal(hits[0].severity, 2)
  })
}
