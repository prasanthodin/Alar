import "server-only"

/**
 * Reads an environment variable at request time. Next.js inlines
 * `process.env.NEXT_PUBLIC_*` at build time, but not a lookup by a variable
 * name, so one image built once can run with the values of each environment.
 */
function read(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

/**
 * Where server-side code reaches the kernel: the container-network address
 * when set (compose), else the public address.
 */
export function commerceBaseUrl(): string {
  return read("COMMERCE_INTERNAL_URL") ?? read("NEXT_PUBLIC_MEDUSA_BACKEND_URL") ?? "http://localhost:9000"
}

export function publishableKey(): string {
  return read("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY") ?? ""
}
