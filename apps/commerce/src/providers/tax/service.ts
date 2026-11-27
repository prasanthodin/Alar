import type {
  ICartModuleService,
  IOrderModuleService,
  ItemTaxCalculationLine,
  ItemTaxLineDTO,
  ITaxProvider,
  ShippingTaxCalculationLine,
  ShippingTaxLineDTO,
  TaxCalculationContext,
} from "@medusajs/framework/types"
import { MathBN, MedusaError } from "@medusajs/framework/utils"
import { taxBandsKey, taxForShelfPrice, TaxCode, type ErrorCode, type TaxBands } from "@shop/contracts"
import type SettingsModuleService from "../../modules/settings/service"
import { kernelRateFor } from "./kernel-rate"

/** Made visible to the tax module's container by `dependencies` in medusa-config. */
type InjectedDependencies = {
  shopSettings: SettingsModuleService
  /** Read for the line adjustments (promotions), which the kernel does not pass to tax providers. */
  cart: Pick<ICartModuleService, "listLineItemAdjustments">
  order: Pick<IOrderModuleService, "listOrderLineItemAdjustments">
}

/** A refusal with a stable contract code (400). */
function refuse(code: ErrorCode, message: string, details: Record<string, unknown>): MedusaError {
  const error = new MedusaError(MedusaError.Types.NOT_ALLOWED, message, code)
  Object.assign(error, { details })
  return error
}

/** A kernel amount in rupees (any BigNumber input) to integer paise; anything else fails. */
function toPaise(amount: unknown, lineId: string): number {
  const paise = MathBN.mult(amount as Parameters<typeof MathBN.convert>[0], 100)
  if (!paise.isFinite() || !paise.isInteger() || paise.isNegative()) {
    const error = new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Line ${lineId} has a price that is not a whole number of paise`,
      "money.invalid_shelf_price"
    )
    Object.assign(error, { details: { lineId } })
    throw error
  }
  return paise.toNumber()
}

/**
 * The shop's tax provider (AD-5): the only tax code in the kernel. For each
 * line it takes the tax code from the kernel's tax rate (`code`), reads that
 * code's bands from the settings in effect now, and asks the money functions
 * in `@shop/contracts` for the split of the tax-inclusive shelf price. It
 * computes no tax itself.
 *
 * Prices in the shop's regions are tax-inclusive shelf prices (the India
 * region's price preference). Until Epic 2 it refuses what it cannot tax
 * exactly: a line with a discount (`tax.discount_unsupported`), a shipping
 * line with a price (`tax.shipping_unsupported`; free shipping gets no tax
 * line), and a line whose split the kernel cannot reproduce to the paisa
 * (`tax.kernel_mismatch`).
 */
export default class ShopTaxProvider implements ITaxProvider {
  static identifier = "shop"

  protected readonly settings_: SettingsModuleService
  protected readonly cart_: InjectedDependencies["cart"]
  protected readonly order_: InjectedDependencies["order"]

  constructor({ shopSettings, cart, order }: InjectedDependencies) {
    this.settings_ = shopSettings
    this.cart_ = cart
    this.order_ = order
  }

  getIdentifier(): string {
    return ShopTaxProvider.identifier
  }

  /** Refuses when any of these cart or order lines has a discount. */
  protected async refuseDiscountedLines(lineIds: string[]): Promise<void> {
    const cartIds = lineIds.filter((id) => id.startsWith("cali_"))
    const orderIds = lineIds.filter((id) => id.startsWith("ordli_"))
    const adjustments = [
      ...(cartIds.length ? await this.cart_.listLineItemAdjustments({ item_id: cartIds }) : []),
      ...(orderIds.length ? await this.order_.listOrderLineItemAdjustments({ item_id: orderIds }) : []),
    ]
    const discounted = adjustments.find((a) => !MathBN.eq(a.amount ?? 0, 0))
    if (discounted) {
      throw refuse("tax.discount_unsupported", `Line ${discounted.item_id} has a discount; discounted tax arrives in Epic 2`, {
        lineId: discounted.item_id,
      })
    }
  }

  async getTaxLines(
    itemLines: ItemTaxCalculationLine[],
    shippingLines: ShippingTaxCalculationLine[],
    _context: TaxCalculationContext
  ): Promise<(ItemTaxLineDTO | ShippingTaxLineDTO)[]> {
    for (const { shipping_line: method } of shippingLines) {
      if (!MathBN.eq((method.unit_price ?? 0) as Parameters<typeof MathBN.convert>[0], 0)) {
        throw refuse("tax.shipping_unsupported", `Shipping method ${method.id} has a price; taxed shipping is not supported yet`, {
          shippingMethodId: method.id,
        })
      }
    }
    if (!itemLines.length) return []
    await this.refuseDiscountedLines(itemLines.map((l) => l.line_item.id))

    // One time for the whole calculation, so every line uses the same dated values.
    const at = new Date()
    const bandsByCode = new Map<string, TaxBands>()
    const lines: ItemTaxLineDTO[] = []

    for (const { line_item: item, rates } of itemLines) {
      const rate = rates[0]
      const taxCode = rate?.code ?? null
      if (!rate || rates.length > 1 || !taxCode || !TaxCode.safeParse(taxCode).success) {
        throw refuse("tax.no_band", `Line ${item.id} has no single tax code`, { lineId: item.id, taxCode })
      }

      let bands = bandsByCode.get(taxCode)
      if (!bands) {
        try {
          bands = await this.settings_.getValue(taxBandsKey(taxCode), at)
        } catch (e) {
          if (MedusaError.isMedusaError(e) && (e as MedusaError).code === "settings.not_found") {
            throw refuse("tax.no_band", `No bands for tax code ${taxCode} at ${at.toISOString()}`, {
              lineId: item.id,
              taxCode,
            })
          }
          throw e
        }
        bandsByCode.set(taxCode, bands)
      }

      const pricePaise = toPaise(item.unit_price, item.id)
      const result = taxForShelfPrice(pricePaise, bands)
      if (!result.ok) {
        throw result.error.code === "tax.no_band"
          ? refuse("tax.no_band", `No band of ${taxCode} fits line ${item.id}`, { lineId: item.id, taxCode, pricePaise })
          : new MedusaError(MedusaError.Types.INVALID_DATA, result.error.message, result.error.code)
      }

      const quantity = MathBN.convert((item.quantity ?? 1) as Parameters<typeof MathBN.convert>[0]).toNumber()
      const { taxablePaise, taxPaise, rateBp } = result.data
      const kernelRate = kernelRateFor({ taxablePaise, taxPaise }, quantity)
      if (!kernelRate.exact) {
        throw refuse(
          "tax.kernel_mismatch",
          `The kernel cannot reproduce the tax of line ${item.id} (${quantity} x ${pricePaise} paise) to the paisa`,
          { lineId: item.id, quantity, pricePaise, rateBp }
        )
      }

      lines.push({
        line_item_id: item.id,
        rate_id: rate.id,
        rate: kernelRate.rate,
        code: taxCode,
        name: rate.name,
        provider_id: this.getIdentifier(),
        // The exact per-piece amounts from the money functions, kept on the tax line.
        data: { taxCode, rateBp, pricePaise, taxablePaise, taxPaise, quantity, at: at.toISOString() },
      })
    }
    return lines
  }
}
