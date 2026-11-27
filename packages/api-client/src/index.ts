import { createAuth } from "./auth"
import { createCatalogue } from "./catalogue"
import { createCheckout } from "./checkout"
import { createTransport, type ApiClientConfig } from "./client"
import { memoryStore } from "./kernel-catalogue"
import { createShop } from "./shop"

export type { ApiClientConfig, TokenStore } from "./client"
export type { CatalogueSource, GetDesignOptions, ListDesignsInput } from "./catalogue"
export { DEFAULT_MOCK_ASSET_BASE_URL } from "./catalogue"
export { ALL_CATEGORY_ID } from "./mock/catalogue-data"
export { INDIAN_STATES } from "@shop/contracts"
export type {
  Availability,
  BagHold,
  BagLine,
  BagView,
  CartChangedDetails,
  ChangedLine,
  CheckoutAddress,
  CheckoutAddressInput,
  CheckoutSnapshotLine,
  CheckoutStatus,
  CheckoutView,
  IndianState,
  CategoryView,
  DesignCard,
  DesignDetails,
  DesignView,
  ImageRef,
  VariantView,
  ApiError,
  ErrorCode,
  Result,
  ShopperView,
  ShopPublicView,
  SignInInput,
  SignUpInput,
} from "@shop/contracts"

/** The one seam between clients (web, mobile) and the kernel. */
export function createApiClient(config: ApiClientConfig) {
  const transport = createTransport(config)
  const auth = createAuth(transport, config.tokenStore)
  // One Bag store for the Bag and its checkout, so both see the same cart.
  const bagStore = config.bagStore ?? memoryStore()
  const catalogue = createCatalogue({ ...config, bagStore }, transport)
  const checkout = createCheckout(transport, config.tokenStore, bagStore)
  const shop = createShop(transport)
  return {
    getShopPublic: shop.getShopPublic,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    getShopper: auth.getShopper,
    listCategories: catalogue.listCategories,
    listDesigns: catalogue.listDesigns,
    getDesign: catalogue.getDesign,
    getBag: catalogue.getBag,
    addToBag: catalogue.addToBag,
    setBagQuantity: catalogue.setBagQuantity,
    removeFromBag: catalogue.removeFromBag,
    beginCheckout: checkout.beginCheckout,
    getCheckout: checkout.getCheckout,
    cancelCheckout: checkout.cancelCheckout,
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
