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
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3"
import sharp from "sharp"
import { seedShopSettings } from "../../src/migration-scripts/shop-settings-seed"
import { PRICE_HISTORY_MODULE } from "../../src/modules/price-history"
import { SETTINGS_MODULE } from "../../src/modules/settings"
import type SettingsModuleService from "../../src/modules/settings/service"
import type PriceHistoryModuleService from "../../src/modules/price-history/service"

jest.setTimeout(180 * 1000)

type Method = "GET" | "POST" | "DELETE"
type Headers = Record<string, string>

const ADMIN = { email: "owner@example.test", password: "owner-pass-1" }
const SHOPPER = { email: "asha@example.test", password: "shopper-pass-1" }
const MOCK = join(__dirname, "../../../mobile/public/mock")
const JPEG = readFileSync(join(MOCK, "1-1-maroon.jpg"))
const CLOSE_UP = readFileSync(join(MOCK, "2-1-closeup-maroon.jpg"))
/** A real PNG (the 1x1 pixel image every PNG decoder accepts). */
const PNG_SAMPLE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
)

/** The S3 client of the test's file storage (the AWS emulator), to look into the catalog bucket. */
const s3 = () =>
  new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
  })

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

/** An admin origin from ADMIN_CORS: shop admin writes must name one. */
const ADMIN_ORIGIN = "http://localhost:9000"

/** Photos uploaded once in beforeAll (deleted in afterAll), referenced by file id. */
const uploaded: { id: string; url: string }[] = []

/** A photo as a request names it. */
const photo = (i: number, role: "close_up" | "other", position = i) => ({ fileId: uploaded[i]!.id, role, position })
/** The same photo as the kernel stores it, with the address it derives. */
const stored = (i: number, role: "close_up" | "other", position = i) => ({ ...photo(i, role, position), url: uploaded[i]!.url })

const complete = () => ({
  name: "Arani silk saree",
  description: "Maroon with a temple border",
  attributes: ATTRIBUTES,
  photos: [photo(0, "close_up"), photo(1, "other")],
  priceRupees: 3150,
})

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection }) => {
    let pk: string
    let adminCookie: string
    let adminToken: string
    let adminUserId: string
    let shopperToken: string
    let salesChannelId: string
    let shippingProfileId: string
    let secretKey: string

    async function call(method: Method, url: string, opts: { headers?: Headers; data?: unknown } = {}) {
      return api.request({ method, url, headers: opts.headers, data: opts.data, validateStatus: () => true })
    }
    const asAdmin = (): Headers => ({ cookie: adminCookie, origin: ADMIN_ORIGIN })
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

    async function create(body: unknown = complete()) {
      return call("POST", "/admin/shop/designs", { headers: asAdmin(), data: body })
    }

    /** The table of the product and Design attributes link. */
    async function linkTable(): Promise<string> {
      const res = await dbConnection.raw(
        `select table_name from information_schema.tables where table_name like 'product\\_%design\\_attributes%'`
      )
      return res.rows[0].table_name
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

      // A secret API key, which shop admin routes must refuse.
      const { result: secret } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Script", type: "secret", created_by: adminUserId }] },
      })
      secretKey = secret[0]!.token

      // Four photos for the Designs to reference.
      const res = await upload([
        { name: "maroon.jpg", type: "image/jpeg", bytes: JPEG },
        { name: "close-up.jpg", type: "image/jpeg", bytes: CLOSE_UP },
        { name: "violet.jpg", type: "image/jpeg", bytes: readFileSync(join(MOCK, "1-2-violet.jpg")) },
        { name: "emerald.jpg", type: "image/jpeg", bytes: readFileSync(join(MOCK, "1-3-emerald.jpg")) },
      ])
      expect(res.status).toBe(201)
      uploaded.push(...res.data.files)
    })

    afterAll(async () => {
      // The runner has shut the kernel down by now, so this goes to the bucket directly.
      if (uploaded.length) {
        await s3().send(
          new DeleteObjectsCommand({
            Bucket: process.env.S3_BUCKET,
            Delete: { Objects: uploaded.map((f) => ({ Key: f.id })) },
          })
        )
      }
    })

    describe("create", () => {
      it("saves a complete Design unpublished, with one price-history row (old null, new 315000)", async () => {
        const res = await create()
        expect(res.status).toBe(201)
        const design = res.data.design
        expect(design).toMatchObject({
          name: "Arani silk saree",
          description: "Maroon with a temple border",
          status: "draft",
          pricePaise: 315000,
          attributes: ATTRIBUTES,
          photos: [stored(0, "close_up"), stored(1, "other")],
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
        const res = await create({ ...complete(), priceRupees })
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({ code: "money.invalid_shelf_price", message: expect.any(String) })
        expect(await snapshot()).toEqual(before)
      })

      it("refuses a tax code without bands in settings and creates nothing", async () => {
        const before = await snapshot()
        const res = await create({ ...complete(), attributes: { ...ATTRIBUTES, taxCode: "shirt" } })
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({ code: "design.unknown_tax_code" })
        expect(await snapshot()).toEqual(before)
      })

      it("refuses an invalid form with input.invalid and creates nothing", async () => {
        const before = await snapshot()
        const res = await create({ ...complete(), name: "", status: "published" })
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
        const { data } = await create({ ...complete(), photos: [photo(0, "other"), photo(1, "other")] })
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
        const first = (await call("GET", `/admin/shop/designs/${data.design.id}`, { headers: asAdmin() })).data.design
        const newPhotos = [photo(2, "close_up", 0), photo(3, "other", 1)]

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
        expect(accepted.data.design).toMatchObject({
          name: "Arani silk saree, maroon",
          photos: [stored(2, "close_up", 0), stored(3, "other", 1)],
          status: "published",
        })
        expect(accepted.data.design.trueColourConfirmation.by).toBe(adminUserId)
        expect(new Date(accepted.data.design.trueColourConfirmation.at).getTime()).toBeGreaterThan(
          new Date(first.trueColourConfirmation.at).getTime()
        )
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

    describe("photos, status, locking and tax codes", () => {
      const settings = () => getContainer().resolve<SettingsModuleService>(SETTINGS_MODULE)
      const publish = (id: string) =>
        call("POST", `/admin/shop/designs/${id}/publish`, { headers: asAdmin(), data: { trueColourConfirmed: true } })

      it("refuses a photo that was never uploaded with design.unknown_photo and creates nothing", async () => {
        const before = await snapshot()
        const res = await create({ ...complete(), photos: [photo(0, "close_up"), { fileId: "nowhere.jpg", role: "other", position: 1 }] })
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({ code: "design.unknown_photo", details: { fileId: "nowhere.jpg" } })
        expect(await snapshot()).toEqual(before)
      })

      it("stores the address it derives, not one the request sends", async () => {
        const res = await create({
          ...complete(),
          photos: [{ ...photo(0, "close_up"), url: "https://evil.example/x.jpg" }, photo(1, "other")],
        })
        expect(res.status).toBe(201)
        expect(res.data.design.photos).toEqual([stored(0, "close_up"), stored(1, "other")])
      })

      it("refuses to publish an already published Design and keeps its confirmation", async () => {
        const { data } = await create()
        const first = (await publish(data.design.id)).data.design
        const again = await publish(data.design.id)
        expect(again.status).toBe(409)
        expect(again.data.code).toBe("design.already_published")
        const one = await call("GET", `/admin/shop/designs/${data.design.id}`, { headers: asAdmin() })
        expect(one.data.design.trueColourConfirmation).toEqual(first.trueColourConfirmation)
      })

      it("keeps a published Design published, with its original confirmation, when only the name changes", async () => {
        const { data } = await create()
        const first = (await publish(data.design.id)).data.design
        const res = await call("POST", `/admin/shop/designs/${data.design.id}`, {
          headers: asAdmin(),
          data: { name: "Arani silk saree, renamed" },
        })
        expect(res.status).toBe(200)
        expect(res.data.design).toMatchObject({ name: "Arani silk saree, renamed", status: "published" })
        expect(res.data.design.trueColourConfirmation).toEqual(first.trueColourConfirmation)
        // The same photos sent again are no change either.
        const same = await call("POST", `/admin/shop/designs/${data.design.id}`, {
          headers: asAdmin(),
          data: { photos: [photo(0, "close_up"), photo(1, "other")] },
        })
        expect(same.status).toBe(200)
        expect(same.data.design.trueColourConfirmation).toEqual(first.trueColourConfirmation)
      })

      it("refuses a published Design a price above its band's upper limit, leaving the price and history alone", async () => {
        // Up to Rs 3,000 taxable at 5%: Rs 3,150 fits (taxable 300000), Rs 3,500 does not.
        await settings().setValue(
          "tax.bands.capped",
          [{ minTaxablePaise: 0, maxTaxablePaise: 300000, rateBp: 500 }],
          new Date(Date.now() - 1000),
          { allowPast: true }
        )
        const { data } = await create({ ...complete(), attributes: { ...ATTRIBUTES, taxCode: "capped" } })
        expect((await publish(data.design.id)).status).toBe(200)
        const res = await call("POST", `/admin/shop/designs/${data.design.id}/price`, {
          headers: asAdmin(),
          data: { priceRupees: 3500 },
        })
        expect(res.status).toBe(400)
        expect(res.data.code).toBe("tax.no_band")
        const one = await call("GET", `/admin/shop/designs/${data.design.id}`, { headers: asAdmin() })
        expect(one.data.design.pricePaise).toBe(315000)
        expect(await history(data.design.variantId)).toHaveLength(1)

        const codes = await call("GET", "/admin/shop/tax-codes", { headers: asAdmin() })
        expect(codes.data.taxCodes).toEqual(["capped", "saree"])
      })

      it("lists the tax codes with a band in effect now", async () => {
        await settings().setValue("tax.bands.empty", [], new Date(Date.now() - 1000), { allowPast: true })
        await settings().setValue(
          "tax.bands.later",
          [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 1200 }],
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        )
        const res = await call("GET", "/admin/shop/tax-codes", { headers: asAdmin() })
        expect(res.status).toBe(200)
        expect(res.data.taxCodes).toContain("saree")
        expect(res.data.taxCodes).not.toContain("empty")
        expect(res.data.taxCodes).not.toContain("later")
      })

      it("records concurrent price changes one after the other, each with the right old price", async () => {
        const { data } = await create()
        const results = await Promise.all(
          [2950, 2800, 2700].map((priceRupees) =>
            call("POST", `/admin/shop/designs/${data.design.id}/price`, { headers: asAdmin(), data: { priceRupees } })
          )
        )
        expect(results.map((r) => r.status)).toEqual([200, 200, 200])
        const rows = await history(data.design.variantId)
        expect(rows).toHaveLength(4)
        for (let i = 1; i < rows.length; i++) expect(rows[i]!.old_price_paise).toBe(rows[i - 1]!.new_price_paise)
        const one = await call("GET", `/admin/shop/designs/${data.design.id}`, { headers: asAdmin() })
        expect(one.data.design.pricePaise).toBe(rows[3]!.new_price_paise)
      })

      it("leaves a Design that cannot be read out of the list, and fails reading it alone", async () => {
        const good = (await create()).data.design
        const bad = (await create({ ...complete(), name: "Broken" })).data.design
        await dbConnection.raw(
          `update design_attributes set photos = '[{"fileId": 1}]'::jsonb where id = (select design_attributes_id from "${await linkTable()}" where product_id = ?)`,
          [bad.id]
        )
        const list = await call("GET", "/admin/shop/designs", { headers: asAdmin() })
        expect(list.status).toBe(200)
        expect(list.data.designs.map((d: { id: string }) => d.id)).toEqual([good.id])
        const one = await call("GET", `/admin/shop/designs/${bad.id}`, { headers: asAdmin() })
        expect(one.status).toBe(500)
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
      /** Keys in the catalog bucket that start with this prefix (an upload's name becomes its key's start). */
      async function storedWithPrefix(prefix: string): Promise<number> {
        const res = await s3().send(new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET, Prefix: prefix }))
        return res.KeyCount ?? 0
      }

      it("stores JPEG, PNG and WebP photos in the catalog bucket, re-encoded, and returns each id and public address", async () => {
        const png = await sharp(JPEG).png().toBuffer()
        const webp = await sharp(JPEG).webp().toBuffer()
        const res = await upload([
          { name: "maroon saree.jpg", type: "image/jpeg", bytes: JPEG },
          { name: "maroon.png", type: "image/png", bytes: png },
          { name: "maroon.webp", type: "image/webp", bytes: webp },
        ])
        expect(res.status).toBe(201)
        expect(res.data.files).toHaveLength(3)
        const files = getContainer().resolve(Modules.FILE)
        try {
          const formats = []
          for (const f of res.data.files as { id: string; url: string }[]) {
            expect(f.url).toContain("/catalog/")
            const fetched = await fetch(f.url)
            expect(fetched.status).toBe(200)
            formats.push((await sharp(Buffer.from(await fetched.arrayBuffer())).metadata()).format)
          }
          expect(formats).toEqual(["jpeg", "png", "webp"])
          expect(res.data.files.map((f: { id: string }) => f.id.split(".").pop())).toEqual(["jpg", "png", "webp"])
        } finally {
          await files.deleteFiles(res.data.files.map((f: { id: string }) => f.id))
        }
      })

      it("removes GPS position and camera details from a phone photo before making it public", async () => {
        const phone = await sharp(JPEG)
          .withMetadata({ orientation: 1 })
          .withExif({
            IFD0: { Make: "PhoneMaker", Model: "Phone 9" },
            IFD3: { GPSLatitudeRef: "N", GPSLatitude: "12/1 58/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "77/1 35/1 0/1" },
          })
          .jpeg()
          .toBuffer()
        const hasGps = (exif?: Buffer) =>
          !!exif && (exif.includes(Buffer.from([0x88, 0x25])) || exif.includes(Buffer.from([0x25, 0x88])))
        expect(hasGps((await sharp(phone).metadata()).exif)).toBe(true)

        const res = await upload([{ name: "phone.jpg", type: "image/jpeg", bytes: phone }])
        expect(res.status).toBe(201)
        try {
          const publicBytes = Buffer.from(await (await fetch(res.data.files[0].url)).arrayBuffer())
          const meta = await sharp(publicBytes).metadata()
          expect(meta.format).toBe("jpeg")
          expect(meta.exif).toBeUndefined()
          expect(publicBytes.includes(Buffer.from("PhoneMaker"))).toBe(false)
        } finally {
          await getContainer().resolve(Modules.FILE).deleteFiles(res.data.files[0].id)
        }
      })

      const fakeJpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from("not really a photo".repeat(40))])

      it.each([
        ["a GIF", "not_an_image", { name: "a.gif", type: "image/gif", bytes: Buffer.from("GIF89a0000000000") }],
        ["a text file", "not_an_image", { name: "a.txt", type: "text/plain", bytes: Buffer.from("hello") }],
        ["a fake JPEG (right first bytes, no image)", "not_an_image", { name: "fake.jpg", type: "image/jpeg", bytes: fakeJpeg }],
        ["a PNG sent as a JPEG", "not_an_image", { name: "a.jpg", type: "image/jpeg", bytes: PNG_SAMPLE }],
        ["a photo over 10 MB", "too_large", { name: "big.jpg", type: "image/jpeg", bytes: Buffer.concat([JPEG, Buffer.alloc(10 * 1024 * 1024)]) }],
      ])("refuses %s with upload.invalid_file (%s)", async (_, reason, file) => {
        const res = await upload([file])
        expect(res.status).toBe(400)
        expect(res.data).toMatchObject({ code: "upload.invalid_file", details: { reason } })
        expect(res.data.message).toContain("12 JPEG, PNG or WebP photos of 10 MB")
      })

      it("refuses more than 12 files, a field that is not a file and an upload with no file", async () => {
        const many = Array.from({ length: 13 }, (_, i) => ({ name: `p${i}.jpg`, type: "image/jpeg", bytes: JPEG }))
        expect((await upload(many)).data).toMatchObject({ code: "upload.invalid_file", details: { reason: "too_many_files" } })

        const form = new FormData()
        form.append("files", new Blob([new Uint8Array(JPEG)], { type: "image/jpeg" }), "a.jpg")
        form.append("note", "hello")
        const field = await call("POST", "/admin/shop/uploads", { headers: asAdmin(), data: form })
        expect(field.status).toBe(400)
        expect(field.data).toMatchObject({ code: "upload.invalid_file", details: { reason: "unexpected_field" } })

        const none = await upload([])
        expect(none.status).toBe(400)
        expect(none.data).toMatchObject({ code: "upload.invalid_file", details: { reason: "no_file" } })
      })

      it("stores nothing when any file of an upload is refused", async () => {
        const prefix = `refused-${Date.now()}`
        const res = await upload([
          { name: `${prefix}-good.jpg`, type: "image/jpeg", bytes: JPEG },
          { name: `${prefix}-fake.jpg`, type: "image/jpeg", bytes: fakeJpeg },
        ])
        expect(res.status).toBe(400)
        expect(await storedWithPrefix(prefix)).toBe(0)

        const tooMany = await upload(
          Array.from({ length: 13 }, (_, i) => ({ name: `${prefix}-${i}.jpg`, type: "image/jpeg", bytes: JPEG }))
        )
        expect(tooMany.status).toBe(400)
        expect(await storedWithPrefix(prefix)).toBe(0)
      })
    })

    describe("identity and origin", () => {
      it.each([
        ["GET", "/admin/shop/designs"],
        ["GET", "/admin/shop/tax-codes"],
        ["POST", "/admin/shop/designs"],
        ["POST", "/admin/shop/uploads"],
      ] as const)("refuses %s %s for a Shopper token, an admin bearer token, a secret API key and no identity", async (method, url) => {
        const before = await snapshot()
        const identities: Headers[] = [
          { authorization: `Bearer ${shopperToken}`, "x-publishable-api-key": pk },
          { authorization: `Bearer ${adminToken}` },
          { authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}` },
          {},
        ]
        for (const headers of identities) {
          const res = await call(method, url, { headers: { ...headers, origin: ADMIN_ORIGIN }, data: complete() })
          expect(res.status).toBe(401)
        }
        expect(await snapshot()).toEqual(before)
      })

      it("refuses a signed-in admin's write from another origin, or naming none, and changes nothing", async () => {
        const before = await snapshot()
        const cases: Headers[] = [
          { cookie: adminCookie, origin: "https://evil.example" },
          { cookie: adminCookie, referer: "https://evil.example/page" },
          { cookie: adminCookie },
        ]
        for (const headers of cases) {
          const res = await call("POST", "/admin/shop/designs", { headers, data: complete() })
          expect(res.status).toBe(403)
          expect(res.data).toMatchObject({ code: "request.cross_origin" })
          const up = await call("POST", "/admin/shop/uploads", { headers, data: new FormData() })
          expect(up.data.code).toBe("request.cross_origin")
        }
        expect(await snapshot()).toEqual(before)
      })

      it("accepts a write whose Referer is an admin page when it sends no Origin, and reads from anywhere", async () => {
        const res = await call("POST", "/admin/shop/designs", {
          headers: { cookie: adminCookie, referer: `${ADMIN_ORIGIN}/app/designs` },
          data: complete(),
        })
        expect(res.status).toBe(201)
        const read = await call("GET", "/admin/shop/designs", { headers: { cookie: adminCookie, origin: "https://evil.example" } })
        expect(read.status).toBe(200)
      })
    })
  },
})
