// Mock catalogue for the early app shell, taken from the approved design boards.
// Every picture is an AI-made placeholder (isSample: true), never a photo of an item on sale.
// Prices are tax-inclusive shelf prices in paise (pricePaise, mrpPaise). Weavers are never part of shopper data.

export type MockCategory = {
  id: string
  name: string
  file: string
}

export type MockVariant = {
  id: string
  colourName: string
  /** Picture file of this colour, used for the swatch. */
  file: string
  alt: string
  stock: number
}

export type MockDesign = {
  id: string
  name: string
  subtitle: string
  pricePaise: number
  mrpPaise: number
  file: string
  alt: string
  badge?: string
  rating?: { value: number; count: number }
  categoryIds: string[]
  /** Extra gallery pictures after the main one. */
  gallery?: { file: string; alt: string }[]
  fullView?: { file: string; alt: string }
  variants: MockVariant[]
  attributes: { label: string; value: string }[]
}

/** "sarees" holds every Design; the others are its categories. */
export const ALL_CATEGORY_ID = "sarees"

export const mockCategories: MockCategory[] = [
  { id: ALL_CATEGORY_ID, name: "Sarees", file: "4-1-sarees.jpg" },
  { id: "silk", name: "Silk", file: "4-2-silk.jpg" },
  { id: "cotton", name: "Cotton", file: "4-3-cotton.jpg" },
  { id: "wedding", name: "Wedding", file: "4-4-wedding.jpg" },
  { id: "festive", name: "Festive", file: "4-5-festive.jpg" },
  { id: "new-in", name: "New in", file: "4-6-newin.jpg" },
  { id: "under-2500", name: "Under ₹2,500", file: "4-7-under2500.jpg" },
]

const silkAttributes = (weave: string, border: string, occasion: string) => [
  { label: "Fabric", value: "Pure silk" },
  { label: "Weave", value: weave },
  { label: "Border", value: border },
  { label: "Length", value: "6.2 m × 1.2 m" },
  { label: "Blouse piece", value: "Included, 0.8 m unstitched" },
  { label: "Occasion", value: occasion },
  { label: "Care", value: "Dry clean only" },
  { label: "Made in", value: "India" },
]

const cottonAttributes = (weave: string, border: string) => [
  { label: "Fabric", value: "Cotton" },
  { label: "Weave", value: weave },
  { label: "Border", value: border },
  { label: "Length", value: "6.2 m × 1.2 m" },
  { label: "Blouse piece", value: "Included, 0.8 m unstitched" },
  { label: "Occasion", value: "Daily wear, festive" },
  { label: "Care", value: "Gentle hand wash" },
  { label: "Made in", value: "India" },
]

export const mockDesigns: MockDesign[] = [
  {
    id: "arani-silk",
    name: "Arani silk saree",
    subtitle: "Maroon, temple border",
    pricePaise: 315000,
    mrpPaise: 360000,
    file: "1-1-maroon.jpg",
    alt: "Maroon silk saree with a gold temple border and a striped pallu",
    badge: "Just in",
    rating: { value: 4.6, count: 128 },
    categoryIds: ["silk", "wedding", "festive", "new-in"],
    gallery: [{ file: "2-1-closeup-maroon.jpg", alt: "Close view of the maroon silk weave and gold border" }],
    fullView: { file: "3-1-full-maroon.jpg", alt: "The whole maroon saree laid out from blouse piece to pallu" },
    variants: [
      { id: "arani-silk-maroon", colourName: "Maroon", file: "1-1-maroon.jpg", alt: "Arani silk saree in maroon", stock: 3 },
      { id: "arani-silk-violet", colourName: "Violet", file: "1-2-violet.jpg", alt: "Arani silk saree in violet", stock: 10 },
      { id: "arani-silk-emerald", colourName: "Emerald", file: "1-3-emerald.jpg", alt: "Arani silk saree in emerald", stock: 8 },
      { id: "arani-silk-peacock", colourName: "Peacock blue", file: "1-4-peacock.jpg", alt: "Arani silk saree in peacock blue", stock: 0 },
    ],
    attributes: silkAttributes("Arani", "Temple, zari", "Wedding, festive"),
  },
  {
    id: "kanchipuram-silk-violet",
    name: "Kanchipuram silk saree",
    subtitle: "Violet, gold buttas",
    pricePaise: 480000,
    mrpPaise: 540000,
    file: "1-2-violet.jpg",
    alt: "Violet Kanchipuram silk saree with small gold buttas",
    badge: "Try-on ready",
    rating: { value: 4.8, count: 41 },
    categoryIds: ["silk", "wedding"],
    variants: [
      { id: "kanchipuram-silk-violet-violet", colourName: "Violet", file: "1-2-violet.jpg", alt: "Kanchipuram silk saree in violet", stock: 27 },
    ],
    attributes: silkAttributes("Kanchipuram", "Plain zari", "Wedding"),
  },
  {
    id: "kanchipuram-silk-emerald",
    name: "Kanchipuram silk saree",
    subtitle: "Emerald, contrast border",
    pricePaise: 495000,
    mrpPaise: 550000,
    file: "1-3-emerald.jpg",
    alt: "Emerald Kanchipuram silk saree with a pink contrast border",
    badge: "Wedding pick",
    categoryIds: ["silk", "wedding"],
    variants: [
      { id: "kanchipuram-silk-emerald-emerald", colourName: "Emerald", file: "1-3-emerald.jpg", alt: "Kanchipuram silk saree in emerald", stock: 1 },
    ],
    attributes: silkAttributes("Kanchipuram", "Contrast, pink", "Wedding"),
  },
  {
    id: "soft-silk-peacock",
    name: "Soft silk saree",
    subtitle: "Peacock blue, plain border",
    pricePaise: 240000,
    mrpPaise: 280000,
    file: "1-4-peacock.jpg",
    alt: "Peacock blue soft silk saree with a plain border",
    rating: { value: 4.4, count: 64 },
    categoryIds: ["silk", "festive", "under-2500"],
    variants: [
      { id: "soft-silk-peacock-peacock", colourName: "Peacock blue", file: "1-4-peacock.jpg", alt: "Soft silk saree in peacock blue", stock: 41 },
    ],
    attributes: silkAttributes("Soft silk", "Plain", "Festive"),
  },
  {
    id: "kasavu-cotton",
    name: "Kasavu cotton saree",
    subtitle: "Ivory, red border",
    pricePaise: 180000,
    mrpPaise: 200000,
    file: "1-5-kasavu.jpg",
    alt: "Ivory Kasavu cotton saree with a red border",
    categoryIds: ["cotton", "festive", "under-2500"],
    variants: [{ id: "kasavu-cotton-ivory", colourName: "Ivory", file: "1-5-kasavu.jpg", alt: "Kasavu cotton saree in ivory", stock: 10 }],
    attributes: cottonAttributes("Kasavu", "Red"),
  },
  {
    id: "chettinad-cotton",
    name: "Chettinad cotton saree",
    subtitle: "Mustard, checked border",
    pricePaise: 165000,
    mrpPaise: 190000,
    file: "1-6-mustard.jpg",
    alt: "Mustard Chettinad cotton saree with a checked border",
    categoryIds: ["cotton", "new-in", "under-2500"],
    variants: [
      { id: "chettinad-cotton-mustard", colourName: "Mustard", file: "1-6-mustard.jpg", alt: "Chettinad cotton saree in mustard", stock: 22 },
    ],
    attributes: cottonAttributes("Chettinad", "Checked"),
  },
  {
    id: "tussar-silk",
    name: "Tussar silk saree",
    subtitle: "Rust, green border",
    pricePaise: 390000,
    mrpPaise: 440000,
    file: "1-7-rust.jpg",
    alt: "Rust Tussar silk saree with a green border",
    categoryIds: ["silk", "new-in"],
    variants: [{ id: "tussar-silk-rust", colourName: "Rust", file: "1-7-rust.jpg", alt: "Tussar silk saree in rust", stock: 14 }],
    attributes: silkAttributes("Tussar", "Green", "Festive"),
  },
  {
    id: "banarasi-silk",
    name: "Banarasi silk saree",
    subtitle: "Navy, gold brocade",
    pricePaise: 495000,
    mrpPaise: 560000,
    file: "1-8-navy.jpg",
    alt: "Navy Banarasi silk saree with gold brocade",
    categoryIds: ["silk", "wedding"],
    variants: [{ id: "banarasi-silk-navy", colourName: "Navy", file: "1-8-navy.jpg", alt: "Banarasi silk saree in navy", stock: 0 }],
    attributes: silkAttributes("Banarasi", "Gold brocade", "Wedding"),
  },
]
