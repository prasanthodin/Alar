import { z } from "zod"
import { ApiError } from "./errors"

/** An opaque, non-empty identifier issued by the kernel or the shop. */
export const Id = z.string().min(1)
export type Id = z.infer<typeof Id>

/** A UTC timestamp in ISO 8601 form, e.g. `2026-11-27T10:15:00.000Z`. Offsets other than `Z` are refused. */
export const IsoDateTime = z.iso.datetime()
export type IsoDateTime = z.infer<typeof IsoDateTime>

/** The outcome of every api-client call: data or a typed error, never a thrown kernel type. */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

/** Builds the zod schema of a `Result<T>` for a given data schema. */
export function resultSchema<T extends z.ZodType>(data: T) {
  return z.discriminatedUnion("ok", [
    z.object({ ok: z.literal(true), data }),
    z.object({ ok: z.literal(false), error: ApiError }),
  ])
}

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function fail<T = never>(
  code: ApiError["code"],
  message: string,
  details?: ApiError["details"]
): Result<T> {
  return { ok: false, error: details ? { code, message, details } : { code, message } }
}
