import { MedusaError } from "@medusajs/framework/utils"
import { describe, expect, it, vi } from "vitest"
import type SettingsModuleService from "../../../modules/settings/service"
import ShopTaxProvider from "../service"

const FLAT_5 = [{ minTaxablePaise: 0, maxTaxablePaise: null, rateBp: 500 }]
const rate = { id: "txr_1", code: "saree", name: "Saree", rate: null } as never

function provider(bands: unknown = FLAT_5) {
  const getValue = vi.fn(async (key: string) => {
    if (key === "tax.bands.saree" && bands) return bands
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `none for ${key}`, "settings.not_found")
  })
  const logger = { warn: vi.fn() }
  const p = new ShopTaxProvider({
    logger: logger as never,
    shopSettings: { getValue } as unknown as SettingsModuleService,
  })
  return { p, getValue, logger }
}

function item(id: string, unitPrice: number | string, quantity = 1, rates = [rate]) {
  return { line_item: { id, product_id: "prod_1", unit_price: unitPrice, quantity }, rates }
}

const ctx = { address: { country_code: "in" } }

describe("ShopTaxProvider", () => {
  it("is registered under the identifier shop", () => {
    expect(ShopTaxProvider.identifier).toBe("shop")
    expect(provider().p.getIdentifier()).toBe("shop")
  })

  it("returns one tax line per item with the money functions' split in its data", async () => {
    const { p, getValue } = provider()
    const lines = await p.getTaxLines([item("li_1", 1650), item("li_2", "2100")], [], ctx)
    expect(lines).toHaveLength(2)
    expect(lines[0]).toMatchObject({
      line_item_id: "li_1",
      rate_id: "txr_1",
      code: "saree",
      name: "Saree",
      provider_id: "shop",
      data: { taxCode: "saree", rateBp: 500, pricePaise: 165000, taxablePaise: 157142, taxPaise: 7858, quantity: 1, kernelRateExact: true },
    })
    expect(lines[1]).toMatchObject({ rate: 5, data: { taxablePaise: 200000, taxPaise: 10000 } })
    // Bands are read once per tax code, at one time for the whole calculation.
    expect(getValue).toHaveBeenCalledTimes(1)
    expect(getValue.mock.calls[0]![0]).toBe("tax.bands.saree")
  })

  it("gives shipping lines no tax line", async () => {
    const lines = await provider().p.getTaxLines(
      [],
      [{ shipping_line: { id: "sm_1", shipping_option_id: "so_1", unit_price: 0 }, rates: [rate] }],
      ctx
    )
    expect(lines).toEqual([])
  })

  it("fails with tax.no_band when the tax code has no bands at that time", async () => {
    const { p } = provider(null)
    await expect(p.getTaxLines([item("li_1", 1650)], [], ctx)).rejects.toMatchObject({ code: "tax.no_band" })
  })

  it("fails with tax.no_band when no band fits or the line has no tax code", async () => {
    const gap = [{ minTaxablePaise: 0, maxTaxablePaise: 100000, rateBp: 500 }]
    await expect(provider(gap).p.getTaxLines([item("li_1", 2100)], [], ctx)).rejects.toMatchObject({
      code: "tax.no_band",
    })
    await expect(provider().p.getTaxLines([item("li_1", 2100, 1, [])], [], ctx)).rejects.toMatchObject({
      code: "tax.no_band",
    })
  })

  it("fails with money.invalid_shelf_price for a price that is not a whole number of rupees", async () => {
    await expect(provider().p.getTaxLines([item("li_1", 1650.5)], [], ctx)).rejects.toMatchObject({
      code: "money.invalid_shelf_price",
    })
    await expect(provider().p.getTaxLines([item("li_1", "1650.005")], [], ctx)).rejects.toMatchObject({
      code: "money.invalid_shelf_price",
    })
  })
})
