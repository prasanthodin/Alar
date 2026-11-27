import { defineConfig } from "vitest/config"

// Plain unit tests (`*.test.ts`). Jest still runs the kernel's `*.unit.spec.ts`
// and integration suites.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
})
