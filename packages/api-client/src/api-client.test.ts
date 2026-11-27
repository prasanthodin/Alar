import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createApiClient, type TokenStore } from "./index"

type Call = { url: string; method: string; headers: Headers; body: unknown }
type Route = (call: Call) => Response | Promise<Response>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const customer = {
  id: "cus_01",
  email: "asha@example.com",
  first_name: "Asha",
  last_name: null,
  created_at: "2026-11-27T10:15:00.000Z",
  has_account: true,
  addresses: [],
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

let calls: Call[]
let routes: Record<string, Route>

function installFetch() {
  calls = []
  routes = {}
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: URL | string, init: RequestInit = {}) => {
      const url = new URL(String(input))
      const method = (init.method ?? "GET").toUpperCase()
      const call: Call = {
        url: url.toString(),
        method,
        headers: new Headers(init.headers),
        body: typeof init.body === "string" ? JSON.parse(init.body) : init.body,
      }
      calls.push(call)
      const route = routes[`${method} ${url.pathname}`]
      if (!route) return json(404, { message: "no route" })
      return route(call)
    })
  )
}

function memoryStore(initial: string | null = null): TokenStore & { value: string | null } {
  return {
    value: initial,
    get() {
      return this.value
    },
    set(token: string) {
      this.value = token
    },
    clear() {
      this.value = null
    },
  }
}

function client(store = memoryStore()) {
  return {
    store,
    api: createApiClient({
      baseUrl: "http://kernel.test",
      publishableKey: "pk_test",
      platform: "web",
      version: "1.2.3",
      getLanguage: () => "en",
      tokenStore: store,
    }),
  }
}

beforeEach(installFetch)
afterEach(() => vi.unstubAllGlobals())

describe("sign up", () => {
  it("creates the account, signs in and returns the ShopperView", async () => {
    routes["POST /auth/customer/emailpass/register"] = () => json(200, { token: "reg" })
    routes["POST /store/customers"] = (c) => {
      expect(c.headers.get("authorization")).toBe("Bearer reg")
      expect(c.body).toEqual({ email: "asha@example.com", first_name: "Asha" })
      return json(200, { customer })
    }
    routes["POST /auth/customer/emailpass"] = () => json(200, { token: "session" })

    const { api, store } = client()
    const res = await api.signUp({ email: "asha@example.com", password: "password1", firstName: "Asha" })

    expect(res).toEqual({
      ok: true,
      data: {
        id: "cus_01",
        email: "asha@example.com",
        firstName: "Asha",
        createdAt: "2026-11-27T10:15:00.000Z",
      },
    })
    expect(store.value).toBe("session")
  })

  it("gives auth.sign_up_failed and no session for an existing email", async () => {
    routes["POST /auth/customer/emailpass/register"] = () =>
      json(401, { type: "unauthorized", message: "Identity with email already exists" })

    const { api, store } = client()
    const res = await api.signUp({ email: "asha@example.com", password: "password1" })

    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("auth.sign_up_failed")
    expect(store.value).toBeNull()
    expect(calls).toHaveLength(1)
  })

  it("gives auth.sign_up_failed when the customer already exists", async () => {
    routes["POST /auth/customer/emailpass/register"] = () => json(200, { token: "reg" })
    routes["POST /store/customers"] = () =>
      json(400, { type: "invalid_data", message: "Customer with email already exists" })

    const { api, store } = client()
    const res = await api.signUp({ email: "asha@example.com", password: "password1" })

    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("auth.sign_up_failed")
    expect(store.value).toBeNull()
  })

  it("refuses a password shorter than 8 characters without calling the kernel", async () => {
    const { api } = client()
    const res = await api.signUp({ email: "asha@example.com", password: "short" })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("input.invalid")
    expect(calls).toHaveLength(0)
  })
})

describe("sign in", () => {
  it("stores the session and returns the ShopperView", async () => {
    routes["POST /auth/customer/emailpass"] = () => json(200, { token: "session" })
    routes["GET /store/customers/me"] = (c) => {
      expect(c.headers.get("authorization")).toBe("Bearer session")
      return json(200, { customer })
    }

    const { api, store } = client()
    const res = await api.signIn({ email: "asha@example.com", password: "password1" })

    expect(res.ok).toBe(true)
    if (res.ok) expect(res.data.email).toBe("asha@example.com")
    expect(store.value).toBe("session")

    const shopper = await api.getShopper()
    expect(shopper.ok).toBe(true)
    if (shopper.ok) expect(shopper.data.id).toBe("cus_01")
  })

  it.each([
    ["wrong password", { email: "asha@example.com", password: "wrong-pass" }],
    ["unknown email", { email: "nobody@example.com", password: "password1" }],
  ])("gives auth.invalid_credentials for a %s, with no session", async (_case, input) => {
    routes["POST /auth/customer/emailpass"] = () =>
      json(401, { type: "unauthorized", message: "Invalid email or password" })

    const { api, store } = client()
    const res = await api.signIn(input)

    expect(res).toEqual({
      ok: false,
      error: { code: "auth.invalid_credentials", message: "Invalid email or password" },
    })
    expect(store.value).toBeNull()
  })

  it("treats an identity without a customer as invalid credentials", async () => {
    routes["POST /auth/customer/emailpass"] = () => json(200, { token: "orphan" })
    routes["GET /store/customers/me"] = () => json(401, { message: "Unauthorized" })

    const { api, store } = client()
    const res = await api.signIn({ email: "asha@example.com", password: "password1" })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("auth.invalid_credentials")
    expect(store.value).toBeNull()
  })
})

describe("sign out", () => {
  it("clears the session so getShopper is unauthenticated", async () => {
    const { api, store } = client(memoryStore("session"))
    expect(await api.signOut()).toEqual({ ok: true, data: null })
    expect(store.value).toBeNull()

    const res = await api.getShopper()
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("auth.unauthenticated")
    expect(calls).toHaveLength(0)
  })
})

describe("getShopper", () => {
  it("gives auth.unauthenticated when the kernel refuses the token", async () => {
    routes["GET /store/customers/me"] = () => json(401, { message: "Unauthorized" })
    const { api } = client(memoryStore("expired"))
    const res = await api.getShopper()
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("auth.unauthenticated")
  })

  it("drops a field unknown to the schema and succeeds", async () => {
    routes["GET /store/customers/me"] = () =>
      json(200, { customer: { ...customer, loyalty_tier: "gold" }, extra: 1 })
    const { api } = client(memoryStore("session"))
    const res = await api.getShopper()
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data).toEqual({
        id: "cus_01",
        email: "asha@example.com",
        firstName: "Asha",
        createdAt: "2026-11-27T10:15:00.000Z",
      })
      expect("loyalty_tier" in res.data).toBe(false)
    }
  })

  it("returns response.invalid, not a throw, when the response fails the schema", async () => {
    routes["GET /store/customers/me"] = () => json(200, { customer: { id: 7 } })
    const { api } = client(memoryStore("session"))
    const res = await api.getShopper()
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe("response.invalid")
      expect(typeof res.error.message).toBe("string")
    }
  })

  it("returns response.invalid when the body is not JSON", async () => {
    routes["GET /store/customers/me"] = () =>
      new Response("<html>oops</html>", { status: 200, headers: { "content-type": "text/html" } })
    const { api } = client(memoryStore("session"))
    const res = await api.getShopper()
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("response.invalid")
  })

  it("returns network.unavailable, not a throw, when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("fetch failed"))))
    const { api } = client(memoryStore("session"))
    const res = await api.getShopper()
    expect(res).toEqual({
      ok: false,
      error: { code: "network.unavailable", message: "fetch failed" },
    })
  })

  it("maps a kernel 5xx to internal", async () => {
    routes["GET /store/customers/me"] = () => json(500, { message: "boom" })
    const { api } = client(memoryStore("session"))
    const res = await api.getShopper()
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error.code).toBe("internal")
  })
})

describe("headers", () => {
  it("sends X-Client, Accept-Language, X-Request-Id and the publishable key on every request", async () => {
    routes["POST /auth/customer/emailpass"] = () => json(200, { token: "session" })
    routes["GET /store/customers/me"] = () => json(200, { customer })

    const { api } = client()
    await api.signIn({ email: "asha@example.com", password: "password1" })

    expect(calls).toHaveLength(2)
    for (const c of calls) {
      expect(c.headers.get("x-client")).toBe("web/1.2.3")
      expect(c.headers.get("accept-language")).toBe("en")
      expect(c.headers.get("x-request-id")).toMatch(UUID)
      expect(c.headers.get("x-publishable-api-key")).toBe("pk_test")
    }
    expect(calls[0]!.headers.get("x-request-id")).not.toBe(calls[1]!.headers.get("x-request-id"))
  })

  it("sends Idempotency-Key only on state-changing requests", async () => {
    routes["POST /auth/customer/emailpass/register"] = () => json(200, { token: "reg" })
    routes["POST /store/customers"] = () => json(200, { customer })
    routes["POST /auth/customer/emailpass"] = () => json(200, { token: "session" })
    routes["GET /store/customers/me"] = () => json(200, { customer })

    const { api } = client()
    await api.signUp({ email: "asha@example.com", password: "password1" })
    await api.getShopper()

    const posts = calls.filter((c) => c.method === "POST")
    const gets = calls.filter((c) => c.method === "GET")
    expect(posts).toHaveLength(3)
    expect(gets).toHaveLength(1)
    for (const c of posts) expect(c.headers.get("idempotency-key")).toMatch(UUID)
    for (const c of gets) expect(c.headers.get("idempotency-key")).toBeNull()
    const keys = new Set(posts.map((c) => c.headers.get("idempotency-key")))
    expect(keys.size).toBe(3)
  })
})
