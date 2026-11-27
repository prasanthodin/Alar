import Link from "next/link"
import { t, tf } from "@/lib/i18n"
import { api } from "@/lib/session"
import { buttonClass } from "./ui"

/** The Bag link with its count, read through api-client. Server component. */
export async function BagLink() {
  const res = await api().getBag()
  const count = res.ok ? res.data.count : 0
  return (
    <Link
      href="/bag"
      data-testid="bag-link"
      aria-label={count > 0 ? tf("nav.bagCount", { n: count }) : t("nav.bag")}
      className={`${buttonClass.ghost} gap-2`}
    >
      {t("nav.bag")}
      {count > 0 ? (
        <span
          data-testid="bag-count"
          className="inline-flex h-status-chip min-w-status-chip items-center justify-center rounded-full bg-primary px-2 text-label text-on-primary"
        >
          {count}
        </span>
      ) : null}
    </Link>
  )
}

/** The header's right side on Shopper pages: sign in, and the Bag. */
export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/sign-in" className="hidden text-body-sm font-semibold text-primary sm:inline">
        {t("nav.signIn")}
      </Link>
      <BagLink />
    </div>
  )
}
