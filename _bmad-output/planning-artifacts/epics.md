---
status: draft
stepsCompleted: [1]
inputDocuments:
  - 'prds/prd-saree-commerce-2026-11-27/prd.md'
  - 'prds/prd-saree-commerce-2026-11-27/addendum.md'
  - 'architecture/architecture-saree-commerce-2026-11-27/ARCHITECTURE-SPINE.md'
---

# Alar - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Alar, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Browse and filter Designs. A Shopper can browse Designs and filter by fibre, weave, colour, occasion, price and Weaver.
FR-2: Search Designs. A Shopper can search by words in a Design's name, description, weave or Weaver.
FR-3: Design page. A Shopper can open a Design and see its photos, price, description, attributes, Weaver, stock status and delivery estimate.
FR-4: Weaver provenance. A Shopper can see who wove a Design and read about that Weaver.
FR-5: Whole-rupee, all-inclusive prices. Every price a Shopper sees is a whole number of rupees and includes tax.
FR-6: View the whole saree. A Shopper can open the Full saree view of a Design and pan and zoom along its entire length.
FR-7: Prepare a Full saree view. The Owner can upload one full-length image of a saree and have it made ready for the Full saree view.
FR-8: Try-on consent. Before a Shopper's first Try-on, she is shown a standalone notice and must accept it.
FR-9: Adults only, own photo only. A Shopper must confirm she is 18 or older and that the Shopper photo is of herself before using Try-on.
FR-10: Provide a Shopper photo. A logged-in Shopper can choose or take one full-length photo for Try-on.
FR-11: Generate a Try-on result. A Shopper can request a Try-on result for a Design and receive it without keeping the screen open.
FR-12: Present a Try-on result honestly. Every Try-on result is shown as AI-generated and separate from product photos.
FR-13: Report a Try-on result. A Shopper can report a Try-on result as wrong or offensive from the screen where she sees it.
FR-14: Try-on limits. Try-on use by each Shopper is limited.
FR-15: Withdraw consent and erase. A Shopper can withdraw Try-on consent as easily as she gave it.
FR-16: Cart. A Shopper can add Pieces to a cart, change quantities and remove them.
FR-17: Delivery check. A Shopper can enter a pincode and learn whether Alar delivers there and roughly when.
FR-18: Prepaid checkout. A Shopper can pay for her cart by UPI, card or netbanking.
FR-19: No overselling. More Pieces are never sold than are in stock. Realizes UJ-1 edge case.
FR-20: Order confirmation and invoice. After paying, a Shopper receives an Order confirmation and a tax invoice.
FR-21: Track an Order. A Shopper can see the status of each Order from payment to delivery.
FR-22: Cancel before dispatch. A Shopper can cancel an Order that has not been dispatched and is refunded in full.
FR-23: Request a Return. A Shopper can request a Return within the return period, give a reason and book a pickup.
FR-24: Refunds to source. A refund goes back to the payment method the Shopper used.
FR-25: Inspect before restock. A returned or undelivered Piece becomes sellable again only after the Owner marks it inspected.
FR-26: Sign in. A Shopper can sign in with her mobile number and a one-time code. `[ASSUMPTION]`
FR-27: Delete account. A Shopper can delete her account from inside the app and from a public web page.
FR-28: Privacy requests and complaints. A Shopper can ask what data Alar holds about her and which services received it, ask for correction or erasure, and file a complaint.
FR-29: Required disclosures. The website and app show Alar's legal name, address, contact details and grievance officer, and link to the privacy policy and terms.
FR-30: Compose a screen from Blocks. The Owner can build and reorder a Server-driven screen from Blocks.
FR-31: Draft, preview, schedule, publish. The Owner can save a screen as a draft, preview it as a Shopper would see it, publish it now or at a set time, and return to an earlier version.
FR-32: Old apps keep working. An app version that does not know a Block still shows the rest of the screen.
FR-33: No unreviewed features. A Server-driven screen can only arrange components and actions already built into the app.
FR-34: Create and publish a Design. The Owner can create a Design with photos, attributes, Weaver, price and stock, preview it and publish it.
FR-35: Variants. The Owner can give a Design several Variants, each with its own stock and price and, where they differ, its own photos.
FR-36: Stock in Pieces. The Owner can set and adjust how many Pieces of each Variant are in stock.
FR-37: Tax and price data. The Owner can set each Design's tax code, fibre and whether it is stitched, and can change the tax rate for a tax code from a given date.
FR-38: Claims need evidence. The Owner can describe a Design as silk, handloom or by a protected regional name only with supporting evidence recorded against it.
FR-39: Model route. The Owner can choose the model and AI provider for Try-on and a fallback model, and the change takes effect without a release.
FR-40: Approved-model list. The Owner can add a model to the Approved-model list only after recording its data-retention policy and period, its terms, its price per image, and that it accepts a Shopper photo and a saree image together.
FR-41: Prompt versions. The Owner can write a new Prompt version, test it, publish it and roll back.
FR-42: Limits and spend. The Owner can set Try-on limits per Shopper and a daily spending cap.
FR-43: Test before publishing. The Owner can run any approved model and Prompt version on a saved set of sample sarees and sample photos and compare the outputs side by side.
FR-44: Review queue. The Owner can see every reported Try-on result with what produced it, and mark each as handled.
FR-45: Cost and failure view. The Owner can see, by day and by Model route, how many Try-on results were made, what they cost, how long they took, and how many failed or were blocked.
FR-46: Change history. Every change to a Model route, the Approved-model list, a Prompt version, a limit or the off switch is recorded with who made it, when, and the before and after values.
FR-47: Manage Orders. The Owner can see Orders, create shipping labels, mark dispatch, and handle cancellations and Returns.
FR-48: Refund. The Owner can refund all or part of an Order; the refund follows FR-24.
FR-49: Shopper support. The Owner can look up a Shopper by mobile number or Order number and see her Orders, consents and complaints.
FR-50: Staff accounts (deferred; see §6.2). The Owner can add another person to the Admin and limit what that person can do.
FR-51: Try-on retention. Shopper photos and Try-on results are deleted when they have not been used for 30 days. `[ASSUMPTION: 30 days]`
FR-52: Check every Try-on result. Every Try-on result is checked before the Shopper sees it.
FR-53: Ask whether it matched. After delivery, a Shopper is asked to rate from 1 to 5 whether the saree matched what she saw, and may add a comment.
FR-54: Messages. A Shopper is told about each event that concerns her, and the Owner about each event that needs action.
FR-55: Minimum app version. The Owner can set the oldest app version allowed to run.
FR-56: Shop settings. The Owner can set the delivery region, the shipping charge rule, the return period and conditions, and the Try-on limits.
FR-57: Weavers. The Owner can create and edit a Weaver: name, place, story and photos.
FR-58: Discounts. The Owner can create a discount as a percentage or an amount, for chosen Designs, between two dates, applied automatically or by a code.
FR-59: Notices, policies and translations. The Owner can edit the Try-on consent notice, the terms, the policies, the disclosures and their translations, each as a numbered version.
FR-60: Admin sign-in. The Owner signs in to the Admin with a password and a second factor.

### NonFunctional Requirements

NFR-1: Speed on a phone. A Design page is usable within 3 seconds on a mid-range Android phone on a 4G connection. `[ASSUMPTION]`
NFR-2: Try-on time. 95% of Try-on results arrive within 60 seconds of the request. `[ASSUMPTION: to be reset after the Try-on test]`
NFR-3: Try-on cost. The Owner sets a ceiling on cost per Try-on result; a Model route above it cannot be published.
NFR-4: Payments are exact. No Order without a confirmed payment, no payment without an Order or an automatic refund; daily reconciliation between payments and Orders shows no unexplained difference.
NFR-5: Security. Personal data and Shopper photos are encrypted in transit and at rest; Shopper photos are reachable only through short-lived links; Admin access needs a second factor; access to personal data is logged and the logs kept one year.
NFR-6: Erasure. A withdrawal or deletion is complete within Alar in 24 hours, and erasure requests to AI providers are sent in the same period. `[ASSUMPTION]` Access logs kept under NFR-5 record that data was accessed, never the photo itself; how the one-year log duty sits with erasure is a question for the lawyer (§8).
NFR-7: Breach response. Alar can tell affected Shoppers without delay and produce a detailed report within 72 hours.
NFR-8: Recovery. No more than 15 minutes of Orders can be lost in a failure, and any lost Order can be rebuilt from the payment service's records. Backups cover the database and stored files (product photos, full-length images, invoices) and go to a separate location. A restore is rehearsed before launch and every quarter, and the shop can be rebuilt on a new server within 4 hours. `[ASSUMPTION: the figures]` On the free hosting tier these figures are targets to test, not promises; the system must be portable to a paid server without redesign.
NFR-9: Monitoring. The Owner is alerted within 5 minutes when the shop is down, when application errors or payment failures rise above a set rate, when Try-on fails above a set rate, and when the daily Try-on spend reaches 80% of its cap.
NFR-10: One operator. Every routine task is done in the Admin; nothing routine needs a command line or a release.
NFR-11: Tested integrations. Payment, shipping and each AI provider have automated tests against their test environments that run before every release.
NFR-12: Renameable. The product name appears only in settings and content; the app-store identifier does not contain it.
NFR-13: Honest design. No pre-ticked extras, false urgency or late-added charges, and no sign-up demanded for anything unrelated to the purchase (signing in at checkout to confirm a mobile number is not such a demand). A yearly self-audit against the official list of dark patterns is recorded.
NFR-14: Languages. All Shopper-facing text can be translated without a release.
NFR-15: Accessibility. Text is readable at large system font sizes and every action is reachable by screen reader. `[ASSUMPTION]`
NFR-16: Measurement. Alar counts Design-page views, Full saree view opens, Try-on requests, cart additions and Orders, so that §9 can be measured. Counts are not tied to advertising profiles and are not shared with advertisers.

### Additional Requirements

- **Starter template (Epic 1, Story 1):** the repository is created from the Medusa DTC starter (pnpm workspaces and Turborepo); its `apps/backend` becomes `apps/commerce` and its `apps/storefront` becomes `apps/web`. The starter's data layer is replaced by `packages/api-client` before any feature work (AD-2), and its card-payment checkout by the Razorpay provider (AD-7).
- **Spike before breadth:** the seven items in the spine's "First build step" must be proven first, including the size gate that decides production hosting.
- **Repository shape:** `apps/commerce`, `apps/content`, `apps/worker`, `apps/web`, `apps/mobile`, `packages/contracts`, `packages/api-client`, `packages/blocks`, `infra/` (Structural Seed).
- **One writer and workflows:** only commerce writes business state; every state change is a named workflow; sidecars report through `/internal/*` (AD-1, AD-4, AD-9).
- **Kernel allow-list:** a middleware refuses kernel routes not on the list in `packages/contracts`; cart completion and direct stock, payment and refund edits are replaced by shop routes and admin pages (AD-21).
- **Contracts first:** every shape crossing a unit boundary is a zod schema in `packages/contracts`: view models, `ScreenV1`, job payloads, error codes, Order and Return states, money functions (AD-2, AD-5, AD-19, AD-24).
- **Stock and payment:** Hold as a shop record plus tagged reservations; seven stock workflows under the Redis lock, each writing stock movements; payment confirmed only server-side from the verified webhook; daily reconciliation (AD-6, AD-7).
- **Queues:** one BullMQ shop queue beside the kernel's own; idempotent jobs; Redis for queues and locks never evicts and persists (AD-8).
- **Files:** four buckets; single-use signed upload links; provider output stored unchanged; label drawn by clients (AD-22).
- **Erasure:** one workflow with a ledger and provider erasure jobs (AD-23).
- **Consent link:** numbered notice versions with AI-service ids, published from content to commerce (AD-11).
- **Server-driven screens:** `ScreenV1` composed by commerce with embedded `DesignCard`; block registry in `packages/blocks`; unknown Blocks skipped (AD-12).
- **Compatibility:** additive-only shop routes, `X-Client` header, minimum-version check, replay of recorded responses in CI (AD-27).
- **Identity:** customer one-time-code provider; enforced admin second factor; content admin behind a proxy gate until it has one; service tokens (AD-15).
- **Audit:** `shop-audit` events for every admin change in both admins, plus access events; no paid kernel features enabled (AD-14).
- **Invoices:** immutable invoice and credit-note records with per-year sequences; rendered by the worker (AD-25).
- **Messages:** all messages are `message.send` jobs sent by the worker from content templates (AD-26).
- **Catalogue:** `design-attributes` module and the single `/store/shop/designs` read; `publish-design` workflow (AD-28).
- **Counts:** the shop's own counts module; no third-party analytics SDK (AD-29).
- **Deployment and recovery:** one compose file, ARM64 and x86-64 images built in CI, Caddy, environment-variable configuration checked at start, pgBackRest with continuous log shipping to another location, a rehearsed restore script (AD-16, AD-17).
- **Regulated values as settings with dates;** product name only in configuration (AD-13, AD-20).
- **Conventions:** naming, error envelope, idempotency keys, rate limits, logging without personal data, vendor adapters with contract tests, per-workflow tests and one end-to-end purchase test (Consistency Conventions).
- **Legal documents:** the drafts in `docs/legal/` are loaded into content as the first versions of the notices and policies, with placeholders filled.

### UX Design Requirements

No UX design contract exists yet (no `DESIGN.md` or `EXPERIENCE.md`). The founder wants the look to be modern, distinctive and attractive (PRD §7a). Until a UX contract is written, stories for Shopper-facing screens carry behaviour only; visual design is a separate, later input. See the question at the end of this step.

### FR Coverage Map

FR-1: Epic 2 - Browse and filter Designs
FR-2: Epic 2 - Search Designs
FR-3: Epic 1, completed in 2 - Design page
FR-4: Epic 2 - Weaver provenance
FR-5: Epic 2 - Whole-rupee, all-inclusive prices
FR-6: Epic 2 - View the whole saree
FR-7: Epic 2 - Prepare a Full saree view
FR-8: Epic 4 - Try-on consent
FR-9: Epic 4 - Adults only, own photo only
FR-10: Epic 4 - Provide a Shopper photo
FR-11: Epic 4 - Generate a Try-on result
FR-12: Epic 4 - Present a Try-on result honestly
FR-13: Epic 4 - Report a Try-on result
FR-14: Epic 4 - Try-on limits
FR-15: Epic 4 - Withdraw consent and erase
FR-16: Epic 1, completed in 3 - Cart
FR-17: Epic 3 - Delivery check
FR-18: Epic 1 - Prepaid checkout
FR-19: Epic 1 - No overselling
FR-20: Epic 1 - Order confirmation and invoice
FR-21: Epic 1, completed in 3 - Track an Order
FR-22: Epic 3 - Cancel before dispatch
FR-23: Epic 1, completed in 3 - Request a Return
FR-24: Epic 1 - Refunds to source
FR-25: Epic 1 - Inspect before restock
FR-26: Epic 3 - Sign in
FR-27: Epic 3 - Delete account
FR-28: Epic 3 - Privacy requests and complaints
FR-29: Epic 3 - Required disclosures
FR-30: Epic 5 - Compose a screen from Blocks
FR-31: Epic 5 - Draft, preview, schedule, publish
FR-32: Epic 5 - Old apps keep working
FR-33: Epic 5 - No unreviewed features
FR-34: Epic 1, completed in 2 - Create and publish a Design
FR-35: Epic 2 - Variants
FR-36: Epic 1 - Stock in Pieces
FR-37: Epic 2 - Tax and price data
FR-38: Epic 2 - Claims need evidence
FR-39: Epic 4 - Model route
FR-40: Epic 4 - Approved-model list
FR-41: Epic 4 - Prompt versions
FR-42: Epic 4 - Limits and spend
FR-43: Epic 4 - Test before publishing
FR-44: Epic 4 - Review queue
FR-45: Epic 4 - Cost and failure view
FR-46: Epic 4 - Change history
FR-47: Epic 1, completed in 3 - Manage Orders
FR-48: Epic 1, completed in 3 - Refund
FR-49: Epic 3 - Shopper support
FR-50: deferred (PRD §6.2) - Staff accounts (deferred; see §6
FR-51: Epic 4 - Try-on retention
FR-52: Epic 4 - Check every Try-on result
FR-53: Epic 3 - Ask whether it matched
FR-54: Epic 3 - Messages
FR-55: Epic 6 - Minimum app version
FR-56: Epic 3 - Shop settings
FR-57: Epic 2 - Weavers
FR-58: Epic 2 - Discounts
FR-59: Epic 3 - Notices, policies and translations
FR-60: Epic 1 - Admin sign-in

Every FR from FR-1 to FR-33 is also delivered in the Android app by Epic 6.

## Epic List

Seven epics, in build order. Each leaves something a Shopper or the Owner can use; each builds only on the ones before it. `[ASSUMPTION]` The grouping and order were proposed by the analyst on the fast path.

### Epic 1: One saree, bought and returned end to end
The Owner lists one Design; a Shopper pays for it on the website, receives an invoice, gets it shipped, returns it and is refunded. The repository, the contracts, the deployment and the seven spike questions are settled on the way, because this slice cannot work without them.
**FRs covered (first working version of each):** FR-3, FR-16, FR-18, FR-19, FR-20, FR-21, FR-23, FR-24, FR-25, FR-34, FR-36, FR-47, FR-48, FR-60
**NFRs:** NFR-4, NFR-8, NFR-11, NFR-12
**Notes:** starts from the Medusa DTC starter; replaces its data layer and checkout; proves the Hold, server-side payment confirmation, the route allow-list, the stack on the ARM server and the size gate.

### Epic 2: Shoppers find a saree and trust what they see
A Shopper browses, filters and searches about 100 Designs, reads who wove each one, and inspects the whole saree in the Full saree view. The Owner lists Designs with full attributes, Weavers, tax data and evidence-backed claims in under 15 minutes.
**FRs covered:** FR-1, FR-2, FR-3 (complete), FR-4, FR-5, FR-6, FR-7, FR-34 (complete), FR-35, FR-37, FR-38, FR-57, FR-58
**NFRs:** NFR-1, NFR-14

### Epic 3: A complete shop: accounts, orders, returns and support
A Shopper signs in with a one-time code, checks delivery to her pincode, follows her Order, cancels or returns it, rates whether it matched, is told about every step, and can use her privacy rights. The Owner runs Orders, Returns, refunds, complaints and shop settings from the Admin.
**FRs covered:** FR-16 (complete), FR-17, FR-21 (complete), FR-22, FR-23 (complete), FR-26, FR-27, FR-28, FR-29, FR-47 (complete), FR-48 (complete), FR-49, FR-53, FR-54, FR-56, FR-59
**NFRs:** NFR-5, NFR-6, NFR-13

### Epic 4: Try-on with consent, under the Owner's control
An adult Shopper accepts the Try-on consent notice, uploads her photo and sees herself in a Design, labelled as AI-generated; she can report a result, and withdraw consent and have everything erased. The Owner chooses models and prompts within guardrails, tests them on sample sarees, caps spending and can switch Try-on off. The launch gate test decides whether Try-on ships.
**FRs covered:** FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-39, FR-40, FR-41, FR-42, FR-43, FR-44, FR-45, FR-46, FR-51, FR-52
**NFRs:** NFR-2, NFR-3

### Epic 5: The Owner changes the shop's screens without a release
The Owner builds home, category and campaign screens from Blocks, previews, schedules and publishes them, and they appear on the website at once.
**FRs covered:** FR-30, FR-31, FR-32, FR-33

### Epic 6: The Android app
A Shopper does everything above in the Android app: server-driven screens, native checkout, photo picker, Try-on, the Full saree view, and a forced update when her version is too old.
**FRs covered (in the app):** FR-1 to FR-33 as built for the website, FR-55
**NFRs:** NFR-1, NFR-15

### Epic 7: Ready to launch and to run alone
The Owner is alerted when something breaks, can restore the shop from backups, sees the counts behind the success metrics, has the legal documents and disclosures live, and the app is accepted by the store.
**FRs covered:** none new; FR-50 stays deferred
**NFRs:** NFR-7, NFR-8 (complete), NFR-9, NFR-10, NFR-16, and a final pass on NFR-1 to NFR-15

