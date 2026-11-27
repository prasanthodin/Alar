import {
  CheckoutAddress,
  CheckoutResponse,
  fail,
  ok,
  type CheckoutAddressInput,
  type CheckoutView,
  type ErrorCode,
  type Result,
} from "@shop/contracts"
import { mapFailure, type KernelFailure, type TokenStore, type Transport } from "./client"

/** The shop's own error codes the checkout routes answer with, passed on with their details. */
const CHECKOUT_CODES: readonly ErrorCode[] = [
  "cart.changed",
  "cart.locked",
  "stock.unavailable",
  "stock.lock_timeout",
  "checkout.not_found",
  "bag.not_found",
  "input.invalid",
  "tax.no_band",
  "tax.kernel_mismatch",
  "tax.discount_unsupported",
  "tax.shipping_unsupported",
  "money.invalid_shelf_price",
]

/**
 * The address fields a server `input.invalid` names: its `details.issues`
 * are `"<path>: <message>"`, and `address.<field>` names a field. Issues that
 * name no address field (an empty Bag) give none.
 */
export function addressFields(details: Record<string, unknown> | undefined): string[] {
  const issues = Array.isArray(details?.issues) ? details.issues : []
  const fields = issues.flatMap((issue) => {
    if (typeof issue !== "string") return []
    const m = /^address\.([A-Za-z]+)\b/.exec(issue)
    return m ? [m[1]!] : []
  })
  return [...new Set(fields)]
}

/**
 * Maps a failed checkout call: `input.invalid` gets `details.fields`, the
 * address fields its issues name; the shop's codes (with `details`, such as the
 * changed lines of `cart.changed`) pass through; 401 is `auth.unauthenticated`
 * (signed out, or a session that ended); anything else follows `mapFailure`.
 */
function checkoutFailure<T>(failure: KernelFailure): Result<T> {
  if (failure.kind === "http" && failure.code === "input.invalid") {
    return fail("input.invalid", failure.message, { ...failure.details, fields: addressFields(failure.details) })
  }
  if (failure.kind === "http" && failure.code && (CHECKOUT_CODES as readonly string[]).includes(failure.code)) {
    return fail(failure.code as ErrorCode, failure.message, failure.details)
  }
  return mapFailure(failure, "auth.unauthenticated")
}

/**
 * Checkout (Story 1.9): a signed-in Shopper begins checkout of her Bag with
 * her address, which holds her Pieces while she pays; she can read and
 * cancel her Checkout. Every call needs the session token; the Bag is the one
 * in `bagStore`. No payment starts here (Story 1.10).
 */
export function createCheckout(transport: Transport, tokenStore: TokenStore, bagStore: TokenStore) {
  async function session(): Promise<string | null> {
    return (await tokenStore.get()) || null
  }

  return {
    /**
     * Begins checkout of the Bag with this delivery address: the server
     * snapshots the Bag and holds its Pieces. A second call while the Hold
     * lasts answers the same Checkout. Fails with `auth.unauthenticated`
     * (sign in first; the Bag is kept), `input.invalid` (with
     * `details.fields`), `bag.not_found`, `cart.changed` (`details.lines`:
     * each changed line, to accept or remove first), `stock.unavailable`
     * (another Shopper is paying for the last Piece) or `cart.locked`.
     */
    async beginCheckout(address: CheckoutAddressInput): Promise<Result<CheckoutView>> {
      const parsed = CheckoutAddress.safeParse(address)
      if (!parsed.success) {
        return fail("input.invalid", "The address did not match its schema", {
          fields: [...new Set(parsed.error.issues.map((i) => i.path.join(".")))],
        })
      }
      const token = await session()
      if (!token) return fail("auth.unauthenticated", "Sign in to check out")
      const cartId = (await bagStore.get()) || null
      if (!cartId) return fail("bag.not_found", "There is no Bag")
      const res = await transport.request({
        method: "POST",
        path: "/store/shop/checkouts",
        body: { cartId, address: parsed.data },
        token,
        schema: CheckoutResponse,
      })
      if (!res.ok) return checkoutFailure(res.failure)
      return ok(res.data.checkout)
    },

    /** The Shopper's own Checkout; `checkout.not_found` for another Shopper's or none. */
    async getCheckout(checkoutId: string): Promise<Result<CheckoutView>> {
      const token = await session()
      if (!token) return fail("auth.unauthenticated", "Sign in to see your checkout")
      const res = await transport.request({
        method: "GET",
        path: `/store/shop/checkouts/${encodeURIComponent(checkoutId)}`,
        token,
        schema: CheckoutResponse,
      })
      if (!res.ok) return checkoutFailure(res.failure)
      return ok(res.data.checkout)
    },

    /** Cancels the Shopper's checkout: her Pieces go back to stock and the Bag can be changed again. */
    async cancelCheckout(checkoutId: string): Promise<Result<CheckoutView>> {
      const token = await session()
      if (!token) return fail("auth.unauthenticated", "Sign in to cancel your checkout")
      const res = await transport.request({
        method: "POST",
        path: `/store/shop/checkouts/${encodeURIComponent(checkoutId)}/cancel`,
        token,
        schema: CheckoutResponse,
      })
      if (!res.ok) return checkoutFailure(res.failure)
      return ok(res.data.checkout)
    },
  }
}
