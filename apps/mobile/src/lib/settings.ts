// Pure configuration helpers, kept free of React Native imports so they can be unit-tested.

/** The store name is configuration: the env value if set, else the translation file's default. Shown in lower case. */
export function resolveStoreName(envValue: string | undefined, fallback: string): string {
  const name = envValue?.trim() || fallback
  return name.toLowerCase()
}

/**
 * Where the mock pictures are served from. An explicit env value wins. On the web the app
 * serves them itself at `/mock`; on a phone they come from the dev server that serves `public/`.
 */
export function resolveMockAssetBaseUrl(opts: {
  envValue: string | undefined
  platform: string
  hostUri: string | undefined
}): string {
  const fromEnv = opts.envValue?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, "")
  if (opts.platform === "web" || !opts.hostUri) return "/mock"
  return `http://${opts.hostUri.replace(/\/+$/, "")}/mock`
}
