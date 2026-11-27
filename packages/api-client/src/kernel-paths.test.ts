import { describe, expect, it } from "vitest"
import { isShopRoute, matchKernelRoute } from "@shop/contracts"

// This package compiles without Node typings, so the test takes the two fs
// functions it needs from Node's built-in module loader.
type Fs = {
  readFileSync(path: URL, encoding: "utf8"): string
  readdirSync(path: URL, options: { recursive: true }): string[]
}
const fs = (globalThis as unknown as { process: { getBuiltinModule(id: "node:fs"): Fs } }).process.getBuiltinModule(
  "node:fs"
)

const SRC = new URL("./", import.meta.url)

/** Every namespace the kernel's route guard covers. */
const KERNEL_LITERAL = /(["'`])(\/(?:store|admin|auth|rbac|cloud|hooks)(?:[/?][^"'`]*)?)\1/g
const METHOD = /\bmethod:\s*["'](GET|POST|DELETE|PUT|PATCH)["']/g
const PATH_KEY = /\bpath:\s*/g

/** The `{ ... }` that contains `index`, by brace depth, or null when it is not inside one. */
function enclosingObject(source: string, index: number): { start: number; end: number } | null {
  let depth = 0
  let start = -1
  for (let i = index - 1; i >= 0; i--) {
    if (source[i] === "}") depth++
    else if (source[i] === "{") {
      if (depth === 0) {
        start = i
        break
      }
      depth--
    }
  }
  if (start === -1) return null
  depth = 0
  for (let i = start; i < source.length; i++) {
    if (source[i] === "{") depth++
    else if (source[i] === "}" && --depth === 0) return { start, end: i }
  }
  return null
}

/** The object's own `method: "..."`, before or after the path; methods of nested objects do not count. */
function ownMethod(source: string, object: { start: number; end: number }): string | undefined {
  const text = source.slice(object.start, object.end + 1)
  const depthAt: number[] = []
  let depth = 0
  for (const ch of text) {
    if (ch === "{") depth++
    else if (ch === "}") depth--
    depthAt.push(depth)
  }
  return [...text.matchAll(METHOD)].find((m) => depthAt[m.index] === 1)?.[1]
}

/** True when the object is an argument of a call, `f({ ... })`, not a type or a variable. */
function isCallArgument(source: string, object: { start: number }): boolean {
  return /\(\s*$/.test(source.slice(Math.max(0, object.start - 20), object.start))
}

/**
 * The problems in one source file: a kernel path not on the allow-list, a
 * kernel path whose method cannot be read from its request object, and a
 * request `path:` that is not a string literal or a template that starts with
 * literal text (so the path cannot be checked). Shop routes are allowed.
 */
function kernelPathProblems(file: string, source: string): string[] {
  const problems: string[] = []
  for (const m of source.matchAll(KERNEL_LITERAL)) {
    const path = m[2]!.replace(/\$\{[^}]*\}/g, ":param").split("?")[0]!
    if (isShopRoute(path)) continue
    const object = enclosingObject(source, m.index)
    const method = object ? ownMethod(source, object) : undefined
    if (!method) problems.push(`${file}: ${path} has no method`)
    else if (!matchKernelRoute(method, path)) problems.push(`${file}: ${method} ${path} is not on the allow-list`)
  }
  for (const m of source.matchAll(PATH_KEY)) {
    const object = enclosingObject(source, m.index)
    if (!object || !isCallArgument(source, object)) continue
    const value = source.slice(m.index + m[0].length)
    if (!/^(["']|`(?!\$\{))/.test(value)) {
      problems.push(`${file}: path ${value.split(/[,\n]/, 1)[0]!.trim()} is not a literal`)
    }
  }
  return problems
}

function sourceFiles(): string[] {
  return fs
    .readdirSync(SRC, { recursive: true })
    .map((f) => f.replaceAll("\\", "/"))
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !f.startsWith("mock/"))
}

describe("api-client kernel paths", () => {
  it("scans the request-building source files", () => {
    expect(sourceFiles()).toEqual(expect.arrayContaining(["auth.ts", "client.ts"]))
  })

  it("calls only kernel paths on the allow-list, each with its method", () => {
    const files = sourceFiles()
    const sources = files.map((f) => fs.readFileSync(new URL(f, SRC), "utf8"))
    expect(sources.join("\n").match(KERNEL_LITERAL)?.length ?? 0).toBeGreaterThan(0)
    expect(files.flatMap((f, i) => kernelPathProblems(f, sources[i]!))).toEqual([])
  })

  it("accepts an allowed path with its method before or after it, behind nested braces", () => {
    const source = [
      'request({ method: "GET", path: "/store/customers/me", schema })',
      'request({ path: "/store/customers", body: { email, meta: { a: 1 } }, method: "POST" })',
      "request({ path: `/store/shop/bag/${id}` })",
    ].join("\n")
    expect(kernelPathProblems("ok.ts", source)).toEqual([])
  })

  it("names a path off the list, a path with no method, and a nested method that is not the request's", () => {
    const source = [
      "request({ method: \"POST\", path: `/store/carts/${cartId}/complete`, schema })",
      'const other = "/admin/inventory-items"',
      'request({ path: "/store/customers/me", body: { method: "GET" } })',
    ].join("\n")
    expect(kernelPathProblems("drift.ts", source)).toEqual([
      "drift.ts: POST /store/carts/:param/complete is not on the allow-list",
      "drift.ts: /admin/inventory-items has no method",
      "drift.ts: /store/customers/me has no method",
    ])
  })

  it("names a request path built from a variable or a template with no literal start", () => {
    const source = [
      'const p = "/store/customers/me"',
      'request({ method: "GET", path: p, schema })',
      "request({ method: \"GET\", path: `${base}/store/customers/me`, schema })",
      "type Options = { path: string }",
    ].join("\n")
    expect(kernelPathProblems("built.ts", source)).toEqual([
      "built.ts: /store/customers/me has no method",
      "built.ts: path p is not a literal",
      "built.ts: path `${base}/store/customers/me` is not a literal",
    ])
  })
})
