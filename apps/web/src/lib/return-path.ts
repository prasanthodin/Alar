/**
 * Where to send a Shopper after she signs in or up (Story 1.9): a path on
 * this site only, such as `/checkout`. Anything else (another site, a
 * protocol-relative `//host`, a backslash trick, a non-string) is refused and
 * null is returned, so a link cannot send her off the site.
 */
export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== "string") return null
  const path = value.trim()
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || /[\u0000-\u001f]/.test(path)) return null
  if (path.length > 200) return null
  return path
}

/** A sign-in or sign-up address that returns to `next` afterwards (when it is a safe path). */
export function withReturnPath(href: string, next: string | null): string {
  return next ? `${href}?next=${encodeURIComponent(next)}` : href
}
