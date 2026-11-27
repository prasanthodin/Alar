import { createAuth } from "./auth"
import { createCatalogue } from "./catalogue"
import { createTransport, type ApiClientConfig } from "./client"

export type { ApiClientConfig, TokenStore } from "./client"
export type { CatalogueSource, ListDesignsInput } from "./catalogue"
export { DEFAULT_MOCK_ASSET_BASE_URL } from "./catalogue"
export { ALL_CATEGORY_ID } from "./mock/catalogue-data"
export type {
  BagLine,
  BagView,
  CategoryView,
  DesignCard,
  DesignView,
  ImageRef,
  VariantView,
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
  const catalogue = createCatalogue(config)
  return {
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    getShopper: auth.getShopper,
    listCategories: catalogue.listCategories,
    listDesigns: catalogue.listDesigns,
    getDesign: catalogue.getDesign,
    getBag: catalogue.getBag,
    addToBag: catalogue.addToBag,
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
