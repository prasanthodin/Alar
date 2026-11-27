import { createApiClient, type ApiClient, type ApiError, type BagView, type Result } from "@shop/api-client"
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

type BagState =
  | { status: "loading" }
  | { status: "ok"; data: BagView }
  | { status: "error"; error: ApiError }

type ShopContext = {
  api: ApiClient
  /** The Bag, or null until it has loaded. */
  bag: BagView | null
  bagState: BagState
  reloadBag(): void
  addToBag(variantId: string): Promise<Result<BagView>>
}

const Context = createContext<ShopContext | null>(null)

const thrown = (e: unknown): ApiError => ({
  code: "internal",
  message: e instanceof Error ? e.message : "Request failed",
})

export function ShopProvider({ children }: { children: ReactNode }) {
  const [api] = useState(createClient)
  const [bagState, setBagState] = useState<BagState>({ status: "loading" })
  const [bagTry, setBagTry] = useState(0)

  useEffect(() => {
    let live = true
    api
      .getBag()
      .then((res) => {
        if (live) setBagState(res.ok ? { status: "ok", data: res.data } : { status: "error", error: res.error })
      })
      .catch((e: unknown) => {
        if (live) setBagState({ status: "error", error: thrown(e) })
      })
    return () => {
      live = false
    }
  }, [api, bagTry])

  const reloadBag = useCallback(() => {
    setBagState({ status: "loading" })
    setBagTry((n) => n + 1)
  }, [])

  const addToBag = useCallback(
    async (variantId: string) => {
      const res = await api.addToBag(variantId).catch((e: unknown) => ({ ok: false as const, error: thrown(e) }))
      if (res.ok) setBagState({ status: "ok", data: res.data })
      return res
    },
    [api]
  )

  const bag = bagState.status === "ok" ? bagState.data : null
  const value = useMemo(() => ({ api, bag, bagState, reloadBag, addToBag }), [api, bag, bagState, reloadBag, addToBag])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useShop(): ShopContext {
  const ctx = useContext(Context)
  if (!ctx) throw new Error("useShop must be used inside ShopProvider")
  return ctx
}

export type Loadable<T> = (
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; error: ApiError }
) & {
  /** Runs the call again. */
  reload(): void
}

/** Runs an api-client call when its key changes (or on reload) and tracks the result. */
export function useResult<T>(key: string, load: (api: ApiClient) => Promise<Result<T>>): Loadable<T> {
  const { api } = useShop()
  const [attempt, setAttempt] = useState(0)
  const stamp = `${key}#${attempt}`
  const [state, setState] = useState<{ stamp: string; value: { status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: ApiError } }>({
    stamp,
    value: { status: "loading" },
  })

  useEffect(() => {
    let live = true
    const done = (value: { status: "ok"; data: T } | { status: "error"; error: ApiError }) => {
      if (live) setState({ stamp: `${key}#${attempt}`, value })
    }
    load(api)
      .then((res) => done(res.ok ? { status: "ok", data: res.data } : { status: "error", error: res.error }))
      .catch((e: unknown) => done({ status: "error", error: thrown(e) }))
    return () => {
      live = false
    }
    // `load` is recreated on each render; the key and the attempt say when to run it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, key, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  const value = state.stamp === stamp ? state.value : { status: "loading" as const }
  return { ...value, reload } as Loadable<T>
}
