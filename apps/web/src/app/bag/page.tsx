import { formatRupees } from "@shop/contracts"
import type { Metadata } from "next"
import { BagLine } from "@/components/bag-line"
import { HeaderActions } from "@/components/header-actions"
import { TopBar } from "@/components/top-bar"
import { ButtonLink, Note } from "@/components/ui"
import { errorText, t, tf } from "@/lib/i18n"
import { api } from "@/lib/session"

export const metadata: Metadata = { title: t("bag.title"), robots: { index: false } }

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

/**
 * The Bag (Story 1.8): its lines, and the same four price lines in the same
 * order (Total MRP, Discount, Delivery, Total), every amount from the server.
 * The delivery charge is shown before checkout.
 */
export default async function BagPage() {
  const res = await api().getBag()

  return (
    <>
      <TopBar action={<HeaderActions />} />
      <main className="mx-auto flex max-w-content-max-web flex-col gap-4 px-gutter-phone py-4 lg:px-gutter-web lg:py-8">
        <h1 className="font-heading text-h2">{t("bag.title")}</h1>
        {!res.ok ? (
          <Note tone="danger">{res.error.code === "internal" ? t("bag.loadFailed") : errorText(res.error.code)}</Note>
        ) : res.data.lines.length === 0 ? (
          <div data-testid="bag-empty" className="flex flex-col items-center gap-3 py-12 text-center">
            <span aria-hidden className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-tint-2">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M6 7h12l-1 13H7L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
              </svg>
            </span>
            <h2 className="font-heading text-h2">{t("bag.emptyTitle")}</h2>
            <p className="max-w-form-card-web text-body text-text-muted">{t("bag.emptyBody")}</p>
            <ButtonLink href="/">{t("bag.browse")}</ButtonLink>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
            <section aria-label={t("bag.lines")} className="flex-1 rounded-xl border border-border bg-surface px-4">
              <ul>
                {res.data.lines.map((line) => (
                  <BagLine key={line.id} line={line} />
                ))}
              </ul>
            </section>
            <section
              aria-labelledby="bag-summary"
              className="rounded-xl border border-border bg-surface p-4 lg:w-[380px] lg:shrink-0"
              data-testid="bag-summary"
            >
              <h2 id="bag-summary" className="mb-3 font-heading text-h4">
                {t("bag.summary")}
              </h2>
              <dl className="flex flex-col gap-2">
                <Row
                  label={res.data.count === 1 ? t("bag.totalMrpOne") : tf("bag.totalMrp", { n: res.data.count })}
                  value={formatRupees(res.data.totalMrp)}
                  testId="bag-total-mrp"
                />
                <Row label={t("bag.discount")} value={`− ${formatRupees(res.data.discount)}`} testId="bag-discount" />
                <Row label={t("bag.delivery")} value={formatRupees(res.data.delivery)} testId="bag-delivery" />
                <Row label={t("bag.total")} value={formatRupees(res.data.total)} testId="bag-total" strong />
              </dl>
              <p className="mt-3 text-caption text-text-muted">{t("bag.taxNote")}</p>
            </section>
          </div>
        )}
      </main>
    </>
  )
}
