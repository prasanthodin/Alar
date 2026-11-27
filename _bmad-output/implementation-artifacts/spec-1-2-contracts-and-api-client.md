---
title: 'Story 1.2: Shared contracts and the api-client seam'
type: 'feature'
created: '2026-11-27'
status: 'in-review'
baseline_commit: '14149f7629549e3769779d542f059f83a0d00659'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-saree-commerce-2026-11-27/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The storefront reads the kernel through the starter's own data layer, so screens depend on kernel shapes and the future mobile app would read the backend differently (AD-2).

**Approach:** Add `packages/contracts` (zod schemas and inferred types) and `packages/api-client` (the only code that talks to the kernel, returning view models), delete the starter's data layer and pages, and rebuild the website as four pages (home shell, sign-up, sign-in, account stub) that use only `api-client`, styled from DESIGN.md through a shared `packages/tokens`.

## Boundaries & Constraints

**Always:** zod 4.6.7; types inferred from schemas; `api-client` exports only functions and contract types — the kernel SDK (`@medusajs/js-sdk`) is a dependency of `api-client` only; every request sends `X-Client: <platform>/<version>`, `Accept-Language`, `X-Request-Id` (UUID); every state-changing request sends `Idempotency-Key` (UUID); unknown response fields are ignored; a schema failure returns a typed error `{ ok: false, error: { code: 'response.invalid', message } }`, never a thrown kernel type; Shopper-facing text comes from `apps/web/messages/en.json`; DESIGN.md tokens (lavender `#6F52F0`, Plus Jakarta Sans + Inter, 40px buttons, 44px fields, no shadows); shoppers see "Bag", never "Cart".

**Never:** UI imports of `@medusajs/js-sdk` or `@medusajs/types` (lint fails the build); a session token readable by browser script; telling the shopper whether an email exists; a `packages/*` other than contracts, api-client, tokens.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sign up | new email, password ≥ 8 chars | account created, signed in, account stub shows the email | N/A |
| Duplicate sign-up | existing email | `auth.sign_up_failed`, no session | message from en.json |
| Sign in | correct email + password | session; `getShopper` returns `ShopperView` | N/A |
| Wrong password / unknown email | either | same code `auth.invalid_credentials` for both, no session | message from en.json |
| Sign out | signed in | session cookie cleared; `/account` redirects to `/sign-in` | N/A |
| Extra field | response has a field unknown to the schema | field dropped, call succeeds | N/A |
| Bad response | response fails the schema | `response.invalid` typed error | not thrown |
| Network down | fetch rejects | `network.unavailable` typed error | not thrown |

</frozen-after-approval>

## Code Map

- `apps/web/src/lib/` (data, config, util, context, hooks), `apps/web/src/modules/*`, `apps/web/src/app/[countryCode]/**`, `apps/web/src/app/{buy,ucp,llms.txt,api}`, `apps/web/src/middleware.ts`, `apps/web/src/app/sitemap.ts` -- starter data layer and pages: delete. Keep `robots.ts`, `not-found.tsx`, `layout.tsx` (rewrite), images.
- Kernel auth (Medusa 2.23 store): `POST /auth/customer/emailpass/register` → token; `POST /store/customers` with that bearer token creates the customer; `POST /auth/customer/emailpass` → token; `GET /store/customers/me`; publishable key header `x-publishable-api-key`. Wrong password and unknown email both return 401.
- `apps/web/package.json` -- drop dependencies only the deleted code used (stripe, adyen, instantsearch, js-sdk, @medusajs/types, ui-preset, headlessui, radix, lodash, qs, pg…); add `@shop/api-client`, `@shop/contracts`, `@shop/tokens` (workspace).
- `apps/web/eslint.config.mjs` -- add `no-restricted-imports` for `@medusajs/js-sdk`, `@medusajs/types` with message "UI code reads data only through @shop/api-client (AD-2)".
- `apps/web/tailwind.config.js` -- replace the Medusa UI preset with theme values from `@shop/tokens`.
- `apps/web/check-env-variables.js` -- keep only backend URL and publishable key.

## Tasks & Acceptance

**Execution:**
- [x] `packages/contracts/src/{errors,common,shopper,index}.ts` -- error envelope, error-code enum (at least `auth.invalid_credentials`, `auth.sign_up_failed`, `auth.unauthenticated`, `response.invalid`, `network.unavailable`, `client.update_required`, `route.not_allowed`, `internal`), `Id`, `IsoDateTime` (UTC ISO 8601), `ShopperView` (`id`, `email`, `firstName?`, `lastName?`, `createdAt`), `Result<T>` -- AD-19
- [x] `packages/contracts` tests (vitest) -- schemas accept good input, strip unknown keys, reject bad shapes
- [x] `packages/api-client/src/{client,auth,index}.ts` -- `createApiClient({ baseUrl, publishableKey, platform, version, getLanguage, tokenStore })` returning `signUp`, `signIn`, `signOut`, `getShopper`, each `Promise<Result<…>>`; headers per Always; maps kernel errors to contract codes -- one seam for web and mobile
- [x] `packages/api-client` tests (vitest, mocked fetch) -- every matrix row plus header presence and Idempotency-Key only on state changes
- [x] `packages/tokens/src/index.ts` -- colours, type scale, radii, spacing, component sizes from DESIGN.md frontmatter as plain TS constants, with a tailwind theme export -- shared by web now and mobile later
- [x] `apps/web` -- delete per Code Map; new `src/app/{page,sign-up/page,sign-in/page,account/page,layout}.tsx`, server actions in `src/app/actions.ts` keeping the token in an httpOnly, SameSite=Lax, Secure-in-production cookie; `messages/en.json` + a tiny `t()` helper -- website on the seam
- [x] `apps/web/e2e/auth.spec.ts` (Playwright 1.65, `--trace off`) -- sign up, sign out, sign in, wrong password against a running kernel; skipped unless `E2E_BASE_URL` is set -- end-to-end proof
- [x] `docs/starter.md` -- note the starter pages removed and that `next build` no longer needs the kernel

**Acceptance Criteria:**
- Given the repository, when `pnpm lint && pnpm typecheck && pnpm test && pnpm build` run, then all pass, and a file in `apps/web` importing `@medusajs/js-sdk` fails lint naming the rule.
- Given a running kernel and web, when the e2e spec runs, then all its cases pass.

## Implementation Notes

- Packages ship TypeScript source (`exports: ./src/index.ts`); Next compiles them via `transpilePackages`, and Tailwind loads `@shop/tokens` from `tailwind.config.js` through its jiti loader. No package build step.
- `api-client` uses `@medusajs/js-sdk`'s `client.fetch` with `jwtTokenStorageMethod: "nostore"`; the token comes from the caller's `TokenStore` per request. Kernel shapes are private zod schemas in `auth.ts`.
- Added error code `input.invalid` (the list says "at least"); sign-up and sign-in inputs are validated before any kernel call.
- Sign-up = register, create customer with the registration token, then sign in for a customer token; the session is stored only after all three succeed. Sign-in whose identity has no customer maps to `auth.invalid_credentials`. Sign-out clears the token store (kernel JWTs are stateless). HTTP 426 maps to `client.update_required`, 5xx to `internal`.
- Root `eslint.config.ts` turns off `@medusajs/zod-import-source` for `packages/**` (zod 4.6.7 is pinned directly); `turbo.json` lists `eslint.config.ts` as a global dependency so cached lint results are invalidated when it changes.
- Wordmark text: `NEXT_PUBLIC_STORE_NAME`, else `brand.defaultName` in en.json, until shop settings exist (Story 1.5).
- Stayed on Tailwind 3 (the starter's); fonts are self-hosted via `@fontsource/*` so builds need no font download.
- Playwright config accepts `E2E_CHROME_PATH` for a locally installed Chrome (Playwright's own browser download was blocked here).

## Spec Change Log

## Review Triage Log

| # | Finding | Verdict | Evidence | Route |
|---|---|---|---|---|
| 1 | Half-finished sign-up orphans the identity and locks the email out | high | register then failed create leaves identity; later register fails, sign-in gets invalid_credentials | patch |
| 2 | 429/403/400 map to auth errors | medium | `serverOr` treats every non-5xx as the caller's auth code | patch |
| 3 | No request timeout | medium | `sdk.client.fetch` has no signal; a hung kernel hangs the action | patch |
| 4 | No test for 426 mapping | medium | Deleting the branch passes all 17 tests | patch |
| 5 | Stale session cookie never cleared | medium | Server Component cannot delete cookies; 30-day cookie outlives the token | patch |
| 6 | Focus outline removed on fields | medium | `focus:outline-none` overrides the global focus-visible rule | patch |
| 7 | "Highlighted details" message with no highlighting | low | No aria-invalid styling | patch: reword |
| 8 | Missing error text not caught | medium | `as MessageKey` cast | patch |
| 9 | Password minimum hard-coded | low | `minLength: 8` beside `PASSWORD_MIN_LENGTH` | patch |
| 10 | Lint boundary rule untested | medium | Deleting the rule passes every check | patch |
| 11 | e2e never runs in CI; stale CI comment and region env | medium | `E2E_BASE_URL` never set in CI | patch |
| 12 | Starter authors in apps/web/package.json | low | Direct deletion | patch |
| 13 | Import rule only in apps/web, partial package list | low | Mobile not yet built | defer |
| 14 | AGENTS.md wording leftovers | low | Agent-context file | defer |
| 15 | Signed-in user sees "Sign in", can open /sign-in; no return-to | low | Polish; sign-in is rebuilt in Epic 3 | rejected |
| 16 | Server-only values use NEXT_PUBLIC_ names; runtime fallbacks | low | Publishable key is public by design; env check runs at build | rejected |
| 17 | Kernel email that z.email rejects breaks the account | low | Sign-up validates with z.email; only admin-made accounts could hit it | rejected |
| 18 | Idempotency-Key new per send | maybe-false | No retries exist yet, so a per-send key meets the AC; settle when retries are added | rejected |
| 19 | Names cleared after failed sign-up; whitespace store name; invalid base URL; require() bypass; date-only created_at; robots metadata; sitemap | low | Unlikely or cosmetic; fixes add guards | rejected |

## Design Notes

Layout of the four pages follows the approved boards in spirit (DESIGN.md is binding): a white page on `#FBFAFF` ground, top bar with the lower-case wordmark, a 400px-wide card for the forms, 44px fields, 40px primary button. The home shell shows the wordmark, one line of copy and links to sign in or sign up. Session: Next server actions call `api-client` on the server with a token store backed by the cookie. Tests: vitest at a 2026-current version in both packages. Session environment: Node 24 at `/opt/node24/bin`, PostgreSQL `postgres://postgres:postgres@localhost:5432`, Redis `redis://localhost:6379`, `apps/commerce/.env` and `apps/web/.env.local` exist locally. Do not commit.

## Verification

**Commands:**
- `PATH=/opt/node24/bin:$PATH pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` -- expected: all succeed
- with `pnpm commerce:dev` and `pnpm web:dev` running: `E2E_BASE_URL=http://localhost:8000 pnpm --filter @shop/web exec playwright test --trace off` -- expected: all pass
- `FORBIDDEN_NAME=alar node scripts/check-forbidden-name.mjs` -- expected: exit 0
