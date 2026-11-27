# Mobile app (early shell)

`apps/mobile` (`@shop/mobile`) is the Android app: Expo 58.1.0, React Native 0.88.1 and expo-router. This first version is a shell on mocked catalogue data, so the shop can be seen on a phone before the real catalogue exists.

It has Home, Categories, a category listing, the Product page, the Bag and a Try-on tab placeholder. There is no checkout, payment, sign-in or real try-on.

## Where the data comes from

The app reads data only through `@shop/api-client` (AD-2); lint fails on any `@medusajs/*` import in `apps/mobile`. The client is created with `catalogueSource: "mock"`, so `listCategories`, `listDesigns`, `getDesign`, `getBag` and `addToBag` are answered by the mock inside `packages/api-client/src/mock/` and never call the kernel. The Bag lives in memory and empties when the app restarts. The kernel source arrives with Epic 2.

## The photos are samples

Every picture under `apps/mobile/public/mock/` is an AI-made placeholder copied from the design boards. None of them is a photo of an item on sale. The view models mark them `isSample: true`, and the Product page says so in a small note at its foot. Real photographs replace every one before launch.

## Configuration

| Variable | Used for | Default |
|---|---|---|
| `EXPO_PUBLIC_STORE_NAME` | Wordmark and app name | `brand.defaultName` in `apps/mobile/messages/en.json` |
| `EXPO_PUBLIC_MOCK_ASSET_BASE_URL` | Where the mock pictures are loaded from | `/mock` on the web; `http://<dev server>/mock` on a phone |
| `APP_SLUG`, `APP_SCHEME` | Expo slug and URL scheme | `shop` |
| `ANDROID_PACKAGE` | Android package id | `com.example.shop` |

The product name is never written in code; the CI name check fails if it is. Set it through `EXPO_PUBLIC_STORE_NAME` when running or exporting.

Shopper text lives in `apps/mobile/messages/en.json`.

## Run on the web target

From the repository root, with Node 24:

```bash
pnpm install
EXPO_PUBLIC_STORE_NAME=<name> pnpm --filter @shop/mobile web     # dev server, opens in the browser
```

Use the browser's device toolbar at 390 × 844 to see it at phone size.

To build the static web export and take the phone-size screenshots in `docs/screenshots/mobile-*.png`:

```bash
EXPO_PUBLIC_STORE_NAME=<name> pnpm --filter @shop/mobile export:web   # writes apps/mobile/dist
node scripts/mobile-screenshots.mjs                                  # Home, Categories, Listing, Product, Bag
```

The script serves `apps/mobile/dist` and drives Chrome with Playwright at 390 × 844, device scale 2. It uses `CHROME_PATH`, else `/usr/bin/google-chrome`, else Playwright's own browser.

## Run on an Android phone with Expo Go

1. Install **Expo Go** from the Play Store. It must support SDK 58.
2. Put the phone and the computer on the same Wi-Fi network.
3. Start the dev server from the repository root:

   ```bash
   EXPO_PUBLIC_STORE_NAME=<name> pnpm --filter @shop/mobile dev
   ```

4. Scan the QR code in the terminal with Expo Go.

The mock pictures are served by the dev server from `apps/mobile/public/mock`, at `http://<computer address>:8081/mock`. If they do not load (for example behind a tunnel), set `EXPO_PUBLIC_MOCK_ASSET_BASE_URL` to an address the phone can reach.

The glass bars blur only on Android 12 and later. On older Android, when the system asks for reduced transparency, and on the floating bottom navigation (which has no blur target yet), they are solid white. Story 1.28 measures the cost of blur on a real mid-range phone.

## Checks

```bash
pnpm --filter @shop/mobile lint        # eslint-config-expo plus the AD-2 import rule
pnpm --filter @shop/mobile typecheck   # tsc --noEmit
pnpm --filter @shop/mobile test        # vitest: settings and translation file
```

`scripts/mobile-lint-boundary.test.mjs` pins the AD-2 rule and runs with the root `pnpm test`.
