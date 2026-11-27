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

const chipTone = {
  success: "bg-success-tint text-success",
  danger: "bg-danger-tint text-danger",
  lavender: "bg-tint-2 text-primary-text",
}

/** A status chip: 22px, small radius, overline text on its tint (DESIGN.md). */
export function StatusChip({ tone, children }: { tone: keyof typeof chipTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex h-status-chip items-center rounded-xs px-2 text-overline uppercase ${chipTone[tone]}`}
    >
      {children}
    </span>
  )
}

const noteTone = {
  info: "bg-tint-1 text-text",
  success: "bg-success-tint text-success",
  danger: "border border-danger-line bg-danger-tint text-danger",
}

/** A note: rounded, 10 × 12px padding, caption-sized text; lavender for information, red for a problem. */
export function Note({
  tone,
  children,
  testId,
}: {
  tone: keyof typeof noteTone
  children: React.ReactNode
  testId?: string
}) {
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      data-testid={testId}
      className={`rounded-md px-3 py-2 text-body-sm ${noteTone[tone]}`}
    >
      {children}
    </p>
  )
}
