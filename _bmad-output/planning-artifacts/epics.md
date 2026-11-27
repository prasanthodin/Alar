---
status: draft
stepsCompleted: []
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

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
