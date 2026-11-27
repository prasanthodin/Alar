import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  CheckoutSnapshot,
  CheckoutView,
  type CheckoutStatus,
  type HoldStatus,
} from "@shop/contracts"
import { CHECKOUT_MODULE, type CheckoutModuleService } from "../modules/checkout"
import { HOLD_MODULE, type HoldModuleService } from "../modules/hold"
import { shopError } from "./shop-errors"
import { quantity } from "./stock"

/**
 * Holds and Checkouts (Story 1.9, AD-6). A Hold is a shop record plus kernel
 * reservations whose `external_id` is the Hold's id; only `begin-checkout`
 * and `release-hold` create and remove them.
 */

/** The prefix of a Hold id, and so of the `external_id` of every Hold reservation. */
export const HOLD_ID_PREFIX = "hold_"

/** True for a kernel reservation made by a Hold. */
export function isHoldReservation(reservation: { external_id?: string | null }): boolean {
  return typeof reservation.external_id === "string" && reservation.external_id.startsWith(HOLD_ID_PREFIX)
}

export type HoldRow = {
  id: string
  checkout_id: string
  cart_id: string
  expires_at: Date | string
  status: HoldStatus
  ended_at?: Date | string | null
}

export type CheckoutRow = {
  id: string
  cart_id: string
  customer_id: string
  status: CheckoutStatus
  snapshot: unknown
  created_at: Date | string
}

export const holds = (container: MedusaContainer) => container.resolve<HoldModuleService>(HOLD_MODULE)
export const checkouts = (container: MedusaContainer) => container.resolve<CheckoutModuleService>(CHECKOUT_MODULE)

/** True when a live Hold's time has run out (it stays live until `release-hold` ends it). */
export function holdExpired(hold: Pick<HoldRow, "expires_at">, now: Date = new Date()): boolean {
  return new Date(hold.expires_at).getTime() <= now.getTime()
}

/** The cart's live Hold (expired or not; at most one, by a unique index), or null. */
export async function findLiveHold(container: MedusaContainer, cartId: string): Promise<HoldRow | null> {
  const [hold] = await holds(container).listHolds({ cart_id: cartId, status: "live" }, { take: 1 })
  return (hold as unknown as HoldRow | undefined) ?? null
}

/** The cart's Hold that locks it now: live and not yet expired. */
export async function findLockingHold(container: MedusaContainer, cartId: string, now: Date = new Date()) {
  const hold = await findLiveHold(container, cartId)
  return hold && !holdExpired(hold, now) ? hold : null
}

/** The live Holds whose time has run out, oldest first (at most `limit`). */
export async function listExpiredLiveHolds(container: MedusaContainer, now: Date, limit: number): Promise<HoldRow[]> {
  const rows = await holds(container).listHolds(
    { status: "live", expires_at: { $lte: now } },
    { order: { expires_at: "ASC" }, take: limit }
  )
  return rows as unknown as HoldRow[]
}

export type HoldReservation = {
  id: string
  inventory_item_id: string
  location_id: string
  quantity: number
  external_id: string | null
}

/** A kernel reservation row with the fields the shared DTO type leaves out (the model has them). */
export type ReservationRow = {
  id: string
  inventory_item_id: string
  location_id: string
  quantity: unknown
  external_id?: string | null
  metadata?: Record<string, unknown> | null
}

/** The kernel reservations tagged with this Hold id (`external_id`). */
export async function reservationsOfHold(container: MedusaContainer, holdId: string): Promise<ReservationRow[]> {
  // `external_id` is a column of the reservation model, though the filter type does not list it.
  const rows = await container.resolve(Modules.INVENTORY).listReservationItems({ external_id: holdId } as never)
  return rows as unknown as ReservationRow[]
}

/** The kernel reservations of one Hold. */
export async function listHoldReservations(container: MedusaContainer, holdId: string): Promise<HoldReservation[]> {
  return (await reservationsOfHold(container, holdId)).map((r) => ({
    id: r.id,
    inventory_item_id: r.inventory_item_id,
    location_id: r.location_id,
    quantity: quantity(r.quantity),
    external_id: r.external_id ?? null,
  }))
}

/** Pieces reserved by Holds, per inventory item, at a location. */
export async function heldByInventoryItem(
  container: MedusaContainer,
  inventoryItemIds: readonly string[],
  locationId: string
): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  if (inventoryItemIds.length === 0) return out
  const rows = await container
    .resolve(Modules.INVENTORY)
    .listReservationItems({ inventory_item_id: [...new Set(inventoryItemIds)], location_id: locationId })
  for (const r of rows as unknown as ReservationRow[]) {
    if (!isHoldReservation(r)) continue
    out.set(r.inventory_item_id, (out.get(r.inventory_item_id) ?? 0) + quantity(r.quantity))
  }
  return out
}

/** Pieces reserved by one Hold, per inventory item. */
export async function reservedByHold(container: MedusaContainer, holdId: string): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  for (const r of await listHoldReservations(container, holdId)) {
    out.set(r.inventory_item_id, (out.get(r.inventory_item_id) ?? 0) + r.quantity)
  }
  return out
}

const iso = (value: Date | string) => new Date(value).toISOString()

/** A Checkout row and its Hold as the Shopper's view. A stored snapshot that fails its schema is `internal`. */
export function toCheckoutView(checkout: CheckoutRow, hold: Pick<HoldRow, "expires_at">): CheckoutView {
  const snapshot = CheckoutSnapshot.safeParse(checkout.snapshot)
  if (!snapshot.success) throw shopError("internal", `The snapshot of Checkout ${checkout.id} is not valid`)
  return CheckoutView.parse({
    id: checkout.id,
    status: checkout.status,
    lines: snapshot.data.lines,
    shippingPaise: snapshot.data.shippingPaise,
    totalPaise: snapshot.data.totalPaise,
    holdExpiresAt: iso(hold.expires_at),
    address: snapshot.data.address,
    createdAt: iso(checkout.created_at),
  })
}

/**
 * A Shopper's Checkout as her view. Another Shopper's Checkout, or none, is
 * `checkout.not_found`, so one cannot be told from the other.
 */
export async function loadCheckoutView(
  container: MedusaContainer,
  checkoutId: string,
  customerId: string
): Promise<CheckoutView> {
  const notFound = () => shopError("checkout.not_found", `No Checkout ${checkoutId}`)
  const [checkout] = await checkouts(container).listCheckouts({ id: checkoutId }, { take: 1 })
  const row = checkout as unknown as CheckoutRow | undefined
  if (!row || row.customer_id !== customerId) throw notFound()
  const [hold] = await holds(container).listHolds({ checkout_id: checkoutId }, { take: 1 })
  if (!hold) throw shopError("internal", `Checkout ${checkoutId} has no Hold`)
  return toCheckoutView(row, hold as unknown as HoldRow)
}
