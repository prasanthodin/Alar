/// <reference types="jest" />
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  completeCartWorkflow,
  createApiKeysWorkflow,
  createCartWorkflow,
  createInventoryItemsWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  createUserAccountWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"
import { NEVER_ALLOWED_KERNEL_ROUTES } from "@shop/contracts"
import hideAdminStockNavigation from "../../src/migration-scripts/hide-admin-stock-navigation"

jest.setTimeout(120 * 1000)

type Method = "GET" | "POST" | "DELETE"
type Headers = Record<string, string>

const ADMIN = { email: "owner@example.test", password: "owner-pass-1" }
const SHOPPER = { email: "asha@example.test", password: "shopper-pass-1" }

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection }) => {
    // Fixtures made once in beforeAll; the runner restores this state before every test.
    let pk: string
    let adminCookie: string
    let shopperToken: string
    let cartId: string
    let orderId: string
    let paymentId: string
    let inventoryItemId: string
    let locationId: string

    async function call(method: Method, url: string, opts: { headers?: Headers; data?: unknown } = {}) {
      return api.request({ method, url, headers: opts.headers, data: opts.data, validateStatus: () => true })
    }
    const store = (extra: Headers = {}): Headers => ({ "x-publishable-api-key": pk, ...extra })
    const asShopper = (): Headers => store({ authorization: `Bearer ${shopperToken}` })
    const asAdmin = (): Headers => ({ cookie: adminCookie })

    async function count(sql: string): Promise<number> {
      const res = await dbConnection.raw(sql)
      return Number(res.rows[0].n)
    }
    /** Rows and quantities that a refused request must leave unchanged. */
    async function snapshot() {
      return {
        orders: await count(`select count(*) as n from "order"`),
        completedCarts: await count(`select count(*) as n from cart where completed_at is not null`),
        reservations: await count(`select count(*) as n from reservation_item where deleted_at is null`),
        stocked: await count(`select coalesce(sum(stocked_quantity), 0) as n from inventory_level where deleted_at is null`),
        levels: await count(`select count(*) as n from inventory_level where deleted_at is null`),
        captures: await count(`select count(*) as n from capture where deleted_at is null`),
        refunds: await count(`select count(*) as n from refund where deleted_at is null`),
        paymentCollections: await count(`select count(*) as n from payment_collection where deleted_at is null`),
        orderChanges: await count(`select count(*) as n from order_change where deleted_at is null`),
      }
    }

    function expectRefused(res: { status: number; data: unknown }) {
      expect(res.status).toBe(403)
      expect(res.data).toEqual({ code: "route.not_allowed", message: expect.any(String) })
    }

    async function completableCart(container: ReturnType<typeof getContainer>, regionId: string, salesChannelId: string, customerId?: string) {
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          email: SHOPPER.email,
          ...(customerId ? { customer_id: customerId } : {}),
          items: [{ title: "Test saree", quantity: 1, unit_price: 315000, requires_shipping: false }],
        },
      })
      const { result: collection } = await createPaymentCollectionForCartWorkflow(container).run({
        input: { cart_id: cart.id },
      })
      await createPaymentSessionsWorkflow(container).run({
        input: { payment_collection_id: collection.id, provider_id: "pp_system_default" },
      })
      return cart.id
    }

    beforeAll(async () => {
      const container = getContainer()

      const { result: channels } = await createSalesChannelsWorkflow(container).run({
        input: { salesChannelsData: [{ name: "Website" }] },
      })
      const salesChannelId = channels[0]!.id
      const { result: keys } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Website", type: "publishable", created_by: "test" }] },
      })
      pk = keys[0]!.token
      await linkSalesChannelsToApiKeyWorkflow(container).run({
        input: { id: keys[0]!.id, add: [salesChannelId] },
      })
      const { result: regions } = await createRegionsWorkflow(container).run({
        input: {
          regions: [{ name: "India", currency_code: "inr", countries: ["in"], payment_providers: ["pp_system_default"] }],
        },
      })
      const regionId = regions[0]!.id

      // Admin: an emailpass identity with a user, signed in to a session cookie.
      const auth = container.resolve(Modules.AUTH)
      const registered = await auth.register("emailpass", { body: ADMIN } as never)
      await createUserAccountWorkflow(container).run({
        input: { authIdentityId: registered.authIdentity!.id, userData: { email: ADMIN.email } },
      })
      const adminLogin = await call("POST", "/auth/user/emailpass", { data: ADMIN })
      expect(adminLogin.status).toBe(200)
      const session = await call("POST", "/auth/session", {
        headers: { authorization: `Bearer ${adminLogin.data.token}` },
      })
      expect(session.status).toBe(200)
      const setCookie = session.headers["set-cookie"]
      adminCookie = (Array.isArray(setCookie) ? setCookie : [String(setCookie)]).map((c) => c.split(";")[0]).join("; ")

      // Shopper: the Story 1.2 sign-up, through the allowed routes only.
      const reg = await call("POST", "/auth/customer/emailpass/register", { headers: store(), data: SHOPPER })
      expect(reg.status).toBe(200)
      const created = await call("POST", "/store/customers", {
        headers: store({ authorization: `Bearer ${reg.data.token}` }),
        data: { email: SHOPPER.email, first_name: "Asha" },
      })
      expect(created.status).toBe(200)
      const login = await call("POST", "/auth/customer/emailpass", { headers: store(), data: SHOPPER })
      expect(login.status).toBe(200)
      shopperToken = login.data.token
      const customerId: string = created.data.customer.id

      // Stock: one location and one inventory item with a level of 5.
      const { result: locations } = await createStockLocationsWorkflow(container).run({
        input: { locations: [{ name: "Shop" }] },
      })
      locationId = locations[0]!.id
      const { result: items } = await createInventoryItemsWorkflow(container).run({
        input: { items: [{ sku: "SAREE-1", location_levels: [{ location_id: locationId, stocked_quantity: 5 }] }] },
      })
      inventoryItemId = items[0]!.id

      // A cart that would complete, and an Order completed on the server (the
      // way `confirm-payment` will in Story 1.10), whose payment the admin tries to touch.
      cartId = await completableCart(container, regionId, salesChannelId, customerId)
      const paidCartId = await completableCart(container, regionId, salesChannelId, customerId)
      const { result } = await completeCartWorkflow(container).run({ input: { id: paidCartId } })
      orderId = result.id
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "payment_collections.payments.id"],
        filters: { id: orderId },
      })
      paymentId = orders[0]!.payment_collections![0]!.payments![0]!.id
    })

    describe("allowed store routes", () => {
      it("signs a Shopper up, in and reads her account as before (Story 1.2)", async () => {
        const me = await call("GET", "/store/customers/me", { headers: asShopper() })
        expect(me.status).toBe(200)
        expect(me.data.customer.email).toBe(SHOPPER.email)
        const again = await call("POST", "/auth/customer/emailpass", { headers: store(), data: SHOPPER })
        expect(again.status).toBe(200)
      })
    })

    describe("unlisted kernel routes", () => {
      it.each([
        ["GET", "/store/collections"],
        ["GET", "/store/products"],
        ["POST", "/store/carts"],
        ["GET", "/store/regions"],
        ["POST", "/auth/user/emailpass/register"],
      ] as const)("refuses %s %s with route.not_allowed", async (method, url) => {
        expectRefused(await call(method, url, { headers: store(), data: {} }))
      })

      it("refuses an unlisted admin route for a signed-in admin", async () => {
        expectRefused(await call("GET", "/admin/collections", { headers: asAdmin() }))
        expectRefused(await call("POST", "/admin/products", { headers: asAdmin(), data: { title: "x" } }))
      })

      it("keeps the health route reachable", async () => {
        const res = await call("GET", "/health")
        expect(res.status).toBe(200)
      })
    })

    describe("cart completion", () => {
      it("is refused anonymously and signed in, and no order is created", async () => {
        const before = await snapshot()
        expectRefused(await call("POST", `/store/carts/${cartId}/complete`, { headers: store() }))
        expectRefused(await call("POST", `/store/carts/${cartId}/complete`, { headers: asShopper() }))
        expect(await snapshot()).toEqual(before)
        const completedAt = await dbConnection.raw(`select completed_at from cart where id = ?`, [cartId])
        expect(completedAt.rows[0].completed_at).toBeNull()
      })

      it("still completes on the server, through the workflow (Story 1.10's half)", async () => {
        const before = await snapshot()
        const { result } = await completeCartWorkflow(getContainer()).run({ input: { id: cartId } })
        expect(result.id).toMatch(/^order_/)
        expect((await snapshot()).orders).toBe(before.orders + 1)
      })
    })

    describe("direct money and stock edits with a valid admin session", () => {
      it("can read what the kept screens need", async () => {
        const orders = await call("GET", "/admin/orders", { headers: asAdmin() })
        expect(orders.status).toBe(200)
        expect(orders.data.orders.map((o: { id: string }) => o.id)).toContain(orderId)
        expect((await call("GET", `/admin/orders/${orderId}`, { headers: asAdmin() })).status).toBe(200)
        expect((await call("GET", "/admin/products", { headers: asAdmin() })).status).toBe(200)
        expect((await call("GET", "/admin/customers", { headers: asAdmin() })).status).toBe(200)
      })

      // URLs and bodies are functions: the ids exist only once beforeAll has run.
      const edits: [string, Method, () => string, () => unknown][] = [
        ["a stock level update", "POST", () => `/admin/inventory-items/${inventoryItemId}/location-levels/${locationId}`, () => ({ stocked_quantity: 50 })],
        ["a stock level create", "POST", () => `/admin/inventory-items/${inventoryItemId}/location-levels`, () => ({ location_id: "sloc_other", stocked_quantity: 9 })],
        ["a stock level delete", "DELETE", () => `/admin/inventory-items/${inventoryItemId}/location-levels/${locationId}`, () => undefined],
        ["a stock level batch", "POST", () => "/admin/inventory-items/location-levels/batch", () => ({ update: [{ inventory_item_id: inventoryItemId, location_id: locationId, stocked_quantity: 0 }] })],
        ["a reservation create", "POST", () => "/admin/reservations", () => ({ inventory_item_id: inventoryItemId, location_id: locationId, quantity: 1 })],
        ["a payment capture", "POST", () => `/admin/payments/${paymentId}/capture`, () => ({})],
        ["a payment refund", "POST", () => `/admin/payments/${paymentId}/refund`, () => ({ amount: 1000 })],
        ["an order credit line", "POST", () => `/admin/orders/${orderId}/credit-lines`, () => ({ amount: 1000, reference: "order", reference_id: orderId })],
        ["an order edit", "POST", () => "/admin/order-edits", () => ({ order_id: orderId })],
      ]
      it.each(edits)("refuses %s and changes nothing", async (_label, method, url, data) => {
        const before = await snapshot()
        expectRefused(await call(method, url(), { headers: asAdmin(), data: data() }))
        expect(await snapshot()).toEqual(before)
      })

      it("refuses every never-allowed route", async () => {
        const ids: Record<string, string> = { id: orderId, location_id: locationId }
        const before = await snapshot()
        for (const route of NEVER_ALLOWED_KERNEL_ROUTES) {
          const url = route.pattern.replace(/:([a-z_]+)/g, (_m, name: string) => ids[name] ?? `${name}_01`)
          const headers = url.startsWith("/store") ? asShopper() : asAdmin()
          const res = await call(route.method, url, { headers, data: {} })
          expect({ route: `${route.method} ${route.pattern}`, status: res.status, code: res.data?.code }).toEqual({
            route: `${route.method} ${route.pattern}`,
            status: 403,
            code: "route.not_allowed",
          })
        }
        expect(await snapshot()).toEqual(before)
      })
    })

    describe("identity mix", () => {
      it("refuses a Shopper token on an admin route", async () => {
        const res = await call("GET", "/admin/products", { headers: { authorization: `Bearer ${shopperToken}` } })
        expect([401, 403]).toContain(res.status)
        expect(res.data.products).toBeUndefined()
      })

      it("refuses an admin session on a Shopper-only store route", async () => {
        const res = await call("GET", "/store/customers/me", { headers: store({ cookie: adminCookie }) })
        expect([401, 403]).toContain(res.status)
        expect(res.data.customer).toBeUndefined()
      })

      it("refuses an admin token on a Shopper-only store route", async () => {
        const login = await call("POST", "/auth/user/emailpass", { data: ADMIN })
        const res = await call("GET", "/store/customers/me", {
          headers: store({ authorization: `Bearer ${login.data.token}` }),
        })
        expect([401, 403]).toContain(res.status)
        expect(res.data.customer).toBeUndefined()
      })
    })

    describe("admin navigation", () => {
      it("hides Inventory (stock levels and reservations) for every admin, who cannot save a layout of their own", async () => {
        await hideAdminStockNavigation({ container: getContainer() })
        const res = await call("GET", "/admin/layouts/sidebar/configuration", { headers: asAdmin() })
        expect(res.status).toBe(200)
        expect(res.data.active_scope).toBe("default")
        expect(res.data.default_configuration.configuration.widgets["core:nav:/inventory"]).toEqual({ hidden: true })
        expectRefused(
          await call("POST", "/admin/layouts/sidebar/configuration", {
            headers: asAdmin(),
            data: { configuration: { widgets: { "core:nav:/inventory": { hidden: false } } } },
          })
        )
      })
    })

    describe("shop routes", () => {
      it.each([
        ["GET", "/store/shop/anything"],
        ["POST", "/admin/shop/anything"],
        ["POST", "/webhooks/anything"],
        ["GET", "/internal/anything"],
      ] as const)("does not refuse %s %s with route.not_allowed", async (method, url) => {
        const headers = url.startsWith("/admin") ? asAdmin() : store()
        const res = await call(method, url, { headers, data: {} })
        expect(res.data?.code).not.toBe("route.not_allowed")
        expect(res.status).toBe(404)
      })
    })
  },
})
