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
  // No longer on sale, or none left: it can only be removed.
  const unavailable = !line.buyable || line.stock === 0
  // More in the Bag than are available now (the stock went down since it was added).
  const overStock = !unavailable && line.quantity > line.stock
  const atMost = line.quantity >= line.stock
  const href = line.handle ? `/designs/${encodeURIComponent(line.handle)}` : null

  const quantityForm = (quantity: number, children: React.ReactNode, props: { label?: string; testId: string; disabled: boolean; className: string }) => (
    <form action={setQuantity}>
      <input type="hidden" name="lineId" value={line.id} />
      <input type="hidden" name="quantity" value={quantity} />
      <button type="submit" aria-label={props.label} data-testid={props.testId} disabled={props.disabled} className={props.className}>
        {children}
      </button>
    </form>
  )

  const photo = line.image ? <Photo image={line.image} /> : <span className="block aspect-[4/5] rounded-md bg-photo-ground" />

  return (
    <li data-testid="bag-line" data-buyable={!unavailable} className="flex gap-3 border-b border-border py-4 last:border-b-0">
      {href ? (
        <Link href={href} className="w-[72px] shrink-0">
          {photo}
        </Link>
      ) : (
        <span className="w-[72px] shrink-0">{photo}</span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            {href ? (
              <Link href={href} className="text-body-sm font-bold text-text hover:text-primary-text">
                {line.name}
              </Link>
            ) : (
              <span className="text-body-sm font-bold text-text">{line.name}</span>
            )}
            <span className="text-caption text-text-muted">{tf("bag.each", { price: formatRupees(line.price) })}</span>
          </div>
          <span className="font-heading text-price" data-testid="bag-line-total">
            {formatRupees(line.lineTotal)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {unavailable ? null : (
            <div
              role="group"
              aria-label={t("bag.quantity")}
              className="inline-flex h-stepper items-center rounded-sm border border-tint-3"
            >
              {quantityForm(line.quantity - 1, "−", {
                label: t("bag.decrease"),
                testId: "bag-decrease",
                // One fewer must still fit the stock; above it, "Change to N" does the job.
                disabled: busy || line.quantity <= 1 || line.quantity - 1 > line.stock,
                className: stepButton,
              })}
              <span data-testid="bag-quantity" aria-live="polite" className="min-w-8 text-center text-body-sm font-bold">
                {line.quantity}
              </span>
              {quantityForm(line.quantity + 1, "+", {
                label: t("bag.increase"),
                testId: "bag-increase",
                disabled: busy || atMost,
                className: stepButton,
              })}
            </div>
          )}
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
        {unavailable ? (
          <span className="text-caption text-danger" data-testid="bag-unavailable">
            {t(line.buyable ? "bag.soldOutLine" : "bag.unavailableLine")}
          </span>
        ) : overStock ? (
          <div className="flex flex-wrap items-center gap-3" data-testid="bag-over-stock">
            <span className="text-caption text-danger">{tf("bag.overStock", { n: line.stock })}</span>
            {quantityForm(line.stock, tf("bag.setToStock", { n: line.stock }), {
              testId: "bag-set-to-stock",
              disabled: busy,
              className: "text-body-sm font-semibold text-primary disabled:text-text-muted",
            })}
          </div>
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
