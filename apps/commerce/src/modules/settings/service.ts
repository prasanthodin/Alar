import type { Logger } from "@medusajs/framework/types"
import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import {
  IsoDateTime,
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

/** A `Date` or a full UTC ISO 8601 time (`...Z`); a date-only or offset string is refused. */
function toInstant(value: Date | string, what: string): Date {
  if (typeof value === "string" && !IsoDateTime.safeParse(value).success) {
    throw invalid(`${what} must be a UTC ISO 8601 time such as 2026-11-28T18:30:00.000Z`)
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw invalid(`${what} is not a valid time`)
  return date
}

export type SetValueOptions = {
  /**
   * Allows an `effectiveFrom` in the past. Only the initial seed uses it, for
   * its fixed seed instant; every other change takes effect now or later, so a
   * value that already applied is never rewritten (AD-13).
   */
  allowPast?: boolean
}

/**
 * Dated shop settings. Only this module writes `setting_value`; everything
 * else reads through `getValue`.
 */
export default class SettingsModuleService extends MedusaService({ SettingValue }) {
  protected readonly logger_: Logger

  // A mixin's constructor takes `any[]` (TypeScript rule for extending MedusaService).
  constructor(...args: any[]) {
    super(...args)
    this.logger_ = args[0].logger
  }

  /**
   * The value of `key` in effect at `at` (default now): the one whose effective
   * time is the latest not after `at`. Throws `settings.not_found` when none is.
   * A stored value that fails the key's schema is a fault on the shop's side:
   * it is logged with its key and thrown as an unexpected state (`internal`, 500).
   */
  async getValue<K extends SettingKey>(key: K, at: Date | string = new Date()): Promise<SettingValueOf<K>> {
    const when = toInstant(at, "at")
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
    if (!parsed.ok) {
      this.logger_.error(`settings: stored value ${row.id} of ${key} fails its schema`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `A stored setting is not valid (${key})`, "internal")
    }
    return parsed.data
  }

  /**
   * Records `value` for `key` from `effectiveFrom` on. The value is checked
   * against the key's schema first; a refused value stores nothing
   * (`settings.invalid_value`). `effectiveFrom` earlier than now is refused
   * (`settings.past_effective_from`) unless `allowPast` is set. A second write
   * for the same key and instant replaces that (future) row's value, also when
   * two writes race.
   */
  async setValue<K extends SettingKey>(
    key: K,
    value: SettingValueOf<K>,
    effectiveFrom: Date | string,
    options: SetValueOptions = {}
  ): Promise<{ id: string; key: K; value: SettingValueOf<K>; effectiveFrom: string }> {
    const from = toInstant(effectiveFrom, "effectiveFrom")
    if (!options.allowPast && from.getTime() < Date.now()) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `A value of ${key} cannot take effect in the past (${from.toISOString()})`,
        "settings.past_effective_from"
      )
    }
    const parsed = parseSettingValue(key, value)
    if (!parsed.ok) throw invalid(parsed.error.message, parsed.error.details)
    const stored = wrap(parsed.data)

    const replace = async () => {
      const [existing] = await this.listSettingValues({ key, effective_from: from }, { take: 1 })
      return existing ? this.updateSettingValues({ id: existing.id, value: stored }) : null
    }
    let row = await replace()
    if (!row) {
      try {
        row = await this.createSettingValues({ key, value: stored, effective_from: from })
      } catch (e) {
        // Another write created the row for this instant meanwhile (unique index): replace its value.
        row = await replace()
        if (!row) throw e
      }
    }
    return { id: row.id, key, value: parsed.data, effectiveFrom: from.toISOString() }
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
