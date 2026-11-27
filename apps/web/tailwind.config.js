// Theme values come only from @shop/tokens (DESIGN.md). Tailwind loads this
// file through jiti, which also compiles the TypeScript token package.
const { tailwindTheme } = require("@shop/tokens")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: tailwindTheme,
  plugins: [],
}
