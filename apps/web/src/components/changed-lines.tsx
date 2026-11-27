"use client"

import { formatRupees, type ChangedLine } from "@shop/contracts"
import Link from "next/link"
import { useActionState } from "react"
import { removeFromBagAction, setBagQuantityAction, type BagActionState } from "@/app/actions"
import { errorText, t, tf } from "@/lib/i18n"
import { Note } from "./ui"

const linkButton = "text-body-sm font-semibold text-primary disabled:text-text-muted"

/** One changed line: what changed, and the one action that resolves it (accept, change to what is left, or remove). */
function Line({ line }: { line: ChangedLine }) {
  const initial: BagActionState = { error: null, done: 0 }
  const [setState, setQuantity, setting] = useActionState(setBagQuantityAction, initial)
  const [removeState, remove, removing] = useActionState(removeFromBagAction, initial)
  const done = setState.done > 0 || removeState.done > 0
  const error = setState.error ?? removeState.error
  const busy = setting || removing || done

  const what =
    line.reason === "price_changed" && line.currentPricePaise !== null
      ? tf("checkout.priceChanged", { now: formatRupees(line.currentPricePaise), was: formatRupees(line.unitPricePaise) })
      : line.reason === "short_of_stock"
        ? line.available > 0
          ? tf("checkout.shortOfStock", { n: line.available })
          : t("checkout.noneLeft")
        : t("checkout.unavailable")

  const setTo = (quantity: number, label: string, testId: string) => (
    <form action={setQuantity}>
      <input type="hidden" name="lineId" value={line.lineId} />
      <input type="hidden" name="quantity" value={quantity} />
      <button type="submit" disabled={busy} data-testid={testId} className={linkButton}>
        {label}
      </button>
    </form>
  )

  return (
    <li data-testid="changed-line" data-reason={line.reason} className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0">
      <span className="text-body-sm font-bold text-text">{line.name}</span>
      <span className="text-caption text-warning">{what}</span>
      <div className="flex flex-wrap items-center gap-4">
        {line.reason === "price_changed" ? setTo(line.quantity, t("checkout.acceptPrice"), "accept-price") : null}
        {line.reason === "short_of_stock" && line.available > 0
          ? setTo(line.available, tf("checkout.setToStock", { n: line.available }), "set-to-stock")
          : null}
        <form action={remove}>
          <input type="hidden" name="lineId" value={line.lineId} />
          <button type="submit" disabled={busy} data-testid="remove-line" className={linkButton}>
            {t("checkout.remove")}
          </button>
        </form>
      </div>
      {error ? <Note tone="danger">{errorText(error)}</Note> : null}
    </li>
  )
}

/**
 * The lines that stopped checkout (`cart.changed`), each with what changed.
 * She accepts or changes each, then holds her items again.
 */
export function ChangedLines({ lines }: { lines: ChangedLine[] }) {
  return (
    <section
      aria-labelledby="changed-title"
      data-testid="checkout-changed"
      className="rounded-xl bg-warning-tint px-4 py-3"
    >
      <h2 id="changed-title" className="font-heading text-h4">
        {t("checkout.changedTitle")}
      </h2>
      <p className="text-body-sm text-text">{t("checkout.changedBody")}</p>
      <ul>
        {lines.map((line) => (
          <Line key={line.lineId} line={line} />
        ))}
      </ul>
      <Link href="/bag" className="text-body-sm font-semibold text-primary">
        {t("checkout.reviewBag")}
      </Link>
    </section>
  )
}
