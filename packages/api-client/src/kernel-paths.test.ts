import { describe, expect, it } from "vitest"
import { ALLOWED_KERNEL_ROUTES, matchKernelRoute } from "@shop/contracts"

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

type KernelPath = { file: string; method?: string; path: string }

/**
 * Finds every string literal that starts with a kernel prefix (`/store`,
 * `/admin`, `/auth`), turns `${...}` into `:param`, and pairs it with the
 * `method: "..."` written in the same request object when there is one.
 */
function findKernelPaths(file: string, source: string): KernelPath[] {
  const found: KernelPath[] = []
  const literal = /(["'`])(\/(?:store|admin|auth)(?:[/?][^"'`]*)?)\1/g
  for (const m of source.matchAll(literal)) {
    const path = m[2]!.replace(/\$\{[^}]*\}/g, ":param").split("?")[0]!
    const objectStart = source.lastIndexOf("{", m.index)
    const before = source.slice(objectStart === -1 ? 0 : objectStart, m.index)
    const method = [...before.matchAll(/method:\s*["'](GET|POST|DELETE|PUT|PATCH)["']/g)].pop()?.[1]
    found.push({ file, path, ...(method ? { method } : {}) })
  }
  return found
}

function sourceFiles(): string[] {
  return fs
    .readdirSync(SRC, { recursive: true })
    .map((f) => f.replaceAll("\\", "/"))
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !f.startsWith("mock/"))
}

/** A kernel path is on the list when it matches an allowed route, with its method when known. */
function isAllowed({ method, path }: KernelPath): boolean {
  if (method) return matchKernelRoute(method, path) !== undefined
  return ALLOWED_KERNEL_ROUTES.some((r) => matchKernelRoute(r.method, path) === r)
}

describe("api-client kernel paths", () => {
  it("scans the request-building source files", () => {
    expect(sourceFiles()).toEqual(expect.arrayContaining(["auth.ts", "client.ts"]))
  })

  it("calls only kernel paths on the allow-list", () => {
    const paths = sourceFiles().flatMap((f) => findKernelPaths(f, fs.readFileSync(new URL(f, SRC), "utf8")))
    expect(paths.length).toBeGreaterThan(0)
    const offList = paths.filter((p) => !isAllowed(p)).map((p) => `${p.file}: ${p.method ?? "?"} ${p.path}`)
    expect(offList).toEqual([])
  })

  it("names a kernel path that is not on the list", () => {
    const source = [
      'transport.request({ method: "GET", path: "/store/customers/me", schema })',
      "transport.request({ method: \"POST\", path: `/store/carts/${cartId}/complete`, schema })",
      'const other = "/admin/inventory-items"',
    ].join("\n")
    const offList = findKernelPaths("drift.ts", source)
      .filter((p) => !isAllowed(p))
      .map((p) => `${p.file}: ${p.method ?? "?"} ${p.path}`)
    expect(offList).toEqual(["drift.ts: POST /store/carts/:param/complete", "drift.ts: ? /admin/inventory-items"])
  })
})
