import diagnostics_channel from "node:diagnostics_channel"
import type { IncomingMessage, ServerResponse } from "node:http"
import { formatAccessLog, resolveRequestId } from "./access-log"

type RequestStart = { request: IncomingMessage; response: ServerResponse }

/** The status logged for a request the client abandoned before a response started (nginx's 499). */
export const CLIENT_CLOSED_REQUEST = 499

let subscribed = false

/**
 * Gives every HTTP request to commerce a request id and writes one JSON
 * access-log line when its response ends.
 *
 * It hooks Node's `http.server.request.start` diagnostics channel instead of a
 * route middleware, because the kernel's own middlewares (CORS, publishable
 * key, authentication) answer some requests before any app middleware runs;
 * those requests must be logged too. The id is an incoming UUID `X-Request-Id`
 * or a new one; it is written back to the request header (where the kernel
 * reads `req.requestId` from) and echoed in the response.
 *
 * The kernel's own HTTP log stays off (LOG_LEVEL=info) because it records
 * client addresses and query strings.
 */
export function subscribeRequestLog(write: (line: string) => void = (line) => process.stdout.write(`${line}\n`)) {
  if (subscribed) {
    return
  }
  subscribed = true

  diagnostics_channel.subscribe("http.server.request.start", (message) => {
    const { request, response } = message as RequestStart
    const requestId = resolveRequestId(request.headers["x-request-id"])
    request.headers["x-request-id"] = requestId
    response.setHeader("X-Request-Id", requestId)

    // Read now: Express rewrites `request.url` inside mounted routers.
    const method = request.method ?? "-"
    const url = request.url ?? "/"
    const started = process.hrtime.bigint()
    // "close" fires once, both after a completed response and after an aborted one.
    response.once("close", () => {
      write(
        formatAccessLog({
          method,
          url,
          // 499: the client went away before any response was sent.
          status: response.headersSent ? response.statusCode : CLIENT_CLOSED_REQUEST,
          durationMs: Number(process.hrtime.bigint() - started) / 1e6,
          requestId,
        })
      )
    })
  })
}
