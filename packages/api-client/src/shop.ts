import { fail, ok, ShopPublicView, type Result } from "@shop/contracts"
import { mapFailure, type Transport } from "./client"

/** Shop-wide public data (Story 1.5). */
export function createShop(transport: Transport) {
  return {
    /**
     * What clients may know about the shop (its name), from the settings in
     * effect now. Fails with `settings.not_found` only when the kernel says so
     * (its error code); any other 404 is `internal`. Callers fall back to their
     * translation text on any failure.
     */
    async getShopPublic(): Promise<Result<ShopPublicView>> {
      const res = await transport.request({ method: "GET", path: "/store/shop/settings", schema: ShopPublicView })
      if (!res.ok) {
        const notFound = res.failure.kind === "http" && res.failure.code === "settings.not_found"
        return notFound ? fail("settings.not_found", res.failure.message) : mapFailure(res.failure, "internal", [])
      }
      return ok(res.data)
    },
  }
}
