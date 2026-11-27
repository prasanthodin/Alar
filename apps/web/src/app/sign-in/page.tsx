import type { Metadata } from "next"
import { signInAction } from "@/app/actions"
import { AuthForm } from "@/components/auth-form"
import { TopBar } from "@/components/top-bar"
import { Card } from "@/components/ui"
import { t } from "@/lib/i18n"
import { safeReturnPath, withReturnPath } from "@/lib/return-path"

export const metadata: Metadata = { title: t("signIn.title") }

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

/** `?next=/checkout` (from checkout) brings her back there afterwards. */
export default async function SignInPage({ searchParams }: Props) {
  const next = safeReturnPath((await searchParams).next)
  return (
    <>
      <TopBar />
      <main className="flex justify-center px-gutter-phone py-12">
        <Card>
          <h1 className="mb-6 font-heading text-h2">{t("signIn.title")}</h1>
          <AuthForm
            action={signInAction}
            fields={[
              { name: "email", label: "form.email", type: "email", autoComplete: "email", required: true },
              {
                name: "password",
                label: "form.password",
                type: "password",
                autoComplete: "current-password",
                required: true,
              },
            ]}
            submit="signIn.submit"
            pending="signIn.pending"
            footer={{ text: "signIn.noAccount", link: "signIn.signUpLink", href: withReturnPath("/sign-up", next) }}
            next={next}
          />
        </Card>
      </main>
    </>
  )
}
