import Constants from "expo-constants"
import { Platform } from "react-native"
import { t } from "./i18n"
import { resolveMockAssetBaseUrl, resolveStoreName } from "./settings"

// EXPO_PUBLIC_* values are inlined at build time; each must be read as a plain member access.
export const storeName = resolveStoreName(process.env.EXPO_PUBLIC_STORE_NAME, t("brand.defaultName"))

export const mockAssetBaseUrl = resolveMockAssetBaseUrl({
  envValue: process.env.EXPO_PUBLIC_MOCK_ASSET_BASE_URL,
  platform: Platform.OS,
  hostUri: Constants.expoConfig?.hostUri,
})

export const appVersion = Constants.expoConfig?.version ?? "0.0.0"
