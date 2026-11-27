---
name: Alar
description: Visual identity for a clothing shop (sarees first, other garments later) on the web (Next.js, Tailwind CSS 4, shadcn) and Android (Expo / React Native). Lavender on white, no shadows, compact sizes, glass only on floating bars, product photos on neutral grey.
status: final
created: '2026-11-27'
updated: '2026-11-27'
sources:
  - ../../prds/prd-saree-commerce-2026-11-27/prd.md
  - ../../architecture/architecture-saree-commerce-2026-11-27/ARCHITECTURE-SPINE.md
  - ../../research/ux-direction-2026-11-27/digest.md
  - ./.memlog.md
  - ./.working/design-canvas/project/
colors:
  primary: '#6F52F0'
  primary-pressed: '#5B3FD6'
  on-primary: '#FFFFFF'
  primary-text: '#5B3FD6'          # lavender text on a tint; passes AA where primary does not
  tint-1: '#F6F3FF'                # quietest lavender surface: notes, selected rows, rails
  tint-2: '#EDE8FF'                # lavender surface: chips, icon tiles, category backdrops
  tint-3: '#DCD3FF'                # lavender line: chip and card outlines
  tint-4: '#BFB1FF'                # dashed outlines, inactive chart bars
  background: '#FBFAFF'            # page ground behind cards
  surface: '#FFFFFF'
  surface-disabled: '#F6F5FA'
  photo-ground: '#F3F3F6'          # neutral, never lavender: behind every product photo
  text: '#1B1530'
  text-muted: '#6B6680'
  placeholder: '#77728C'
  border: '#E7E3F5'                # hairline between and around cards
  border-control: '#8F88B0'        # outline of fields, checkboxes and radios (3:1 on white)
  focus-ring: '#6F52F0'
  success: '#14694A'
  success-tint: '#E3F4EC'
  warning: '#8F4A00'
  warning-tint: '#FFF1DC'
  danger: '#B3261E'
  danger-tint: '#FCE8E6'
  danger-line: '#F3C7C3'
  neutral-tint: '#F1F0F5'
  rating-star: '#F2A90D'
  rating-star-empty: '#E3E0EE'
  scrim: '#1B15308C'               # text colour at 55%, behind web dialogs and sheets
  photo-scrim: '#140C0AC7'         # start of the left-to-right gradient under banner text
  glass-fill: '#FFFFFFCC'          # white at 80%, only with blur
  glass-line: '#E7E3F5F2'
typography:
  # Plus Jakarta Sans: headings, prices, the wordmark. Inter: everything else.
  # Indic scripts fall back to Noto Sans Tamil / Telugu / Kannada / Malayalam.
  display-web:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 46px
    letterSpacing: -0.02em
  h1:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 30px
    letterSpacing: -0.02em
  h2:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 20px
    fontWeight: '800'
    lineHeight: 26px
    letterSpacing: -0.01em
  h3:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: 0em
  h4:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0em
  price-lg:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 18px
    fontWeight: '800'
    lineHeight: 24px
  price:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 14px
    fontWeight: '800'
    lineHeight: 20px
  body:
    fontFamily: 'Inter'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-strong:
    fontFamily: 'Inter'
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  body-sm:
    fontFamily: 'Inter'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  caption:
    fontFamily: 'Inter'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label:
    fontFamily: 'Inter'
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
  overline:
    fontFamily: 'Inter'
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  button:
    fontFamily: 'Inter'
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  field-web:
    fontFamily: 'Inter'
    fontSize: 16px                 # stops phone browsers zooming into a field
    fontWeight: '400'
    lineHeight: 22px
  mono:
    fontFamily: 'ui-monospace'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  xs: 5px        # status chips, small labels
  sm: 8px        # buttons, fields, small thumbnails
  md: 10px       # product photos, notes, option rows
  lg: 12px       # icon tiles, quick tiles
  xl: 16px       # cards, panels, category thumbnails
  '2xl': 20px    # floating bottom navigation, banners, dialogs
  device: 32px   # artboard corner only, not a product value
  full: 999px    # chips, dots, avatars
spacing:
  '0.5': 2px
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '12': 48px
  gutter-phone: 16px
  gutter-web: 48px
  gutter-admin: 24px
  grid-gap-phone: 12px
  grid-gap-web: 20px
  card-pad: 12px
  card-pad-lg: 16px
  section-gap-phone: 16px
  section-gap-web: 32px
  content-max-web: 1344px
  touch-min: 44px
  focus-width: 2px
  focus-offset: 2px
components:
  button:
    height: 40px
    height-lg-web: 44px
    height-sm: 32px
    height-admin: 36px
    radius: '{rounded.sm}'
    padding-x: 16px
    primary-fill: '{colors.primary}'
    primary-text: '{colors.on-primary}'
    outline-border: '1.5px {colors.primary}'
    outline-text: '{colors.primary-text}'
    ghost-border: '1px {colors.tint-3}'
    dark-fill: '{colors.text}'
    disabled-fill: '{colors.surface-disabled}'
    disabled-text: '{colors.text-muted}'
  field:
    height: 44px
    height-admin: 36px
    radius: '{rounded.sm}'
    border: '1px {colors.border-control}'
    border-focus: '1.5px {colors.primary}'
    padding-x: 12px
  search:
    height: 40px
    radius: '{rounded.md}'
  chip:
    height: 32px
    radius: '{rounded.full}'
    padding-x: 12px
    selected-fill: '{colors.text}'
    selected-text: '{colors.on-primary}'
    border: '1px {colors.tint-3}'
  status-chip:
    height: 22px
    radius: '{rounded.xs}'
    padding-x: 8px
    text: '{typography.overline}'
  action-tile:
    height: 44px
    radius: '{rounded.md}'
  card:
    radius: '{rounded.xl}'
    border: '1px {colors.border}'
    padding: '{spacing.card-pad}'
    fill: '{colors.surface}'
  product-card:
    photo-radius: '{rounded.md}'
    photo-ratio: '4:5'
    photo-height-phone: 210px
    photo-height-web: 320px
    gap: 8px
  photo-label:
    height: 22px
    radius: '0 6px 6px 0'
    fill: '{colors.primary}'
    text: '{typography.label}'
  top-bar:
    height: 56px
  bottom-nav:
    height: 56px
    radius: '{rounded.full}'
    active-pill-height: 40px
    inset: 16px
    bottom: 12px
  action-bar:
    padding: '8px 16px 12px'
  glass:
    fill: '{colors.glass-fill}'
    blur: 20px
    saturate: 1.6
    line: '1px {colors.glass-line}'
    fallback: '{colors.surface}'
  toggle:
    width: 36px
    height: 20px
  stepper:
    height: 28px
  otp-box:
    width: 48px
    height: 52px
    radius: '{rounded.md}'
  admin:
    sidebar-width: 224px
    top-bar-height: 56px
    nav-item-height: 36px
    table-row-min: 52px
    table-head-height: 36px
  motion:
    duration-press: 120ms
    duration-fast: 160ms
    duration-base: 220ms
    duration-sheet: 300ms
    duration-skeleton: 1200ms
    reduced-duration: 120ms
    press-scale: 0.97
    enter-scale: 0.96
    ease-out: 'cubic-bezier(0.23, 1, 0.32, 1)'
    ease-in-out: 'cubic-bezier(0.77, 0, 0.175, 1)'
    ease-sheet: 'cubic-bezier(0.32, 0.72, 0, 1)'
    spring-sheet: 'damping 30, stiffness 300'
    spring-snap: 'damping 26, stiffness 260'
---

# Alar — Design Spine

> How Alar looks. `EXPERIENCE.md` owns how it works. Both win over any mock. The approved mocks are the 72 boards of the design canvas (source in `.working/design-canvas/project/`, generated by `.working/design-canvas/build_boards.py`); where a board and this file differ, this file is right, and the differences already known are listed under "Corrections to the boards". Lines tagged `[ASSUMPTION]` were chosen here.

## Brand & Style

Alar sells clothing online, sarees first. The look was chosen by the founder on 27 November 2026 and has five fixed rules.

1. **Lavender is the brand.** One strong lavender for actions and a family of pale lavender tints for surfaces. Text is a near-black with a violet cast, never pure black.
2. **No shadows, anywhere.** Depth comes from a tinted surface next to a white one, a hairline border, or blur under a floating bar.
3. **Nothing oversized.** Buttons are 40px, chips 32px, section headings 16px, body text 14px. The model is a dense, familiar Indian shopping app: a shopper who uses Myntra should find every part where she expects it.
4. **Glass only on floating controls.** The floating bottom navigation, the floating filter bar and the bottom action bar are translucent with blur. Glass never sits on a product photo; controls over a photo are solid white.
5. **The photo is the truth.** Product photos sit on neutral grey, uncropped by decoration, with no tint, gradient or filter. Lavender never touches a product photo. Anything made by AI carries a visible "AI" label.

The name is a setting, not a drawing: the wordmark is the store name set in Plus Jakarta Sans 800, lower case, tight tracking, in `{colors.primary}`. Changing the name in settings changes it everywhere (PRD FR-56).

The design is category-neutral. Nothing in the visual system is specific to sarees; the same card, page and bar serve shirts, dhotis and later departments.

Weaver names are not part of the shopper-facing look. They appear only in the Admin.

## Colors

One light theme. A dark theme is not designed `[ASSUMPTION: deferred; token names are theme-neutral so a dark set can be added without renaming]`.

| Token | Hex | Use |
|---|---|---|
| `{colors.primary}` | #6F52F0 | Primary buttons, selected outlines, active tab, links, icons on tints, the wordmark |
| `{colors.primary-pressed}` | #5B3FD6 | Pressed and hover state of primary |
| `{colors.primary-text}` | #5B3FD6 | Lavender text on a tint, outline-button text, discount percentage |
| `{colors.tint-1}` | #F6F3FF | Notes, selected option rows, side rails, table heads |
| `{colors.tint-2}` | #EDE8FF | Icon tiles, lavender chips, category thumbnail backdrop, segmented control track |
| `{colors.tint-3}` | #DCD3FF | Chip, ghost-button and spec-card outlines |
| `{colors.tint-4}` | #BFB1FF | Dashed outlines (add photo, coupon), inactive chart bars |
| `{colors.background}` | #FBFAFF | Page ground on screens made of cards, and the whole Admin |
| `{colors.surface}` | #FFFFFF | Cards, bars, product pages |
| `{colors.photo-ground}` | #F3F3F6 | Behind every product photo, while loading and at the edges |
| `{colors.text}` | #1B1530 | Text; also the fill of a selected chip and the dark button |
| `{colors.text-muted}` | #6B6680 | Secondary text, captions, struck-through MRP |
| `{colors.border}` | #E7E3F5 | Hairlines around and between cards |
| `{colors.border-control}` | #8F88B0 | Outline of fields, checkboxes, radios |
| `{colors.success}` / `-tint` | #14694A / #E3F4EC | Delivered, paid, verified, savings, free delivery |
| `{colors.warning}` / `-tint` | #8F4A00 / #FFF1DC | Low stock, to pack, needs review |
| `{colors.danger}` / `-tint` | #B3261E / #FCE8E6 | Sold out, failed payment, destructive actions |
| `{colors.rating-star}` | #F2A90D | Filled rating stars only |

**Lavender is for the interface, grey is for the cloth.** A lavender backdrop is allowed behind category artwork and illustrations, never behind a photo of something for sale.

**Gradients** are allowed in three places only: the fade from `{colors.tint-2}` to white at the top of Home, Login and Profile; the left-to-right `{colors.photo-scrim}` under banner text; and nothing else. No gradient on buttons, cards or text.

### Contrast (WCAG 2.2 AA)

| Pair | Ratio | Passes |
|---|---|---|
| `text` on `surface` | 17.6:1 | Text |
| `text-muted` on `surface`, `background`, `tint-1` | 5.5, 5.3, 5.0:1 | Text |
| `primary` on `surface`; `on-primary` on `primary` | 5.1:1 | Text |
| `primary-text` on `tint-2` | 5.6:1 | Text |
| `success` on `success-tint` | 5.8:1 | Text |
| `warning` on `warning-tint` | 6.0:1 | Text |
| `danger` on `danger-tint` | 5.5:1 | Text |
| `text-muted` on `neutral-tint` (grey chip) | 4.8:1 | Text |
| `primary` on `tint-1` (icons and links on notes) | 4.6:1 | Text |
| `placeholder` on `surface` | 4.6:1 | Text |
| `border-control` on `surface` | 3.3:1 | Control outline |

Ratios were computed from the hex values with the WCAG formula, not measured in a browser; they are to be re-checked with an automated tool in the first build.

## Typography

Two families. **Plus Jakarta Sans** (weights 700 and 800) for headings, prices and the wordmark. **Inter** (400, 500, 600, 700) for everything else. For Tamil, Telugu, Kannada and Malayalam the stack falls back to the matching **Noto Sans** family at the same size with 4px more line height `[ASSUMPTION]`, because neither brand face has Indic glyphs.

| Role | Size / line | Weight | Where |
|---|---|---|---|
| `display-web` | 40 / 46 | 800 | Website hero headline only |
| `h1` | 24 / 30 | 800 | Onboarding headline, website product title |
| `h2` | 20 / 26 | 800 | Titles of full-screen states (order confirmed, login), Admin page titles, website section titles |
| `h3` | 16 / 22 | 700 | Top-bar titles, section headings |
| `h4` | 14 / 20 | 700 | Card headings |
| `price-lg` / `price` | 18 / 24, 14 / 20 | 800 | Price on a product page; price in cards and lists |
| `body` / `body-strong` | 14 / 20 | 400 / 700 | Running text, product names |
| `body-sm` | 13 / 18 | 400 | Card text, table cells, secondary lines |
| `caption` | 12 / 16 | 400 | Hints, timestamps, legal lines |
| `label` | 11 / 14 | 600 | Thumbnail labels, bottom-navigation labels, photo labels |
| `overline` | 11 / 14, +0.04em, caps | 700 | Status chips, table heads, department tabs |
| `button` | 14 / 20 | 700 | All buttons (13px in 32px and Admin buttons) |

Rules: no text below 11px except the count inside a badge (10px). Paragraphs of explanation use `body` with 22px line height. Prices are whole rupees with the ₹ sign and Indian digit grouping (₹1,12,300), never decimals. On the website, text typed into a field is 16px (`field-web`) so phone browsers do not zoom.

## Layout & Spacing

Base unit 4px (Tailwind's). Only the steps in `spacing` are used.

**Phone (app and mobile web), designed at 390px wide.** Gutter `{spacing.gutter-phone}` 16px. Product grid of 2 columns with a 12px gap. Sections are 16px apart; items inside a card 8–12px apart. A top bar of 56px; a floating bottom navigation 16px from each side and 12px from the bottom; screens with a purchase action replace the navigation with a bottom action bar.

**Website from 1024px, designed at 1440px.** Gutter `{spacing.gutter-web}` 48px, content up to 1344px. Product grid of 5 columns on Home and 4 beside the filter column, 20px gap. Product page in two columns (photos 57%, details 43%). Bag and checkout in two columns (items, then a 380px summary). Between 640 and 1023px the phone layout is used with a 3-column grid `[ASSUMPTION]`.

**Admin, designed at 1440 × 900.** Sidebar 224px, top bar 56px, content gutter 24px. A page is a title row, an optional tab row, then cards on `{colors.background}`. Lists are tables; the detail of a selected row sits in a right-hand panel of 340–440px, not on a new page.

**Home follows the familiar order** (founder's instruction): delivery address bar, search with the wordmark, department tabs, two rows of category thumbnails, banner, service strip, product grid.

## Elevation & Depth

There is no elevation scale. `box-shadow`, `drop-shadow`, `elevation` and text shadow are not used on any surface, on web, Android or in the Admin.

Layers are told apart by:

- **Surface on ground:** a white card on `{colors.background}`, or a `{colors.tint-1}` panel on white.
- **A hairline:** 1px `{colors.border}`.
- **Selection:** a 1.5–2px `{colors.primary}` outline, with `{colors.tint-1}` fill where the row is large.
- **Glass:** `{components.glass.fill}` with a 20px blur and 1.6 saturation, and a 1px `{components.glass.line}`. Used by the floating bottom navigation, the floating filter bar on listings and the bottom action bar, and nowhere else. Where blur is unavailable, slow, or the system asks for reduced transparency, the bar is solid `{components.glass.fallback}`.
- **Dialogs and sheets:** a white panel with `{rounded.2xl}` top corners over `{colors.scrim}`.

## Shapes

| Radius | Used by |
|---|---|
| `{rounded.xs}` 5px | Status chips, small labels |
| `{rounded.sm}` 8px | Buttons, fields, small thumbnails |
| `{rounded.md}` 10px | Product photos, notes, option rows, search field |
| `{rounded.lg}` 12px | Icon tiles |
| `{rounded.xl}` 16px | Cards, panels, category thumbnails |
| `{rounded.2xl}` 20px | Floating bottom navigation, banners, dialogs |
| `{rounded.full}` | Chips, dots, avatars, progress tracks |

A label attached to the left edge of a photo ("Just in", "AI preview") is square on the left and 6px on the right. Icons are 24px-grid line icons, 1.8–2px stroke, round caps and joins, drawn in the current text colour; 16, 18, 20 and 24px are the only sizes.

## Components

Visual specification only. Behaviour is in `EXPERIENCE.md`.

| Component | Specification |
|---|---|
| **Button** | 40px high, `{rounded.sm}`, `button` text, 16px side padding, optional 18px leading icon with an 8px gap. Primary: `{colors.primary}` fill, white text. Outline: white, 1.5px primary border, `primary-text`. Ghost: white, 1px `tint-3` border, `text`. Dark: `text` fill (used once per screen at most, for a secondary strong action). Small 32px for actions inside cards; 36px in the Admin; 44px for the two purchase buttons on the website product page. Disabled: `surface-disabled` fill, muted text, no border colour change. |
| **Text link** | `primary`, weight 600, no underline; `body-sm` when it sits beside a heading. |
| **Field** | 44px, `{rounded.sm}`, 1px `border-control`, 12px padding; label above in `body-sm` 600; hint below in `caption`. Focus: 1.5px `primary`. Read-only: `surface-disabled`. Admin fields are 36px. |
| **Search field** | 40px, `{rounded.md}`; on Home it carries the wordmark at its left. |
| **Chip** | 32px, fully rounded, `body-sm` 600. Unselected: white with `tint-3` border. Selected: `text` fill, white text. |
| **Status chip** | 22px, `{rounded.xs}`, `overline`. Tones: green, amber, red, lavender, grey, each as text on its tint. |
| **Segmented control** | `tint-2` track with 4px padding; the selected segment is white, 36px, `{rounded.sm}`. |
| **Checkbox / radio** | 18px; selected is `primary` filled (checkbox) or a `primary` ring with an 8px dot (radio). |
| **Toggle** | 36 × 20px track, 16px white knob; on is `primary`. |
| **Quantity stepper** | 28px high, `tint-3` border, `{rounded.sm}`. |
| **Product card** | Photo 4:5 on `photo-ground`, `{rounded.md}`, no border; an optional lavender label at the top left; a 32px white round wishlist button at the top right; an optional white rating chip at the bottom left. Below, 8px gap: name (`body-sm` 700), one line of detail (`caption`), then price, struck MRP and discount on one line. |
| **Category thumbnail** | 60 × 72px (76 × 92 on the Categories tab), `{rounded.xl}`, artwork on `tint-2`, `label` beneath. |
| **Banner** | `{rounded.2xl}`, 230px on phone and 400px on the website; photo with the subject on the right; an optional left-to-right `photo-scrim`; a white pill label, a small line and a headline; dots beneath. |
| **Card** | White, 1px `border`, `{rounded.xl}`, 12px padding (16px for lists of rows). Rows inside are separated by a 1px `border` line. |
| **Note** | `{rounded.md}`, 10 × 12px padding, a 16px icon and `caption` text. Lavender for information, green for reassurance, amber for a warning, red for a problem. |
| **Offer and coupon** | Coupon code in a dashed `tint-4` box on `tint-1`, `price` text with wide tracking. |
| **Top bar** | 56px, white, hairline beneath; a 44px back target, `h3` title with an optional `caption` line, one trailing item. |
| **Bottom navigation** | Floating, 56px, fully rounded, glass. Four items: Home, Categories, Try-on, Bag. The current item is a 40px `tint-2` pill holding a 20px icon and its name in `primary-text` (13px, 600); the others are 22px icons in `text-muted`. |
| **Bottom action bar** | Full width, glass, 8px top and 12px bottom padding, one or two 40px buttons; a total and a saving line may sit at the left. |
| **Step indicator** | 20px numbered dots joined by a 1px line; done is `primary` with a tick, current is `text`, to come is outlined. |
| **Order timeline** | 18px dots joined by a 2px line; done filled `primary`, current ringed, to come grey. |
| **Rating** | Stars in `rating-star`; the summary number in Plus Jakarta Sans 800 at 36px with 6px bars. |
| **One-time-code boxes** | Six boxes, 48 × 52px, `{rounded.md}`; the active box has a 2px `primary` border. |
| **AI label** | On any AI-made picture: a lavender label reading "AI PREVIEW" at the top left of the large picture, or a 16px "AI" tag on a thumbnail. Never removed, never smaller than `label`. |
| **Empty and full-screen state** | A 64–72px round tint tile holding a 30px icon, an `h2` line, one `body` sentence in muted text, then one or two buttons. |
| **Admin sidebar** | 224px, white, hairline at the right; 36px items, `body-sm`; the active item is `tint-2` with `primary-text`. |
| **Admin table** | White card, `{rounded.xl}`; a 36px `tint-1` head in `overline`; rows at least 52px, `body-sm`, separated by hairlines. |
| **Admin stat tile** | A card with a `caption` label, a 22px Plus Jakarta Sans 800 number and one `caption` line in a status colour. |
| **Admin tabs** | 36px text tabs with a 2px `primary` underline on the active one. |

### Motion tokens

Motion is brief and has a job: feedback, continuity, or drawing the eye to a change. Only transform and opacity are animated.

| Purpose | Duration | Curve |
|---|---|---|
| Press feedback: scale to `{components.motion.press-scale}` on press-down | `{components.motion.duration-press}` | `{components.motion.ease-out}` |
| Small state change: chip, checkbox, toggle, tab, colour swatch | `{components.motion.duration-fast}` | `{components.motion.ease-out}` |
| Enter and exit: menu, toast, note, badge; from opacity 0 and scale `{components.motion.enter-scale}` or 8px of travel | `{components.motion.duration-base}` | `{components.motion.ease-out}` |
| Movement on screen: gallery settle, timeline advance, progress bar | `{components.motion.duration-base}` | `{components.motion.ease-in-out}` |
| Sheet and dialog | `{components.motion.duration-sheet}` | Web `{components.motion.ease-sheet}`; app `{components.motion.spring-sheet}` |
| Snap back after a drag; carousel settle in the app | none | `{components.motion.spring-snap}` |
| Skeleton pulse, opacity only | `{components.motion.duration-skeleton}` | `{components.motion.ease-in-out}` |

Micro-animations in the system: the press scale; the tick drawing in on a selected chip or checkbox; the Bag count scaling 1 → 1.15 → 1 once when an item is added; the wishlist heart filling; the order timeline filling to the current state when the screen opens; one success tick drawing in on Order confirmed; the try-on progress bar. Nothing loops except the skeleton and the try-on spinner. Nothing enters from scale 0 and nothing uses ease-in. Screen-to-screen transitions are the platform's own.

**Reduced motion.** When the system asks for it, scale and travel are removed, enters and exits become `{components.motion.reduced-duration}` fades, sheets fade instead of sliding, springs go straight to their end value and the skeleton is static.

### Implementation notes

- Tokens live once, in a shared package, and are read by Tailwind CSS 4 (`@theme`) on the web and by the React Native styling layer in the app (architecture: clients share tokens). No colour, size or radius is written by hand in a component.
- shadcn components are restyled to these tokens: remove every `shadow-*` class from the defaults, set radii and heights from this file, and keep their accessibility behaviour.
- In the app, press feedback is our own scale on press-down; the Android ripple is off. Blur uses the platform blur on Android 12 and later and the solid fallback below that; the architecture's spike measures its cost on a mid-range phone.
- Product photos are stored at 4:5; lists request a width near 2× the rendered size. The full saree image is 21:9 or wider and is shown through the tile viewer.

### Corrections to the boards

The boards were drawn before these checks. Build from this file, not from the board, in these places.

| On the boards | Build instead | Why |
|---|---|---|
| Field and checkbox outlines in #DCD3FF | `{colors.border-control}` #8F88B0 | A control's outline needs 3:1 against white |
| Placeholder text in #9B97AD | `{colors.placeholder}` #77728C | 4.5:1 for text |
| Amber text in #B25B00 | `{colors.warning}` #8F4A00 | 4.5:1 on its tint |
| Some titles at 22px or 18px | `h2` (20px) or `h3` (16px) | One scale |
| Field text at 14px on the website | `field-web` 16px | Stops phone browsers zooming |
| Photos on the boards | Real photos of the real item | The board images are AI-made placeholders and must never be shown for an item on sale |

## Do's and Don'ts

**Do**

- Use `{colors.primary}` for the one main action on a screen, and outline or ghost for the rest.
- Keep product photos on `{colors.photo-ground}`, uncovered except by one small label, the wishlist button and the rating chip, all solid.
- Separate with a hairline or a tint. Reach for space before a line.
- Keep to the size list: 40px buttons, 32px chips, 44px fields and action tiles, 56px bars.
- Label every AI-made picture.
- Show a price as ₹ and a whole number, with MRP struck through and the discount beside it.

**Don't**

- Don't use a shadow, a glow or an elevation value, including the framework defaults.
- Don't put glass, a gradient or a tint over a product photo.
- Don't make anything larger "for emphasis"; emphasis comes from weight and colour.
- Don't use lavender for a state that means success, warning or danger.
- Don't show a weaver's name or family to shoppers.
- Don't introduce a third typeface, an arbitrary spacing value or a new radius.
- Don't auto-rotate a banner or loop an animation.
