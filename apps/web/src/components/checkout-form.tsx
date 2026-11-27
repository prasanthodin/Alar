"use client"

import { INDIAN_STATES } from "@shop/contracts"
import { useActionState } from "react"
import { beginCheckoutAction, type CheckoutFormState } from "@/app/actions"
import { errorText, t, type MessageKey } from "@/lib/i18n"
import { ChangedLines } from "./changed-lines"
import { buttonClass, Note } from "./ui"

type Field = {
  name: "name" | "mobile" | "addressLine" | "city" | "pincode"
  label: MessageKey
  autoComplete: string
  type?: "text" | "tel"
  inputMode?: "text" | "numeric" | "tel"
  maxLength: number
  hint?: MessageKey
}

const FIELDS: Field[] = [
  { name: "name", label: "checkout.name", autoComplete: "name", maxLength: 100 },
  { name: "mobile", label: "checkout.mobile", autoComplete: "tel-national", type: "tel", inputMode: "tel", maxLength: 14, hint: "checkout.mobileHint" },
  { name: "addressLine", label: "checkout.addressLine", autoComplete: "street-address", maxLength: 200 },
  { name: "city", label: "checkout.city", autoComplete: "address-level2", maxLength: 100 },
  { name: "pincode", label: "checkout.pincode", autoComplete: "postal-code", inputMode: "numeric", maxLength: 6, hint: "checkout.pincodeHint" },
]

const fieldClass =
  "h-field w-full rounded-sm border border-border-control bg-surface px-3 text-field-web text-text placeholder:text-placeholder focus:border-primary aria-[invalid=true]:border-danger"

const initial: CheckoutFormState = { error: null, fields: [], changed: [], values: {} }

/**
 * The delivery address and "Hold my items" (Story 1.9). Every field is
 * required; the server checks them (10-digit mobile, 6-digit pincode, a
 * state of India) and answers what to fix. A changed Bag lists its changed
 * lines to accept first.
 */
export function CheckoutForm() {
  const [state, action, pending] = useActionState(beginCheckoutAction, initial)
  const invalid = (name: string) => state.error === "input.invalid" && (state.fields.length === 0 || state.fields.includes(name))

  return (
    <div className="flex flex-col gap-4">
      {state.error === "cart.changed" && state.changed.length ? <ChangedLines lines={state.changed} /> : null}
      {/* Keyed by what she typed, so after a refused try the form (the state select too) shows it again. */}
      <form
        key={JSON.stringify(state.values)}
        action={action}
        className="flex flex-col gap-4"
        noValidate
        data-testid="checkout-form"
      >
        {state.error && state.error !== "cart.changed" ? (
          <Note tone="danger" testId="checkout-error">
            {state.error === "input.invalid" ? t("checkout.inputInvalid") : errorText(state.error)}
          </Note>
        ) : null}
        {FIELDS.map((f) => (
          <div key={f.name} className="flex flex-col gap-1">
            <label htmlFor={`checkout-${f.name}`} className="text-body-strong">
              {t(f.label)}
            </label>
            <input
              id={`checkout-${f.name}`}
              name={f.name}
              type={f.type ?? "text"}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              maxLength={f.maxLength}
              required
              defaultValue={state.values[f.name] ?? ""}
              aria-invalid={invalid(f.name) ? true : undefined}
              aria-describedby={f.hint || invalid(f.name) ? `checkout-${f.name}-hint` : undefined}
              className={fieldClass}
            />
            {f.hint || invalid(f.name) ? (
              <span id={`checkout-${f.name}-hint`} className={`text-caption ${invalid(f.name) ? "text-danger" : "text-text-muted"}`}>
                {invalid(f.name) ? `${t("checkout.fieldInvalid")} ${f.hint ? t(f.hint) : ""}`.trim() : t(f.hint!)}
              </span>
            ) : null}
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <label htmlFor="checkout-state" className="text-body-strong">
            {t("checkout.state")}
          </label>
          <select
            id="checkout-state"
            name="state"
            required
            autoComplete="address-level1"
            defaultValue={state.values.state ?? ""}
            aria-invalid={invalid("state") ? true : undefined}
            className={fieldClass}
          >
            <option value="" disabled>
              {t("checkout.statePlaceholder")}
            </option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <p className="text-body-sm text-text-muted">{t("checkout.holdIntro")}</p>
        <button type="submit" disabled={pending} data-testid="checkout-submit" className={`${buttonClass.primary} w-full`}>
          {pending ? t("checkout.pending") : t("checkout.submit")}
        </button>
      </form>
    </div>
  )
}
