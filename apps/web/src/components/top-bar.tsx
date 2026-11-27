import Link from "next/link"
import { storeName } from "@/lib/i18n"
import { shopName } from "@/lib/shop"

/** The shop name from settings (through api-client), as the wordmark. Server component. */
export async function Wordmark({ size = "text-h2" }: { size?: "text-h2" | "text-display-web" }) {
  const name = await shopName()
  return (
    <Link href="/" data-testid="wordmark" className={`font-heading ${size} tracking-[-0.02em] text-primary lowercase`}>
      {storeName(name)}
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
