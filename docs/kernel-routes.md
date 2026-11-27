# Kernel route allow-list

The commerce kernel ships hundreds of built-in store, admin and auth routes. Most of them could change stock, payments or Orders without the shop's workflows, stock movements and audit (AD-21). So every kernel route is refused unless it is on one list (Story 1.4).

## The rule

- The lists live in `packages/contracts/src/kernel-routes.ts`:
  - `ALLOWED_KERNEL_ROUTES`: the kernel routes that may be called, each a method and a path pattern (`:name` is one path segment; a final `*` is allowed on read patterns only).
  - `NEVER_ALLOWED_KERNEL_ROUTES`: routes that must never be allowed (see below).
- `apps/commerce/src/api/middlewares.ts` mounts `kernelRouteGuard` (`apps/commerce/src/lib/kernel-route-guard.ts`) on `/store*`, `/admin*` and `/auth*`. A request whose method and path match no allowed route gets HTTP 403 and the error envelope `{ "code": "route.not_allowed", "message": "..." }`. The guard is a global middleware, so it runs before every route middleware and handler; a refused request changes nothing. It runs after the kernel's own CORS, publishable-key and authentication middlewares, so a request without a valid identity may get the kernel's 400 or 401 first.
- Matching is exact and case-sensitive. The query string and a trailing slash are ignored. HEAD is checked as GET. A CORS preflight is checked against the method it asks for. An unknown kernel path that used to give 404 now gives 403.
- Shop routes are not governed by the list: `/store/shop/*`, `/admin/shop/*`, `/internal/*` and `/webhooks/*` pass the guard. `/app` (the admin UI) and `/health` are not API routes and are not touched.
- The kernel's routes under `/hooks/*` (payment webhooks, used from Story 1.10), `/rbac/*` and `/cloud/*` are outside the guarded prefixes. Caddy does not route `/rbac` or `/cloud` to commerce.

### One identity per route

Each allowed route accepts exactly one kind of identity, and the kernel enforces it:

- Admin routes (`/admin/*`) accept only an admin user (session cookie, bearer token or secret API key). A Shopper's token gets 401.
- Shopper routes (`/store/customers/me`, `/store/customers`) accept only a customer identity. An admin session or admin token gets 401.
- Auth routes name their identity in the path: `/auth/customer/emailpass*` for Shoppers, `/auth/user/emailpass` for admins. Admin self-registration (`/auth/user/emailpass/register`) is not on the list.

The integration test proves both refusals.

## Adding a route

1. Add a kernel route only in the story that first calls it, never ahead of time. Each write (POST, DELETE) is listed on its own; there is no blanket write rule.
2. Add the method and pattern to `ALLOWED_KERNEL_ROUTES`, in the section of the client or screen that calls it.
3. If an `api-client` function calls it, `packages/api-client/src/kernel-paths.test.ts` checks that the path is on the list; it fails and names any kernel path in `api-client` that is not.
4. `packages/contracts/src/kernel-routes.test.ts` fails, naming both routes, if the new pattern overlaps a never-allowed route (by pattern overlap, so `/admin/payments/:id/:action` is caught as well as an exact copy).
5. Run `pnpm --filter @shop/commerce test:integration`. The suite creates its own throwaway database on the local PostgreSQL, so set `DB_USERNAME` and `DB_PASSWORD` (and `DB_HOST`, `DB_PORT` if not `localhost:5432`). If a kernel is running against the same Redis, point the suite at another Redis database (for example `REDIS_URL=redis://localhost:6379/9`) so their job queues stay apart.

The kernel loads `@shop/contracts` through its CommonJS build (`packages/contracts/dist/cjs`, made by `pnpm --filter @shop/contracts build`). `pnpm build`, the commerce `dev` and `test:integration` scripts, the commerce image and `pnpm typecheck` build it first; restart a running kernel after changing the list.

## Never allowed

Only the shop's workflows may do these. The full list is `NEVER_ALLOWED_KERNEL_ROUTES`:

- Cart completion: `POST /store/carts/:id/complete`. Only `confirm-payment` completes a cart, on the server (Story 1.10). The integration test also completes a cart through the kernel's workflow to show the server-side path still works.
- Stock levels: create, update, delete and batch-edit inventory levels, and create or delete inventory items (which carry levels).
- Reservations: create, update and delete.
- Payments: capture and refund a payment; create, delete or mark-as-paid a payment collection, or start its payment sessions from the admin; authorize an Order's payment sessions.
- Order changes that move money or stock: credit lines, fulfillments and their cancellation, every Order-edit write, confirming a received return, requesting a return, claim or exchange, and converting a draft order into an Order.

## Admin screens

The allowed reads are the ones the kept admin screens request. They were found by recording the dashboard's own requests (Playwright, an admin made with `medusa user`) on: sign-in, Orders (list and detail), Products (list and detail), Customers (list and detail), and Settings (store, profile, users, regions, tax regions, return reasons, sales channels, product types, product tags, locations, publishable API keys). Every admin write is refused, apart from sign-in and sign-out.

| Screen | Status |
| --- | --- |
| Inventory (stock levels) | Hidden from the navigation. The migration script `apps/commerce/src/migration-scripts/hide-admin-stock-navigation.ts` sets the sidebar's system default layout to hide `core:nav:/inventory`. Admins cannot save a layout of their own (that write is refused), so all admins see the default. By direct URL (`/app/inventory`) the screen is inert: its reads and writes are refused. |
| Reservations | Nested under Inventory in the navigation, so hidden with it. By direct URL (`/app/reservations`) the list loads, because the Order page reads reservations, but every reservation write is refused: visible but inert. |
| Payments (capture, refund) | No navigation entry to hide: these are actions on the Order page, which stays. Visible but inert: capture, refund and mark-as-paid are refused, and the dashboard shows the `route.not_allowed` message. |
| Refunds | Same as payments: the Order page's refund action is refused. The Settings screen for refund reasons is not kept; its reads are refused. |
| Other screens not kept | Draft orders, collections, categories, promotions, price lists, refund reasons, secret API keys and workflow executions stay in the navigation (the admin SDK cannot hide core screens); their reads or writes are refused. |
