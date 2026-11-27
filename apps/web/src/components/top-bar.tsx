import Link from "next/link"
import { storeName } from "@/lib/i18n"
import { configuredStoreName } from "@/lib/server-env"

export function Wordmark({ size = "text-h2" }: { size?: "text-h2" | "text-display-web" }) {
  return (
    <Link href="/" className={`font-heading ${size} tracking-[-0.02em] text-primary lowercase`}>
      {storeName(configuredStoreName())}
    </Link>
  )
}

export function TopBar({ action }: { action?: React.ReactNode }) {
  return (
    <header className="h-top-bar bg-surface border-b border-border">
      <div className="mx-auto flex h-full max-w-content-max-web items-center justify-between px-gutter-phone lg:px-gutter-web">
        <Wordmark />
        {action}
      </div>
    </header>
  )
}
