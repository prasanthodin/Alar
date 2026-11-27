import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { signOutAction } from "@/app/actions"
import { TopBar } from "@/components/top-bar"
import { buttonClass, Card } from "@/components/ui"
import { errorText, t } from "@/lib/i18n"
import { api } from "@/lib/session"

export const metadata: Metadata = { title: t("account.title"), robots: { index: false } }

export default async function AccountPage() {
  const res = await api().getShopper()
  if (!res.ok) {
    // A stale or rejected token: clear the cookie in a route handler, then go to sign-in.
    if (res.error.code === "auth.unauthenticated") redirect("/sign-out")
    return (
      <>
        <TopBar />
        <main className="flex justify-center px-gutter-phone py-12">
          <Card>
            <p role="alert" className="text-body text-danger">
              {errorText(res.error.code)}
            </p>
          </Card>
        </main>
      </>
    )
  }

  const shopper = res.data
  return (
    <>
      <TopBar />
      <main className="flex justify-center px-gutter-phone py-12">
        <Card>
          <h1 className="mb-4 font-heading text-h2">{t("account.title")}</h1>
          <p className="text-body-sm text-text-muted">{t("account.signedInAs")}</p>
          <p className="mb-4 text-body-strong" data-testid="shopper-email">
            {shopper.email}
          </p>
          <p className="mb-6 text-body text-text-muted">{t("account.ordersSoon")}</p>
          <form action={signOutAction}>
            <button type="submit" className={`${buttonClass.outline} w-full`}>
              {t("account.signOut")}
            </button>
          </form>
        </Card>
      </main>
    </>
  )
}
