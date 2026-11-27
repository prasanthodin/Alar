import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ShippingOptionId } from "@shop/contracts"
import { SETTINGS_MODULE } from "../modules/settings"
import type SettingsModuleService from "../modules/settings/service"
import { kernelAmountToExactPaise } from "./designs"
import { shopError } from "./shop-errors"

/** The setting that holds the standard shipping option's id, written by the shipping seed (Story 1.8). */
export const SHIPPING_OPTION_SETTING = "shipping.standard_option_id" as const

/** The standard shipping option's id, or null when it has not been seeded. */
export async function findStandardShippingOptionId(container: MedusaContainer): Promise<string | null> {
  const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
  if (!(await settings.hasValue(SHIPPING_OPTION_SETTING))) return null
  return ShippingOptionId.parse(await settings.getValue(SHIPPING_OPTION_SETTING))
}

type PriceRow = { amount?: unknown; currency_code?: string | null; rules_count?: number | null } | null

/**
 * The charge of the standard shipping option in this currency, in paise:
 * its price without rules (the kernel stores major units). A missing option or
 * price is a fault on the shop's side (`internal`; run `db:migrate`).
 */
export async function standardDeliveryPaise(container: MedusaContainer, currencyCode: string): Promise<number> {
  const id = await findStandardShippingOptionId(container)
  if (!id) throw shopError("internal", "The standard shipping option is missing; run db:migrate to seed it")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "prices.amount", "prices.currency_code", "prices.rules_count"],
    filters: { id },
  })
  const prices = ((data[0] as { prices?: PriceRow[] | null } | undefined)?.prices ?? []).filter(
    (p): p is NonNullable<PriceRow> => Boolean(p) && p!.currency_code === currencyCode
  )
  const price = prices.find((p) => !p.rules_count) ?? prices[0]
  if (!price) throw shopError("internal", `The standard shipping option has no ${currencyCode} price`)
  return kernelAmountToExactPaise(price.amount, "The standard shipping option's price")
}
