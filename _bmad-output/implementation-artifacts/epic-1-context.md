# Epic 1 Context: One saree, bought and returned end to end

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Prove the whole shop on one thin slice before adding breadth. The Owner lists one Design with stock. A Shopper pays for it on the website, sees her Order and tax invoice, has it shipped, returns it and is refunded to the payment method she used. On the way the epic sets up the foundations every later epic builds on: the repository from the Medusa DTC starter, the shared contracts and the api-client seam, local and staging environments, the kernel route allow-list, Admin sign-in with an enforced second factor, continuous backup with one rehearsed restore, the size gate that decides production hosting, one end-to-end test that blocks every deploy, and a proof on a real Android phone. It also settles the architecture spike items (1–8). Each FR it touches is built only to a first working version; later epics complete them.

## Stories

- Story 1.1: Create the repository from the starter and reshape it
- Story 1.2: Shared contracts and the api-client seam
- Story 1.3: Local environment from one compose file
- Story 1.4: Route allow-list for the kernel
- Story 1.5: Shop settings with dates, and one tax calculation
- Story 1.6: Owner creates and publishes one Design
- Story 1.7: Owner sets and adjusts stock in Pieces
- Story 1.8: Shopper opens the Design and puts it in her cart
- Story 1.9: Begin checkout: snapshot and Hold
- Story 1.10: Pay with Razorpay; the Order is created from the webhook
- Story 1.11: Failed, pending and late payments
- Story 1.12: Daily reconciliation of payments and Orders
- Story 1.13: Shopper sees her Order and its tax invoice
- Story 1.14: Invoice file rendered by the shop worker
- Story 1.15: Owner finds an Order, packs it and creates its shipping label
- Story 1.16: Owner dispatches an Order and its Pieces leave stock
- Story 1.17: Tracking events from the shipping service move the Order
- Story 1.18: Shopper requests a Return and books a pickup
- Story 1.19: Owner inspects a returned saree and restocks a sound Piece
- Story 1.20: An accepted Return is refunded to the payment method used, with a credit note
- Story 1.21: Owner refunds part of an Order, and an undelivered Order in full
- Story 1.22: Admin sign-in with an enforced second factor, and an audit trail
- Story 1.23: Content application behind the access gate
- Story 1.24: Deploy the slice to the staging server
- Story 1.25: Continuous database backup and one rehearsed restore
- Story 1.26: The size gate
- Story 1.27: One end-to-end test buys, ships and returns a saree
- Story 1.28: Android proof on a real phone: screen, viewer and blurred bar

## Requirements & Constraints

- **Payments are exact:** no Order without a server-confirmed payment; no captured payment without an Order or an automatic refund; daily reconciliation shows no unexplained difference. Prepaid only (UPI, card, netbanking); no cash on delivery; no card data stored; the amount charged equals the snapshot total.
- **No overselling:** a 15-minute Hold starts when payment begins. For the last Piece, exactly one Shopper gets the Hold, and the other is told before paying. A late payment becomes an Order only if the Pieces are still free; otherwise it is refunded automatically within 5 minutes. A duplicate confirmation gives one Order. Changed or sold-out lines must be accepted before checkout.
- **Stock** is counted in Pieces per Variant. Every change records time, cause and actor, and the history is viewable. A returned or undelivered Piece is sellable again only after inspection; a damaged Piece never returns to stock.
- **Invoices:** tax per line exact to the paisa, and the lines sum to the amount paid. Numbers are gapless per financial year (1 April–31 March, business time zone). Refunds go back to the payment method used, with a credit note. Refunds start within 2 working days (Mon–Sat, minus holidays in settings). An Order is Refunded only when the total refunded equals the total paid.
- **Recovery:** at most 15 minutes of Orders lost. A rebuild targets 4 hours. A lost Order is rebuilt from the payment service's records plus the Checkout recovery file. On the free tier these figures are targets under test, not promises.
- **Tested integrations:** Razorpay and the shipping adapter have contract tests against their test modes, run before every release.
- **Renameable:** the product name appears only in settings and content. A CI name check reads the forbidden name from CI configuration.
- **Seeded working values** (all dated settings, never hardcoded): tax 5% for the saree tax code, Hold 15 min, return period 7 days, shipping Rs 0, working days, empty holiday list, business time zone, seller legal details, financial-year start month.
- **Honest design:** the Hold timer is the only timer, and it is shown as fact, not pressure. Shipping is shown before checkout. No pre-ticked boxes.
- **Open dependency:** the shipping service is not yet named (PRD open question 2). Story 1.15 writes the port first and stops if the founder has not supplied the service and its test credentials.

### Newer decisions that override Epic 1 stories (2026-11-27; apply when each story is revised)

- **Story 1.22 (Admin second factor):** FR-60 now specifies a one-time code sent to the Owner's email and mobile at every sign-in. The story says "the kernel's built-in second factor". This needs SMS and email sender adapters, which arrive only in Epic 3. The change table defers the fix to "Epic 1 or 7". Decide before building 1.22. Lockout (5 tries / 15 min), documented recovery and audit are unchanged.
- **Stories 1.2, 1.9, 1.27 (Shopper sign-in):** email and password stays as the kernel's stand-in for this epic, behind the same api-client functions. The final FR-26 is a mobile SMS code with an email code as the alternative, plus mobile proof before the first Order for email sign-ins. Epic 3 replaces the stand-in and must update the end-to-end test.
- **Stories 1.8, 1.9 (Shopper copy):** say "Bag" in all Shopper-facing wording.
- **Stories 1.6, 1.8 (Weavers):** Weavers are Admin-only records. The Design page must never show a Weaver. Story 1.8's "Weaver left for Epic 2" now means never shown to Shoppers. The Weaver requirement in `publish-design` still arrives in Epic 2.
- **Story 1.6 (attributes):** NFR-17 and FR-65 make attributes depend on the category, and Epic 2 revises them. Keep the epic's saree fields but avoid baking saree-only assumptions into the `design-attributes` naming and shape.
- **Story 1.8 (stock status):** FR-3 now adds a true low-stock count ("Only 3 left") at or below an Owner-set level. Epic 2 delivers it; for 1.8, available / sold out / unavailable for now is still enough. Free delivery matches the seeded Rs 0.
- **Out of Epic 1 despite the new boards:** Buy now (FR-61), coupons, wishlist, push notifications.

## Technical Decisions

- **Pinned stack (production):** Node.js 24 LTS (≥24.22.3); TypeScript 6.0.x; pnpm workspaces and Turborepo as the starter pins them; Medusa `@medusajs/medusa` 2.23.1; Medusa DTC starter at current `main` (storefront on Next.js 16.3.8, React 19.0.5; record the commit in `docs/`). Payload 3.94.2 (`@payloadcms/next`, `db-postgres`, `storage-s3`) on Next.js 16.4.6, React 19.3.1. PostgreSQL 17; Redis 8.x (spike); BullMQ 6.7.6; zod 4.6.7; Razorpay Node SDK 2.9.8; pdfkit 0.21.0; @playwright/test 1.65.1; sharp 0.35.5; OpenSeadragon 6.1.1; Expo 58.1.0, React Native 0.88.1, expo-router 58.0.33, react-native-webview 14.0.1; Caddy 2; Docker Compose v2; Floci pinned to a release tag; k6 and pgBackRest at current stable.
- **Local environment constraint (this cloud container):** PostgreSQL 16, Redis 7, Node 22, and no running Docker daemon. The compose stack (1.3, 1.23, 1.27) cannot run here as written, and the Node 24 / Redis 8 / Postgres 17 spike proofs cannot be shown locally. Develop and unit-test against the local services, record any version-specific behaviour, and leave the pinned versions unchanged. The spike proofs belong on a Docker host and on staging. Story 1.3 says to stop and report rather than substitute versions without the founder's decision.
- **Repository:** `apps/commerce` (from the starter's `apps/backend`), `apps/web` (from `apps/storefront`), `apps/worker`, `apps/content`, `apps/mobile`, `packages/contracts`, `packages/api-client`, `packages/blocks`, `infra/`, `docs/`. Each directory is created by the first story that needs it. Package scope is `@shop/*`. Files and directories are kebab-case.
- **One writer:** only commerce writes business state. The worker and content use `/internal/*` with service tokens, and those routes are refused at Caddy. Every state change is a named workflow with compensation. Routes, subscribers and scheduled jobs only validate input and start workflows. Kernel scheduled jobs are the only scheduler.
- **Contracts first:** every cross-unit shape is a zod schema in `packages/contracts`, with types inferred from it. This covers error envelope `{code,message,details?}` with stable codes, view models (`ShopperView`, `DesignCard`, `DesignView`, `CartView`, `OrderView`), Order and Return state enums with their transition tables, money functions, the route allow-list and job names. UI reads data only through `packages/api-client`. Kernel SDK imports outside it fail lint. Requests carry `X-Client`, language and a request id, and state changes carry an `Idempotency-Key`. Unknown response fields are ignored.
- **Allow-list:** kernel routes not on the list return `route.not_allowed`. Cart completion and direct stock, reservation, payment and refund edits are on a never-allowed list. Shop routes live under `/store/shop/*`, `/admin/shop/*`, `/internal/*` and `/webhooks/*`. Each route accepts exactly one identity kind.
- **Money:** integer paise everywhere. Shelf prices are tax-inclusive multiples of 100 paise. Tax comes from dated value bands, and the rounding remainder goes in the tax line. The shop's own kernel tax provider is the only tax code. Every price change writes a price-history row. Clients format amounts and never compute them.
- **Stock:** available = stocked − reserved. A Hold is a shop record plus kernel reservations tagged with the Hold id. Only `begin-checkout`, `confirm-payment`, `release-hold`, `fulfil-order`, `cancel-order`, `adjust-stock` and `restock-return` change quantities. Each takes the Redis lock and writes stock-movement rows. `confirm-payment` releases the Hold and completes the cart inside one lock (spike 1).
- **Payment:** the Razorpay webhook arrives at the kernel payment hook route. The provider verifies the signature and never reports pending. A subscriber then starts `confirm-payment`, which is idempotent on the Checkout id. Mismatched or extra captures are refunded automatically.
- **Files:** `catalog` (public, versioned) and `documents` (private, versioned: recovery files, invoices, credit notes, labels) are used in this epic. Downloads use short-lived signed links. Only an S3 client is allowed, no other cloud SDK.
- **Worker:** one BullMQ queue with the `shop` prefix, separate from the kernel queues. Jobs have deterministic ids and are idempotent. Redis has no eviction and persists to disk.
- **Identity/audit:** the `shop-audit` module records actor email, time, action, and before/after values, plus access events for personal-data reads. It is append-only. No paid kernel features (roles, single sign-on, audit) are enabled. The content admin is reached through Caddy with a 15-minute lockout, plus a Caddy access gate if Payload cannot enforce a second factor (spike 7).
- **Ops:** one `infra/compose.yaml` for local and staging. Images are built for ARM64 and x86-64. Configuration comes from environment variables checked with zod at start-up; on failure the process names the variable, never its value. Logs are structured JSON with no personal data. Every unit has a health route. Deploys run migrations before starting containers. Staging is the Oracle Cloud free ARM server (reported allowance: 2 CPU, 12 GB).

## UX & Interaction Patterns

DESIGN.md and EXPERIENCE.md now exist (2026-11-27), so Epic 1 screens are no longer "behaviour only". Style them from the tokens: Tailwind CSS 4 with shadcn restyled, lavender on white, no shadows, 40px buttons, 14px body text, Plus Jakarta Sans and Inter, and ₹ whole rupees with Indian digit grouping. The planned shared token package has no place yet in the architecture's repository layout, so decide where it lives before the first styled story.

- **Words:** Shoppers see **"Bag"**, never "Cart". Internal names (kernel cart, `CartView`) keep the PRD glossary term. Buttons are verbs ("Add to bag"). Messages state what happened, then what to do. Interface text lives in the English translation file, never in code.
- **Bag:** always the same four price lines in the same order: Total MRP, Discount, Delivery, Total. The quantity stepper stops at the stock count and says why. A changed line shows an amber note with Accept or Remove, and paying stays disabled until it is resolved.
- **Checkout and payment:** "We hold your items for 15 minutes while you pay." The Hold timer comes from the server. When another Shopper holds the last Piece: "Someone is paying for the last piece. Check again in a few minutes." No timer is shown for the other Shopper's Hold. Pending: "We are waiting for your bank to confirm. You do not need to pay again." Failed: no Order placed, items still held. Late payment: refunded, with the amount. Cash on delivery appears as "Not available yet".
- **Order detail:** a timeline of glossary states, with the current state's date and the tracking number once shipped. Return is two steps (reason, then pickup and refund), and the refund line says the amount, where it goes and when. Exchange is out of scope, so drop any "or exchange" wording.
- **Sold out:** the page stays viewable and the purchase buttons are replaced.
- **Admin:** two Admins (commerce and content), both themed in the Alar colours and linked from the sidebar. Lists open a right-hand detail panel. Stock changes only through named actions with a reason and a person; no field lets the Owner type over a number. Destructive actions ask once.

## Cross-Story Dependencies

- Build order: 1.1 → 1.2 (contracts, api-client) → 1.3 (compose) → 1.4 (allow-list) → 1.5 (settings, tax) → 1.6/1.7 (Design, stock) → 1.8 → 1.9 (creates `documents` bucket, Hold) → 1.10 (Order state enum, Razorpay, spikes 1–2) → 1.11 → 1.12 → 1.13 (invoice, counters) → 1.14 (creates `apps/worker`) → 1.15–1.17 (shipping) → 1.18 (Return enum) → 1.19 → 1.20 → 1.21 → 1.22 (audit covers all earlier admin actions) → 1.23 (creates `apps/content`, `content` DB) → 1.24 (staging) → 1.25 → 1.26 (seed script for 100 Designs) → 1.27 → 1.28 (creates `apps/mobile`, `packages/blocks`, first `ScreenV1`; reuses `DesignCard` from 1.8).
- The recovery file grows across stories: snapshot (1.9), Order id (1.10), invoice number (1.13). Stories 1.12 and 1.25 read it.
- The lock helper and stock-movement row shape come from 1.7 and are reused by 1.9, 1.10, 1.16 and 1.19. The single refund path and the "total refunded = total paid" function come from 1.20 and are reused by 1.21.
- Any later story that changes sign-in, checkout, or Order and Return states must update the end-to-end test (1.27) in the same story, because it blocks deploys.
- Handoffs out: the automatic-refund message goes to Story 3.20, the Admin settings pages to Epic 3, the real viewer to 2.10, `ScreenV1` and blocks to 5.1, the app shell to 6.1, and the full size-gate rerun to 7.11.
