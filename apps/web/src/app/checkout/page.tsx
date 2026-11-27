import { formatRupees, type BagView, type CheckoutView } from "@shop/contracts"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cancelCheckoutAction } from "@/app/actions"
import { CheckoutForm } from "@/components/checkout-form"
import { ClearStaleBag } from "@/components/clear-stale-bag"
import { HeaderActions } from "@/components/header-actions"
import { TopBar } from "@/components/top-bar"
import { buttonClass, ButtonLink, Note } from "@/components/ui"
import { errorText, t, tf } from "@/lib/i18n"
import { api, hasSession, readBag } from "@/lib/session"
import { holdEndTime } from "@/lib/time"

export const metadata: Metadata = { title: t("checkout.title"), robots: { index: false } }

function Row({ label, value, testId, strong = false }: { label: string; value: string; testId: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "border-t border-border pt-3" : ""}`}>
      <dt className={strong ? "text-body-strong" : "text-body-sm text-text-muted"}>{label}</dt>
      <dd className={strong ? "font-heading text-price-lg" : "text-body-sm text-text"} data-testid={testId}>
        {value}
      </dd>
    </div>
  )
}

/** The Bag's lines and totals beside the address form, every amount from the server. */
function BagSummary({ bag }: { bag: BagView }) {
  return (
    <section aria-labelledby="checkout-summary" className="rounded-xl border border-border bg-surface p-4 lg:w-[380px] lg:shrink-0">
      <h2 id="checkout-summary" className="mb-3 font-heading text-h4">
        {t("checkout.summary")}
      </h2>
      <ul className="mb-3 flex flex-col gap-2">
        {bag.lines.map((line) => (
          <li key={line.id} className="flex justify-between gap-3 text-body-sm">
            <span className="min-w-0 text-text">
              {line.name} <span className="text-text-muted">· {tf("checkout.qty", { n: line.quantity })}</span>
            </span>
            <span className="font-heading text-price">{formatRupees(line.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col gap-2">
        <Row label={t("checkout.delivery")} value={formatRupees(bag.delivery)} testId="checkout-delivery" />
        <Row label={t("checkout.total")} value={formatRupees(bag.total)} testId="checkout-bag-total" strong />
      </dl>
      <p className="mt-3 text-caption text-text-muted">{t("checkout.taxNote")}</p>
    </section>
  )
}

/**
 * The held checkout: the snapshot's lines and total, and the time the Hold
 * ends, both from the server. The time is a plain fact, not a countdown or
 * a warning (NFR-13). No payment yet (Story 1.10).
 */
function HeldCheckout({ checkout }: { checkout: CheckoutView }) {
  const a = checkout.address
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
      <div className="flex flex-1 flex-col gap-4">
        <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4" data-testid="checkout-held">
          <h2 className="font-heading text-h3">{t("checkout.heldTitle")}</h2>
          <p className="text-body text-text" data-testid="checkout-hold-ends">
            {tf("checkout.heldUntil", { time: holdEndTime(checkout.holdExpiresAt) })}
          </p>
          <p className="text-body-sm text-text-muted">{t("checkout.paymentSoon")}</p>
        </section>
        <section aria-labelledby="checkout-deliver-to" className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
          <h2 id="checkout-deliver-to" className="mb-1 font-heading text-h4">
            {t("checkout.deliverTo")}
          </h2>
          <p className="text-body-strong">{a.name}</p>
          <p className="break-words text-body-sm text-text">{a.addressLine}</p>
          <p className="text-body-sm text-text">
            {a.city} {a.pincode}, {a.state}
          </p>
          <p className="text-body-sm text-text-muted">{a.mobile}</p>
        </section>
        <form action={cancelCheckoutAction}>
          <input type="hidden" name="checkoutId" value={checkout.id} />
          <button type="submit" data-testid="checkout-cancel" className={`${buttonClass.outline} w-full lg:w-auto`}>
            {t("checkout.cancel")}
          </button>
        </form>
      </div>
      <section aria-labelledby="checkout-summary" className="rounded-xl border border-border bg-surface p-4 lg:w-[380px] lg:shrink-0">
        <h2 id="checkout-summary" className="mb-3 font-heading text-h4">
          {t("checkout.summary")}
        </h2>
        <ul className="mb-3 flex flex-col gap-2">
          {checkout.lines.map((line) => (
            <li key={line.lineId} className="flex justify-between gap-3 text-body-sm" data-testid="checkout-line">
              <span className="min-w-0 text-text">
                {line.name} <span className="text-text-muted">· {tf("checkout.qty", { n: line.quantity })}</span>
              </span>
              <span className="font-heading text-price">{formatRupees(line.lineTotalPaise)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2">
          <Row label={t("checkout.delivery")} value={formatRupees(checkout.shippingPaise)} testId="checkout-delivery" />
          <Row label={t("checkout.total")} value={formatRupees(checkout.totalPaise)} testId="checkout-total" strong />
        </dl>
        <p className="mt-3 text-caption text-text-muted">{t("checkout.taxNote")}</p>
      </section>
    </div>
  )
}

/**
 * Checkout (Story 1.9). A signed-out Shopper is sent to sign in and back
 * here; her Bag stays in its cookie. With a live Hold the page shows the held
 * checkout; otherwise the address form and the Bag's totals.
 */
export default async function CheckoutPage() {
  if (!(await hasSession())) redirect("/sign-in?next=%2Fcheckout")
  const { result: bag, staleCookie } = await readBag()

  let body: React.ReactNode
  if (!bag.ok) {
    body = <Note tone="danger">{bag.error.code === "internal" ? t("checkout.loadFailed") : errorText(bag.error.code)}</Note>
  } else if (bag.data.lines.length === 0) {
    body = (
      <div className="flex flex-col items-start gap-3" data-testid="checkout-empty">
        <p className="text-body text-text-muted">{t("checkout.emptyBag")}</p>
        <ButtonLink href="/">{t("bag.browse")}</ButtonLink>
      </div>
    )
  } else if (bag.data.hold) {
    const checkout = await api().getCheckout(bag.data.hold.checkoutId)
    if (!checkout.ok && checkout.error.code === "auth.unauthenticated") redirect("/sign-out?next=%2Fcheckout")
    body = checkout.ok ? (
      <HeldCheckout checkout={checkout.data} />
    ) : (
      // Another Shopper's checkout holds this Bag (the same device), or it cannot be read now.
      <Note tone="danger" testId="checkout-error">
        {errorText(checkout.error.code === "checkout.not_found" ? "cart.locked" : checkout.error.code)}
      </Note>
    )
  } else {
    body = (
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        <section aria-labelledby="checkout-address" className="flex-1 rounded-xl border border-border bg-surface p-4">
          <h2 id="checkout-address" className="mb-4 font-heading text-h3">
            {t("checkout.addressTitle")}
          </h2>
          <CheckoutForm />
        </section>
        <BagSummary bag={bag.data} />
      </div>
    )
  }

  return (
    <>
      {staleCookie ? <ClearStaleBag /> : null}
      <TopBar action={<HeaderActions />} />
      <main className="mx-auto flex max-w-content-max-web flex-col gap-4 px-gutter-phone py-4 lg:px-gutter-web lg:py-8">
        <h1 className="font-heading text-h2">{t("checkout.title")}</h1>
        {body}
      </main>
    </>
  )
}
