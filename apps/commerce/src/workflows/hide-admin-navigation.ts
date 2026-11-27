import type { LayoutConfigurationData } from "@medusajs/framework/types"
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { setLayoutConfigurationStep } from "@medusajs/medusa/core-flows"

/** The admin's main sidebar layout zone; its core entries are `core:nav:<route>`. */
export const ADMIN_SIDEBAR_ZONE = "sidebar"

/**
 * Built-in admin screens kept out of the navigation (Story 1.4): Inventory holds
 * stock levels and, nested under it, Reservations. Their write routes are refused
 * by the route allow-list in any case. Payments and refunds have no navigation
 * entry; they are actions on the Order page, refused by the same list.
 */
export const HIDDEN_ADMIN_NAV_ENTRIES = ["core:nav:/inventory"] as const

export type HideAdminNavigationInput = {
  /** The current system default for the zone, so other preferences survive. */
  current: LayoutConfigurationData | null
}

/** Hides the entries for every admin through the sidebar's system default layout. */
export function withHiddenEntries(current: LayoutConfigurationData | null): LayoutConfigurationData {
  const widgets = { ...(current?.widgets ?? {}) }
  for (const id of HIDDEN_ADMIN_NAV_ENTRIES) {
    widgets[id] = { ...widgets[id], hidden: true }
  }
  return { ...current, widgets }
}

export const hideAdminNavigationWorkflow = createWorkflow(
  "hide-admin-navigation",
  (input: { configuration: LayoutConfigurationData }) => {
    const layout = setLayoutConfigurationStep({
      zone: ADMIN_SIDEBAR_ZONE,
      // A system default belongs to no user; the step needs the field.
      user_id: "system",
      is_default: true,
      configuration: input.configuration,
    })
    return new WorkflowResponse(layout)
  }
)
