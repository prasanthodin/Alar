---
title: 'Story 1.4: Route allow-list for the kernel'
type: 'feature'
created: '2026-11-27'
status: 'in-review'
baseline_commit: 'b30f8a884d443b504b01e77f21649f73c843082f'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics-parts/epic-1.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every built-in kernel route is callable, so a client or a built-in admin screen could complete a cart or edit stock, reservations, payments or refunds without the shop's workflows, stock movements and audit (AD-21).

**Approach:** Put one list of allowed kernel routes (method + path pattern) and one never-allowed list in `packages/contracts`; a commerce middleware refuses every kernel store, admin and auth route not on the allowed list with `route.not_allowed`; tests prove the refusals, guard the never-allowed list, and keep `api-client` paths on the list; the admin screens for the forbidden actions are hidden or documented as inert.

## Boundaries & Constraints

**Always:** the refusal uses the contract error envelope `{ code: "route.not_allowed", message }` with HTTP 403 and changes nothing in the database; the middleware runs before any kernel route handler; shop routes (`/store/shop/*`, `/admin/shop/*`, `/internal/*`, `/webhooks/*`) are outside the list and not blocked by it; the admin UI static path (`/app`) and `/health` are not API routes and stay reachable; reads the kept admin screens need are allowed (enumerate them by recording the dashboard's own requests); each allowed write is listed individually; each route accepts exactly one kind of identity — a Shopper token on an admin route and an admin session on a Shopper-only store route are refused.

**Never:** cart completion (`POST /store/carts/:id/complete`) or any direct create/update/delete of inventory levels, reservations, payments, payment collections' captures/refunds, or order refunds and edits that move money or stock, on the allowed list; a blanket `/*` write rule; breaking the kernel's server-side cart completion (Story 1.10) — if blocking for clients would break it, stop and report.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Allowed store route | Story 1.2 sign-up/sign-in/me calls | work as before (e2e still passes) | N/A |
| Unlisted kernel route | e.g. `GET /store/collections` | 403 `route.not_allowed` | envelope |
| Cart completion | `POST /store/carts/:id/complete`, anonymous and signed in | 403 `route.not_allowed`; no order created | envelope |
| Direct money/stock edit | admin `POST /admin/inventory-items/:id/location-levels/:loc`, `POST /admin/reservations`, `POST /admin/payments/:id/capture`, `POST /admin/payments/:id/refund` (and siblings) with a valid admin session | 403 `route.not_allowed`; DB unchanged | envelope |
| Never-allowed guard | someone adds a never-allowed route to the allowed list | `packages/contracts` test fails naming it | N/A |
| api-client drift | api-client contains a kernel path not on the list | api-client test fails naming the path | N/A |
| Identity mix | Shopper token on `/admin/products`; admin session on `/store/customers/me` | refused (401/403), no data | kernel or middleware |
| Shop route | `/store/shop/anything`, `/webhooks/anything` | not refused by the allow-list (404 is fine) | N/A |

</frozen-after-approval>

## Code Map

- `packages/contracts/src/kernel-routes.ts` (new) -- `KernelRoute = { method, pattern }` (Express-style `:param` segments, `*` only at the end of a read pattern); `ALLOWED_KERNEL_ROUTES`, `NEVER_ALLOWED_KERNEL_ROUTES`, `matchKernelRoute(method, path)`, `isShopRoute(path)`. Export from `src/index.ts`. Tests in `kernel-routes.test.ts`: matching, never-allowed ∩ allowed = ∅ (by pattern overlap, not string equality), shop routes excluded.
- `apps/commerce/src/api/middlewares.ts` (new) -- `defineMiddlewares` with a global matcher on `/store*`, `/admin*`, `/auth*`; skip shop routes; refuse unmatched with 403 envelope. The request-log in `instrumentation.ts` (Story 1.3) is not touched.
- `apps/commerce/integration-tests/http/allow-list.spec.ts` (new) -- `@medusajs/test-utils` `medusaIntegrationTestRunner`: every matrix row, including "no order created / DB unchanged" by reading counts before and after. Check how the starter's jest config selects integration tests (`TEST_TYPE=integration:http`) and add an `test:integration` script; CI runs it after migrate.
- `packages/api-client/src/kernel-paths.test.ts` (new) -- scan `src/**/*.ts` (excluding tests and `mock/`) for string literals starting with `/store`, `/admin`, `/auth`, normalise template params to `:param`, assert each matches `ALLOWED_KERNEL_ROUTES`.
- `apps/commerce/src/admin/` -- hide nav entries for inventory/reservations/payments/refunds if the 2.23 admin SDK allows (read the installed `@medusajs/admin-sdk` / dashboard AGENTS.md); otherwise list each as "visible but inert" in `docs/kernel-routes.md`.
- `docs/kernel-routes.md` (new) -- the rule, how to add a route (only in the story that first calls it), the never-allowed list, admin screens status.

## Tasks & Acceptance

**Execution:**
- [ ] `packages/contracts` -- lists, matcher, tests
- [ ] `apps/commerce/src/api/middlewares.ts` -- refusal middleware
- [ ] record the admin dashboard's requests (Playwright, admin user created with `medusa user`) for login, products, orders, customers, settings screens; put the reads and the writes kept screens need on the list
- [ ] integration tests and `test:integration` script; CI step after migrate
- [ ] api-client path test
- [ ] admin nav hiding or inert-screen documentation; `docs/kernel-routes.md`

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build` and the commerce integration tests run, then all pass.
- Given the running kernel and website, when the Story 1.2 e2e runs, then it still passes.
- Given an admin session in the dashboard, when the Owner opens products, orders and customers, then they load; the stock, reservation, payment and refund write actions are refused.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Medusa 2 applies route middlewares before the route handler but after its own CORS, publishable-key and auth middlewares (found in Story 1.3); that order is fine for refusals. Returning the envelope: `res.status(403).json({ code, message })`. Kernel 404s for unknown paths may now become 403s; that is acceptable. Session: Node 24 at `/opt/node24/bin`; local PostgreSQL 5432 and Redis 6379 on the host; the compose stack may be running on 8080. Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- `pnpm --filter @shop/commerce test:integration` -- expected: all pass
- with kernel and web running: `E2E_BASE_URL=http://localhost:8000 E2E_CHROME_PATH=/usr/bin/google-chrome pnpm --filter @shop/web exec playwright test --trace off` -- expected: 6 passed
