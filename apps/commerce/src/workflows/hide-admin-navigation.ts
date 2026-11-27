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
  /** The layout to store: the current one with the entries hidden (`withHiddenEntries`). */
  configuration: LayoutConfigurationData
}

export type HidePersonalAdminNavigationInput = HideAdminNavigationInput & {
  /** The admin whose own saved sidebar layout this is. */
  user_id: string
}

/** The layout with the entries hidden; every other preference in it is kept. */
export function withHiddenEntries(current: LayoutConfigurationData | null): LayoutConfigurationData {
  const widgets = { ...(current?.widgets ?? {}) }
  for (const id of HIDDEN_ADMIN_NAV_ENTRIES) {
    widgets[id] = { ...widgets[id], hidden: true }
  }
  return { ...current, widgets }
}

/** Stores the sidebar's system default layout, which every admin without a layout of their own sees. */
export const hideAdminNavigationWorkflow = createWorkflow(
  "hide-admin-navigation",
  (input: HideAdminNavigationInput) => {
    const layout = setLayoutConfigurationStep({
      zone: ADMIN_SIDEBAR_ZONE,
      // Required by the step's type but unused for a system default: the step
      // stores the default without a user and restores it by zone on compensation.
      user_id: "system",
      is_default: true,
      configuration: input.configuration,
    })
    return new WorkflowResponse(layout)
  }
)

/**
 * Stores one admin's own sidebar layout. Unlike the kernel's
 * `setLayoutConfigurationWorkflow`, it leaves the admin's chosen scope alone.
 */
export const hidePersonalAdminNavigationWorkflow = createWorkflow(
  "hide-personal-admin-navigation",
  (input: HidePersonalAdminNavigationInput) => {
    const layout = setLayoutConfigurationStep({
      zone: ADMIN_SIDEBAR_ZONE,
      user_id: input.user_id,
      is_default: false,
      configuration: input.configuration,
    })
    return new WorkflowResponse(layout)
  }
)
