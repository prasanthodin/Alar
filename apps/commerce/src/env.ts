import { z } from "@medusajs/framework/zod"

/**
 * Every environment variable `medusa-config.ts` reads, checked once when the
 * configuration loads. A missing or malformed variable stops the process with
 * its name only; values are never printed (AD-16, Config and secrets).
 */

const nonEmpty = z.string().trim().min(1)

function urlWith(protocols: readonly string[]) {
  return nonEmpty.refine((value) => {
    try {
      return protocols.includes(new URL(value).protocol)
    } catch {
      return false
    }
  })
}

const httpUrl = urlWith(["http:", "https:"])

/** A comma-separated list of origins (or `/regex/` entries, as the kernel accepts). */
const corsList = nonEmpty.refine((value) =>
  value.split(",").every((entry) => {
    const origin = entry.trim()
    if (origin.length > 2 && origin.startsWith("/") && origin.endsWith("/")) {
      return true
    }
    try {
      const url = new URL(origin)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  })
)

/** S3 bucket naming rules: 3 to 63 lowercase letters, digits, dots and hyphens. */
const bucketName = nonEmpty.regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/)

export const envSchema = z.object({
  DATABASE_URL: urlWith(["postgres:", "postgresql:"]),
  REDIS_URL: urlWith(["redis:", "rediss:"]),
  STORE_CORS: corsList,
  ADMIN_CORS: corsList,
  AUTH_CORS: corsList,
  JWT_SECRET: z.string().min(8),
  COOKIE_SECRET: z.string().min(8),
  MEDUSA_WORKER_MODE: z.enum(["shared", "worker", "server"]).default("shared"),
  S3_ENDPOINT: httpUrl,
  S3_BUCKET: bucketName,
  S3_REGION: nonEmpty,
  // Public base address of stored files; the kernel appends "/<key>", so no trailing slash.
  S3_FILE_URL: httpUrl.transform((value) => value.replace(/\/+$/, "")),
  S3_ACCESS_KEY_ID: nonEmpty,
  S3_SECRET_ACCESS_KEY: nonEmpty,
})

export type Env = z.infer<typeof envSchema>

export type EnvResult = { ok: true; env: Env } | { ok: false; invalid: string[] }

/** Treats an empty value as missing, so `NAME=` in a file counts as unset. */
function withoutEmpty(source: Record<string, string | undefined>) {
  const out: Record<string, string> = {}
  for (const key of Object.keys(envSchema.shape)) {
    const value = source[key]
    if (value !== undefined && value !== "") {
      out[key] = value
    }
  }
  return out
}

/** Pure check: the parsed values, or the names of the bad variables (never their values). */
export function parseEnv(source: Record<string, string | undefined>): EnvResult {
  const result = envSchema.safeParse(withoutEmpty(source))
  if (result.success) {
    return { ok: true, env: result.data }
  }
  const invalid = [
    ...new Set(result.error.issues.map((issue) => String(issue.path[0] ?? ""))),
  ].filter(Boolean)
  return { ok: false, invalid }
}

export function envErrorMessage(name: string) {
  return `Missing or invalid environment variable: ${name}`
}

type ExitDeps = {
  error: (message: string) => void
  exit: (code: number) => never
}

/** Parses the environment or prints each bad name and exits with code 1. */
export function loadEnvOrExit(
  source: Record<string, string | undefined> = process.env,
  deps: ExitDeps = {
    error: (message) => console.error(message),
    exit: (code) => process.exit(code),
  }
): Env {
  const result = parseEnv(source)
  if (!result.ok) {
    for (const name of result.invalid) {
      deps.error(envErrorMessage(name))
    }
    return deps.exit(1)
  }
  return result.env
}
