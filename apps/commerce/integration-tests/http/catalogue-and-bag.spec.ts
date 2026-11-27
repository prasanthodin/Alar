/// <reference types="jest" />
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  createStoresWorkflow,
  createUserAccountWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { BagView, DesignCard, DesignView, taxForShelfPrice, type TaxBands } from "@shop/contracts"
import { readEnv, storefrontUrl } from "../../src/env"
import { signPreviewToken } from "../../src/lib/preview-token"
import { SHIPPING_OPTION_SETTING } from "../../src/lib/shipping"
import { seedShopSettings } from "../../src/migration-scripts/shop-settings-seed"
import { seedShopStockLocation } from "../../src/migration-scripts/stock-location-seed"
import { seedShopShipping } from "../../src/migration-scripts/stock-location-shipping"
import { DESIGN_ATTRIBUTES_MODULE, type DesignAttributesModuleService } from "../../src/modules/design-attributes"
import { SETTINGS_MODULE } from "../../src/modules/settings"
import type SettingsModuleService from "../../src/modules/settings/service"

jest.setTimeout(180 * 1000)

type Method = "GET" | "POST" | "DELETE"
type Headers = Record<string, string>

const ADMIN = { email: "owner@example.test", password: "owner-pass-1" }
/** An admin origin from ADMIN_CORS: shop admin writes must name one. */
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

/**
 * Photos written straight to the attributes row (test set-up only), so this
 * suite needs no file storage: the Design workflows check uploads, publishing
 * and the catalogue only read what is stored.
 */
const PHOTOS = [
  { fileId: "closeup.jpg", url: "http://files.test/catalog/closeup.jpg", role: "close_up", position: 0 },
  { fileId: "drape.jpg", url: "http://files.test/catalog/drape.jpg", role: "other", position: 1 },
]

type Made = { id: string; variantId: string; handle: string; inventoryItemId: string }

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection }) => {
    let pk: string
    let adminCookie: string
    let locationId: string
    /** Published, 2 Pieces stocked. */
    let available: Made
    /** Published, 0 stocked. */
    let soldOut: Made
    /** Published, 2 stocked and 2 reserved. */
    let allReserved: Made
    /** Published, 3 stocked and 1 reserved. */
    let partReserved: Made
    /** Unpublished, with a price and photos. */
    let draft: Made

    async function call(method: Method, url: string, opts: { headers?: Headers; data?: unknown } = {}) {
      return api.request({ method, url, headers: opts.headers, data: opts.data, validateStatus: () => true })
    }
    const asAdmin = (): Headers => ({ cookie: adminCookie, origin: ADMIN_ORIGIN })
    const store = (): Headers => ({ "x-publishable-api-key": pk })

    /** A Design made through the admin shop routes, with photos, optionally published, with stock and reservations. */
    async function makeDesign(name: string, opts: { publish: boolean; stock: number; reserved?: number }): Promise<Made> {
      const container = getContainer()
      const created = await call("POST", "/admin/shop/designs", {
        headers: asAdmin(),
        data: { name, description: `${name}, woven by hand.`, attributes: ATTRIBUTES, priceRupees: 3150 },
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
      if (opts.publish) {
        const published = await call("POST", `/admin/shop/designs/${id}/publish`, {
          headers: asAdmin(),
          data: { trueColourConfirmed: true },
        })
        expect(published.status).toBe(200)
      }
      if (opts.stock > 0) {
        const stocked = await call("POST", `/admin/shop/designs/${id}/stock`, {
          headers: asAdmin(),
          data: { set: opts.stock, reason: "Opening stock" },
        })
        expect(stocked.status).toBe(200)
      }
      const inventoryItemId = row.variants[0]!.inventory_items[0]!.inventory_item_id
      if (opts.reserved) {
        await container
          .resolve(Modules.INVENTORY)
          .createReservationItems([{ inventory_item_id: inventoryItemId, location_id: locationId, quantity: opts.reserved }])
      }
      return { id, variantId, handle: row.handle, inventoryItemId }
    }

    async function newCart(variantId: string, quantity = 1) {
      const res = await call("POST", "/store/carts", {
        headers: store(),
        data: { items: [{ variant_id: variantId, quantity }] },
      })
      return res
    }

    const bag = async (cartId: string) => call("GET", `/store/shop/bag/${cartId}`, { headers: store() })

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
      expect(adminLogin.status).toBe(200)
      const session = await call("POST", "/auth/session", { headers: { authorization: `Bearer ${adminLogin.data.token}` } })
      expect(session.status).toBe(200)
      const setCookie = session.headers["set-cookie"]
      adminCookie = (Array.isArray(setCookie) ? setCookie : [String(setCookie)]).map((c) => c.split(";")[0]).join("; ")

      available = await makeDesign("Arani silk saree", { publish: true, stock: 2 })
      soldOut = await makeDesign("Kanchipuram silk saree", { publish: true, stock: 0 })
      allReserved = await makeDesign("Tussar silk saree", { publish: true, stock: 2, reserved: 2 })
      partReserved = await makeDesign("Kasavu cotton saree", { publish: true, stock: 3, reserved: 1 })
      draft = await makeDesign("Banarasi silk saree", { publish: false, stock: 5 })
    })

    describe("GET /store/shop/designs", () => {
      it("lists the published Designs only, newest first, as DesignCards with availability from the server", async () => {
        const res = await call("GET", "/store/shop/designs", { headers: store() })
        expect(res.status).toBe(200)
        const designs = res.data.designs as DesignCard[]
        for (const d of designs) expect(DesignCard.safeParse(d).success).toBe(true)
        expect(designs.map((d) => [d.id, d.availability])).toEqual([
          [partReserved.id, "available"],
          [allReserved.id, "sold_out"],
          [soldOut.id, "sold_out"],
          [available.id, "available"],
        ])
        expect(designs.map((d) => d.id)).not.toContain(draft.id)
        expect(designs.find((d) => d.id === available.id)).toEqual({
          id: available.id,
          handle: available.handle,
          name: "Arani silk saree",
          subtitle: "Silk, Arani",
          price: 315000,
          mrp: 315000,
          // The main photo is the first one that is not the fabric close-up.
          image: { url: PHOTOS[1]!.url, alt: "Arani silk saree", isSample: false },
          availability: "available",
        })
        expect(JSON.stringify(res.data).toLowerCase()).not.toContain("weaver")
      })

      it("needs the publishable key, like every store route", async () => {
        const res = await call("GET", "/store/shop/designs")
        expect(res.status).toBe(400)
      })
    })

    describe("GET /store/shop/designs/:handle", () => {
      it("shows a published Design: photos, price, description, details and stock status", async () => {
        const res = await call("GET", `/store/shop/designs/${available.handle}`, { headers: store() })
        expect(res.status).toBe(200)
        const design = DesignView.parse(res.data.design)
        expect(design).toMatchObject({
          id: available.id,
          handle: available.handle,
          price: 315000,
          availability: "available",
          description: "Arani silk saree, woven by hand.",
          details: {
            fibre: "Silk",
            weave: "Arani",
            lengthM: 6.3,
            widthM: 1.14,
            blousePieceIncluded: true,
            care: "Dry clean only",
            countryOfOrigin: "India",
          },
          variants: [{ id: available.variantId, colourName: "Standard", stock: 2 }],
        })
        expect(design.images.map((i) => i.url)).toEqual([PHOTOS[1]!.url, PHOTOS[0]!.url])
        expect(design.preview).toBeUndefined()
        // Never the tax code, the stitched flag or anything about who made it.
        expect(Object.keys(design.details!).sort()).toEqual(
          ["blousePieceIncluded", "care", "countryOfOrigin", "fibre", "lengthM", "weave", "widthM"].sort()
        )
      })

      it("counts reserved Pieces: all reserved is sold out, part reserved shows what is left", async () => {
        const all = await call("GET", `/store/shop/designs/${allReserved.handle}`, { headers: store() })
        expect(all.data.design).toMatchObject({ availability: "sold_out", variants: [{ stock: 0 }] })
        const part = await call("GET", `/store/shop/designs/${partReserved.handle}`, { headers: store() })
        expect(part.data.design).toMatchObject({ availability: "available", variants: [{ stock: 2 }] })
        const none = await call("GET", `/store/shop/designs/${soldOut.handle}`, { headers: store() })
        expect(none.data.design).toMatchObject({ availability: "sold_out", variants: [{ stock: 0 }] })
      })

      it("answers 404 design.not_found for an unpublished Design and an unknown handle", async () => {
        for (const handle of [draft.handle, "no-such-design"]) {
          const res = await call("GET", `/store/shop/designs/${handle}`, { headers: store() })
          expect(res.status).toBe(404)
          expect(res.data).toMatchObject({ code: "design.not_found" })
        }
      })
    })

    describe("preview links", () => {
      it("an admin gets a signed link to the website that shows the draft until it expires", async () => {
        const res = await call("POST", `/admin/shop/designs/${draft.id}/preview`, { headers: asAdmin() })
        expect(res.status).toBe(200)
        const { url, expiresAt } = res.data as { url: string; expiresAt: string }
        const link = new URL(url)
        expect(`${link.origin}`).toBe(storefrontUrl(readEnv()))
        expect(link.pathname).toBe(`/designs/${draft.handle}`)
        const expiresIn = new Date(expiresAt).getTime() - Date.now()
        expect(expiresIn).toBeGreaterThan(59 * 60 * 1000)
        expect(expiresIn).toBeLessThanOrEqual(60 * 60 * 1000)

        const token = link.searchParams.get("preview")!
        const shown = await call("GET", `/store/shop/designs/${draft.handle}?preview=${encodeURIComponent(token)}`, {
          headers: store(),
        })
        expect(shown.status).toBe(200)
        expect(shown.headers["cache-control"]).toBe("private, no-store")
        expect(shown.data.design).toMatchObject({ id: draft.id, preview: { expiresAt }, availability: "available" })
      })

      it("refuses an expired, tampered or other Design's token with 404, and the route needs an admin", async () => {
        const secret = readEnv().PREVIEW_TOKEN_SECRET
        const expired = signPreviewToken(draft.id, secret, new Date(Date.now() - 2 * 60 * 60 * 1000)).token
        const valid = signPreviewToken(draft.id, secret).token
        const tampered = `${Number(valid.split(".")[0]) + 60}.${valid.split(".")[1]}`
        const other = signPreviewToken(available.id, secret).token
        for (const token of [expired, tampered, other, "nonsense"]) {
          const res = await call("GET", `/store/shop/designs/${draft.handle}?preview=${encodeURIComponent(token)}`, {
            headers: store(),
          })
          expect(res.status).toBe(404)
          expect(res.data).toMatchObject({ code: "design.not_found" })
        }

        expect((await call("POST", `/admin/shop/designs/${draft.id}/preview`, { headers: { origin: ADMIN_ORIGIN } })).status).toBe(401)
        expect((await call("POST", `/admin/shop/designs/${draft.id}/preview`, { headers: { cookie: adminCookie } })).status).toBe(403)
        const unknown = await call("POST", "/admin/shop/designs/prod_nope/preview", { headers: asAdmin() })
        expect(unknown.status).toBe(404)
      })
    })

    describe("the Bag", () => {
      it("creates a cart through the allowed kernel route and reads it as a BagView with the server's totals", async () => {
        const created = await newCart(available.variantId)
        expect(created.status).toBe(200)
        const cartId = created.data.cart.id as string
        const res = await bag(cartId)
        expect(res.status).toBe(200)
        expect(res.headers["cache-control"]).toBe("private, no-store")
        const view = BagView.parse(res.data.bag)
        expect(view).toEqual({
          lines: [
            {
              id: expect.any(String),
              designId: available.id,
              handle: available.handle,
              variantId: available.variantId,
              name: "Arani silk saree",
              colourName: "Standard",
              image: { url: PHOTOS[1]!.url, alt: "Arani silk saree", isSample: false },
              price: 315000,
              mrp: 315000,
              quantity: 1,
              lineTotal: 315000,
              stock: 2,
            },
          ],
          totalMrp: 315000,
          discount: 0,
          delivery: 0,
          total: 315000,
          count: 1,
        })
      })

      it("adds, changes and removes lines; the totals equal the money functions' split of each line", async () => {
        const cartId = (await newCart(available.variantId)).data.cart.id as string
        expect((await call("POST", `/store/carts/${cartId}/line-items`, { headers: store(), data: { variant_id: partReserved.variantId, quantity: 2 } })).status).toBe(200)
        let view = BagView.parse((await bag(cartId)).data.bag)
        expect(view.lines.map((l) => [l.variantId, l.quantity, l.lineTotal])).toEqual([
          [available.variantId, 1, 315000],
          [partReserved.variantId, 2, 630000],
        ])

        const lineId = view.lines[0]!.id
        expect((await call("POST", `/store/carts/${cartId}/line-items/${lineId}`, { headers: store(), data: { quantity: 2 } })).status).toBe(200)
        view = BagView.parse((await bag(cartId)).data.bag)
        expect(view).toMatchObject({ count: 4, totalMrp: 1260000, discount: 0, delivery: 0, total: 1260000 })

        const bands = (await getContainer().resolve<SettingsModuleService>(SETTINGS_MODULE).getValue("tax.bands.saree")) as TaxBands
        let sum = 0
        for (const line of view.lines) {
          const tax = taxForShelfPrice(line.price, bands)
          if (!tax.ok) throw new Error(tax.error.message)
          expect((tax.data.taxablePaise + tax.data.taxPaise) * line.quantity).toBe(line.lineTotal)
          sum += line.lineTotal
        }
        expect(view.total).toBe(sum + view.delivery)

        const removed = await call("DELETE", `/store/carts/${cartId}/line-items/${lineId}`, { headers: store() })
        expect(removed.status).toBe(200)
        view = BagView.parse((await bag(cartId)).data.bag)
        expect(view.lines.map((l) => l.variantId)).toEqual([partReserved.variantId])
        expect(view.total).toBe(630000)
      })

      it("refuses more Pieces than are available and keeps the earlier quantity", async () => {
        const cartId = (await newCart(available.variantId, 2)).data.cart.id as string
        const lineId = BagView.parse((await bag(cartId)).data.bag).lines[0]!.id

        const tooMany = await call("POST", `/store/carts/${cartId}/line-items/${lineId}`, { headers: store(), data: { quantity: 3 } })
        expect(tooMany.status).toBe(400)
        expect(tooMany.data).toMatchObject({ code: "insufficient_inventory" })
        const again = await call("POST", `/store/carts/${cartId}/line-items`, { headers: store(), data: { variant_id: available.variantId, quantity: 1 } })
        expect(again.status).toBe(400)
        expect(again.data).toMatchObject({ code: "insufficient_inventory" })
        expect(BagView.parse((await bag(cartId)).data.bag).lines[0]).toMatchObject({ quantity: 2, lineTotal: 630000 })
      })

      it("refuses reserved Pieces, sold-out and unpublished Designs, and creates no cart for them", async () => {
        const before = Number((await dbConnection.raw(`select count(*) as n from cart`)).rows[0].n)
        const reserved = await newCart(allReserved.variantId)
        expect(reserved.status).toBe(400)
        expect(reserved.data).toMatchObject({ code: "insufficient_inventory" })
        expect((await newCart(soldOut.variantId)).data).toMatchObject({ code: "insufficient_inventory" })
        const unpublished = await newCart(draft.variantId)
        expect(unpublished.status).toBe(400)
        expect(unpublished.data.message).toMatch(/not published/)
        expect(Number((await dbConnection.raw(`select count(*) as n from cart`)).rows[0].n)).toBe(before)
      })

      it("answers 404 bag.not_found for an unknown or completed cart", async () => {
        const unknown = await bag("cart_nope")
        expect(unknown.status).toBe(404)
        expect(unknown.data).toMatchObject({ code: "bag.not_found" })

        const cartId = (await newCart(available.variantId)).data.cart.id as string
        await getContainer().resolve(Modules.CART).updateCarts(cartId, { completed_at: new Date() })
        expect((await bag(cartId)).data).toMatchObject({ code: "bag.not_found" })
      })

      it("keeps completion and every other cart write off the allow-list", async () => {
        const cartId = (await newCart(available.variantId)).data.cart.id as string
        for (const [method, url] of [
          ["POST", `/store/carts/${cartId}/complete`],
          ["POST", `/store/carts/${cartId}`],
          ["POST", `/store/carts/${cartId}/shipping-methods`],
          ["POST", `/store/carts/${cartId}/promotions`],
          ["GET", `/store/carts/${cartId}`],
        ] as const) {
          const res = await call(method, url, { headers: store(), data: {} })
          expect(res.status).toBe(403)
          expect(res.data).toEqual({ code: "route.not_allowed", message: expect.any(String) })
        }
        const completed = await dbConnection.raw(`select completed_at from cart where id = ?`, [cartId])
        expect(completed.rows[0].completed_at).toBeNull()
      })
    })

    describe("the shipping seed", () => {
      it("seeds one Rs 0 option for India in rupees, stores it in a setting, and seeding again changes nothing", async () => {
        const container = getContainer()
        const id = await container.resolve<SettingsModuleService>(SETTINGS_MODULE).getValue(SHIPPING_OPTION_SETTING)
        const option = await dbConnection.raw(
          `select so.name, sz.name as zone, gz.country_code, so.provider_id
             from shipping_option so
             join service_zone sz on sz.id = so.service_zone_id
             join geo_zone gz on gz.service_zone_id = sz.id
            where so.id = ? and so.deleted_at is null`,
          [id]
        )
        expect(option.rows).toEqual([
          { name: "Standard delivery", zone: "India", country_code: "in", provider_id: "manual_manual" },
        ])
        const prices = await container.resolve(ContainerRegistrationKeys.QUERY).graph({
          entity: "shipping_option",
          fields: ["prices.amount", "prices.currency_code"],
          filters: { id },
        })
        const inr = (prices.data[0] as unknown as { prices: { amount: number; currency_code: string }[] }).prices.filter(
          (p) => p.currency_code === "inr"
        )
        expect(inr.length).toBeGreaterThan(0)
        expect(inr.every((p) => Number(p.amount) === 0)).toBe(true)

        expect(await seedShopShipping(container)).toBe(id)
        const options = await dbConnection.raw(`select count(*) as n from shipping_option where name = 'Standard delivery' and deleted_at is null`)
        expect(Number(options.rows[0].n)).toBe(1)
      })
    })
  },
})
