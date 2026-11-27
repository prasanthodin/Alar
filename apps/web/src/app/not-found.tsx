import type { Metadata } from "next"
import { TopBar } from "@/components/top-bar"
import { ButtonLink } from "@/components/ui"
import { t } from "@/lib/i18n"

export const metadata: Metadata = { title: t("notFound.title") }

export default function NotFound() {
  return (
    <>
      <TopBar />
      <main className="mx-auto flex max-w-form-card-web flex-col items-center gap-4 px-gutter-phone py-12 text-center">
        <h1 className="font-heading text-h2">{t("notFound.title")}</h1>
        <p className="text-body text-text-muted">{t("notFound.body")}</p>
        <ButtonLink href="/" variant="outline">
          {t("notFound.home")}
        </ButtonLink>
      </main>
    </>
  )
}
