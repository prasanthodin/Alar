import { defineConfig } from "vitest/config"

// Unit tests cover the pure modules only (no React Native runtime).
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
})
