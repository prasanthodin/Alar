import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Signed preview links for unpublished Designs (Story 1.8). The token is
 * `<expiry>.<signature>`: the expiry in whole seconds since the epoch and the
 * HMAC-SHA256 of `<designId>.<expiry>` under PREVIEW_TOKEN_SECRET, base64url.
 * It opens one Design until it expires; the server checks it on every read.
 */

/** How long a preview link works unless the caller says otherwise: one hour. */
export const PREVIEW_TOKEN_TTL_SECONDS = 60 * 60

const TOKEN = /^(\d{1,12})\.([A-Za-z0-9_-]{43})$/

function signature(secret: string, designId: string, expiry: number): string {
  return createHmac("sha256", secret).update(`${designId}.${expiry}`).digest("base64url")
}

/** A token for one Design, and when it stops working. */
export function signPreviewToken(
  designId: string,
  secret: string,
  now: Date = new Date(),
  ttlSeconds: number = PREVIEW_TOKEN_TTL_SECONDS
): { token: string; expiresAt: Date } {
  const expiry = Math.floor(now.getTime() / 1000) + ttlSeconds
  return { token: `${expiry}.${signature(secret, designId, expiry)}`, expiresAt: new Date(expiry * 1000) }
}

/**
 * True only for a well-formed token signed for this Design with this secret
 * whose expiry is still ahead. The signature is compared in constant time.
 */
export function verifyPreviewToken(token: unknown, designId: string, secret: string, now: Date = new Date()): boolean {
  if (typeof token !== "string") return false
  const match = TOKEN.exec(token)
  if (!match) return false
  const expiry = Number(match[1])
  if (!Number.isSafeInteger(expiry) || expiry * 1000 <= now.getTime()) return false
  const expected = Buffer.from(signature(secret, designId, expiry))
  const given = Buffer.from(match[2]!)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** The expiry a well-formed token names, or null; says nothing about whether it is valid. */
export function previewTokenExpiry(token: string): Date | null {
  const match = TOKEN.exec(token)
  return match ? new Date(Number(match[1]) * 1000) : null
}
