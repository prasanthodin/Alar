"use client"

import Link from "next/link"
import { useActionState } from "react"
import type { FormState } from "@/app/actions"
import { errorText, t, type MessageKey } from "@/lib/i18n"
import { buttonClass } from "./ui"

type Field = {
  name: string
  label: MessageKey
  type: "email" | "password" | "text"
  autoComplete: string
  required?: boolean
  minLength?: number
  hint?: MessageKey
}

const fieldClass =
  "h-field w-full rounded-sm border border-border-control bg-surface px-3 text-field-web text-text placeholder:text-placeholder focus:border-primary"

export function AuthForm({
  action,
  fields,
  submit,
  pending: pendingLabel,
  footer,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>
  fields: Field[]
  submit: MessageKey
  pending: MessageKey
  footer: { text: MessageKey; link: MessageKey; href: string }
}) {
  const [state, formAction, pending] = useActionState(action, { error: null, email: "" })

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <p
          role="alert"
          data-testid="form-error"
          className="rounded-md border border-danger-line bg-danger-tint px-3 py-2 text-body-sm text-danger"
        >
          {errorText(state.error)}
        </p>
      ) : null}
      {fields.map((f) => (
        <div key={f.name} className="flex flex-col gap-1">
          <label htmlFor={f.name} className="text-body-strong">
            {t(f.label)}
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            required={f.required}
            minLength={f.minLength}
            aria-describedby={f.hint ? `${f.name}-hint` : undefined}
            aria-invalid={state.error === "input.invalid" ? true : undefined}
            defaultValue={f.name === "email" ? state.email : undefined}
            className={fieldClass}
          />
          {f.hint ? (
            <span id={`${f.name}-hint`} className="text-caption text-text-muted">
              {t(f.hint)}
            </span>
          ) : null}
        </div>
      ))}
      <button type="submit" disabled={pending} className={`${buttonClass.primary} w-full`}>
        {t(pending ? pendingLabel : submit)}
      </button>
      <p className="text-body-sm text-text-muted">
        {t(footer.text)}{" "}
        <Link href={footer.href} className="font-semibold text-primary hover:underline">
          {t(footer.link)}
        </Link>
      </p>
    </form>
  )
}
