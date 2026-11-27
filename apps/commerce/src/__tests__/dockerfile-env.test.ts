import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { parseEnv } from "../env"

/**
 * The build-time placeholder variables of the image's `medusa build` step
 * (`NAME=value` before `pnpm --filter "@shop/commerce..." build` in the build
 * stage). A `$(...)` value is generated in the image (a random 32-hex-digit
 * secret); here it stands in as one.
 */
function buildPlaceholders(dockerfile: string): Record<string, string> {
  const build = dockerfile.split(/^FROM /m).find((stage) => /\sAS build\b/.test(stage.split("\n")[0]!))
  if (!build) throw new Error("No build stage in the Dockerfile")
  const run = build
    .replace(/\\\n/g, " ")
    .split("\n")
    .find((line) => line.startsWith("RUN ") && line.includes('pnpm --filter "@shop/commerce..." build'))
  if (!run) throw new Error("No `medusa build` step in the build stage")
  const before = run.slice(0, run.indexOf("pnpm --filter"))
  const out: Record<string, string> = {}
  for (const m of before.matchAll(/([A-Z][A-Z0-9_]*)=("\$\([^)]*\)"|\S+)/g)) {
    out[m[1]!] = m[2]!.startsWith('"$(') ? "0123456789abcdef0123456789abcdef" : m[2]!
  }
  return out
}

describe("the commerce image's build-time placeholders", () => {
  const placeholders = buildPlaceholders(readFileSync(join(__dirname, "../../Dockerfile"), "utf8"))

  it("pass the kernel's environment schema, so `medusa build` in the image does not exit", () => {
    expect(parseEnv(placeholders)).toMatchObject({ ok: true })
  })

  it("include the documents bucket, apart from the catalog bucket", () => {
    expect(placeholders.S3_DOCUMENTS_BUCKET).toBe("build-documents")
    expect(placeholders.S3_DOCUMENTS_BUCKET).not.toBe(placeholders.S3_BUCKET)
  })
})
