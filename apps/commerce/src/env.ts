import { MedusaError } from "@medusajs/framework/utils"
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

/** One CORS entry: an exact origin (scheme, host, optional port; no path) or a valid `/regex/`. */
function isCorsEntry(entry: string): boolean {
  if (entry.length > 2 && entry.startsWith("/") && entry.endsWith("/")) {
    try {
      new RegExp(entry.slice(1, -1))
      return true
    } catch {
      return false
    }
  }
  try {
    const url = new URL(entry)
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin === entry
  } catch {
    return false
  }
}

/**
 * A comma-separated list of CORS entries. Entries are trimmed (the kernel
 * compares them exactly, so a stray space would never match) and each must be
 * an origin or a `/regex/`.
 */
const corsList = nonEmpty
  .transform((value) => value.split(",").map((entry) => entry.trim()))
  .refine((entries) => entries.every(isCorsEntry))
  .transform((entries) => entries.join(","))

/** Values from templates and build steps that must never be used as real secrets. */
const PLACEHOLDER_SECRETS = new Set(["supersecret", "build-placeholder"])

/** At least 8 characters after trimming, and not a known placeholder. */
const secret = z
  .string()
  .trim()
  .min(8)
  .refine((value) => !PLACEHOLDER_SECRETS.has(value.toLowerCase()))

/** A signing key: at least 32 characters after trimming, and not a known placeholder. */
const signingKey = z
  .string()
  .trim()
  .min(32)
  .refine((value) => !PLACEHOLDER_SECRETS.has(value.toLowerCase()))

/** A site origin (scheme, host, optional port), without a path or a trailing slash. */
const origin = httpUrl.refine((value) => new URL(value).origin === value.replace(/\/+$/, "")).transform((value) => value.replace(/\/+$/, ""))

/** S3 bucket naming rules: 3 to 63 lowercase letters, digits, dots and hyphens. */
const bucketName = nonEmpty.regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/)

export const envSchema = z.object({
  DATABASE_URL: urlWith(["postgres:", "postgresql:"]),
  REDIS_URL: urlWith(["redis:", "rediss:"]),
  STORE_CORS: corsList,
  ADMIN_CORS: corsList,
  AUTH_CORS: corsList,
  JWT_SECRET: secret,
  COOKIE_SECRET: secret,
  MEDUSA_WORKER_MODE: z.enum(["shared", "worker", "server"]).default("shared"),
  // The kernel's logger level. At "http" or above the kernel logs every request with
  // the client address and query string, so the default stays at "info".
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  S3_ENDPOINT: httpUrl,
  S3_BUCKET: bucketName,
  S3_REGION: nonEmpty,
  // Public base address of stored files; the kernel appends "/<key>", so no trailing slash.
  S3_FILE_URL: httpUrl.transform((value) => value.replace(/\/+$/, "")),
  S3_ACCESS_KEY_ID: nonEmpty,
  S3_SECRET_ACCESS_KEY: nonEmpty,
  // The private, versioned bucket for documents (Story 1.9): Checkout recovery
  // files now, invoices, credit notes and labels later. Never public, so never
  // the catalog bucket (S3_BUCKET); objects are reached only through the S3 client.
  S3_DOCUMENTS_BUCKET: bucketName,
  // Signs the Admin's preview links of unpublished Designs (Story 1.8). Its own key,
  // never JWT_SECRET or COOKIE_SECRET. Generate with: openssl rand -hex 32
  PREVIEW_TOKEN_SECRET: signingKey,
  // The website's public origin, where preview links point. Optional: defaults to the
  // first exact origin in STORE_CORS.
  STOREFRONT_URL: origin.optional(),
}).superRefine((env, ctx) => {
  if (env.S3_DOCUMENTS_BUCKET === env.S3_BUCKET) {
    ctx.addIssue({ code: "custom", path: ["S3_DOCUMENTS_BUCKET"], message: "The documents bucket must not be the public catalog bucket" })
  }
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

/** The first exact origin in a CORS list (regex entries are skipped), or null. */
export function firstCorsOrigin(cors: string): string | null {
  return cors.split(",").find((entry) => !(entry.startsWith("/") && entry.endsWith("/"))) ?? null
}

let cachedEnv: Env | null = null

/**
 * The checked environment, for code that runs after `medusa-config.ts` has
 * loaded (routes, workflows). Throws naming the bad variables, never their values.
 */
export function readEnv(source: Record<string, string | undefined> = process.env): Env {
  if (source === process.env && cachedEnv) return cachedEnv
  const result = parseEnv(source)
  if (!result.ok) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, result.invalid.map(envErrorMessage).join("; "), "internal")
  }
  if (source === process.env) cachedEnv = result.env
  return result.env
}

/** Where the website is: STOREFRONT_URL, else the first exact origin in STORE_CORS. */
export function storefrontUrl(env: Env): string {
  const url = env.STOREFRONT_URL ?? firstCorsOrigin(env.STORE_CORS)
  if (!url) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, envErrorMessage("STOREFRONT_URL"), "internal")
  return url
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
