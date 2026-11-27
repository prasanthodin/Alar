// Liveness of the website process, for the container health check and Caddy.
export const dynamic = "force-dynamic"

export function GET() {
  return Response.json({ status: "ok" })
}
