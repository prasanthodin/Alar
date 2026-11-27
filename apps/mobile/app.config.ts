import type { ConfigContext, ExpoConfig } from "expo/config"

// The product name is configuration (NFR-12): every name below comes from the environment,
// with neutral defaults. Nothing here names the shop.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_PUBLIC_STORE_NAME?.trim() || "Shop",
  slug: process.env.APP_SLUG?.trim() || "shop",
  scheme: process.env.APP_SCHEME?.trim() || "shop",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  android: {
    package: process.env.ANDROID_PACKAGE?.trim() || "com.example.shop",
  },
  web: {
    output: "single",
    bundler: "metro",
  },
  plugins: ["expo-router", "expo-font"],
})
