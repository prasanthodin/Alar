/// <reference types="jest" />
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys, MathBN } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCartWorkflow,
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"
import { splitInclusivePrice, startOfNextBusinessDay, taxForShelfPrice, type TaxBands } from "@shop/contracts"
import { seedShopName, seedShopSettings } from "../../src/migration-scripts/shop-settings-seed"
import { SETTINGS_MODULE } from "../../src/modules/settings"
import type SettingsModuleService from "../../src/modules/settings/service"
import { SHOP_TAX_PROVIDER_ID } from "../../src/providers/tax"
import { SHOP_SETTINGS_SEED } from "../../src/settings-data/seed"

jest.setTimeout(180 * 1000)

const PRICES_RUPEES = [2100, 3150, 1650] as const
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

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer, dbConnection }) => {
    let pk: string
    let salesChannelId: string
    let regionId: string
    const variantByPrice = new Map<number, string>()

    const settings = () => getContainer().resolve<SettingsModuleService>(SETTINGS_MODULE)
    const count = async (sql: string, bindings: unknown[] = []) =>
      Number((await dbConnection.raw(sql, bindings)).rows[0].n)

    /** Creates a cart with one piece of the variant at this price and returns the kernel's totals for it. */
    async function cartFor(rupees: number) {
      const container = getContainer()
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: "inr",
          email: "asha@example.test",
          shipping_address: { country_code: "in" },
          items: [{ variant_id: variantByPrice.get(rupees)!, quantity: 1 }],
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

      const { result: products } = await createProductsWorkflow(container).run({
        input: {
          products: PRICES_RUPEES.map((rupees) => ({
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
      products.forEach((p, i) => variantByPrice.set(PRICES_RUPEES[i]!, p.variants[0]!.id))
    })

    describe("seed", () => {
      it("sets the shop name, the business time zone, the saree bands and the India region on the shop's tax provider", async () => {
        expect(await settings().getValue("shop.name")).toBe(SHOP_SETTINGS_SEED.defaultShopName)
        expect(await settings().getValue("shop.time_zone")).toBe("Asia/Kolkata")
        expect(await settings().getValue("tax.bands.saree")).toEqual([
          { minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 },
        ])
        const region = (
          await dbConnection.raw(
            `select r.currency_code, r.automatic_taxes from region r join region_country c on c.region_id = r.id where c.iso_2 = 'in' and r.deleted_at is null`
          )
        ).rows
        expect(region).toEqual([{ currency_code: "inr", automatic_taxes: true }])
        const taxRegion = (
          await dbConnection.raw(
            `select tr.provider_id, r.code, r.rate from tax_region tr join tax_rate r on r.tax_region_id = tr.id where tr.country_code = 'in' and tr.deleted_at is null and r.deleted_at is null`
          )
        ).rows
        expect(taxRegion).toEqual([{ provider_id: SHOP_TAX_PROVIDER_ID, code: "saree", rate: null }])
      })

      it("is idempotent", async () => {
        const before = {
          settings: await count(`select count(*) as n from setting_value`),
          regions: await count(`select count(*) as n from region where deleted_at is null`),
          taxRegions: await count(`select count(*) as n from tax_region where deleted_at is null`),
        }
        await seedShopSettings(getContainer(), { STORE_NAME: "Another Name" })
        expect({
          settings: await count(`select count(*) as n from setting_value`),
          regions: await count(`select count(*) as n from region where deleted_at is null`),
          taxRegions: await count(`select count(*) as n from tax_region where deleted_at is null`),
        }).toEqual(before)
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
      it("reads the value whose effective time is the latest not after the time asked (D1 < D2 <= now < D3)", async () => {
        const now = Date.now()
        await settings().setValue("shop.name", "Name D1", new Date(now - 48 * HOUR))
        await settings().setValue("shop.name", "Name D2", new Date(now - HOUR))
        await settings().setValue("shop.name", "Name D3", new Date(now + 24 * HOUR))
        expect(await settings().getValue("shop.name")).toBe("Name D2")
        expect(await settings().getValue("shop.name", new Date(now - 24 * HOUR))).toBe("Name D1")
        expect(await settings().getValue("shop.name", new Date(now + 25 * HOUR))).toBe("Name D3")
        expect(await settings().getValue("shop.name", "2026-04-15T00:00:00.000Z")).toBe(SHOP_SETTINGS_SEED.defaultShopName)
      })

      it("refuses a value that fails the key's schema and stores nothing", async () => {
        const before = await count(`select count(*) as n from setting_value`)
        expect(await errorCode(settings().setValue("shop.name", "", new Date()))).toBe("settings.invalid_value")
        expect(await errorCode(settings().setValue("shop.time_zone", "Mars/Olympus", new Date()))).toBe(
          "settings.invalid_value"
        )
        expect(
          await errorCode(settings().setValue("tax.bands.saree", [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 5.5 }], new Date()))
        ).toBe("settings.invalid_value")
        expect(await errorCode(settings().setValue("shop.colour" as never, "lavender", new Date()))).toBe(
          "settings.invalid_value"
        )
        expect(await count(`select count(*) as n from setting_value`)).toBe(before)
      })

      it("fails with settings.not_found when no value is in effect", async () => {
        expect(await errorCode(settings().getValue("tax.bands.stitched"))).toBe("settings.not_found")
        expect(await errorCode(settings().getValue("shop.name", "2020-01-01T00:00:00.000Z"))).toBe("settings.not_found")
      })

      it("refuses a stored value that no longer fits its schema on read", async () => {
        await dbConnection.raw(
          `insert into setting_value (id, key, value, effective_from) values ('setv_bad', 'shop.name', '{"v": 42}', now() - interval '1 minute')`
        )
        expect(await errorCode(settings().getValue("shop.name"))).toBe("settings.invalid_value")
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
          data: { rateBp: 500, pricePaise: rupees * 100, ...expected, kernelRateExact: true },
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
          fake(tomorrow.getTime() - 2000)
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
        await settings().setValue("tax.bands.saree", [], new Date(Date.now() - 1000))
        expect(taxForShelfPrice(165000, []).ok).toBe(false)
        const carts = await count(`select count(*) as n from cart`)
        expect(await errorCode(cartFor(1650))).toBe("tax.no_band")
        const taxLines = await count(`select count(*) as n from cart_line_item_tax_line`)
        expect(taxLines).toBe(0)
        expect(await count(`select count(*) as n from cart`)).toBe(carts)
      })
    })

    describe("GET /store/shop/settings", () => {
      it("returns the shop name from settings", async () => {
        const res = await api.get("/store/shop/settings", { headers: { "x-publishable-api-key": pk } })
        expect(res.status).toBe(200)
        expect(res.data).toEqual({ name: SHOP_SETTINGS_SEED.defaultShopName })
      })

      it("follows a dated rename", async () => {
        await settings().setValue("shop.name", "Neutral Store", new Date(Date.now() - 1000))
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
