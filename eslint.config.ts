import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"

export default defineConfig([
  ...medusa.configs.recommended,
  {
    // Shared packages are not kernel code: they pin zod 4.6.7 directly (AD-19).
    files: ["packages/**"],
    // MedusaError lives in the kernel framework, which shared packages must not import.
    rules: {
      "@medusajs/zod-import-source": "off",
      "@medusajs/use-medusa-error-not-generic-error": "off",
    },
  },
])
