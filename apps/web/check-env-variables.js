const { z } = require("zod")

/**
 * The website's environment, checked when Next.js loads its configuration
 * (`next dev`, `next build` and `next start`). A missing or malformed variable
 * stops the process with its name only; values are never printed.
 */

/** @param {string[]} protocols */
function urlWith(protocols) {
  return z
    .string()
    .trim()
    .min(1)
    .refine((value) => {
      try {
        return protocols.includes(new URL(value).protocol)
      } catch {
        return false
      }
    })
}

const httpUrl = urlWith(["http:", "https:"])

const webEnvSchema = z.object({
  // Address of the commerce kernel as seen from outside the container network.
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: httpUrl,
  // The kernel's publishable key (public, not a secret).
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z
    .string()
    .trim()
    .regex(/^pk_[A-Za-z0-9_]+$/),
  // Optional: the kernel's address inside the container network, used for server-side calls.
  COMMERCE_INTERNAL_URL: httpUrl.optional(),
  NEXT_PUBLIC_BASE_URL: httpUrl.optional(),
  // Optional: the wordmark when the shop name cannot be read from shop settings.
  NEXT_PUBLIC_STORE_NAME: z.string().trim().min(1).max(80).optional(),
})

/**
 * Names of the bad variables in `source` (empty values count as missing).
 * @param {Record<string, string | undefined>} source
 * @returns {string[]}
 */
function findInvalidEnv(source) {
  /** @type {Record<string, string>} */
  const input = {}
  for (const key of Object.keys(webEnvSchema.shape)) {
    const value = source[key]
    if (value !== undefined && value !== "") {
      input[key] = value
    }
  }
  const result = webEnvSchema.safeParse(input)
  if (result.success) {
    return []
  }
  return [...new Set(result.error.issues.map((issue) => String(issue.path[0] ?? "")))].filter(Boolean)
}

/** @param {string} name */
function envErrorMessage(name) {
  return `Missing or invalid environment variable: ${name}`
}

/**
 * Prints each bad variable's name and exits with code 1 when any is bad.
 * @param {Record<string, string | undefined>} [source]
 * @param {{ error: (message: string) => void, exit: (code: number) => void }} [deps]
 */
function checkEnvVariables(
  source = process.env,
  deps = { error: (message) => console.error(message), exit: (code) => process.exit(code) }
) {
  const invalid = findInvalidEnv(source)
  if (invalid.length > 0) {
    for (const name of invalid) {
      deps.error(envErrorMessage(name))
    }
    deps.exit(1)
  }
}

module.exports = checkEnvVariables
module.exports.checkEnvVariables = checkEnvVariables
module.exports.findInvalidEnv = findInvalidEnv
module.exports.envErrorMessage = envErrorMessage
module.exports.webEnvSchema = webEnvSchema
