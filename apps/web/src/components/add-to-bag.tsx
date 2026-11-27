"use client"

import Link from "next/link"
import { useActionState } from "react"
import { addToBagAction, type BagActionState } from "@/app/actions"
import { errorText, t } from "@/lib/i18n"
import { buttonClass, Note } from "./ui"

/**
 * "Add to bag" on the Design page. Sold out (or a preview) shows the button
 * disabled instead of hiding it. The server decides whether a Piece is left.
 */
export function AddToBag({ variantId, disabled, label }: { variantId: string; disabled: boolean; label: string }) {
  const [state, action, pending] = useActionState<BagActionState, FormData>(addToBagAction, { error: null, done: 0 })
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="variantId" value={variantId} />
      <button
        type="submit"
        data-testid="add-to-bag"
        disabled={disabled || pending}
        className={`${buttonClass.primary} h-button-lg-web w-full lg:max-w-sm`}
      >
        {pending ? t("design.adding") : label}
      </button>
      {state.error ? (
        <Note tone="danger" testId="add-to-bag-error">
          {errorText(state.error)}
        </Note>
      ) : state.done > 0 ? (
        <Note tone="success" testId="add-to-bag-done">
          {t("design.added")}{" "}
          <Link href="/bag" className="font-semibold underline">
            {t("design.goToBag")}
          </Link>
        </Note>
      ) : null}
    </form>
  )
}
