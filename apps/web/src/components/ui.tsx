import Link from "next/link"

const base =
  "inline-flex h-button items-center justify-center rounded-sm px-4 text-button transition-colors duration-[120ms]"

export const buttonClass = {
  primary: `${base} bg-primary text-on-primary hover:bg-primary-pressed active:bg-primary-pressed disabled:bg-surface-disabled disabled:text-text-muted`,
  outline: `${base} border-[1.5px] border-primary text-primary-text hover:bg-tint-1`,
  ghost: `${base} border border-tint-3 text-text hover:bg-tint-1`,
}

export function ButtonLink({
  href,
  variant = "primary",
  children,
}: {
  href: string
  variant?: keyof typeof buttonClass
  children: React.ReactNode
}) {
  return (
    <Link href={href} className={buttonClass[variant]}>
      {children}
    </Link>
  )
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-form-card-web rounded-xl border border-border bg-surface p-6">
      {children}
    </div>
  )
}
