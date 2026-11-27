import { randomUUID } from "node:crypto"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Reuses an incoming `X-Request-Id` only when it is a UUID; otherwise makes a new one. */
export function resolveRequestId(header: string | string[] | undefined): string {
  const value = Array.isArray(header) ? header[0] : header
  const candidate = value?.trim()
  return candidate && UUID.test(candidate) ? candidate.toLowerCase() : randomUUID()
}

export type AccessLogInput = {
  method: string
  url: string
  status: number
  durationMs: number
  requestId: string
}

/** The path alone: query strings can carry emails, tokens or codes, so they are never logged. */
export function pathWithoutQuery(url: string): string {
  const end = url.search(/[?#]/)
  return end === -1 ? url : url.slice(0, end)
}

/**
 * One JSON access-log line. Only the fields named here are ever written: no
 * headers, body, query string, client address or user agent, so no personal
 * data, token or password can reach the log.
 */
export function formatAccessLog(input: AccessLogInput, now: Date = new Date()): string {
  return JSON.stringify({
    level: "info",
    msg: "request",
    time: now.toISOString(),
    requestId: input.requestId,
    method: input.method,
    path: pathWithoutQuery(input.url),
    status: input.status,
    durationMs: Math.round(input.durationMs * 10) / 10,
  })
}
