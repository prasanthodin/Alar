// The kernel calls `register()` from this file when it starts (`medusa start`
// and `medusa develop`), before it opens its HTTP server.
//
// OpenTelemetry can be added here later with `registerOtel` from "@medusajs/medusa":
// https://docs.medusajs.com/learn/debugging-and-testing/instrumentation
import { subscribeRequestLog } from "./src/lib/request-log"

export function register() {
  subscribeRequestLog()
}
