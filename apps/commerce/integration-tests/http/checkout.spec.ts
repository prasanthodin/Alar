/// <reference types="jest" />
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  createStoresWorkflow,
  createUserAccountWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { GetBucketPolicyCommand, GetBucketVersioningCommand, S3Client } from "@aws-sdk/client-s3"
import {
  BagView,
  CartChangedDetails,
  CheckoutRecoveryFile,
  checkoutRecoveryKey,
  CheckoutView,
  DesignCard,
  DesignView,
} from "@shop/contracts"
import releaseExpiredHolds from "../../src/jobs/release-expired-holds"
import { readJsonDocument } from "../../src/lib/documents"
import { holds } from "../../src/lib/holds"
import { seedHoldMinutes } from "../../src/migration-scripts/checkout-hold-setting"
import { seedShopSettings } from "../../src/migration-scripts/shop-settings-seed"
import { seedShopStockLocation } from "../../src/migration-scripts/stock-location-seed"
import { seedShopShipping } from "../../src/migration-scripts/stock-location-shipping"
import { DESIGN_ATTRIBUTES_MODULE, type DesignAttributesModuleService } from "../../src/modules/design-attributes"

jest.setTimeout(240 * 1000)

type Method = "GET" | "POST" | "DELETE"
type Headers = Record<string, string>

const ADMIN = { email: "owner-checkout@example.test", password: "owner-pass-1" }
const ADMIN_ORIGIN = "http://localhost:9000"

const ATTRIBUTES = {
  fibre: "Silk",
  weave: "Arani",
  lengthM: 6.3,
  widthM: 1.14,
  blousePieceIncluded: true,
  care: "Dry clean only",
  countryOfOrigin: "India",
  taxCode: "saree",
  stitched: false,
}

const PHOTOS = [
  { fileId: "closeup.jpg", url: "http://files.test/catalog/closeup.jpg", role: "close_up", position: 0 },
  { fileId: "drape.jpg", url: "http://files.test/catalog/drape.jpg", role: "other", position: 1 },
]

/** The address every Shopper here enters. Its words must never reach a log. */
const ADDRESS = {
  name: "Meenakshi Sundaram",
  mobile: "98765 43210",
  addressLine: "14 Gandhi Road, Periyar Nagar",
  city: "Kanchipuram",
  pincode: "631501",
  state: "Tamil Nadu",
}
const SECRET_WORDS = ["Meenakshi Sundaram", "9876543210", "98765 43210", "Gandhi Road", "Periyar Nagar"]

type Made = { id: string; variantId: string; handle: string; inventoryItemId: string }
type Shopper = { token: string; customerId: string }

/** Everything written to the process's output and the kernel logger while `fn` runs. */
async function captureLogs<T>(logger: Record<string, unknown>, fn: () => Promise<T>): Promise<{ result: T; text: string }> {
  const chunks: string[] = []
  const restore: (() => void)[] = []
  for (const stream of [process.stdout, process.stderr]) {
    const original = stream.write.bind(stream)
    stream.write = ((chunk: unknown, ...rest: unknown[]) => {
      chunks.push(String(chunk))
      return (original as (...a: unknown[]) => boolean)(chunk, ...rest)
    }) as typeof stream.write
    restore.push(() => {
      stream.write = original
    })
  }
  for (const level of ["error", "warn", "info", "http", "verbose", "debug", "silly", "log", "activity", "progress", "failure", "success"]) {
    if (typeof logger[level] !== "function") continue
    const spy = jest.spyOn(logger as never, level as never).mockImplementation(((...args: unknown[]) => {
      chunks.push(args.map((a) => (a instanceof Error ? `${a.message} ${a.stack}` : typeof a === "string" ? a : JSON.stringify(a))).join(" "))
    }) as never)
    restore.push(() => spy.mockRestore())
  }
  try {
    const result = await fn()
    return { result, text: chunks.join("\n") }
  } finally {
    for (const r of restore.reverse()) r()
  }
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection }) => {
    let pk: string
    let adminCookie: string
    let locationId: string
    let asha: Shopper
    let bina: Shopper

    async function call(method: Method, url: string, opts: { headers?: Headers; data?: unknown } = {}) {
      return api.request({ method, url, headers: opts.headers, data: opts.data, validateStatus: () => true })
    }
    const asAdmin = (): Headers => ({ cookie: adminCookie, origin: ADMIN_ORIGIN })
    const store = (extra: Headers = {}): Headers => ({ "x-publishable-api-key": pk, ...extra })
    const as = (s: Shopper): Headers => store({ authorization: `Bearer ${s.token}` })

    async function makeShopper(email: string): Promise<Shopper> {
      const data = { email, password: "shopper-pass-1" }
      const reg = await call("POST", "/auth/customer/emailpass/register", { headers: store(), data })
      expect(reg.status).toBe(200)
      const created = await call("POST", "/store/customers", {
        headers: store({ authorization: `Bearer ${reg.data.token}` }),
        data: { email },
      })
      expect(created.status).toBe(200)
      const login = await call("POST", "/auth/customer/emailpass", { headers: store(), data })
      expect(login.status).toBe(200)
      return { token: login.data.token, customerId: created.data.customer.id }
    }

    let designCount = 0
    /** A published Design with photos, a price of Rs 3,150 and this many Pieces. */
    async function makeDesign(stock: number): Promise<Made> {
      const container = getContainer()
      const created = await call("POST", "/admin/shop/designs", {
        headers: asAdmin(),
        data: {
          name: `Checkout saree ${++designCount}`,
          description: "Woven by hand.",
          attributes: ATTRIBUTES,
          priceRupees: 3150,
        },
      })
      expect(created.status).toBe(201)
      const { id, variantId } = created.data.design as { id: string; variantId: string }
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({
        entity: "product",
        fields: ["handle", "design_attributes.id", "variants.inventory_items.inventory_item_id"],
        filters: { id },
      })
      const row = data[0] as unknown as {
        handle: string
        design_attributes: { id: string }
        variants: { inventory_items: { inventory_item_id: string }[] }[]
      }
      await container
        .resolve<DesignAttributesModuleService>(DESIGN_ATTRIBUTES_MODULE)
        .updateDesignAttributes({ id: row.design_attributes.id, photos: PHOTOS as unknown as Record<string, unknown> })
      const published = await call("POST", `/admin/shop/designs/${id}/publish`, {
        headers: asAdmin(),
        data: { trueColourConfirmed: true },
      })
      expect(published.status).toBe(200)
      if (stock > 0) await setStock(id, stock)
      return { id, variantId, handle: row.handle, inventoryItemId: row.variants[0]!.inventory_items[0]!.inventory_item_id }
    }

    async function setStock(designId: string, set: number) {
      const res = await call("POST", `/admin/shop/designs/${designId}/stock`, {
        headers: asAdmin(),
        data: { set, reason: "Checkout test stock" },
      })
      expect(res.status).toBe(200)
    }

    async function newCart(...items: { variantId: string; quantity?: number }[]): Promise<string> {
      const res = await call("POST", "/store/carts", {
        headers: store(),
        data: { items: items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity ?? 1 })) },
      })
      expect(res.status).toBe(200)
      return res.data.cart.id as string
    }

    const bag = async (cartId: string) => BagView.parse((await call("GET", `/store/shop/bag/${cartId}`, { headers: store() })).data.bag)
    const begin = (s: Shopper, cartId: string, address: unknown = ADDRESS) =>
      call("POST", "/store/shop/checkouts", { headers: as(s), data: { cartId, address } })
    const cancel = (s: Shopper, checkoutId: string) =>
      call("POST", `/store/shop/checkouts/${checkoutId}/cancel`, { headers: as(s) })

    const rows = async (sql: string, params: unknown[]) => (await dbConnection.raw(sql, params)).rows as Record<string, unknown>[]
    const holdsOf = (cartId: string) => rows(`select * from hold where cart_id = ? and deleted_at is null`, [cartId])
    const checkoutsOf = (cartId: string) => rows(`select * from checkout where cart_id = ? and deleted_at is null`, [cartId])
    const reservationsOf = (holdId: string) =>
      rows(`select * from reservation_item where external_id = ? and deleted_at is null`, [holdId])
    const movementsOf = (variantId: string) =>
      rows(`select * from stock_movement where variant_id = ? order by occurred_at, id`, [variantId])
    const level = async (inventoryItemId: string) => {
      const [l] = await rows(
        `select stocked_quantity, reserved_quantity from inventory_level where inventory_item_id = ? and location_id = ? and deleted_at is null`,
        [inventoryItemId, locationId]
      )
      return { stocked: Number(l!.stocked_quantity), reserved: Number(l!.reserved_quantity) }
    }
    const logger = () => getContainer().resolve(ContainerRegistrationKeys.LOGGER) as unknown as Record<string, unknown>

    beforeAll(async () => {
      const container = getContainer()
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { result: channels } = await createSalesChannelsWorkflow(container).run({
        input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
      })
      const salesChannelId = channels[0]!.id
      const { data: stores } = await query.graph({ entity: "store", fields: ["id"] })
      if (stores[0]) {
        await updateStoresWorkflow(container).run({
          input: { selector: { id: stores[0].id }, update: { default_sales_channel_id: salesChannelId } },
        })
      } else {
        await createStoresWorkflow(container).run({
          input: {
            stores: [
              { name: "Store", default_sales_channel_id: salesChannelId, supported_currencies: [{ currency_code: "inr", is_default: true }] },
            ],
          },
        })
      }
      const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id", "type"] })
      if (!profiles.some((p) => p.type === "default")) {
        await createShippingProfilesWorkflow(container).run({ input: { data: [{ name: "Default Shipping Profile", type: "default" }] } })
      }
      await seedShopSettings(container, {})
      await seedHoldMinutes(container)
      locationId = await seedShopStockLocation(container)
      await seedShopShipping(container)

      const { result: keys } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Website", type: "publishable", created_by: "test" }] },
      })
      pk = keys[0]!.token
      await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: keys[0]!.id, add: [salesChannelId] } })

      const auth = container.resolve(Modules.AUTH)
      const registered = await auth.register("emailpass", { body: ADMIN } as never)
      await createUserAccountWorkflow(container).run({
        input: { authIdentityId: registered.authIdentity!.id, userData: { email: ADMIN.email } },
      })
      const adminLogin = await call("POST", "/auth/user/emailpass", { data: ADMIN })
      const session = await call("POST", "/auth/session", { headers: { authorization: `Bearer ${adminLogin.data.token}` } })
      const setCookie = session.headers["set-cookie"]
      adminCookie = (Array.isArray(setCookie) ? setCookie : [String(setCookie)]).map((c) => c.split(";")[0]).join("; ")

      asha = await makeShopper("asha-checkout@example.test")
      bina = await makeShopper("bina-checkout@example.test")
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    describe("signed out", () => {
      it("is refused (401) and the Bag stays as it was", async () => {
        const d = await makeDesign(2)
        const cartId = await newCart({ variantId: d.variantId })
        const res = await call("POST", "/store/shop/checkouts", { headers: store(), data: { cartId, address: ADDRESS } })
        expect(res.status).toBe(401)
        const view = await bag(cartId)
        expect(view.lines.map((l) => [l.variantId, l.quantity])).toEqual([[d.variantId, 1]])
        expect(view.hold).toBeNull()
        expect(await holdsOf(cartId)).toHaveLength(0)
      })

      it("refuses an admin session", async () => {
        const d = await makeDesign(1)
        const cartId = await newCart({ variantId: d.variantId })
        const res = await call("POST", "/store/shop/checkouts", { headers: store(asAdmin()), data: { cartId, address: ADDRESS } })
        expect(res.status).toBe(401)
      })
    })

    describe("begin", () => {
      it("snapshots the Bag into a Checkout, holds it for 15 minutes with a tagged reservation, one checkout_hold row and the recovery file", async () => {
        const d = await makeDesign(2)
        const cartId = await newCart({ variantId: d.variantId })
        const before = Date.now()
        const { result: res, text } = await captureLogs(logger(), () => begin(asha, cartId))
        expect(res.status).toBe(201)
        const view = CheckoutView.parse(res.data.checkout)
        expect(view).toMatchObject({
          status: "held",
          shippingPaise: 0,
          totalPaise: 315000,
          address: { ...ADDRESS, mobile: "9876543210" },
          lines: [
            {
              variantId: d.variantId,
              designId: d.id,
              quantity: 1,
              unitPricePaise: 315000,
              taxableTotalPaise: 300000,
              taxTotalPaise: 15000,
              lineTotalPaise: 315000,
              rateBp: 500,
              taxCode: "saree",
            },
          ],
        })
        const expiresIn = new Date(view.holdExpiresAt).getTime() - before
        expect(expiresIn).toBeGreaterThan(14.9 * 60_000)
        expect(expiresIn).toBeLessThan(15.5 * 60_000)

        const [hold] = await holdsOf(cartId)
        expect(hold).toMatchObject({ status: "live", checkout_id: view.id })
        expect(new Date(hold!.expires_at as string).toISOString()).toBe(view.holdExpiresAt)
        const [checkout] = await checkoutsOf(cartId)
        expect(checkout).toMatchObject({ id: view.id, status: "held", customer_id: asha.customerId })

        const reservations = await reservationsOf(hold!.id as string)
        expect(reservations).toHaveLength(1)
        expect(reservations[0]).toMatchObject({ inventory_item_id: d.inventoryItemId, location_id: locationId, external_id: hold!.id })
        expect(Number(reservations[0]!.quantity)).toBe(1)
        expect(await level(d.inventoryItemId)).toEqual({ stocked: 2, reserved: 1 })

        const movements = await movementsOf(d.variantId)
        const holdRows = movements.filter((m) => m.cause === "checkout_hold")
        expect(holdRows).toHaveLength(1)
        expect(holdRows[0]).toMatchObject({ change: 1, stocked_after: 2, reserved_after: 1, actor: "system:begin-checkout", actor_id: null })

        const file = CheckoutRecoveryFile.parse(await readJsonDocument(checkoutRecoveryKey(view.id)))
        expect(file).toMatchObject({ checkoutId: view.id, holdId: hold!.id, holdExpiresAt: view.holdExpiresAt })
        expect(file.snapshot).toMatchObject({
          cartId,
          customerId: asha.customerId,
          totalPaise: 315000,
          address: view.address,
          lines: view.lines,
        })

        // The kernel cart is ready for Story 1.10: the Shopper, the address, the standard shipping method, tax lines.
        const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
        const { data: carts } = await query.graph({
          entity: "cart",
          fields: ["customer_id", "shipping_address.postal_code", "shipping_address.country_code", "shipping_methods.id", "items.tax_lines.code"],
          filters: { id: cartId },
        })
        const cart = carts[0] as unknown as {
          customer_id: string
          shipping_address: { postal_code: string; country_code: string }
          shipping_methods: unknown[]
          items: { tax_lines: { code: string }[] }[]
        }
        expect(cart.customer_id).toBe(asha.customerId)
        expect(cart.shipping_address).toMatchObject({ postal_code: "631501", country_code: "in" })
        expect(cart.shipping_methods).toHaveLength(1)
        expect(cart.items[0]!.tax_lines.map((t) => t.code)).toEqual(["saree"])

        // The Bag shows the Hold, and her own held Pieces still count for her line.
        const held = await bag(cartId)
        expect(held.hold).toEqual({ checkoutId: view.id, expiresAt: view.holdExpiresAt })
        expect(held.lines[0]).toMatchObject({ quantity: 1, stock: 2 })

        // GET by its owner gives the same view.
        const got = await call("GET", `/store/shop/checkouts/${view.id}`, { headers: as(asha) })
        expect(got.status).toBe(200)
        expect(got.data.checkout).toEqual(res.data.checkout)

        for (const word of SECRET_WORDS) expect(text).not.toContain(word)
      })

      it("answers a second begin with the same Checkout and makes no second Hold", async () => {
        const d = await makeDesign(3)
        const cartId = await newCart({ variantId: d.variantId })
        const first = await begin(asha, cartId)
        expect(first.status).toBe(201)
        const again = await begin(asha, cartId, { ...ADDRESS, city: "Chennai" })
        expect(again.status).toBe(200)
        expect(again.data.checkout.id).toBe(first.data.checkout.id)
        expect(again.data.checkout.address.city).toBe("Kanchipuram")
        const holdRows = await holdsOf(cartId)
        expect(holdRows).toHaveLength(1)
        expect(await reservationsOf(holdRows[0]!.id as string)).toHaveLength(1)
        expect(await checkoutsOf(cartId)).toHaveLength(1)
        expect((await movementsOf(d.variantId)).filter((m) => m.cause === "checkout_hold")).toHaveLength(1)
      })

      it("refuses a 5-digit pincode, a missing field and a bad mobile number with input.invalid, creating nothing", async () => {
        const d = await makeDesign(1)
        const cartId = await newCart({ variantId: d.variantId })
        for (const address of [
          { ...ADDRESS, pincode: "63150" },
          { ...ADDRESS, mobile: "12345" },
          { ...ADDRESS, state: "Ceylon" },
          (({ city: _city, ...rest }) => rest)(ADDRESS),
        ]) {
          const res = await begin(asha, cartId, address)
          expect(res.status).toBe(400)
          expect(res.data.code).toBe("input.invalid")
        }
        expect(await holdsOf(cartId)).toHaveLength(0)
        expect(await checkoutsOf(cartId)).toHaveLength(0)
        expect(await level(d.inventoryItemId)).toEqual({ stocked: 1, reserved: 0 })
      })

      it("answers bag.not_found for an unknown cart", async () => {
        const res = await begin(asha, "cart_nope")
        expect(res.status).toBe(404)
        expect(res.data.code).toBe("bag.not_found")
      })
    })

    describe("a live Hold locks the Bag", () => {
      it("refuses add, change and remove with cart.locked, and another Shopper's begin", async () => {
        const d = await makeDesign(3)
        const other = await makeDesign(3)
        const cartId = await newCart({ variantId: d.variantId })
        const lineId = (await bag(cartId)).lines[0]!.id
        expect((await begin(asha, cartId)).status).toBe(201)

        const add = await call("POST", `/store/carts/${cartId}/line-items`, { headers: store(), data: { variant_id: other.variantId, quantity: 1 } })
        const change = await call("POST", `/store/carts/${cartId}/line-items/${lineId}`, { headers: store(), data: { quantity: 2 } })
        const remove = await call("DELETE", `/store/carts/${cartId}/line-items/${lineId}`, { headers: store() })
        for (const res of [add, change, remove]) {
          expect(res.status).toBe(409)
          expect(res.data.code).toBe("cart.locked")
        }
        const view = await bag(cartId)
        expect(view.lines.map((l) => [l.variantId, l.quantity])).toEqual([[d.variantId, 1]])

        const theirs = await begin(bina, cartId)
        expect(theirs.status).toBe(409)
        expect(theirs.data.code).toBe("cart.locked")
        expect(await holdsOf(cartId)).toHaveLength(1)
      })
    })

    describe("the last Piece", () => {
      it("shows a Design whose last Piece is on Hold as held (unavailable for now), and it cannot be added", async () => {
        const d = await makeDesign(1)
        const cartId = await newCart({ variantId: d.variantId })
        expect((await begin(asha, cartId)).status).toBe(201)

        const page = await call("GET", `/store/shop/designs/${d.handle}`, { headers: store() })
        expect(DesignView.parse(page.data.design)).toMatchObject({ availability: "held", variants: [{ stock: 0 }] })
        const list = await call("GET", "/store/shop/designs", { headers: store() })
        const card = (list.data.designs as DesignCard[]).find((c) => c.id === d.id)
        expect(card?.availability).toBe("held")

        const added = await call("POST", "/store/carts", { headers: store(), data: { items: [{ variant_id: d.variantId, quantity: 1 }] } })
        expect(added.status).toBe(400)
        expect(added.data.code).toBe("insufficient_inventory")
      })

      it("gives exactly one Hold when two Shoppers begin at the same moment; the other gets stock.unavailable", async () => {
        const d = await makeDesign(1)
        const cartA = await newCart({ variantId: d.variantId })
        const cartB = await newCart({ variantId: d.variantId })
        const [a, b] = await Promise.all([begin(asha, cartA), begin(bina, cartB)])
        const statuses = [a.status, b.status].sort()
        expect(statuses).toEqual([201, 409])
        const loser = a.status === 409 ? a : b
        expect(loser.data.code).toBe("stock.unavailable")
        const live = [...(await holdsOf(cartA)), ...(await holdsOf(cartB))]
        expect(live).toHaveLength(1)
        expect(await reservationsOf(live[0]!.id as string)).toHaveLength(1)
        expect(await level(d.inventoryItemId)).toEqual({ stocked: 1, reserved: 1 })
        expect((await movementsOf(d.variantId)).filter((m) => m.cause === "checkout_hold")).toHaveLength(1)
        expect([...(await checkoutsOf(cartA)), ...(await checkoutsOf(cartB))]).toHaveLength(1)
      })
    })

    describe("cart.changed", () => {
      it("lists a changed price and creates nothing; accepting the new price lets her begin", async () => {
        const d = await makeDesign(2)
        const cartId = await newCart({ variantId: d.variantId })
        const lineId = (await bag(cartId)).lines[0]!.id
        const priced = await call("POST", `/admin/shop/designs/${d.id}/price`, { headers: asAdmin(), data: { priceRupees: 3300 } })
        expect(priced.status).toBe(200)

        const res = await begin(asha, cartId)
        expect(res.status).toBe(409)
        expect(res.data.code).toBe("cart.changed")
        expect(CartChangedDetails.parse(res.data.details).lines).toEqual([
          {
            lineId,
            variantId: d.variantId,
            name: expect.any(String),
            reason: "price_changed",
            quantity: 1,
            unitPricePaise: 315000,
            currentPricePaise: 330000,
            available: 2,
          },
        ])
        expect(await holdsOf(cartId)).toHaveLength(0)
        expect(await checkoutsOf(cartId)).toHaveLength(0)
        expect(await level(d.inventoryItemId)).toEqual({ stocked: 2, reserved: 0 })
        expect((await movementsOf(d.variantId)).filter((m) => m.cause === "checkout_hold")).toHaveLength(0)

        // Accepting: setting the same quantity again takes the price now.
        const accepted = await call("POST", `/store/carts/${cartId}/line-items/${lineId}`, { headers: store(), data: { quantity: 1 } })
        expect(accepted.status).toBe(200)
        const ok = await begin(asha, cartId)
        expect(ok.status).toBe(201)
        expect(ok.data.checkout.totalPaise).toBe(330000)
      })

      it("lists a line now short of stock (sold elsewhere)", async () => {
        const d = await makeDesign(2)
        const cartId = await newCart({ variantId: d.variantId, quantity: 2 })
        await setStock(d.id, 1)
        const res = await begin(asha, cartId)
        expect(res.status).toBe(409)
        expect(res.data.code).toBe("cart.changed")
        expect(res.data.details.lines).toEqual([expect.objectContaining({ reason: "short_of_stock", quantity: 2, available: 1 })])
        expect(await holdsOf(cartId)).toHaveLength(0)
      })
    })

    describe("compensation", () => {
      it("removes the first line's reservation when the second cannot be reserved; no Hold or Checkout remains", async () => {
        const first = await makeDesign(1)
        const second = await makeDesign(1)
        const cartId = await newCart({ variantId: first.variantId }, { variantId: second.variantId })
        const inventory = getContainer().resolve(Modules.INVENTORY)
        const original = inventory.createReservationItems.bind(inventory)
        let calls = 0
        jest.spyOn(inventory, "createReservationItems").mockImplementation((async (...args: unknown[]) => {
          calls++
          if (calls === 2) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Not enough stock available")
          return (original as (...a: unknown[]) => unknown)(...args)
        }) as never)

        const res = await begin(asha, cartId)
        expect(res.status).toBe(409)
        expect(res.data.code).toBe("stock.unavailable")
        expect(calls).toBe(2)
        expect(await holdsOf(cartId)).toHaveLength(0)
        expect(await checkoutsOf(cartId)).toHaveLength(0)
        expect(await level(first.inventoryItemId)).toEqual({ stocked: 1, reserved: 0 })
        expect(await level(second.inventoryItemId)).toEqual({ stocked: 1, reserved: 0 })
        expect(await rows(`select * from reservation_item where inventory_item_id in (?, ?) and deleted_at is null`, [first.inventoryItemId, second.inventoryItemId])).toHaveLength(0)
        for (const d of [first, second]) {
          expect((await movementsOf(d.variantId)).filter((m) => m.cause === "checkout_hold")).toHaveLength(0)
        }
        // The Bag can still be changed.
        expect(await bag(cartId)).toMatchObject({ hold: null })
      })

      it("leaves no Checkout, Hold, reservation or row when the recovery file cannot be written, and logs no address", async () => {
        const d = await makeDesign(1)
        const cartId = await newCart({ variantId: d.variantId })
        const send = S3Client.prototype.send
        jest.spyOn(S3Client.prototype, "send").mockImplementation(function (this: S3Client, command: { constructor: { name: string } }) {
          if (command.constructor.name === "PutObjectCommand") {
            return Promise.reject(Object.assign(new Error(`storage down ${JSON.stringify(command)}`), { name: "ServiceUnavailable" }))
          }
          return (send as (c: unknown) => Promise<unknown>).call(this, command)
        } as never)

        const { result: res, text } = await captureLogs(logger(), () => begin(asha, cartId))
        expect(res.status).toBe(500)
        expect(res.data).toEqual({ code: "internal", message: "Something went wrong" })
        expect(await holdsOf(cartId)).toHaveLength(0)
        expect(await checkoutsOf(cartId)).toHaveLength(0)
        expect(await level(d.inventoryItemId)).toEqual({ stocked: 1, reserved: 0 })
        expect(await rows(`select * from reservation_item where inventory_item_id = ? and deleted_at is null`, [d.inventoryItemId])).toHaveLength(0)
        expect((await movementsOf(d.variantId)).filter((m) => m.cause === "checkout_hold")).toHaveLength(0)
        // The failure is logged (by key and S3 error name), so the capture works, and no address is in it.
        expect(text).toContain(`could not be written (ServiceUnavailable)`)
        for (const word of SECRET_WORDS) expect(text).not.toContain(word)
      })
    })

    describe("cancel", () => {
      it("removes the reservations with hold_released rows and unlocks the Bag", async () => {
        const d = await makeDesign(2)
        const cartId = await newCart({ variantId: d.variantId })
        const lineId = (await bag(cartId)).lines[0]!.id
        const started = await begin(asha, cartId)
        const id = started.data.checkout.id as string
        const [hold] = await holdsOf(cartId)

        // Another Shopper cannot see or cancel it.
        expect((await call("GET", `/store/shop/checkouts/${id}`, { headers: as(bina) })).data.code).toBe("checkout.not_found")
        expect((await cancel(bina, id)).status).toBe(404)
        expect(await reservationsOf(hold!.id as string)).toHaveLength(1)

        const res = await cancel(asha, id)
        expect(res.status).toBe(200)
        expect(CheckoutView.parse(res.data.checkout).status).toBe("cancelled")
        expect(await reservationsOf(hold!.id as string)).toHaveLength(0)
        expect(await level(d.inventoryItemId)).toEqual({ stocked: 2, reserved: 0 })
        const [ended] = await holdsOf(cartId)
        expect(ended).toMatchObject({ status: "released" })
        const released = (await movementsOf(d.variantId)).filter((m) => m.cause === "hold_released")
        expect(released).toHaveLength(1)
        expect(released[0]).toMatchObject({ change: -1, stocked_after: 2, reserved_after: 0, actor: "system:release-hold" })

        // Cancelling again changes nothing.
        expect((await cancel(asha, id)).data.checkout.status).toBe("cancelled")
        expect((await movementsOf(d.variantId)).filter((m) => m.cause === "hold_released")).toHaveLength(1)

        expect((await bag(cartId)).hold).toBeNull()
        const change = await call("POST", `/store/carts/${cartId}/line-items/${lineId}`, { headers: store(), data: { quantity: 2 } })
        expect(change.status).toBe(200)
        expect((await bag(cartId)).lines[0]!.quantity).toBe(2)
      })
    })

    describe("expiry", () => {
      it("the every-minute job releases a Hold past its expiry and marks the Checkout expired", async () => {
        const d = await makeDesign(1)
        const cartId = await newCart({ variantId: d.variantId })
        const started = await begin(asha, cartId)
        const id = started.data.checkout.id as string
        const [hold] = await holdsOf(cartId)

        // Not yet expired: the job leaves it alone.
        await releaseExpiredHolds(getContainer())
        expect((await holdsOf(cartId))[0]).toMatchObject({ status: "live" })

        await holds(getContainer()).updateHolds({ id: hold!.id as string, expires_at: new Date(Date.now() - 60_000) })
        // An expired Hold no longer locks the Bag, even before the job runs.
        expect((await bag(cartId)).hold).toBeNull()
        // (The kernel's own schedule may run it meanwhile; either way it is released once.)
        await releaseExpiredHolds(getContainer())

        expect((await holdsOf(cartId))[0]).toMatchObject({ status: "expired" })
        const got = await call("GET", `/store/shop/checkouts/${id}`, { headers: as(asha) })
        expect(got.data.checkout.status).toBe("expired")
        expect(await reservationsOf(hold!.id as string)).toHaveLength(0)
        expect(await level(d.inventoryItemId)).toEqual({ stocked: 1, reserved: 0 })
        expect((await movementsOf(d.variantId)).filter((m) => m.cause === "hold_released")).toHaveLength(1)

        // Running it again changes nothing; the Design is available again.
        await releaseExpiredHolds(getContainer())
        expect((await movementsOf(d.variantId)).filter((m) => m.cause === "hold_released")).toHaveLength(1)
        const page = await call("GET", `/store/shop/designs/${d.handle}`, { headers: store() })
        expect(page.data.design.availability).toBe("available")
      })

      it("lets her begin again once her Hold has run out, releasing the old one first", async () => {
        const d = await makeDesign(1)
        const cartId = await newCart({ variantId: d.variantId })
        const first = await begin(asha, cartId)
        const [hold] = await holdsOf(cartId)
        await holds(getContainer()).updateHolds({ id: hold!.id as string, expires_at: new Date(Date.now() - 1_000) })
        const again = await begin(asha, cartId)
        expect(again.status).toBe(201)
        expect(again.data.checkout.id).not.toBe(first.data.checkout.id)
        const all = await holdsOf(cartId)
        expect(all.map((h) => h.status).sort()).toEqual(["expired", "live"])
        expect(await level(d.inventoryItemId)).toEqual({ stocked: 1, reserved: 1 })
      })
    })

    describe("the documents bucket", () => {
      it("is versioned and has no bucket policy (private); no public address is built for it", async () => {
        const s3 = new S3Client({
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION,
          forcePathStyle: true,
          credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
        })
        const bucket = process.env.S3_DOCUMENTS_BUCKET!
        expect(bucket).not.toBe(process.env.S3_BUCKET)
        const versioning = await s3.send(new GetBucketVersioningCommand({ Bucket: bucket }))
        expect(versioning.Status).toBe("Enabled")
        await expect(s3.send(new GetBucketPolicyCommand({ Bucket: bucket }))).rejects.toMatchObject({ name: "NoSuchBucketPolicy" })
      })
    })
  },
})
