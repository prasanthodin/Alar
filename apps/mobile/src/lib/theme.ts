import { colors, radii, sizes, spacing, typography } from "@shop/tokens"
import type { TextStyle } from "react-native"

export { colors, radii, sizes, spacing }

/** Font files loaded at start-up, keyed by the family name React Native uses. */
export const fontFamilies = {
  heading700: "PlusJakartaSans_700Bold",
  heading800: "PlusJakartaSans_800ExtraBold",
  body400: "Inter_400Regular",
  body500: "Inter_500Medium",
  body600: "Inter_600SemiBold",
  body700: "Inter_700Bold",
} as const

type Role = keyof typeof typography

function familyFor(family: string, weight: number): string {
  if (family === "Plus Jakarta Sans") return weight >= 800 ? fontFamilies.heading800 : fontFamilies.heading700
  if (weight >= 700) return fontFamilies.body700
  if (weight >= 600) return fontFamilies.body600
  if (weight >= 500) return fontFamilies.body500
  return fontFamilies.body400
}

/**
 * A React Native text style for a type role from DESIGN.md. Each weight is its own font file,
 * so the weight is chosen through the family; `weight` overrides the role's weight.
 */
export function font(role: Role, weight?: number): TextStyle {
  const s = typography[role] as {
    fontFamily: string
    fontSize: number
    fontWeight: number
    lineHeight: number
    letterSpacing?: number
    uppercase?: boolean
  }
  return {
    fontFamily: familyFor(s.fontFamily, weight ?? s.fontWeight),
    fontSize: s.fontSize,
    lineHeight: s.lineHeight,
    ...(s.letterSpacing ? { letterSpacing: s.letterSpacing * s.fontSize } : {}),
    ...(s.uppercase ? { textTransform: "uppercase" as const } : {}),
    color: colors.text,
  }
}

/** Space kept free at the bottom of tab screens for the floating navigation. */
export const FLOATING_NAV_CLEARANCE = sizes["bottom-nav"] + spacing["3"] + spacing["6"]
