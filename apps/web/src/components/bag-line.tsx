"use client"

import { formatRupees, type BagLine as BagLineView } from "@shop/contracts"
import Link from "next/link"
import { useActionState } from "react"
import { removeFromBagAction, setBagQuantityAction, type BagActionState } from "@/app/actions"
import { errorText, t, tf } from "@/lib/i18n"
import { Photo } from "./photo"
import { Note } from "./ui"

const stepButton =
  "inline-flex h-stepper w-8 items-center justify-center text-body-strong text-primary-text disabled:text-text-muted"

/**
 * One line of the Bag: photo, name, price each and the server's line total,
 * a quantity stepper that stops at the Pieces available and says why, and
 * Remove. Every amount comes from the server; this only formats it.
 */
export function BagLine({ line }: { line: BagLineView }) {
  const initial: BagActionState = { error: null, done: 0 }
  const [qtyState, setQuantity, settingQty] = useActionState(setBagQuantityAction, initial)
  const [removeState, remove, removing] = useActionState(removeFromBagAction, initial)
  const busy = settingQty || removing
  const error = qtyState.error ?? removeState.error
  const atMost = line.quantity >= line.stock

  return (
    <li data-testid="bag-line" className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <Link href={`/designs/${encodeURIComponent(line.handle)}`} className="w-[72px] shrink-0">
        <Photo image={line.image} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              href={`/designs/${encodeURIComponent(line.handle)}`}
              className="text-body-sm font-bold text-text hover:text-primary-text"
            >
              {line.name}
            </Link>
            <span className="text-caption text-text-muted">{tf("bag.each", { price: formatRupees(line.price) })}</span>
          </div>
          <span className="font-heading text-price" data-testid="bag-line-total">
            {formatRupees(line.lineTotal)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div
            role="group"
            aria-label={t("bag.quantity")}
            className="inline-flex h-stepper items-center rounded-sm border border-tint-3"
          >
            <form action={setQuantity}>
              <input type="hidden" name="lineId" value={line.id} />
              <input type="hidden" name="quantity" value={line.quantity - 1} />
              <button
                type="submit"
                aria-label={t("bag.decrease")}
                data-testid="bag-decrease"
                disabled={busy || line.quantity <= 1}
                className={stepButton}
              >
                −
              </button>
            </form>
            <span data-testid="bag-quantity" aria-live="polite" className="min-w-8 text-center text-body-sm font-bold">
              {line.quantity}
            </span>
            <form action={setQuantity}>
              <input type="hidden" name="lineId" value={line.id} />
              <input type="hidden" name="quantity" value={line.quantity + 1} />
              <button
                type="submit"
                aria-label={t("bag.increase")}
                data-testid="bag-increase"
                disabled={busy || atMost}
                className={stepButton}
              >
                +
              </button>
            </form>
          </div>
          <form action={remove}>
            <input type="hidden" name="lineId" value={line.id} />
            <button
              type="submit"
              data-testid="bag-remove"
              disabled={busy}
              className="text-body-sm font-semibold text-primary disabled:text-text-muted"
            >
              {t("bag.remove")}
            </button>
          </form>
        </div>
        {line.stock === 0 ? (
          <span className="text-caption text-danger">{t("bag.soldOutLine")}</span>
        ) : atMost ? (
          <span className="text-caption text-text-muted" data-testid="bag-stock-limit">
            {tf("bag.onlyAvailable", { n: line.stock })}
          </span>
        ) : null}
        {error ? <Note tone="danger" testId="bag-line-error">{errorText(error)}</Note> : null}
      </div>
    </li>
  )
}
