"use server"

import type { ErrorCode } from "@shop/contracts"
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
