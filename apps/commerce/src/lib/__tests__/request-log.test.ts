import { createServer, type Server } from "node:http"
import type { AddressInfo } from "node:net"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { subscribeRequestLog } from "../request-log"

const lines: string[] = []
let server: Server
let base: string

beforeAll(async () => {
  subscribeRequestLog((line) => lines.push(line))
  server = createServer((req, res) => {
    // Answers before any app code could add a header, like the kernel's key check.
    res.statusCode = req.url?.startsWith("/store") ? 400 : 200
    res.end(JSON.stringify({ seenRequestId: req.headers["x-request-id"] }))
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

async function lineFor(requestId: string) {
  for (let i = 0; i < 50; i++) {
    const found = lines.find((line) => JSON.parse(line).requestId === requestId)
    if (found) {
      return found
    }
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error(`no log line for ${requestId}`)
}

describe("subscribeRequestLog", () => {
  it("reuses an incoming UUID, passes it on and echoes it", async () => {
    const id = "3b241101-e2bb-4255-8caf-4136c566a962"
    const res = await fetch(`${base}/store/regions?email=shopper%40example.com&token=t0k3n`, {
      headers: { "X-Request-Id": id },
    })
    expect(res.headers.get("x-request-id")).toBe(id)
    expect((await res.json()).seenRequestId).toBe(id)

    const line = await lineFor(id)
    expect(JSON.parse(line)).toMatchObject({ requestId: id, method: "GET", path: "/store/regions", status: 400 })
    expect(line).not.toContain("example.com")
    expect(line).not.toContain("t0k3n")
  })

  it("writes exactly one line per request and replaces a non-UUID id", async () => {
    const before = lines.length
    const res = await fetch(`${base}/health`, { headers: { "X-Request-Id": "shopper@example.com" } })
    const id = res.headers.get("x-request-id") ?? ""
    expect(id).toMatch(/^[0-9a-f-]{36}$/)
    await lineFor(id)
    expect(lines.length - before).toBe(1)
    expect(lines.at(-1)).not.toContain("example.com")
  })
})
