/**
 * The time a Hold ends, as the Shopper reads it: "10:45 pm" in the shop's
 * business time zone, from the server's instant. Shown as a plain fact,
 * never as a countdown (NFR-13).
 */
export function holdEndTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(
    new Date(iso)
  )
}
