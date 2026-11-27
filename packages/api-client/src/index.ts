import { createAuth } from "./auth"
import { createTransport, type ApiClientConfig } from "./client"

export type { ApiClientConfig, TokenStore } from "./client"
export type {
  ApiError,
  ErrorCode,
  Result,
  ShopperView,
  SignInInput,
  SignUpInput,
} from "@shop/contracts"

/** The one seam between clients (web, mobile) and the kernel. */
export function createApiClient(config: ApiClientConfig) {
  const transport = createTransport(config)
  const auth = createAuth(transport, config.tokenStore)
  return {
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    getShopper: auth.getShopper,
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
