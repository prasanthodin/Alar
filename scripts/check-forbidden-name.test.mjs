import { test } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-forbidden-name.mjs")
// A stand-in name, so the real product name never appears in source.
const NAME = "zebrashop"

function makeRepo(files) {
  const root = mkdtempSync(join(tmpdir(), "name-check-"))
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content)
  }
  // A git work tree, so the check scans tracked files as it does in CI.
  assert.equal(spawnSync("git", ["init", "-q"], { cwd: root }).status, 0, "git init failed")
  assert.equal(spawnSync("git", ["add", "-A"], { cwd: root }).status, 0, "git add failed")
  return root
}

function run(root, env = { FORBIDDEN_NAME: NAME }) {
  const { FORBIDDEN_NAME: _unused, ...base } = process.env
  return spawnSync(process.execPath, [SCRIPT, root], {
    env: { ...base, ...env },
    encoding: "utf8",
  })
}

test("exits 0 when no file contains the name", (t) => {
  const root = makeRepo({
    "apps/web/src/page.tsx": "export const title = 'Shop'\n",
    "packages/contracts/index.ts": "export {}\n",
    "README.md": `outside apps/ and packages/: ${NAME}\n`,
  })
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
})

test("exits 1 and prints each offending path, case-insensitively", (t) => {
  const root = makeRepo({
    "apps/commerce/medusa-config.ts": `const db = "${NAME.toUpperCase()}-db"\n`,
    "packages/contracts/brand.ts": `export const app = "com.${NAME}.app"\n`,
    "apps/web/src/clean.ts": "export {}\n",
    [`apps/web/public/${NAME}-logo.txt`]: "logo\n",
  })
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const result = run(root)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /apps\/commerce\/medusa-config\.ts/)
  assert.match(result.stderr, /packages\/contracts\/brand\.ts/)
  assert.match(result.stderr, new RegExp(`apps/web/public/${NAME}-logo\\.txt`))
  assert.doesNotMatch(result.stderr, /apps\/web\/src\/clean\.ts/)
})

test("flags camelCase and lower-case compound uses of the name", (t) => {
  const root = makeRepo({
    "apps/web/src/camel.ts": `export const use${NAME[0].toUpperCase()}${NAME.slice(1)}Theme = 1\n`,
    "apps/commerce/src/db.ts": `export const db = "${NAME}db"\n`,
  })
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const result = run(root)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /apps\/web\/src\/camel\.ts/)
  assert.match(result.stderr, /apps\/commerce\/src\/db\.ts/)
})

test("flags an untracked, not-ignored file", (t) => {
  const root = makeRepo({ "apps/web/src/clean.ts": "export {}\n" })
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, "apps/web/src/new"), { recursive: true })
  writeFileSync(join(root, "apps/web/src/new/untracked.ts"), `export const n = "${NAME}"\n`)
  const result = run(root)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /apps\/web\/src\/new\/untracked\.ts/)
})

test("skips binary files", (t) => {
  const root = makeRepo({
    "apps/web/public/image.bin": Buffer.concat([
      Buffer.from([0, 1, 2, 0]),
      Buffer.from(NAME),
      Buffer.from([0, 255]),
    ]),
  })
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
})

test("skips content and settings data paths on the allow-list", (t) => {
  const root = makeRepo({
    "apps/commerce/src/settings-data/shop.json": `{ "name": "${NAME}" }\n`,
    "apps/content/content-data/home.json": `{ "title": "${NAME}" }\n`,
  })
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
})

test("ignores files excluded by .gitignore", (t) => {
  const root = makeRepo({
    ".gitignore": ".env\n",
    "apps/commerce/.env": `DB_NAME=${NAME}\n`,
  })
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
})

test("exits 2 when FORBIDDEN_NAME is not set", (t) => {
  const root = makeRepo({ "apps/web/a.ts": "export {}\n" })
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const result = run(root, {})
  assert.equal(result.status, 2)
  assert.match(result.stderr, /FORBIDDEN_NAME is not set/)
})
