# Reality-check review — Architecture Spine (Alar)

- Reviewed: `../ARCHITECTURE-SPINE.md` (status draft, 2026-11-27)
- Lens: every committed decision confirmed against the web, the registry or the live starter, not asserted from memory.
- Date of all checks: 2026-11-27. Medusa repository read at commit `293a5925` (develop, 2026-11-27).

## Verdict

The npm version pins are all real and current, and the Medusa capabilities the spine leans on exist. But several decisions rest on facts that are out of date or incomplete: the named storefront starter is deprecated, the free server is half the size it used to be, Node 22 ends in five months, and AD-6, AD-7 and AD-8 do not account for what Medusa's own cart completion, webhook route and BullMQ-based modules already do.

## How evidence is labelled

- **[source]** read today at the primary source (npm registry JSON, the project's repository, or its official docs site).
- **[search]** web search summary only; the primary page could not be fetched in this session.
- **[inferred]** my reasoning from sourced facts; not itself documented.

## A. Findings that require a change to the spine

### A1. Stack row "Next.js, web storefront (Medusa starter) 15.3.9" — the starter is deprecated

- [source] `medusajs/nextjs-starter-medusa` README, line 1: "This repository is now deprecated. Use the dtc-starter instead." Its `package.json` does pin `next 15.3.9`, `react 19.0.5`, `typescript ^5.3.2`, so the spine read the old starter correctly, but it is the wrong starter.
- [source] npm: `next@15.3.9` was published 2026-01-26 and is the last 15.3 release. The maintained back-port line is 15.5 (`backport` tag = 15.5.29, 2026-11-03). `latest` = 16.4.6.
- [source] `medusajs/dtc-starter` (the replacement) is a pnpm 10 + turbo monorepo with `apps/backend` (`@medusajs/medusa 2.23.1`, `zod 4.6.7`, `typescript ^6.0.3`, node `>=22.23.4`) and `apps/storefront` (`next 16.3.8`, `react 19.0.5`, `typescript ^6.0.3`, `@medusajs/js-sdk 2.23.1`, Stripe checkout only).
- **Change:** replace the row with "Next.js, web storefront (Medusa DTC starter `apps/storefront`) 16.3.8, React 19.0.5". Say in the Repository section whether `apps/commerce` and `apps/web` are the starter's `apps/backend` and `apps/storefront` renamed, and that the workspace tool is pnpm + turbo (the starter's default), or state the deviation. Note the starter ships Stripe checkout only; the Razorpay checkout component is new work.

### A2. AD-6 — Medusa's cart completion reserves stock again; a Hold on the last Piece will block its own Order

- [source] Reservation model (`packages/modules/inventory/src/models/reservation-item.ts`): fields are `line_item_id`, `location_id`, `quantity`, `external_id`, `description`, `created_by`, `metadata` (json), `allow_backorder`. There is **no expiry field**.
- [source] Reservations-lifecycle doc: custom reservations at any time are supported through `createReservationsWorkflow`; `deleteReservationsWorkflow` removes them. So a Hold before order placement is possible.
- [source] `completeCartWorkflow` (`core-flows/src/cart/workflows/complete-cart.ts`): after creating the order it always runs `reserveInventoryStep` for every line. It does not look for an existing reservation.
- [source] Same doc: stocked quantity is reduced at **fulfilment** (`createOrderFulfillmentWorkflow`), not at payment; order cancellation deletes reservations; the admin has reservation and inventory screens.
- [inferred] If the Hold reservation still exists when the cart is completed, the last Piece has available = 0, so Medusa's own reservation fails or the Piece is reserved twice.
- **Change to AD-6:**
  1. State that Hold expiry is kept in the reservation's `metadata` (or a Hold record in a shop module), because the model has no expiry.
  2. State that `confirm-payment`, under the same inventory lock, releases the Hold reservation and lets cart completion create the Order's reservation (or passes the Hold on by `line_item_id`), as one step with compensation.
  3. Correct the list of workflows that change stock: Medusa's fulfilment, cancellation and admin inventory/reservation routes also change stocked or reserved. Either wrap them (hooks that write the stock-movement row) or block those admin routes.

### A3. AD-7 — the built-in flow creates the Order before payment is confirmed unless the spine forbids it

- [source] Webhook docs and route (`packages/medusa/src/api/hooks/payment/[provider]/route.ts`): Medusa has a built-in `/hooks/payment/{identifier}_{id}` route. It does not process the webhook inline; it emits an event on the event bus with a default 5 s delay and 3 attempts (`webhook_delay`, `webhook_retries`). A subscriber then calls the provider's `getWebhookActionAndData` and `processPaymentWorkflow`, which completes the cart if it is not completed yet.
- [source] `completeCartWorkflow` doc comment: "The workflow creates the order first, then authorizes the cart's payment session as its last operation." It accepts sessions in `pending`, `requires_more`, `authorized`, `captured` or `pending_authorization`, and it does not compare the paid amount with the cart total. It is idempotent per cart and asks callers to hold a lock.
- [source] The stock storefront calls cart completion from the client after the payment screen.
- [inferred] So two things conflict with "an Order exists only once payment is confirmed" (PRD glossary, FR-18): client-side completion, and `pending_authorization` orders. Signature verification must happen inside the provider's `getWebhookActionAndData`, because the route itself does not verify.
- **Change to AD-7:** name the mechanism. The Razorpay provider is a Medusa Payment Module Provider; the webhook enters through the built-in route; `getWebhookActionAndData` verifies the signature and returns `captured` only. The client never completes a cart: the store cart-completion route is blocked or replaced by the status route. The provider's authorize step returns authorized only after a server-to-server check with Razorpay, and never `pending_authorization`. `confirm-payment` checks the amount against the cart total, since Medusa does not. Note the 5 s default delay and that webhook handling needs the event bus worker to be running (see A4). Rename the spine's `src/api/hooks/*` so it does not shadow the built-in `/hooks/payment/*` route.

### A4. AD-8 and AD-4 — "one queue" is not true with Medusa; worker mode is missing from the design

- [source] `@medusajs/event-bus-redis@2.23.1` and `@medusajs/workflow-engine-redis@2.23.1` both depend on `bullmq 6.7.6` (exact) and `ioredis ^6`. Docs: the Redis event bus "is powered by BullMQ"; the workflow engine keeps BullMQ queues for workflow retries and scheduled jobs.
- [source] Worker-mode doc: a Medusa instance runs as `shared` (default), `server` or `worker`. Scheduled jobs and subscribers run only in `worker` or `shared`. Production guidance is one server instance plus one worker instance of the same app. Deployment doc lists the Redis modules to register for production: caching, event bus, workflow engine, locking.
- [source] Medusa also has long-running workflows (`async: true` steps resumed by `setStepSuccess`).
- [source] BullMQ production guide: Redis must use `maxmemory-policy noeviction` and persistence (AOF).
- [inferred] A separate plain Node worker can consume a BullMQ queue that commerce fills with the `bullmq` library; nothing in Medusa prevents that. Running the worker as a Medusa worker-mode instance instead would break AD-1, because it connects to the commerce database. So the spine's separate worker is defensible, but it is a second (in fact third) BullMQ use on the same Redis, not "one queue".
- **Change:**
  1. Reword AD-8: "Medusa's own event bus, workflow engine and scheduled jobs run on its Redis modules. One additional queue, `shop-jobs`, carries work to `apps/worker`." Give it its own BullMQ prefix.
  2. Pin BullMQ to the version Medusa bundles (6.7.6 today) rather than 6.7.10, or state why two copies are acceptable.
  3. Add the commerce worker mode to the Containers section: `shared` on the single server, or a second `commerce-worker` container. Scheduled jobs (expired Holds, reconciliation) and payment webhooks depend on it.
  4. List the four Redis modules as part of the commerce configuration; the in-memory defaults do not work across instances.
  5. The container diagram says Redis holds "locks, queue, cache". With `noeviction` a cache can fill Redis and stop the queue. Use a second Redis instance or database policy for the cache, or state a cache size limit.

### A5. Deployment — the Oracle free ARM allowance was halved in 2026

- [search] InfoQ, LinuxToday, Linuxiac and Oracle forum posts report the Always Free Ampere A1 allowance cut from 4 OCPU / 24 GB to 2 OCPU / 12 GB per tenancy (1,500 OCPU-hours and 9,000 GB-hours a month), enforced from mid-June or 18 August 2026, with over-limit instances terminated. Oracle's own page could not be fetched here (proxy), so this is not read at source.
- [inferred] The spine puts staging and production on "the same kind of server". Both must now fit in 2 OCPU / 12 GB together, running Postgres, Redis, Medusa (server and worker), Payload on Next, the Next storefront, the worker with libvips, and Caddy.
- **Change:** state the current allowance in the Deployment section, say how staging and production share it (or that staging is not always on), and move "Whether the free server is large enough" out of Deferred into a gate that is measured before the build depends on it.

### A6. Stack row "Node.js 22 LTS" — end of life in five months

- [source] nodejs/Release `schedule.json`: v22 ends 2027-04-30; v24 is in maintenance until 2028-04-30; v26 became LTS 2026-10-28 and runs to 2029-04-30. `nodejs.org/dist`: 22.23.5 (2026-11-11), 24.22.3, 26.13.1 exist.
- [source] Engines: `@medusajs/medusa@2.23.1` `>=22.22.0`; `payload@3.94.2` `^22.23.5 || ^24.22.3 || >=26.13.1`; `expo@58.1.0` and `react-native@0.88.1` accept 22, 24 and 26; `sharp@0.35.5` `>=20.9.0`. Payload's `main` templates already require `^24.22.3 || >=26.13.1`.
- **Change:** pin Node 24 LTS (24.22.3 or later), which every pinned package accepts, or keep 22 with a dated upgrade item. Medusa's docs say "v22.22.0+ (LTS versions only)"; a run on 24 was not tested here.

### A7. Stack row "Redis 7" — ambiguous and behind

- [source] Docker official images: supported Redis lines are 6.2.24, 7.2.17, 7.4.12 and 8.2 to 8.12; `latest` is 8.12.0. All have arm64 builds.
- [search] Redis 7.2 was the last BSD-licensed line and its community end of life was reported as February 2026; 7.4 is under RSALv2/SSPLv1; Redis 8 is offered under AGPLv3. Not read at source.
- [source] Medusa's docs and BullMQ's docs do not state a minimum or maximum Redis version; BullMQ names Valkey and Dragonfly as compatible.
- **Change:** pin an exact line and say why: Redis 8.x, or Valkey if the licence matters, and confirm it in the spike with Medusa's four Redis modules and BullMQ. "7" alone can resolve to an end-of-life line.

### A8. AD-15 — admin second factor exists in the open-source edition but is opt-in; the customer side is confirmed

- [source] Auth MFA doc: MFA ships in the Auth Module from Medusa v2.15.5, with `totp` and `recovery_code` providers, an `AUTH_MFA_ENCRYPTION_KEY`, and admin dashboard screens (`packages/admin/dashboard/src/routes/login/components/mfa-challenge-*`, `profile-mfa-section`). It is outside the enterprise paths in `ENTERPRISE-LICENSE.md`.
- [source] The MFA doc and module options describe enrolment by each user. No option that forces enrolment was found.
- [source] Custom auth providers: `AbstractAuthModuleProvider`; Medusa publishes a "Phone Authentication" tutorial that builds a one-time-code provider for customers; `authMethodsPerActor` restricts which provider each actor type may use; the route is `/auth/{actor_type}/{auth_provider}`.
- **Change to AD-15:** add "admin routes refuse an account with no enabled second factor (shop middleware); recovery uses Medusa's recovery codes (FR-60)" and "`authMethodsPerActor`: customer = one-time-code only, user = emailpass only". Add `AUTH_MFA_ENCRYPTION_KEY` to the secrets that the restore script must carry, since losing it locks out every factor.

### A9. AD-14 and Deferred "Staff roles" — Medusa's audit log and roles are enterprise-licensed code that ships in the package

- [source] `ENTERPRISE-LICENSE.md` in the Medusa repository: RBAC (`@medusajs/rbac`), SSO (`@medusajs/auth-oidc`) and audit logs (`@medusajs/audit`) need a commercial agreement; "Enabling any Enterprise feature flag constitutes a representation that you hold a valid commercial agreement".
- [source] `@medusajs/medusa@2.23.1` lists `@medusajs/rbac`, `@medusajs/audit` and `@medusajs/auth-oidc` as dependencies, so the code is present in every install.
- **Change:** AD-14 should say the audit module is the shop's own, is not Medusa's `audit` module, uses a different module name (for example `shop-audit`), and that no enterprise feature flag is enabled. The Deferred row is right that roles are bought; say "enterprise licence".

### A10. Stack rows "TypeScript 5.x" and React — not what the current starters use

- [source] npm: `typescript` latest is 7.0.2. The live starters use 6: dtc-starter backend and storefront `^6.0.3`, Payload templates `6.0.3`, Expo SDK 58 default template `~6.0.3`. Only the deprecated starters use 5.
- [source] React differs by app: storefront `19.0.5` (dtc-starter), Expo SDK 58 `19.3.0` with React Native 0.88.1 (peer `react ^19.3.0`), Payload templates `19.3.1`.
- **Change:** set TypeScript to 6.0.x. Add a React row per app, and a rule that `packages/blocks`, `packages/contracts` and `packages/api-client` contain no React import (or declare React as a peer), because web and mobile cannot share one React version today.

## B. Smaller corrections

- **Stack header.** "Versions verified on the package registry" is accurate for npm rows only. Node, PostgreSQL, Redis, Caddy, Compose and Floci are not registry packages; say where each was checked.
- **PostgreSQL 17.** [search, postgresql.org versioning page] 17 is supported until 8 November 2029; PostgreSQL 19.0 was released 19 November 2026. [source] Docker official images carry 15.20, 16.16, 17.12, 18.7, 19.0, all arm64. dtc-starter asks for "v15+". 17 is valid; record that it was chosen over 18 on purpose and pin 17.12 or later.
- **Floci "latest".** [source] `floci-io/floci` exists (MIT, S3 among its services, image `floci/floci`). An unpinned tag breaks the "same compose file" promise in AD-16; pin a version. An arm64 image was not confirmed.
- **Expo 58.1.0 and expo-router 58.0.33** were published on 2026-11-26, one day before the spine. They are correct; expect patch releases.
- **Payload 4** is at `4.0.0-beta.12`, and Payload's `main` branch templates already target it. 3.94.2 is the right pin; add Payload 4 to Deferred as a known upgrade.
- **Search.** [source] Medusa 2.23.1 ships a `@medusajs/search` module with a Postgres provider. The Deferred row "Postgres full-text search" should name it or say it is not used.
- **AD-12.** Medusa's own Payload guide (written for Payload v3.54.0) installs Payload inside the storefront and syncs products. The spine's separate content app is a different, valid topology. Note that the storefront's `next 16.3.8` is outside `@payloadcms/next@3.94.2`'s peer range (`>=16.4.5 <17`), which is one more reason to keep them apart.

## C. Confirmed correct

| Item | Evidence |
| --- | --- |
| `@medusajs/medusa 2.23.1` is `latest` (2026-11-26) | [source] npm |
| `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/storage-s3` 3.94.2 are `latest` (2026-11-24) | [source] npm |
| Next 16.4.6 is `latest`; `@payloadcms/next@3.94.2` peer `>=16.4.5 <17.0.0` | [source] npm |
| Payload 3.94.2 on Postgres: bundles `pg 8.20.0`, `drizzle-orm 0.45.2`; migrations for production | [source] npm, Payload docs |
| Expo 58.1.0, expo-router 58.0.33, React Native 0.88.1, react-native-webview 14.0.1 are the set Expo SDK 58 bundles | [source] `expo/expo` branch `sdk-58` `bundledNativeModules.json`; npm |
| BullMQ 6.7.10 is `latest`; zod 4.6.7 is `latest` and is exactly the version in `@medusajs/deps@2.23.1` | [source] npm |
| sharp 0.35.5 is `latest`, has `tile()` with layout `dz` (default), ships `@img/sharp-linux-arm64` | [source] npm, sharp docs |
| OpenSeadragon 6.1.1 and razorpay 2.9.8 are `latest` | [source] npm |
| Caddy 2 (2.11.9) with arm64 image | [source] Docker official images |
| Redis locking provider exists and "manages locks across multiple instances"; `acquireLockStep` / `releaseLockStep` | [source] Medusa docs; `@medusajs/locking-redis@2.23.1` on npm |
| Custom reservations before order placement, with `metadata` | [source] Medusa docs and model |
| Custom payment provider with `getWebhookActionAndData` and a built-in webhook route | [source] Medusa docs and route source |
| Custom customer auth provider for one-time codes | [source] Medusa phone-auth tutorial |
| Admin MFA in the open-source edition (v2.15.5+) | [source] Medusa docs, licence file |
| Payload REST API under `/api`, API-key auth with `Authorization: <slug> API-Key <key>` | [source] Payload docs (3.x branch) |
| arm64 images for Postgres, Redis, Caddy and Node | [source] Docker official images |
| pgBackRest supports PostgreSQL 17 (from v2.52) and S3-compatible repositories; current release about v2.60 | [search] |

## D. Could not verify

- Oracle's Always Free limits at Oracle's own documentation (fetch blocked); A5 rests on secondary reports.
- Redis 7.2 and 7.4 end-of-life dates and licence terms at redis.io.
- pgBackRest release notes at pgbackrest.org; whether WAL-G or Barman are equally current. Also not checked: how the chosen tool is packaged with the official Postgres container image (AD-17 should name the tool and the image).
- Medusa 2.23.1 actually running on Node 24, PostgreSQL 17 and Redis 8: engines and docs allow it, nothing was run.
- OpenSeadragon touch behaviour inside react-native-webview 14 on Android: the search found nothing specific. Only version compatibility is confirmed. Needs a device spike before AD-18 is treated as settled.
- Docker Compose v2 current version; an arm64 image for Floci.
- That every native dependency of Medusa, Payload and the storefront builds on arm64 (only sharp was checked).
- Community Razorpay providers for Medusa v2 exist on npm (`@alchemilla/medusa-razorpay` 0.1.0, `medusa-plugin-razorpay-v2` 0.1.4); their quality was not assessed. The spine's own adapter remains the safe assumption.

## Sources

- npm registry: `registry.npmjs.org/<package>` for every npm row above
- https://github.com/medusajs/medusa (develop, commit 293a5925): `ENTERPRISE-LICENSE.md`; `www/apps/resources/app/commerce-modules/{inventory,payment,auth}`; `www/apps/resources/app/infrastructure-modules/{locking,event,workflow-engine}`; `www/apps/book/app/learn/production/worker-mode`; `packages/modules/inventory/src/models/reservation-item.ts`; `packages/medusa/src/api/hooks/payment/[provider]/route.ts`; `packages/core/core-flows/src/cart/workflows/complete-cart.ts`; `packages/core/core-flows/src/payment/workflows/process-payment.ts`
- https://docs.medusajs.com/learn/installation
- https://github.com/medusajs/nextjs-starter-medusa and https://github.com/medusajs/dtc-starter
- https://github.com/payloadcms/payload (docs/authentication/api-keys.mdx, docs/rest-api/overview.mdx, docs/database/postgres.mdx, templates)
- https://github.com/expo/expo (branch sdk-58, `packages/expo/bundledNativeModules.json`, default template)
- https://github.com/lovell/sharp (docs, api-output)
- https://github.com/taskforcesh/bullmq (docs/gitbook/guide/going-to-production.md, connections.md)
- https://github.com/nodejs/Release (schedule.json); https://nodejs.org/dist/index.json
- https://github.com/docker-library/official-images (library/postgres, redis, caddy, node)
- https://github.com/floci-io/floci
- https://www.postgresql.org/support/versioning/ (via search)
- https://pgbackrest.org/release.html (via search)
- https://infoq.com/news/2026/07/oracle-cloud-free-tier-limits/ ; https://www.linuxtoday.com/blog/oracle-quietly-cuts-free-tier-ampere-a1-resources-in-half/ ; https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm (via search)
- https://www.theregister.com/2025/08/14/redis_redux/ ; https://redis.io/docs/latest/operate/rs/installing-upgrading/product-lifecycle/ (via search)
