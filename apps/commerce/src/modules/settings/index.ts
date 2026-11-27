import { Module } from "@medusajs/framework/utils"
import SettingsModuleService from "./service"

/**
 * Container key of the shop's settings module. Not `settings`: that key is the
 * kernel's own settings module (admin layouts and preferences).
 */
export const SETTINGS_MODULE = "shopSettings"

export default Module(SETTINGS_MODULE, {
  service: SettingsModuleService,
})

export type { default as SettingsModuleService } from "./service"
