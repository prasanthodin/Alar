import { TopBar, Wordmark } from "@/components/top-bar"
import { ButtonLink } from "@/components/ui"
import { t } from "@/lib/i18n"

export default function HomePage() {
  return (
    <>
      <TopBar action={<ButtonLink href="/sign-in" variant="ghost">{t("nav.signIn")}</ButtonLink>} />
      <main className="mx-auto flex max-w-content-max-web flex-col items-start gap-4 px-gutter-phone py-12 lg:px-gutter-web">
        <h1>
          <Wordmark size="text-display-web" />
        </h1>
        <p className="max-w-form-card-web text-body text-text-muted">{t("home.tagline")}</p>
        <div className="flex gap-3">
          <ButtonLink href="/sign-in">{t("home.signIn")}</ButtonLink>
          <ButtonLink href="/sign-up" variant="outline">
            {t("home.signUp")}
          </ButtonLink>
        </div>
      </main>
    </>
  )
}
