import { ok, ShopPublicView, type Result } from "@shop/contracts"
import { mapFailure, type Transport } from "./client"

/** Shop-wide public data (Story 1.5). */
export function createShop(transport: Transport) {
  return {
    /**
     * What clients may know about the shop (its name), from the settings in
     * effect now. Fails with `settings.not_found` when the shop has no name
     * yet; callers fall back to their translation text on any failure.
     */
    async getShopPublic(): Promise<Result<ShopPublicView>> {
      const res = await transport.request({ method: "GET", path: "/store/shop/settings", schema: ShopPublicView })
      if (!res.ok) return mapFailure(res.failure, "settings.not_found", [404])
      return ok(res.data)
    },
  }
}
