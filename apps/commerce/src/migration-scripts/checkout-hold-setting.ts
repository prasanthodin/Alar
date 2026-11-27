import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HOLD_MINUTES_SETTING } from "@shop/contracts"
import { SETTINGS_MODULE } from "../modules/settings"
import type SettingsModuleService from "../modules/settings/service"
import { SHOP_SETTINGS_SEED } from "../settings-data/seed"

/**
 * Seeds the dated setting `checkout.hold_minutes` (Story 1.9) at 15 minutes,
 * in effect from the seed's fixed instant, on databases seeded before the
 * setting existed. A no-op when the key has any value (the settings seed
 * writes it on a new database), so later changes stay dated settings.
 */
export async function seedHoldMinutes(container: MedusaContainer): Promise<void> {
  const settings = container.resolve<SettingsModuleService>(SETTINGS_MODULE)
  if (await settings.hasValue(HOLD_MINUTES_SETTING)) return
  await settings.setValue(HOLD_MINUTES_SETTING, SHOP_SETTINGS_SEED.holdMinutes, SHOP_SETTINGS_SEED.effectiveFrom, {
    allowPast: true,
  })
  container.resolve(ContainerRegistrationKeys.LOGGER).info(`Seeded setting ${HOLD_MINUTES_SETTING}`)
}

export default async function checkoutHoldSetting({ container }: { container: MedusaContainer }) {
  await seedHoldMinutes(container)
}
