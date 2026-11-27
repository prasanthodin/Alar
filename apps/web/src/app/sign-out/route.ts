import { NextResponse, type NextRequest } from "next/server"
import { safeReturnPath, withReturnPath } from "@/lib/return-path"
import { SESSION_COOKIE } from "@/lib/session"

// A Server Component cannot delete cookies, so pages send a rejected session here.
// `?next=` (a path on this site) is passed on to sign-in, to come back afterwards.
export function GET(request: NextRequest) {
  const next = safeReturnPath(request.nextUrl.searchParams.get("next"))
  const response = NextResponse.redirect(new URL(withReturnPath("/sign-in", next), request.url))
  response.cookies.delete(SESSION_COOKIE)
  return response
}
