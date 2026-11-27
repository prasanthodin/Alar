// Design tokens from DESIGN.md (frontmatter), as plain constants.
// DESIGN.md is the source of truth; change it first, then this file.

export const colors = {
  primary: "#6F52F0",
  "primary-pressed": "#5B3FD6",
  "on-primary": "#FFFFFF",
  "primary-text": "#5B3FD6",
  "tint-1": "#F6F3FF",
  "tint-2": "#EDE8FF",
  "tint-3": "#DCD3FF",
  "tint-4": "#BFB1FF",
  background: "#FBFAFF",
  surface: "#FFFFFF",
  "surface-disabled": "#F6F5FA",
  "photo-ground": "#F3F3F6",
  text: "#1B1530",
  "text-muted": "#6B6680",
  placeholder: "#77728C",
  border: "#E7E3F5",
  "border-control": "#8F88B0",
  "focus-ring": "#6F52F0",
  success: "#14694A",
  "success-tint": "#E3F4EC",
  warning: "#8F4A00",
  "warning-tint": "#FFF1DC",
  danger: "#B3261E",
  "danger-tint": "#FCE8E6",
  "danger-line": "#F3C7C3",
  "neutral-tint": "#F1F0F5",
  "rating-star": "#F2A90D",
  "rating-star-empty": "#E3E0EE",
  scrim: "#1B15308C",
  "photo-scrim": "#140C0AC7",
  "glass-fill": "#FFFFFFCC",
  "glass-line": "#E7E3F5F2",
} as const

export const fontFamilies = {
  heading: "Plus Jakarta Sans",
  body: "Inter",
  mono: "ui-monospace",
} as const

type TypeStyle = {
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  /** em */
  letterSpacing?: number
  uppercase?: boolean
}

const H = fontFamilies.heading
const B = fontFamilies.body

/** Type scale. Sizes and line heights in px. */
export const typography = {
  "display-web": { fontFamily: H, fontSize: 40, fontWeight: 800, lineHeight: 46, letterSpacing: -0.02 },
  h1: { fontFamily: H, fontSize: 24, fontWeight: 800, lineHeight: 30, letterSpacing: -0.02 },
  h2: { fontFamily: H, fontSize: 20, fontWeight: 800, lineHeight: 26, letterSpacing: -0.01 },
  h3: { fontFamily: H, fontSize: 16, fontWeight: 700, lineHeight: 22, letterSpacing: 0 },
  h4: { fontFamily: H, fontSize: 14, fontWeight: 700, lineHeight: 20, letterSpacing: 0 },
  "price-lg": { fontFamily: H, fontSize: 18, fontWeight: 800, lineHeight: 24 },
  price: { fontFamily: H, fontSize: 14, fontWeight: 800, lineHeight: 20 },
  body: { fontFamily: B, fontSize: 14, fontWeight: 400, lineHeight: 20 },
  "body-strong": { fontFamily: B, fontSize: 14, fontWeight: 700, lineHeight: 20 },
  "body-sm": { fontFamily: B, fontSize: 13, fontWeight: 400, lineHeight: 18 },
  caption: { fontFamily: B, fontSize: 12, fontWeight: 400, lineHeight: 16 },
  label: { fontFamily: B, fontSize: 11, fontWeight: 600, lineHeight: 14 },
  overline: { fontFamily: B, fontSize: 11, fontWeight: 700, lineHeight: 14, letterSpacing: 0.04, uppercase: true },
  button: { fontFamily: B, fontSize: 14, fontWeight: 700, lineHeight: 20 },
  "field-web": { fontFamily: B, fontSize: 16, fontWeight: 400, lineHeight: 22 },
  mono: { fontFamily: fontFamilies.mono, fontSize: 12, fontWeight: 400, lineHeight: 20 },
} as const satisfies Record<string, TypeStyle>

/** Corner radii in px. `device` is an artboard value only and is left out. */
export const radii = {
  xs: 5,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 999,
} as const

/** Spacing steps in px. Only these are used. */
export const spacing = {
  "0": 0,
  "0.5": 2,
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "12": 48,
  "gutter-phone": 16,
  "gutter-web": 48,
  "gutter-admin": 24,
  "grid-gap-phone": 12,
  "grid-gap-web": 20,
  "card-pad": 12,
  "card-pad-lg": 16,
  "section-gap-phone": 16,
  "section-gap-web": 32,
  "content-max-web": 1344,
  "touch-min": 44,
  "focus-width": 2,
  "focus-offset": 2,
} as const

/** Component sizes in px. */
export const sizes = {
  button: 40,
  "button-lg-web": 44,
  "button-sm": 32,
  "button-admin": 36,
  field: 44,
  "field-admin": 36,
  search: 40,
  chip: 32,
  "status-chip": 22,
  "action-tile": 44,
  "top-bar": 56,
  "bottom-nav": 56,
  toggle: 20,
  stepper: 28,
  "form-card-web": 400,
  "content-max-web": 1344,
} as const

const px = (n: number) => `${n}px`
const mapPx = <T extends Record<string, number>>(o: T) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, px(v)])) as { [K in keyof T]: string }

/**
 * A Tailwind `theme` built from the tokens. It replaces (not extends) colours,
 * radii, spacing, font sizes and shadows, so only token values exist as utilities.
 * `boxShadow` holds only `none`: the design has no shadows.
 */
export const tailwindTheme = {
  colors: { transparent: "transparent", current: "currentColor", ...colors },
  fontFamily: {
    heading: [`"${fontFamilies.heading}"`, "ui-sans-serif", "system-ui", "sans-serif"],
    sans: [`"${fontFamilies.body}"`, "ui-sans-serif", "system-ui", "sans-serif"],
    mono: [fontFamilies.mono, "SFMono-Regular", "Menlo", "monospace"],
  },
  fontSize: Object.fromEntries(
    Object.entries(typography).map(([name, s]) => {
      const t: TypeStyle = s
      return [
        name,
        [
          px(t.fontSize),
          {
            lineHeight: px(t.lineHeight),
            fontWeight: String(t.fontWeight),
            ...(t.letterSpacing ? { letterSpacing: `${t.letterSpacing}em` } : {}),
          },
        ],
      ]
    })
  ) as unknown as Record<keyof typeof typography, [string, Record<string, string>]>,
  borderRadius: { none: "0px", ...mapPx(radii) },
  spacing: { px: "1px", ...mapPx(spacing) },
  boxShadow: { none: "none" },
  dropShadow: { none: "0 0 #0000" },
  extend: {
    height: mapPx(sizes),
    minHeight: mapPx(sizes),
    width: mapPx(sizes),
    maxWidth: mapPx(sizes),
  },
} as const
