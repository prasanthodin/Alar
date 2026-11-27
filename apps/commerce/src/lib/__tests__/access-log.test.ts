import { describe, expect, it } from "vitest"
import { formatAccessLog, pathWithoutQuery, resolveRequestId } from "../access-log"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe("formatAccessLog", () => {
  const base = {
    method: "POST",
    url: "/auth/customer/emailpass?email=shopper%40example.com&token=abc123&password=hunter2",
    status: 401,
    durationMs: 12.345,
    requestId: "3b241101-e2bb-4255-8caf-4136c566a962",
  }

  it("writes one JSON line with the request id and the path without its query string", () => {
    const line = formatAccessLog(base, new Date("2026-11-27T10:00:00.000Z"))
    expect(line).not.toContain("\n")
    expect(JSON.parse(line)).toEqual({
      level: "info",
      msg: "request",
      time: "2026-11-27T10:00:00.000Z",
      requestId: base.requestId,
      method: "POST",
      path: "/auth/customer/emailpass",
      status: 401,
      durationMs: 12.3,
    })
  })

  it("never includes body, header or other fields passed to it", () => {
    const withExtras = {
      ...base,
      body: { email: "shopper@example.com", password: "hunter2" },
      headers: { authorization: "Bearer secret-token", cookie: "connect.sid=abc" },
      email: "shopper@example.com",
      password: "hunter2",
      token: "secret-token",
    }
    const line = formatAccessLog(withExtras)
    for (const leaked of ["shopper", "example.com", "hunter2", "secret-token", "Bearer", "connect.sid", "abc123"]) {
      expect(line).not.toContain(leaked)
    }
    expect(Object.keys(JSON.parse(line)).sort()).toEqual(
      ["durationMs", "level", "method", "msg", "path", "requestId", "status", "time"].sort()
    )
  })
})

describe("pathWithoutQuery", () => {
  it.each([
    ["/store/regions", "/store/regions"],
    ["/store/regions?limit=1", "/store/regions"],
    ["/store/regions#fragment", "/store/regions"],
    ["/health?probe=1#x", "/health"],
  ])("%s -> %s", (url, path) => {
    expect(pathWithoutQuery(url)).toBe(path)
  })
})

describe("resolveRequestId", () => {
  it("reuses an incoming UUID", () => {
    expect(resolveRequestId("3B241101-E2BB-4255-8CAF-4136C566A962")).toBe(
      "3b241101-e2bb-4255-8caf-4136c566a962"
    )
    expect(resolveRequestId(["3b241101-e2bb-4255-8caf-4136c566a962", "other"])).toBe(
      "3b241101-e2bb-4255-8caf-4136c566a962"
    )
  })

  it.each([undefined, "", "not-a-uuid", "shopper@example.com", "1".repeat(200)])(
    "generates a fresh UUID for %s",
    (header) => {
      const id = resolveRequestId(header)
      expect(id).toMatch(UUID)
      expect(id).not.toBe(header)
    }
  )
})
