import Link from "next/link"
import { t, tf } from "@/lib/i18n"
import { hasSession, readBag } from "@/lib/session"
import { ClearStaleBag } from "./clear-stale-bag"
import { buttonClass } from "./ui"

/** The Bag link with its count, read through api-client. Server component. */
export async function BagLink() {
  const { result, staleCookie } = await readBag()
  const count = result.ok ? result.data.count : 0
  return (
    <>
      {staleCookie ? <ClearStaleBag /> : null}
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
    </>
  )
}

const textLink = "text-body-sm font-semibold text-primary hover:text-primary-pressed"

/**
 * The header's right side on Shopper pages, at every width: Sign in and
 * Create account when signed out, Account when signed in, and the Bag.
 */
export async function HeaderActions() {
  const signedIn = await hasSession()
  return (
    <nav className="flex items-center gap-3" aria-label={t("nav.label")}>
      {signedIn ? (
        <Link href="/account" className={textLink} data-testid="nav-account">
          {t("nav.account")}
        </Link>
      ) : (
        <>
          <Link href="/sign-in" className={textLink} data-testid="nav-sign-in">
            {t("nav.signIn")}
          </Link>
          <Link href="/sign-up" className={textLink} data-testid="nav-sign-up">
            {t("nav.signUp")}
          </Link>
        </>
      )}
      <BagLink />
    </nav>
  )
}
