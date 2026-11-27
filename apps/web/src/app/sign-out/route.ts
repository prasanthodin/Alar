import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE } from "@/lib/session"

// A Server Component cannot delete cookies, so pages send a rejected session here.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/sign-in", request.url))
  response.cookies.delete(SESSION_COOKIE)
  return response
}
