import type { Metadata } from "next"
import { signInAction } from "@/app/actions"
import { AuthForm } from "@/components/auth-form"
import { TopBar } from "@/components/top-bar"
import { Card } from "@/components/ui"
import { t } from "@/lib/i18n"

export const metadata: Metadata = { title: t("signIn.title") }

export default function SignInPage() {
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
            footer={{ text: "signIn.noAccount", link: "signIn.signUpLink", href: "/sign-up" }}
          />
        </Card>
      </main>
    </>
  )
}
