import { formatRupees, type DesignDetails } from "@shop/contracts"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
import { AddToBag } from "@/components/add-to-bag"
import { HeaderActions } from "@/components/header-actions"
import { Photo } from "@/components/photo"
import { TopBar } from "@/components/top-bar"
import { Note, StatusChip } from "@/components/ui"
import { errorText, t, tf, type MessageKey } from "@/lib/i18n"
import { publicApi } from "@/lib/session"

type Props = {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * One read per request, shared by the metadata and the page (React `cache`).
 * The catalogue is the same for everyone, so it is read without the Shopper's cookies.
 */
const getDesign = cache((handle: string, preview: string | undefined) =>
  publicApi().getDesign(handle, preview ? { preview } : {})
)

async function load({ params, searchParams }: Props) {
  const { handle } = await params
  const { preview } = await searchParams
  return getDesign(handle, typeof preview === "string" ? preview : undefined)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const res = await load(props)
  if (!res.ok) return { title: t("notFound.title") }
  // A preview is not for search engines, and its link (with the token) is never sent on as a referrer.
  return {
    title: res.data.name,
    ...(res.data.preview ? { robots: { index: false, follow: false }, referrer: "no-referrer" as const } : {}),
  }
}

/** The details a Shopper sees, in a fixed order; empty ones are left out. Never a Weaver. */
function detailRows(details: DesignDetails): { label: string; value: string }[] {
  const rows: { label: MessageKey; value: string | null }[] = [
    { label: "detail.fibre", value: details.fibre },
    { label: "detail.weave", value: details.weave },
    { label: "detail.length", value: details.lengthM === null ? null : tf("detail.metres", { m: details.lengthM }) },
    { label: "detail.width", value: details.widthM === null ? null : tf("detail.metres", { m: details.widthM }) },
    {
      label: "detail.blousePiece",
      value: t(details.blousePieceIncluded ? "detail.blousePieceIncluded" : "detail.blousePieceNotIncluded"),
    },
    { label: "detail.care", value: details.care },
    { label: "detail.countryOfOrigin", value: details.countryOfOrigin },
  ]
  return rows.flatMap((r) => (r.value ? [{ label: t(r.label), value: r.value }] : []))
}

const previewTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(
    new Date(iso)
  )

/** The Design page (Story 1.8): photos, price with the tax note, description, details, stock status, Add to bag. */
export default async function DesignPage(props: Props) {
  const res = await load(props)
  if (!res.ok) {
    if (res.error.code === "design.not_found") notFound()
    return (
      <>
        <TopBar action={<HeaderActions />} />
        <main className="mx-auto max-w-content-max-web px-gutter-phone py-8 lg:px-gutter-web">
          <Note tone="danger">{errorText(res.error.code)}</Note>
        </main>
      </>
    )
  }

  const design = res.data
  const variant = design.variants[0]!
  const soldOut = design.availability === "sold_out"
  const rows = design.details ? detailRows(design.details) : design.attributes

  return (
    <>
      <TopBar action={<HeaderActions />} />
      <main className="mx-auto flex max-w-content-max-web flex-col gap-6 pb-8 lg:flex-row lg:gap-8 lg:px-gutter-web lg:py-8">
        <section aria-label={design.name} className="lg:w-[57%]">
          <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto lg:grid lg:grid-cols-2 lg:overflow-visible">
            {design.images.map((image, i) => (
              <li
                key={`${image.url}-${i}`}
                className="w-full shrink-0 snap-start lg:w-auto"
                aria-label={tf("design.photo", { n: i + 1, total: design.images.length })}
              >
                <Photo image={image} priority={i === 0} className="rounded-none lg:rounded-md" />
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4 px-gutter-phone lg:w-[43%] lg:px-0">
          {design.preview ? (
            <Note tone="info" testId="preview-note">
              {tf("design.preview", { time: previewTime(design.preview.expiresAt) })}
            </Note>
          ) : null}
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-h1" data-testid="design-name">
              {design.name}
            </h1>
            {design.subtitle ? <p className="text-body-sm text-text-muted">{design.subtitle}</p> : null}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-price-lg" data-testid="design-price">
              {formatRupees(design.price)}
            </span>
            <span className="text-caption text-success" data-testid="tax-note">
              {t("price.taxNote")}
            </span>
          </div>
          <div data-testid="stock-status">
            {soldOut ? (
              <StatusChip tone="danger">{t("design.soldOut")}</StatusChip>
            ) : (
              <StatusChip tone="success">{t("design.inStock")}</StatusChip>
            )}
          </div>
          <AddToBag
            variantId={variant.id}
            disabled={soldOut || Boolean(design.preview)}
            label={soldOut ? t("design.soldOut") : t("design.addToBag")}
          />
          {soldOut ? <p className="text-body-sm text-text-muted">{t("design.soldOutNote")}</p> : null}

          {design.description ? (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <h2 className="font-heading text-h3">{t("design.description")}</h2>
              <p className="whitespace-pre-line text-body leading-[22px] text-text" data-testid="design-description">
                {design.description}
              </p>
            </div>
          ) : null}

          {rows.length ? (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <h2 className="font-heading text-h3">{t("design.details")}</h2>
              <dl className="rounded-xl border border-border bg-surface" data-testid="design-details">
                {rows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0">
                    <dt className="text-body-sm text-text-muted">{row.label}</dt>
                    <dd className="text-right text-body-sm font-semibold text-text">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      </main>
    </>
  )
}
