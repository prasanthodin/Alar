import { PASSWORD_MIN_LENGTH } from "@shop/contracts"
import type { Metadata } from "next"
import { signUpAction } from "@/app/actions"
import { AuthForm } from "@/components/auth-form"
import { TopBar } from "@/components/top-bar"
import { Card } from "@/components/ui"
import { t } from "@/lib/i18n"

export const metadata: Metadata = { title: t("signUp.title") }

export default function SignUpPage() {
  return (
    <>
      <TopBar />
      <main className="flex justify-center px-gutter-phone py-12">
        <Card>
          <h1 className="mb-6 font-heading text-h2">{t("signUp.title")}</h1>
          <AuthForm
            action={signUpAction}
            fields={[
              { name: "email", label: "form.email", type: "email", autoComplete: "email", required: true },
              {
                name: "password",
                label: "form.password",
                type: "password",
                autoComplete: "new-password",
                required: true,
                minLength: PASSWORD_MIN_LENGTH,
                hint: "form.passwordHint",
              },
              { name: "firstName", label: "form.firstName", type: "text", autoComplete: "given-name" },
              { name: "lastName", label: "form.lastName", type: "text", autoComplete: "family-name" },
            ]}
            submit="signUp.submit"
            pending="signUp.pending"
            footer={{ text: "signUp.haveAccount", link: "signUp.signInLink", href: "/sign-in" }}
          />
        </Card>
      </main>
    </>
  )
}
