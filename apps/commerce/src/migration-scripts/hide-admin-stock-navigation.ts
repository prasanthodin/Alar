import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  ADMIN_SIDEBAR_ZONE,
  hideAdminNavigationWorkflow,
  withHiddenEntries,
} from "../workflows/hide-admin-navigation"

/**
 * Hides the built-in stock-level and reservation screens from the admin's
 * navigation (Story 1.4). Admins cannot save a layout of their own, because the
 * route allow-list refuses that write, so every admin sees this default.
 */
export default async function hideAdminStockNavigation({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const settings = container.resolve(Modules.SETTINGS)
  const current = await settings.getSystemDefaultLayoutConfiguration(ADMIN_SIDEBAR_ZONE)

  await hideAdminNavigationWorkflow(container).run({
    input: { configuration: withHiddenEntries(current?.configuration ?? null) },
  })
  logger.info("Hid the stock and reservation screens from the admin navigation")
}
