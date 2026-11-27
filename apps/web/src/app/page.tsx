import { HeaderActions } from "@/components/header-actions"
import { DesignCard } from "@/components/design-card"
import { TopBar } from "@/components/top-bar"
import { Note } from "@/components/ui"
import { errorText, t } from "@/lib/i18n"
import { publicApi } from "@/lib/session"

/** Home: the published Designs as a plain list of cards (Story 1.8). No filters or search in Epic 1. */
export default async function HomePage() {
  // The catalogue is the same for everyone: read without the Shopper's cookies.
  const res = await publicApi().listDesigns()
  return (
    <>
      <TopBar action={<HeaderActions />} />
      <main className="mx-auto flex max-w-content-max-web flex-col gap-4 px-gutter-phone py-4 lg:gap-6 lg:px-gutter-web lg:py-8">
        <h1 className="font-heading text-h2">{t("home.title")}</h1>
        {!res.ok ? (
          <Note tone="danger">{res.error.code === "internal" ? t("home.loadFailed") : errorText(res.error.code)}</Note>
        ) : res.data.length === 0 ? (
          <p className="text-body text-text-muted">{t("home.empty")}</p>
        ) : (
          <ul
            data-testid="design-list"
            className="grid grid-cols-2 gap-grid-gap-phone sm:grid-cols-3 lg:grid-cols-5 lg:gap-grid-gap-web"
          >
            {res.data.map((design) => (
              <li key={design.id}>
                <DesignCard design={design} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
