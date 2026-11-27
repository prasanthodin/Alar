---
name: Alar
description: Visual identity for a handwoven-saree shop on the web (Next.js, Tailwind CSS 4, shadcn) and Android (Expo / React Native). Deep lavender on quiet surfaces, no shadows, glass only on navigation, product photos on neutral.
status: draft
created: '2026-11-27'
updated: '2026-11-27'
sources:
  - ../../prds/prd-saree-commerce-2026-11-27/prd.md
  - ../../architecture/architecture-saree-commerce-2026-11-27/ARCHITECTURE-SPINE.md
  - ../../research/ux-direction-2026-11-27/digest.md
  - ./.memlog.md
colors:
  # Direction A "Wisteria" (hue 295). Hex is the sRGB fallback of the OKLCH
  # value given in the Colors section. Light first, then the -dark set.
  primary: '#6441A9'
  primary-hover: '#563199'
  primary-pressed: '#482584'
  on-primary: '#FFFFFF'
  primary-tint-1: '#F4F1FF'
  primary-tint-2: '#EBE6FE'
  primary-tint-3: '#DDD4FE'
  background: '#FCFBFE'
  surface: '#FFFFFF'
  surface-raised: '#F7F6FD'
  photo-surface: '#F3F3F3'
  border-hairline: '#DEDCE7'
  border-strong: '#87829C'
  text: '#1C1827'
  text-muted: '#5E5B6D'
  focus-ring: '#6441A9'
  success: '#0B7643'
  success-tint: '#E1F7E7'
  warning: '#915C08'
  warning-tint: '#FDEFD2'
  danger: '#B32228'
  danger-tint: '#FEEBE9'
  info: '#1F689D'
  info-tint: '#E4F2FF'
  scrim: '#1C182773'            # text colour at 45% alpha, behind sheets and dialogs
  glass-fill: '#FFFFFFD9'       # surface at 85% alpha, used only with blur
  ai-label-fill: '#1C1827'
  ai-label-text: '#FFFFFF'
  primary-dark: '#B7A1F5'
  primary-hover-dark: '#C5B4FB'
  primary-pressed-dark: '#A48FE1'
  on-primary-dark: '#130D21'
  primary-tint-1-dark: '#231E31'
  primary-tint-2-dark: '#302844'
  primary-tint-3-dark: '#433861'
  background-dark: '#0E0C12'
  surface-dark: '#15141B'
  surface-raised-dark: '#1F1C27'
  photo-surface-dark: '#1F1F1F'
  border-hairline-dark: '#312E3A'
  border-strong-dark: '#817C96'
  text-dark: '#EFEDF3'
  text-muted-dark: '#ABA8B9'
  focus-ring-dark: '#C5B4FB'
  success-dark: '#6CD092'
  success-tint-dark: '#152C1E'
  warning-dark: '#EDBB64'
  warning-tint-dark: '#332710'
  danger-dark: '#F98F87'
  danger-tint-dark: '#3B1C1A'
  info-dark: '#7FBEF3'
  info-tint-dark: '#152839'
  scrim-dark: '#00000099'       # black at 60% alpha
  glass-fill-dark: '#15141BD9'  # surface-dark at 85% alpha
  ai-label-fill-dark: '#EFEDF3'
  ai-label-text-dark: '#130D21'
typography:
  # Base tokens are the phone values (below 1024px). A "-web" token is the
  # value from 1024px up; a role with no "-web" token is the same everywhere.
  display:
    fontFamily: 'Anek Latin'
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  display-web:
    fontFamily: 'Anek Latin'
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 54px
    letterSpacing: -0.02em
  h1:
    fontFamily: 'Anek Latin'
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  h1-web:
    fontFamily: 'Anek Latin'
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 42px
    letterSpacing: -0.02em
  h2:
    fontFamily: 'Anek Latin'
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h2-web:
    fontFamily: 'Anek Latin'
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  h3:
    fontFamily: 'Anek Latin'
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  h3-web:
    fontFamily: 'Anek Latin'
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: 'Noto Sans'
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg-web:
    fontFamily: 'Noto Sans'
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body:
    fontFamily: 'Noto Sans'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: 'Noto Sans'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label:
    fontFamily: 'Noto Sans'
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: 'Noto Sans'
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  caption:
    fontFamily: 'Noto Sans'
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  price:
    fontFamily: 'Noto Sans'
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  price-lg:
    fontFamily: 'Noto Sans'
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  price-lg-web:
    fontFamily: 'Noto Sans'
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  DEFAULT: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  '0': 0px
  '0.5': 2px
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
  '20': 80px
  gutter-mobile: 16px
  gutter-tablet: 24px
  gutter-desktop: 32px
  grid-gap-mobile: 12px
  grid-gap-tablet: 16px
  grid-gap-desktop: 24px
  section-gap-mobile: 32px
  section-gap-desktop: 64px
  content-max: 1200px
  text-max: 65ch
  touch-min: 48px
  target-gap-min: 8px
  hairline: 1px
  focus-width: 2px
  focus-offset: 2px
components:
  button-primary:
    background: '{colors.primary}'
    background-hover: '{colors.primary-hover}'
    background-pressed: '{colors.primary-pressed}'
    foreground: '{colors.on-primary}'
    radius: '{rounded.full}'
    typography: '{typography.label-lg}'
    height: 48px
    padding-x: '{spacing.6}'
  button-secondary:
    background: '{colors.primary-tint-2}'
    background-hover: '{colors.primary-tint-3}'
    foreground: '{colors.primary}'
    radius: '{rounded.full}'
    typography: '{typography.label-lg}'
    height: 48px
  button-outline:
    background: 'transparent'
    border: '1px solid {colors.border-strong}'
    foreground: '{colors.primary}'
    radius: '{rounded.full}'
    height: 48px
  button-ghost:
    background: 'transparent'
    background-hover: '{colors.primary-tint-1}'
    foreground: '{colors.primary}'
    radius: '{rounded.full}'
  button-danger:
    background: '{colors.danger}'
    foreground: '{colors.on-primary}'
    radius: '{rounded.full}'
  button-size-sm:
    height: 36px
    padding-x: '{spacing.4}'
    typography: '{typography.label}'
  button-size-md:
    height: 48px
    padding-x: '{spacing.6}'
    typography: '{typography.label-lg}'
  button-size-lg:
    height: 56px
    padding-x: '{spacing.8}'
    typography: '{typography.label-lg}'
  text-field:
    background: '{colors.surface}'
    border: '1px solid {colors.border-strong}'
    border-focus: '2px solid {colors.primary}'
    border-error: '2px solid {colors.danger}'
    foreground: '{colors.text}'
    placeholder: '{colors.text-muted}'
    radius: '{rounded.md}'
    height: 48px
    padding-x: '{spacing.4}'
    typography: '{typography.body}'
  chip:
    background: '{colors.surface}'
    border: '1px solid {colors.border-strong}'
    foreground: '{colors.text}'
    background-selected: '{colors.primary-tint-2}'
    border-selected: '1px solid {colors.primary}'
    foreground-selected: '{colors.primary}'
    radius: '{rounded.full}'
    height: 36px
    padding-x: '{spacing.3}'
    typography: '{typography.label}'
  design-card:
    image-background: '{colors.photo-surface}'
    image-radius: '{rounded.sm}'
    image-ratio: '3 / 4'
    gap: '{spacing.2}'
    name-typography: '{typography.body-sm}'
    weaver-typography: '{typography.caption}'
    weaver-color: '{colors.text-muted}'
    price-typography: '{typography.price}'
  price-display:
    foreground: '{colors.text}'
    typography: '{typography.price}'
    typography-large: '{typography.price-lg}'
    prior-price-color: '{colors.text-muted}'
    prior-price-typography: '{typography.body-sm}'
  weaver-badge:
    background: '{colors.primary-tint-1}'
    foreground: '{colors.text}'
    place-color: '{colors.text-muted}'
    radius: '{rounded.full}'
    avatar-size: 32px
    height: 48px
    padding-x: '{spacing.3}'
  banner:
    background: '{colors.primary-tint-2}'
    foreground: '{colors.text}'
    radius: '{rounded.lg}'
    padding: '{spacing.6}'
    title-typography: '{typography.h2}'
  row-of-designs:
    card-width-mobile: 152px
    card-width-desktop: 264px
    gap: '{spacing.grid-gap-mobile}'
    peek: 24px
    title-typography: '{typography.h2}'
  grid-of-designs:
    columns-mobile: 2
    columns-tablet: 3
    columns-desktop: 4
    column-gap: '{spacing.grid-gap-mobile}'
    row-gap: '{spacing.6}'
  weaver-story:
    background: '{colors.surface-raised}'
    radius: '{rounded.lg}'
    padding: '{spacing.6}'
    title-typography: '{typography.h3}'
  text-block:
    typography: '{typography.body}'
    max-width: '{spacing.text-max}'
  image-block:
    background: '{colors.photo-surface}'
    radius: '{rounded.sm}'
  bottom-navigation-bar:
    background-glass: '{colors.glass-fill}'
    background-solid: '{colors.surface}'
    border-top: '1px solid {colors.border-hairline}'
    height: 64px
    icon-size: 24px
    foreground: '{colors.text-muted}'
    foreground-active: '{colors.primary}'
    active-pill: '{colors.primary-tint-2}'
    typography: '{typography.caption}'
  top-bar:
    background-glass: '{colors.glass-fill}'
    background-solid: '{colors.surface}'
    border-bottom: '1px solid {colors.border-hairline}'
    height: 56px
    height-desktop: 72px
    title-typography: '{typography.h3}'
  sticky-add-to-cart-bar:
    background-glass: '{colors.glass-fill}'
    background-solid: '{colors.surface}'
    border-top: '1px solid {colors.border-hairline}'
    padding: '{spacing.3}'
    button: '{components.button-size-md}'
  sheet:
    background: '{colors.surface}'
    border: '1px solid {colors.border-hairline}'
    radius-top: '{rounded.xl}'
    scrim: '{colors.scrim}'
    padding: '{spacing.6}'
    handle-color: '{colors.border-strong}'
  dialog:
    background: '{colors.surface}'
    border: '1px solid {colors.border-hairline}'
    radius: '{rounded.lg}'
    scrim: '{colors.scrim}'
    padding: '{spacing.6}'
    max-width: 480px
  toast:
    background: '{colors.text}'
    foreground: '{colors.background}'
    radius: '{rounded.md}'
    padding: '{spacing.4}'
    typography: '{typography.body-sm}'
  badge:
    background: '{colors.primary-tint-2}'
    foreground: '{colors.primary}'
    radius: '{rounded.xs}'
    height: 24px
    padding-x: '{spacing.2}'
    typography: '{typography.caption}'
  skeleton:
    background: '{colors.surface-raised}'
    background-image-area: '{colors.photo-surface}'
    radius: '{rounded.sm}'
  ai-generated-label:
    background: '{colors.ai-label-fill}'
    foreground: '{colors.ai-label-text}'
    radius: '{rounded.xs}'
    height: 24px
    padding-x: '{spacing.2}'
    inset: '{spacing.2}'
    typography: '{typography.caption}'
  try-on-result-frame:
    background: '{colors.photo-surface}'
    border: '1px solid {colors.border-strong}'
    radius: '{rounded.sm}'
    caption-color: '{colors.text-muted}'
    caption-typography: '{typography.body-sm}'
  consent-screen:
    background: '{colors.background}'
    item-background: '{colors.surface-raised}'
    item-radius: '{rounded.md}'
    title-typography: '{typography.h1}'
    body-typography: '{typography.body}'
    max-width: 560px
  empty-state:
    icon-color: '{colors.primary}'
    icon-background: '{colors.primary-tint-2}'
    title-typography: '{typography.h3}'
    body-color: '{colors.text-muted}'
    padding-y: '{spacing.12}'
  filter-panel:
    background: '{colors.surface}'
    group-title-typography: '{typography.label}'
    count-color: '{colors.text-muted}'
    footer-border: '1px solid {colors.border-hairline}'
  search-field:
    background: '{colors.surface-raised}'
    border: '1px solid {colors.border-hairline}'
    radius: '{rounded.full}'
    height: 48px
  design-gallery:
    background: '{colors.photo-surface}'
    image-ratio: '3 / 4'
    thumbnail-size: 56px
    thumbnail-radius: '{rounded.xs}'
    thumbnail-border-active: '2px solid {colors.primary}'
  full-saree-viewer:
    background: '{colors.photo-surface}'
    control-background: '{colors.surface}'
    control-border: '1px solid {colors.border-strong}'
    control-size: 48px
  cart-line:
    image-width: 72px
    image-radius: '{rounded.sm}'
    divider: '1px solid {colors.border-hairline}'
    padding-y: '{spacing.4}'
  quantity-stepper:
    border: '1px solid {colors.border-strong}'
    radius: '{rounded.full}'
    height: 40px
    typography: '{typography.label-lg}'
  pincode-delivery-check:
    background: '{colors.surface-raised}'
    radius: '{rounded.md}'
    padding: '{spacing.4}'
  hold-countdown:
    background: '{colors.info-tint}'
    foreground: '{colors.text}'
    foreground-ending: '{colors.warning}'
    radius: '{rounded.md}'
    padding: '{spacing.3}'
    typography: '{typography.body-sm}'
  payment-status:
    icon-size: 48px
    success-color: '{colors.success}'
    pending-color: '{colors.info}'
    failed-color: '{colors.danger}'
    title-typography: '{typography.h2}'
  order-timeline:
    dot-size: 12px
    dot-done: '{colors.primary}'
    dot-current: '{colors.primary}'
    dot-upcoming: '{colors.border-strong}'
    line: '2px solid {colors.border-hairline}'
    line-done: '2px solid {colors.primary}'
    typography: '{typography.body}'
  return-request-form:
    option-border: '1px solid {colors.border-strong}'
    option-border-selected: '2px solid {colors.primary}'
    option-radius: '{rounded.md}'
  rating-prompt:
    background: '{colors.surface-raised}'
    radius: '{rounded.lg}'
    option-size: 48px
    option-selected: '{colors.primary}'
  photo-guidance:
    background: '{colors.surface-raised}'
    radius: '{rounded.lg}'
    good-color: '{colors.success}'
    avoid-color: '{colors.danger}'
  try-on-progress:
    track: '{colors.primary-tint-2}'
    fill: '{colors.primary}'
    height: 4px
    radius: '{rounded.full}'
  inline-notice:
    background-info: '{colors.info-tint}'
    background-warning: '{colors.warning-tint}'
    background-danger: '{colors.danger-tint}'
    background-success: '{colors.success-tint}'
    foreground: '{colors.text}'
    radius: '{rounded.md}'
    padding: '{spacing.4}'
  update-required-screen:
    background: '{colors.background}'
    title-typography: '{typography.h1}'
  motion:
    # The spec has no motion key; motion tokens live here as a component entry.
    duration-press: 120ms
    duration-fast: 160ms
    duration-base: 220ms
    duration-sheet: 300ms
    duration-skeleton: 1200ms
    ease-out: 'cubic-bezier(0.23, 1, 0.32, 1)'
    ease-in-out: 'cubic-bezier(0.77, 0, 0.175, 1)'
    ease-sheet: 'cubic-bezier(0.32, 0.72, 0, 1)'
    spring-settle: '{ duration: 400, dampingRatio: 1 }'
    spring-snap: '{ duration: 400, dampingRatio: 0.8 }'
    spring-sheet: '{ duration: 300, dampingRatio: 0.8 }'
    press-scale: 0.97
    enter-scale: 0.96
    reduced-duration: 120ms
  glass:
    fill: '{colors.glass-fill}'
    blur: 16px
    border: '1px solid {colors.border-hairline}'
    fallback: '{colors.surface}'
---

# Alar — Design Spine

> Draft on the Fast path. Lines tagged `[ASSUMPTION]` were chosen here and are open to correction. This file owns how Alar looks; `EXPERIENCE.md` owns how it behaves. Both win over any mock.

## Brand & Style

Alar sells sarees woven by named families. The interface is a quiet shop wall: the saree and its Weaver are the centre of every screen, and the interface stays behind them. PRD §7a binds this file twice: the saree and Weaver come first, and nothing here may make a saree look better than it is.

That gives the system its character:

- **Deep lavender, used with restraint.** One brand hue. A deep lavender carries actions and links; pale lavender tints carry selected states and quiet panels. Lavender never sits behind a product photo.
- **Flat, by rule.** There is no shadow anywhere, on web or app. Depth comes from three things only: a small step in surface tint, a 1px border, and a scrim behind overlays.
- **Glass only on chrome.** A translucent blurred material appears on the top bar, the bottom navigation bar and the floating purchase bar. It is never a page background, a card, or a layer resting over a saree photo.
- **Photographs as they are.** Product photos sit on a neutral grey with no colour in it. No filters, no overlays, no gradient fades, no tinted frames. Corners are barely rounded so the border and pallu are not cropped.
- **Distinctive through type and shape.** Anek headings give a voice that carries across Latin and the four South Indian scripts; pill-shaped controls beside nearly square photos make the controls read as controls and the photos as cloth.
- **Small, purposeful motion.** Press feedback, sheets, and state changes move briefly. Nothing moves by itself: no auto-rotating carousels, no looping decoration.

The system extends shadcn (web) and react-native-reusables (app). Their structure and behaviour are inherited; this file overrides colour, type, radius, the removal of every shadow, and the components listed below.

Trade-off noted: the research found Apple and Google both moving towards glass and expressive depth; the founder has decided on no shadows and glass on navigation only, so this system follows the founder and takes from the platforms only tonal surfaces and borders.

## Colors

Drafted on **direction A, "Wisteria"** (primary `oklch(0.47 0.16 295)`) until the founder chooses between A, B and C `[ASSUMPTION]`. Tokens are authored in OKLCH, as shadcn does; the hex in the frontmatter is the sRGB fallback. Where the OKLCH chroma fell just outside sRGB, the chroma shown below is the reduced, in-gamut value.

### Light

| Role | Token | OKLCH | Hex | Used for | Not used for |
|---|---|---|---|---|---|
| Primary | `{colors.primary}` | `oklch(0.47 0.16 295)` | `#6441A9` | Primary buttons, links, active navigation, selected borders, progress | Large fills, page backgrounds, anything behind a photo |
| Primary hover | `{colors.primary-hover}` | `oklch(0.42 0.16 295)` | `#563199` | Hover on primary (pointer devices only) | — |
| Primary pressed | `{colors.primary-pressed}` | `oklch(0.37 0.15 295)` | `#482584` | Pressed primary | — |
| On primary | `{colors.on-primary}` | `oklch(1 0 0)` | `#FFFFFF` | Text and icons on primary and on danger fills | — |
| Tint 1 | `{colors.primary-tint-1}` | `oklch(0.965 0.018 295)` | `#F4F1FF` | Ghost-button hover, Weaver badge, quiet highlights | Photo surrounds |
| Tint 2 | `{colors.primary-tint-2}` | `oklch(0.935 0.033 295)` | `#EBE6FE` | Selected chips, secondary buttons, banners, active tab pill | Photo surrounds |
| Tint 3 | `{colors.primary-tint-3}` | `oklch(0.89 0.058 295)` | `#DDD4FE` | Hover or pressed on tint 2 | Text backgrounds for muted text |
| Page background | `{colors.background}` | `oklch(0.99 0.004 295)` | `#FCFBFE` | The page | — |
| Surface | `{colors.surface}` | `oklch(1 0 0)` | `#FFFFFF` | Sheets, dialogs, fields, solid bars | — |
| Surface raised | `{colors.surface-raised}` | `oklch(0.975 0.010 295)` | `#F7F6FD` | Panels that must read as a step above the page: Weaver story, delivery check, rating prompt | Photo surrounds |
| Photo surface | `{colors.photo-surface}` | `oklch(0.965 0 0)` | `#F3F3F3` | Behind and around every product photo, the Full saree view and the Try-on result | Anything else |
| Hairline border | `{colors.border-hairline}` | `oklch(0.90 0.015 295)` | `#DEDCE7` | Dividers and edges of bars, sheets and dialogs (decorative; not the only cue for a control) | Control boundaries |
| Strong border | `{colors.border-strong}` | `oklch(0.62 0.04 295)` | `#87829C` | The boundary of fields, chips, outline buttons, steppers | — |
| Text | `{colors.text}` | `oklch(0.22 0.03 295)` | `#1C1827` | Body and headings | — |
| Muted text | `{colors.text-muted}` | `oklch(0.48 0.03 295)` | `#5E5B6D` | Secondary text, placeholders, inactive tabs | Text on tint 3 |
| Focus ring | `{colors.focus-ring}` | `oklch(0.47 0.16 295)` | `#6441A9` | The 2px focus outline | — |
| Success / tint | `{colors.success}` / `{colors.success-tint}` | `oklch(0.50 0.12 155)` / `oklch(0.955 0.03 155)` | `#0B7643` / `#E1F7E7` | Payment confirmed, Delivered, refund started | Decoration |
| Warning / tint | `{colors.warning}` / `{colors.warning-tint}` | `oklch(0.52 0.11 70)` / `oklch(0.955 0.04 85)` | `#915C08` / `#FDEFD2` | Hold ending, payment pending too long, cart item changed | Urgency that is not real |
| Danger / tint | `{colors.danger}` / `{colors.danger-tint}` | `oklch(0.50 0.18 25)` / `oklch(0.955 0.021 25)` | `#B32228` / `#FEEBE9` | Errors, destructive actions (delete account, withdraw) | Prices, discounts, stock |
| Info / tint | `{colors.info}` / `{colors.info-tint}` | `oklch(0.50 0.11 245)` / `oklch(0.955 0.023 245)` | `#1F689D` / `#E4F2FF` | Neutral notices: the Hold, colour-on-screens note, offline | — |
| Scrim | `{colors.scrim}` | text at 45% alpha | `#1C182773` | Behind sheets and dialogs | Over photos as a styling device |
| Glass fill | `{colors.glass-fill}` | surface at 85% alpha | `#FFFFFFD9` | Only inside the glass material | Any surface without blur |
| AI label | `{colors.ai-label-fill}` / `{colors.ai-label-text}` | text / white | `#1C1827` / `#FFFFFF` | The "AI-generated" label | — |

Status colours were chosen at the same lightness as the primary (about L 0.50) and moderate chroma so that green, amber, red and blue sit beside lavender without one shouting; red is kept for errors and destructive actions only, which keeps it clear of the pressure-selling that NFR-13 forbids.

### Dark

Dark mode follows the system setting `[ASSUMPTION]`. In dark mode the primary becomes a light lavender with dark text on it, because a deep lavender cannot reach 3:1 against a dark page.

| Role | Token | OKLCH | Hex |
|---|---|---|---|
| Primary | `{colors.primary-dark}` | `oklch(0.76 0.12 295)` | `#B7A1F5` |
| Primary hover | `{colors.primary-hover-dark}` | `oklch(0.81 0.10 295)` | `#C5B4FB` |
| Primary pressed | `{colors.primary-pressed-dark}` | `oklch(0.70 0.12 295)` | `#A48FE1` |
| On primary | `{colors.on-primary-dark}` | `oklch(0.18 0.04 295)` | `#130D21` |
| Tint 1 / 2 / 3 | `{colors.primary-tint-1-dark}` / `{colors.primary-tint-2-dark}` / `{colors.primary-tint-3-dark}` | `oklch(0.25 0.035 295)` / `oklch(0.30 0.05 295)` / `oklch(0.37 0.07 295)` | `#231E31` / `#302844` / `#433861` |
| Page background | `{colors.background-dark}` | `oklch(0.16 0.012 295)` | `#0E0C12` |
| Surface | `{colors.surface-dark}` | `oklch(0.195 0.015 295)` | `#15141B` |
| Surface raised | `{colors.surface-raised-dark}` | `oklch(0.235 0.02 295)` | `#1F1C27` |
| Photo surface | `{colors.photo-surface-dark}` | `oklch(0.24 0 0)` | `#1F1F1F` |
| Hairline / strong border | `{colors.border-hairline-dark}` / `{colors.border-strong-dark}` | `oklch(0.31 0.02 295)` / `oklch(0.60 0.04 295)` | `#312E3A` / `#817C96` |
| Text / muted | `{colors.text-dark}` / `{colors.text-muted-dark}` | `oklch(0.95 0.008 295)` / `oklch(0.74 0.025 295)` | `#EFEDF3` / `#ABA8B9` |
| Focus ring | `{colors.focus-ring-dark}` | `oklch(0.81 0.10 295)` | `#C5B4FB` |
| Success / tint | `{colors.success-dark}` / `{colors.success-tint-dark}` | `oklch(0.78 0.13 155)` / `oklch(0.27 0.04 155)` | `#6CD092` / `#152C1E` |
| Warning / tint | `{colors.warning-dark}` / `{colors.warning-tint-dark}` | `oklch(0.82 0.12 80)` / `oklch(0.28 0.04 80)` | `#EDBB64` / `#332710` |
| Danger / tint | `{colors.danger-dark}` / `{colors.danger-tint-dark}` | `oklch(0.76 0.13 25)` / `oklch(0.27 0.05 25)` | `#F98F87` / `#3B1C1A` |
| Info / tint | `{colors.info-dark}` / `{colors.info-tint-dark}` | `oklch(0.78 0.10 245)` / `oklch(0.27 0.04 245)` | `#7FBEF3` / `#152839` |
| Scrim / glass fill | `{colors.scrim-dark}` / `{colors.glass-fill-dark}` | black at 60% / surface-dark at 85% | `#00000099` / `#15141BD9` |
| AI label | `{colors.ai-label-fill-dark}` / `{colors.ai-label-text-dark}` | text-dark / on-primary-dark | `#EFEDF3` / `#130D21` |

### Contrast (WCAG 2.2 AA)

Targets: 4.5:1 for text, 3:1 for large text, control boundaries and focus indicators. Ratios below were computed in this run from the hex values with the WCAG relative-luminance formula.

| Pairing | Light | Dark |
|---|---|---|
| On-primary text on primary | 7.31 | 8.52 |
| On-primary on primary hover / pressed | 9.15 / 11.21 | 10.20 / 6.86 |
| Primary (link, icon, focus ring) on page background | 7.10 | 8.73 |
| Primary on surface / surface raised | 7.31 / 6.81 | 8.22 / 7.52 |
| Primary on tint 1 / tint 2 / tint 3 | 6.57 / 6.02 / 5.20 | — / 6.23 / 4.77 |
| Primary on photo surface | 6.59 | — |
| Text on page background / surface / surface raised | 16.84 / 17.37 / 16.17 | 16.74 / — / 14.42 |
| Text on tint 2 / tint 3 / photo surface | 14.29 / 12.34 / 15.65 | — / 9.14 (tint 3) / — |
| Muted text on page background / surface / surface raised | 6.38 / 6.58 / 6.12 | 8.36 / 7.87 / 7.21 |
| Muted text on tint 1 / tint 2 / photo surface | 5.91 / 5.41 / 5.93 | — / 5.97 / 7.09 |
| Strong border on page background / surface / surface raised / tint 1 | 3.57 / 3.68 / 3.43 / 3.31 | 4.87 / — / 4.19 / — |
| Hairline border on surface (decorative, no target) | 1.36 | 1.47 |
| Success / warning / danger / info text on surface | 5.70 / 5.62 / 6.61 / 5.96 | 9.65 / 10.36 / 8.11 / 9.20 |
| Success / warning / danger / info text on its own tint | 5.06 / 4.94 / 5.75 / 5.23 | 7.85 / 8.27 / 6.81 / 7.57 |
| White text on danger fill | 6.61 | on-primary-dark on danger-dark: not computed; estimated above 7 |
| AI label text on AI label fill | 17.37 | estimated above 15 |
| Glass, worst case (85% fill over pure black in light, over pure white in dark, blur ignored): muted text / primary | estimated 4.8 / 5.2 | estimated 5.1 / above 5 |

Rules that follow from the table: muted text is not placed on tint 3; in dark mode, primary-coloured text on tint 3 is treated as large text only (4.77 passes, with little margin); the hairline border is never the only boundary of a control.

### Alternates B and C

Same roles, same lightness and chroma recipe, hue swapped. Neutral photo surface, white surface and all status colours are identical in all three directions. All pairings above were also computed for B and C and pass the same targets (on-primary on primary: B 7.73, C 7.92; muted text on tint 2: B 5.40, C 5.42; strong border on tint 1: B 3.32, C 3.32).

| Role | B "Heather" (hue 312) | C "Iris" (hue 280) |
|---|---|---|
| Primary | `oklch(0.46 0.15 312)` `#733893` | `oklch(0.45 0.17 280)` `#4841AF` |
| Primary hover / pressed | `#652983` / `#551D71` | `#3C319F` / `#31248A` |
| Tint 1 / 2 / 3 | `#F8F0FD` / `#F1E3FB` / `#E8D0F8` | `#F1F3FE` / `#E5E8FF` / `#D3D8FF` |
| Page background / surface raised | `#FDFBFE` / `#F9F5FC` | `#FBFBFE` / `#F5F6FE` |
| Hairline / strong border | `#E1DBE5` / `#8E8098` | `#DCDDE8` / `#81849E` |
| Text / muted text | `#1F1625` / `#63596A` | `#181928` / `#5A5C6F` |
| Dark primary / on-primary | `#CB9AE8` / `#170C1E` | `#A2A8FC` / `#0E0F23` |
| Dark background / surface / raised | `#0F0C11` / `#17131A` / `#211B25` | `#0C0D12` / `#13141C` / `#1C1D28` |
| Dark tints 1 / 2 / 3 | `#271D2E` / `#362640` / `#4C345A` | `#1E2032` / `#292B46` / `#393B64` |
| Dark text / muted | `#F0EDF2` / `#B0A7B7` | `#EDEEF4` / `#A7A9BB` |

Character: A is a blue-leaning violet, the most "lavender"; B leans mauve and warmer, closest to silk-shop tradition; C leans indigo and reads cooler and more technical.

## Typography

**Families** `[ASSUMPTION]`, all free under the SIL Open Font License, variable weight:

| Script | Headings (display, h1–h3) | Text (body, label, caption, price) |
|---|---|---|
| Latin | Anek Latin | Noto Sans |
| Tamil | Anek Tamil | Noto Sans Tamil |
| Telugu | Anek Telugu | Noto Sans Telugu |
| Kannada | Anek Kannada | Noto Sans Kannada |
| Malayalam | Anek Malayalam | Noto Sans Malayalam |

Anek gives one design across all five scripts and is the distinctive voice; Noto Sans is the conservative, legible text face. Only the files for the active language are loaded, plus Latin for numerals and brand words. Fallback stack: the platform's system font, which already covers every script. To verify before finalising: the licence of Noto Sans Kannada and Malayalam and Anek's Telugu coverage (the research saw neither at source), and Anek's legibility at 18px in Tamil on a mid-range Android phone.

**Scale.** One scale, eleven roles. Phone values apply below 1024px, web values from 1024px.

| Role | Phone size / line | Web size / line | Weight | Letter spacing | Used for |
|---|---|---|---|---|---|
| `display` | 32 / 38 | 48 / 54 | 600 | -0.02em | Campaign and banner headlines |
| `h1` | 26 / 32 | 36 / 42 | 600 | -0.015em phone, -0.02em web | Screen titles, Design name on the Design page |
| `h2` | 22 / 28 | 28 / 34 | 600 | -0.01em phone, -0.015em web | Section and Block titles |
| `h3` | 18 / 24 | 20 / 28 | 600 | 0 | Card and sheet titles, top bar title |
| `body-lg` | 17 / 26 | 18 / 28 | 400 | 0 | Weaver story, Design description |
| `body` | 16 / 24 | 16 / 24 | 400 | 0 | Default text, field text |
| `body-sm` | 14 / 20 | 14 / 20 | 400 | 0 | Design card name, secondary lines |
| `label-lg` | 16 / 24 | 16 / 24 | 600 | 0 | Button text |
| `label` | 14 / 20 | 14 / 20 | 600 | 0.01em | Chips, small buttons, field labels |
| `caption` | 12 / 16 | 12 / 16 | 500 | 0.01em | Weaver line on cards, tab labels, badges, the "AI-generated" label |
| `price` / `price-lg` | 16 / 24 · 24 / 30 | 16 / 24 · 28 / 34 | 600 | 0 · -0.01em | Prices in lists · the price on the Design page |

Rules:

- **Minimum sizes.** 12px is the smallest text anywhere. Anything a Shopper must read to decide or consent (price, attributes, terms, the Try-on consent notice) is 16px or larger. Text fields are 16px so mobile browsers do not zoom the page.
- **Weights.** 400, 500 and 600 only. No weights under 400.
- **Indic scripts.** No negative letter spacing and no uppercase styling; line height is raised by 10% and rounded up to a multiple of 2px (for example `body` 16 / 28) `[ASSUMPTION]`.
- **Numbers.** Prices, the Hold countdown, quantities and dates use tabular figures so digits do not jitter.
- **Line length.** Running text is capped at `{spacing.text-max}`.
- **Scaling.** Sizes are in rem on web and scale with the system font setting in the app. Layouts must hold at 200% text size.

## Layout & Spacing

**Base unit 4px**, matching Tailwind 4's `--spacing: 0.25rem`; step numbers are Tailwind's (step × 4px).

| Step | Value | Typical use |
|---|---|---|
| `{spacing.0.5}` | 2px | Focus offset, hairline adjustments |
| `{spacing.1}` | 4px | Icon to label, badge inner gap |
| `{spacing.2}` | 8px | Image to text in a Design card, between chips, minimum gap between touch targets |
| `{spacing.3}` | 12px | Inner padding of chips and small panels, grid gap on phones |
| `{spacing.4}` | 16px | Page gutter on phones, field padding, list row padding |
| `{spacing.5}` | 20px | Between a title and its content |
| `{spacing.6}` | 24px | Sheet, dialog and panel padding; row gap in grids |
| `{spacing.8}` | 32px | Between sections on phones |
| `{spacing.10}` | 40px | Above screen titles on web |
| `{spacing.12}` | 48px | Empty-state padding; touch target size |
| `{spacing.16}` | 64px | Between sections on web |
| `{spacing.20}` | 80px | Page top and bottom on web |

Only these steps are used; no arbitrary pixel values.

**Breakpoints and grid** (Tailwind 4 defaults; the app uses the phone row, and the tablet row on wide devices):

| Range | Name | Columns | Gutter | Column gap | Content width |
|---|---|---|---|---|---|
| under 640px | phone | 4 | `{spacing.gutter-mobile}` 16px | `{spacing.grid-gap-mobile}` 12px | full |
| 640–1023px | tablet (`sm`, `md`) | 8 | `{spacing.gutter-tablet}` 24px | `{spacing.grid-gap-tablet}` 16px | full |
| 1024px and up | desktop (`lg`, `xl`) | 12 | `{spacing.gutter-desktop}` 32px | `{spacing.grid-gap-desktop}` 24px | max `{spacing.content-max}` 1200px, centred |

**Product grid density** `[ASSUMPTION]`: 2 Designs per row on phones, 3 on tablet, 4 on desktop; never more than 4, so each saree stays large enough to judge. Photos in lists are 3:4 portrait. Row gap `{spacing.6}`. A Row of Designs shows about 2.2 cards on a phone so the next card is visibly cut off and invites a swipe.

**Vertical rhythm.** Sections are separated by `{spacing.section-gap-mobile}` on phones and `{spacing.section-gap-desktop}` on web. Inside a section: title, `{spacing.5}`, content.

**Touch targets.** Every interactive element has a hit area of at least `{spacing.touch-min}` (48px) square, with at least `{spacing.target-gap-min}` between neighbouring targets. Where the visible shape is smaller (a 36px chip, a 24px icon), the hit area is extended, not the shape.

**Safe areas.** Bars add the device's safe-area inset to their own height; content never sits under a notch or the gesture bar.

## Elevation & Depth

There is no shadow in Alar: no box shadow, drop shadow, text shadow, inner shadow, Android elevation, or glow. Depth has three levels and two materials.

| Level | What it is | How it is shown |
|---|---|---|
| 0 Page | The page | `{colors.background}` |
| 1 Raised panel | A panel that belongs to the page but stands apart | `{colors.surface-raised}`, no border; or `{colors.surface}` with a `{colors.border-hairline}` border |
| 2 Overlay | Sheet, dialog, menu, toast | `{colors.surface}` with a 1px `{colors.border-hairline}` border, over `{colors.scrim}` (the toast has no scrim and uses an inverted fill instead) |

Tint steps never stack more than two deep: a tinted panel inside a tinted panel is replaced by a hairline divider.

**Hairline borders.** 1px (`{spacing.hairline}`), `{colors.border-hairline}`. Used for dividers between list rows, and for the edges of bars, sheets, dialogs and menus. A control's boundary uses `{colors.border-strong}` instead, because it must reach 3:1.

**Glass.** One recipe (`{components.glass}`):

- Fill `{colors.glass-fill}` (surface at 85% alpha; `{colors.glass-fill-dark}` in dark mode).
- Backdrop blur 16px, no saturation boost and no colour tint, so cloth colours scrolling beneath are softened but not shifted or intensified.
- A 1px `{colors.border-hairline}` border on the edge that faces content.
- Text and icons on glass use `{colors.text}`, `{colors.text-muted}` or `{colors.primary}` and must still meet the contrast targets in the worst case.

| Glass is allowed on | Glass is forbidden on |
|---|---|
| Top bar (once content has scrolled under it) | Page backgrounds, cards, banners, sheets, dialogs, toasts |
| Bottom navigation bar | Any layer that rests over a saree photo, the Full saree view or a Try-on result |
| Sticky add-to-cart bar | Controls inside the Design gallery, the Full saree viewer and the Try-on result frame (these are solid) |

Because photos do scroll beneath the bars, the Design gallery is laid out to start below the top bar and end above the bottom bars; a photo passes under glass only while the Shopper is scrolling, never at rest `[ASSUMPTION]`.

**Solid fallback.** The glass bars become `{colors.surface}` at full opacity with the same hairline border when any of these is true:

- Web: the browser does not support `backdrop-filter` (tested with `@supports`), or the Shopper has asked for reduced transparency (`prefers-reduced-transparency: reduce`) or increased contrast (`prefers-contrast: more`).
- App: Android below 12, where blur is slow (the app uses `expo-blur` with `blurMethod="dimezisBlurViewSdk31Plus"`, which blurs only on Android 12 and later); or the system "reduce transparency" or high-contrast setting is on; or the device is flagged as low-end by a remote setting if testing on target phones shows dropped frames while scrolling `[ASSUMPTION]`.

The fallback is the default; glass is the enhancement. Every layout must look finished with solid bars.

Trade-off noted: the research's cheapest and safest option was no glass at all on Android and web; the founder has decided on glass for navigation and floating controls, so it ships as one blur layer per bar with the solid fallback above.

## Shapes

| Token | Value | Used for |
|---|---|---|
| `{rounded.none}` | 0 | Full-bleed photos in the Design gallery (phone), the Full saree viewer |
| `{rounded.xs}` | 4px | Badges, the "AI-generated" label, gallery thumbnails |
| `{rounded.sm}` | 8px | Every product photo that is not full-bleed; the Try-on result frame; skeletons |
| `{rounded.md}` | 12px | Text fields, toasts, inline notices, option rows |
| `{rounded.lg}` | 16px | Banners, Weaver story, panels, dialogs |
| `{rounded.xl}` | 24px | Top corners of sheets |
| `{rounded.full}` | 9999px | Buttons, chips, search field, Weaver badge, steppers, progress |

The logic: **controls are round, cloth is square.** Buttons and chips are pills, so anything tappable is recognisable by shape alone; photographs keep at most an 8px corner so the border and pallu at the edge of a photo are not cut away.

**Image corner rule.** A product photo is never clipped by more than `{rounded.sm}`, never masked into a circle or any other shape, and never shown at a ratio that crops the photo the Owner uploaded beyond the 3:4 list crop. Weaver portraits may be circular; sarees may not.

shadcn mapping: `--radius: 0.75rem` (12px), with the scale above overriding shadcn's derived steps.

## Components

Visual specs. Behaviour for every component here is in `EXPERIENCE.md` → Component Patterns under the same name. Unless a row says otherwise, components inherit shadcn / react-native-reusables structure with every shadow class removed.

**States shared by all interactive components**

- **Hover** (pointer devices only): one tint step darker; never a lift.
- **Pressed:** scale to `{components.motion.press-scale}` over `{components.motion.duration-press}`, plus the pressed colour.
- **Focus:** a 2px outline in `{colors.focus-ring}`, offset 2px (`{spacing.focus-width}`, `{spacing.focus-offset}`), drawn with CSS `outline`, never with a shadow or ring utility. On a primary button the 2px gap shows the page colour, so the outline stays visible. In the app, the same outline is drawn as a border on a wrapper view.
- **Disabled:** 40% opacity, no hover or press; a disabled control always has text nearby saying why.

| Component | Visual spec |
|---|---|
| **Button** | Pill (`{rounded.full}`). Variants: primary (`{components.button-primary}`: `{colors.primary}` fill, `{colors.on-primary}` text), secondary (`{colors.primary-tint-2}` fill, `{colors.primary}` text), outline (transparent, 1px `{colors.border-strong}`, `{colors.primary}` text), ghost (text only, `{colors.primary-tint-1}` on hover), danger (`{colors.danger}` fill, white text). Sizes: sm 36px high / `{spacing.4}` side padding / `label`; md 48px / `{spacing.6}` / `label-lg`; lg 56px / `{spacing.8}` / `label-lg`. Icon 20px with `{spacing.2}` gap. One primary button per screen region. Loading: label stays, a 16px spinner replaces the icon. |
| **Text field** | 48px high, `{rounded.md}`, `{colors.surface}` fill, 1px `{colors.border-strong}`. Label above in `label`; helper or error below in `body-sm`. Focus: border becomes 2px `{colors.primary}` plus the focus outline. Error: 2px `{colors.danger}` border, error text in `{colors.danger}` with an icon, never colour alone. Text 16px. One-time-code entry uses six 48px boxes with `{spacing.2}` gaps. |
| **Search field** | A Text field variant: pill, `{colors.surface-raised}` fill, 1px `{colors.border-hairline}`, 20px search icon left, clear button right. |
| **Chip** | 36px high pill (48px hit area), `label`. Unselected: `{colors.surface}`, 1px `{colors.border-strong}`, `{colors.text}`. Selected: `{colors.primary-tint-2}` fill, 1px `{colors.primary}` border, `{colors.primary}` text, and a 16px check icon so selection is not colour alone. A count, when shown, follows the label in `{colors.text-muted}`. |
| **Filter panel** | A column of groups (fibre, weave, colour, occasion, price, Weaver). Group title in `label`; options as Chips, or rows with a count in `{colors.text-muted}`. Colour options are a 20px swatch plus a name. A footer fixed to the bottom with a hairline top border holds "Clear all" (ghost) and "Show N Designs" (primary). Shown in a Sheet on phones and as a 280px left column on desktop. |
| **Design card** | No container, border or fill. Photo 3:4 on `{colors.photo-surface}`, `{rounded.sm}`. Below, with `{spacing.2}` gap: Design name (`body-sm`, 2 lines at most), Weaver name (`caption`, `{colors.text-muted}`), Price display. Stock state ("Sold out", "On hold right now") is a Badge **below** the photo; the photo is never dimmed, desaturated or overlaid. |
| **Price display** | Whole rupees, tax included: the rupee sign, a thin space, digits with Indian grouping (for example ₹ 3,450); never paise. `price` in lists, `price-lg` on the Design page, colour `{colors.text}` (not primary, not red). A discount shows the current price, then the lowest price of the previous 30 days struck through in `body-sm` `{colors.text-muted}`, with the words "Lowest price in 30 days" beside it. "Inclusive of all taxes" in `caption` on the Design page. No percentage-off burst. |
| **Weaver badge** | 48px pill, `{colors.primary-tint-1}` fill. A 32px circular Weaver portrait, then "Woven by" in `caption` `{colors.text-muted}` over the Weaver name in `label`, and the place in `caption`. A chevron shows it opens the Weaver page. Compact form on cards is the name alone in `caption`. |
| **Banner** | A Block. `{rounded.lg}`, `{colors.primary-tint-2}` fill, `{spacing.6}` padding; headline in `h2` (or `display` on campaign screens), up to two lines of `body`, one optional Button. If it carries a photo, the photo sits in its own area on `{colors.photo-surface}` beside or above the text; text is never laid over a saree photo. Full width within the gutters; height from content. |
| **Row of Designs** | A Block. Title in `h2` with an optional "See all" ghost button on the same line; below, a horizontally scrolling row of Design cards 152px wide on phones (264px on desktop), gap `{spacing.3}`, with the next card visibly cut off. On desktop, 48px round outline buttons for previous and next sit beside the title, never over the photos. No dots, no auto-advance. |
| **Grid of Designs** | A Block and the layout of search results. 2 / 3 / 4 columns by breakpoint, column gap by breakpoint, row gap `{spacing.6}`, optional title in `h2`. |
| **Weaver story** | A Block. `{colors.surface-raised}` panel, `{rounded.lg}`, `{spacing.6}` padding. Weaver portrait or loom photo on `{colors.photo-surface}` (`{rounded.sm}`), name in `h3`, place in `caption`, story in `body-lg` capped at `{spacing.text-max}`, a ghost button to the Weaver page. |
| **Text Block** | `body` text (headings allowed up to `h2`), capped at `{spacing.text-max}`. |
| **Image Block** | One image, `{rounded.sm}`, on `{colors.photo-surface}`, natural ratio, optional `caption` beneath. |
| **Top bar** | 56px (72px on desktop) plus the top safe area. Solid `{colors.background}` with no border while the page is at the top; once content scrolls beneath, the glass material with a hairline bottom border. Title in `h3`; 24px icons in 48px targets. On desktop it holds the logo, category links in `label-lg`, the Search field, and account and cart icons. |
| **Bottom navigation bar** | Phones and tablets only (app and mobile web). 64px plus the bottom safe area; glass with a hairline top border; four items `[ASSUMPTION]`: Home, Search, Cart, Account. Each item: 24px icon over a `caption` label; inactive `{colors.text-muted}`, active `{colors.primary}` with a 56 × 32px `{colors.primary-tint-2}` pill behind the icon. The cart count is a Badge at the icon's corner. |
| **Sticky add-to-cart bar** | A floating control on the Design page on phones. Glass, hairline top border, `{spacing.3}` padding, above the bottom safe area; it replaces the Bottom navigation bar on that screen. Left: Price display. Right: a primary Button, md. On desktop there is no bar; the button sits in the page beside the gallery. |
| **Sheet** | Rises from the bottom on phones; `{colors.surface}`, top corners `{rounded.xl}`, 1px hairline border, `{spacing.6}` padding, over `{colors.scrim}`. A 36 × 4px handle in `{colors.border-strong}` at the top. Maximum height 90% of the screen; content scrolls inside. On desktop the same content appears as a Dialog or a side panel. Never glass. |
| **Dialog** | Centred, at most 480px wide, `{colors.surface}`, `{rounded.lg}`, 1px hairline border, `{spacing.6}` padding, over `{colors.scrim}`. Title `h3`, body `body`, actions right-aligned (stacked full-width on phones) with the primary action last. |
| **Toast** | Inverted so it separates without a shadow: `{colors.text}` fill, `{colors.background}` text, `{rounded.md}`, `{spacing.4}` padding, `body-sm`, optional 20px icon and one ghost action. Bottom centre, above any bottom bar, at most 480px wide. Built on Sonner (web) with its shadow removed. |
| **Badge** | 24px high, `{rounded.xs}`, `caption`, `{spacing.2}` side padding. Neutral: `{colors.surface-raised}` fill with 1px hairline and `{colors.text}`. Brand: `{colors.primary-tint-2}` / `{colors.primary}`. Status: the status tint as fill and the status colour as text. Count badge on icons: 20px circle, `{colors.primary}` fill, white `caption` digits. |
| **Inline notice** | A full-width panel in the status tint with `{rounded.md}` and `{spacing.4}` padding: a 20px status icon, text in `{colors.text}` `body-sm`, and at most one ghost action. Four kinds: info, success, warning, danger. Used for cart changes, offline, limits reached, a blocked Try-on, and the colour-on-screens note. |
| **Skeleton** | Blocks in the exact size of what will load: photo areas in `{colors.photo-surface}`, text lines in `{colors.surface-raised}` (12px high, `{rounded.sm}`). Opacity pulses between 1 and 0.6 over `{components.motion.duration-skeleton}`; no moving shine. Static under reduced motion. |
| **Empty state** | Centred, `{spacing.12}` top and bottom. A 24px line icon in `{colors.primary}` on a 56px `{colors.primary-tint-2}` circle, a title in `h3`, one or two lines of `body` in `{colors.text-muted}`, and one Button. No illustration of a saree that is not a real Design. |
| **Design gallery** | On the Design page. Photos on `{colors.photo-surface}`, 3:4; full-bleed with `{rounded.none}` on phones, `{rounded.sm}` in a two-column grid on desktop. Beneath the main photo, a row of 56px thumbnails (`{rounded.xs}`, `{spacing.2}` gap); the current one has a 2px `{colors.primary}` border. The fabric close-up thumbnail carries a "Close-up" `caption`. Entry points to the Full saree view and Try-on are two secondary Buttons directly under the thumbnails, not over the photo. In the full-screen zoom, the background is `{colors.photo-surface}` and the close button is a solid 48px circle with a `{colors.border-strong}` border. |
| **Full saree viewer** | A full-screen fixed surface. Background `{colors.photo-surface}`; the saree image untouched. Solid 48px circular controls (`{colors.surface}`, 1px `{colors.border-strong}`): close, zoom in, zoom out, reset. A small position strip at the bottom shows which part of the saree is in view: a thumbnail of the whole saree with a 2px `{colors.primary}` rectangle. No glass, no captions over the cloth. |
| **Cart line** | A row: 72px-wide 3:4 photo (`{rounded.sm}`, `{colors.photo-surface}`), then Design name (`body`), Weaver (`caption`, muted), Price display, a Quantity stepper and a "Remove" ghost button. Rows are separated by a hairline; `{spacing.4}` vertical padding. A changed or sold-out line carries an Inline notice beneath it. |
| **Quantity stepper** | 40px high pill (48px hit areas), 1px `{colors.border-strong}`; minus, the number in `label-lg` tabular figures, plus. A disabled plus at the stock limit is explained by a `caption` line ("Only 2 Pieces left" only when that is true). |
| **Pincode delivery check** | A `{colors.surface-raised}` panel, `{rounded.md}`, `{spacing.4}` padding: a six-digit Text field with a "Check" secondary Button, then the result as a line of `body` with a status icon: delivers (success icon, earliest and latest date) or does not deliver (info icon, plain message). |
| **Hold countdown** | A calm panel in `{colors.info-tint}`, `{rounded.md}`, `{spacing.3}` padding, `body-sm` in `{colors.text}`: a clock icon, the sentence, and the time left in tabular figures. In the last two minutes the time alone turns `{colors.warning}` and gains a warning icon. It never flashes, pulses or turns red. |
| **Payment status** | A centred block: a 48px status icon (success `{colors.success}`, pending `{colors.info}` with a slow spinner, failed `{colors.danger}`), a title in `h2`, a sentence in `body`, the amount as a Price display, then one primary Button. |
| **Order timeline** | A vertical list of the Order's (or Return's) states. Each row: a 12px dot, the state name in `body`, date and time in `caption` muted. Done states: filled `{colors.primary}` dot and a 2px `{colors.primary}` line; current state: the same dot with a 4px `{colors.primary-tint-2}` border around it and the name in `label-lg`; upcoming: hollow dot in `{colors.border-strong}` and a `{colors.border-hairline}` line. Exception states (Delivery failed, Rejected, Cancelled) use the `{colors.danger}` dot and icon; Refunded uses `{colors.success}`. |
| **Return request form** | Reasons as full-width option rows (56px minimum, `{rounded.md}`, 1px `{colors.border-strong}`; selected: 2px `{colors.primary}` border, `{colors.primary-tint-1}` fill and a radio mark). Below: an optional comment Text field, the pickup address and date, a summary of the refund as a Price display, and a primary Button. |
| **Rating prompt** | A `{colors.surface-raised}` panel, `{rounded.lg}`: the question in `h3`, five 48px numbered circles (1 to 5) with end captions "Not at all" and "Exactly"; selected circle filled `{colors.primary}` with white text; an optional comment Text field; a primary Button. |
| **Consent screen** | A standalone full screen, never a sheet over a product. `{colors.background}`; content at most 560px wide. Title in `h1`; the notice in `body` (16px minimum) broken into short items, each on a `{colors.surface-raised}` row with `{rounded.md}` and a 24px icon: what is sent and to whom (each AI service named), what is kept and for how long, how to withdraw, how to complain. Two unticked checkboxes (18 or older; the photo is of me) with 48px targets. Two buttons of equal size and weight: "I agree" (primary) and "Not now" (outline); neither is styled to be harder to find. No product imagery and no promotional text on this screen. |
| **Photo guidance** | A `{colors.surface-raised}` panel, `{rounded.lg}`: three or four line-drawn figures (not photos of real people) showing a good photo, each with a success check, and what to avoid, each with a danger cross, with one line of `body-sm` under each. Below: a primary Button to choose or take a photo. The chosen photo previews at 3:4 on `{colors.photo-surface}` with `{rounded.sm}`. |
| **Try-on progress** | The Design's photo (small, 72px, untouched) beside a title in `h3` and a line of `body`; under them a 4px pill-shaped track in `{colors.primary-tint-2}` with a `{colors.primary}` fill. The fill moves steadily; it does not sparkle, shimmer over the photo, or show a fake preview of the result. |
| **Try-on result frame** | The result at its own ratio on `{colors.photo-surface}`, `{rounded.sm}`, with a 1px `{colors.border-strong}` border: a visible frame that no product photo has, so the two are never confused. The AI-generated label sits inside the image at the bottom-left. Directly beneath, always visible without scrolling: a line in `body-sm` `{colors.text-muted}` pointing to the real photos and the Full saree view, then the actions. The frame never appears inside the Design gallery or a Design card. |
| **AI-generated label** | Drawn by the client over every Try-on result (AD-22). Solid, never glass: `{colors.ai-label-fill}` fill, `{colors.ai-label-text}` text, `{rounded.xs}`, 24px high, `{spacing.2}` side padding, a 12px sparkle icon and the words "AI-generated" in `caption` at weight 600. Inset `{spacing.2}` from the bottom-left corner. It scales with the image so that it is never smaller than 12px text and never hidden by another element. The saved or shared copy carries the same label in the same place. |
| **Update required screen** | App only. A full screen on `{colors.background}`: the logo, a title in `h1`, one sentence in `body`, one primary Button to the store. Nothing else. |

### Motion tokens

Tokens are in `components.motion`. Motion is brief and has a job: feedback, continuity, or attention to a state change. Animate only transform and opacity.

| Purpose | Duration | Curve | Notes |
|---|---|---|---|
| Press feedback | `{components.motion.duration-press}` 120ms | `{components.motion.ease-out}` | Scale to `{components.motion.press-scale}` 0.97 on press-down, back on release. Same on web and app; no Android ripple. |
| Small state change (chip select, checkbox, tab, colour) | `{components.motion.duration-fast}` 160ms | `{components.motion.ease-out}` | Colour and the check icon fading in. |
| Enter or exit (menu, toast, inline notice, badge) | `{components.motion.duration-base}` 220ms | `{components.motion.ease-out}` | Enter from opacity 0 and scale `{components.motion.enter-scale}` 0.96, or 8px of travel; exit the way it came. Never from scale 0; never ease-in. |
| Movement on screen (gallery slide settle, timeline advance) | `{components.motion.duration-base}` 220ms | `{components.motion.ease-in-out}` | |
| Sheet and dialog | `{components.motion.duration-sheet}` 300ms | Web: `{components.motion.ease-sheet}`. App: `{components.motion.spring-sheet}` | The scrim fades over the same time. Sheets follow the finger while dragged. |
| Snap back after a drag; carousel settle in the app | — | `{components.motion.spring-snap}` | Carries the finger's velocity. |
| Default settle in the app | — | `{components.motion.spring-settle}` | No overshoot. |
| Screen-to-screen navigation | Platform default | Platform default | Not overridden. |
| Skeleton pulse | `{components.motion.duration-skeleton}` 1200ms | `{components.motion.ease-in-out}` | Opacity only. |

Micro-animations that are part of the system: the press scale; the check drawing in on a selected Chip; the cart count Badge scaling 1 → 1.15 → 1 once when a Piece is added; the Order timeline line filling to the new state when the screen opens; a single success check drawing in on the Order confirmation. Nothing loops except the Skeleton pulse and spinners. Nothing animates on scroll, and nothing animates on a saree photo.

**Reduced motion.** When the system asks for reduced motion: scale and travel are removed; enter and exit become opacity fades of `{components.motion.reduced-duration}`; sheets and dialogs fade instead of sliding; springs go straight to their end value (Reanimated's default, `ReduceMotion.System`); the Skeleton is static; the badge bounce and drawn checks appear in their final state. Press colour change stays, so a press still gives feedback.

### Implementation notes

**One token source.** A single `tokens.css` in a shared package is imported by the web app and by the Expo app, so both read the same variables.

```css
/* tokens.css — shared by web (Tailwind 4 + shadcn) and app (Uniwind) */
@import "tailwindcss";

:root {
  --background: oklch(0.99 0.004 295);
  --foreground: oklch(0.22 0.03 295);          /* text */
  --card: oklch(1 0 0);                        /* surface */
  --card-foreground: oklch(0.22 0.03 295);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.22 0.03 295);
  --primary: oklch(0.47 0.16 295);
  --primary-foreground: oklch(1 0 0);          /* on-primary */
  --secondary: oklch(0.935 0.033 295);         /* primary-tint-2 */
  --secondary-foreground: oklch(0.47 0.16 295);
  --muted: oklch(0.975 0.010 295);             /* surface-raised */
  --muted-foreground: oklch(0.48 0.03 295);    /* text-muted */
  --accent: oklch(0.965 0.018 295);            /* primary-tint-1 */
  --accent-foreground: oklch(0.22 0.03 295);
  --destructive: oklch(0.50 0.18 25);          /* danger */
  --border: oklch(0.90 0.015 295);             /* border-hairline */
  --input: oklch(0.62 0.04 295);               /* border-strong */
  --ring: oklch(0.47 0.16 295);                /* focus-ring */
  --radius: 0.75rem;
  /* Alar additions */
  --primary-hover: oklch(0.42 0.16 295);
  --primary-pressed: oklch(0.37 0.15 295);
  --tint-3: oklch(0.89 0.058 295);
  --photo-surface: oklch(0.965 0 0);
  --success: oklch(0.50 0.12 155);  --success-tint: oklch(0.955 0.03 155);
  --warning: oklch(0.52 0.11 70);   --warning-tint: oklch(0.955 0.04 85);
  --info: oklch(0.50 0.11 245);     --info-tint: oklch(0.955 0.023 245);
  --danger-tint: oklch(0.955 0.021 25);
  --scrim: oklch(0.22 0.03 295 / 0.45);
  --glass-fill: oklch(1 0 0 / 0.85);
}
.dark { /* the -dark values from the Colors section, same variable names */ }

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-photo-surface: var(--photo-surface);
  /* …one --color-* line per variable above… */
}

@theme {
  /* No shadows: clear every shadow namespace so no shadow utility exists. */
  --shadow-*: initial;
  --inset-shadow-*: initial;
  --drop-shadow-*: initial;
  --text-shadow-*: initial;

  --radius-xs: 4px;  --radius-sm: 8px;  --radius-md: 12px;
  --radius-lg: 16px; --radius-xl: 24px;

  --font-heading: "Anek Latin", "Anek Tamil", system-ui, sans-serif;
  --font-sans: "Noto Sans", "Noto Sans Tamil", system-ui, sans-serif;

  --text-display: 2rem;      --text-display--line-height: 2.375rem;
  --text-h1: 1.625rem;       --text-h1--line-height: 2rem;
  --text-h2: 1.375rem;       --text-h2--line-height: 1.75rem;
  --text-h3: 1.125rem;       --text-h3--line-height: 1.5rem;
  --text-body-lg: 1.0625rem; --text-body-lg--line-height: 1.625rem;
  --text-body: 1rem;         --text-body--line-height: 1.5rem;
  --text-body-sm: 0.875rem;  --text-body-sm--line-height: 1.25rem;
  --text-caption: 0.75rem;   --text-caption--line-height: 1rem;

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-sheet: cubic-bezier(0.32, 0.72, 0, 1);
}
```

Spacing needs no override: Tailwind 4's default `--spacing: 0.25rem` is the 4px base, and breakpoints are Tailwind's defaults.

**Removing shadows from shadcn.** There is no single switch; it takes four steps.

1. Clear the four shadow namespaces in `@theme` as above. The research could confirm this technique for other namespaces but not for shadows; confirm in the first build that `shadow-sm` then produces no CSS `[ASSUMPTION]`.
2. Edit the copied component source: delete every `shadow-*`, `drop-shadow-*` and `ring-*` class from each shadcn component as it is added (button, input, card, dialog, sheet, popover, dropdown, select, sonner and others), and give overlays `border border-border` instead.
3. Replace focus styling. shadcn's focus uses ring utilities, which Tailwind draws with a box shadow `[ASSUMPTION: the research did not verify this; treat it as true]`. Use `outline-2 outline-offset-2 outline-ring` on `:focus-visible` instead, set once in the base layer for all interactive elements.
4. Add a check that fails the build if the words `shadow`, `drop-shadow` or `ring-` appear in a class name, or `boxShadow`, `shadowColor`, `shadowOpacity`, `shadowRadius`, `elevation` or `textShadow` appear in app styles.

**App.** Uniwind 1.x with react-native-reusables, reading the same `tokens.css`, with `inlineRem: 16` so sizes match the web `[ASSUMPTION]`. Whether OKLCH values resolve on native was not verified by the research; if they do not, a build step writes the hex values from this file's frontmatter into the app's theme, and this file stays the single source. Android `elevation` is 0 on every view. Sheets and dialogs are the library's own JavaScript components, not system ones, so the system draws no depth effect. Glass uses `expo-blur` inside a `BlurTargetView`, as described under Elevation & Depth. Motion uses Reanimated 4.7.1 (the Expo SDK 58 pairing); on the web, CSS transitions, and Motion only where a gesture or spring needs it.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Put every product photo on `{colors.photo-surface}` | Place a saree on lavender, a tint, a gradient or glass |
| Show depth with a tint step, a 1px border or a scrim | Use any shadow, glow, elevation or shadow-based ring, anywhere |
| Use glass on the Top bar, Bottom navigation bar and Sticky add-to-cart bar only, with the solid fallback | Use glass on cards, sheets, banners, page backgrounds, or over a photo, the Full saree view or a Try-on result |
| Keep photo corners at `{rounded.sm}` or less | Mask, crop into shapes, filter, sharpen, tint or overlay a product photo |
| Use `{colors.primary}` for actions, links and selection | Use a pale lavender for text or for a button with white text |
| Draw focus as a 2px `outline` with a 2px offset | Remove focus outlines or rely on colour alone for state |
| Show prices in `{colors.text}`, whole rupees | Show prices in red, with paise, or with a percentage-off burst |
| Put stock and status Badges below the photo | Dim a sold-out saree's photo or lay a ribbon across it |
| Frame every Try-on result with its border and the AI-generated label | Show a Try-on result in the Design gallery or a Design card, or without its label |
| Let the Shopper swipe a Row of Designs, with the next card peeking | Auto-rotate, auto-advance or loop any carousel |
| Use the spacing steps and the eleven type roles | Use arbitrary pixel values or text under 12px |
| Animate transform and opacity, briefly, and honour reduced motion | Animate on scroll, loop decoration, or move anything on a saree photo |
| Use warning and danger colours for real states only | Use red, countdowns or "only N left" to create urgency that is not real |
