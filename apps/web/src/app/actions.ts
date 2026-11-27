"use server"

import type { CheckoutAddressInput, ErrorCode } from "@shop/contracts"
import { CartChangedDetails } from "@shop/contracts"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { safeReturnPath } from "@/lib/return-path"
import { api } from "@/lib/session"

export type FormState = { error: ErrorCode | null; email: string }

function field(form: FormData, name: string): string {
  const v = form.get(name)
  return typeof v === "string" ? v : ""
}

function optional(form: FormData, name: string): string | undefined {
  const v = field(form, name).trim()
  return v ? v : undefined
}

export async function signUpAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = field(form, "email").trim()
  const res = await api().signUp({
    email,
    password: field(form, "password"),
    firstName: optional(form, "firstName"),
    lastName: optional(form, "lastName"),
  })
  if (!res.ok) return { error: res.error.code, email }
  // Back where she came from (checkout sends her here with ?next=/checkout), else her account.
  redirect(safeReturnPath(field(form, "next")) ?? "/account")
}

export async function signInAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = field(form, "email").trim()
  const res = await api().signIn({ email, password: field(form, "password") })
  if (!res.ok) return { error: res.error.code, email }
  redirect(safeReturnPath(field(form, "next")) ?? "/account")
}

export async function signOutAction(): Promise<void> {
  await api().signOut()
  redirect("/sign-in")
}

/** What a Bag change answers: the error to show, or the number of changes made so far. */
export type BagActionState = { error: ErrorCode | null; done: number }

/** A form field as a whole number, or NaN (which api-client refuses as input.invalid). */
function wholeNumber(form: FormData, name: string): number {
  const n = Number(field(form, name))
  return Number.isInteger(n) ? n : NaN
}

/** After a change, the Bag page and the header's count show the server's Bag again. */
function changed(prev: BagActionState): BagActionState {
  refresh()
  return { error: null, done: prev.done + 1 }
}

/** Adds one Piece of a Variant to the Bag (Story 1.8). Refused with bag.stock_exceeded when none is left for it. */
export async function addToBagAction(prev: BagActionState, form: FormData): Promise<BagActionState> {
  const res = await api().addToBag(field(form, "variantId"), 1)
  if (!res.ok) return { error: res.error.code, done: prev.done }
  return changed(prev)
}

/** Sets a line's quantity. A refused change leaves the line as it was. */
export async function setBagQuantityAction(prev: BagActionState, form: FormData): Promise<BagActionState> {
  const res = await api().setBagQuantity(field(form, "lineId"), wholeNumber(form, "quantity"))
  if (!res.ok) {
    refresh()
    return { error: res.error.code, done: prev.done }
  }
  return changed(prev)
}

/** Removes a line from the Bag. */
export async function removeFromBagAction(prev: BagActionState, form: FormData): Promise<BagActionState> {
  const res = await api().removeFromBag(field(form, "lineId"))
  if (!res.ok) {
    refresh()
    return { error: res.error.code, done: prev.done }
  }
  return changed(prev)
}

/**
 * Reads the Bag again from a server action, where cookies can be written: a
 * stored Bag that no longer exists (or was bought) has its cookie cleared.
 * Called by the page when it rendered such a Bag.
 */
export async function clearStaleBagAction(): Promise<void> {
  await api().getBag()
}

/** The address fields of the checkout form, in its order. */
const ADDRESS_FIELDS = ["name", "mobile", "addressLine", "city", "pincode", "state"] as const

/**
 * What beginning checkout answers when it does not go on to the held
 * checkout: the error, the fields to check (`input.invalid`), the changed
 * lines to accept first (`cart.changed`), and what she typed, to fill the
 * form in again.
 */
export type CheckoutFormState = {
  error: ErrorCode | null
  fields: string[]
  changed: CartChangedDetails["lines"]
  values: Partial<Record<(typeof ADDRESS_FIELDS)[number], string>>
}

/**
 * Begins checkout (Story 1.9): the server re-checks the Bag, snapshots it and
 * holds its Pieces; then the page shows the held checkout. A signed-out
 * Shopper (or an ended session) is sent to sign in and back here.
 */
export async function beginCheckoutAction(_prev: CheckoutFormState, form: FormData): Promise<CheckoutFormState> {
  const values = Object.fromEntries(ADDRESS_FIELDS.map((name) => [name, field(form, name)])) as CheckoutFormState["values"]
  const res = await api().beginCheckout(values as CheckoutAddressInput)
  if (res.ok) redirect("/checkout")
  if (res.error.code === "auth.unauthenticated") redirect("/sign-out?next=%2Fcheckout")
  const details = res.error.details ?? {}
  const changed = res.error.code === "cart.changed" ? CartChangedDetails.safeParse(details) : null
  refresh()
  return {
    error: res.error.code,
    fields: Array.isArray(details.fields) ? details.fields.filter((f): f is string => typeof f === "string") : [],
    changed: changed?.success ? changed.data.lines : [],
    values,
  }
}

/** Cancels the checkout: the Pieces go back to stock and the Bag can be changed again. */
export async function cancelCheckoutAction(form: FormData): Promise<void> {
  const res = await api().cancelCheckout(field(form, "checkoutId"))
  if (!res.ok && res.error.code === "auth.unauthenticated") redirect("/sign-out?next=%2Fcheckout")
  redirect("/bag")
}
