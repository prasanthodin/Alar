/** Paths a return path may never lead to. */
const REFUSED_PREFIXES = ["/sign-out", "/api"]

/**
 * Where to send a Shopper after she signs in or up (Story 1.9): a path on
 * this site only, such as `/checkout`. Anything else (another site, a
 * protocol-relative `//host`, a backslash trick, `/sign-out` or `/api`, a non-string) is refused and
 * null is returned, so a link cannot send her off the site.
 */
export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== "string") return null
  const path = value.trim()
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || /[\u0000-\u001f]/.test(path)) return null
  if (path.length > 200) return null
  // Never a page that acts on arrival: signing out right after signing in, or an API route.
  if (REFUSED_PREFIXES.some((p) => path === p || [`${p}/`, `${p}?`, `${p}#`].some((start) => path.startsWith(start)))) {
    return null
  }
  return path
}

/** A sign-in or sign-up address that returns to `next` afterwards (when it is a safe path). */
export function withReturnPath(href: string, next: string | null): string {
  return next ? `${href}?next=${encodeURIComponent(next)}` : href
}
