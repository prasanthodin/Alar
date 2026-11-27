"use server"

import type { ErrorCode } from "@shop/contracts"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
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
  redirect("/account")
}

export async function signInAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = field(form, "email").trim()
  const res = await api().signIn({ email, password: field(form, "password") })
  if (!res.ok) return { error: res.error.code, email }
  redirect("/account")
}

export async function signOutAction(): Promise<void> {
  await api().signOut()
  redirect("/sign-in")
}

/** What a Bag change answers: the error to show, or the number of changes made so far. */
export type BagActionState = { error: ErrorCode | null; done: number }

function positiveInt(form: FormData, name: string): number {
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
  const res = await api().setBagQuantity(field(form, "lineId"), positiveInt(form, "quantity"))
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
