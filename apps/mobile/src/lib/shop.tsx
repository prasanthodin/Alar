import { createApiClient, type ApiClient, type BagView, type Result } from "@shop/api-client"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { Platform } from "react-native"
import { appVersion, mockAssetBaseUrl } from "./config"

function createClient(): ApiClient {
  // No kernel calls are made in this shell: catalogue and Bag come from the api-client mock.
  // The kernel fields are still required by the client, so they get inert values.
  return createApiClient({
    baseUrl: "http://localhost:9000",
    publishableKey: "mock",
    platform: Platform.OS,
    version: appVersion,
    getLanguage: () => "en",
    tokenStore: { get: () => null, set: () => {}, clear: () => {} },
    catalogueSource: "mock",
    mockAssetBaseUrl,
  })
}

type ShopContext = {
  api: ApiClient
  bag: BagView | null
  addToBag(variantId: string): Promise<Result<BagView>>
}

const Context = createContext<ShopContext | null>(null)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [api] = useState(createClient)
  const [bag, setBag] = useState<BagView | null>(null)

  useEffect(() => {
    let live = true
    void api.getBag().then((res) => {
      if (live && res.ok) setBag(res.data)
    })
    return () => {
      live = false
    }
  }, [api])

  const addToBag = useCallback(
    async (variantId: string) => {
      const res = await api.addToBag(variantId)
      if (res.ok) setBag(res.data)
      return res
    },
    [api]
  )

  const value = useMemo(() => ({ api, bag, addToBag }), [api, bag, addToBag])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useShop(): ShopContext {
  const ctx = useContext(Context)
  if (!ctx) throw new Error("useShop must be used inside ShopProvider")
  return ctx
}

type Loadable<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: Extract<Result<T>, { ok: false }>["error"] }

/** Runs an api-client call when its key changes and tracks the result. */
export function useResult<T>(key: string, load: (api: ApiClient) => Promise<Result<T>>): Loadable<T> {
  const { api } = useShop()
  const [state, setState] = useState<{ key: string; value: Loadable<T> }>({
    key,
    value: { status: "loading" },
  })

  useEffect(() => {
    let live = true
    void load(api).then((res) => {
      if (!live) return
      setState({ key, value: res.ok ? { status: "ok", data: res.data } : { status: "error", error: res.error } })
    })
    return () => {
      live = false
    }
    // `load` is recreated on each render; the key says when the data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, key])

  return state.key === key ? state.value : { status: "loading" }
}
