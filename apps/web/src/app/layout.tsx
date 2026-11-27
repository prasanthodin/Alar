import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import "@fontsource/plus-jakarta-sans/700.css"
import "@fontsource/plus-jakarta-sans/800.css"
import "@/styles/globals.css"
import type { Metadata } from "next"
import { connection } from "next/server"
import { storeName, t } from "@/lib/i18n"
import { configuredStoreName, publicBaseUrl } from "@/lib/server-env"

// The base URL and store name are read at request time (not inlined at build),
// so one built image serves each environment with its own values.
export async function generateMetadata(): Promise<Metadata> {
  await connection()
  return {
    metadataBase: new URL(publicBaseUrl()),
    title: storeName(configuredStoreName()),
    description: t("meta.description"),
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Renders on request, so the wordmark reads the store name of the running environment.
  await connection()
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  )
}
