import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  ADMIN_SIDEBAR_ZONE,
  hideAdminNavigationWorkflow,
  hidePersonalAdminNavigationWorkflow,
  withHiddenEntries,
} from "../workflows/hide-admin-navigation"

/**
 * Hides the built-in stock-level and reservation screens from the admin's
 * navigation (Story 1.4): in the sidebar's system default, and in every sidebar
 * layout an admin saved before the allow-list, keeping their other settings.
 * Admins cannot save a new layout, because the route allow-list refuses that write.
 */
export default async function hideAdminStockNavigation({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const settings = container.resolve(Modules.SETTINGS)
  const current = await settings.getSystemDefaultLayoutConfiguration(ADMIN_SIDEBAR_ZONE)

  await hideAdminNavigationWorkflow(container).run({
    input: { configuration: withHiddenEntries(current?.configuration ?? null) },
  })

  const personal = await settings.listLayoutConfigurations({
    zone: ADMIN_SIDEBAR_ZONE,
    is_system_default: false,
  })
  for (const layout of personal) {
    if (!layout.user_id) {
      continue
    }
    await hidePersonalAdminNavigationWorkflow(container).run({
      input: { user_id: layout.user_id, configuration: withHiddenEntries(layout.configuration) },
    })
  }
  logger.info(`Hid the stock and reservation screens from the admin navigation (default and ${personal.length} personal layout(s))`)
}
