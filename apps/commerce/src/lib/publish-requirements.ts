import {
  isDesignShelfPrice,
  taxForShelfPrice,
  type AdminDesignView,
  type PublishRequirement,
  type TaxBands,
} from "@shop/contracts"

/**
 * What publishing looks at: the Design, and whether the Owner's true-colour
 * confirmation would be present (given in the publish request, or kept from
 * before when an update leaves the photos alone).
 */
export type PublishCheckView = Pick<AdminDesignView, "attributes" | "pricePaise" | "photos"> & {
  trueColourConfirmed: boolean
  /** The kernel product is in a sales channel (the store's default). */
  hasSalesChannel: boolean
  /** The kernel product has a shipping profile. */
  hasShippingProfile: boolean
}

/** One dated value of a tax code's bands (`tax.bands.<code>`), as the settings module lists them. */
export type DatedTaxBands = { effectiveFrom: Date | string; value: TaxBands }

/** The bands in effect at `now`: the value whose effective time is the latest not after `now`, or null. */
export function bandsInEffect(values: readonly DatedTaxBands[], now: Date): TaxBands | null {
  let best: { at: number; value: TaxBands } | null = null
  for (const v of values) {
    const at = new Date(v.effectiveFrom).getTime()
    if (Number.isNaN(at) || at > now.getTime()) continue
    if (!best || at > best.at) best = { at, value: v.value }
  }
  return best?.value ?? null
}

/**
 * Every item a Design still needs before `publish-design` may publish it, in
 * the order the page lists them; an empty list means it can be published.
 *
 * - `fibre`, `lengthM`, `widthM`: the attribute is empty.
 * - `taxCode`: no tax code is set.
 * - `taxBand`: the tax code has no bands in effect at `now`, or the price is
 *   a valid shelf price that fits none of them (AD-5: nothing is sold at a
 *   price without a band).
 * - `shelfPrice`: the Variant has no price that is a positive whole number of rupees.
 * - `fabricCloseUpPhoto`: no photo is marked as the fabric close-up.
 * - `otherPhoto`: no photo besides the close-up.
 * - `trueColourConfirmation`: the Owner has not confirmed the true colour.
 * - `salesChannel`, `shippingProfile`: the kernel product has none, so it
 *   could be published but not sold or shipped.
 *
 * `bands` are all dated values of the Design's tax code; the one in effect at
 * `now` is used. Pure: the caller reads the settings and the clock.
 */
export function publishRequirements(
  view: PublishCheckView,
  bands: readonly DatedTaxBands[],
  now: Date
): PublishRequirement[] {
  const missing: PublishRequirement[] = []
  const { attributes, pricePaise, photos } = view

  if (!attributes.fibre?.trim()) missing.push("fibre")
  if (!(typeof attributes.lengthM === "number" && attributes.lengthM > 0)) missing.push("lengthM")
  if (!(typeof attributes.widthM === "number" && attributes.widthM > 0)) missing.push("widthM")

  const validPrice = isDesignShelfPrice(pricePaise)
  if (!attributes.taxCode) {
    missing.push("taxCode")
  } else {
    const inEffect = bandsInEffect(bands, now)
    const fits = inEffect !== null && inEffect.length > 0 && (!validPrice || taxForShelfPrice(pricePaise, inEffect).ok)
    if (!fits) missing.push("taxBand")
  }
  if (!validPrice) missing.push("shelfPrice")

  const closeUps = photos.filter((p) => p.role === "close_up").length
  if (closeUps === 0) missing.push("fabricCloseUpPhoto")
  if (photos.length - closeUps < 1) missing.push("otherPhoto")

  if (!view.trueColourConfirmed) missing.push("trueColourConfirmation")
  if (!view.hasSalesChannel) missing.push("salesChannel")
  if (!view.hasShippingProfile) missing.push("shippingProfile")
  return missing
}
