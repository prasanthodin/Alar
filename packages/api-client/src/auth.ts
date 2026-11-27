import {
  fail,
  IsoDateTime,
  ok,
  ShopperView,
  SignInInput,
  SignUpInput,
  type ErrorCode,
  type Result,
} from "@shop/contracts"
import { z } from "zod"
import { mapFailure, type TokenStore, type Transport } from "./client"

// Kernel shapes. Private to api-client: nothing outside this package sees them.
// z.object strips unknown fields, so new kernel fields are ignored.
const KernelToken = z.object({ token: z.string().min(1) })
const KernelCustomer = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  created_at: z.union([z.string(), z.date()]),
})
const KernelCustomerEnvelope = z.object({ customer: KernelCustomer })

function toIsoUtc(value: string | Date): string {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString()
  if (IsoDateTime.safeParse(value).success) return value
  // The kernel may send an offset timestamp; normalise it to UTC. Anything unparseable fails the schema below.
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? value : new Date(ms).toISOString()
}

function toShopperView(c: z.infer<typeof KernelCustomer>): Result<ShopperView> {
  const candidate = {
    id: c.id,
    email: c.email,
    ...(c.first_name ? { firstName: c.first_name } : {}),
    ...(c.last_name ? { lastName: c.last_name } : {}),
    createdAt: toIsoUtc(c.created_at),
  }
  const parsed = ShopperView.safeParse(candidate)
  if (!parsed.success) {
    return fail("response.invalid", `Customer did not map to ShopperView: ${parsed.error.message}`)
  }
  return ok(parsed.data)
}

function invalidInput<T>(error: z.ZodError): Result<T> {
  return fail("input.invalid", "Input did not match its schema", {
    fields: error.issues.map((i) => i.path.join(".")),
  })
}

const serverOr = (code: ErrorCode) => (status: number): ErrorCode =>
  status >= 500 ? "internal" : code

export function createAuth(transport: Transport, tokenStore: TokenStore) {
  async function fetchShopper(token: string): Promise<Result<ShopperView>> {
    const res = await transport.request({
      method: "GET",
      path: "/store/customers/me",
      token,
      schema: KernelCustomerEnvelope,
    })
    if (!res.ok) return mapFailure(res.failure, serverOr("auth.unauthenticated"))
    return toShopperView(res.data.customer)
  }

  async function login(email: string, password: string) {
    return transport.request({
      method: "POST",
      path: "/auth/customer/emailpass",
      body: { email, password },
      schema: KernelToken,
    })
  }

  return {
    /** Creates an account and signs the Shopper in. Never says whether the email already exists. */
    async signUp(input: SignUpInput): Promise<Result<ShopperView>> {
      const parsedInput = SignUpInput.safeParse(input)
      if (!parsedInput.success) return invalidInput(parsedInput.error)
      const { email, password, firstName, lastName } = parsedInput.data

      const registered = await transport.request({
        method: "POST",
        path: "/auth/customer/emailpass/register",
        body: { email, password },
        schema: KernelToken,
      })
      if (!registered.ok) return mapFailure(registered.failure, serverOr("auth.sign_up_failed"))

      const created = await transport.request({
        method: "POST",
        path: "/store/customers",
        token: registered.data.token,
        body: {
          email,
          ...(firstName ? { first_name: firstName } : {}),
          ...(lastName ? { last_name: lastName } : {}),
        },
        schema: KernelCustomerEnvelope,
      })
      if (!created.ok) return mapFailure(created.failure, serverOr("auth.sign_up_failed"))

      // The registration token has no customer attached; sign in for a token that does.
      const session = await login(email, password)
      if (!session.ok) return mapFailure(session.failure, serverOr("auth.sign_up_failed"))

      const view = toShopperView(created.data.customer)
      if (!view.ok) return view
      await tokenStore.set(session.data.token)
      return view
    },

    /** Signs the Shopper in. Wrong password and unknown email give the same code. */
    async signIn(input: SignInInput): Promise<Result<ShopperView>> {
      const parsedInput = SignInInput.safeParse(input)
      if (!parsedInput.success) return invalidInput(parsedInput.error)
      const { email, password } = parsedInput.data

      const session = await login(email, password)
      if (!session.ok) return mapFailure(session.failure, serverOr("auth.invalid_credentials"))

      const shopper = await fetchShopper(session.data.token)
      if (!shopper.ok) {
        // An identity without a customer account is treated like any other failed sign-in.
        return shopper.error.code === "auth.unauthenticated"
          ? fail("auth.invalid_credentials", "Signed in identity has no customer account")
          : shopper
      }
      await tokenStore.set(session.data.token)
      return shopper
    },

    /** Ends the session on this client. Kernel JWTs are stateless, so this clears the stored token. */
    async signOut(): Promise<Result<null>> {
      await tokenStore.clear()
      return ok(null)
    },

    /** The signed-in Shopper, or `auth.unauthenticated`. */
    async getShopper(): Promise<Result<ShopperView>> {
      const token = await tokenStore.get()
      if (!token) return fail("auth.unauthenticated", "No session")
      return fetchShopper(token)
    },
  }
}
