/// <reference types="jest" />
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createStockLocationsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  createStoresWorkflow,
  createUserAccountWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { findShopStockLocationId } from "../../src/lib/stock"
import { stockLockKey } from "../../src/lib/stock-lock"
import { seedShopSettings } from "../../src/migration-scripts/shop-settings-seed"
import { seedShopStockLocation } from "../../src/migration-scripts/stock-location-seed"
import { PRICE_HISTORY_MODULE } from "../../src/modules/price-history"
import type PriceHistoryModuleService from "../../src/modules/price-history/service"
import { STOCK_LEDGER_MODULE, type StockLedgerModuleService } from "../../src/modules/stock-ledger"

jest.setTimeout(180 * 1000)

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
type Headers = Record<string, string>

const ADMIN = { email: "owner@example.test", password: "owner-pass-1" }
const SHOPPER = { email: "asha@example.test", password: "shopper-pass-1" }
/** An admin origin from ADMIN_CORS: shop admin writes must name one. */
const ADMIN_ORIGIN = "http://localhost:9000"

type Movement = {
  id: string
  inventoryItemId: string
  variantId: string
  cause: string
  change: number
  stockedAfter: number
  reservedAfter: number
  actor: string
  actorId: string | null
  reason: string
  occurredAt: string
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection }) => {
    let pk: string
    let adminCookie: string
    let adminToken: string
    let shopperToken: string
    let adminUserId: string
    let locationId: string
    /** The starter-like location the seed takes over, and a demo variant with 7 Pieces there. */
    let warehouseId: string
    let demoItemId: string
    let demoVariantId: string

    async function call(method: Method, url: string, opts: { headers?: Headers; data?: unknown } = {}) {
      return api.request({ method, url, headers: opts.headers, data: opts.data, validateStatus: () => true })
    }
    const asAdmin = (): Headers => ({ cookie: adminCookie, origin: ADMIN_ORIGIN })
    const count = async (sql: string, bindings: unknown[] = []) =>
      Number((await dbConnection.raw(sql, bindings)).rows[0].n)
    const ledger = () => getContainer().resolve<StockLedgerModuleService>(STOCK_LEDGER_MODULE)

    /** A new Design (no photos, so no file storage is needed) with its stock route. */
    async function design() {
      const res = await call("POST", "/admin/shop/designs", {
        headers: asAdmin(),
        data: { name: `Arani silk saree ${Math.random()}`, priceRupees: 3150 },
      })
      expect(res.status).toBe(201)
      const d = res.data.design as { id: string; variantId: string }
      return { ...d, url: `/admin/shop/designs/${d.id}/stock` }
    }
    const adjust = (url: string, data: unknown, headers: Headers = asAdmin()) => call("POST", url, { headers, data })
    const getStock = (url: string) => call("GET", url, { headers: asAdmin() })

    /** The kernel level of a Variant's one inventory item at the India location. */
    async function level(
      variantId: string
    ): Promise<{ inventoryItemId: string; locationId: string; stocked: number; reserved: number }[]> {
      const res = await dbConnection.raw(
        `select il.inventory_item_id, il.stocked_quantity, il.reserved_quantity, il.location_id
           from inventory_level il
           join product_variant_inventory_item l on l.inventory_item_id = il.inventory_item_id and l.deleted_at is null
          where l.variant_id = ? and il.deleted_at is null`,
        [variantId]
      )
      return res.rows.map((r: Record<string, unknown>) => ({
        inventoryItemId: r.inventory_item_id as string,
        locationId: r.location_id as string,
        stocked: Number(r.stocked_quantity),
        reserved: Number(r.reserved_quantity),
      }))
    }
    const rows = (variantId: string) => count(`select count(*) as n from stock_movement where variant_id = ?`, [variantId])
    const logger = () => getContainer().resolve(ContainerRegistrationKeys.LOGGER)

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
              {
                name: "Store",
                default_sales_channel_id: salesChannelId,
                supported_currencies: [{ currency_code: "inr", is_default: true }],
              },
            ],
          },
        })
      }
      const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id", "type"] })
      if (!profiles.some((p) => p.type === "default")) {
        await createShippingProfilesWorkflow(container).run({
          input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
        })
      }
      await seedShopSettings(container, {})

      // As the starter seed leaves it: one "European Warehouse" with a product's stock there.
      const { result: warehouses } = await createStockLocationsWorkflow(container).run({
        input: { locations: [{ name: "European Warehouse", address: { address_1: "", city: "Copenhagen", country_code: "DK" } }] },
      })
      warehouseId = warehouses[0]!.id
      const { result: demo } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: "Demo shirt",
              options: [{ title: "Size", values: ["M"] }],
              variants: [{ title: "M", options: { Size: "M" }, manage_inventory: true, prices: [] }],
            },
          ],
        },
      })
      demoVariantId = demo[0]!.variants[0]!.id
      const { data: demoLinks } = await query.graph({
        entity: "product_variant",
        fields: ["inventory_items.inventory_item_id"],
        filters: { id: demoVariantId },
      })
      demoItemId = (demoLinks[0] as unknown as { inventory_items: { inventory_item_id: string }[] }).inventory_items[0]!
        .inventory_item_id
      await createInventoryLevelsWorkflow(container).run({
        input: { inventory_levels: [{ inventory_item_id: demoItemId, location_id: warehouseId, stocked_quantity: 7 }] },
      })

      locationId = await seedShopStockLocation(container)

      const { result: keys } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Website", type: "publishable", created_by: "test" }] },
      })
      pk = keys[0]!.token
      await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: keys[0]!.id, add: [salesChannelId] } })

      const auth = container.resolve(Modules.AUTH)
      const registered = await auth.register("emailpass", { body: ADMIN } as never)
      const { result: user } = await createUserAccountWorkflow(container).run({
        input: { authIdentityId: registered.authIdentity!.id, userData: { email: ADMIN.email } },
      })
      adminUserId = user.id
      const adminLogin = await call("POST", "/auth/user/emailpass", { data: ADMIN })
      expect(adminLogin.status).toBe(200)
      adminToken = adminLogin.data.token
      const session = await call("POST", "/auth/session", { headers: { authorization: `Bearer ${adminToken}` } })
      expect(session.status).toBe(200)
      const setCookie = session.headers["set-cookie"]
      adminCookie = (Array.isArray(setCookie) ? setCookie : [String(setCookie)]).map((c) => c.split(";")[0]).join("; ")

      const store = { "x-publishable-api-key": pk }
      const reg = await call("POST", "/auth/customer/emailpass/register", { headers: store, data: SHOPPER })
      expect(reg.status).toBe(200)
      await call("POST", "/store/customers", {
        headers: { ...store, authorization: `Bearer ${reg.data.token}` },
        data: { email: SHOPPER.email },
      })
      shopperToken = (await call("POST", "/auth/customer/emailpass", { headers: store, data: SHOPPER })).data.token
    })

    describe("the India stock location", () => {
      it("takes over the existing location: one location, same id, renamed India, its levels kept, opening balances written", async () => {
        expect(locationId).toBe(warehouseId)
        const loc = await dbConnection.raw(
          `select sl.name, a.country_code, a.city from stock_location sl join stock_location_address a on a.id = sl.address_id where sl.id = ?`,
          [locationId]
        )
        expect(loc.rows[0]).toEqual({ name: "India", country_code: "IN", city: null })
        const demo = await dbConnection.raw(
          `select stocked_quantity from inventory_level where inventory_item_id = ? and location_id = ?`,
          [demoItemId, locationId]
        )
        expect(Number(demo.rows[0].stocked_quantity)).toBe(7)
        const opening = await dbConnection.raw(`select * from stock_movement where inventory_item_id = ?`, [demoItemId])
        expect(opening.rows).toHaveLength(1)
        expect(opening.rows[0]).toMatchObject({
          variant_id: demoVariantId,
          cause: "opening_balance",
          change: 7,
          stocked_after: 7,
          reserved_after: 0,
          actor: "system:stock-location-seed",
          actor_id: null,
        })
        const setting = await dbConnection.raw(`select value from setting_value where key = 'stock.location_id'`)
        expect(setting.rows.map((r: { value: { v: string } }) => r.value.v)).toEqual([locationId])

        // Seeding again writes no second opening balance.
        await seedShopStockLocation(getContainer())
        expect(await count(`select count(*) as n from stock_movement where inventory_item_id = ?`, [demoItemId])).toBe(1)
      })

      it("reads the location from the setting, so a second IN location is never picked", async () => {
        const stockLocations = getContainer().resolve(Modules.STOCK_LOCATION)
        const [second] = await stockLocations.createStockLocations([
          { name: "Another India", address: { address_1: "", country_code: "IN" } },
        ])
        try {
          expect(await findShopStockLocationId(getContainer())).toBe(locationId)
        } finally {
          await stockLocations.deleteStockLocations([second!.id])
        }
      })

      it("links an India location that is not yet linked to the default sales channel", async () => {
        const container = getContainer()
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const channels = async () =>
          (
            await query.graph({ entity: "stock_location", fields: ["sales_channels.id"], filters: { id: locationId } })
          ).data[0]!.sales_channels!.map((c) => c!.id)
        const [channel] = await channels()
        await container.resolve(ContainerRegistrationKeys.LINK).dismiss({
          [Modules.SALES_CHANNEL]: { sales_channel_id: channel! },
          [Modules.STOCK_LOCATION]: { stock_location_id: locationId },
        })
        expect(await channels()).toEqual([])
        await seedShopStockLocation(container)
        expect(await channels()).toEqual([channel])
      })

      it("is the only stock location, linked to the default sales channel, and seeding again changes nothing", async () => {
        const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
        const { data } = await query.graph({
          entity: "stock_location",
          fields: ["id", "name", "address.country_code", "sales_channels.id"],
        })
        expect(data).toHaveLength(1)
        expect(data[0]).toMatchObject({ id: locationId, name: "India", address: { country_code: "IN" } })
        expect(data[0]!.sales_channels).toHaveLength(1)

        expect(await seedShopStockLocation(getContainer())).toBe(locationId)
        expect(await count(`select count(*) as n from stock_location where deleted_at is null`)).toBe(1)
      })

      it("skips a Variant with two inventory items with a warning, and backfills the others", async () => {
        const container = getContainer()
        const inventory = container.resolve(Modules.INVENTORY)
        const link = container.resolve(ContainerRegistrationKeys.LINK)
        const two = await design()
        const fine = await design()
        for (const d of [two, fine]) {
          const [lv] = await level(d.variantId)
          const ids = (await inventory.listInventoryLevels({ inventory_item_id: lv!.inventoryItemId })).map((l) => l.id)
          await inventory.deleteInventoryLevels(ids)
        }
        const [extra] = await inventory.createInventoryItems([{ title: "Extra" }])
        const extraLink = {
          [Modules.PRODUCT]: { variant_id: two.variantId },
          [Modules.INVENTORY]: { inventory_item_id: extra!.id },
        }
        await link.create(extraLink)
        const warn = jest.spyOn(logger(), "warn")
        try {
          await expect(seedShopStockLocation(container)).resolves.toBe(locationId)
          expect(warn).toHaveBeenCalledWith(expect.stringContaining(`skipped Variant ${two.variantId}`))
          expect(await level(fine.variantId)).toEqual([expect.objectContaining({ locationId, stocked: 0 })])
          expect((await level(two.variantId)).filter((l) => l.locationId === locationId)).toEqual([])
        } finally {
          warn.mockRestore()
          await link.dismiss(extraLink)
          await inventory.deleteInventoryItems([extra!.id])
        }
      })

      it("undoes a backfill that fails part-way: inventory not managed again, no inventory item left", async () => {
        const container = getContainer()
        const inventory = container.resolve(Modules.INVENTORY)
        const d = await design()
        const [lv] = await level(d.variantId)
        await container.resolve(ContainerRegistrationKeys.LINK).dismiss({
          [Modules.PRODUCT]: { variant_id: d.variantId },
          [Modules.INVENTORY]: { inventory_item_id: lv!.inventoryItemId },
        })
        await inventory.deleteInventoryItems([lv!.inventoryItemId])
        await container.resolve(Modules.PRODUCT).updateProductVariants(d.variantId, { manage_inventory: false })
        const itemsBefore = await count(`select count(*) as n from inventory_item where deleted_at is null`)
        const spy = jest.spyOn(inventory, "createInventoryLevels").mockRejectedValueOnce(new Error("inventory down"))
        try {
          await seedShopStockLocation(container)
        } finally {
          spy.mockRestore()
        }
        const variant = await dbConnection.raw(`select manage_inventory from product_variant where id = ?`, [d.variantId])
        expect(variant.rows[0].manage_inventory).toBe(false)
        expect(await count(`select count(*) as n from inventory_item where deleted_at is null`)).toBe(itemsBefore)
        expect(
          await count(`select count(*) as n from product_variant_inventory_item where variant_id = ? and deleted_at is null`, [
            d.variantId,
          ])
        ).toBe(0)
        // The next run finishes it.
        await seedShopStockLocation(container)
        expect(await level(d.variantId)).toEqual([expect.objectContaining({ locationId, stocked: 0 })])
      })

      it("gives a new Design's Variant one managed inventory item with 0 Pieces at India", async () => {
        const d = await design()
        const variant = await dbConnection.raw(`select manage_inventory from product_variant where id = ?`, [d.variantId])
        expect(variant.rows[0].manage_inventory).toBe(true)
        const levels = await level(d.variantId)
        expect(levels).toHaveLength(1)
        expect(levels[0]).toMatchObject({ locationId, stocked: 0, reserved: 0 })

        const res = await getStock(d.url)
        expect(res.status).toBe(200)
        expect(res.data).toEqual({
          stock: { variantId: d.variantId, inventoryItemId: levels[0]!.inventoryItemId, stocked: 0, reserved: 0, available: 0 },
          movements: [],
          nextBefore: null,
          refreshed: true,
        })
      })

      it("backfills a Design whose Variant has no inventory item or no level", async () => {
        const container = getContainer()
        const a = await design()
        const b = await design()
        // a: the level is gone. b: the inventory item and its link are gone, and inventory is not managed.
        const [la] = await level(a.variantId)
        await container.resolve(Modules.INVENTORY).deleteInventoryLevels(
          (await container.resolve(Modules.INVENTORY).listInventoryLevels({ inventory_item_id: la!.inventoryItemId })).map(
            (l) => l.id
          )
        )
        const [lb] = await level(b.variantId)
        await container.resolve(ContainerRegistrationKeys.LINK).dismiss({
          [Modules.PRODUCT]: { variant_id: b.variantId },
          [Modules.INVENTORY]: { inventory_item_id: lb!.inventoryItemId },
        })
        await container.resolve(Modules.INVENTORY).deleteInventoryItems([lb!.inventoryItemId])
        await container.resolve(Modules.PRODUCT).updateProductVariants(b.variantId, { manage_inventory: false })
        expect(await level(a.variantId)).toHaveLength(0)
        expect(await level(b.variantId)).toHaveLength(0)
        expect((await getStock(a.url)).status).toBe(500)

        await seedShopStockLocation(container)
        expect(await level(a.variantId)).toEqual([expect.objectContaining({ locationId, stocked: 0 })])
        expect(await level(b.variantId)).toEqual([expect.objectContaining({ locationId, stocked: 0 })])
        expect((await getStock(b.url)).data.stock).toMatchObject({ stocked: 0, available: 0 })
      })

      it("create-design leaves no inventory item or level behind when the price-history row cannot be written", async () => {
        const before = {
          items: await count(`select count(*) as n from inventory_item where deleted_at is null`),
          levels: await count(`select count(*) as n from inventory_level where deleted_at is null`),
        }
        const history = getContainer().resolve<PriceHistoryModuleService>(PRICE_HISTORY_MODULE)
        const spy = jest.spyOn(history, "createPriceHistories").mockRejectedValueOnce(new Error("history down"))
        try {
          const res = await call("POST", "/admin/shop/designs", {
            headers: asAdmin(),
            data: { name: "Refused", priceRupees: 3150 },
          })
          expect(res.status).toBe(500)
        } finally {
          spy.mockRestore()
        }
        expect({
          items: await count(`select count(*) as n from inventory_item where deleted_at is null`),
          levels: await count(`select count(*) as n from inventory_level where deleted_at is null`),
        }).toEqual(before)
      })
    })

    describe("adjust-stock", () => {
      afterEach(() => jest.restoreAllMocks())

      it("sets stock 0 -> 10 with a reason and writes one row with the admin's email", async () => {
        const d = await design()
        const res = await adjust(d.url, { set: 10, reason: "first delivery" })
        expect(res.status).toBe(200)
        expect(res.data.stock).toMatchObject({ variantId: d.variantId, stocked: 10, reserved: 0, available: 10 })
        expect(res.data.movements).toHaveLength(1)
        const [row] = res.data.movements as Movement[]
        expect(row).toEqual({
          actorId: adminUserId,
          id: expect.stringMatching(/^smov_/),
          inventoryItemId: res.data.stock.inventoryItemId,
          variantId: d.variantId,
          cause: "manual_adjustment",
          change: 10,
          stockedAfter: 10,
          reservedAfter: 0,
          actor: ADMIN.email,
          reason: "first delivery",
          occurredAt: expect.stringMatching(/Z$/),
        })
        expect(Math.abs(Date.now() - Date.parse(row!.occurredAt))).toBeLessThan(60_000)
        expect((await level(d.variantId))[0]).toMatchObject({ stocked: 10, reserved: 0 })
        expect(await rows(d.variantId)).toBe(1)
      })

      it("applies two +1 sent at the same moment: stocked rises by 2 and there are two rows", async () => {
        const d = await design()
        await adjust(d.url, { set: 10, reason: "first delivery" })
        const results = await Promise.all([
          adjust(d.url, { delta: 1, reason: "found one" }),
          adjust(d.url, { delta: 1, reason: "found another" }),
        ])
        expect(results.map((r) => r.status)).toEqual([200, 200])
        expect((await level(d.variantId))[0]!.stocked).toBe(12)
        const { data } = await getStock(d.url)
        expect(data.movements).toHaveLength(3)
        const ones = (data.movements as Movement[]).filter((m) => m.change === 1)
        expect(ones.map((m) => m.stockedAfter).sort()).toEqual([11, 12])
      })

      it("refuses to go below what is reserved (stocked 3, reserved 2, set 1) and changes nothing", async () => {
        const d = await design()
        await adjust(d.url, { set: 3, reason: "delivery" })
        const [lv] = await level(d.variantId)
        // Story 1.9 reserves through Holds; here a kernel reservation stands in for one.
        const inventory = getContainer().resolve(Modules.INVENTORY)
        const [reservation] = await inventory.createReservationItems([
          { inventory_item_id: lv!.inventoryItemId, location_id: locationId, quantity: 2 },
        ])
        try {
          expect((await getStock(d.url)).data.stock).toMatchObject({ stocked: 3, reserved: 2, available: 1 })
          const res = await adjust(d.url, { set: 1, reason: "miscount" })
          expect(res.status).toBe(409)
          expect(res.data).toMatchObject({ code: "stock.below_reserved", message: expect.any(String) })
          const minus = await adjust(d.url, { delta: -2, reason: "miscount" })
          expect(minus.data.code).toBe("stock.below_reserved")
          expect((await level(d.variantId))[0]).toMatchObject({ stocked: 3, reserved: 2 })
          expect(await rows(d.variantId)).toBe(1)

          // Down to exactly the reserved quantity is allowed; the row records what is reserved.
          const ok = await adjust(d.url, { set: 2, reason: "two sold in the shop" })
          expect(ok.status).toBe(200)
          expect(ok.data.stock).toMatchObject({ stocked: 2, reserved: 2, available: 0 })
          expect(ok.data.movements[0]).toMatchObject({ change: -1, stockedAfter: 2, reservedAfter: 2 })
        } finally {
          await inventory.deleteReservationItems([reservation!.id])
        }
      })

      it("refuses a negative result (stocked 2, delta -3) with stock.invalid_quantity and changes nothing", async () => {
        const d = await design()
        await adjust(d.url, { set: 2, reason: "delivery" })
        const res = await adjust(d.url, { delta: -3, reason: "damaged" })
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({ code: "stock.invalid_quantity" })
        expect((await level(d.variantId))[0]!.stocked).toBe(2)
        expect(await rows(d.variantId)).toBe(1)
      })

      it("refuses with stock.lock_timeout while another owner holds the lock, writing nothing", async () => {
        const d = await design()
        await adjust(d.url, { set: 4, reason: "delivery" })
        const [lv] = await level(d.variantId)
        const locking = getContainer().resolve(Modules.LOCKING)
        await locking.acquire(stockLockKey(lv!.inventoryItemId), { ownerId: "another-owner", expire: 60 })
        try {
          const started = Date.now()
          const res = await adjust(d.url, { delta: 1, reason: "found one" })
          expect(res.status).toBe(409)
          expect(res.data).toMatchObject({ code: "stock.lock_timeout" })
          expect(Date.now() - started).toBeGreaterThanOrEqual(4_000)
          expect((await level(d.variantId))[0]!.stocked).toBe(4)
          expect(await rows(d.variantId)).toBe(1)
        } finally {
          await locking.release(stockLockKey(lv!.inventoryItemId), { ownerId: "another-owner" })
        }
        const after = await adjust(d.url, { delta: 1, reason: "found one" })
        expect(after.status).toBe(200)
        expect(after.data.stock.stocked).toBe(5)
      })

      it("restores the earlier quantity when the stock-movement row cannot be written, and answers internal", async () => {
        const d = await design()
        await adjust(d.url, { set: 6, reason: "delivery" })
        jest.spyOn(ledger(), "record").mockRejectedValueOnce(new Error("ledger down"))
        const res = await adjust(d.url, { set: 9, reason: "delivery" })
        expect(res.status).toBe(500)
        expect(res.data).toEqual({ code: "internal", message: expect.any(String) })
        expect((await level(d.variantId))[0]!.stocked).toBe(6)
        expect(await rows(d.variantId)).toBe(1)
        // The lock was released by the compensation: the next change goes through at once.
        const started = Date.now()
        const next = await adjust(d.url, { delta: 1, reason: "found one" })
        expect(next.status).toBe(200)
        expect(next.data.stock.stocked).toBe(7)
        expect(Date.now() - started).toBeLessThan(4_000)
      })

      it("shows the history newest first with time, cause, change, actor and reason", async () => {
        const d = await design()
        await adjust(d.url, { set: 10, reason: "first delivery" })
        await adjust(d.url, { delta: -1, reason: "damaged in storage" })
        await adjust(d.url, { delta: 3, reason: "second delivery" })
        const { data } = await getStock(d.url)
        const movements = data.movements as Movement[]
        expect(movements.map((m) => [m.change, m.stockedAfter, m.reason])).toEqual([
          [3, 12, "second delivery"],
          [-1, 9, "damaged in storage"],
          [10, 10, "first delivery"],
        ])
        for (const m of movements) expect(m).toMatchObject({ cause: "manual_adjustment", actor: ADMIN.email })
        const times = movements.map((m) => Date.parse(m.occurredAt))
        expect([...times].sort((a, b) => b - a)).toEqual(times)
      })

      it("setting the quantity it already has changes nothing, writes no row and releases the lock", async () => {
        const d = await design()
        await adjust(d.url, { set: 5, reason: "delivery" })
        const res = await adjust(d.url, { set: 5, reason: "recount" })
        expect(res.status).toBe(200)
        expect(res.data.stock.stocked).toBe(5)
        expect(await rows(d.variantId)).toBe(1)
        const started = Date.now()
        const next = await adjust(d.url, { delta: 1, reason: "found one" })
        expect(next.status).toBe(200)
        expect(next.data.stock.stocked).toBe(6)
        expect(Date.now() - started).toBeLessThan(2_000)
      })

      it("applies a resent request with the same requestId once, also when both arrive at the same moment", async () => {
        const d = await design()
        await adjust(d.url, { set: 4, reason: "delivery" })
        const requestId = "0b7d8a6e-3f2c-4d1e-9a5b-7c6d5e4f3a21"
        const first = await adjust(d.url, { delta: 1, reason: "found one", requestId })
        const again = await adjust(d.url, { delta: 1, reason: "found one", requestId })
        expect([first.status, again.status]).toEqual([200, 200])
        expect(again.data.stock.stocked).toBe(5)
        expect((await level(d.variantId))[0]!.stocked).toBe(5)
        expect(await rows(d.variantId)).toBe(2)
        const stored = await dbConnection.raw(`select request_id from stock_movement where variant_id = ? and change = 1`, [
          d.variantId,
        ])
        expect(stored.rows).toEqual([{ request_id: requestId }])

        const both = "5f0c1b2a-8e7d-4c6b-a5f4-e3d2c1b0a998"
        const results = await Promise.all([
          adjust(d.url, { delta: 1, reason: "found another", requestId: both }),
          adjust(d.url, { delta: 1, reason: "found another", requestId: both }),
        ])
        expect(results.map((r) => r.status)).toEqual([200, 200])
        expect((await level(d.variantId))[0]!.stocked).toBe(6)
        expect(await rows(d.variantId)).toBe(3)

        // A request id already used for another Design's stock is refused.
        const other = await design()
        const reused = await adjust(other.url, { delta: 1, reason: "r", requestId })
        expect(reused.status).toBe(400)
        expect(reused.data.code).toBe("input.invalid")
        expect(await rows(other.variantId)).toBe(0)
      })

      it("answers 200 with the workflow's result when the stock cannot be read again after the change", async () => {
        const d = await design()
        await adjust(d.url, { set: 2, reason: "delivery" })
        jest.spyOn(ledger(), "listForVariant").mockRejectedValueOnce(new Error("ledger read down"))
        const res = await adjust(d.url, { delta: 1, reason: "found one" })
        expect(res.status).toBe(200)
        expect(res.data).toMatchObject({
          stock: { variantId: d.variantId, stocked: 3, reserved: 0, available: 3 },
          movements: [],
          nextBefore: null,
          refreshed: false,
        })
        expect((await level(d.variantId))[0]!.stocked).toBe(3)
        expect(await rows(d.variantId)).toBe(2)
      })

      it("pages the history by (occurredAt, id): 50 rows by default, then the before cursor", async () => {
        const d = await design()
        await adjust(d.url, { set: 10, reason: "first" })
        await adjust(d.url, { delta: 1, reason: "second" })
        const posted = await adjust(d.url, { delta: 1, reason: "third" })
        expect(posted.data.movements).toHaveLength(3)
        expect(posted.data.nextBefore).toBeNull()

        const one = await call("GET", `${d.url}?limit=2`, { headers: asAdmin() })
        expect(one.status).toBe(200)
        expect((one.data.movements as Movement[]).map((m) => m.reason)).toEqual(["third", "second"])
        expect(one.data.nextBefore).toEqual(expect.any(String))
        const two = await call("GET", `${d.url}?limit=2&before=${encodeURIComponent(one.data.nextBefore)}`, {
          headers: asAdmin(),
        })
        expect((two.data.movements as Movement[]).map((m) => m.reason)).toEqual(["first"])
        expect(two.data.nextBefore).toBeNull()

        for (const q of ["limit=0", "limit=201", "before=nope", "offset=1"]) {
          const bad = await call("GET", `${d.url}?${q}`, { headers: asAdmin() })
          expect(bad.status).toBe(400)
          expect(bad.data.code).toBe("input.invalid")
        }
      })

      it.each([
        ["no reason", { set: 5 }],
        ["a blank reason", { set: 5, reason: "  " }],
        ["a reason over 200 characters", { set: 5, reason: "x".repeat(201) }],
        ["both set and delta", { set: 5, delta: 1, reason: "r" }],
        ["a negative target", { set: -1, reason: "r" }],
        ["a fractional change", { delta: 0.5, reason: "r" }],
        ["a cause", { set: 5, reason: "r", cause: "fulfilled" }],
      ])("refuses %s with input.invalid and changes nothing", async (_, body) => {
        const d = await design()
        const res = await adjust(d.url, body)
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({ code: "input.invalid" })
        expect((await level(d.variantId))[0]!.stocked).toBe(0)
        expect(await rows(d.variantId)).toBe(0)
      })

      it("answers design.not_found for an unknown Design", async () => {
        const res = await adjust("/admin/shop/designs/prod_unknown/stock", { set: 1, reason: "r" })
        expect(res.status).toBe(404)
        expect(res.data.code).toBe("design.not_found")
        expect((await getStock("/admin/shop/designs/prod_unknown/stock")).status).toBe(404)
      })
    })

    describe("rows are never edited", () => {
      it("has no route that updates or deletes a row, and the ledger offers only record and reads", async () => {
        const d = await design()
        await adjust(d.url, { set: 3, reason: "delivery" })
        const [row] = (await getStock(d.url)).data.movements as Movement[]
        const before = await dbConnection.raw(`select * from stock_movement where id = ?`, [row!.id])
        for (const [method, url] of [
          ["PUT", d.url],
          ["PATCH", d.url],
          ["DELETE", d.url],
          ["POST", `${d.url}/${row!.id}`],
          ["DELETE", `${d.url}/${row!.id}`],
          ["POST", `${d.url}/movements/${row!.id}`],
          ["DELETE", `${d.url}/movements/${row!.id}`],
        ] as const) {
          const res = await call(method, url, { headers: asAdmin(), data: { change: 100, reason: "edit" } })
          expect(res.status).toBeGreaterThanOrEqual(400)
        }
        const after = await dbConnection.raw(`select * from stock_movement where id = ?`, [row!.id])
        expect(after.rows).toEqual(before.rows)
        expect(await rows(d.variantId)).toBe(1)

        // `__joinerConfig` is the module's link description, added by the kernel to every module service.
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(ledger())).filter(
          (n) => n !== "constructor" && !n.startsWith("__")
        )
        expect(methods.sort()).toEqual(["findByRequestId", "listForVariant", "record"])
      })

      it("is refused by the database: an UPDATE and a DELETE of a row fail", async () => {
        const d = await design()
        await adjust(d.url, { set: 3, reason: "delivery" })
        const [row] = (await getStock(d.url)).data.movements as Movement[]
        await expect(dbConnection.raw(`update stock_movement set change = 100 where id = ?`, [row!.id])).rejects.toThrow(
          /append-only/
        )
        await expect(
          dbConnection.raw(`update stock_movement set deleted_at = now() where id = ?`, [row!.id])
        ).rejects.toThrow(/append-only/)
        await expect(dbConnection.raw(`delete from stock_movement where id = ?`, [row!.id])).rejects.toThrow(/append-only/)
        const after = await dbConnection.raw(`select change, deleted_at from stock_movement where id = ?`, [row!.id])
        expect(after.rows).toEqual([{ change: 3, deleted_at: null }])
      })
    })

    describe("the kernel's own stock routes", () => {
      it("refuses POST /admin/inventory-items/:id/location-levels/:loc with route.not_allowed (Story 1.4)", async () => {
        const d = await design()
        await adjust(d.url, { set: 2, reason: "delivery" })
        const [lv] = await level(d.variantId)
        const url = `/admin/inventory-items/${lv!.inventoryItemId}/location-levels/${locationId}`
        for (const headers of [asAdmin(), { authorization: `Bearer ${adminToken}` }]) {
          const res = await call("POST", url, { headers, data: { stocked_quantity: 100 } })
          expect(res.status).toBe(403)
          expect(res.data).toEqual({ code: "route.not_allowed", message: expect.any(String) })
        }
        expect((await level(d.variantId))[0]!.stocked).toBe(2)
        expect(await rows(d.variantId)).toBe(1)
      })

      it("refuses creating, changing and linking stock locations, so no second one appears", async () => {
        for (const [method, url] of [
          ["POST", "/admin/stock-locations"],
          ["POST", `/admin/stock-locations/${locationId}`],
          ["DELETE", `/admin/stock-locations/${locationId}`],
          ["POST", `/admin/stock-locations/${locationId}/sales-channels`],
          ["POST", `/admin/stock-locations/${locationId}/fulfillment-sets`],
          ["POST", `/admin/stock-locations/${locationId}/fulfillment-providers`],
        ] as const) {
          const res = await call(method, url, { headers: asAdmin(), data: { name: "Second" } })
          expect(res.status).toBe(403)
          expect(res.data.code).toBe("route.not_allowed")
        }
        expect(await count(`select count(*) as n from stock_location where deleted_at is null`)).toBe(1)
      })
    })

    describe("identity and origin", () => {
      it("refuses a Shopper token, an admin bearer token and no identity, and changes nothing", async () => {
        const d = await design()
        for (const headers of [
          { authorization: `Bearer ${shopperToken}`, "x-publishable-api-key": pk },
          { authorization: `Bearer ${adminToken}` },
          {},
        ] as Headers[]) {
          const write = await adjust(d.url, { set: 5, reason: "r" }, { ...headers, origin: ADMIN_ORIGIN })
          expect(write.status).toBe(401)
          const read = await call("GET", d.url, { headers })
          expect(read.status).toBe(401)
        }
        expect(await rows(d.variantId)).toBe(0)
      })

      it("refuses an admin's write from another origin with request.cross_origin", async () => {
        const d = await design()
        const res = await adjust(d.url, { set: 5, reason: "r" }, { cookie: adminCookie, origin: "https://evil.example" })
        expect(res.status).toBe(403)
        expect(res.data).toMatchObject({ code: "request.cross_origin" })
        expect((await level(d.variantId))[0]!.stocked).toBe(0)
      })
    })
  },
})
