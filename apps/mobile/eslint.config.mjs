import { defineConfig, globalIgnores } from "eslint/config"
import expo from "eslint-config-expo/flat.js"

const AD2 = "UI code reads data only through @shop/api-client (AD-2)"

export default defineConfig([
  ...expo,
  {
    rules: {
      // AD-2: the app never talks to the kernel itself, so no kernel package may be imported here.
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@medusajs/*", "@medusajs/**"], message: AD2 }] },
      ],
    },
  },
  globalIgnores(["dist/**", ".expo/**", "node_modules/**", "expo-env.d.ts"]),
])
