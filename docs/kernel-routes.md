# Kernel route allow-list

The commerce kernel ships hundreds of built-in store, admin and auth routes. Most of them could change stock, payments or Orders without the shop's workflows, stock movements and audit (AD-21). So every kernel route is refused unless it is on one list (Story 1.4).

## The rule

- The lists live in `packages/contracts/src/kernel-routes.ts`:
  - `ALLOWED_KERNEL_ROUTES`: the kernel routes that may be called, each a method and a path pattern (`:name` is one path segment; a final `*` is allowed on read patterns only).
  - `NEVER_ALLOWED_KERNEL_ROUTES`: routes that must never be allowed (see below).
- `apps/commerce/src/api/middlewares.ts` mounts `kernelRouteGuard` (`apps/commerce/src/lib/kernel-route-guard.ts`) on every kernel namespace: `/store*`, `/admin*`, `/auth*`, `/rbac*`, `/cloud*` and `/hooks*`. A request whose method and path match no allowed route gets HTTP 403 and the error envelope `{ "code": "route.not_allowed", "message": "..." }`.
- Order: the kernel's own CORS, body-parser, publishable-key (store) and authentication middlewares run first, so a request without a valid key or identity may get the kernel's 400 or 401 before the guard sees it. The guard is a global middleware, so it then runs before every route middleware and handler; a refused request changes nothing.
- Nothing under `/rbac`, `/cloud` or `/hooks` is allowed yet. Story 1.10 adds the payment hook (`/hooks/payment/:provider`). The admin's sign-in page asks `GET /cloud/auth`, gets 403 and still shows the email and password form.
- Matching is exact and case-sensitive. The query string and a trailing slash are ignored, so a read that changes meaning with a query (such as `GET /admin/api-keys?type=secret`) cannot be allowed for one query only. HEAD is checked as GET. An unknown kernel path that used to give 404 now gives 403.
- CORS preflights: the kernel answers preflights for its existing routes itself (`preflightContinue: false`) before the guard runs. Only preflights it leaves alone (unknown paths, routes without CORS) reach the guard, which judges them by the method they ask for (`Access-Control-Request-Method`).
- Shop routes are not governed by the list: `/store/shop/*`, `/admin/shop/*`, `/internal/*` and `/webhooks/*` pass the guard (`/internal` and `/webhooks` are outside the guarded prefixes anyway). The shop-prefix match is case-sensitive too: `/Store/shop/x` is not a shop route and is refused. `/app` (the admin UI) and `/health` are not API routes and are not touched.

### One identity per route

Each allowed route accepts exactly one kind of identity, and the kernel enforces it:

- Admin routes (`/admin/*`) accept only an admin user (session cookie, bearer token or secret API key). A Shopper's token gets 401.
- Shopper routes (`/store/customers/me`, `/store/customers`) accept only a customer identity. An admin session or admin token gets 401.
- Auth routes name their identity in the path: `/auth/customer/emailpass*` for Shoppers, `/auth/user/emailpass` for admins. Admin self-registration (`/auth/user/emailpass/register`) is not on the list.

The integration test proves both refusals.

## Adding a route

1. Add a kernel route only in the story that first calls it, never ahead of time. Each write (POST, DELETE) is listed on its own; there is no blanket write rule.
2. Add the method and pattern to `ALLOWED_KERNEL_ROUTES`, in the section of the client or screen that calls it.
3. If an `api-client` function calls it, `packages/api-client/src/kernel-paths.test.ts` checks that the path is on the list for the `method:` written in the same request object. It fails, naming the file, for a kernel path off the list, a kernel path whose request object has no `method:`, and a request `path:` that is not a string literal or a template starting with literal text. Shop routes pass.
4. `packages/contracts/src/kernel-routes.test.ts` fails, naming both routes, if the new pattern overlaps a never-allowed route (by pattern overlap, so `/admin/payments/:id/:action` is caught as well as an exact copy).
5. Run `pnpm --filter @shop/commerce test:integration`. The suite creates its own throwaway database on the local PostgreSQL, so set `DB_USERNAME` and `DB_PASSWORD` (and `DB_HOST`, `DB_PORT` if not `localhost:5432`). If a kernel is running against the same Redis, point the suite at another Redis database (for example `REDIS_URL=redis://localhost:6379/9`) so their job queues stay apart.

The kernel loads `@shop/contracts` through its CommonJS build (`packages/contracts/dist/cjs`, made by `pnpm --filter @shop/contracts build`). `pnpm build`, the commerce `dev` and `test:integration` scripts, the commerce image and `pnpm typecheck` build it first; restart a running kernel after changing the list.

## Never allowed

Only the shop's workflows may do these. `NEVER_ALLOWED_KERNEL_ROUTES` holds exactly these routes (all 2.23.1 kernel routes; `A|B` means one route for each):

| Area | Routes |
| --- | --- |
| Cart completion | `POST /store/carts/:id/complete`. Only `confirm-payment` completes a cart, on the server (Story 1.10). The integration test also completes a cart through the kernel's workflow to show the server-side path still works. |
| Stock levels and inventory items | `POST /admin/inventory-items`; `DELETE /admin/inventory-items/:id`; `POST /admin/inventory-items/:id/location-levels`; `POST /admin/inventory-items/:id/location-levels/batch`; `POST\|DELETE /admin/inventory-items/:id/location-levels/:location_id`; `POST /admin/inventory-items/location-levels/batch` |
| Stock locations and variant stock links | `DELETE /admin/stock-locations/:id`; `POST /admin/products/:id/variants/:variant_id/inventory-items`; `POST\|DELETE /admin/products/:id/variants/:variant_id/inventory-items/:inventory_item_id`; `POST /admin/products/:id/variants/inventory-items/batch` |
| Reservations | `POST /admin/reservations`; `POST\|DELETE /admin/reservations/:id` |
| Payments | `POST /admin/payments/:id/capture`; `POST /admin/payments/:id/refund`; `POST /admin/payment-collections`; `DELETE /admin/payment-collections/:id`; `POST /admin/payment-collections/:id/mark-as-paid`; `POST /admin/payment-collections/:id/payment-sessions`; `POST /admin/orders/:id/payment-sessions/authorize`; `POST /store/payment-collections/:id/payment-sessions`; `POST /store/payment-collections/:id/payment-sessions/:session_id` |
| Orders and fulfillments | `POST /admin/orders/:id/cancel`; `POST /admin/orders/:id/credit-lines`; `POST /admin/orders/:id/fulfillments`; `POST /admin/orders/:id/fulfillments/:fulfillment_id/cancel\|shipments\|mark-as-delivered`; `POST /admin/fulfillments/:id/shipment\|cancel` |
| Order edits | `POST /admin/order-edits`; `DELETE /admin/order-edits/:id`; `POST /admin/order-edits/:id/request\|confirm\|items\|shipping-method`; `POST /admin/order-edits/:id/items/item/:item_id`; `POST\|DELETE /admin/order-edits/:id/items/:action_id`; `POST\|DELETE /admin/order-edits/:id/shipping-method/:action_id` |
| Returns | `POST /admin/returns`; `POST /admin/returns/:id/request\|request-items\|receive-items\|dismiss-items\|receive/confirm`; `POST\|DELETE /admin/returns/:id/receive`; `POST\|DELETE /admin/returns/:id/request-items\|receive-items\|dismiss-items/:action_id` |
| Claims and exchanges | for `claims` and `exchanges`: `POST /admin/<kind>/:id/request`; `POST /admin/<kind>/:id/inbound\|outbound/items`; `POST\|DELETE /admin/<kind>/:id/inbound\|outbound/items/:action_id` |
| Draft orders | `POST /admin/draft-orders/:id/convert-to-order`; `POST\|DELETE /admin/draft-orders/:id/edit`; `POST /admin/draft-orders/:id/edit/request\|confirm\|items\|shipping-methods`; `POST /admin/draft-orders/:id/edit/items/item/:item_id`; `POST\|DELETE /admin/draft-orders/:id/edit/items/:action_id`; `POST\|DELETE /admin/draft-orders/:id/edit/promotions`; `POST\|DELETE /admin/draft-orders/:id/edit/shipping-methods/:action_id`; `POST\|DELETE /admin/draft-orders/:id/edit/shipping-methods/method/:method_id` |

Routes not in this table are not protected by the overlap test, though they are still refused while they are off the allowed list.

## What the list leaves out for now

- Admins are created only with `medusa user` (admin self-registration is refused), and an invite cannot be accepted: the invite routes are not on the list.
- Password reset is refused for admins and Shoppers (`/auth/user|customer/emailpass/reset-password` and `/update`), and so is token refresh (`/auth/token/refresh`).
- Product writes stay refused, including `POST /admin/products/:id` (which could change a product's status). Designs are created, priced and published through the shop routes under `/admin/shop/designs` and their workflows (Story 1.6, `docs/designs.md`); the kernel's Products screen is read-only.
- Epic 3 (Shopper sign-in by one-time code) and the admin stories (Story 1.22 for admin sign-in, the Owner screens of Epic 1 and Epic 3) add the routes they need, each in the story that first calls it.

## Admin screens

The allowed reads are the ones the kept admin screens request. They were found by recording the dashboard's own requests (Playwright, an admin made with `medusa user`) on: sign-in, Orders (list and detail), Products (list and detail), Customers (list and detail), and Settings (store, profile, users, regions, tax regions, return reasons, sales channels, product types, product tags, locations). No `/admin` write is on the list; the only allowed writes are the Shopper sign-up and sign-in routes and admin sign-in and sign-out (`POST /auth/user/emailpass`, `POST|DELETE /auth/session`).

| Screen | Status |
| --- | --- |
| Inventory (stock levels) | Hidden from the navigation. The migration script `apps/commerce/src/migration-scripts/hide-admin-stock-navigation.ts` hides `core:nav:/inventory` in the sidebar's system default layout and in every sidebar layout an admin saved earlier, keeping their other settings. Admins cannot save a new layout (that write is refused). By direct URL (`/app/inventory`) the screen is inert: its reads and writes are refused. |
| Reservations | Nested under Inventory in the navigation, so hidden with it. By direct URL (`/app/reservations`) the list loads, because the Order page reads reservations (`GET /admin/reservations` is allowed), but no reservation write is allowed: visible but inert. |
| Payments (capture, refund) | No navigation entry to hide: these are actions on the Order page, which stays. Visible but inert: capture, refund and mark-as-paid are refused, and the dashboard shows the `route.not_allowed` message. |
| Refunds | Same as payments: the Order page's refund action is refused. The Settings screen for refund reasons is not kept; its reads are refused. |
| Publishable API keys (Settings) | Visible but inert: `GET /admin/api-keys` would also list secret keys (`?type=secret`), so the API-key reads are not on the list. The website's publishable key is read from the database by the export script (Story 1.3), not through this screen. |
| Other screens not kept | Draft orders, collections, categories, promotions, price lists, refund reasons, secret API keys and workflow executions stay in the navigation (the admin SDK cannot hide core screens); their list reads are refused, and none of their writes is on the list. |
