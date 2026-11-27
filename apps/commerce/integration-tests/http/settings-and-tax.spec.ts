/// <reference types="jest" />
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, MathBN, Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCartWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateTaxLinesWorkflow,
} from "@medusajs/medusa/core-flows"
import { splitInclusivePrice, startOfNextBusinessDay, type TaxBands } from "@shop/contracts"
import { DEFAULT_REGION_STORE_POLICIES } from "../../src/lib/region-store-policies"
import { seedShopName, seedShopSettings } from "../../src/migration-scripts/shop-settings-seed"
import { SETTINGS_MODULE } from "../../src/modules/settings"
import type SettingsModuleService from "../../src/modules/settings/service"
import { SHOP_TAX_PROVIDER_ID } from "../../src/providers/tax"
import { SHOP_SETTINGS_SEED } from "../../src/settings-data/seed"

jest.setTimeout(180 * 1000)

const PRICES_RUPEES = [2100, 3150, 1650] as const
/** Ten pieces of this price at 18% are a line the kernel cannot reproduce to the paisa. */
const LARGE_RUPEES = 999950
const HOUR = 60 * 60 * 1000

/** A kernel amount in rupees as paise, to the paisa. */
function paise(value: unknown): number {
  return MathBN.mult(MathBN.convert(value as never), 100).decimalPlaces(0).toNumber()
}

/** Thrown errors of a workflow or service: the code wherever it was put. */
async function errorCode(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    await promise
  } catch (e) {
    const err = e as { code?: string; errors?: { error?: { code?: string } }[] }
    return err.code ?? err.errors?.[0]?.error?.code ?? "thrown-without-code"
  }
  return undefined
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection }) => {
    let pk: string
    let salesChannelId: string
    let regionId: string
    const variantByPrice = new Map<number, string>()

    const settings = () => getContainer().resolve<SettingsModuleService>(SETTINGS_MODULE)
    const count = async (sql: string, bindings: unknown[] = []) =>
      Number((await dbConnection.raw(sql, bindings)).rows[0].n)

    /** Writes a value that takes effect in a moment (past instants are refused), then waits until it applies. */
    async function setSoon(key: Parameters<SettingsModuleService["setValue"]>[0], value: unknown) {
      await settings().setValue(key, value as never, new Date(Date.now() + 1000))
      await sleep(1100)
    }

    /** Creates a cart with pieces of the variant at this price and returns the kernel's totals for it. */
    async function cartFor(rupees: number, quantity = 1) {
      const container = getContainer()
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "inr",
          email: "asha@example.test",
          shipping_address: { country_code: "in" },
          items: [{ variant_id: variantByPrice.get(rupees)!, quantity }],
        },
      })
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({
        entity: "cart",
        fields: [
          "id",
          "total",
          "subtotal",
          "tax_total",
          "items.id",
          "items.unit_price",
          "items.is_tax_inclusive",
          "items.subtotal",
          "items.tax_total",
          "items.total",
          "items.tax_lines.rate",
          "items.tax_lines.code",
          "items.tax_lines.provider_id",
          "items.tax_lines.data",
        ],
        filters: { id: cart.id },
      })
      return data[0]!
    }

    beforeAll(async () => {
      const container = getContainer()
      // A starter-style region with system-provider tax regions, which the seed removes.
      await createRegionsWorkflow(container).run({
        input: { regions: [{ name: "Europe", currency_code: "eur", countries: ["de", "fr"] }] },
      })
      await createTaxRegionsWorkflow(container).run({
        input: [
          { country_code: "de", provider_id: "tp_system" },
          { country_code: "fr", provider_id: "tp_system" },
        ],
      })

      // The seed as db:migrate runs it, without an ambient STORE_NAME.
      await seedShopSettings(container, {})

      const { result: channels } = await createSalesChannelsWorkflow(container).run({
        input: { salesChannelsData: [{ name: "Website" }] },
      })
      salesChannelId = channels[0]!.id
      const { result: keys } = await createApiKeysWorkflow(container).run({
        input: { api_keys: [{ title: "Website", type: "publishable", created_by: "test" }] },
      })
      pk = keys[0]!.token
      await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: keys[0]!.id, add: [salesChannelId] } })

      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data: regions } = await query.graph({ entity: "region", fields: ["id", "countries.iso_2"] })
      regionId = regions.find((r) => r.countries?.some((c) => c?.iso_2 === "in"))!.id

      const allPrices = [...PRICES_RUPEES, LARGE_RUPEES]
      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: allPrices.map((rupees) => ({
            title: `Saree ${rupees}`,
            status: "published" as const,
            options: [{ title: "Default", values: ["Default"] }],
            sales_channels: [{ id: salesChannelId }],
            variants: [
              {
                title: "Default",
                manage_inventory: false,
                options: { Default: "Default" },
                prices: [{ amount: rupees, currency_code: "inr" }],
              },
            ],
          })),
        },
      })
      products.forEach((p, i) => variantByPrice.set(allPrices[i]!, p.variants[0]!.id))
    })

    describe("seed", () => {
      it("sets the shop name, the business time zone, the saree bands and the one India region on the shop's tax provider", async () => {
        expect(await settings().getValue("shop.name")).toBe(SHOP_SETTINGS_SEED.defaultShopName)
        expect(await settings().getValue("shop.time_zone")).toBe("Asia/Kolkata")
        expect(await settings().getValue("tax.bands.saree")).toEqual([
          { minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 },
        ])
        const regions = (
          await dbConnection.raw(
            `select r.currency_code, r.automatic_taxes, r.metadata, array_agg(c.iso_2) as countries from region r left join region_country c on c.region_id = r.id where r.deleted_at is null group by r.id`
          )
        ).rows
        expect(regions).toEqual([
          { currency_code: "inr", automatic_taxes: true, metadata: DEFAULT_REGION_STORE_POLICIES, countries: ["in"] },
        ])
        const taxRegions = (
          await dbConnection.raw(
            `select tr.country_code, tr.provider_id, r.code, r.rate from tax_region tr left join tax_rate r on r.tax_region_id = tr.id and r.deleted_at is null where tr.deleted_at is null`
          )
        ).rows
        expect(taxRegions).toEqual([{ country_code: "in", provider_id: SHOP_TAX_PROVIDER_ID, code: "saree", rate: null }])
      })

      it("names the kernel store from shop.name, with rupees the default currency", async () => {
        const stores = (await dbConnection.raw(`select id, name from store where deleted_at is null`)).rows
        expect(stores.map((s: { name: string }) => s.name)).toEqual([SHOP_SETTINGS_SEED.defaultShopName])
        const currencies = (
          await dbConnection.raw(`select currency_code from store_currency where is_default and deleted_at is null`)
        ).rows
        expect(currencies).toEqual([{ currency_code: "inr" }])
      })

      it("is idempotent", async () => {
        const snapshot = async () => ({
          settings: await count(`select count(*) as n from setting_value`),
          regions: await count(`select count(*) as n from region where deleted_at is null`),
          taxRegions: await count(`select count(*) as n from tax_region where deleted_at is null`),
          stores: (await dbConnection.raw(`select name, updated_at from store`)).rows,
        })
        const before = await snapshot()
        await seedShopSettings(getContainer(), { STORE_NAME: "Another Name" })
        expect(await snapshot()).toEqual(before)
        expect(await settings().getValue("shop.name")).toBe(SHOP_SETTINGS_SEED.defaultShopName)
      })

      it("takes the name from STORE_NAME and names the variable when it is invalid", () => {
        expect(seedShopName({ STORE_NAME: " Neutral Store " })).toBe("Neutral Store")
        expect(seedShopName({ STORE_NAME: "  " })).toBe(SHOP_SETTINGS_SEED.defaultShopName)
        expect(() => seedShopName({ STORE_NAME: "x".repeat(81) })).toThrow(
          "Missing or invalid environment variable: STORE_NAME"
        )
      })
    })

    describe("settings module", () => {
      it("reads the value whose effective time is the latest not after the time asked (D1 < D2 <= T < D3)", async () => {
        const now = Date.now()
        await settings().setValue("shop.name", "Name D1", new Date(now + HOUR))
        await settings().setValue("shop.name", "Name D2", new Date(now + 2 * HOUR))
        await settings().setValue("shop.name", "Name D3", new Date(now + 3 * HOUR))
        expect(await settings().getValue("shop.name", new Date(now + 2.5 * HOUR))).toBe("Name D2")
        expect(await settings().getValue("shop.name", new Date(now + 2 * HOUR))).toBe("Name D2")
        expect(await settings().getValue("shop.name", new Date(now + 1.5 * HOUR))).toBe("Name D1")
        expect(await settings().getValue("shop.name", new Date(now + 3 * HOUR))).toBe("Name D3")
        expect(await settings().getValue("shop.name")).toBe(SHOP_SETTINGS_SEED.defaultShopName)
      })

      it("replaces the value of a second write at the same future instant", async () => {
        const before = await count(`select count(*) as n from setting_value`)
        const at = new Date(Date.now() + HOUR)
        await settings().setValue("shop.name", "First", at)
        await settings().setValue("shop.name", "Second", at)
        expect(await settings().getValue("shop.name", at)).toBe("Second")
        expect(await count(`select count(*) as n from setting_value`)).toBe(before + 1)
      })

      it("refuses a value that fails the key's schema and stores nothing", async () => {
        const before = await count(`select count(*) as n from setting_value`)
        const later = new Date(Date.now() + HOUR)
        expect(await errorCode(settings().setValue("shop.name", "", later))).toBe("settings.invalid_value")
        expect(await errorCode(settings().setValue("shop.time_zone", "Mars/Olympus", later))).toBe(
          "settings.invalid_value"
        )
        expect(
          await errorCode(
            settings().setValue("tax.bands.saree", [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 5.5 }], later)
          )
        ).toBe("settings.invalid_value")
        expect(await errorCode(settings().setValue("shop.colour" as never, "lavender" as never, later))).toBe(
          "settings.invalid_value"
        )
        expect(await count(`select count(*) as n from setting_value`)).toBe(before)
      })

      it("refuses an effective time in the past, and a date-only or offset time", async () => {
        const before = await count(`select count(*) as n from setting_value`)
        expect(await errorCode(settings().setValue("shop.name", "Late", new Date(Date.now() - 1000)))).toBe(
          "settings.past_effective_from"
        )
        expect(await errorCode(settings().setValue("shop.name", "Day", "2099-01-01"))).toBe("settings.invalid_value")
        expect(await errorCode(settings().setValue("shop.name", "Offset", "2099-01-01T00:00:00+05:30"))).toBe(
          "settings.invalid_value"
        )
        expect(await errorCode(settings().getValue("shop.name", "2026-11-27"))).toBe("settings.invalid_value")
        expect(await count(`select count(*) as n from setting_value`)).toBe(before)
      })

      it("fails with settings.not_found when no value is in effect", async () => {
        expect(await errorCode(settings().getValue("tax.bands.stitched"))).toBe("settings.not_found")
        expect(await errorCode(settings().getValue("shop.name", "2020-01-01T00:00:00.000Z"))).toBe("settings.not_found")
      })

      it("treats a stored value that no longer fits its schema as an internal fault (500), not bad input", async () => {
        await dbConnection.raw(
          `insert into setting_value (id, key, value, effective_from) values ('setv_bad', 'shop.name', '{"v": 42}', now() - interval '1 minute')`
        )
        expect(await errorCode(settings().getValue("shop.name"))).toBe("internal")
        const res = await api.get("/store/shop/settings", {
          headers: { "x-publishable-api-key": pk },
          validateStatus: () => true,
        })
        expect(res.status).toBe(500)
        expect(res.data.code).toBe("internal")
      })

      it("starts a business day at midnight in the business time zone", async () => {
        expect((await settings().startOfBusinessDay("2026-11-28")).toISOString()).toBe("2026-11-27T18:30:00.000Z")
      })
    })

    describe("tax provider", () => {
      it.each(PRICES_RUPEES)("the kernel's tax lines and totals for a Rs %i saree equal the money functions", async (rupees) => {
        const cart = await cartFor(rupees)
        const expected = splitInclusivePrice(rupees * 100, 500)
        const item = cart.items![0]!
        expect(item.is_tax_inclusive).toBe(true)
        expect(item.tax_lines).toHaveLength(1)
        expect(item.tax_lines![0]).toMatchObject({
          code: "saree",
          provider_id: "shop",
          data: { rateBp: 500, pricePaise: rupees * 100, ...expected },
        })
        expect({
          item: [paise(item.subtotal), paise(item.tax_total), paise(item.total)],
          cart: [paise(cart.subtotal), paise(cart.tax_total), paise(cart.total)],
        }).toEqual({
          item: [expected.taxablePaise, expected.taxPaise, rupees * 100],
          cart: [expected.taxablePaise, expected.taxPaise, rupees * 100],
        })
        // The kernel's raw decimals are within a hundredth of a paisa of the exact amounts.
        expect(Math.abs(MathBN.sub(MathBN.mult(MathBN.convert(item.tax_total as never), 100), expected.taxPaise).toNumber())).toBeLessThan(0.01)
      })

      it("uses a rate dated tomorrow only from midnight in the business time zone, with no release", async () => {
        const tomorrow = startOfNextBusinessDay(new Date(), "Asia/Kolkata")
        const twelve: TaxBands = [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 1200 }]
        await settings().setValue("tax.bands.saree", twelve, tomorrow)

        const fake = (at: number) =>
          jest.useFakeTimers({
            now: at,
            advanceTimers: true,
            doNotFake: [
              "hrtime",
              "nextTick",
              "performance",
              "queueMicrotask",
              "requestAnimationFrame",
              "cancelAnimationFrame",
              "requestIdleCallback",
              "cancelIdleCallback",
              "setImmediate",
              "clearImmediate",
              "setInterval",
              "clearInterval",
              "setTimeout",
              "clearTimeout",
            ],
          })
        try {
          // One minute either side of midnight, so a slow runner cannot cross it while the cart is made.
          fake(tomorrow.getTime() - 60_000)
          const before = await cartFor(1650)
          fake(tomorrow.getTime() + 1000)
          const after = await cartFor(1650)
          jest.useRealTimers()

          const at5 = splitInclusivePrice(165000, 500)
          const at12 = splitInclusivePrice(165000, 1200)
          expect(at12).toEqual({ taxablePaise: 147321, taxPaise: 17679 })
          expect([paise(before.items![0]!.subtotal), paise(before.items![0]!.tax_total)]).toEqual([at5.taxablePaise, at5.taxPaise])
          expect(before.items![0]!.tax_lines![0]!.data).toMatchObject({ rateBp: 500 })
          expect([paise(after.items![0]!.subtotal), paise(after.items![0]!.tax_total)]).toEqual([at12.taxablePaise, at12.taxPaise])
          expect(after.items![0]!.tax_lines![0]!.data).toMatchObject({ rateBp: 1200 })
        } finally {
          jest.useRealTimers()
        }
      })

      it("fails with tax.no_band and creates no cart total when the tax code has no band", async () => {
        await setSoon("tax.bands.saree", [])
        const carts = await count(`select count(*) as n from cart`)
        expect(await errorCode(cartFor(1650))).toBe("tax.no_band")
        expect(await count(`select count(*) as n from cart_line_item_tax_line`)).toBe(0)
        expect(await count(`select count(*) as n from cart`)).toBe(carts)
      })

      it("refuses with tax.discount_unsupported a line that has a discount", async () => {
        const cart = await cartFor(1650)
        const cartModule = getContainer().resolve(Modules.CART)
        await cartModule.addLineItemAdjustments([{ item_id: cart.items![0]!.id, amount: 100, code: "TEST10" }])
        expect(
          await errorCode(updateTaxLinesWorkflow(getContainer()).run({ input: { cart_id: cart.id, force_tax_calculation: true } }))
        ).toBe("tax.discount_unsupported")
      })

      it("refuses with tax.kernel_mismatch a line the kernel cannot reproduce to the paisa", async () => {
        await setSoon("tax.bands.saree", [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 1800 }])
        const carts = await count(`select count(*) as n from cart`)
        expect(await errorCode(cartFor(LARGE_RUPEES, 10))).toBe("tax.kernel_mismatch")
        expect(await count(`select count(*) as n from cart`)).toBe(carts)
        // One piece of the same price is exact.
        const one = await cartFor(LARGE_RUPEES, 1)
        expect(paise(one.items![0]!.tax_total)).toBe(splitInclusivePrice(LARGE_RUPEES * 100, 1800).taxPaise)
      })
    })

    describe("GET /store/shop/settings", () => {
      it("returns the shop name from settings, cacheable for a minute", async () => {
        const res = await api.get("/store/shop/settings", { headers: { "x-publishable-api-key": pk } })
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ name: SHOP_SETTINGS_SEED.defaultShopName })
        expect(res.headers["cache-control"]).toBe("public, max-age=60")
      })

      it("follows a dated rename", async () => {
        await setSoon("shop.name", "Neutral Store")
        const res = await api.get("/store/shop/settings", { headers: { "x-publishable-api-key": pk } })
        expect(res.data).toEqual({ name: "Neutral Store" })
      })

      it("needs the publishable key like every store route", async () => {
        const res = await api.get("/store/shop/settings", { validateStatus: () => true })
        expect(res.status).toBe(400)
      })
    })
  },
})
