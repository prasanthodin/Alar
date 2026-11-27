import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import {
  parseSettingValue,
  startOfBusinessDay,
  type BusinessDate,
  type SettingKey,
  type SettingValueOf,
} from "@shop/contracts"
import { SettingValue } from "./models/setting-value"

/**
 * The value is stored inside an envelope (`{ "v": ... }`) so that a plain
 * string or number is stored as JSON the same way an object or array is.
 */
type Stored = { v: unknown }

function wrap(value: unknown): Stored {
  return { v: value }
}

function unwrap(stored: unknown): unknown {
  return stored && typeof stored === "object" && "v" in stored ? (stored as Stored).v : undefined
}

function invalid(message: string, details?: Record<string, unknown>): MedusaError {
  const error = new MedusaError(MedusaError.Types.INVALID_DATA, message, "settings.invalid_value")
  if (details) Object.assign(error, { details })
  return error
}

function toDate(value: Date | string, what: string): Date {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw invalid(`${what} is not a valid time`)
  return date
}

/**
 * Dated shop settings. Only this module writes `setting_value`; everything
 * else reads through `getValue`.
 */
export default class SettingsModuleService extends MedusaService({ SettingValue }) {
  /**
   * The value of `key` in effect at `at` (default now): the one whose effective
   * time is the latest not after `at`. Throws `settings.not_found` when none is,
   * and `settings.invalid_value` when the stored value fails the key's schema.
   */
  async getValue<K extends SettingKey>(key: K, at: Date | string = new Date()): Promise<SettingValueOf<K>> {
    const when = toDate(at, "at")
    const [row] = await this.listSettingValues(
      { key, effective_from: { $lte: when } },
      { order: { effective_from: "DESC" }, take: 1 }
    )
    if (!row) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No value of ${key} is in effect at ${when.toISOString()}`,
        "settings.not_found"
      )
    }
    const parsed = parseSettingValue(key, unwrap(row.value))
    if (!parsed.ok) throw invalid(`Stored value of ${key} (${row.id}) fails its schema`, parsed.error.details)
    return parsed.data
  }

  /**
   * Records `value` for `key` from `effectiveFrom` on. The value is checked
   * against the key's schema first; a refused value stores nothing
   * (`settings.invalid_value`). A second write for the same key and time
   * replaces that row's value.
   */
  async setValue<K extends SettingKey>(
    key: K,
    value: SettingValueOf<K> | unknown,
    effectiveFrom: Date | string
  ): Promise<{ id: string; key: K; value: SettingValueOf<K>; effectiveFrom: string }> {
    const from = toDate(effectiveFrom, "effectiveFrom")
    const parsed = parseSettingValue(key, value)
    if (!parsed.ok) throw invalid(parsed.error.message, parsed.error.details)

    const [existing] = await this.listSettingValues({ key, effective_from: from }, { take: 1 })
    const row = existing
      ? await this.updateSettingValues({ id: existing.id, value: wrap(parsed.data) })
      : await this.createSettingValues({ key, value: wrap(parsed.data), effective_from: from })
    return { id: row.id, key, value: parsed.data as SettingValueOf<K>, effectiveFrom: from.toISOString() }
  }

  /** True when `key` has any value, at any time. */
  async hasValue(key: SettingKey): Promise<boolean> {
    const [, count] = await this.listAndCountSettingValues({ key }, { take: 1 })
    return count > 0
  }

  /** Midnight of `date` in the business time zone (`shop.time_zone` in effect at `at`). */
  async startOfBusinessDay(date: BusinessDate, at: Date | string = new Date()): Promise<Date> {
    return startOfBusinessDay(date, await this.getValue("shop.time_zone", at))
  }
}
