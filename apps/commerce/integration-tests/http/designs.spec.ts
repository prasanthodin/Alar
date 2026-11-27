/// <reference types="jest" />
import { readFileSync } from "node:fs"
import { join } from "node:path"
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
import { seedShopSettings } from "../../src/migration-scripts/shop-settings-seed"
import { PRICE_HISTORY_MODULE } from "../../src/modules/price-history"
import type PriceHistoryModuleService from "../../src/modules/price-history/service"

jest.setTimeout(180 * 1000)

type Method = "GET" | "POST" | "DELETE"
type Headers = Record<string, string>

const ADMIN = { email: "owner@example.test", password: "owner-pass-1" }
const SHOPPER = { email: "asha@example.test", password: "shopper-pass-1" }
const MOCK = join(__dirname, "../../../mobile/public/mock")
const JPEG = readFileSync(join(MOCK, "1-1-maroon.jpg"))
const CLOSE_UP = readFileSync(join(MOCK, "2-1-closeup-maroon.jpg"))

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

const photo = (i: number, role: "close_up" | "other") => ({
  fileId: `design-photo-${i}.jpg`,
  url: `http://localhost:4566/catalog/design-photo-${i}.jpg`,
  role,
  position: i,
})

const COMPLETE = {
  name: "Arani silk saree",
  description: "Maroon with a temple border",
  attributes: ATTRIBUTES,
  photos: [photo(0, "close_up"), photo(1, "other")],
  priceRupees: 3150,
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection }) => {
    let pk: string
    let adminCookie: string
    let adminToken: string
    let adminUserId: string
    let shopperToken: string
    let salesChannelId: string
    let shippingProfileId: string

    async function call(method: Method, url: string, opts: { headers?: Headers; data?: unknown } = {}) {
      return api.request({ method, url, headers: opts.headers, data: opts.data, validateStatus: () => true })
    }
    const asAdmin = (): Headers => ({ cookie: adminCookie })
    const count = async (sql: string, bindings: unknown[] = []) =>
      Number((await dbConnection.raw(sql, bindings)).rows[0].n)

    /** Rows a refused request must leave unchanged. */
    async function snapshot() {
      return {
        products: await count(`select count(*) as n from product where deleted_at is null`),
        variants: await count(`select count(*) as n from product_variant where deleted_at is null`),
        attributes: await count(`select count(*) as n from design_attributes where deleted_at is null`),
        history: await count(`select count(*) as n from price_history where deleted_at is null`),
        prices: await count(`select count(*) as n from price where deleted_at is null`),
        published: await count(`select count(*) as n from product where status = 'published' and deleted_at is null`),
        confirmations: await count(
          `select count(*) as n from design_attributes where true_colour_confirmed_at is not null and deleted_at is null`
        ),
      }
    }

    async function create(body: unknown = COMPLETE) {
      return call("POST", "/admin/shop/designs", { headers: asAdmin(), data: body })
    }

    async function history(variantId: string) {
      return (
        await dbConnection.raw(
          `select old_price_paise, new_price_paise, changed_by, changed_at from price_history where variant_id = ? and deleted_at is null order by changed_at, created_at`,
          [variantId]
        )
      ).rows as { old_price_paise: number | null; new_price_paise: number; changed_by: string; changed_at: Date }[]
    }

    async function upload(files: { name: string; type: string; bytes: Uint8Array }[], headers: Headers = asAdmin()) {
      const form = new FormData()
      for (const f of files) form.append("files", new Blob([new Uint8Array(f.bytes)], { type: f.type }), f.name)
      return call("POST", "/admin/shop/uploads", { headers, data: form })
    }

    beforeAll(async () => {
      const container = getContainer()
      const query = container.resolve(ContainerRegistrationKeys.QUERY)

      // The starter seed's defaults a Design's product needs: the store's default
      // sales channel and the default shipping profile.
      const { result: channels } = await createSalesChannelsWorkflow(container).run({
        input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
      })
      salesChannelId = channels[0]!.id
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
      shippingProfileId =
        profiles.find((p) => p.type === "default")?.id ??
        (
          await createShippingProfilesWorkflow(container).run({
            input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
          })
        ).result[0]!.id

      // India, rupees and tax.bands.saree, as db:migrate seeds them.
      await seedShopSettings(container, {})

      const { result: keys } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Website", type: "publishable", created_by: "test" }] },
      })
      pk = keys[0]!.token
      await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: keys[0]!.id, add: [salesChannelId] } })

      // Admin: an emailpass identity with a user, signed in to a session cookie.
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

      // Shopper: signed up and in through the allowed routes.
      const store = { "x-publishable-api-key": pk }
      const reg = await call("POST", "/auth/customer/emailpass/register", { headers: store, data: SHOPPER })
      expect(reg.status).toBe(200)
      const created = await call("POST", "/store/customers", {
        headers: { ...store, authorization: `Bearer ${reg.data.token}` },
        data: { email: SHOPPER.email },
      })
      expect(created.status).toBe(200)
      const login = await call("POST", "/auth/customer/emailpass", { headers: store, data: SHOPPER })
      shopperToken = login.data.token
    })

    describe("create", () => {
      it("saves a complete Design unpublished, with one price-history row (old null, new 315000)", async () => {
        const res = await create()
        expect(res.status).toBe(201)
        const design = res.data.design
        expect(design).toMatchObject({
          name: COMPLETE.name,
          description: COMPLETE.description,
          status: "draft",
          pricePaise: 315000,
          attributes: ATTRIBUTES,
          photos: COMPLETE.photos,
          trueColourConfirmation: null,
        })

        const rows = await history(design.variantId)
        expect(rows).toHaveLength(1)
        expect(rows[0]).toMatchObject({ old_price_paise: null, new_price_paise: 315000, changed_by: adminUserId })

        // The kernel holds the price in major units (rupees), in INR, on the one Variant.
        const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
        const { data } = await query.graph({
          entity: "product",
          fields: [
            "status",
            "metadata",
            "shipping_profile.id",
            "sales_channels.id",
            "variants.id",
            "variants.prices.amount",
            "variants.prices.currency_code",
            "design_attributes.id",
          ],
          filters: { id: design.id },
        })
        const product = data[0]!
        expect(product.status).toBe("draft")
        expect(product.metadata ?? null).toBeNull()
        expect(product.variants).toHaveLength(1)
        const prices = (product.variants[0] as unknown as { prices: { amount: unknown; currency_code: string }[] }).prices
        expect(prices.map((p) => [Number(p.amount), p.currency_code])).toEqual([[3150, "inr"]])
        expect(product.sales_channels!.map((c) => c!.id)).toEqual([salesChannelId])
        expect((product as { shipping_profile?: { id: string } }).shipping_profile?.id).toBe(shippingProfileId)
        expect((product as { design_attributes?: { id: string } }).design_attributes?.id).toMatch(/^dattr_/)

        // Typed columns, never kernel metadata.
        const attrs = await dbConnection.raw(
          `select fibre, length_cm, width_cm, tax_code, blouse_piece_included, jsonb_array_length(photos) as photos from design_attributes where id = ?`,
          [(product as { design_attributes: { id: string } }).design_attributes.id]
        )
        expect(attrs.rows[0]).toEqual({
          fibre: "Silk",
          length_cm: 630,
          width_cm: 114,
          tax_code: "saree",
          blouse_piece_included: true,
          photos: 2,
        })

        const list = await call("GET", "/admin/shop/designs", { headers: asAdmin() })
        expect(list.status).toBe(200)
        expect(list.data.designs.map((d: { id: string }) => d.id)).toEqual([design.id])
        const one = await call("GET", `/admin/shop/designs/${design.id}`, { headers: asAdmin() })
        expect(one.data.design).toEqual(design)
      })

      it.each([3150.5, 0])("refuses a price of Rs %s and creates nothing", async (priceRupees) => {
        const before = await snapshot()
        const res = await create({ ...COMPLETE, priceRupees })
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({ code: "money.invalid_shelf_price", message: expect.any(String) })
        expect(await snapshot()).toEqual(before)
      })

      it("refuses a tax code without bands in settings and creates nothing", async () => {
        const before = await snapshot()
        const res = await create({ ...COMPLETE, attributes: { ...ATTRIBUTES, taxCode: "shirt" } })
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({ code: "design.unknown_tax_code" })
        expect(await snapshot()).toEqual(before)
      })

      it("refuses an invalid form with input.invalid and creates nothing", async () => {
        const before = await snapshot()
        const res = await create({ ...COMPLETE, name: "", status: "published" })
        expect(res.status).toBe(400)
        expect(res.data.code).toBe("input.invalid")
        expect(await snapshot()).toEqual(before)
      })
    })

    describe("price", () => {
      it("writes one history row per change (315000 -> 295000), none for the same price or a refused one", async () => {
        const { data } = await create()
        const { id, variantId } = data.design

        const changed = await call("POST", `/admin/shop/designs/${id}/price`, {
          headers: asAdmin(),
          data: { priceRupees: 2950 },
        })
        expect(changed.status).toBe(200)
        expect(changed.data.design.pricePaise).toBe(295000)
        let rows = await history(variantId)
        expect(rows.map((r) => [r.old_price_paise, r.new_price_paise])).toEqual([
          [null, 315000],
          [315000, 295000],
        ])

        const same = await call("POST", `/admin/shop/designs/${id}/price`, { headers: asAdmin(), data: { priceRupees: 2950 } })
        expect(same.status).toBe(200)
        const bad = await call("POST", `/admin/shop/designs/${id}/price`, { headers: asAdmin(), data: { priceRupees: 2950.5 } })
        expect(bad.status).toBe(400)
        expect(bad.data.code).toBe("money.invalid_shelf_price")
        rows = await history(variantId)
        expect(rows).toHaveLength(2)

        const prices = await count(
          `select count(*) as n from price p join product_variant_price_set l on l.price_set_id = p.price_set_id where l.variant_id = ? and p.deleted_at is null`,
          [variantId]
        )
        expect(prices).toBe(1)
      })

      it("answers design.not_found for an unknown Design", async () => {
        const res = await call("POST", `/admin/shop/designs/prod_missing/price`, { headers: asAdmin(), data: { priceRupees: 100 } })
        expect(res.status).toBe(404)
        expect(res.data.code).toBe("design.not_found")
      })
    })

    describe("publish", () => {
      it("publishes a complete Design and stores the confirmation with the time and the admin user", async () => {
        const { data } = await create()
        const startedAt = Date.now()
        const res = await call("POST", `/admin/shop/designs/${data.design.id}/publish`, {
          headers: asAdmin(),
          data: { trueColourConfirmed: true },
        })
        expect(res.status).toBe(200)
        expect(res.data.missing).toEqual([])
        expect(res.data.design.status).toBe("published")
        expect(res.data.design.trueColourConfirmation.by).toBe(adminUserId)
        expect(new Date(res.data.design.trueColourConfirmation.at).getTime()).toBeGreaterThanOrEqual(startedAt - 1000)

        const row = await dbConnection.raw(`select status from product where id = ?`, [data.design.id])
        expect(row.rows[0].status).toBe("published")
      })

      it("refuses an incomplete Design, names each missing item and leaves it unpublished", async () => {
        const { data } = await create({ ...COMPLETE, photos: [photo(0, "other"), photo(1, "other")] })
        const before = await snapshot()
        const res = await call("POST", `/admin/shop/designs/${data.design.id}/publish`, { headers: asAdmin(), data: {} })
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({
          code: "design.not_publishable",
          details: { missing: ["fabricCloseUpPhoto", "trueColourConfirmation"] },
        })
        expect(await snapshot()).toEqual(before)
        const one = await call("GET", `/admin/shop/designs/${data.design.id}`, { headers: asAdmin() })
        expect(one.data.design.status).toBe("draft")
      })

      it("names every missing item of a bare draft", async () => {
        const { data } = await create({ name: "Bare", priceRupees: 900 })
        const res = await call("POST", `/admin/shop/designs/${data.design.id}/publish`, {
          headers: asAdmin(),
          data: { trueColourConfirmed: true },
        })
        expect(res.data.details.missing).toEqual(["fibre", "lengthM", "widthM", "taxCode", "fabricCloseUpPhoto", "otherPhoto"])
      })

      it("keeps a published Design publishable: new photos need the confirmation again", async () => {
        const { data } = await create()
        await call("POST", `/admin/shop/designs/${data.design.id}/publish`, { headers: asAdmin(), data: { trueColourConfirmed: true } })
        const newPhotos = [
          { ...photo(2, "close_up"), position: 0 },
          { ...photo(3, "other"), position: 1 },
        ]

        const refused = await call("POST", `/admin/shop/designs/${data.design.id}`, {
          headers: asAdmin(),
          data: { photos: newPhotos },
        })
        expect(refused.status).toBe(400)
        expect(refused.data.details.missing).toEqual(["trueColourConfirmation"])

        const accepted = await call("POST", `/admin/shop/designs/${data.design.id}`, {
          headers: asAdmin(),
          data: { name: "Arani silk saree, maroon", photos: newPhotos, trueColourConfirmed: true },
        })
        expect(accepted.status).toBe(200)
        expect(accepted.data.design).toMatchObject({ name: "Arani silk saree, maroon", photos: newPhotos, status: "published" })
        expect(accepted.data.design.trueColourConfirmation.by).toBe(adminUserId)
      })

      it("lets a draft be edited freely, and a later tax code must still have bands", async () => {
        const { data } = await create({ name: "Draft", priceRupees: 1200 })
        const ok = await call("POST", `/admin/shop/designs/${data.design.id}`, {
          headers: asAdmin(),
          data: { attributes: { fibre: "Cotton", lengthM: 5.5 } },
        })
        expect(ok.status).toBe(200)
        expect(ok.data.design.attributes).toMatchObject({ fibre: "Cotton", lengthM: 5.5, widthM: null })
        const bad = await call("POST", `/admin/shop/designs/${data.design.id}`, {
          headers: asAdmin(),
          data: { attributes: { taxCode: "shirt" } },
        })
        expect(bad.data.code).toBe("design.unknown_tax_code")
      })
    })

    describe("compensation", () => {
      afterEach(() => jest.restoreAllMocks())
      const priceHistory = () => getContainer().resolve<PriceHistoryModuleService>(PRICE_HISTORY_MODULE)

      it("create-design leaves nothing behind when the price-history row cannot be written", async () => {
        const before = await snapshot()
        jest.spyOn(priceHistory(), "createPriceHistories").mockRejectedValueOnce(new Error("history down"))
        const res = await create()
        expect(res.status).toBe(500)
        expect(await snapshot()).toEqual(before)
        const links = await dbConnection.raw(
          `select table_name from information_schema.tables where table_name like 'product\\_%design\\_attributes%'`
        )
        expect(links.rows).toHaveLength(1)
        expect(await count(`select count(*) as n from "${links.rows[0].table_name}" where deleted_at is null`)).toBe(0)
      })

      it("set-design-price restores the kernel price when the price-history row cannot be written", async () => {
        const { data } = await create()
        jest.spyOn(priceHistory(), "createPriceHistories").mockRejectedValueOnce(new Error("history down"))
        const res = await call("POST", `/admin/shop/designs/${data.design.id}/price`, {
          headers: asAdmin(),
          data: { priceRupees: 2950 },
        })
        expect(res.status).toBe(500)
        const one = await call("GET", `/admin/shop/designs/${data.design.id}`, { headers: asAdmin() })
        expect(one.data.design.pricePaise).toBe(315000)
        expect(await history(data.design.variantId)).toHaveLength(1)
      })

      it("publish-design restores the confirmation when the kernel status cannot be changed", async () => {
        const { data } = await create()
        const products = getContainer().resolve(Modules.PRODUCT)
        jest.spyOn(products, "updateProducts").mockRejectedValueOnce(new Error("kernel down"))
        const res = await call("POST", `/admin/shop/designs/${data.design.id}/publish`, {
          headers: asAdmin(),
          data: { trueColourConfirmed: true },
        })
        expect(res.status).toBe(500)
        const one = await call("GET", `/admin/shop/designs/${data.design.id}`, { headers: asAdmin() })
        expect(one.data.design).toMatchObject({ status: "draft", trueColourConfirmation: null })
      })
    })

    describe("the kernel's own product writes", () => {
      it("refuses POST /admin/products/:id with status published (Story 1.4), so the Design stays a draft", async () => {
        const { data } = await create()
        const res = await call("POST", `/admin/products/${data.design.id}`, {
          headers: asAdmin(),
          data: { status: "published" },
        })
        expect(res.status).toBe(403)
        expect(res.data).toEqual({ code: "route.not_allowed", message: expect.any(String) })
        const row = await dbConnection.raw(`select status from product where id = ?`, [data.design.id])
        expect(row.rows[0].status).toBe("draft")
      })
    })

    describe("uploads", () => {
      it("stores JPEG photos in the catalog bucket and returns each file's id and public address", async () => {
        const res = await upload([
          { name: "maroon saree.jpg", type: "image/jpeg", bytes: JPEG },
          { name: "close-up.jpg", type: "image/jpeg", bytes: CLOSE_UP },
        ])
        expect(res.status).toBe(201)
        expect(res.data.files).toHaveLength(2)
        const files = getContainer().resolve(Modules.FILE)
        try {
          for (const f of res.data.files as { id: string; url: string }[]) {
            expect(f.url).toContain("/catalog/")
            const fetched = await fetch(f.url)
            expect(fetched.status).toBe(200)
          }
          const first = Buffer.from(await (await fetch(res.data.files[0].url)).arrayBuffer())
          expect(first.equals(JPEG)).toBe(true)
        } finally {
          await files.deleteFiles(res.data.files.map((f: { id: string }) => f.id))
        }
      })

      it.each([
        ["a GIF", { name: "a.gif", type: "image/gif", bytes: Buffer.from("GIF89a0000000000") }],
        ["a text file", { name: "a.txt", type: "text/plain", bytes: Buffer.from("hello") }],
        ["a text file that claims to be a JPEG", { name: "a.jpg", type: "image/jpeg", bytes: Buffer.from("hello") }],
        ["a photo over 10 MB", { name: "big.jpg", type: "image/jpeg", bytes: Buffer.concat([JPEG, Buffer.alloc(10 * 1024 * 1024)]) }],
      ])("refuses %s with upload.invalid_file", async (_, file) => {
        const res = await upload([file])
        expect(res.status).toBe(400)
        expect(res.data.code).toBe("upload.invalid_file")
      })

      it("refuses an upload with no file", async () => {
        const res = await upload([])
        expect(res.status).toBe(400)
        expect(res.data.code).toBe("upload.invalid_file")
      })
    })

    describe("identity", () => {
      it.each([
        ["GET", "/admin/shop/designs"],
        ["POST", "/admin/shop/designs"],
        ["POST", "/admin/shop/uploads"],
      ] as const)("refuses %s %s for a Shopper token, an admin bearer token and no identity", async (method, url) => {
        const before = await snapshot()
        const identities: Headers[] = [
          { authorization: `Bearer ${shopperToken}`, "x-publishable-api-key": pk },
          { authorization: `Bearer ${adminToken}` },
          {},
        ]
        for (const headers of identities) {
          const res = await call(method, url, { headers, data: COMPLETE })
          expect(res.status).toBe(401)
        }
        expect(await snapshot()).toEqual(before)
      })
    })
  },
})
