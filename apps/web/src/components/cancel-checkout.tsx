"use client"

import { useActionState } from "react"
import { cancelCheckoutAction, type CancelCheckoutState } from "@/app/actions"
import { errorText, t } from "@/lib/i18n"
import { buttonClass, Note } from "./ui"

/** "Cancel checkout": releases the Hold and goes to the Bag; a failure is said here, and the Bag stays held. */
export function CancelCheckout({ checkoutId }: { checkoutId: string }) {
  const [state, action, pending] = useActionState<CancelCheckoutState, FormData>(cancelCheckoutAction, { error: null })
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="checkoutId" value={checkoutId} />
      {state.error ? (
        <Note tone="danger" testId="checkout-cancel-error">
          {errorText(state.error)}
        </Note>
      ) : null}
      <button type="submit" disabled={pending} data-testid="checkout-cancel" className={`${buttonClass.outline} w-full lg:w-auto`}>
        {pending ? t("checkout.cancelling") : t("checkout.cancel")}
      </button>
    </form>
  )
}
