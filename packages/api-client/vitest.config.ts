import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Load the kernel SDK as plain Node modules instead of transforming it.
    server: { deps: { external: [/@medusajs\/js-sdk/] } },
  },
})
