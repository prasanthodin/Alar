import { z } from "zod"
import { fail, IsoDateTime, ok, type Result } from "./common"
import { TaxBands } from "./money"

// ---------------------------------------------------------------------------
// Dated shop settings (AD-13). Each key holds values with an effective time;
// a read at time T returns the value whose effective time is the latest not
// after T. Every key has a zod schema here, checked on write and on read.
// ---------------------------------------------------------------------------

/** True when the runtime knows this IANA time zone name, e.g. `Asia/Kolkata`. */
export function isTimeZone(name: string): boolean {
  if (!/^[A-Za-z][A-Za-z0-9_+\-/]*$/.test(name)) return false
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: name })
    return true
  } catch {
    return false
  }
}

/** A tax code such as `saree`: lower-case letters, digits, `_` and `-`, at most 40 characters. */
export const TaxCode = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,39}$/)
export type TaxCode = z.infer<typeof TaxCode>

/** The shop's display name, 1 to 80 characters after trimming. */
export const ShopName = z.string().trim().min(1).max(80)

/** An IANA time zone name. */
export const TimeZone = z.string().refine(isTimeZone, { message: "Not a known IANA time zone" })

/** The keys with a fixed name, and their schemas. */
export const SETTING_SCHEMAS = {
  "shop.name": ShopName,
  "shop.time_zone": TimeZone,
} as const

/** Prefix of the per-tax-code band keys: `tax.bands.<taxCode>` holds `TaxBands`. */
export const TAX_BANDS_KEY_PREFIX = "tax.bands."

export type FixedSettingKey = keyof typeof SETTING_SCHEMAS
export type TaxBandsKey = `tax.bands.${string}`
export type SettingKey = FixedSettingKey | TaxBandsKey

/** The value type of each key. */
export type SettingValueOf<K extends SettingKey> = K extends FixedSettingKey
  ? z.infer<(typeof SETTING_SCHEMAS)[K]>
  : TaxBands

/** The key that holds the bands of a tax code. */
export function taxBandsKey(taxCode: string): TaxBandsKey {
  return `${TAX_BANDS_KEY_PREFIX}${taxCode}`
}

/** The schema of a key, or null for a key that is not in the registry. */
export function settingSchema(key: string): z.ZodType | null {
  if (Object.hasOwn(SETTING_SCHEMAS, key)) return SETTING_SCHEMAS[key as FixedSettingKey]
  if (key.startsWith(TAX_BANDS_KEY_PREFIX) && TaxCode.safeParse(key.slice(TAX_BANDS_KEY_PREFIX.length)).success) {
    return TaxBands
  }
  return null
}

/** True for a key in the registry. */
export function isSettingKey(key: string): key is SettingKey {
  return settingSchema(key) !== null
}

/**
 * Checks a value against its key's schema. Fails with `settings.invalid_value`
 * for an unknown key or a value the schema refuses. Returns the parsed value
 * (for `shop.name`, trimmed).
 */
export function parseSettingValue<K extends SettingKey>(key: K, value: unknown): Result<SettingValueOf<K>>
export function parseSettingValue(key: string, value: unknown): Result<unknown>
export function parseSettingValue(key: string, value: unknown): Result<unknown> {
  const schema = settingSchema(key)
  if (!schema) {
    return fail("settings.invalid_value", `Unknown setting key ${key}`, { key })
  }
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    return fail("settings.invalid_value", `Value for ${key} does not match its schema`, {
      key,
      issues: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    })
  }
  return ok(parsed.data)
}

/** One dated value of a setting. */
export const SettingValue = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  effectiveFrom: IsoDateTime,
})
export type SettingValue = z.infer<typeof SettingValue>

/** What the website and app may know about the shop. Served by `GET /store/shop/settings`. */
export const ShopPublicView = z.object({
  name: ShopName,
})
export type ShopPublicView = z.infer<typeof ShopPublicView>

// ---------------------------------------------------------------------------
// Business days. Day boundaries (a rate "from tomorrow", a financial year)
// are midnights in the business time zone, held in `shop.time_zone`.
// ---------------------------------------------------------------------------

/** A calendar date, `YYYY-MM-DD`. */
export const BusinessDate = z.iso.date()
export type BusinessDate = z.infer<typeof BusinessDate>

function zonedParts(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") }
}

/** The zone's offset from UTC at `at`, in milliseconds (Asia/Kolkata: +5:30). */
function offsetMs(at: Date, timeZone: string): number {
  const p = zonedParts(at, timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - Math.floor(at.getTime() / 1000) * 1000
}

/** The calendar date in the business time zone at `at`. */
export function businessDate(at: Date, timeZone: string): BusinessDate {
  const p = zonedParts(at, timeZone)
  return `${String(p.year).padStart(4, "0")}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`
}

/** The date `days` calendar days after `date` (negative goes back). */
export function addDays(date: BusinessDate, days: number): BusinessDate {
  if (!BusinessDate.safeParse(date).success) throw new RangeError(`Not a calendar date: ${date}`)
  if (!Number.isSafeInteger(days)) throw new RangeError(`days must be an integer, got ${days}`)
  const [y, m, d] = date.split("-").map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** The instant a business day starts: midnight of `date` in the business time zone. */
export function startOfBusinessDay(date: BusinessDate, timeZone: string): Date {
  if (!BusinessDate.safeParse(date).success) throw new RangeError(`Not a calendar date: ${date}`)
  if (!isTimeZone(timeZone)) throw new RangeError(`Not a known time zone: ${timeZone}`)
  const [y, m, d] = date.split("-").map(Number) as [number, number, number]
  const localMidnightAsUtc = Date.UTC(y, m - 1, d)
  // Two passes settle the offset where it changes near midnight (daylight saving).
  let instant = localMidnightAsUtc - offsetMs(new Date(localMidnightAsUtc), timeZone)
  instant = localMidnightAsUtc - offsetMs(new Date(instant), timeZone)
  return new Date(instant)
}

/** The start of the business day after the one that contains `at`. */
export function startOfNextBusinessDay(at: Date, timeZone: string): Date {
  return startOfBusinessDay(addDays(businessDate(at, timeZone), 1), timeZone)
}
