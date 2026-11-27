---
status: final
stepsCompleted: [1, 2, 3, 4]
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
- **Spike before breadth:** the eight items in the spine's "First build step" must be proven first, the Android ones in a proof at the end of Epic 1, including the size gate that decides production hosting.
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
- **Invoices:** immutable invoice and credit-note records with gapless numbers from a locked counter per year; rendered by the worker; every Checkout leaves a recovery file (AD-25, AD-30).
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
The Owner lists one Design; a Shopper pays for it on the website, receives an invoice, gets it shipped, returns it and is refunded. The repository, the contracts, the deployment and the spike questions are settled on the way, ending with a proof on a real Android phone, because this slice cannot work without them.
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
A Shopper does everything above in the Android app: server-driven screens, checkout with the payment service's hosted payment page, photo picker, Try-on, the Full saree view, and a forced update when her version is too old.
**FRs covered (in the app):** FR-1 to FR-33 as built for the website, FR-55
**NFRs:** NFR-1, NFR-15

### Epic 7: Ready to launch and to run alone
The Owner is alerted when something breaks, can restore the shop from backups, sees the counts behind the success metrics, has the legal documents and disclosures live, and the app is accepted by the store.
**FRs covered:** none new; FR-50 stays deferred
**NFRs:** NFR-7, NFR-8 (complete), NFR-9, NFR-10, NFR-16, and a final pass on NFR-1 to NFR-15

## Epic 1: One saree, bought and returned end to end

The Owner lists one Design with stock; a Shopper pays for it on the website, sees her Order and its tax invoice, has it shipped, returns it and is refunded to the payment method she used. To make that slice work, this epic also creates the repository from the Medusa DTC starter, the shared contracts and the api-client seam, the local and staging environments, the route allow-list, admin sign-in with an enforced second factor, continuous database backup with one rehearsed restore, the size gate, one automated test that buys, ships and returns a saree, and a proof on a real Android phone of the three things the app depends on. It builds only the first working version of FR-3, FR-16, FR-18, FR-19, FR-20, FR-21, FR-23, FR-24, FR-25, FR-34, FR-36, FR-47, FR-48 and FR-60; later epics complete them. In this slice a Shopper signs in with the kernel's email-and-password customer sign-in, the simplest the kernel offers; sign-in by one-time code (FR-26) replaces it in Epic 3. Catalogue browsing and filters, Try-on, Server-driven screens and the Android app are not in this epic. Screens are described by behaviour only and are styled from DESIGN.md when it exists.

**Spike items proven here:** item 1 in Story 1.10; item 2 in Stories 1.4 and 1.10; item 3 in Stories 1.3 and 1.24; item 4 in Story 1.26; item 7 in Story 1.23; items 5, 6 and 8 (a sample `ScreenV1` document, OpenSeadragon under touch in a web view, and a blurred translucent navigation bar, all in a minimal Expo app on a real mid-range Android phone) in Story 1.28. The Server-driven screens themselves, the Full saree view and the Android app are built by Epics 5, 2 and 6 on what Story 1.28 proves.

### Story 1.1: Create the repository from the starter and reshape it

As a builder,
I want the repository created from the Medusa DTC starter and reshaped to the spine's layout,
So that every later story starts from the agreed structure, versions and names.

**Acceptance Criteria:**

**Given** an empty repository
**When** it is created from the Medusa DTC starter (current `main`)
**Then** `apps/backend` is renamed `apps/commerce` and `apps/storefront` is renamed `apps/web`, and `infra/` and `docs/` exist
**And** the workspace still uses pnpm workspaces and Turborepo as the starter pins them
**And** no other `apps/*` or `packages/*` directory is created yet; each is created by the story that first needs it

**Given** the reshaped repository
**When** install, lint, type-check, test and build are run from the root on Node.js 24 LTS
**Then** all pass for `apps/commerce` and `apps/web`
**And** `@medusajs/medusa` is pinned to 2.23.1 and TypeScript to 6.0.x
**And** the kernel and the storefront start with the starter's own documented development commands and the storefront loads its home page

**Given** the package manifests
**When** they are inspected
**Then** every workspace package name uses the scope `@shop/*`
**And** no package name, application id, bucket name, database name or domain in code contains the product name

**Given** a commit that adds the product name to any file under `apps/` or `packages/`, other than content or settings data
**When** continuous integration runs
**Then** a name check fails the build and names the file
**And** the check takes the forbidden name from continuous-integration configuration, not from source code

**Given** a push to any branch
**When** continuous integration runs
**Then** it runs install, lint, type-check, test and build, and fails if any of them fails

**Requirements:** NFR-12; AD-16, AD-19, AD-20; Additional Requirements "Starter template" and "Repository shape"
**Notes for the developer:**
- Touches the repository root, `apps/commerce`, `apps/web` and continuous-integration configuration only.
- Keep the starter's data layer and checkout working for now; Story 1.2 replaces the data layer and Story 1.10 replaces the card-payment checkout.
- Naming follows the Consistency Conventions: kebab-case files and directories.
- Record the starter commit used in `docs/`.

### Story 1.2: Shared contracts and the api-client seam

As a Shopper,
I want to create an account and sign in on the website through one shared client package,
So that I can be recognised at checkout, and every screen reads the backend the same way.

**Acceptance Criteria:**

**Given** the repository from Story 1.1
**When** `packages/contracts` is created
**Then** it holds zod 4.6.7 schemas for the error envelope `{ code, message, details? }`, the list of stable error codes, id and UTC ISO 8601 time shapes, and the `ShopperView` view model
**And** types are inferred from the schemas and the package imports no UI framework

**Given** `packages/api-client` is created
**When** UI code needs data
**Then** it calls only functions of `packages/api-client` (`signUp`, `signIn`, `signOut`, `getShopper` in this story), each returning a view model from `packages/contracts`
**And** the kernel's SDK is a dependency of `packages/api-client` only, and its types appear in no exported signature

**Given** a file under `apps/web` that imports the kernel's SDK or its types
**When** lint runs
**Then** the build fails with a message naming the rule

**Given** the storefront from the starter
**When** this story is finished
**Then** the starter's data layer is deleted, and the starter pages outside this epic (collections, categories, search, the starter's account pages other than sign-in and sign-up, and the starter's checkout) are removed
**And** the remaining pages (a home shell, sign-up, sign-in, a signed-in account stub) build and get all their data from `packages/api-client`

**Given** a Shopper with no account
**When** she signs up with an email address and a password and then signs in
**Then** she is signed in through the kernel's email-and-password customer sign-in and the account stub shows her email
**And** signing out ends the session

**Given** a wrong password or an unknown email
**When** she tries to sign in
**Then** she gets the same error code for both cases and no session
**And** the screen shows a message taken from the translation file, not from code

**Given** any request made by `packages/api-client`
**When** it is sent
**Then** it carries `X-Client` with platform and version, the Shopper's language, and a request id
**And** every state-changing request carries an `Idempotency-Key`

**Given** a server response with a field the view model does not know
**When** `packages/api-client` parses it
**Then** the field is ignored and the call succeeds
**And** a response that fails the schema returns a typed error with a stable code, not a thrown kernel type

**Requirements:** AD-2, AD-15, AD-19, AD-27; Consistency Conventions (Errors, Idempotency, Text and languages); Additional Requirements "Contracts first"
**Notes for the developer:**
- Touches `packages/contracts`, `packages/api-client`, `apps/web`.
- Email-and-password sign-in is a deliberate stand-in for this slice; the one-time-code provider (FR-26, AD-15) replaces it in Epic 3 behind the same `api-client` functions.
- Shopper-facing interface text goes in one English translation file in `apps/web`. That file is the website's built-in copy (AD-28): Story 2.13 adds the other languages, and Story 3.4 serves a translation bundle per language from content through commerce, with this file kept as the fallback. Documents and message templates live in content from Epic 3.
- Screens are behaviour only; styled from DESIGN.md when it exists.
- Add schemas to `packages/contracts` only as stories need them.

### Story 1.3: Local environment from one compose file

As a builder,
I want the whole system started locally by one compose file with the local AWS emulator,
So that I develop against the same services and the same file that staging will use.

**Acceptance Criteria:**

**Given** a machine with Docker Compose v2
**When** `infra/compose.yaml` is started
**Then** PostgreSQL 17 with a database named `commerce`, Redis 8, Floci at a pinned release tag, Caddy 2, `commerce` and `web` start and report healthy
**And** commerce runs in the kernel's shared mode, so its subscribers and scheduled jobs run in the same container
**And** the website is reached through Caddy and a Shopper can sign up and sign in as in Story 1.2

**Given** the Redis container
**When** its configuration is read
**Then** it never evicts keys and persists to disk
**And** nothing uses it as a cache

**Given** the kernel on Node.js 24 with Redis 8 and PostgreSQL 17
**When** the kernel starts, emits an event, runs a workflow and takes and releases a lock
**Then** all four work, proving the local part of spike item 3
**And** if any of them fails on Redis 8, stop and report which kernel component failed and with what error; do not substitute another version without the founder's decision

**Given** a required environment variable is missing or malformed
**When** commerce or web starts
**Then** the process exits with a non-zero code and names the variable, never its value
**And** the check uses a zod schema in that application

**Given** the emulator is running
**When** the stack starts
**Then** a public, versioned bucket for `catalog` exists, and a file uploaded through the kernel's file storage is stored there and can be fetched by its public address
**And** no cloud vendor's SDK other than an S3 client is added

**Given** any request to commerce
**When** it is logged
**Then** the log line is structured JSON with a request id and contains no personal data, token or password
**And** commerce and web each expose a health route

**Requirements:** AD-3, AD-8, AD-16; Stack; Consistency Conventions (Config and secrets, Logging and alerts); spike item 3 (local part)
**Notes for the developer:**
- Touches `infra/`, and start-up configuration in `apps/commerce` and `apps/web`.
- Only the `catalog` bucket and the `commerce` database are created here; the `documents` bucket is created in Story 1.9, the `content` database in Story 1.23, the `tiles` bucket in Story 2.9 and the `shopper-media` bucket in Story 3.23.
- Bucket, database and service names must not contain the product name (AD-20).
- Container images must build for ARM64 and x86-64; the multi-architecture build itself is in Story 1.24.

### Story 1.4: Route allow-list for the kernel

As a builder,
I want every kernel route refused unless it is on one list,
So that no built-in route or admin screen can change stock, payments or Orders outside the shop's workflows.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is finished
**Then** it holds the list of kernel store and admin routes that may be called, each as a method and a path pattern
**And** the list contains the customer sign-up and sign-in routes used in Story 1.2 and the admin routes that the built-in admin screens kept in use need

**Given** a request to a kernel store or admin route that is not on the list
**When** it reaches commerce
**Then** a middleware refuses it with the error envelope and the code `route.not_allowed`
**And** nothing in the database changes

**Given** the kernel's cart-completion route
**When** a client calls it, signed in or not
**Then** it is refused with `route.not_allowed`, proving the first half of spike item 2
**And** an automated test asserts the same refusal for direct edits of stock levels, reservations, payments and refunds

**Given** the list
**When** a developer tries to add cart completion or a direct stock, reservation, payment or refund edit to it
**Then** a test in `packages/contracts` fails, because those routes are on a never-allowed list in the same file

**Given** `packages/api-client`
**When** it builds a request to a kernel route
**Then** the path comes from the allow-list, and a test fails if `api-client` contains a kernel path that is not on it

**Given** the Admin
**When** the Owner opens it
**Then** the built-in screens for stock levels, reservations, payments and refunds are not reachable from its navigation
**And** if the kernel cannot hide one of them, its write routes are still refused and the screen is listed in `docs/` as visible but inert

**Given** a Shopper's token
**When** it is sent to an admin route, or an admin session is sent to a store route that needs a Shopper
**Then** the request is refused, because each route accepts exactly one kind of identity

**Requirements:** AD-21, AD-15, AD-7 (blocking only); spike item 2 (first half)
**Notes for the developer:**
- Touches `packages/contracts` (the list), `apps/commerce/src/api/middlewares`, and admin configuration in `apps/commerce/src/admin`.
- Shop routes (`/store/shop/*`, `/admin/shop/*`, `/internal/*`, `/webhooks/*`) are the shop's own and are not on this list.
- If blocking cart completion for clients cannot be done without also breaking the kernel's server-side completion, stop and report; Story 1.10 proves the server-side half.
- Later stories add a kernel route to the list only in the story that first calls it.

### Story 1.5: Shop settings with dates, and one tax calculation

As an Owner,
I want the shop's name, time zone and tax rates held as dated settings, and tax worked out in one place,
So that a rename or a tax answer changes data, not code, and every total is exact.

**Acceptance Criteria:**

**Given** the `settings` module is created in commerce
**When** a setting is read
**Then** the value returned is the one whose effective date is the latest not after the time asked for
**And** each key's value is checked against a zod schema in `packages/contracts`

**Given** the seed for this story
**When** it runs
**Then** it sets the shop name, the business time zone, and the tax bands for the saree tax code as 5% at any per-piece taxable value, as the PRD's working assumption states
**And** a band is a range of per-piece taxable value, after discount and before tax, with a rate (AD-5)
**And** it creates the kernel's one region for India in rupees

**Given** a tax band value dated tomorrow
**When** tax is calculated today and again after midnight in the business time zone
**Then** today's result uses the old rate and tomorrow's uses the new one, with no release

**Given** the money functions in `packages/contracts`
**When** tax is derived from a tax-inclusive price
**Then** all amounts are integer paise, the taxable value plus the tax equals the price to the paisa, and any rounding remainder is in the tax line
**And** a price of Rs 2,100 at 5% gives a taxable value of 200000 paise and tax of 10000 paise
**And** a shelf price that is not a multiple of 100 paise is rejected

**Given** the kernel's tax provider
**When** the kernel computes totals for any cart
**Then** the provider is the shop's own, it calls the money functions, and its lines equal the money functions' result for the same input
**And** no other code computes tax

**Given** a tax code with no band at the time asked for
**When** tax is requested
**Then** the call fails with a stable error code and no total is returned

**Given** the website
**When** any page is shown
**Then** the shop name comes from settings through `packages/api-client`
**And** the name check from Story 1.1 still passes

**Requirements:** NFR-12; AD-5, AD-13, AD-20; first data for FR-20
**Notes for the developer:**
- Touches `apps/commerce/src/modules/settings`, `apps/commerce/src/providers/tax`, `packages/contracts` (money functions, setting schemas), and the page header in `apps/web`.
- Settings are seeded in this epic; the Admin page to edit them is FR-56 in Epic 3, and changing a tax rate in the Admin is FR-37 in Epic 2.
- Later stories seed their own keys (Hold length, return period, seller details) when they first need them.
- Discounts and value-threshold bands for stitched items are left to Epic 2; the band shape must already allow them.

### Story 1.6: Owner creates and publishes one Design

As an Owner,
I want to create a Design with its photos, attributes and price and publish it,
So that there is a saree to sell.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin with her password
**When** she opens the shop's Designs page and creates a Design
**Then** she can enter a name, a description, fibre, weave, length and width in metres, whether a blouse piece is included, care, country of origin, a tax code and whether it is stitched
**And** she can upload photos, mark one as the fabric close-up, and set one Variant with a price in whole rupees
**And** the Design is saved as unpublished

**Given** the `design-attributes` module is created
**When** a Design's attributes are saved
**Then** they are typed fields linked to the kernel product, with their schema in `packages/contracts`
**And** the kernel's free-form metadata is not used for them

**Given** an unpublished Design
**When** the Owner publishes it
**Then** the `publish-design` workflow publishes it only if it has a fibre, dimensions, a tax code that has a band in settings, a price that is a multiple of 100 paise, a fabric close-up photo and at least one other photo
**And** it requires the Owner's confirmation that the photos show the saree's true colour, and records that confirmation with the time

**Given** a Design missing any one of those
**When** the Owner tries to publish it
**Then** publishing is refused, the Design stays unpublished, and the page names each missing item

**Given** a Variant's price is set or changed
**When** the change is saved
**Then** one price-history row is written with the old price, the new price and the time

**Given** the kernel's own route for changing a product's status
**When** it is called directly
**Then** it is refused under Story 1.4, so a Design is published only by `publish-design`

**Given** uploaded photos
**When** they are stored
**Then** they are in the `catalog` bucket and referenced by the Design

**Requirements:** FR-34 (first version); AD-4, AD-5, AD-21, AD-28
**Notes for the developer:**
- Touches `apps/commerce/src/modules/design-attributes`, `apps/commerce/src/modules/price-history`, `apps/commerce/src/workflows/publish-design`, `apps/commerce/src/admin`.
- The rule that a Design needs a Weaver is added to `publish-design` in Epic 2, when Weavers exist (FR-57); colour, occasion tags, zari, place woven and claims with evidence (FR-38) are also added there.
- Stock is set in Story 1.7; the Shopper's page and the Owner's preview are in Story 1.8.
- A Design has exactly one Variant in this epic (FR-35 is Epic 2).
- Admin page is behaviour only; styled from DESIGN.md when it exists.

### Story 1.7: Owner sets and adjusts stock in Pieces

As an Owner,
I want to set and adjust how many Pieces of a Variant are in stock and see why the number changed,
So that the shop never shows a saree I do not have.

**Acceptance Criteria:**

**Given** a Design from Story 1.6
**When** the Owner sets its stock to 10 Pieces on the shop's stock page
**Then** the `adjust-stock` workflow takes the Redis lock on the inventory item, sets the stocked quantity to 10 and writes one stock-movement row
**And** the row records the time, the cause "manual adjustment", the change, the Owner's email and the reason she typed

**Given** the `stock-ledger` module is created
**When** the Owner opens a Variant's stock history
**Then** she sees every stock-movement row for it, newest first, with time, cause, change and who made it
**And** no route edits or deletes a row

**Given** two adjustments of +1 sent at the same moment
**When** both finish
**Then** the stocked quantity has risen by 2 and there are two rows

**Given** a Variant with 3 Pieces stocked and 2 reserved
**When** the Owner tries to set stock to 1
**Then** the change is refused with the code `stock.below_reserved` and nothing changes

**Given** the lock cannot be taken within its time limit
**When** an adjustment is attempted
**Then** it fails with a stable error code, the quantity is unchanged and no row is written

**Given** the stock-movement row cannot be written
**When** `adjust-stock` runs
**Then** its compensation restores the earlier quantity

**Given** the kernel's own routes for editing stock levels
**When** they are called
**Then** they are refused under Story 1.4

**Requirements:** FR-36; AD-4, AD-6, AD-21
**Notes for the developer:**
- Touches `apps/commerce/src/modules/stock-ledger`, `apps/commerce/src/workflows/adjust-stock`, `apps/commerce/src/admin`.
- Available = stocked − reserved (AD-6); nothing reserves yet, so reserved is 0 until Story 1.9.
- Seed the kernel's single stock location here.
- Later stock workflows reuse the same lock helper and the same row shape; write tests for success, each failure and compensation.

### Story 1.8: Shopper opens the Design and puts it in her cart

As a Shopper,
I want to open the Design, see what it is and what it costs, and put it in a cart,
So that I can decide to buy it.

**Acceptance Criteria:**

**Given** a published Design with stock
**When** a Shopper who is not signed in opens the website
**Then** the home page shows a plain list of published Designs from `/store/shop/designs`, each a `DesignCard` view model created in this story, with no filters and no search
**And** an unpublished Design is not in that list and its page returns not found

**Given** a published Design
**When** the Shopper opens its page
**Then** she sees its photos, its price as a whole number of rupees with no paise and a statement that the price includes tax, its description, and its fibre, weave, length and width in metres, blouse piece, care and country of origin
**And** she sees its stock status, computed by the server: available, or sold out
**And** a Design with no Pieces in stock is shown as sold out with adding to cart disabled, not hidden

**Given** the Owner is signed in to the Admin
**When** she asks for a preview of an unpublished Design
**Then** she gets a link with a signed token that shows the same page a Shopper would see
**And** the link stops working when the token expires

**Given** an available Design
**When** the Shopper adds it to her cart, changes the quantity and removes it
**Then** each change is made through `packages/api-client` and the cart view model shows lines, tax-inclusive line prices and a total computed by the server
**And** the client formats amounts and never computes them

**Given** a Variant with 2 Pieces available
**When** the Shopper asks for a quantity of 3
**Then** the change is refused with a stable error code and the cart keeps its earlier quantity

**Given** a Shopper with a cart
**When** she closes the browser and returns
**Then** her cart is as she left it

**Given** the cart page
**When** it is shown
**Then** the shipping charge is shown before checkout begins; in this epic it is one seeded shipping option with a charge of Rs 0

**Requirements:** FR-3 (first version), FR-16 (first version); AD-2, AD-5, AD-21, AD-28
**Notes for the developer:**
- Touches `apps/commerce/src/api/store/shop/designs`, `packages/contracts` and `packages/api-client` (`DesignCard` for the list, `DesignView`, `CartView`), `apps/web`. Stories 1.28 and 2.15 extend `DesignCard`; they do not create it again.
- Kernel cart routes used here are added to the allow-list; cart completion stays off it.
- Left for Epic 2: Weaver, delivery estimate, maker's address and terms, the Full saree view and Try-on entry points, filters and search. Left for Epic 3: the same cart on a Shopper's other devices, and the shipping charge rule.
- Screens are behaviour only; styled from DESIGN.md when it exists.

### Story 1.9: Begin checkout: snapshot and Hold

As a Shopper,
I want the Pieces in my cart held for me from the moment I start to pay,
So that nobody else can buy them while I am paying.

**Acceptance Criteria:**

**Given** a Shopper with a cart who is not signed in
**When** she starts checkout
**Then** she is asked to sign in or sign up first, and her cart is kept

**Given** a signed-in Shopper who has entered her name, mobile number, address, pincode and state
**When** she begins checkout
**Then** the `begin-checkout` workflow, under the Redis lock on every inventory item in the cart, creates a Checkout with a snapshot of the lines, unit prices, tax per line, shipping charge, total and address
**And** it creates a Hold with the Checkout id and an expiry 15 minutes later, the length coming from a setting seeded in this story
**And** it creates kernel reservations tagged with the Hold id and writes one stock-movement row per change

**Given** `begin-checkout` has created a Checkout
**When** the workflow finishes
**Then** it has written the Checkout snapshot (items, quantities, prices, tax, address, Shopper id) as a recovery file in the private, versioned `documents` bucket, created in this story, keyed by the Checkout id (AD-30)
**And** if the file cannot be written the workflow fails, its compensation removes the reservations, the Hold and the Checkout, and no payment can be started
**And** the file's contents and address appear in no log

**Given** the last Piece of a Variant and two Shoppers who begin checkout at the same moment
**When** both requests finish
**Then** exactly one has a Hold
**And** the other receives the code `stock.unavailable` and is told the saree is unavailable for now, before any payment is started

**Given** a Design whose last Piece is on Hold
**When** another Shopper opens its page
**Then** its stock status is "unavailable for now", not sold out, and it cannot be added to a cart

**Given** a cart line whose price has changed or whose Pieces have sold out since the Shopper last saw the cart
**When** she begins checkout
**Then** no Hold is created, the response has the code `cart.changed` with each changed line, and she must accept the change before she can begin again

**Given** a cart with a live Hold
**When** anyone tries to add, change or remove a line
**Then** the change is refused with the code `cart.locked`
**And** a second `begin-checkout` for the same cart returns the existing Checkout and creates no second Hold

**Given** a Checkout with a live Hold
**When** the Shopper cancels checkout
**Then** the `release-hold` workflow removes the Hold's reservations under the lock, writes the stock-movement rows, and the cart can be changed again

**Given** a Hold whose 15 minutes have passed
**When** the kernel's scheduled job for expired Holds next runs (every minute)
**Then** it runs `release-hold`, the Pieces return to stock and the Checkout is marked expired

**Given** a cart with two lines where the second cannot be reserved
**When** `begin-checkout` fails
**Then** its compensation removes the first line's reservation and no Hold or Checkout remains

**Given** the checkout screen
**When** it is shown
**Then** it shows the snapshot total and the time the Hold ends, taken from the server

**Requirements:** FR-19 (Hold, last Piece, flagged changes), FR-16 (cart locked during a Hold), NFR-4, NFR-8; AD-4, AD-6, AD-13, AD-22, AD-30
**Notes for the developer:**
- Touches `apps/commerce/src/modules/hold` and `checkout`, `apps/commerce/src/workflows/begin-checkout` and `release-hold`, `apps/commerce/src/jobs`, `apps/commerce/src/api/store/shop/checkouts`, `infra/` (the `documents` bucket), and the checkout screen in `apps/web`.
- The recovery file is what lets a restore rebuild an Order with its original numbers; Story 1.10 adds the Order id to it, Story 1.13 the invoice number, and Stories 1.12 and 1.25 read it.
- No payment is started in this story; Story 1.10 adds the payment step to `begin-checkout`.
- The delivery check by pincode (FR-17) is Epic 3; here the address is only recorded.
- The time shown is the true end of the Hold; it must not be styled as pressure (NFR-13).

### Story 1.10: Pay with Razorpay; the Order is created from the webhook

As a Shopper,
I want to pay by UPI, card or netbanking and have my Order confirmed by the shop's server,
So that I am charged exactly once and only for a saree that is mine.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is finished
**Then** it holds the Order states Paid, Packed, Dispatched, Out for delivery, Delivered, Delivery failed, Returned to shop, Cancelled and Refunded as an enum, with a table of allowed transitions (AD-24)
**And** the `order-state` module, created in this story, stores an Order's state, and no state is written that the enum does not hold

**Given** the Razorpay payment provider is added to commerce and the starter's card-payment provider is removed
**When** a Shopper begins checkout
**Then** `begin-checkout` also creates a payment for exactly the snapshot total in paise in Razorpay test mode, tied to the Checkout id
**And** if creating the payment fails, compensation releases the Hold and the Shopper is told she has not been charged

**Given** a Checkout with a live Hold
**When** the Shopper continues
**Then** the website opens the payment service's own payment screen, which offers UPI, card and netbanking and no cash on delivery
**And** the website has no field for a card number and stores none

**Given** the payment service's webhook for a captured payment
**When** it arrives at the kernel's built-in payment hook route with a valid signature
**Then** the provider verifies the signature, never reports the payment as pending, and a subscriber starts the `confirm-payment` workflow
**And** a webhook with an invalid signature is refused and changes nothing

**Given** a verified payment whose amount equals the snapshot total and whose Hold is live
**When** `confirm-payment` runs
**Then** inside one lock it releases the Hold's reservations and completes the cart into an Order
**And** afterwards the reserved quantity for each Variant equals the quantity ordered, not double, and available stock is unchanged from before the payment, proving spike item 1
**And** the Order's state is stored as Paid by the `order-state` module, created in this story, and stock-movement rows are written
**And** the Order id is added to the Checkout's recovery file in the `documents` bucket (AD-30)

**Given** the cart-completion route is blocked for clients (Story 1.4)
**When** `confirm-payment` completes the cart on the server
**Then** the Order is created, proving the second half of spike item 2

**Given** the same webhook delivered twice, or two deliveries at the same moment
**When** both are processed
**Then** there is one Order and one charge, because `confirm-payment` is idempotent on the Checkout id

**Given** a verified payment whose amount differs from the snapshot total
**When** `confirm-payment` runs
**Then** no Order is created, the whole captured amount is refunded automatically, the Hold is released and the Checkout is marked as refunded automatically
**And** a second capture for a Checkout that already has an Order is refunded automatically and the Order is unchanged

**Given** the Shopper returns from the payment screen
**When** the website asks for the Checkout's status
**Then** the status comes only from the server, and nothing the client sends can create an Order
**And** once the Order exists she sees a confirmation with her Order number

**Given** the Razorpay adapter
**When** its contract tests run against Razorpay test mode
**Then** creating a payment, verifying a signature and starting a refund all pass, and the tests are part of the checks run before a release

**Requirements:** FR-18, FR-19 (confirmed twice), NFR-4, NFR-11; AD-4, AD-6, AD-7, AD-24, AD-30; spike items 1 and 2
**Notes for the developer:**
- Touches `apps/commerce/src/providers/razorpay` (Razorpay Node SDK 2.9.8), `apps/commerce/src/workflows/confirm-payment`, `apps/commerce/src/subscribers`, `apps/commerce/src/modules/order-state`, `packages/contracts` (the Order state enum and transition table), and the checkout screens in `apps/web`.
- If spike item 1 or 2 fails (the Hold cannot be released and the cart completed in one lock without double-reserving, or the server-side completion stops working once the route is blocked), stop and report with the failing test; the spine names no fallback, and no workaround may leave two sets of reservations or open the route to clients.
- Locally a webhook is a test-mode payload signed with the test secret; the round trip from the payment service itself is exercised on staging in Story 1.24.
- Failed, pending and late payments are Story 1.11; the invoice is Story 1.13.
- The payment screen is the payment service's own, the one direct vendor call AD-2 allows a client.

### Story 1.11: Failed, pending and late payments

As a Shopper,
I want a payment that fails, stalls or arrives late to end either in an Order or in my money back,
So that I never pay for a saree I do not get.

**Acceptance Criteria:**

**Given** a Checkout with a live Hold
**When** the payment fails or the Shopper closes the payment screen without paying
**Then** `release-hold` runs, the cart is as it was before checkout, and she is told she has not been charged

**Given** a Checkout whose payment has not yet been confirmed and whose Hold is live
**When** the Shopper looks at its status
**Then** it is shown as pending, not as an Order and not as failed

**Given** a payment confirmed after its Hold has ended and the Pieces are still free
**When** `confirm-payment` runs
**Then** it reserves the Pieces and creates the Order in state Paid inside the same lock, with stock-movement rows

**Given** a payment confirmed after its Hold has ended and the Pieces are no longer free
**When** `confirm-payment` runs
**Then** no Order is created and a full refund to the payment method used is started automatically within 5 minutes of the webhook
**And** the Checkout's status shows "refunded automatically" with the amount and the time
**And** the event `payment.auto-refunded` is recorded and logged, without personal data, with the Checkout id and the time; no message is sent in this epic

**Given** the last Piece, a late confirmed payment from one Shopper and a `begin-checkout` from another at the same moment
**When** both finish
**Then** exactly one of them has the Piece: either the first has an Order and the second receives `stock.unavailable` before paying, or the second has a Hold and the first is refunded automatically

**Given** an automatic refund that the payment service refuses or does not answer
**When** the workflow finishes
**Then** the Checkout is marked refund pending, the kernel's scheduled job `retry-pending-refunds`, created in this story, retries it, and no second refund is ever created for the same payment

**Given** a failed-payment event delivered twice
**When** both are processed
**Then** the Hold is released once and stock-movement rows are not duplicated

**Requirements:** FR-18 (failed and pending payments), FR-19 (payment after the Hold ended), NFR-4; AD-6, AD-7
**Notes for the developer:**
- Touches `apps/commerce/src/workflows/confirm-payment` and `release-hold`, `apps/commerce/src/jobs` (the new `retry-pending-refunds` job, which only starts a workflow), the Checkout status view model, and the status screen in `apps/web`.
- The spine's Checkout and Hold state diagram is the specification; test every arrow.
- The message to the Shopper for an automatic refund (FR-19 "messaged within 5 minutes", FR-54) is delivered from Epic 3 onward: Story 3.20 subscribes to `payment.auto-refunded`. In this epic the event is recorded and logged and the Shopper sees the refund on the Checkout status screen.
- Test with a controllable clock; do not wait 15 minutes in tests.

### Story 1.12: Daily reconciliation of payments and Orders

As an Owner,
I want payments and Orders compared every day,
So that no payment is left without an Order or a refund, and no Order without a payment.

**Acceptance Criteria:**

**Given** the kernel's scheduled job for reconciliation
**When** it runs after the end of a business day in the business time zone
**Then** it fetches that day's captured payments and refunds from the payment service and compares them with Orders and automatic refunds
**And** it writes one reconciliation record, an entity of the `checkout` module, with the date, the counts and every difference

**Given** a day on which every captured payment has exactly one Order or one full automatic refund, and every Order has a captured payment equal to its snapshot total
**When** the job runs
**Then** the record shows no unexplained difference

**Given** a captured payment with neither an Order nor a refund, because its webhook never arrived
**When** the job runs
**Then** it starts `confirm-payment` for that payment, which creates the Order or refunds it by the rules of Stories 1.10 and 1.11
**And** the record shows the payment as found and resolved

**Given** a captured payment whose Checkout is not in the database, as after a restore
**When** the job runs
**Then** it rebuilds the Checkout from its recovery file in the `documents` bucket and starts `confirm-payment`, so the Order has the items, prices, tax and address of the snapshot, and the Order id already written in the file is used again (AD-30)
**And** a captured payment with no recovery file is listed as an unexplained difference and nothing is created for it

**Given** an Order with no captured payment, or with a payment of a different amount
**When** the job runs
**Then** the record lists it as an unexplained difference and it is logged at error level without personal data

**Given** the job is run twice for the same day
**When** the second run finishes
**Then** no Order, refund or record is duplicated

**Given** the payment service cannot be reached
**When** the job runs
**Then** the run is recorded as failed and retried, and the day is never shown as clean

**Given** the Owner opens the shop's reconciliation page in the Admin
**When** she looks at it
**Then** she sees each day's record and any unexplained difference linked to its Order or payment

**Requirements:** NFR-4; AD-4, AD-7, AD-17 (rebuilding a missing Order), AD-30
**Notes for the developer:**
- Touches `apps/commerce/src/jobs` (reconciliation), the `checkout` module (the reconciliation record), the Razorpay adapter (listing payments and refunds), `apps/commerce/src/admin`.
- Invoices do not exist yet. Story 1.13 adds the invoice number to the recovery file and tests that a rebuilt Order takes that number again; Story 1.25 rehearses it.
- The job only starts workflows; it does not write Orders itself (AD-4).
- The alert to the Owner by message (NFR-9) is Epic 7; here a difference is on the Admin page and in the error log.
- Add a contract test for listing payments against Razorpay test mode (NFR-11).

### Story 1.13: Shopper sees her Order and its tax invoice

As a Shopper,
I want to see my Order, its state and its tax invoice after paying,
So that I know what I bought and what tax I paid.

**Acceptance Criteria:**

**Given** the Order state enum and transition table that Story 1.10 put in `packages/contracts`
**When** an Order is returned to a client
**Then** the `OrderView` view model carries the state from that enum, named as in the Glossary
**And** the server stores and returns the state; no client derives it

**Given** a signed-in Shopper with an Order
**When** she opens her Orders and then one Order
**Then** she sees the Order number, the items, the amount paid and the state as named in the Glossary
**And** another Shopper asking for the same Order gets not found

**Given** `confirm-payment` creates an Order
**When** the `invoice` module, created in this story, issues the invoice in the same workflow
**Then** the invoice is built from the Checkout snapshot and shows, for each item, its tax code, taxable value and tax exact to the paisa, and the state whose tax applies
**And** it shows the seller's legal name, address and tax registration from settings seeded in this story
**And** the lines add up to the amount paid

**Given** invoices issued in one financial year, in the business time zone
**When** their numbers are compared
**Then** they are gapless and have no duplicates: each comes from one counter row for invoices for that year, locked and incremented in the same transaction that creates the invoice record, not from a database sequence (AD-25)
**And** 20 Orders created at the same moment get 20 consecutive numbers
**And** an Order paid at 23:59 on 31 March and one paid at 00:00 on 1 April, business time, are numbered from different years' counter rows
**And** the invoice number is written to the Checkout's recovery file in the `documents` bucket (AD-30)

**Given** a Checkout whose recovery file already holds an invoice number, rebuilt after a restore
**When** its invoice is issued again
**Then** it takes the number in the file, the counter is not incremented for it, and the counter is never below the highest number issued

**Given** an issued invoice
**When** any route or service method tries to change it
**Then** there is none that can; the record is never edited

**Given** a webhook delivered twice
**When** both are processed
**Then** there is one invoice

**Given** the invoice step fails
**When** `confirm-payment` is tested with that failure forced
**Then** the outcome is either a retry that succeeds or an automatic refund, never an Order without an invoice
**And** a failed attempt rolls back the counter increment with the record, so it leaves no gap

**Given** the Order page
**When** it is shown
**Then** the invoice number and its lines appear on it

**Requirements:** FR-20 (first version), FR-21 (first version); AD-5, AD-13, AD-19, AD-24, AD-25, AD-30
**Notes for the developer:**
- The counter is a table row per document type and financial year in the `invoice` module; take a row lock on it inside the transaction that inserts the invoice.
- Touches `apps/commerce/src/modules/invoice`, `apps/commerce/src/api/store/shop/orders`, `packages/contracts` and `packages/api-client` (`OrderView`), and the Order pages in `apps/web`.
- The financial year runs from 1 April to 31 March in the business time zone; hold the start month as a setting.
- Two invoice lines for a saree with a stitched blouse (FR-20) depend on FR-37 and are Epic 2. The invoice file is Story 1.14. The confirmation message (FR-54) is Epic 3.
- Only the transition into Paid exists so far; later stories add one workflow per transition.

### Story 1.14: Invoice file rendered by the shop worker

As a Shopper,
I want to download my tax invoice as a file,
So that I have a record of my purchase.

**Acceptance Criteria:**

**Given** `apps/worker` is created and added to the compose file
**When** it starts
**Then** it consumes one BullMQ queue with the prefix `shop`, at BullMQ 6.7.6, exposes a health route, and has no connection to the `commerce` database
**And** the kernel's own queues are not used for shop jobs

**Given** an invoice has been issued
**When** the workflow enqueues `invoice.render`
**Then** the job's name and payload are defined in `packages/contracts` and its id is derived from the invoice id
**And** only a commerce workflow enqueues it and only the worker consumes it

**Given** the worker takes an `invoice.render` job
**When** it runs
**Then** it reads the invoice from `/internal/*` on commerce with a service token, renders the file with PDFKit, stores it in the private, versioned `documents` bucket created in Story 1.9, and reports the file to commerce through `/internal/*`
**And** that internal route starts a workflow that records the file against the invoice

**Given** the same job runs twice
**When** both runs finish
**Then** the invoice has one file and its content is the same

**Given** the worker is stopped when an Order is paid
**When** the Shopper opens her Order
**Then** the Order and invoice details are there and the file is shown as being prepared
**And** when the worker starts again the file appears without anyone acting

**Given** the Shopper asks to download her invoice
**When** commerce answers
**Then** it gives a short-lived signed link to the file, and another Shopper cannot get a link to it

**Given** a request to `/internal/*`
**When** it comes from outside the private network through Caddy, or without a service token, or with a Shopper's or an admin's token
**Then** it is refused

**Given** the worker's logs and job results
**When** they are inspected
**Then** they contain no name, address, mobile number, link or token

**Requirements:** FR-20 (invoice file); AD-1, AD-8, AD-9, AD-15, AD-16, AD-22, AD-25
**Notes for the developer:**
- Touches `apps/worker` (new), `apps/commerce/src/api/internal`, `infra/` (compose service, Caddy rule), and one link on the Order page in `apps/web`.
- The invoice file is a PDF rendered with PDFKit (`pdfkit` 0.21.0, spine Stack); check that it builds on ARM64 and x86-64.
- Sending the invoice by message (FR-54) is Epic 3.
- Other worker jobs (`message.send`, `tiles.build`, `tryon.generate`) are created by the epics that need them.

### Story 1.15: Owner finds an Order, packs it and creates its shipping label

As an Owner,
I want to find an Order, mark it Packed and create its shipping label,
So that the parcel is ready to hand over and I never retype an address.

**Acceptance Criteria:**

**Given** the Owner opens the shop's Orders page in the Admin
**When** she filters by state or searches by Order number or mobile number
**Then** she sees the matching Orders and can open one to see its items, address and state

**Given** an Order in state Paid
**When** the Owner marks it Packed and then creates a shipping label
**Then** the Order moves to Packed through that transition's workflow, and the shipping adapter creates a shipment in the shipping service's test mode from the Order's address, with nothing retyped
**And** the label file and tracking number are stored against the Order and the Owner can print the label

**Given** label creation fails at the shipping service
**When** the Owner sees the error and tries again
**Then** the Order is still Packed and at most one shipment exists for the Order

**Given** an Order that is not in state Paid
**When** the Owner tries to mark it Packed
**Then** the request is refused by the transition table of Story 1.10 and the state does not change

**Given** the shipping adapter
**When** its contract test for creating a shipment runs against the shipping service's test mode
**Then** it passes, and the test is part of the checks run before a release

**Requirements:** FR-47 (first version), NFR-11; AD-4, AD-14, AD-24; Consistency Conventions (Vendors)
**Notes for the developer:**
- Touches `apps/commerce/src/providers/shipping` (the port and one adapter), the Paid→Packed transition workflow, `apps/commerce/src/admin` (Orders page).
- The shipping service is undecided in the PRD (Open Question 2: the founder's existing provider first). Write the port first, with workflow tests against recorded test-mode responses. If the founder has not named the service or given test-mode credentials when this story starts, stop and report.
- The label file goes in the `documents` bucket.
- Dispatch and the stock change are Story 1.16; tracking events are Story 1.17.
- Admin page is behaviour only; styled from DESIGN.md when it exists.

### Story 1.16: Owner dispatches an Order and its Pieces leave stock

As an Owner,
I want to mark a packed and labelled Order as Dispatched,
So that the saree is on its way and my stock count shows it has left the shop.

**Acceptance Criteria:**

**Given** an Order that is Packed and has a tracking number
**When** the Owner marks it Dispatched
**Then** the `fulfil-order` workflow, under the lock, reduces the stocked quantity, removes the Order's reservation, writes stock-movement rows with the cause "sale", and sets the state to Dispatched
**And** an Order without a tracking number cannot be marked Dispatched

**Given** the Owner presses Dispatched twice, or the request is sent twice
**When** both are processed
**Then** the stocked quantity is reduced once and the stock-movement rows are not duplicated

**Given** the stock-movement row cannot be written
**When** `fulfil-order` runs
**Then** its compensation restores the stocked and reserved quantities and the Order stays Packed

**Given** an Order that has been Dispatched
**When** the Shopper opens her Order page
**Then** she sees the state Dispatched and the tracking number

**Requirements:** FR-21 (first version), FR-47 (first version), FR-36; AD-4, AD-6, AD-14, AD-24
**Notes for the developer:**
- Touches `apps/commerce/src/workflows/fulfil-order`, the Orders page in `apps/commerce/src/admin`, and the Order page in `apps/web`.
- `fulfil-order` is one of the stock workflows AD-6 names; reuse the lock helper and row shape of Story 1.7 and test success, each failure and compensation.
- Tracking events after dispatch are Story 1.17. Cancelling before dispatch (FR-22) is Epic 3.

### Story 1.17: Tracking events from the shipping service move the Order

As a Shopper,
I want my Order's state to follow the parcel as the shipping service reports it,
So that I can see where my saree is without asking anyone.

**Acceptance Criteria:**

**Given** a tracking event from the shipping service
**When** it arrives at `/webhooks/shipping` and passes the adapter's verification
**Then** the one mapping table in the shipping adapter turns it into a transition to Out for delivery, Delivered, Delivery failed or Returned to shop, performed by that transition's workflow
**And** the Shopper's Order page shows the new state and the tracking number without the Owner acting

**Given** the same event delivered twice, an event the transition table does not allow from the current state, or an event type the mapping table does not know
**When** it is processed
**Then** the state does not change and the event is recorded

**Given** an event that fails verification
**When** it arrives
**Then** it is refused and nothing changes

**Given** an Order becomes Delivered
**When** the transition is recorded
**Then** the delivery time is stored, in UTC

**Given** an Order in Delivery failed
**When** the Shopper opens it
**Then** she is told what happens next, and when the shipping service reports it back at the shop the Order moves to Returned to shop

**Given** the shipping adapter
**When** its contract test for reading an event runs against the shipping service's test mode
**Then** it passes, and the test is part of the checks run before a release

**Requirements:** FR-21 (first version), NFR-11; AD-4, AD-24; Consistency Conventions (Vendors)
**Notes for the developer:**
- Touches `apps/commerce/src/providers/shipping` (event verification and the mapping table), the four transition workflows, `apps/commerce/src/api/webhooks`, and the Order page in `apps/web`.
- The mapping table lives in the shipping adapter and nowhere else (AD-24).
- The inspection of an Order in Returned to shop is Story 1.19 and its full refund is Story 1.21.

### Story 1.18: Shopper requests a Return and books a pickup

As a Shopper,
I want to ask to return a delivered saree, say why and book a pickup,
So that I can send back a saree that disappointed me.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is finished
**Then** it holds the Return states Requested, Pickup booked, Picked up, Received, Accepted, Rejected and Refunded as an enum with a table of allowed transitions, and one workflow performs each transition; the two the Shopper starts are named `request-return` and `book-return-pickup`, and Story 3.15 extends them

**Given** an Order in state Delivered, within the return period of 7 days from delivery, the period coming from a setting seeded in this story
**When** the Shopper requests a Return for an item and picks the reason "Not as shown" or "Defective or wrong item"
**Then** a Return is created in state Requested
**And** she is shown that return shipping for these reasons is free

**Given** a Return in state Requested
**When** the Shopper books a pickup
**Then** the shipping adapter books a return pickup in the shipping service's test mode from the Order's address, and the Return moves to Pickup booked
**And** if the booking fails the Return stays Requested and she can try again without a second pickup being booked

**Given** an Order delivered 8 days ago, counted in days of the business time zone
**When** the Shopper requests a Return
**Then** it is refused with the code `return.period_ended`

**Given** an Order that is not Delivered, or an item that already has a Return
**When** the Shopper requests a Return
**Then** it is refused with a stable error code

**Given** a pickup event from the shipping service
**When** it arrives at `/webhooks/shipping`
**Then** the adapter's mapping table moves the Return to Picked up
**And** a repeated event changes nothing

**Given** the returned saree arrives at the shop
**When** the Owner marks the Return Received on the Orders page
**Then** the Return moves to Received and available stock does not change

**Given** a Return in any state
**When** the Shopper opens her Order, or the Owner opens it in the Admin
**Then** each sees the Return's state as named in the Glossary

**Requirements:** FR-23 (first version), FR-47 (Returns); AD-13, AD-19, AD-24
**Notes for the developer:**
- Touches `apps/commerce/src/modules/order-state` (the Return record and state), the Return transition workflows, the shipping adapter (return pickup), `apps/commerce/src/api/store/shop/orders`, the Order page in `apps/web` and the Orders page in `apps/commerce/src/admin`.
- Only the two always-accepted reasons are offered in this epic; other reasons, the conditions for worn items and showing the return period on the Design page and at checkout are Epic 3.
- Inspection and restock are Story 1.19; the refund is Stories 1.20 and 1.21.
- Screens are behaviour only; styled from DESIGN.md when it exists.

### Story 1.19: Owner inspects a returned saree and restocks a sound Piece

As an Owner,
I want to record what I found when a returned saree arrives and put a sound Piece back in stock,
So that stock stays true and nothing is sold again before I have looked at it.

**Acceptance Criteria:**

**Given** a Return in state Received
**When** the Owner records the inspection as accepted and sellable, accepted and damaged, or rejected with a reason
**Then** the Return moves to Accepted or Rejected and the inspection result, the Owner's email and the time are stored
**And** a rejected Return shows the Shopper the reason

**Given** an inspection result of sellable or damaged for a Piece
**When** the `restock-return` workflow runs with that result
**Then** for a sellable Piece it raises the stocked quantity by one under the lock and writes a stock-movement row with the cause "Return"
**And** for a damaged Piece it leaves the stocked quantity unchanged and writes a stock-movement row with the cause "Return, damaged", so the Piece is not returned to stock and the count can still be explained (AD-6)
**And** no Piece is sellable again before the Owner has recorded an inspection

**Given** the same inspection is recorded twice, or `restock-return` is retried
**When** both runs finish
**Then** the stocked quantity has changed once and there is one stock-movement row

**Given** the stock-movement row cannot be written
**When** `restock-return` runs
**Then** its compensation restores the earlier stocked quantity

**Given** an Order in state Returned to shop
**When** the Owner records the inspection of its Pieces
**Then** `restock-return` runs with each result in the same way, so sound Pieces are restocked only after inspection and damaged ones are not

**Requirements:** FR-25, FR-47 (inspection result), FR-36; AD-4, AD-6, AD-14
**Notes for the developer:**
- Touches `restock-return` in `apps/commerce/src/workflows`, the Return transition workflows for Accepted and Rejected, and the Orders page in `apps/commerce/src/admin`.
- `restock-return` is the only workflow that writes a stock-movement row for a returned or undelivered Piece, sellable or damaged (AD-6); it takes the inspection result as input.
- The refund for an Accepted Return is Story 1.20; the refund for an Order in Returned to shop is Story 1.21. Until those stories, an Accepted Return simply waits.
- Inspection photos (files in the `documents` bucket linked to the Return) and sending a rejected item back are Epic 3 (FR-47, FR-23; AD-31).

### Story 1.20: An accepted Return is refunded to the payment method used, with a credit note

As a Shopper,
I want my money returned to the payment method I used once my Return is accepted,
So that I am not out of pocket for a saree I sent back.

**Acceptance Criteria:**

**Given** a Return becomes Accepted
**When** the refund workflow `refund-order` runs
**Then** it starts a refund through the payment service to the payment method the Shopper used, for the amount she paid for that item including tax, with an idempotency key derived from the Return id
**And** the `invoice` module issues a credit note linked to the original invoice, reversing the item's taxable value and tax to the paisa, with a gapless number from the credit-note counter row for that financial year, locked and incremented in the same transaction (AD-25)
**And** once the payment service accepts the refund the Return moves to Refunded, and the Shopper sees the refund amount and when it was started
**And** the Order moves to Refunded only when the total refunded for the Order equals the total paid; any smaller total is recorded against the Return and the Order keeps its state (AD-31)

**Given** the Owner presses refund twice, or the workflow is retried
**When** both runs finish
**Then** there is one refund and one credit note

**Given** the payment service refuses or does not answer the refund
**When** the workflow ends
**Then** the Return stays Accepted, and the Admin shows the date by which the refund must start, 2 working days after acceptance, and marks it overdue after that date; working days are Monday to Saturday in the business time zone, excluding the holidays listed in settings
**And** a later retry does not create a second refund

**Given** the kernel's own refund and payment routes
**When** they are called directly
**Then** they are refused under Story 1.4

**Given** a credit note
**When** it is issued
**Then** the worker renders its file through `invoice.render` into the `documents` bucket, and the Shopper can download it from her Order

**Requirements:** FR-24, FR-48 (first version), NFR-4; AD-4, AD-7, AD-21, AD-25, AD-31; Consistency Conventions (Working days)
**Notes for the developer:**
- Touches the refund workflow `refund-order` in `apps/commerce/src/workflows`, the `invoice` module (credit note and its counter row), `apps/commerce/src/admin`, the Order page in `apps/web`; the worker change is limited to accepting the credit-note document type.
- Seed two settings here: working days (Monday to Saturday) and the list of holidays (empty). The Admin page to edit them is Story 3.7.
- "Refunded" for an Order is decided by amounts, not by items: the sum of the Order's refunds equals the amount paid (AD-31). Put that test in one function that every refund path calls.
- Add the refund to the Razorpay contract tests if Story 1.10's test does not already cover a refund of part of a payment.

### Story 1.21: Owner refunds part of an Order, and an undelivered Order in full

As an Owner,
I want to refund any amount up to what a Shopper paid, and the whole amount when her parcel came back undelivered,
So that I can put things right whatever went wrong.

**Acceptance Criteria:**

**Given** an Order in state Returned to shop
**When** the Owner records its inspection (Story 1.19)
**Then** the same `refund-order` workflow refunds the whole amount paid, including any shipping charge, with a credit note, and the Order moves to Refunded because the total refunded equals the total paid

**Given** any Order
**When** the Owner refunds part of it from the Orders page
**Then** the amount can be anything up to what was paid less what was already refunded, a reason is required, a credit note is issued, and a larger amount is refused with the code `refund.exceeds_paid`
**And** the refund is recorded against the Order and the Order keeps its state while the total refunded is below the total paid (AD-31)

**Given** an Order paid Rs 2,100 with one earlier part refund of Rs 1,000
**When** the Owner refunds a further Rs 1,100
**Then** the total refunded equals the total paid and the Order moves to Refunded (AD-31)
**And** no further refund can be made for it

**Given** the Owner submits the same part refund twice, or the workflow is retried
**When** both runs finish
**Then** there is one refund and one credit note

**Given** the payment service refuses a part refund
**When** the workflow ends
**Then** no credit note is issued, the amount that can still be refunded is unchanged, and the Owner sees that the refund did not start

**Requirements:** FR-48 (first version), FR-24, FR-21 (an undeliverable Order is refunded in full), NFR-4; AD-4, AD-7, AD-14, AD-25, AD-31
**Notes for the developer:**
- Touches `refund-order` in `apps/commerce/src/workflows` and the Orders page in `apps/commerce/src/admin`.
- Reuses the refund-to-source step, the credit note and the "total refunded equals total paid" function of Story 1.20; do not write a second refund path.
- Payment disputes (records of the `checkout` module) are Epic 3 (FR-48; AD-31).
- Story 3.12 later starts the refund for an Order in Returned to shop from the shipping event itself; the inspection recorded in Story 1.19 then governs only restocking.

### Story 1.22: Admin sign-in with an enforced second factor, and an audit trail

As an Owner,
I want the Admin to require my password and a second factor and to record every change I make,
So that nobody else can run my shop and every change can be traced.

**Acceptance Criteria:**

**Given** the Owner's admin account
**When** she signs in
**Then** she must give her password and a code from the kernel's built-in second factor

**Given** an admin account that has not enrolled a second factor
**When** it sends any admin request other than those needed to enrol
**Then** a middleware refuses it with the code `admin.second_factor_required`
**And** this applies to kernel admin routes and to `/admin/shop/*` alike

**Given** five wrong attempts on one account, by password or by code
**When** a sixth attempt is made within 15 minutes, even with the right password and code
**Then** it is refused and the account stays locked until 15 minutes have passed
**And** the lock is recorded

**Given** a lost second factor
**When** the documented recovery process in `docs/` is followed
**Then** the Owner regains access, and the process has been rehearsed once on the local stack with the date written into the document

**Given** the `shop-audit` module is created
**When** any state-changing admin request succeeds
**Then** one audit event is recorded with the actor's email, the time, the action, and the before and after values
**And** a test shows an event for each admin action built so far: creating and publishing a Design, adjusting stock, marking Packed and Dispatched, creating a label, marking Received, recording an inspection and refunding

**Given** audit events
**When** any route is searched for one that updates or deletes them
**Then** there is none

**Given** the Owner opens an Order, which shows a Shopper's name, address and mobile number
**When** the page loads
**Then** an access event is recorded with her email, the time and what was read, and not the data itself

**Given** the kernel's configuration
**When** it is inspected
**Then** none of the kernel's paid features for roles, single sign-on or audit is enabled

**Requirements:** FR-60, FR-36 (who made each change); AD-14, AD-15
**Notes for the developer:**
- Touches `apps/commerce/src/api/middlewares`, `apps/commerce/src/modules/shop-audit`, `docs/` (recovery process).
- The secrets that encrypt second factors are environment variables; list them in the secrets document that the restore script will use (Story 1.25).
- Deleting access events after one year (NFR-5) and the Owner's view of the audit trail are Epic 3 and Epic 4.
- The content admin is Story 1.23.

### Story 1.23: Content application behind the access gate

As an Owner,
I want the content admin running beside the shop and locked behind an extra gate,
So that the place where notices and screens will be edited is safe from its first day.

**Acceptance Criteria:**

**Given** `apps/content` is created as a Payload 3.94.2 application and added to the compose file
**When** the stack starts
**Then** content runs on Node.js 24 beside commerce and the worker, uses a database named `content` on the same Postgres server, migrates only that database, and exposes a health route
**And** content's database account has no rights on the `commerce` database, and a test proves a query to it fails

**Given** the Owner's content admin account, keyed by the same email as her commerce admin account
**When** she signs in to the content admin
**Then** she reaches it only through Caddy
**And** five wrong attempts lock the account for 15 minutes

**Given** spike item 7
**When** the developer tries to enforce a second factor on the content admin using only what Payload provides at the pinned version
**Then** if it can be enforced, an account without an enrolled second factor is refused, as in Story 1.22
**And** if it cannot, the content admin stays reachable only through an extra access gate at Caddy that asks for a separate credential before any content admin page is served, which is the fallback AD-15 names
**And** the outcome is recorded in `docs/`

**Given** the gate is in place
**When** a request for a content admin page arrives without the gate's credential
**Then** Caddy refuses it before it reaches content

**Given** a change made in the content admin, such as creating an admin account
**When** it succeeds
**Then** content records an audit event with the same shape as commerce's, in its own append-only collection, with the admin's email as the actor

**Given** the website
**When** its network requests are inspected
**Then** none goes to content; clients never call content directly

**Given** content
**When** its configuration is inspected
**Then** it has no scheduler

**Requirements:** AD-1, AD-3, AD-12 (no scheduler), AD-14, AD-15, AD-16; spike item 7 and the local part of spike item 3
**Notes for the developer:**
- Touches `apps/content` (new), `infra/` (compose service, Caddy gate, the `content` database).
- Create no content collections other than admin accounts and audit events; notices, policies and message templates are created by Epic 3 and screens by Epic 5. Story 3.1 extends this application (service calls to and from commerce, audit on every document collection); it does not create it again.
- Do not add a dependency the spine does not name to obtain a second factor; if Payload alone cannot do it, take the gate.
- If Payload does not run beside the kernel on Node.js 24, stop and report.

### Story 1.24: Deploy the slice to the staging server

As a builder,
I want the slice deployed to the staging server from continuous integration,
So that it is proven on the real ARM server with the vendors' test modes.

**Acceptance Criteria:**

**Given** a commit on the main branch whose checks all pass
**When** continuous integration runs
**Then** it builds ARM64 and x86-64 images for commerce, web, worker and content
**And** a commit with a failing check is not built for deployment

**Given** built images
**When** the deploy runs against the Oracle Cloud free ARM server
**Then** it runs each application's migrations on its own database before starting new containers, and then replaces the containers
**And** the server runs the same `infra/compose.yaml` as the local stack, with configuration only from environment variables

**Given** the deployed stack
**When** the health routes are checked
**Then** Caddy, commerce, web, worker, content, PostgreSQL 17 and Redis 8 are all healthy on Node.js 24 on ARM64, proving spike item 3
**And** if any unit cannot run there, stop and report which one and why

**Given** a migration fails, or a required environment variable is missing
**When** the deploy runs
**Then** the new containers are not started, the deploy is reported as failed and the earlier containers keep serving

**Given** staging
**When** its storage and network are inspected
**Then** files are in an object store reached through the S3 interface outside the server, not in the local AWS emulator
**And** Postgres and Redis are not reachable from the internet, `/internal/*` is refused at Caddy, and Caddy serves the site over TLS on a domain that comes from configuration and does not contain the product name

**Given** staging with the payment service and the shipping service in test mode
**When** a purchase is made by hand through the payment service's test payment screen
**Then** the payment service's own webhook reaches staging and the Order appears in state Paid with its invoice
**And** a test-mode tracking event from the shipping service moves the Order

**Given** the repository
**When** it is searched
**Then** it contains no secret, and `docs/` lists every secret the deployment needs by name

**Requirements:** NFR-11; AD-16; Consistency Conventions (Migrations, Config and secrets, Testing); spike item 3
**Notes for the developer:**
- Touches `infra/` (compose, Caddy, deploy script), continuous-integration configuration, and container files for the four applications.
- Staging runs vendor test modes only; no live keys.
- Backup and restore are Story 1.25; the size gate is Story 1.26.
- Record the server's CPU and memory allowance as found; the spine reports 2 CPUs and 12 GB for the whole account.

### Story 1.25: Continuous database backup and one rehearsed restore

As an Owner,
I want the database backed up continuously to another location and a restore rehearsed once,
So that losing the server does not lose paid Orders, invoices or the catalogue.

**Acceptance Criteria:**

**Given** staging
**When** pgBackRest is configured
**Then** Postgres ships its write-ahead log continuously and takes a full backup every night, for both the `commerce` and `content` databases, to object storage in a different location from the server
**And** the result of each nightly backup is recorded, and a failed one is logged at error level

**Given** an Order paid on staging
**When** 15 minutes have passed
**Then** the write-ahead log that contains it is in the backup location, shown by restoring to that time and finding the Order

**Given** a clean server, or the staging server after its volumes are destroyed
**When** the restore script in `infra/` is run by following its document alone
**Then** it rebuilds the whole system and the time taken is measured against the 4-hour target
**And** the document names every secret needed, including those that encrypt second factors

**Given** the restored system
**When** it is checked
**Then** the Owner signs in with her password and second factor, the Design, its stock-movement rows, the Order and its invoice are present, the invoice file downloads, and the next invoice issued takes the next number with no gap and no duplicate

**Given** a restore to a time just before an Order was paid, so that the Order is missing
**When** the restore script runs its last step, before the shop accepts Orders again
**Then** the reconciliation job of Story 1.12 rebuilds the Order from the payment service's records and the Checkout's recovery file in the `documents` bucket, with its original Order id and invoice number (AD-30)
**And** each invoice and credit-note counter is set to the highest number issued, read from the recovery files and the `documents` bucket, so the next number neither repeats nor skips one
**And** the invoice file already in the `documents` bucket under that number is kept, not rendered again or overwritten

**Given** the rehearsal is finished
**When** its record in `docs/` is read
**Then** it states the date, the time taken, the amount of data lost in minutes, and each step that failed or needed a manual fix
**And** it states that on the free hosting tier the 15-minute and 4-hour figures are targets under test, not promises

**Requirements:** NFR-8 (first version), NFR-4; AD-16, AD-17, AD-25, AD-30
**Notes for the developer:**
- Touches `infra/` (pgBackRest configuration, restore script), a counter-reset workflow in `apps/commerce`, and `docs/` (restore runbook, rehearsal record).
- The restore is not a routine task under NFR-10; it follows the written runbook in `docs/` and may use a command line.
- Backing up stored files (product photos, invoices, recovery files) to a second location, the quarterly rehearsal and alerts on a failed backup are Epic 7; here the files survive because object storage is outside the server.
- The backup location and its credentials are environment variables; no cloud vendor's SDK is added.
- If the free server cannot hold a second copy of the system for the rehearsal, restore onto the same server after destroying its volumes.

### Story 1.26: The size gate

As an Owner,
I want to know whether the free server can carry the shop at launch,
So that I choose production hosting on evidence before real payments run.

**Acceptance Criteria:**

**Given** staging with every container running
**When** the k6 load script in `infra/` is run
**Then** it simulates the launch load of the spine's test profile against the shop routes that `packages/api-client` calls: 100 published Designs with 10 Pieces each, 50 Shoppers browsing at once, and 5 Checkouts a minute each confirmed by a signed test-mode webhook, for 30 minutes, with a nightly backup running during the test `[ASSUMPTION: the 30-minute length and the backup running; the load figures are the spine's]`
**And** the 100 Designs are created by a seed script written in this story, which publishes each through `publish-design` and sets its stock through `adjust-stock`, and can be run again without creating duplicates
**And** the profile's third part, 2 Try-on jobs at once, cannot run before Try-on exists; Story 7.11 runs the whole profile and confirms or revises this decision
**And** the profile is a small number of named constants so the founder can change it and run the script again

**Given** the run
**When** it ends
**Then** the script reports, per container, peak memory and CPU, restarts, and for commerce the 95th-percentile time of the Design read and of `begin-checkout`
**And** it reports the count of failed Checkouts, of Orders without an invoice file and of Variants with more Pieces sold than stocked

**Given** the report
**When** the gate is judged
**Then** it holds only if no container restarted or was stopped for lack of memory, total peak memory stayed within the server's allowance, no Checkout failed for a reason other than stock, no Variant was oversold, and every Order has its invoice file `[ASSUMPTION: these pass conditions; the spine says only "if it holds"]`

**Given** the gate holds
**When** the decision is recorded in `docs/`
**Then** it says production takes the free server at launch and staging runs on demand, and staging can be stopped and started by one documented command each

**Given** the gate does not hold
**When** the decision is recorded in `docs/`
**Then** it says production starts on a paid server, names the container that failed and the measurement, and confirms that the same compose file and the x86-64 or ARM64 images run there without redesign

**Given** either outcome
**When** the reconciliation job runs for the test day
**Then** it shows no unexplained difference

**Requirements:** NFR-8 (portable to a paid server); AD-16, AD-17; Deployment "Size gate"; spike item 4
**Notes for the developer:**
- Touches `infra/` (load script), a seed script in `apps/commerce` for the 100 Designs, and `docs/` (the decision); no other application code should change. Story 2.15 extends the same seed script with Weavers and the filterable attributes.
- The launch load is the spine's (Consistency Conventions, "Test profiles") and is held as settings; the pass conditions above are an assumption for the founder to confirm. Record both with the result.
- The load tool is k6 (spine Stack). The script calls the shop's HTTP routes directly; keep its paths in step with `packages/api-client`.
- Keep the script: Story 7.11 runs it again with the Try-on part and the full catalogue.

### Story 1.27: One end-to-end test buys, ships and returns a saree

As a builder,
I want one automated test that lists, buys, ships and returns a saree,
So that every later change is checked against the whole slice before it is deployed.

**Acceptance Criteria:**

**Given** the local stack started from the compose file
**When** the end-to-end test runs
**Then** it signs the Owner in with password and second factor, creates and publishes a Design, and sets its stock to 1 Piece
**And** it signs a Shopper up, adds the Design to her cart and begins checkout, and asserts a Hold that ends 15 minutes later

**Given** the Hold in the test
**When** a second Shopper tries to begin checkout for the same Design
**Then** the test asserts she receives `stock.unavailable` and the Design shows as unavailable for now

**Given** the Checkout in the test
**When** a signed test-mode payment webhook is posted to the kernel's payment hook route, twice
**Then** the test asserts one Order in state Paid, one invoice with tax lines that add up to the amount paid, and an invoice file that downloads

**Given** the Order in the test
**When** the Owner marks it Packed, creates the label and marks it Dispatched, and signed tracking events are posted
**Then** the test asserts the states Packed, Dispatched, Out for delivery and Delivered in turn, and that stocked Pieces are 0

**Given** the Delivered Order
**When** the Shopper requests a Return for "Not as shown", books a pickup, the pickup event is posted, and the Owner marks it Received and records it as accepted and sellable
**Then** the test asserts the Return states Requested, Pickup booked, Picked up, Received, Accepted and Refunded in turn, one refund for the amount paid, and one credit note linked to the invoice
**And** stocked Pieces are 1 again and the Design shows as available

**Given** the test has finished
**When** it checks the records
**Then** the Variant's stock-movement rows explain every change from 1 to 0 to 1, an audit event exists for each Owner action, and the reconciliation job for the day shows no unexplained difference

**Given** the test is run twice in a row
**When** the second run finishes
**Then** it passes without any manual clean-up

**Given** continuous integration
**When** the end-to-end test or any workflow test fails
**Then** the deploy of Story 1.24 does not run

**Given** staging after a deploy
**When** the same test is run against it with the payment service and the shipping service in their real test modes
**Then** it passes, with the pay step driven through the payment service's test payment screen where that can be automated
**And** if that one step cannot be automated, it is done by hand from a written release checklist and the limit is reported

**Requirements:** NFR-11, NFR-4; Consistency Conventions (Testing); FR-18, FR-19, FR-20, FR-21, FR-23, FR-24, FR-25, FR-34, FR-36, FR-47, FR-48, FR-60 as verified end to end
**Notes for the developer:**
- Touches a test package at the repository root or under `apps/web`, and continuous-integration configuration; it should change no application code.
- In continuous integration the payment service and the shipping service are replaced at the HTTP edge by recorded test-mode responses; the adapters themselves are unchanged and still run.
- The test runner is Playwright (`@playwright/test` 1.65.1, spine Stack); drive the Shopper's and the Owner's steps through the website and the Admin in a browser.
- Use a controllable clock for the Hold; do not wait 15 minutes.
- This test blocks every deploy, so any later story that changes sign-in, checkout, or the Order and Return states updates the test in that same story and leaves it passing; those stories say so in their acceptance criteria.

### Story 1.28: Android proof on a real phone: screen, viewer and blurred bar

As a builder,
I want a minimal Android app run on a real mid-range phone that renders a sample screen, the saree viewer and a blurred navigation bar,
So that the choice of React Native, the web-view viewer and the design system's translucent bar are settled before any breadth is built on them.

**Acceptance Criteria:**

**Given** the repository after Story 1.27
**When** `apps/mobile` is created as a minimal Expo 58.1.0 application with expo-router
**Then** a build installs and starts on a real Android phone with 4 GB of memory, the phone of the spine's test profile, whose model and Android version are written in `docs/`
**And** its application id is the neutral one required by AD-20, with no product name in the id, the URL scheme or any package name, and the name check from Story 1.1 passes for `apps/mobile`
**And** `apps/mobile` imports `packages/contracts` and `packages/blocks` and nothing from the kernel's SDK, and the lint rule of Story 1.2 runs on it

**Given** `packages/blocks` is created with the properties of the sample Block types (banner, text and row of Designs), with no UI code
**When** a sample `ScreenV1` document, defined by a first `ScreenV1` schema in `packages/contracts` and bundled with the app, is opened
**Then** the app renders each Block in order with one native component per type, the row of Designs from sample `DesignCard` data embedded in the document, using the `DesignCard` schema that Story 1.8 created
**And** a Block of a type the app does not know, placed in the sample, is skipped and the rest is shown, settling spike item 5

**Given** a sample Deep Zoom tile set cut once with sharp from a full-length saree image at least 8,000 pixels long and served from the public `catalog` bucket on staging, under a `spike/` prefix
**When** the app opens a native screen holding a `react-native-webview` 14.0.1 web view with a page that shows the tile set in OpenSeadragon 6.1.1
**Then** one finger pans and two fingers pinch to zoom the saree, to both ends and to full detail, and the native screen does not scroll, go back or zoom the whole page instead
**And** the frame rate while panning and pinching is measured on the phone and recorded, settling spike item 6

**Given** a screen with a long list of full-width images
**When** it is scrolled quickly under a blurred, translucent navigation bar
**Then** the frame rate is measured on the phone over at least three 10-second scrolls and recorded with the method used, settling spike item 8

**Given** the three measurements
**When** the outcome is judged
**Then** the proof passes if the sample screen renders correctly, the viewer pans and pinches as described, and both frame-rate measurements hold a median of at least 50 frames a second with no stretch of one second below 30 `[ASSUMPTION: these figures; the spine says only "a smooth frame rate"]`
**And** on a pass, `docs/` records that React Native, the web-view viewer and the blurred bar are confirmed, with the figures, for the design system and for Epics 5 and 6 to build on

**Given** any of the three fails
**When** the outcome is recorded
**Then** work stops and the failure is reported to the founder with the measurements, because it reopens the choice of React Native; no workaround, native tile viewer or other framework is started without the founder's decision

**Requirements:** NFR-12; AD-12, AD-18, AD-19, AD-20; Consistency Conventions (Test profiles); spike items 5, 6 and 8
**Notes for the developer:**
- Touches `apps/mobile` (new), `packages/blocks` (new), `packages/contracts` (a first `ScreenV1` schema and the sample), and `docs/` (the record).
- This is a proof, not the app: no sign-in, no network data beyond the tiles, no styling from DESIGN.md. Story 6.1 builds the app shell on this application; Story 5.1 completes `ScreenV1` and `packages/blocks`; Story 2.10 builds the real viewer page and deletes the objects under `spike/`.
- Use only the Expo SDK's own modules and the versions in the spine's Stack; the blur comes from the Expo SDK's blur module.
- Measure on the phone itself, in a release build, not on an emulator.

## Epic 2: Shoppers find a saree and trust what they see

A Shopper browses, filters and searches about 100 Designs on the website without logging in, reads who wove each one, sees honest whole-rupee prices, and inspects the whole saree in the Full saree view. The Owner lists Designs with full attributes, Weavers, Variants, tax data, evidence-backed claims and discounts, and can list a Design in under 15 minutes. Everything here is built for the website; the Android app shows the same things in Epic 6.

**FRs covered:** FR-1, FR-2, FR-3 (complete), FR-4, FR-5, FR-6, FR-7, FR-20 (two invoice lines for a stitched blouse), FR-34 (complete), FR-35, FR-37, FR-38, FR-57, FR-58
**NFRs:** NFR-1, NFR-14

**Conventions for every story in this epic**

- Shopper-facing screens are described by behaviour only; they are styled from DESIGN.md when it exists.
- No Shopper-facing text is written in code (spine, Consistency Conventions). Interface text goes in the website's translation files, which are the built-in copy AD-28 requires of each client; the translation bundles that content holds and commerce serves, so that wording changes need no release, are built in Story 3.4. Translated Design and Weaver text is stored with the Design and Weaver in commerce and arrives in view models through `packages/api-client` (AD-28). Nothing in this epic reads translations from the content application, whose documents and message templates arrive in Epic 3.
- Every state-changing Admin request writes a `shop-audit` event with actor, time, action, before and after (AD-14), and every state change runs as a named workflow (AD-4). Stories do not repeat this in each criterion.
- Items tagged `[ASSUMPTION]` are choices made while writing the stories where the PRD and spine are still silent; each says what is assumed.

---

### Story 2.1: The Owner creates and edits Weavers

As an Owner,
I want to create and edit a Weaver with a name, place, story and photos,
So that every Design can say who wove it.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin with a second factor
**When** she opens the Weavers page and saves a new Weaver with a name, a place, a story and one or more photos
**Then** the Weaver is stored by the `weaver` module and appears in the Weavers list
**And** the photos are stored in the `catalog` bucket and referenced by the Weaver record

**Given** the Owner is creating or editing a Weaver
**When** she saves without a name or without a place
**Then** the save is refused with the error code `weaver.invalid` and the missing field is named
**And** nothing is stored

**Given** an existing Weaver
**When** the Owner changes its name, place, story or photos and saves
**Then** the new values are stored and a `shop-audit` event records the before and after values

**Given** a Weaver that is linked to one or more Designs
**When** the Owner tries to delete it
**Then** the deletion is refused with the error code `weaver.in_use` and the number of linked Designs is shown

**Given** a Weaver linked to no Design
**When** the Owner deletes it
**Then** it no longer appears in the Weavers list

**Given** a request to an `admin/shop/*` Weaver route without an admin session that has a second factor
**When** the request arrives
**Then** it is refused (AD-15)

**Requirements:** FR-57; AD-3, AD-4, AD-14, AD-15, AD-22, AD-28
**Notes for the developer:**
- Creates the `weaver` module in `apps/commerce/src/modules/weaver` with its table and migration, the `Weaver` schema in `packages/contracts`, `admin/shop/weavers` routes and a shop admin page in `apps/commerce/src/admin`.
- Photos use the same upload path Epic 1 uses for Design photos, into the `catalog` bucket.
- Linking a Weaver to a Design is Story 2.2. The Shopper-facing Weaver page is Story 2.18. Translations of the story are Story 2.13.

---

### Story 2.2: The Owner records every attribute of a Design and its Weaver

As an Owner,
I want to record a Design's Weaver, fibre, weave, colour, occasion, zari, place woven, dimensions, blouse piece, care, country of origin, tax code and whether it is stitched,
So that the Design page can state exactly what the saree is and Shoppers can filter by it.

**Acceptance Criteria:**

**Given** the Owner is editing a Design in the Admin
**When** she fills in the Weaver, fibre, weave, colours, occasions, zari, place woven, length and width in metres, blouse piece included or not, care, country of origin, tax code and stitched or unstitched, and saves
**Then** each value is stored as a typed field of the `design-attributes` module linked to the kernel product
**And** none of them is stored in the kernel's free-form metadata (AD-28)

**Given** the Design form
**When** the Owner chooses a Weaver
**Then** she chooses exactly one from the Weavers created in Story 2.1
**And** a Design cannot be saved with two Weavers

**Given** the Design form
**When** the Owner chooses fibre, weave or occasion tags
**Then** she chooses from lists of options that she can add to and rename on an Admin page, without a release
**And** occasion accepts several tags; fibre and weave accept one each

**Given** the Design form
**When** the Owner chooses colour
**Then** she chooses one or more colours from the fixed list of colours defined in `packages/contracts` (AD-28); the Admin offers no way to add to or rename that list
**And** a colour that is not on the fixed list is refused with `design_attributes.invalid`

**Given** an option that is used by at least one Design
**When** the Owner tries to delete it
**Then** the deletion is refused with the error code `attribute_option.in_use`

**Given** the Design form
**When** the Owner enters a length or width that is not a positive number of metres, or a tax code that does not exist
**Then** the save is refused with the error code `design_attributes.invalid` and the field is named

**Given** the one Design listed in Epic 1
**When** this story is deployed
**Then** its existing attribute values are kept, and fields it lacks are empty and shown as "not yet set" in the Admin

**Given** a draft Design
**When** the Owner saves it with some attributes still empty
**Then** the draft is saved; completeness is checked at publishing (Story 2.11), not at saving

**Requirements:** FR-34, FR-3, FR-4, FR-1 (the filterable attributes); AD-3, AD-14, AD-19, AD-28
**Notes for the developer:**
- Extends the `design-attributes` module and its schema in `packages/contracts`: adds by migration whichever of these fields Epic 1 did not already create, the link to `weaver`, an attribute-option table for fibre, weave and occasion tags, and the fixed colour list as an enum in `packages/contracts`.
- Colour (from the fixed list) and occasion tags are Design attributes under AD-28, and the filters of Story 2.15 use them. The colours on the fixed list are chosen with the founder when this story starts `[ASSUMPTION: about 15 everyday colour names; the spine fixes that there is a list, not its contents]`. Labels of the fixed colours are interface text in the translation files.
- Tax codes are those Epic 1 seeded; managing their rates is Story 2.5. Claims and evidence are Story 2.3.

---

### Story 2.3: Claims of silk, handloom or a protected regional name need evidence

As an Owner,
I want to record the evidence behind a claim that a Design is silk, handloom or carries a protected regional name,
So that Alar never publishes a claim it cannot back.

**Acceptance Criteria:**

**Given** the Owner is editing a Design
**When** she marks it as silk, as handloom, or with a protected regional name
**Then** an evidence field appears for each claim, taking a description and, optionally, an uploaded document
**And** each claim and its evidence is stored as typed fields of `design-attributes`

**Given** a draft Design with a claim whose evidence description is empty
**When** the Owner saves the draft
**Then** the draft is saved and the claim is marked "evidence missing" in the Admin

**Given** a Design with a claim whose evidence description is empty
**When** `publish-design` runs for it
**Then** publishing is refused with the error code `design.claim_without_evidence`, naming each claim that lacks evidence
**And** the Design stays unpublished

**Given** a published Design
**When** the Owner adds a claim without evidence, or empties the evidence of an existing claim, and saves
**Then** the save is refused with `design.claim_without_evidence` and the published Design is unchanged

**Given** a Design with a fibre of silk selected in Story 2.2 but no silk claim marked
**When** the Owner saves
**Then** the silk claim is marked automatically and its evidence is required as above

**Given** a published Design with claims
**When** a Shopper reads its view model
**Then** the claims are present and the evidence text and document are not; evidence is visible only in the Admin

**Requirements:** FR-38; AD-4, AD-14, AD-22, AD-28
**Notes for the developer:**
- Extends `design-attributes` (claims with evidence) and adds the claim check as a step of the `publish-design` workflow from Epic 1.
- An evidence document is stored in the private `documents` bucket and opened in the Admin through a short-lived signed link.
- `[ASSUMPTION: the list of protected regional names is an Owner-editable option list like those in Story 2.2; neither the PRD nor the spine says where the names come from]`. The rest of the publish gate is Story 2.11.

---

### Story 2.4: The Owner gives a Design several Variants

As an Owner,
I want to give a Design several Variants, each with its own stock, price and, where they differ, photos,
So that the shop is ready for colours and sizes without being rebuilt.

**Acceptance Criteria:**

**Given** a Design with one Variant, as every saree has at launch
**When** the Owner opens its Variants section
**Then** she sees that Variant with its price and its stock in Pieces
**And** she is not asked to name or choose a Variant to list a saree

**Given** a Design
**When** the Owner adds a second Variant with a label, a price and a number of Pieces
**Then** the Variant is created with its own price, and its stock is set by the `adjust-stock` workflow, which writes one stock-movement row with the cause, time and the Owner's account (AD-6)
**And** the first Variant's price and stock are unchanged

**Given** a Design with several Variants
**When** the Owner attaches photos to one Variant
**Then** those photos are stored against that Variant only
**And** a Variant with no photos of its own uses the Design's photos

**Given** a Variant with Pieces on Hold or in an Order
**When** the Owner tries to delete it
**Then** the deletion is refused with the error code `variant.in_use`

**Given** a Design with one Variant
**When** the Owner tries to delete that Variant
**Then** the deletion is refused with the error code `design.needs_variant`

**Given** any client or admin screen
**When** it tries to change a Variant's stock through a kernel route that is not on the allow-list
**Then** the middleware refuses the request (AD-21)

**Given** a Design with several Variants
**When** its view model is read through `packages/api-client`
**Then** it lists every Variant with its label, price in integer paise, server-computed availability and photos

**Requirements:** FR-35; AD-5, AD-6, AD-14, AD-21
**Notes for the developer:**
- Variants are kernel records; this story adds the Variants section to the shop's Design admin page and the Variant list to the Design view model in `packages/contracts`.
- Stock is set only through `adjust-stock` from Epic 1; do not add another stock path.
- Prices entered here are validated as whole rupees in Story 2.6. Choosing a Variant on the Design page is Story 2.19.

---

### Story 2.5: The Owner sets tax rates by tax code from a date

As an Owner,
I want to change the tax rate of a tax code from a given date,
So that a change in the law or in my accountant's advice changes a setting, not the software.

**Acceptance Criteria:**

**Given** the Owner opens the Tax page in the Admin
**When** the page loads
**Then** she sees each tax code with its value bands (range of per-piece taxable value, after discount and before tax, and rate) and the date each set of bands took effect
**And** the two codes seeded from the PRD's working assumptions are present: unstitched saree at 5% at any value; stitched garment at 5% up to a taxable value of Rs 2,500 per piece and 18% above

**Given** a tax code
**When** the Owner adds a new set of bands with an effective date of today or later in the business time zone
**Then** the bands are stored as a dated setting (AD-13) and earlier bands are kept, not overwritten

**Given** a tax code
**When** the Owner enters an effective date in the past, bands that overlap, or bands that leave a gap in the value range
**Then** the save is refused with the error code `tax.invalid_bands` and the reason is stated

**Given** a tax-inclusive shelf price of Rs 3,000 on a code taxed at 5%
**When** the money functions in `packages/contracts` derive the tax
**Then** the taxable value is 285,714 paise and the tax is 14,286 paise, and together they equal 300,000 paise exactly
**And** the Shopper's price stays Rs 3,000

**Given** a stitched Variant priced at Rs 3,200 with a discount of Rs 800 per piece
**When** the money functions choose the rate
**Then** the rate is taken from the band that holds the per-piece taxable value after the discount and before tax (AD-5): Rs 2,400 at 5% has a taxable value under Rs 2,500, so the 5% band applies
**And** the same Variant with no discount has a taxable value above Rs 2,500 at either rate, so the 18% band applies

**Given** the stitched garment bands (5% up to a taxable value of Rs 2,500 per piece, 18% above)
**When** the money functions are asked whether a tax-inclusive per-piece price fits a band
**Then** Rs 2,625 fits the 5% band and Rs 2,951 fits the 18% band, and every whole-rupee price from Rs 2,626 to Rs 2,950 fits no band: at 5% its taxable value is above Rs 2,500 and at 18% it is not
**And** for such a price one money function returns the nearest valid prices below and above it, here Rs 2,625 and Rs 2,951, and deriving tax from it fails with the error code `price.fits_no_tax_band`; no rate is chosen for it (FR-37, AD-5)

**Given** new bands dated in the future that leave such a range
**When** the Owner saves them
**Then** the Tax page lists every published Variant whose price would fit no band from that date, each with its nearest valid prices, so that she can reprice before the date

**Given** new bands that take effect on a future date
**When** a Checkout snapshot is made before that date and another on or after it
**Then** the first uses the old bands and the second the new ones
**And** an invoice already issued is not changed (AD-25)

**Given** any code path that needs a tax amount
**When** it is computed
**Then** it is computed by the shop's tax provider calling the money functions, and nowhere else (AD-5)

**Requirements:** FR-37; AD-5, AD-13, AD-14, AD-25
**Notes for the developer:**
- Extends the `settings` module's dated tax bands, the `tax` provider in `apps/commerce/src/providers` and the money functions in `packages/contracts` that Epic 1 created for the invoice; adds the Tax admin page.
- Add table-driven tests for the money functions: flat rate, threshold rule, boundary at Rs 2,500, a dated change. Bands are on the per-piece taxable value after discount and before tax (AD-5).
- Because tax is derived backwards from a tax-inclusive price, a stitched price from Rs 2,626 to Rs 2,950 fits neither band: at 5% its taxable value is above Rs 2,500 and at 18% it is not. FR-37 and AD-5 settle what happens: such a price is refused and the nearest valid prices are named. This story adds the money function that finds the nearest valid prices and the error code `price.fits_no_tax_band`; `set-variant-price` (Story 2.6), `publish-design` (Story 2.11) and the discount workflow (Story 2.20) call it. The range is worked out from the bands in force and is never a constant in code. No saree at launch is stitched.
- Discounts themselves are Story 2.20; this story only makes the functions accept a per-piece discount.

---

### Story 2.6: Prices are whole rupees and every price change is kept

As an Owner,
I want every price I set to be a whole number of rupees and every change to be kept,
So that Shoppers never see paise and the lowest price of the previous 30 days can always be shown.

**Acceptance Criteria:**

**Given** the Owner is setting a Variant's price in the Admin
**When** she enters a whole number of rupees
**Then** the price is stored as integer paise that is a multiple of 100 (AD-5)
**And** the price field does not accept a decimal point

**Given** any request that sets a Variant's price
**When** the amount is not a positive multiple of 100 paise
**Then** it is refused with the error code `price.not_whole_rupee` and no price changes

**Given** a Variant of a Design whose tax code has bands that leave a range of prices fitting no band (for stitched items today, Rs 2,626 to Rs 2,950)
**When** the Owner sets a price in that range, for example Rs 2,800
**Then** `set-variant-price` refuses it with the error code `price.fits_no_tax_band`, the two nearest valid prices (here Rs 2,625 and Rs 2,951) are in `details`, and the Admin offers them to her (FR-37)
**And** no price changes and no price-history row is written
**And** a Variant of a draft Design that has no tax code yet is not checked here; `publish-design` checks it (Story 2.11)

**Given** a Variant
**When** its price is set for the first time or changed
**Then** the `set-variant-price` workflow writes one price-history row with the Variant, the old price, the new price, the time and the Owner's account
**And** no price-history row is ever updated or deleted

**Given** the Variants that existed before this story
**When** it is deployed
**Then** each has at least one price-history row recording its current price; a Variant that somehow has none gets one from its creation time

**Given** any client or admin screen
**When** it tries to change a price through a kernel route instead of the shop route
**Then** the allow-list middleware refuses it (AD-21), so no price changes without a history row

**Given** a Variant priced at Rs 3,200 forty days ago, Rs 2,900 twenty days ago and Rs 3,100 today
**When** the server computes its lowest price of the previous 30 days
**Then** the answer is Rs 2,900
**And** a Variant listed for fewer than 30 days uses its prices since it was first listed

**Given** the Owner opens a Variant in the Admin
**When** she views its price history
**Then** she sees every change with its date, old price, new price and who made it

**Given** a price in any view model
**When** a client shows it
**Then** it is formatted from integer paise as whole rupees with no paise, and the client computes nothing (AD-5)

**Requirements:** FR-5, FR-37; AD-4, AD-5, AD-14, AD-21
**Notes for the developer:**
- Builds on Story 1.6, which created the `price-history` module and wrote its first rows: this story adds the `set-variant-price` workflow as the only way a price changes, the shop admin route for prices, the price-history view and the lowest-price function used by the catalogue read.
- Remove the kernel's direct price-edit routes from the allow-list in `packages/contracts` and hide the matching built-in admin control.
- Showing the 30-day lowest price beside a discount is Stories 2.20 and 2.21.

### Story 2.7: A saree sold with a stitched blouse is taxed and invoiced as two lines

As a Shopper,
I want the invoice for a saree that comes with a stitched blouse to show each part with its own tax,
So that the tax I paid is stated correctly for what I bought.

**Acceptance Criteria:**

**Given** the Owner is editing a Design
**When** she marks it as sold with a stitched blouse
**Then** she must give the blouse component its own tax code and, for each Variant, its share of the price in whole rupees, above zero and below the Variant's price
**And** the component is stored as typed fields of `design-attributes`; a Design without the component is unchanged

**Given** a Variant priced at Rs 3,990 whose blouse share is Rs 630, with the saree on the unstitched code at 5% and the blouse on the stitched garment code
**When** the money functions in `packages/contracts` derive the tax
**Then** they return two lines: the saree at Rs 3,360 with a taxable value of 320,000 paise and tax of 16,000 paise, and the blouse at Rs 630, whose taxable value is under Rs 2,500 and so takes the 5% band, with a taxable value of 60,000 paise and tax of 3,000 paise
**And** the four amounts add up to 399,000 paise exactly and the Shopper's price stays Rs 3,990

**Given** a blouse share, or a saree share, that fits no band of its own tax code (for the stitched code today, Rs 2,626 to Rs 2,950)
**When** the Owner saves the share, changes the Variant's price through `set-variant-price`, or publishes the Design
**Then** it is refused with `price.fits_no_tax_band`, and `details` names the component and its two nearest valid values (FR-37, AD-5)

**Given** a cart line for such a Variant
**When** `begin-checkout` makes the Checkout snapshot
**Then** the snapshot and the recovery file carry two lines for each Piece, each with its tax code, taxable value and tax, and the line total the kernel computed equals their sum
**And** the invoice issued by `confirm-payment` shows the saree and the stitched blouse as two lines, each with its tax code, taxable value and tax exact to the paisa, and the lines add up to the amount paid (FR-20)

**Given** such an item is refunded
**When** the credit note is issued
**Then** it reverses both lines to the paisa

**Given** a per-piece discount handed to the money functions, which accept one since Story 2.5
**When** the discounted whole-rupee price is split
**Then** the blouse share is reduced in the same proportion and rounded down to a whole rupee, the saree line takes the rest, and each line takes the rate of its own band at its discounted value `[ASSUMPTION: the proportional split; neither the PRD nor the spine says, and it is a question for the accountant]`

**Given** a Design with no stitched blouse component, or a component whose tax code is the Design's own
**When** it is sold
**Then** the snapshot and the invoice carry one line for the Piece, as before

**Given** invoices issued before this story
**When** it is deployed
**Then** none is changed (AD-25)

**Requirements:** FR-20, FR-37; AD-5, AD-25, AD-28, AD-30
**Notes for the developer:**
- Touches `design-attributes` (the component's tax code and per-Variant share), the money functions in `packages/contracts` (a split of one tax-inclusive price into component lines), the `tax` provider, the snapshot step of `begin-checkout`, the `invoice` module and the `invoice.render` job (two lines), and the Design admin page.
- The shop's tax provider remains the only tax calculation (AD-5). If the kernel cannot carry two taxable values for one cart line, the Checkout snapshot built by the money functions is what the invoice reads, and the kernel's line total must still equal the snapshot's; if the two cannot be made equal, stop and report.
- "Blouse piece included" (unstitched fabric woven with the saree, Story 2.2) is not this component and stays one line. No saree at launch is sold with a stitched blouse; test with a seeded Design.
- The discount workflow of Story 2.20 applies its band check to each component through the same functions.

---

### Story 2.8: The Owner uploads the full-length image of a saree

As an Owner,
I want to upload one full-length image of a saree to a Design,
So that it can be made ready for the Full saree view.

**Acceptance Criteria:**

**Given** the Owner is editing a Design
**When** she chooses a full-length image file
**Then** the Admin asks commerce for a single-use signed upload link limited by file type and size, and uploads the file straight to object storage (AD-22)
**And** the image bytes do not pass through commerce and do not appear in any log

**Given** the upload has finished
**When** the Admin tells commerce
**Then** the `attach-full-image` workflow reads the image's pixel dimensions and, if the long side is 8,000 pixels or more, records the image against the Design with the status "uploaded"

**Given** an image whose long side is under 8,000 pixels
**When** the Owner chooses it
**Then** the Admin refuses it before uploading, saying that the long side must be at least 8,000 pixels and stating the size of the file she chose
**And** if such a file reaches commerce anyway, `attach-full-image` refuses it with the error code `full_image.too_small`, with the minimum of 8,000 in the details, and deletes the uploaded file

**Given** a file that is not an image of an accepted type, or that exceeds the size limit
**When** the Owner chooses it
**Then** it is refused with the error code `full_image.unsupported`, stating the accepted types and limit

**Given** a Design that already has a full-length image
**When** the Owner uploads another
**Then** the new image is recorded as a new version and the earlier Full saree view stays in use until the new one is ready (Story 2.9)

**Given** a Design with a full-length image
**When** the Owner removes it
**Then** the Design has no full-length image and its status is "none"

**Given** the minimum of 8,000 pixels
**When** the code reads it
**Then** it comes from the `settings` module, not from a constant in code (AD-13)

**Requirements:** FR-7; AD-4, AD-13, AD-14, AD-22
**Notes for the developer:**
- Adds full-length image fields to `design-attributes` (object key, version, width, height, status: none, uploaded, processing, ready, failed), an `admin/shop/*` route that issues the upload link, and the `attach-full-image` workflow.
- The original is stored in the `catalog` bucket, which is versioned and backed up (NFR-8). `[ASSUMPTION: accepted types are JPEG and PNG; the PRD names none]`.
- Cutting tiles and the "ready" status are Story 2.9; the viewer and preview are Story 2.10.

---

### Story 2.9: The full-length image is made ready and the Owner sees when it is finished

As an Owner,
I want the full-length image cut into tiles in the background and to see when that is finished,
So that I can carry on listing the Design while it is processed.

**Acceptance Criteria:**

**Given** a full-length image has been recorded with the status "uploaded"
**When** `attach-full-image` completes
**Then** it enqueues one `tiles.build` job on the shop queue with a deterministic id made from the Design id and the image version, and sets the status to "processing" (AD-8)

**Given** a local or staging environment
**When** this story is deployed
**Then** the public `tiles` bucket exists: it is created in this story, in `infra/` for local and staging, is not versioned, and its name does not contain the product name (AD-20, AD-22)

**Given** a `tiles.build` job
**When** the worker runs it
**Then** it cuts the image into a Deep Zoom tile pyramid with sharp and writes it to the `tiles` bucket under a path that includes the image version (AD-18)
**And** it reports the result to commerce through an `/internal/*` route with a service token; the route starts a workflow that sets the status to "ready" and stores the tile descriptor's location, width and height (AD-9)

**Given** the same `tiles.build` job is delivered twice
**When** the worker runs it the second time
**Then** the outcome is the same single set of tiles and one "ready" status, with no duplicate records

**Given** the worker cannot read or cut the image
**When** the job has used its retries
**Then** the status becomes "failed" with a reason the Owner can read, and the Admin offers "try again", which enqueues the job again

**Given** the Owner has the Design open in the Admin
**When** the status changes to "ready" or "failed"
**Then** the page shows the new status within 10 seconds without being reloaded

**Given** a Design whose earlier image was "ready" and whose new image is "processing"
**When** a Shopper opens its Full saree view
**Then** she sees the earlier image until the new one is "ready"
**And** once the new one is "ready" the earlier version's tiles are deleted

**Given** the worker
**When** it runs this job
**Then** it never connects to the commerce database (AD-1)

**Requirements:** FR-7; AD-1, AD-4, AD-8, AD-9, AD-18, AD-22
**Notes for the developer:**
- Adds the `tiles.build` job name and payload to `packages/contracts`, the job in `apps/worker/src/jobs`, the internal route and workflow in `apps/commerce`, and the `tiles` bucket in `infra/` (the compose file's bucket set-up and the staging bucket). Production's bucket is created the same way when production is built in Epic 7.
- The worker reads the original from `catalog` and writes to `tiles`; both are public buckets, so no signed links are needed for this job.
- Test with a 20,000-pixel-long image on the ARM64 staging server and record how long the job takes; the PRD sets no time limit.

---

### Story 2.10: A Shopper views the whole saree

As a Shopper,
I want to open the Full saree view of a Design and pan and zoom along its entire length,
So that I can inspect the body, border and pallu as if the saree were laid out in front of me.

**Acceptance Criteria:**

**Given** a published Design whose full-length image is "ready"
**When** a Shopper opens its Design page
**Then** an entry point to the Full saree view is shown
**And** no login is required to use it

**Given** a Design with no full-length image, or one that is "uploaded", "processing" or "failed" with no earlier ready version
**When** a Shopper opens its Design page
**Then** the entry point is absent: no disabled control, no broken link

**Given** a Shopper opens the Full saree view
**When** it loads
**Then** the whole saree is visible, end to end, fitted to the screen

**Given** the Full saree view is open
**When** the Shopper zooms in as far as it allows
**Then** zooming stops when one pixel of the image fills one pixel of the screen
**And** she can pan to both ends and both edges of the saree but not beyond them

**Given** the Full saree view is open on a mobile connection
**When** the Shopper zooms into one part of the saree
**Then** only tiles for the part and zoom level being looked at are requested
**And** the original full-length image file is never requested

**Given** a phone
**When** the Shopper uses the view
**Then** pinch zooms, drag pans and double-tap zooms in; on a desktop the wheel zooms and drag pans
**And** zoom in, zoom out, reset and close are also buttons with labels a screen reader announces

**Given** the tiles cannot be loaded
**When** the view opens
**Then** the Shopper sees a message that the view is unavailable and a way back to the Design page, not a blank screen

**Given** the Owner is editing an unpublished Design whose full-length image is "ready"
**When** she chooses "Preview Full saree view" in the Admin
**Then** the same viewer page opens for that Design through a preview link signed by commerce and valid for 15 minutes
**And** without a valid link the viewer refuses to show an unpublished Design

**Requirements:** FR-6, FR-7; AD-2, AD-18, AD-28
**Notes for the developer:**
- One viewer page in `apps/web` using OpenSeadragon 6.1.1, reading the tile descriptor location from the Design view model through `packages/api-client`. Build it as a self-contained page so that Epic 6 can load the same page in the Android web view (AD-18). It replaces the sample page of Story 1.28, which proved the touch behaviour, and deletes that story's sample tiles under the `spike/` prefix of the `catalog` bucket.
- Reuses the signed Design preview link that Story 1.8 built for an unpublished Design and extends it to the viewer page; Story 2.11 uses the same link. `[ASSUMPTION: the link is valid for 15 minutes; Story 1.8 set no period]`.
- Placing the entry point so that it is visible without scrolling is Story 2.19. Styled from DESIGN.md when it exists.

---

### Story 2.11: The Owner previews a Design and publishes it only when it is complete

As an Owner,
I want to preview a Design as a Shopper will see it and publish it only when nothing required is missing,
So that every listing is complete and honest, and listing one takes me under 15 minutes.

**Acceptance Criteria:**

**Given** a draft Design
**When** the Owner chooses "Preview"
**Then** the website's Design page opens for that Design through the signed preview link from Story 1.8, as extended in Story 2.10
**And** the Design is not visible to Shoppers or in the catalogue read

**Given** a Design that lacks any of: a Weaver, a fibre, a length and a width, a tax code, a whole-rupee price on every Variant, a photo marked as the fabric close-up, and at least one other photo
**When** the Owner chooses "Publish"
**Then** `publish-design` refuses with the error code `design.incomplete` and the details list every missing item at once
**And** the Design stays a draft

**Given** a Design with a claim that has no evidence
**When** the Owner chooses "Publish"
**Then** it is refused as in Story 2.3

**Given** a Design that has a Variant whose price fits no band of the Design's tax code (for stitched items today, Rs 2,626 to Rs 2,950)
**When** the Owner chooses "Publish"
**Then** `publish-design` refuses with `price.fits_no_tax_band`, `details` names each such Variant with its two nearest valid prices, and the Design stays a draft (FR-37, AD-5)
**And** changing the tax code or the stitched mark of a published Design so that a Variant's price fits no band is refused in the same way, and the published Design is unchanged

**Given** a Design that passes every check
**When** the Owner chooses "Publish"
**Then** she is asked to confirm that the photos show the saree's true colour
**And** the Design is published only after she confirms; the confirmation is recorded with her account and the time

**Given** a published Design
**When** the Owner adds, removes or replaces a photo
**Then** the true-colour confirmation is asked for again before the change is shown to Shoppers

**Given** a published Design
**When** the Owner saves an edit that would leave it without a required item
**Then** the save is refused with `design.incomplete` and the published Design is unchanged

**Given** a Design whose full-length image is still "processing"
**When** the Owner publishes it
**Then** publishing succeeds, and the Full saree view entry point appears when the image is "ready"

**Given** Designs that were published before this story and fail the checks
**When** this story is deployed
**Then** each is returned to draft by a workflow and listed for the Owner as "needs completing"
**And** after deployment no published Design lacks a Weaver

**Given** the end-to-end test of Story 1.27, which publishes a Design with the fields Epic 1 required
**When** this story is finished
**Then** the test is updated for this change (it creates a Weaver and gives the Design every item the gate now requires before publishing) and passes

**Requirements:** FR-34, FR-37, FR-38, FR-4; AD-4, AD-5, AD-14, AD-28
**Notes for the developer:**
- Completes the `publish-design` workflow in `apps/commerce/src/workflows` and the Design admin page; adds a "fabric close-up" mark on a photo and the true-colour confirmation fields to `design-attributes`.
- `publish-design` is the only way a Design becomes published (AD-28); the kernel's own product-status edit stays off the allow-list.
- The timed 15-minute rehearsal is Story 2.12.

---

### Story 2.12: The Owner lists a Design in under 15 minutes

As an Owner,
I want the whole path from "New Design" to "Published" timed,
So that I know listing a saree takes me under 15 minutes once the photos are taken.

**Acceptance Criteria:**

**Given** photos and a full-length image already taken, and a Weaver already created
**When** an automated end-to-end test lists a new Design from "New Design" to "Published", with attributes, one Variant, 10 Pieces of stock, photos, the full-length image and a preview
**Then** the test passes and is part of the checks run before a deploy

**Given** the same materials on staging
**When** the Owner lists a new Design by hand through the same steps
**Then** a timed rehearsal recorded in `docs/` takes under 15 minutes, not counting time waiting for tiles
**And** the record states the date, who did it and the time each step took

**Given** a rehearsal that takes longer than 15 minutes
**When** the form is shortened, for example with sensible defaults for one Variant
**Then** no check of `publish-design` is relaxed, and the rehearsal is run and recorded again

**Requirements:** FR-34 (the 15-minute target); AD-28
**Notes for the developer:**
- Touches a test beside the end-to-end test of Story 1.27, the Design admin page only if the form must be shortened, and `docs/`.
- The developer agent can close the first criterion alone. The second waits for the Owner: hand the story back with the test passing and the rehearsal sheet prepared, and say that the timing is outstanding.

---

### Story 2.13: The Owner translates Design and Weaver text, and the website's wording has a file per language

As an Owner,
I want to enter translations of each Design's and Weaver's text in the Admin, and to have the website's own wording held in one file per language,
So that Shoppers can read Alar in their language.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin with a second factor
**When** she edits a Design, a Weaver or an Owner-editable attribute option
**Then** she can enter, for each configured language other than English, a translated name, description and care text for a Design; a translated name, place and story for a Weaver; and a translated label for an option
**And** the translated text is stored with the Design, the Weaver or the option in commerce (AD-28), by a workflow, and a `shop-audit` event records the before and after values

**Given** a translation has been saved
**When** commerce next builds a Shopper-facing response in that language
**Then** the translated text is used at once, with no release and no restart

**Given** a Design, Weaver or option text with no translation in the Shopper's language
**When** it is requested in that language
**Then** the English text is returned

**Given** the website's interface text
**When** the source is inspected
**Then** every piece of it is a key in the translation files in `apps/web`, one file for English and one for Tamil, and the English file is complete
**And** the labels of the fixed colour list are keys in the same files
**And** a key with no Tamil text falls back to English; a key is never shown to a Shopper in place of text

**Given** the configured languages
**When** code needs the list
**Then** it reads it from the `settings` module: English and Tamil (PRD §10, working answer 3)

**Given** this story's code
**When** it is inspected
**Then** nothing in it reads from or writes to the content application; documents and message templates get their translations in content in Epic 3, and the interface translation bundles are put in content by Story 3.4 (AD-28)

**Given** a published Design
**When** the Owner changes only its translated text
**Then** the Design stays published and the true-colour confirmation is not asked for again

**Requirements:** NFR-14; AD-2, AD-3, AD-4, AD-14, AD-19, AD-28
**Notes for the developer:**
- Adds translated-text fields to the `design-attributes` and `weaver` modules and to the attribute-option table, the language list to `settings`, translation inputs on the Design, Weaver and option admin pages, and the Tamil translation file beside the English one that Epic 1 began in `apps/web`. Schemas go in `packages/contracts`.
- AD-28 makes interface text a translation bundle per language, held in content and served through commerce, with a built-in copy in each client as the fallback; "until content holds the bundles, clients use the built-in copy". This story builds only that built-in copy, so until Story 3.4 a change to the website's own wording needs a deploy of the website. Story 3.4 builds the bundles and so meets NFR-14 for interface text; Design, Weaver and option text change without a release from this story on.
- The website's use of these texts and the language choice are Story 2.14.

---

### Story 2.14: A Shopper reads the shop in her language

As a Shopper,
I want to choose my language and see the shop's text in it,
So that I can read about a saree in the language I am most comfortable with.

**Acceptance Criteria:**

**Given** a Shopper opens the website for the first time
**When** her browser's preferred language is Tamil and Tamil is a configured language
**Then** the website shows Tamil text; otherwise it shows English

**Given** a Shopper on any page
**When** she chooses another language from the language control
**Then** the same page is shown in that language
**And** her choice is remembered on that device for later visits, without her logging in

**Given** a language is chosen
**When** `packages/api-client` makes any request
**Then** the request carries that language, and the response's text is in it

**Given** the Owner changes a Design's or a Weaver's translated text in the Admin (Story 2.13)
**When** a Shopper next loads a page that shows it in that language
**Then** she sees the new text, with no release

**Given** the website's source code
**When** the build runs
**Then** a check fails the build if a Shopper-facing page contains literal text instead of a text key from the translation files

**Given** a price, a date or a measurement
**When** it is shown in any language
**Then** the price is a whole number of rupees and the value is the one the server returned; only its formatting follows the language

**Given** an interface text key with no Tamil text in the translation file
**When** a page is rendered in Tamil
**Then** the English text is shown, never the key

**Requirements:** NFR-14; AD-2, AD-19, AD-28
**Notes for the developer:**
- Touches `packages/api-client` (send the language on every request) and `apps/web` (language control, text lookup from the translation files of Story 2.13, the build check). This story does not depend on the content application. Write the text lookup as one function: the translation files are the built-in fallback copy of AD-28, and Story 3.4 puts the bundle served through commerce in front of them inside that function.
- Replace the literal texts on the pages Epic 1 built (Design page, cart, checkout, order pages) with text keys.
- Styled from DESIGN.md when it exists.

---

### Story 2.15: The catalogue is read from one place, with filters, counts and availability

As a Shopper,
I want the list of Designs, the filter counts and each Design's availability to come from the server,
So that what I see on any device is the same and true.

**Acceptance Criteria:**

**Given** about 100 published Designs
**When** a client calls `/store/shop/designs` with no filters and no login
**Then** it receives a page of Design cards, the total number of matching Designs, and, for fibre, weave, colour, occasion and Weaver, each option with the number of Designs it would give
**And** each card carries the Design's name, Weaver name, photo, lowest Variant price in integer paise and server-computed availability

**Given** filters for fibre, weave, colour, occasion, Weaver and a price range in whole rupees
**When** several are sent together
**Then** options within one filter are alternatives and different filters must all hold `[ASSUMPTION: this way of combining; FR-1 says only that filters combine]`
**And** the total and the option counts reflect the combination

**Given** a set of filters
**When** the client asks for the count only
**Then** the route returns the total and option counts without cards, so that the count can be shown before the filters are applied

**Given** a Design with no Pieces in stock
**When** it matches the filters
**Then** it is returned with the availability "sold out"; it is not left out

**Given** a Design whose every remaining Piece is on Hold
**When** it is returned
**Then** its availability is "unavailable for now"
**And** availability is computed as stocked minus reserved by the server, never by a client (AD-6, AD-28)

**Given** a draft Design, or one returned to draft
**When** the route is called
**Then** it never appears

**Given** an unknown filter name or an option id that does not exist
**When** the route is called
**Then** it answers with the error code `catalogue.invalid_filter`

**Given** 100 published Designs on staging
**When** the route is called with any combination of filters
**Then** 95% of responses are sent within 500 milliseconds `[ASSUMPTION: the 500-millisecond figure; the PRD sets only the 3-second page target]`

**Given** UI code in `apps/web`
**When** it needs catalogue data
**Then** it calls a function in `packages/api-client` that returns these view models, and the lint rule fails the build if it imports the kernel's SDK or types (AD-2)

**Requirements:** FR-1, FR-5; AD-2, AD-5, AD-6, AD-19, AD-28
**Notes for the developer:**
- Extends `/store/shop/designs` in `apps/commerce/src/api/store/shop`, the `DesignCard` and listing schemas and the availability enum in `packages/contracts`, and the function in `packages/api-client`.
- `[ASSUMPTION: the default order is newest first and the page size is 24]`. Design and Weaver text comes in the request's language from commerce (Story 2.13). The colour filter's options are the fixed list of Story 2.2; the occasion filter's are the occasion tags.
- Search is Story 2.17. Discount fields on the card are Story 2.20. Extend the seed script of Story 1.26 so that its 100 Designs carry Weavers, colours, occasion tags and the other filterable attributes; do not write a second seed script.

---

### Story 2.16: A Shopper browses and filters Designs on the website

As a Shopper,
I want to browse Designs and narrow them by fibre, weave, colour, occasion, price and Weaver,
So that I can find sarees that suit the occasion and my budget.

**Acceptance Criteria:**

**Given** a Shopper who is not logged in
**When** she opens the Designs page on her phone
**Then** she sees Design cards with photo, name, Weaver and a whole-rupee price
**And** she is never asked to log in to browse

**Given** the filter controls are open
**When** she selects or clears an option
**Then** the number of Designs the selection would give is shown before she applies it
**And** the list changes only when she applies

**Given** a selection that would give no Designs
**When** the count is shown
**Then** it reads zero and she is told to clear a filter; she is not taken to an empty page

**Given** applied filters
**When** she reloads the page, shares its address or uses the back button
**Then** the same filters are applied

**Given** a Design that is sold out
**When** it matches the filters
**Then** its card is shown and marked as sold out, and it can still be opened
**And** a Design that is unavailable for now is marked so

**Given** more Designs than fit on one page
**When** she reaches the end of the list
**Then** she can load the next page, and Designs already shown stay in place

**Given** applied filters
**When** she chooses "clear all"
**Then** every filter is removed and all Designs are listed

**Given** the Designs page
**When** it is used with a screen reader or at the largest system font size
**Then** every filter and card has a label and the layout holds

**Given** the catalogue read fails
**When** the page loads
**Then** she sees a message and a "try again" control, not a blank page

**Requirements:** FR-1, FR-5; AD-2, AD-28; NFR-13
**Notes for the developer:**
- `apps/web` only, using the `packages/api-client` function from Story 2.15, including its count-only mode. The page computes no counts and no availability.
- No countdowns or "only N left" pressure (NFR-13).
- Styled from DESIGN.md when it exists. Search is Story 2.17.

---

### Story 2.17: A Shopper searches Designs

As a Shopper,
I want to search by words in a Design's name, description, weave or Weaver,
So that I can go straight to the kind of saree I have in mind.

**Acceptance Criteria:**

**Given** a Shopper who is not logged in
**When** she submits a search
**Then** the Designs whose name, description, weave or Weaver name contain the words are listed
**And** matching ignores upper and lower case

**Given** a search of several words
**When** it is run
**Then** a Design matches only if every word is found in at least one of the four fields `[ASSUMPTION: every word must match; FR-2 does not say]`

**Given** about 100 published Designs on staging
**When** a Shopper submits a search
**Then** results are shown within 2 seconds of submitting, measured by an automated test

**Given** a search that matches no Design
**When** the results page loads
**Then** it says nothing matched and shows, instead of an empty page, the filter panel with each option's count of Designs and the three weaves that have the most Designs (FR-2)
**And** choosing a filter option or one of the three weaves opens the Designs page with that filter applied

**Given** search results
**When** she applies filters
**Then** the search and the filters combine, and the counts reflect both

**Given** a search that is empty, only spaces, or longer than 100 characters
**When** it is submitted
**Then** an empty search shows all Designs, and an over-long one is cut to 100 characters

**Given** a search containing punctuation or characters used in query syntax
**When** it is run
**Then** they are treated as plain text and the route returns results or the no-results answer, never an error

**Given** sold-out Designs that match
**When** results are shown
**Then** they are included and marked as sold out

**Requirements:** FR-2, FR-1; AD-2, AD-28
**Notes for the developer:**
- Adds a search parameter and a `top_weaves` field (the three weaves with the most published Designs) to `/store/shop/designs` using Postgres full-text search inside commerce (spine, Deferred: no separate search engine); a search with no results still returns the unfiltered option counts for the filter panel. Adds the search box and results state to `apps/web`.
- `[ASSUMPTION: search covers the English text and the translated text of the request's language, both held in commerce; FR-2 does not mention languages]`.
- Styled from DESIGN.md when it exists.

---

### Story 2.18: A Shopper reads about a Weaver

As a Shopper,
I want to read about the Weaver and see the Designs that Weaver made,
So that I know where a saree came from and who made it.

**Acceptance Criteria:**

**Given** a Weaver with at least one published Design
**When** a Shopper opens the Weaver page without logging in
**Then** she sees the Weaver's name, place, story and photos, in her language where a translation exists

**Given** the Weaver page
**When** it loads
**Then** it lists that Weaver's published Designs as cards with whole-rupee prices and availability, sold-out ones included and marked
**And** the list comes from `/store/shop/designs` filtered by that Weaver

**Given** a Weaver whose Designs are all drafts
**When** a Shopper opens its address
**Then** she gets the "not found" page with a link to the Designs page

**Given** a Weaver with more Designs than one page
**When** she reaches the end of the list
**Then** she can load more

**Given** a Weaver with no photos
**When** the page loads
**Then** the page shows the name, place and story without an empty photo area

**Given** the Owner edits the Weaver's story in the Admin
**When** a Shopper next loads the page
**Then** she sees the new story, with no release

**Requirements:** FR-4; AD-2, AD-28
**Notes for the developer:**
- Adds a Shopper-facing Weaver read under `/store/shop/*`, its view model in `packages/contracts`, its function in `packages/api-client`, and the page in `apps/web`.
- The view model carries only what a Shopper may see: name, place, story, photos. No contact details.
- Styled from DESIGN.md when it exists. The link from the Design page is Story 2.19.

---

### Story 2.19: The Design page tells a Shopper everything she needs

As a Shopper,
I want the Design page to show the photos, price, description, attributes, Weaver, stock status, delivery estimate and the shop's terms,
So that I can judge the saree without having to ask.

**Acceptance Criteria:**

**Given** a published Design
**When** a Shopper opens its page without logging in
**Then** she sees its photos, whole-rupee price including tax, description, stock status and delivery estimate
**And** she sees these attributes: fibre, weave, zari, where it was woven, length and width in metres, blouse piece included or not, care, and country of origin

**Given** the Design's photos
**When** the page shows them
**Then** the photo marked as the fabric close-up is among them and is identified as a close-up
**And** the page says that colours can look slightly different on different screens

**Given** the Design's Weaver
**When** the page shows it
**Then** the Weaver's name and place are shown with a link to the Weaver page from Story 2.18

**Given** the page
**When** it loads
**Then** it shows the maker's name and address, a consumer-care contact, and the return, refund, delivery and payment terms
**And** these come from settings and from text held outside code (the translation files until Epic 3 puts the policies in content)

**Given** a phone with a screen 360 pixels wide and 640 pixels tall
**When** the page of a Design with a ready full-length image loads
**Then** the entry point to the Full saree view is visible without scrolling
**And** the place where Epic 4 adds the Try-on entry point is beside it, so that both will be visible without scrolling

**Given** a Design with several Variants
**When** the Shopper chooses a Variant
**Then** the price, photos and stock status change to that Variant's, and "add to cart" adds that Variant
**And** a Design with one Variant shows no Variant chooser

**Given** a Variant that is sold out or unavailable for now
**When** it is selected
**Then** its status is stated and "add to cart" is not offered for it
**And** the status comes from the server; no number of remaining Pieces or countdown is shown (NFR-13)

**Given** a Design that is a draft or does not exist
**When** its address is opened without a valid preview link
**Then** the "not found" page is shown with a link to the Designs page

**Given** a Design whose optional attribute, such as zari, is not set
**When** the page loads
**Then** that attribute is left out, not shown empty

**Requirements:** FR-3, FR-4, FR-5, FR-35; AD-2, AD-5, AD-13, AD-28
**Notes for the developer:**
- Completes the Design detail view model in `packages/contracts`, the single-Design read under `/store/shop/designs`, and the Design page in `apps/web` that Epic 1 began.
- `[ASSUMPTION: until Epic 3, the delivery estimate is the earliest and latest number of days for the delivery region, and the maker's name and address and consumer-care contact are the shop's own, all seeded in the `settings` module]`; the terms are interface text in the translation files of Story 2.13. Epic 3 adds the pincode check (FR-17, Story 3.11) and replaces the terms with links to the numbered policies in content (FR-59, Story 3.3).
- The region below the fixed content that the Owner arranges from Blocks is Epic 5. Styled from DESIGN.md when it exists.

---

### Story 2.20: The Owner creates a discount

As an Owner,
I want to create a discount as a percentage or an amount, for chosen Designs, between two dates, applied automatically or by a code,
So that I can run an offer without breaking whole-rupee prices or the tax calculation.

**Acceptance Criteria:**

**Given** the Owner opens Discounts in the Admin
**When** she creates a discount with a percentage or a whole-rupee amount, one or more chosen Designs, a start and an end date and time, and either "automatic" or a code
**Then** the `save-discount` workflow, started by `/admin/shop/discounts`, saves the discount, and it applies only to those Designs and only between those times
**And** no discount is created, edited or ended by any other path: the kernel's own promotion write routes are not on the allow-list (AD-21)

**Given** the discount form
**When** the percentage is not above 0 and below 100, the amount is not a whole number of rupees or is not below the lowest price of the chosen Variants, the end is not after the start, no Design is chosen, or the code is already in use (ignoring case)
**Then** the save is refused with the error code `discount.invalid` and the reason is stated

**Given** a 15% discount on a Variant priced at Rs 2,999
**When** the server computes the discounted price
**Then** the discount is applied per piece and the price is rounded down to a whole rupee: Rs 2,549
**And** tax is derived again from Rs 2,549 by the money functions, with any remainder in the tax line (AD-5)

**Given** a stitched Variant whose discounted per-piece value crosses a tax band
**When** the tax is derived
**Then** the rate of the band for the discounted value is used, as in Story 2.5

**Given** a discount that would give any chosen Variant a discounted per-piece price that fits no band of its tax code (for a stitched item today, Rs 2,626 to Rs 2,950)
**When** the Owner saves it
**Then** `save-discount` refuses it with `price.fits_no_tax_band`, `details` names each such Variant with its two nearest valid discounted prices, and nothing is saved (FR-37, AD-5)
**And** from this story on `set-variant-price` makes the same check on the Variant's price under every discount in force or scheduled for it

**Given** an automatic discount that is in force
**When** a Design card or Design view model is read
**Then** it carries the price before the discount, the price now, and the lowest price of the previous 30 days computed by the server from price history and earlier discounts
**And** before the start and after the end it carries only the ordinary price

**Given** a discount by code
**When** a cart containing a chosen Design has the code applied through `packages/api-client`
**Then** the cart's lines for those Designs carry the discounted whole-rupee price and re-derived tax
**And** a code that is unknown, not yet started, ended, or for Designs not in the cart is refused with the error code `discount.code_not_applicable`

**Given** a Design with an automatic discount and a code that also applies
**When** the cart is priced
**Then** only the larger of the two discounts applies to that Piece `[ASSUMPTION: discounts do not add up; FR-58 does not say]`

**Given** a Checkout whose Hold has begun
**When** the discount ends or is edited
**Then** the Checkout snapshot's amounts do not change, and the amount charged equals the total shown before payment began

**Given** the Owner edits or ends a discount
**When** she saves
**Then** `save-discount` makes the same checks as on creation, the change applies to carts priced afterwards, and a `shop-audit` event records the before and after values

**Requirements:** FR-58, FR-5, FR-37; AD-5, AD-14, AD-21, AD-28
**Notes for the developer:**
- A discount is a kernel record (AD-3). Add the shop's Discounts admin page, the `save-discount` workflow behind `/admin/shop/discounts` (the discount workflow AD-5 names: it enforces the whole-rupee rule, the tax-band check and the before-and-after audit), the per-piece discount step in the money functions, and discount fields on `DesignCard` and the Design detail schema in `packages/contracts`.
- Only the kernel cart routes for applying and removing a code are added to the allow-list; the kernel's promotion create, update and delete routes stay off it and the built-in promotions screen is hidden.
- If the kernel's own percentage calculation cannot round each piece down to a whole rupee, compute the per-piece amount with the money functions and hand the kernel a fixed amount; the shop's tax provider remains the only tax calculation.
- `[ASSUMPTION: "the lowest price of the previous 30 days" means the lowest price at which the Variant was offered in the 30 days before this discount began]`. Showing it to Shoppers is Story 2.21.

---

### Story 2.21: A Shopper sees discounts and charges honestly

As a Shopper,
I want a discount shown with the lowest price of the previous 30 days, and any shipping charge shown before checkout begins,
So that I can trust that the price is real and nothing is added later.

**Acceptance Criteria:**

**Given** a Design with an automatic discount in force
**When** it appears on a Design card, on the Design page or in the cart
**Then** the price now is shown with the lowest price of the previous 30 days beside it, both as whole rupees
**And** a discount is never shown without that lowest price

**Given** a discounted price that is not lower than the lowest price of the previous 30 days
**When** it is shown
**Then** no "percent off" figure and no crossed-out price are shown; only the price and the 30-day lowest price
**And** any "percent off" figure that is shown is supplied by the server, measured against the 30-day lowest price `[ASSUMPTION: the base of any "percent off" figure; FR-5 does not say]`

**Given** a discount with an end date
**When** it is shown
**Then** no countdown timer or "hurry" wording is shown (NFR-13)

**Given** a Shopper's cart
**When** she enters a discount code and it applies
**Then** the affected lines show the discounted price with the 30-day lowest price beside it, and the total updates
**And** she can remove the code, which restores the earlier total

**Given** a code that does not apply
**When** she enters it
**Then** she is told it cannot be used, in plain words, and the cart is unchanged

**Given** a cart with items
**When** the cart page is shown, before checkout begins
**Then** the shipping charge computed by the server is shown as its own whole-rupee line, with the total including it
**And** the charge comes from the `shipping charge rule` key of the `settings` module, which this story creates and seeds as a flat charge of Rs 0
**And** the total at the first checkout step equals the cart's total; no charge appears during checkout that was not shown in the cart

**Given** a price change or a discount ending while an item is in the cart
**When** she returns to the cart
**Then** the item is flagged and she must accept the change before payment begins, as built in Epic 1 (FR-19)

**Given** any price, total, tax or shipping amount on these pages
**When** it is shown
**Then** it is the server's figure formatted as whole rupees with no paise; the website adds, subtracts and rounds nothing (AD-5)

**Requirements:** FR-5, FR-58; AD-2, AD-5, AD-13; NFR-13
**Notes for the developer:**
- `apps/web` (Design cards, Design page, cart) and the cart functions in `packages/api-client`.
- This story creates the `shipping charge rule` key in the `settings` module (a flat charge and an optional Order value from which shipping is free), seeds it as a flat Rs 0, and has commerce set the amount of the kernel shipping option that Story 1.8 seeded from it (AD-13). Story 3.7 only makes the rule editable in the Admin (FR-56); it does not create the key again.
- The "flag a changed line and require acceptance" rule is Story 1.9's and is not built again here; this story only shows it.
- Styled from DESIGN.md when it exists.

---

### Story 2.22: The Design page is usable within 3 seconds on a phone

As a Shopper,
I want the Design page to be usable quickly on my phone on mobile data,
So that I can look at a saree without waiting.

**Acceptance Criteria:**

**Given** the Owner attaches a photo to a Design, a Variant or a Weaver
**When** the `attach-photo` workflow, created in this story, stores it
**Then** copies at several widths are made with sharp and stored in the `catalog` bucket
**And** every photo in a view model lists its available widths and addresses

**Given** photos attached before this story
**When** it is deployed
**Then** the same copies are made for them

**Given** a page that shows a photo
**When** it is rendered on a phone
**Then** the copy nearest to the size shown on that device is requested, never the original
**And** photos below the first screen are requested only as the Shopper approaches them

**Given** a Design page on staging with 6 photos, a ready full-length image and all attributes
**When** it is loaded in a test that emulates the spine's test profile: an Android phone with 4 GB of memory on a throttled 4G connection of 10 Mbit/s down with 100 ms delay
**Then** the first photo, the name, the price and a working "add to cart" control are present within 3 seconds, as the median of 5 runs
**And** the result and the emulation settings used are recorded in `docs/`

**Given** the Design page
**When** it loads
**Then** it does not wait for the Full saree view's tiles, for counts, or for anything not needed to show the first screen

**Given** the measurement is part of the checks that run before a deploy
**When** a change makes the median exceed 3 seconds
**Then** the check fails

**Given** the Designs page
**When** it is loaded under the same emulation
**Then** the first page of cards is shown within 3 seconds `[ASSUMPTION: the same target as the Design page]`

**Requirements:** NFR-1; AD-2, AD-8, AD-22; Consistency Conventions (Speed)
**Notes for the developer:**
- The copies are made by a job on the shop queue in `apps/worker` (name and payload added to `packages/contracts`, deterministic id, safe to run twice), enqueued by the `attach-photo` workflow. That workflow is created here in `apps/commerce/src/workflows`, and the Design, Variant and Weaver photo uploads of Stories 1.6, 2.1 and 2.4, which went straight through the kernel's file storage, are routed through it; `[ASSUMPTION: widths are 320, 640, 960, 1280 and 1920 pixels]`.
- Use Playwright, the end-to-end test runner from Story 1.27, with processor and network throttling for the measurement. The profile is the spine's (Consistency Conventions, "Test profiles") and is read from settings, not written into the test.
- The Android app's own measurement is Epic 6. A CDN is deferred by the spine.

## Epic 3: A complete shop: accounts, orders, returns and support

A Shopper signs in with a one-time code, checks delivery to her pincode, follows her Order, cancels or returns it, rates whether it matched, is told about every step, and can use her privacy rights. The Owner runs Orders, Returns, refunds, complaints and shop settings from the Admin.

**FRs covered:** FR-16 (complete), FR-17, FR-21 (complete), FR-22, FR-23 (complete), FR-26, FR-27, FR-28, FR-29, FR-47 (complete), FR-48 (complete), FR-49, FR-53, FR-54, FR-56, FR-59
**NFRs:** NFR-5, NFR-6, NFR-13

**Starting point.** Epic 1 left a working prepaid purchase (Hold, `confirm-payment`, invoice, basic Order states, shipping label and tracking, a basic Return with inspection, refund and credit note, admin sign-in with second factor, the route allow-list). Epic 1 also stood up `apps/content` behind its access gate, with admin accounts and an audit collection only (Story 1.23). Epic 2 left the full catalogue. This epic gives the content application its first documents and message templates and completes the shop around those parts. Try-on does not exist yet; where a story touches consent or erasure it says what Epic 4 adds to the same code.

**Conventions for every story in this epic.** Every new route, job payload, state and error code is first a zod schema in `packages/contracts` (AD-19). Every state change is a named workflow with tests for success, each failure and compensation (AD-4). Every state-changing Shopper request carries an `Idempotency-Key`. Shop routes change additively only (AD-27). No Shopper-facing text is in code: documents and message templates come from content, interface text from the translation bundles that content holds and commerce serves (Story 3.4) with the clients' built-in files as the fallback, and Design and Weaver text from commerce (AD-28). Wherever a story says the Owner is alerted, it enqueues a `message.send` job with the generic `owner.alert` template seeded in Story 3.5. Shopper-facing screens are described by behaviour only and are styled from DESIGN.md when it exists.

---

### Story 3.1: Extend the content application: service calls to commerce and an audit trail on every document

As an Owner,
I want the content admin that Epic 1 stood up to talk to the shop safely and to record every change I make to any document,
So that notices, policies and message texts have one home and no edit to them goes untraced.

**Acceptance Criteria:**

**Given** the content application of Story 1.23, already running on its own `content` database behind the access gate, with admin accounts, the lockout rule and an append-only audit collection
**When** this story is complete
**Then** nothing of Story 1.23 has been built again: the same application, database, gate and audit collection are extended
**And** content's configuration comes from environment variables checked at start against a zod schema; a missing variable stops the container with a message naming the variable
**And** it still has no connection string for the `commerce` database, and a test fails the build if one is configured (AD-1, AD-3)

**Given** a browser outside the private network
**When** it requests anything of content through Caddy
**Then** only the admin path is routed, and only past the access gate of Story 1.23; content's data API is reachable only on the private network

**Given** commerce or the worker calls content, or content calls commerce
**When** the call carries no service token or a wrong one
**Then** it is refused with the error envelope `{ code, message }`
**And** `/internal/*` on commerce accepts only a service token and is not routed by Caddy; each `/internal/*` route either starts a workflow or is a read-only lookup (AD-9)
**And** a Shopper token or a commerce admin session is never accepted by content (AD-15)

**Given** commerce needs a document or a message template from content
**When** it reads one
**Then** it does so through one read-only content reader in commerce, over the private network with a service token; no client and no worker job calls content directly (AD-2, AD-26)

**Given** the Owner creates, changes, publishes or deletes any content document, in any collection added from this story on
**When** the change is saved
**Then** one event is appended to content's audit collection with actor (the admin's email), time, action, before and after, in the same shape as a `shop-audit` event defined in `packages/contracts`, by one rule shared by every collection
**And** a test fails the build if a collection is added without that rule
**And** no user, including the Owner, can update or delete an audit event through the admin or the API; a test proves both are refused (AD-14)

**Given** a document collection that carries numbered versions
**When** it is defined
**Then** it uses one shared versioning helper created here: a draft, an integer version, a published time, and published versions that can no longer be edited; Story 3.2 gives it its first documents

**Requirements:** FR-59 (foundation), NFR-5, AD-1, AD-2, AD-3, AD-9, AD-14, AD-15, AD-16, AD-19
**Notes for the developer:**
- Builds on Story 1.23. Touches `apps/content` (environment check, the shared audit rule, the versioning helper, the service-token check), `apps/commerce` (the content reader, the service-token check on `/internal/*` if Story 1.14 left it for the worker only), `infra/` (Caddy routes only the admin path), `packages/contracts` (audit event shape, service-token header).
- The gate, the lockout and the second-factor outcome of spike item 7 are as Story 1.23 left them; keep the gate configurable. Gate credentials are environment variables.
- No document, template or screen collection is created here. They come in the stories that first need them (documents in Story 3.2, templates in Story 3.5, screens in Epic 5).
- Use the versions in the spine's Stack table; do not add a scheduler to content (AD-4, AD-12).

---

### Story 3.2: Notices, terms, policies and disclosures as numbered versions with translations

As an Owner,
I want to edit each legal document and its translations as numbered versions and publish them myself,
So that I can correct a policy or add a language without a release and always know which version a Shopper saw.

**Acceptance Criteria:**

**Given** the content admin
**When** the Owner opens the documents section
**Then** these document types exist: Try-on consent notice, terms of use, privacy policy, returns, refunds and cancellation policy, shipping policy, grievance redressal, and one disclosures record (legal name, registered address, GSTIN, support email, grievance officer name, email and phone, website address, jurisdiction city, helpline contact)
**And** each document has a draft, an integer version shared by all its translations, a published time, and one text per language, with English required

**Given** a draft whose meaning has changed
**When** the Owner publishes it as a new version
**Then** the version number rises by exactly one, the published text of every language is stored unchanged from then on, and earlier versions stay readable
**And** an attempt to edit a published version is refused; the Owner must start a new draft

**Given** a published version
**When** the Owner corrects or adds a translation and publishes it as a translation fix
**Then** the version number does not change, the fix is recorded in the audit collection with before and after, and the English text cannot be changed this way (AD-11)

**Given** a document text that contains a placeholder such as `{{LEGAL_ENTITY_NAME}}` or `{{RETURN_WINDOW_DAYS}}`
**When** the Owner publishes it
**Then** each placeholder is replaced from the published disclosures record or from the value commerce returns for a named setting, and the replaced text is what is stored for that version
**And** publishing is refused, naming the placeholders, while any placeholder has no value

**Given** a Try-on consent notice draft
**When** the Owner publishes a new version
**Then** it must carry a list of AI-service ids, and content calls `/internal/content/notice-published` on commerce with document key, version, service ids, time and the email of the content admin who published it
**And** commerce stores that record through the `record-notice-version` workflow, idempotent on key and version, which also writes a `shop-audit` event with that email as the actor; if the call fails, the publish is not shown as complete, the previous version stays the published one, and the Owner sees that commerce was not told and can retry

**Given** any other document type is published
**When** publishing completes
**Then** content tells commerce the key, version and time through `/internal/content/document-published`, and commerce records the latest published version of each document

**Given** content needs the list of configured languages to show one text field per language
**When** a document form is built
**Then** content reads the list from `/internal/settings/languages` on commerce, a read-only lookup created in this story and called with the service token (AD-9); the list is the `settings` value of Story 2.13 and content keeps no list of its own

**Given** commerce asks content for a document by key, language and optional version
**When** that language has no text
**Then** the English text of the same version is returned with the language actually served

**Requirements:** FR-59, NFR-14, AD-3, AD-9, AD-11, AD-13, AD-14
**Notes for the developer:**
- Touches `apps/content` (document collections, publish hooks), `apps/commerce` (`internal/content/*` routes, the `internal/settings/languages` lookup, the `record-notice-version` workflow that records notice versions in the `consent` module, which this story creates, and a workflow that records other documents' published versions in the `settings` module), `packages/contracts`.
- The rule "a new notice version makes every Shopper accept again before her next Try-on" is enforced by Epic 4's consent check against the record stored here; this story only stores it. Story 4.1 adds the retention period to the notice and the Shopper's read of it; it does not build the publish path again.
- No Shopper-facing page yet; that is Story 3.3. No message templates yet; that is Story 3.5.

---

### Story 3.3: Load the draft legal documents and show them, with the required disclosures, on the website

As a Shopper,
I want to read who I am buying from, how to complain, and the terms and policies, from any page,
So that I can trust the shop before I give it my number or my money.

**Acceptance Criteria:**

**Given** a fresh local or staging environment
**When** the content seed runs
**Then** the six drafts in `docs/legal/` (terms of use, privacy policy, Try-on consent notice, returns, refunds and cancellation policy, shipping policy, grievance redressal) are loaded as version 1 drafts in English, with their placeholders intact, and the disclosures record is created with the fields the 14 placeholders need
**And** running the seed twice creates nothing twice, and the seed never overwrites a document the Owner has edited

**Given** local or staging with the seed's sample disclosure values
**When** the seed is run with its publish option
**Then** version 1 of each document is published through the same publish path as Story 3.2
**And** in production the seed never publishes; the documents stay drafts marked "not yet reviewed by a lawyer" until the Owner publishes them

**Given** any website page
**When** a Shopper looks at the footer
**Then** she sees the shop's legal name, registered address, support contact, the grievance officer's name and contact, and links to the privacy policy, terms of use, returns policy, shipping policy and grievance page, all taken from the published disclosures and documents (FR-29)
**And** none of these values or texts is in website code, and the product name appears only in content and settings (AD-20)

**Given** a Shopper who is not signed in
**When** she opens a document link
**Then** `GET /store/shop/documents/{key}` returns the latest published version as a view model with title, text, version, published date and the language served, and the page shows the version and date
**And** a key with no published version returns `document.not_published` and the page says the document is not available, with the support contact

**Given** a Shopper whose language is Tamil and a document with no Tamil text
**When** she opens it
**Then** she sees the English text

**Given** the website
**When** any page is built or rendered
**Then** it reads documents and disclosures only through `packages/api-client`, never from content directly (AD-2)

**Requirements:** FR-29, FR-59, NFR-12, NFR-14, AD-2, AD-12 (commerce reads content), AD-20
**Notes for the developer:**
- Touches `apps/content` (seed script reading `docs/legal/*.md`), `apps/commerce` (`store/shop/documents`, `store/shop/disclosures`, both using the content reader of Story 3.1), `packages/api-client`, `apps/web` (footer, document page).
- A published version never changes, so commerce may cache a document by key, version and language.
- The Try-on consent notice is loaded and can be published, but nothing shows it to Shoppers until Epic 4.
- `{{AI_SERVICE_LIST}}` stays unfilled until the Approved-model list exists (Epic 4), so the notice and privacy policy seed values for it are sample text in local and staging only.
- Styled from DESIGN.md when it exists.

---

### Story 3.4: Interface wording as translation bundles the Owner changes without a release

As an Owner,
I want the website's own wording held as one bundle per language that I can edit and publish,
So that I can correct or translate any text a Shopper reads without a release.

**Acceptance Criteria:**

**Given** the content admin
**When** the Owner opens Interface translations
**Then** there is one translation bundle per configured language, the list read from the `/internal/settings/languages` lookup of Story 3.2, each holding a text for every interface text key
**And** each bundle uses the versioning helper of Story 3.1 (a draft, an integer version, a published time, published versions that cannot be edited), and every change is audited by the shared rule of Story 3.1 (AD-14)

**Given** a fresh environment
**When** the content seed runs
**Then** the English and Tamil bundles are loaded as version 1 from the website's built-in translation files (Stories 1.2 and 2.13), and on local and staging they are published
**And** running the seed twice creates nothing twice, and the seed never overwrites a bundle the Owner has edited
**And** a test fails if a key in the built-in English file is missing from the seeded English bundle

**Given** the Owner publishes a bundle
**When** publishing completes
**Then** its version rises by exactly one and content tells commerce the language, version and time through `/internal/content/document-published`, the route of Story 3.2; commerce records the latest published version for each language
**And** a text that drops a named placeholder which the English text carries is refused at publish, naming the key

**Given** a client asks for `GET /store/shop/translations/{language}`, signed in or not
**When** commerce answers
**Then** it returns the published bundle's version and texts as a view model defined in `packages/contracts`, read through the content reader of Story 3.1; no client calls content (AD-2)
**And** a client that sends the version it already holds receives a "not changed" answer without the texts
**And** a language that is not configured is refused with `translation.language_not_configured`, and a language with no published bundle answers `translation.not_published`

**Given** the website
**When** a page looks up a text key
**Then** the one lookup function of Story 2.14 takes the text from the cached bundle fetched through `getTranslations` in `packages/api-client`; if the bundle lacks the key it takes it from the built-in file for that language, and then from the built-in English file; a key is never shown in place of text (AD-28)
**And** the website asks commerce for a newer bundle version at most once every 5 minutes `[ASSUMPTION: the 5-minute interval; AD-28 says only that each client caches the bundle]`

**Given** the Owner changes one text in the Tamil bundle and publishes it
**When** a Shopper loads a page in Tamil after the next version check
**Then** she sees the new wording, with no deploy of the website and no restart; an automated test proves it on the local stack (NFR-14)

**Given** commerce or content cannot be reached, or no bundle has been published
**When** a page is rendered
**Then** the website uses its built-in copy and no page fails or waits on the bundle

**Given** a bundle text that contains markup or script
**When** a client shows it
**Then** it is shown as plain text; a bundle carries text only, never code

**Requirements:** NFR-14, FR-59 (translations); AD-2, AD-9, AD-14, AD-27, AD-28
**Notes for the developer:**
- Touches `apps/content` (the translation-bundle collection and its seed), `apps/commerce` (`store/shop/translations/{language}`, the recorded bundle versions in the `settings` module), `packages/contracts` (the bundle view model and the two error codes), `packages/api-client` (`getTranslations`), `apps/web` (the lookup function of Story 2.14).
- AD-28: interface text is a translation bundle per language, held in content and served through commerce; each client caches it and carries a built-in copy as a fallback. The built-in files stay in the repository and stay complete; they are what a client uses before its first fetch.
- The labels of the fixed colour list are keys in the bundle. Documents and message templates are not part of it; they keep their own collections (Stories 3.2 and 3.5). Design and Weaver text stays in commerce (Story 2.13).
- The Android app uses the same route and `getTranslations` with its own built-in copy; that is Story 6.3.
- Styled from DESIGN.md when it exists; the bundle changes words, never layout.

---

### Story 3.5: One way to send a message, with templates from content

As an Owner,
I want every SMS and email to be sent by one job from a text I can edit,
So that message wording never needs a release and nothing is sent twice.

**Acceptance Criteria:**

**Given** the content admin
**When** the Owner opens message templates
**Then** each template has a key, a channel (SMS or email), a purpose, a subject for email, a body with named variables, and one text per language with English required
**And** a template change is audited as in Story 3.1, and the seed creates the template `auth.sign-in-code` for SMS and one generic template `owner.alert` for each of SMS and email, with the purpose `owner-alert` and variables for what happened and where in the Admin to look

**Given** a commerce workflow, or the kernel's notification provider, needs to send a message
**When** it does so
**Then** it only enqueues a `message.send` job on the shop queue with template key, language, variables, channel and recipient reference, whose job id is the event id plus the channel (AD-26, AD-8)
**And** enqueuing the same event and channel twice results in one job and one message

**Given** the worker takes a `message.send` job
**When** it runs
**Then** it fetches the template through commerce (never from content directly), fills the variables, and sends through the SMS or email adapter in `apps/worker/src/providers`
**And** a missing variable or missing template fails the job without sending, and the failure is reported with the template key but no variable values

**Given** the adapter returns a temporary failure
**When** the job retries
**Then** it retries with back-off up to the configured number of attempts and the recipient receives at most one message
**And** the final outcome (sent or failed, time, channel, template key) is reported to `/internal/messages/outcome` and recorded against the kernel's notification record without the body, the variables or the recipient's number in any log or job result

**Given** a template whose purpose is not `transactional` or `owner-alert`
**When** a job names it
**Then** the job is refused with `message.purpose_not_allowed`, so that no marketing message can be sent (FR-54)

**Given** local, staging or continuous integration
**When** the SMS or email adapter runs in test mode
**Then** nothing leaves the system and the message is held in a test sink that tests can read
**And** each test-mode adapter has a test of its interface that runs before a deploy; the contract tests against the real vendors' test modes (NFR-11) are Story 3.6

**Requirements:** FR-54 (foundation), FR-59, NFR-11, AD-8, AD-9, AD-26
**Notes for the developer:**
- Touches `apps/content` (templates collection), `apps/commerce` (`providers/notification`, `internal/messages/*`, template read route for the worker), `apps/worker` (`jobs/message.send`, `providers/sms`, `providers/email`), `packages/contracts` (job payload, template keys).
- SMS and email vendors are undecided: write the `SmsSender` and `EmailSender` interfaces and a test-mode adapter for each here; the real vendor adapters and their contract tests are Story 3.6.
- Only the sign-in code template and the generic `owner.alert` template are created here. Every later story that alerts the Owner uses `owner.alert`, so no alert can fail for a missing template. Order, Return, refund and complaint templates are created by the stories that raise those events.
- Epic 1 sent no messages; it only recorded events such as `payment.auto-refunded`. Story 3.20 attaches messages to them.

---

### Story 3.6: Real SMS and email adapters, tested against each vendor's test mode

As a Shopper,
I want my sign-in code and my Order messages to really reach my phone and my inbox,
So that I can sign in and follow my Order once the shop is live.

**Acceptance Criteria:**

**Given** the spine leaves the SMS and email vendors undecided
**When** this story starts
**Then** it proceeds only if the founder has named both vendors and given test-mode credentials for each
**And** if either is missing, the developer stops and reports; no vendor is chosen by the developer

**Given** the `SmsSender` and `EmailSender` interfaces of Story 3.5
**When** this story is finished
**Then** one adapter per vendor in `apps/worker/src/providers` implements each interface, selected by an environment variable, and the test-mode adapters of Story 3.5 stay the default locally and in continuous integration
**And** no vendor-specific code exists outside those adapters, and no cloud vendor's SDK is added (AD-16)

**Given** the SMS adapter
**When** its contract tests run against the SMS vendor's test mode
**Then** sending a message is accepted, an invalid number is reported as a permanent failure, and a rate-limit or server error is reported as a temporary failure that the retry of Story 3.5 handles
**And** the tests are part of the checks run before a release (NFR-11)

**Given** the email adapter
**When** its contract tests run against the email vendor's test mode
**Then** sending a message with a subject and body, and sending one with a file attached, are accepted, and permanent and temporary failures are told apart in the same way
**And** the tests are part of the checks run before a release (NFR-11)

**Given** staging with both real adapters selected and the vendors in test mode
**When** a Shopper asks for a sign-in code
**Then** the `message.send` job goes through the real SMS adapter and its outcome is reported to `/internal/messages/outcome`
**And** where the vendor's test mode delivers to a registered number, the code arrives on the founder's own phone

**Given** a `message.send` job retried after the vendor accepted the message
**When** the adapter sends again
**Then** it passes the job id as the vendor's own reference or idempotency key where the vendor offers one, so the recipient gets one message; where the vendor offers none, that limit is written in `docs/`

**Given** the vendor refuses a message because the sender or the template is not registered
**When** the job ends
**Then** it fails with the reason `message.sender_not_registered`, reported with the template key and without the body, the variables or the recipient

**Given** `docs/`
**When** this story is finished
**Then** it records, for each vendor: the sender id, the registration each SMS template needs with the operator registry, the sending domain and its DNS records for email, every secret by name, and which of these steps the Owner must do herself and which are done `[ASSUMPTION: transactional SMS in India needs sender and template registration; confirm with the vendor]`

**Given** the worker's logs and job results
**When** they are searched after the contract tests
**Then** no mobile number, email address, code or message body appears in them

**Requirements:** FR-26, FR-54, NFR-11; AD-16, AD-26; Consistency Conventions (Vendors, Config and secrets)
**Notes for the developer:**
- Touches `apps/worker/src/providers/sms` and `providers/email` (one real adapter each), the worker's environment schema, continuous-integration configuration (the contract tests), `infra/` and `docs/`.
- Without this story no sign-in code can be sent in production, so checkout, order history and Try-on would be unreachable there. Story 7.15 only switches these adapters from the vendors' test credentials to the approved live sender; it builds no adapter.
- The adapters receive text already filled from the template by the `message.send` job; they hold no wording.
- The developer agent can close every criterion except the registrations the vendors require of the account holder; hand the story back with those listed in `docs/` as outstanding for the Owner.

---

### Story 3.7: Shop settings with effective dates

As an Owner,
I want to set the delivery region, the shipping charge rule, the return period and conditions and the Try-on limits in the Admin,
So that a business or legal decision changes a setting, not the software.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin with a second factor
**When** the Owner opens Shop settings
**Then** the page shows, each with its current value and effective date: delivery region; shipping charge rule; return period in days; return conditions; Try-on limit per Shopper per day; sign-in code rules; working days and the list of holidays; dispatch time in working days; the Owner's alert email and mobile number; business time zone
**And** on a fresh environment the values are: delivery region Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana and Puducherry; return period 7 days; Try-on limit 10 per day; code expiry 5 minutes; 3 codes per number in 10 minutes; working days Monday to Saturday with no holidays listed

**Given** the working days and holidays
**When** any deadline in working days is worked out
**Then** a working day is Monday to Saturday in the business time zone, excluding the holidays listed in settings, and one function in `packages/contracts` does the counting for every caller

**Given** the delivery region setting
**When** the Owner edits it
**Then** it accepts a list of states and territories, a list of six-digit pincodes to add, and a list of six-digit pincodes to exclude
**And** a pincode that is not six digits is refused with the field named

**Given** the shipping charge rule
**When** the Owner edits it
**Then** it accepts a flat charge and an optional Order value from which shipping is free, both in whole rupees and stored as integer paise that are multiples of 100 (AD-5)

**Given** the return conditions
**When** the Owner edits them
**Then** the Owner can add or remove other return reasons and set a return shipping charge for them in whole rupees
**And** "Not as shown" and "Defective or wrong item" cannot be removed, renamed in meaning or given a charge; an attempt is refused with `settings.always_accepted_reason` (FR-23)

**Given** the Owner saves a change with an effective date of today or later
**When** that date begins in the business time zone
**Then** every read of the setting returns the new value without a release, and before that date returns the old one
**And** a change dated in the past is refused

**Given** any saved change
**When** it is stored
**Then** it runs as the workflow `update-setting`, keeps the earlier values as history, and records a `shop-audit` event with the Owner's email, time, before and after (FR-56, AD-14)
**And** the page shows the history of each setting

**Given** code anywhere in commerce needs one of these values
**When** it reads it
**Then** it reads the settings module as of the present time; a test searches the code for the literal defaults and fails if one is hardcoded outside the seed (AD-13)

**Requirements:** FR-56, NFR-10, AD-4, AD-13, AD-14, AD-20
**Notes for the developer:**
- Touches the `settings` module in `apps/commerce` (add these keys to the dated-settings mechanism Epics 1–2 used for Hold length, tax bands and working days; create only the keys that do not exist yet: the shipping charge rule was created and seeded by Story 2.21 and the language list by Story 2.13, and this story makes them editable), `src/admin` (settings page), `packages/contracts` (setting schemas, the working-day function).
- Working days follow the spine's Consistency Conventions; Story 1.20 seeded them and this story makes them editable. `[ASSUMPTION: a dispatch time of 2 working days, used for delivery dates; the PRD gives none]`.
- The Try-on limit is stored and audited here; Epic 4 enforces it and adds the daily spending cap.
- The settings are consumed in later stories: region and charge in Story 3.11, return period and conditions in Story 3.15, code rules in Story 3.8.
- `update-setting` is the workflow for every dated setting. A later setting reuses it unless its story names a workflow of its own because the change needs extra checks, as tax bands do (Story 2.5).

---

### Story 3.8: Sign in with a mobile number and a one-time code

As a Shopper,
I want to sign in with my mobile number and a code sent to it,
So that I can check out and see my Orders without remembering a password.

**Acceptance Criteria:**

**Given** a Shopper who is not signed in
**When** she browses, searches, opens a Design, opens the Full saree view or adds a Piece to her cart
**Then** she is never asked to sign in (FR-26, NFR-13)
**And** when she begins checkout or opens order history she is asked to sign in, and after signing in she is returned to where she was with her cart unchanged

**Given** she enters a valid Indian mobile number
**When** she asks for a code
**Then** a code is created, stored only as a hash, and sent as a `message.send` job with the template `auth.sign-in-code` (AD-26)
**And** the response is the same whether or not an account exists for that number
**And** a number that is not a valid mobile number is refused with `auth.mobile_invalid` and no message is sent

**Given** 3 codes have been sent to a number within 10 minutes
**When** a fourth is requested
**Then** it is refused with `auth.too_many_codes` and the time she can try again, and no message is sent
**And** the limits are read from settings, enforced in commerce middleware

**Given** a code was sent less than 5 minutes ago
**When** she enters it correctly
**Then** she is signed in through the kernel's customer auth with the one-time-code provider, and a Shopper account is created if the number is new
**And** the code cannot be used again

**Given** a code was sent 5 minutes ago or more
**When** she enters it
**Then** it is refused with `auth.code_expired` and she is offered a new code

**Given** a live code
**When** she enters a wrong code
**Then** it is refused with `auth.code_invalid`; after the number of wrong attempts set in settings the code is cancelled and she must ask for a new one
**And** asking for a new code cancels the earlier one

**Given** a Shopper whose requests carry her language (Story 2.14)
**When** her code is verified
**Then** the workflow `save-shopper-language` saves that language on her Shopper account, and every later message to her is enqueued with it; the sign-in code itself is sent in the language of the request that asked for it
**And** when a signed-in Shopper changes language with the control of Story 2.14, the control calls the same workflow through `packages/api-client`; a language that is not configured is refused

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (it no longer signs a Shopper up with an email and a password; it signs her in with a one-time code read from the SMS adapter's test sink) and passes, so that deploys are not blocked

**Given** a signed-in Shopper's token
**When** it is sent to an admin route, an `/internal/*` route or the content admin
**Then** it is refused; and an admin session or service token is refused by Shopper routes (AD-15)

**Given** the whole sign-in flow has run in a test
**When** the logs, job results and error reports are searched
**Then** neither the code nor the full mobile number appears in any of them

**Given** a signed-in Shopper
**When** she signs out
**Then** her session ends on that device and her cart stays with her account

**Requirements:** FR-26, FR-54 (sign-in code), NFR-13, AD-13, AD-15, AD-19, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`providers/one-time-code`, rate-limit middleware, `store/shop/auth/*`, the `save-shopper-language` workflow and the language on the Shopper account), `packages/api-client`, `apps/web` (sign-in step, the language control of Story 2.14), and the end-to-end test of Story 1.27.
- Replaces the email-and-password customer sign-in of Story 1.2 behind the same `api-client` functions and removes its sign-up page; `begin-checkout` already requires a signed-in Shopper.
- The reviewer account with a fixed sign-in code (spine, Consistency Conventions: App-store review) is added to this provider by Story 7.13; leave one place in the verification step where it can be checked.
- An anonymous cart is attached to the account at sign-in when the account has no cart; merging two carts is Story 3.10. Terms acceptance is Story 3.9.
- Test through the SMS adapter's test sink. Styled from DESIGN.md when it exists.

---

### Story 3.9: Accept the terms at first sign-in, change mobile number, give an email

As a Shopper,
I want to accept the terms once, clearly, and keep my contact details right,
So that I know what I agreed to and my invoices and messages reach me.

**Acceptance Criteria:**

**Given** a Shopper signing in for the first time
**When** her code is verified
**Then** she is shown one step that links to the terms of use and the privacy policy and asks her to accept both by her own action; nothing is pre-ticked (NFR-13)
**And** this step does not mention or include Try-on consent (FR-8 is separate)

**Given** she accepts
**When** the acceptance is stored
**Then** the workflow `record-terms-acceptance` writes two records of the `consent` module, one for the terms of use and one for the privacy policy, each holding the Shopper, the document type, the version, the language shown and the time (AD-31)
**And** she continues to where she was going

**Given** she has not accepted
**When** she calls checkout or order-history routes
**Then** they return `terms.acceptance_required`
**And** if she declines or leaves, she is signed out and is asked again at her next sign-in; browsing still works

**Given** no terms of use or privacy policy version is published
**When** a new Shopper reaches the acceptance step
**Then** she is told sign-in is not available right now, no acceptance is recorded, and the Owner is alerted by a `message.send` job

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (its Shopper accepts the terms of use and the privacy policy at first sign-in, with version 1 of both published by the seed of Story 3.3) and passes, so that deploys are not blocked

**Given** a Shopper who accepted version 1
**When** she signs in again
**Then** she is not asked again, and her record still shows version 1

**Given** a signed-in Shopper who wants to change her mobile number
**When** she enters the new number
**Then** a code is sent to the new number under the same limits as Story 3.8, and the number changes only when she enters that code correctly within 5 minutes
**And** if the new number already belongs to another account the change is refused with `auth.mobile_in_use` after the code is verified, and nothing changes
**And** on success a message goes to the old number saying the number on the account was changed, and her Orders and cart stay with her

**Given** a Shopper at checkout
**When** she reaches the contact step
**Then** she is asked for an email address so the invoice can be sent, she can leave it empty and continue, and nothing about the email is pre-filled or pre-ticked
**And** an address that is not a valid email is refused with the field named; a valid one is saved on her account by a workflow and can be changed or removed from her account page

**Requirements:** FR-26, FR-29, NFR-13, AD-4, AD-11 (versions), AD-15, AD-26, AD-31
**Notes for the developer:**
- Touches the `consent` module in `apps/commerce` (the acceptance record with document type, version, language and time; Story 3.2 already keeps notice versions in this module, and Epic 4 records Try-on consent as the same kind of record), `store/shop/account/*`, `packages/api-client`, `apps/web` (acceptance step, account page, checkout contact step).
- Acceptances of terms, policies and the Try-on consent notice all live in the `consent` module (AD-31).
- The PRD asks for acceptance at first sign-in only; asking again when a new terms version is published is not built.
- Adds the template `account.mobile-changed`. Styled from DESIGN.md when it exists.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.10: One cart on every device

As a Shopper,
I want my cart to be the same on my phone and my laptop once I sign in,
So that I can choose on one and pay on the other.

**Acceptance Criteria:**

**Given** a Shopper who is not signed in and has Pieces in her cart
**When** she closes the browser and opens the website again on the same device
**Then** her cart has the same Variants and quantities (FR-16)

**Given** a signed-in Shopper with a cart
**When** she signs in on a second device
**Then** she sees the same cart, and a change made on one device is shown on the other the next time the cart is loaded

**Given** she has an anonymous cart on this device and her account already has a cart
**When** she signs in
**Then** the workflow `merge-cart` leaves her one cart: quantities of the same Variant are added, and each quantity is cut to the Pieces available
**And** she is told which quantities were cut, and the anonymous cart no longer exists
**And** running the merge twice gives the same cart

**Given** her account's cart has a live Hold because a Checkout is in progress on another device
**When** she signs in on this device with an anonymous cart
**Then** the cart under Hold is not changed (AD-6); she is told a payment is in progress, and the anonymous items are merged once the Hold has ended
**And** any attempt to add, change or remove a line while the Hold is live returns `cart.locked`, the code Story 1.9 defined for this case

**Given** a Variant with 2 Pieces available
**When** she sets its quantity to 3
**Then** the request is refused with `cart.quantity_exceeds_stock` and the available number, and the cart keeps its earlier quantity

**Given** a Variant in her cart has sold out or changed price since she added it
**When** she opens the cart
**Then** the line is flagged with what changed, and she must accept the change or remove the line before payment can begin (FR-19)

**Given** she removes the last line
**When** the cart is loaded on any device
**Then** it is empty

**Requirements:** FR-16, FR-19, AD-2, AD-4, AD-6, AD-21
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/merge-cart`, `store/shop/cart` view model and the cart middlewares), `packages/api-client`, `apps/web` (cart).
- Cart line edits use the kernel cart routes already on the allow-list; add none without updating the list in `packages/contracts` (AD-21).
- Availability is stocked minus reserved, computed on the server; the client never computes it.
- Styled from DESIGN.md when it exists.

---

### Story 3.11: Delivery check by pincode, with dates and the shipping charge shown early

As a Shopper,
I want to enter my pincode and learn whether you deliver to me, when, and what shipping costs,
So that I do not reach payment and find out I cannot have the saree.

**Acceptance Criteria:**

**Given** a Shopper on a Design page or in her cart, signed in or not
**When** she enters a six-digit pincode inside the delivery region that the shipping service serves
**Then** `GET /store/shop/delivery-check` answers that Alar delivers there, with an earliest and a latest delivery date (FR-17)
**And** the dates are worked out on the server from today in the business time zone, the dispatch time in working days from settings, and the shipping adapter's shortest and longest transit time; the earliest date is never after the latest

**Given** a pincode whose state is not in the delivery region, or that is on the excluded list
**When** she checks it
**Then** the answer is `delivery.outside_region` with a clear message that Alar does not deliver there yet, and no dates

**Given** a pincode inside the region that the shipping service does not serve
**When** she checks it
**Then** the answer is `delivery.not_serviceable` with a clear message, and no dates

**Given** an entry that is not six digits
**When** she checks it
**Then** it is refused with `delivery.pincode_invalid` and the shipping adapter is not called

**Given** the shipping adapter fails or does not answer in time
**When** she checks a pincode
**Then** she is told the check is not available right now; she is never told "yes" without an answer from the adapter

**Given** her cart
**When** she views it before beginning checkout
**Then** the shipping charge from the shipping charge rule is shown as its own line with the total, in whole rupees, and "free" when the rule makes it free (FR-5, NFR-13)
**And** the total in the Checkout snapshot equals the total she was shown; a test fails if any charge appears in the snapshot that was not in the cart view

**Given** she begins checkout with a delivery address
**When** `begin-checkout` runs
**Then** it repeats the delivery check on the address pincode before it places a Hold, and refuses with the same error codes, so that no Hold is placed and no money is taken for an address Alar cannot deliver to
**And** the earliest and latest dates are saved in the Checkout snapshot and shown on the Order
**And** the snapshot also records the language of the Shopper's request, so that a message about this Checkout or its Order still has a language after her account is deleted

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (its delivery address has a pincode inside the delivery region that the shipping adapter's test mode serves, and it asserts that a pincode outside the region is refused before a Hold) and passes, so that deploys are not blocked

**Given** a change to the delivery region setting takes effect
**When** the same pincode is checked again
**Then** the answer follows the new region without a release

**Requirements:** FR-17, FR-5, FR-56, NFR-13, AD-2, AD-5, AD-13, AD-24 (shipping adapter)
**Notes for the developer:**
- Touches `apps/commerce` (`providers/shipping`: add `checkServiceability(pincode)` returning state, serviceable, and transit days; `store/shop/delivery-check`; `begin-checkout` step), `packages/api-client`, `apps/web` (Design page, cart, checkout).
- The shipping vendor is a setting: write against the adapter interface and its test mode with fixture pincodes; add a contract test (NFR-11).
- The shipping line in the cart was built by Story 2.21 and the charge rule made editable by Story 3.7; this story adds only the test that the snapshot total equals the cart total.
- The Design page's "delivery estimate" (FR-3) uses this route once a pincode has been entered and remembers the last pincode on the device.
- Tax on a shipping charge is an open question for the accountant; use the money functions in `packages/contracts` as they stand and do not compute tax anywhere else (AD-5).
- Styled from DESIGN.md when it exists.

---

### Story 3.12: All Order states, driven by the shipping service

As a Shopper,
I want my Order's state to move by itself as the parcel moves,
So that what I see is true without anyone at the shop typing it in.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is complete
**Then** the Order state enum and transition table that Story 1.10 created are extended, not created again, so that the enum holds exactly Paid, Packed, Dispatched, Out for delivery, Delivered, Delivery failed, Returned to shop, Cancelled, Refunded, with one table of allowed transitions: Paid→Packed; Paid→Cancelled; Packed→Dispatched; Packed→Cancelled; Dispatched→Out for delivery; Dispatched→Delivery failed; Out for delivery→Delivered; Out for delivery→Delivery failed; Delivery failed→Out for delivery; Delivery failed→Returned to shop; Cancelled→Refunded; Returned to shop→Refunded; and Dispatched, Out for delivery, Delivery failed or Delivered→Refunded. Every transition into Refunded happens only when the total refunded for the Order equals the total paid; any smaller refund is recorded against the Order or its Return and the Order keeps its state (AD-24, AD-31)
**And** one workflow performs each transition, refuses any transition not in the table with `order.transition_not_allowed`, and writes a state-history row with the time and the cause

**Given** an Order in Dispatched
**When** the shipping service's webhook reports out for delivery, then delivered
**Then** the Order moves to Out for delivery, then Delivered, without any Owner action (FR-21)
**And** the delivered time is stored on the Order

**Given** a webhook from the shipping service
**When** its signature or token cannot be verified
**Then** it is refused and nothing changes
**And** a verified event received twice changes the state once (idempotent on the shipping service's event id)

**Given** events arrive out of order, or an event maps to a transition the table does not allow
**When** the event is handled
**Then** the Order state is unchanged, the event is stored against the shipment, and no error is returned to the shipping service

**Given** the shipping service reports an event type that is not in the adapter's mapping table
**When** it is handled
**Then** it is stored, the Owner is alerted once per event type per day, and no state changes

**Given** a failed delivery attempt
**When** the event is handled
**Then** the Order moves to Delivery failed and stores what happens next: the date of the next attempt when the shipping service gives one, or that the parcel is coming back to the shop

**Given** the shipping service reports the parcel returned to the shop
**When** the event is handled
**Then** the Order moves to Returned to shop and the workflow `refund-undeliverable-order` refunds the full amount paid, including any shipping charge, to the payment method used, creates a credit note linked to the invoice, and moves the Order to Refunded when the refund is started
**And** if the payment service refuses the refund, the Order stays Returned to shop, the Owner is alerted, and a retry does not refund twice
**And** the Pieces are not added back to available stock by this workflow (FR-25)

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (it runs against the extended transition table, and a second run asserts that a parcel reported back at the shop ends in Returned to shop, then Refunded, with one refund of the whole amount paid) and passes, so that deploys are not blocked

**Given** the only table that maps shipping events to transitions
**When** the code is searched
**Then** it is in the shipping adapter and nowhere else, and clients receive the state from the server and never derive it

**Requirements:** FR-21, FR-24, FR-25, AD-4, AD-6, AD-7, AD-24, AD-25
**Notes for the developer:**
- Touches `packages/contracts` (states, transition table, events), `apps/commerce` (`order-state` module, transition workflows, `providers/shipping` event mapping, `api/webhooks/shipping`).
- Extends the states of Story 1.10 and the transition workflows and shipping mapping table of Stories 1.15, 1.16 and 1.17; migrate existing Orders without changing their state.
- `refund-undeliverable-order` reuses the refund-to-source and credit-note steps of `refund-order` (Story 1.20). It replaces Story 1.21's rule that an Order in Returned to shop is refunded when the Owner records its inspection: the refund now starts from the shipping event, and inspection governs only restocking (Story 3.17).
- Test with the adapter's test mode and recorded events. Paid→Packed, Packed→Dispatched and the two Cancelled transitions are exercised from the Shopper side in Story 3.14 and from the Admin in Story 3.17; inspection of undelivered Pieces is in Story 3.17.
- Messages for these events are added in Story 3.20; raise the events (`order.dispatched`, `order.delivered` and so on) here.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.13: Order history and tracking for the Shopper

As a Shopper,
I want to see all my Orders and exactly where each one is,
So that I do not have to call anyone to find out.

**Acceptance Criteria:**

**Given** a signed-in Shopper who has accepted the terms
**When** she opens order history
**Then** she sees her Orders, newest first, each with Order number, date, total in whole rupees, the Designs bought and the current state named exactly as in the Glossary
**And** a Shopper who is not signed in is asked to sign in; a Shopper can never read another Shopper's Order (a request for one returns `order.not_found`)

**Given** she opens one Order
**When** the page loads
**Then** she sees every state the Order has been through with its time shown in the business time zone, the expected delivery dates from the Checkout snapshot, the delivery address, the shipping service's tracking number and link once a label exists, each line with its price, the shipping charge, and the total
**And** she can download the tax invoice through a signed link valid for at most 10 minutes; the link is created on request and never stored in the page (AD-22)

**Given** an Order in Delivery failed
**When** she opens it
**Then** she sees what happens next: the next attempt date, or that the parcel is returning to the shop and she will be refunded in full

**Given** an Order in Returned to shop, Cancelled or Refunded
**When** she opens it
**Then** she sees the refund amount and when the refund was started, or that it has not started yet (FR-24)

**Given** the shipping service changes the Order's state while she has the page open
**When** she reloads or returns to the page
**Then** the new state is shown; the page never works out a state from tracking events itself

**Given** a Shopper with no Orders
**When** she opens order history
**Then** she sees that she has no Orders yet and a way back to the Designs

**Given** the largest system font size or a screen reader
**When** she uses these pages
**Then** every action has a label and no text is cut off (NFR-15)

**Requirements:** FR-21, FR-20 (invoice download), FR-24, AD-2, AD-19, AD-22, AD-24
**Notes for the developer:**
- Touches `apps/commerce` (`store/shop/orders`, `store/shop/orders/{id}`, invoice link route), `packages/contracts` (Order view models), `packages/api-client`, `apps/web` (order history, Order page).
- Reading her own Orders is not an admin read, so no access event is written here.
- The buttons to cancel, return and rate are added by Stories 3.14, 3.15 and 3.21; leave their places empty.
- Styled from DESIGN.md when it exists.

---

### Story 3.14: Cancel an Order before dispatch

As a Shopper,
I want to cancel an Order that has not left the shop and get all my money back,
So that a change of mind costs me nothing.

**Acceptance Criteria:**

**Given** her Order is Paid or Packed
**When** she opens it
**Then** she can cancel it, and before she confirms she is told she will be refunded in full to the payment method she used (FR-22)

**Given** she confirms
**When** the workflow `cancel-order` runs
**Then** under the lock of AD-6 the Order moves to Cancelled, its Pieces are released and one stock-movement row per Variant is written with cause "cancellation" and the Shopper as actor
**And** a refund of the full amount paid, including any shipping charge, is started to the payment method used; a credit note linked to the invoice is created (AD-25); and the Order moves to Refunded when the payment service accepts the refund
**And** the released Pieces are available to other Shoppers at once, because they never left the shop

**Given** her Order is Dispatched or any later state
**When** she opens it
**Then** no cancel action is offered, and a cancel request returns `order.cannot_cancel_after_dispatch` with a pointer to Returns

**Given** the Owner marks the Order Dispatched at the same moment she cancels
**When** both workflows run
**Then** exactly one succeeds; the Order is never both Dispatched and Cancelled, and stock is changed once

**Given** the payment service refuses or does not answer the refund request
**When** `cancel-order` reaches the refund step
**Then** the Order stays Cancelled, the Owner is alerted by a `message.send` job, and a retry with the same idempotency key does not refund twice
**And** a refund not started by the end of the second working day after cancellation is listed as overdue for the Owner (FR-24)

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (a second purchase is cancelled by the Shopper while Paid, and the test asserts Cancelled, then Refunded, one credit note, and the Piece available again) and passes, so that deploys are not blocked

**Given** she sends the same cancel request twice
**When** the second arrives
**Then** it returns the same result and nothing is refunded twice

**Given** a shipping label already exists for a Packed Order
**When** the Order is cancelled
**Then** the shipment is cancelled through the shipping adapter; if that fails, the Order is still Cancelled and the Owner is alerted to stop the parcel

**Requirements:** FR-22, FR-24, FR-36, AD-4, AD-6, AD-7, AD-24, AD-25
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/cancel-order`, created here as the stock workflow AD-6 names, with refund and credit-note steps; `store/shop/orders/{id}/cancel`; `providers/shipping` cancel-shipment), `packages/api-client`, `apps/web` (Order page).
- Reuses the refund-to-source and credit-note steps of `refund-order` (Story 1.20); do not write a second refund path. Working days are counted by the function of Story 3.7.
- Raise `order.cancelled` and `refund.started`; their messages are added in Story 3.20. The overdue list itself appears on the Owner's refund page in Story 3.19; here, store what that page will need (cancelled time, refund started time).
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.15: Request a Return and book a pickup

As a Shopper,
I want to ask to send a saree back, say why, and book a pickup from my Order page,
So that a saree that disappointed me is collected without argument.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is complete
**Then** the Return state enum and transition table that Story 1.18 created are extended, not created again, so that the enum holds exactly Requested, Pickup booked, Picked up, Received, Accepted, Rejected, Refunded, with the allowed transitions Requested→Pickup booked; Pickup booked→Picked up; Picked up→Received; Received→Accepted; Received→Rejected; Accepted→Refunded, each performed by one workflow (AD-24)

**Given** a Delivered Order whose return period has not ended
**When** the Shopper opens it
**Then** she can request a Return for one or more items and quantities, and she is shown the last day she can do so
**And** the return period is the number of days stored in the Checkout snapshot when she paid (7 at launch), counted from the delivered time to the end of that day in the business time zone (AD-13)

**Given** the return period has ended, or the Order is not Delivered
**When** she tries to request a Return
**Then** no action is offered and a request returns `return.period_ended` or `return.order_not_delivered`
**And** an item already in a Return that is not Rejected cannot be requested again (`return.already_requested`)

**Given** she is choosing a reason
**When** the reasons are shown
**Then** "Not as shown" and "Defective or wrong item" are always present, and return shipping for them is shown as free (FR-23)
**And** any other reason comes from the return conditions setting, with its conditions and its return shipping charge shown before she confirms; nothing is added after she confirms (NFR-13)

**Given** she confirms with a reason and an optional comment
**When** the workflow `request-return` runs
**Then** a Return is created in Requested with the items, reason, comment, the return shipping charge that applied (zero for the two always-accepted reasons) and the time
**And** a request with an always-accepted reason is never refused at this step for the state of the saree

**Given** a Return in Requested
**When** she chooses a pickup date from those the shipping adapter offers for her address and confirms
**Then** the pickup is booked through the shipping adapter and the Return moves to Pickup booked, with the pickup date and reference shown to her
**And** if the adapter cannot book, the Return stays Requested, she is told the shop will arrange the pickup, and the Owner is alerted

**Given** the shipping service reports the parcel collected
**When** the event is handled through the adapter's mapping table
**Then** the Return moves to Picked up without Owner action, and she sees each state with its time, named exactly as in the Glossary

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (the Return is requested through `request-return` inside the return period stored in the Checkout snapshot, and the pickup is booked on a date the shipping adapter offers) and passes, so that deploys are not blocked

**Given** a Design page and the checkout review step
**When** a Shopper views them
**Then** the return period in days and the return conditions are shown with a link to the returns policy, read from settings and content (FR-23)

**Requirements:** FR-23, FR-21, FR-56, NFR-13, AD-4, AD-13, AD-24
**Notes for the developer:**
- Touches `packages/contracts` (Return states, transitions, reasons), `apps/commerce` (`order-state` module Return entity completed, `workflows/request-return` and `workflows/book-return-pickup`, both named in Story 1.18 and completed here, `providers/shipping` pickup slots and booking, `store/shop/returns`), `packages/api-client`, `apps/web`.
- Extends Epic 1's basic Return; migrate existing Returns to the nearest state. `begin-checkout` must now write the return period into the Checkout snapshot.
- Received, Accepted, Rejected and Refunded are moved by the Owner in Story 3.18; the Shopper's page must already show them when they occur.
- The glossary has no state for a Return the Shopper withdraws, so withdrawing is not built. Styled from DESIGN.md when it exists.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.16: Record every Admin read of personal data

As an Owner,
I want every look at a Shopper's personal data in the Admin to be recorded,
So that I can show who saw what and when if a Shopper or an authority asks.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is complete
**Then** an access event schema exists with actor (admin email), time, the Shopper concerned, the kind of data read (for example Order contact details, address, complaint, inspection photo) and the route, and it never holds the data itself, a photo, a link or a mobile number (NFR-5, NFR-6)

**Given** an admin route marked in code as returning personal data
**When** the Owner calls it successfully
**Then** one access event is recorded in `shop-audit` by a workflow
**And** if the event cannot be recorded, the request fails with `audit.unavailable` and returns no personal data

**Given** an admin list route that shows many Shoppers
**When** it is called
**Then** it returns mobile numbers masked to the last four digits and records one access event for the list, not one per row; opening one record shows the full details and records an access event for that Shopper

**Given** a new admin route under `admin/shop/*`
**When** continuous integration runs
**Then** a test fails unless the route is declared as either "returns personal data" or "returns no personal data"

**Given** any role or route
**When** it tries to update or delete an access event or an audit event
**Then** it is refused, and no job removes events younger than one year (AD-14)

**Given** the Owner opens the access log page
**When** the Owner filters by Shopper or by date
**Then** the matching events are listed, newest first
**And** opening the access log does not itself read a Shopper's data and writes no event

**Requirements:** NFR-5, NFR-6, AD-4, AD-14
**Notes for the developer:**
- Touches `apps/commerce` (`shop-audit` module: access event entity; an admin middleware and a route declaration helper; `src/admin` access log page), `packages/contracts`. The staging checks of encryption in transit and at rest (TLS, the `documents` bucket, backup and volume encryption) are made once, in Story 7.9.
- Uses the `shop-audit` module of Story 1.22, which already records a first access event when the Owner opens an Order; this story gives the access event its schema, the route declaration helper, the masking rule and the log page, and brings that first event under them.
- Purging events older than one year is not built: how the one-year duty sits with erasure is a question for the lawyer (NFR-6).
- Every later Admin story in this epic declares its routes with this helper. Shopper photos do not exist until Epic 4, which marks its own routes the same way.

---

### Story 3.17: The Owner's Orders page: find, pack, label, dispatch, cancel, inspect

As an Owner,
I want one page where I find any Order and send it out,
So that packing and dispatch take minutes and I never retype an address.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin with a second factor
**When** the Owner opens Orders
**Then** Orders are listed newest first with Order number, date, state, total and masked mobile number, and can be filtered by any Order state (FR-47)
**And** a search by exact Order number or by full mobile number returns the matching Orders; a search with no match says so

**Given** the kernel's built-in order, fulfilment, payment and refund screens
**When** the Owner uses the Admin
**Then** those screens are hidden and their routes for editing stock, payments and refunds are not on the allow-list; only the shop pages act on Orders (AD-21)

**Given** an Order in Paid
**When** the Owner marks it packed
**Then** it moves to Packed through its workflow and a `shop-audit` event records the Owner, time, before and after

**Given** an Order in Paid or Packed
**When** the Owner creates a shipping label
**Then** the label is created through the shipping adapter from the Order's address and items with nothing retyped, the tracking number is stored, and the label can be opened for printing
**And** if the adapter refuses (for example the address is not serviceable), the reason is shown, the Order's state does not change and nothing is half-created
**And** creating a label twice returns the same label

**Given** a Packed Order with a label
**When** the Owner marks dispatch
**Then** `fulfil-order` moves it to Dispatched under the lock of AD-6 and writes the stock movements
**And** marking dispatch without a label is refused with `order.label_required`

**Given** an Order in Paid or Packed
**When** the Owner cancels it and enters a reason
**Then** the same `cancel-order` workflow as Story 3.14 runs, with the Owner as actor and the reason recorded

**Given** an Order in Returned to shop or Refunded after an undelivered parcel
**When** the Owner records the inspection of each Piece as "sellable" or "damaged"
**Then** each result is handed to `restock-return`, the only workflow that writes these stock-movement rows (AD-6): for "sellable" the Piece becomes available with a stock movement of cause "undelivered, inspected"; for "damaged" stock is unchanged, a stock movement of cause "undelivered, damaged" is written, and the Piece is not returned to stock (FR-25)
**And** until inspection is recorded, those Pieces are not available to Shoppers

**Given** the Owner opens one Order
**When** the page loads
**Then** it shows the state history, lines, totals, invoice and credit notes, shipment events, any Returns and refunds, and the Shopper's name, mobile number and address
**And** an access event is recorded as in Story 3.16

**Requirements:** FR-47, FR-25, FR-36, NFR-10, AD-4, AD-6, AD-14, AD-21, AD-24
**Notes for the developer:**
- Touches `apps/commerce` (`admin/shop/orders/*`, `src/admin` Orders pages, `providers/shipping` label creation hardened), `packages/contracts`.
- Completes Epic 1's first Orders page; keep its workflows and extend them.
- Returns are handled on their own page in Story 3.18; refunds and disputes in Story 3.19. Show links to them here only as read-only summaries.

---

### Story 3.18: The Owner's Returns page: receive, inspect, accept or reject with photos

As an Owner,
I want to move each Return through its states and record what I found on inspection,
So that a fair return is refunded quickly and an unfair one is explained with evidence.

**Acceptance Criteria:**

**Given** the Owner opens Returns
**When** the page loads
**Then** Returns are listed with their state, reason, Order number and age, and can be filtered by any Return state (FR-47)
**And** opening one Return records an access event

**Given** a Return in Requested whose pickup could not be booked
**When** the Owner books the pickup from the page
**Then** the same `book-return-pickup` workflow runs and the Return moves to Pickup booked

**Given** a Return in Picked up
**When** the parcel arrives and the Owner marks it received
**Then** the Return moves to Received

**Given** a Return in Received
**When** the Owner records the inspection as passed
**Then** the workflow `accept-return` moves it to Accepted and starts the refund to the payment method used: the price paid for the returned items, less the return shipping charge stored on the Return (zero for "Not as shown" and "Defective or wrong item")
**And** a credit note linked to the original invoice is created, and the Return moves to Refunded when the payment service accepts the refund (FR-24)
**And** the Order moves to Refunded only when the total refunded for the Order equals the total paid; otherwise, as when a return shipping charge was deducted or a shipping charge paid is not refunded, the refund shows on the Return and the Order keeps its state (AD-31)
**And** the Owner then records each Piece as "sellable" or "damaged", and `restock-return` runs with that result: it returns a sellable Piece to stock and, for a damaged one, writes the stock-movement row without returning it (FR-25, AD-6)

**Given** a Return in Received
**When** the Owner records the inspection as failed
**Then** a reason and at least one photo are required; without them the action is refused with `return.rejection_needs_reason_and_photo`
**And** the workflow `reject-return` moves the Return to Rejected, no refund is made, the Pieces are not returned to stock, and a shipment back to the Shopper's address is created through the shipping adapter with its tracking number stored

**Given** her Return is Rejected
**When** the Shopper opens it on her Order page
**Then** she sees the reason, the inspection photos through signed links valid for at most 10 minutes, and the tracking of the parcel coming back to her (FR-23)

**Given** an inspection photo is uploaded
**When** it is stored
**Then** it is uploaded with a single-use signed upload link limited by size and image type, kept as a file in the private `documents` bucket linked to the Return (AD-31), and is never reachable by a public URL (AD-22)

**Given** the payment service refuses the refund in `accept-return`
**When** the workflow reaches that step
**Then** the Return stays Accepted, the Owner is alerted, and a retry does not refund twice

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (the Owner's single inspection action is replaced by `accept-return` followed by the "sellable" result, and the test still ends with the Return Refunded, one refund, one credit note and the Piece back in stock) and passes, so that deploys are not blocked

**Given** the Owner tries a transition the table does not allow, such as Requested→Accepted
**When** the request is made
**Then** it is refused with `return.transition_not_allowed`
**And** every transition made by the Owner records a `shop-audit` event

**Requirements:** FR-47, FR-23, FR-24, FR-25, AD-4, AD-6, AD-14, AD-22, AD-24, AD-25, AD-31
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/accept-return`, `workflows/reject-return`, `admin/shop/returns/*`, `src/admin` Returns pages, upload-link route), `packages/api-client` and `apps/web` (Rejected view on the Return).
- Builds on the inspection and restock of Story 1.19 and the refund of Story 1.20: `accept-return` and `reject-return` replace its single inspection action and reuse the refund-to-source and credit-note steps of `refund-order`.
- Inspection photos are files in the `documents` bucket, linked to the Return (AD-31).
- Who pays to send a rejected saree back is a founder decision; no charge is made to the Shopper here.
- Raise `return.state-changed` for each transition; its messages are added in Story 3.20.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.19: The Owner's refunds and payment disputes

As an Owner,
I want to refund all or part of an Order and see every dispute raised against a payment,
So that I can put things right for a Shopper and never miss a dispute deadline.

**Acceptance Criteria:**

**Given** an Order with a confirmed payment
**When** the Owner opens its refund page
**Then** the page shows the amount paid, each refund already made with its amount, reason, start time and credit note, and the amount that can still be refunded (FR-48)

**Given** the Owner enters an amount and a reason
**When** the amount is above zero and no more than the amount paid less refunds already made
**Then** the workflow `refund-order` starts a refund of exactly that amount to the payment method used (AD-7), creates a credit note linked to the original invoice with tax reversed by the money functions in `packages/contracts`, exact to the paisa (AD-5, AD-25), and records a `shop-audit` event
**And** stock is not changed by a refund

**Given** an amount above what can still be refunded, an amount of zero, or no reason
**When** the Owner submits
**Then** it is refused with `refund.exceeds_paid` (the code Story 1.21 defined), `refund.amount_invalid` or `refund.reason_required`, and nothing is refunded

**Given** a refund that brings the total refunded for an Order that is Dispatched, Out for delivery, Delivery failed or Delivered up to the total paid
**When** the refund is started
**Then** the Order moves to Refunded (AD-31)
**And** a refund that leaves the total refunded below the total paid is recorded against the Order, or against its Return when it belongs to one, and the Order keeps its state; part refunds that together reach the total paid do move it to Refunded
**And** a refund that would bring the total refunded for an Order in Paid or Packed up to the total paid is refused with a pointer to cancel the Order instead

**Given** the Owner submits the same refund twice, or the page is sent twice
**When** the second request arrives with the same idempotency key
**Then** one refund is made

**Given** the payment service refuses the refund
**When** the workflow runs
**Then** no credit note is created, the Owner sees the payment service's reason, and the amount that can be refunded is unchanged

**Given** Cancelled Orders and Accepted Returns
**When** the Owner opens the refunds list
**Then** each shows when its refund was started, and any whose refund has not started is shown with its deadline: the end of the second working day after it was Cancelled or Accepted, using the working days and business time zone from settings (FR-24)
**And** a scheduled job alerts the Owner once when a refund is still not started at the end of the first working day

**Given** the payment service sends a verified dispute event for a payment
**When** it is handled
**Then** the workflow `record-payment-dispute` stores or updates a dispute, a record of the `checkout` module (AD-31), with the payment service's dispute id, amount, reason, status and respond-by date, linked to the Order of that payment, idempotent on the event id
**And** the Owner is alerted when a dispute is opened
**And** a dispute whose payment matches no Order is stored unlinked and the Owner is alerted

**Given** the Owner opens Disputes
**When** the page loads
**Then** each dispute is listed with its Order, amount, reason, status and respond-by date, and links to the Order; the dispute also appears on the Order's page

**Requirements:** FR-48, FR-24, NFR-4, AD-4, AD-5, AD-7, AD-14, AD-21, AD-25, AD-31
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/refund-order` from Stories 1.20 and 1.21, completed here; `workflows/record-payment-dispute`; the `checkout` module's dispute record; `providers/razorpay` dispute events through the kernel's payment hook route; `src/jobs` refund-deadline job; `admin/shop/refunds/*`, `admin/shop/disputes/*`, `src/admin` pages).
- A payment dispute is a record of the `checkout` module, linked to the Order (AD-31).
- AD-31 decides Refunded by amounts: the Order is Refunded only when the total refunded equals the total paid. No refund needs to be tied to an item for that test; use the one function Story 1.20 wrote for it.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.
- Answering a dispute is done at the payment service; this story shows and links, it does not submit evidence.
- How tax is split on a part refund that is not tied to an item is for the accountant; implement one money function that spreads it across the invoice lines in proportion and sums exactly.

---

### Story 3.20: Messages for every Order, Return and refund event

As a Shopper,
I want to be told when my Order is confirmed, sent, delivered, returned or refunded,
So that I never have to wonder what is happening with my money or my saree.

**Acceptance Criteria:**

**Given** the events raised by Epic 1 and Stories 3.12 to 3.19
**When** each of these occurs
**Then** one `message.send` job per channel is enqueued with the Shopper's saved language (saved on her account by Story 3.8; when the account has been deleted, the language recorded in the Checkout snapshot by Story 3.11): Order confirmed (with invoice), dispatched, out for delivery, delivered, delivery failed, each Return state change (Requested, Pickup booked, Picked up, Received, Accepted, Rejected, Refunded), refund started, Order cancelled, payment refunded automatically (FR-54)
**And** the content seed creates one template per event and channel, in English, and the Owner can edit each one

**Given** a Shopper with no email on her account
**When** an event occurs
**Then** she receives an SMS only
**And** a Shopper with an email receives the SMS and an email

**Given** the Order confirmed event
**When** the email is sent
**Then** the tax invoice is attached, read by the worker through a signed link from commerce valid for at most 10 minutes; if the invoice file is not yet rendered the job waits and retries rather than sending without it
**And** the SMS gives the Order number and points to order history, where the invoice can be downloaded

**Given** the event `payment.auto-refunded`, which Epic 1 (Stories 1.10 and 1.11) records and logs without sending anything
**When** it is raised for a payment confirmed after its Hold ended with the Pieces gone, or for any other automatic refund
**Then** this story's subscriber enqueues the "payment refunded automatically" message for it, to the mobile number in the Checkout snapshot, and, in a test with the worker running, the message reaches the test sink within 5 minutes of the webhook (FR-19)
**And** from this story on, an automatic refund without that message enqueued fails a test

**Given** a delivery failed or a Rejected Return
**When** the message is sent
**Then** it says what happens next and points to the Order page; it contains no photo and no link to a photo

**Given** the same event is delivered twice, or a workflow is retried
**When** jobs are enqueued
**Then** the job id (event id plus channel) makes the second a no-op and one message is sent

**Given** these events, which need the Owner to act and have no alert yet: a new Order is Paid; a Return is Requested; a Return is Received and awaits inspection
**When** each occurs
**Then** the Owner receives an alert by email and SMS at the addresses in settings, through `message.send` with the `owner.alert` template of Story 3.5
**And** the alerts for a pickup that could not be booked, a refund that failed and a dispute that was opened were built by Stories 3.14, 3.15, 3.18 and 3.19 and are not built again here; one test lists all six events and asserts that each sends exactly one alert

**Given** a message job fails on every attempt
**When** the outcome is reported
**Then** the failure is recorded against the event, the Owner sees failed messages on the Order's page, and no state change is undone because a message failed

**Given** the template list after this story
**When** it is reviewed in a test
**Then** every template's purpose is `transactional` or `owner-alert`; none is marketing, and there is no route or page that sends a message to a list of Shoppers

**Requirements:** FR-54, FR-20, FR-19, NFR-9 (path), AD-8, AD-22, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`src/subscribers` mapping events to `message.send`, one table of event → template key in `packages/contracts`), `apps/content` (seeded templates), `apps/worker` (invoice attachment in the email path).
- Epic 1 sent no messages. This story is where `payment.auto-refunded` (Story 1.11) and the Order confirmation are first delivered, so there is one sender (AD-26).
- "Try-on result ready" is shown in the app and belongs to Epic 4. Complaint and account-deletion messages are added by Stories 3.22 and 3.23 with their own events.
- No template may contain a one-time code, a photo or a signed link to Shopper media.

---

### Story 3.21: Ask whether the saree matched what she saw

As a Shopper,
I want to say, from 1 to 5, whether the saree matched what I saw online,
So that the shop learns when its photos mislead and fixes them.

**Acceptance Criteria:**

**Given** an Order in Delivered
**When** the Shopper opens it
**Then** for each Design in the Order she is asked "did it match what you saw?" with a rating from 1 to 5 and an optional comment; no rating is pre-selected (FR-53, NFR-13)

**Given** she submits a rating
**When** the workflow `record-rating` runs
**Then** a rating is stored with the Order item, the Design, the rating, the comment, the time, and whether she used Try-on for that Design before buying
**And** "used Try-on" is answered by one function in the `rating` workflow step that reports whether she has a Try-on request for that Design made before the Order; while no Try-on records exist it answers "no"

**Given** a rating outside 1 to 5, or not a whole number, or a comment longer than the limit in contracts
**When** it is submitted
**Then** it is refused with `rating.invalid` and nothing is stored

**Given** she has already rated an Order item
**When** she submits again
**Then** it is refused with `rating.already_given` and the first rating stands

**Given** an Order that is not Delivered, or belongs to another Shopper
**When** a rating is submitted for it
**Then** it is refused with `rating.order_not_delivered` or `order.not_found`

**Given** an Order has been Delivered for the number of days in the setting "ask for rating after" (default 2) and has an item with no rating
**When** the daily scheduled job runs
**Then** one message asking for the rating is sent through `message.send`, and it is never sent a second time for that Order
**And** she can still rate an item she has returned

**Given** the Owner opens Ratings in the Admin
**When** the page loads
**Then** for each Design it shows the number of ratings, the average to one decimal place, the count of each value from 1 to 5, the same figures split by "used Try-on" and "did not", and the comments, newest first (FR-53)
**And** the list can be sorted by lowest average, and a Design with no ratings shows "no ratings yet"

**Requirements:** FR-53, FR-54, NFR-13, AD-4, AD-13, AD-14, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`rating` module created here, `workflows/record-rating`, `store/shop/orders/{id}/ratings`, `src/jobs` rating reminder, `admin/shop/ratings`, `src/admin` page), `packages/api-client`, `apps/web` (Order page).
- Story 4.12 changes only the "used Try-on" function to read its Try-on requests; the schema already holds the field.
- Ratings are not shown to other Shoppers; the PRD asks only that the Owner sees them. A comment shown in the Admin is linked to an Order, so the ratings route is declared as returning personal data (Story 3.16).
- Adds the setting "ask for rating after" `[ASSUMPTION: 2 days after delivery; FR-53 says only "after delivery"]` and the template `order.rate-request`. Styled from DESIGN.md when it exists.

---

### Story 3.22: Privacy requests and complaints, each with a ticket and two deadlines

As a Shopper,
I want to ask what data the shop holds about me, ask for it to be corrected or erased, or file a complaint,
So that I can use my rights and know when I will be answered.

**Acceptance Criteria:**

**Given** a Shopper on the website, signed in or not
**When** she opens the grievance page from the footer
**Then** she sees the grievance officer's name and contact from the disclosures and a form to file one of: a complaint; a request for the data held about her and the services that received it; a correction; an erasure (FR-28, FR-29)
**And** a Shopper who is not signed in must give a mobile number or an email so she can be answered

**Given** she submits the form with a description
**When** the workflow `file-complaint` runs
**Then** a complaint is created with a unique ticket number from a database sequence, its type, description, the Order it concerns if she chose one, the time filed, an acknowledgement deadline 48 hours after filing and a resolution deadline one calendar month after filing
**And** she is shown the ticket number at once

**Given** a complaint was filed
**When** the workflow completes
**Then** a "complaint acknowledged" message with the ticket number and the resolution deadline is sent by SMS, and by email when she gave one, through `message.send`
**And** when the outcome reported for that message is "sent", the complaint is marked acknowledged with that time; if every attempt fails it stays unacknowledged and the Owner is alerted

**Given** an empty description, or no way to answer a Shopper who is not signed in
**When** the form is submitted
**Then** it is refused with the field named and no ticket is created
**And** the form is rate-limited in commerce middleware with limits from settings, and the same submission sent twice creates one ticket

**Given** a signed-in Shopper
**When** she opens her requests and complaints
**Then** she sees each ticket with its number, type, state (Open, Acknowledged or Resolved), the date it will be resolved by, and any reply
**And** she cannot see another Shopper's ticket

**Given** an unacknowledged complaint 12 hours before its 48-hour deadline, or an unresolved complaint 7 days before its one-month deadline
**When** the scheduled job runs
**Then** the Owner is alerted once for each, by `message.send`
**And** a complaint past either deadline is marked overdue and stays listed as overdue until resolved

**Given** a request of type erasure
**When** it is filed
**Then** she is also told she can delete her account herself and is pointed to the account deletion page

**Requirements:** FR-28, FR-29, FR-54, AD-4, AD-13, AD-19, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`complaint` module created here, `workflows/file-complaint`, `store/shop/complaints`, `src/jobs` complaint-deadline job), `packages/api-client`, `apps/web` (grievance page, account requests list), `apps/content` (templates `complaint.acknowledged`, `complaint.resolved`, Owner alerts).
- `[ASSUMPTION: the three complaint states Open, Acknowledged and Resolved, and alert lead times of 12 hours and 7 days; the PRD gives only the two deadlines]`. The lead times are settings.
- The Owner's reply, closing a ticket, and carrying out a data request are in Story 3.24, which sends `complaint.resolved`. The account deletion page is built in Story 3.23; until then the pointer names the grievance contact.
- Story 4.24 adds a request type for a person who appears in a Try-on result without agreeing (FR-9). Styled from DESIGN.md when it exists.

---

### Story 3.23: Delete my account, on the website and from a public page

As a Shopper,
I want to delete my account myself, whether or not I can still sign in on my usual device,
So that the shop stops holding my details when I no longer want it to.

**Acceptance Criteria:**

**Given** a signed-in Shopper on her account page
**When** she chooses to delete her account
**Then** before she confirms she is told what will be removed (her mobile number, email, name, saved addresses, cart, language, rating comments, and any Shopper photos and Try-on results) and what is kept because the law requires it (invoices, credit notes, Order, payment and refund records with the delivery details they were issued with, complaint tickets, access logs and the erasure record) (FR-27)
**And** she confirms by entering a new one-time code sent to her number; nothing is deleted without it

**Given** anyone on the public web page `/delete-account`, reachable without signing in and without the app, linked from the footer and the privacy policy
**When** she enters her mobile number and the one-time code sent to it
**Then** she is shown the same explanation and the same confirmation, and the same workflow runs
**And** a number with no account gets the same first response as one with an account, and the code limits of Story 3.8 apply

**Given** she has confirmed
**When** the workflow `delete-shopper-account` runs
**Then** her sessions end at once and her number can no longer sign in to that account
**And** it calls `erase-shopper-media`, the only erasure path (AD-23), which writes an erasure ledger entry for her with each step and its time, deletes every file of hers in `shopper-media`, and enqueues one `media.erase-at-provider` job per AI service that received a photo of hers; with no Try-on in the system yet it records zero files and zero providers
**And** the private `shopper-media` bucket, never versioned and encrypted at rest, is created in this story, in `infra/` for local and staging, so that the file step acts on a real bucket from the start (AD-22); Story 4.4 puts the first files in it
**And** it removes her personal details from the account, deletes her cart, removes the comment from and the Shopper link to her ratings while keeping the rating value and Design, and blanks the recipient on stored message records
**And** invoices, credit notes, Orders, payments, refunds, complaints, audit events, access events and the erasure ledger are not changed

**Given** she has an open Order, meaning one that is neither Delivered past its return period, nor Cancelled, nor Refunded (AD-31)
**When** she asks to delete her account, in her account or on the public page
**Then** the deletion is refused with `account.has_open_order`; she is told which Order is open, that she can delete her account once it is finished, and how to reach the grievance contact
**And** `erase-shopper-media` still runs at once for her, so her Shopper photos and Try-on results are erased in any case, with an erasure ledger entry
**And** her account, cart and Orders are otherwise unchanged, and her open Order continues to completion

**Given** the workflow fails part-way
**When** it is retried
**Then** it resumes from the ledger, repeats no finished step, and ends in the same result
**And** a scheduled job alerts the Owner when any erasure ledger entry is unfinished 24 hours after it began (NFR-6)

**Given** the deletion has finished
**When** the same mobile number signs in again
**Then** a new account is created with no Orders, no cart and no earlier terms acceptance, and she is asked to accept the terms again

**Given** the deletion has finished
**When** the final step runs
**Then** a confirmation message was sent to her number before it was removed, saying the account is deleted and which records are kept

**Requirements:** FR-27, FR-28, NFR-6, AD-4, AD-22, AD-23, AD-26, AD-31
**Notes for the developer:**
- The open-Order rule is AD-31's; "Delivered past its return period" uses the return period stored in the Order's Checkout snapshot (Story 3.15). The explanation shown before she confirms says that deletion waits for an open Order.
- Touches `apps/commerce` (`erasure` module and ledger created here, `workflows/erase-shopper-media`, `workflows/delete-shopper-account`, `src/jobs` erasure-deadline job, `store/shop/account/delete`), `packages/contracts` (`media.erase-at-provider` payload), `packages/api-client`, `apps/web` (account page, `/delete-account`), `infra/` (the `shopper-media` bucket).
- This story covers everything that exists so far. Epic 4 extends the same `erase-shopper-media` workflow with Shopper photos, Try-on results, Try-on requests and the worker's `media.erase-at-provider` job and provider answers; it adds no second erasure path, and withdrawal and the retention job will call the same workflow.
- `[ASSUMPTION: the list of records kept after deletion, as named in the first criterion, and that they are kept without a time limit; pending the lawyer]`. The kept list shown to the Shopper comes from content, not code.
- Adds the template `account.deleted`. Styled from DESIGN.md when it exists.

---

### Story 3.24: The Owner answers complaints and carries out data requests

As an Owner,
I want to see every open complaint with its deadlines, reply, close it, and carry out a data request,
So that every Shopper is answered inside 48 hours and one month.

**Acceptance Criteria:**

**Given** the Owner opens Complaints in the Admin
**When** the page loads
**Then** open complaints are listed with ticket number, type, time filed, the 48-hour acknowledgement deadline and the one-month resolution deadline, each shown with the time left or as overdue, soonest deadline first (FR-49)
**And** the list can be filtered by state and type, and opening a complaint records an access event

**Given** an unacknowledged complaint whose automatic acknowledgement failed
**When** the Owner marks it acknowledged after contacting the Shopper
**Then** it moves to Acknowledged with the time and the Owner as actor

**Given** an open complaint
**When** the Owner writes a reply and closes it
**Then** the workflow `resolve-complaint` stores the reply, moves the complaint to Resolved with the time, and sends "complaint resolved" through `message.send`; the message says a reply is waiting and gives the ticket number, and does not contain the reply's personal data
**And** a signed-in Shopper sees the reply under her ticket; a Shopper without an account receives the reply by email when she gave one
**And** closing without a reply is refused with `complaint.reply_required`

**Given** a request for the data held
**When** the Owner runs "prepare data report" for that Shopper
**Then** the workflow `prepare-data-report` builds a report listing her account details, addresses, Orders, Returns, refunds, ratings, terms acceptances, complaints, messages sent to her (template and time only), and the services that received her data: the payment service, the shipping service, the SMS and email services, and each AI provider that received a Shopper photo of hers (FR-28)
**And** the AI provider list comes from one function that reads the erasure and Try-on records; with no Try-on in the system it states that no AI provider received a photo
**And** the report is attached to the reply, is readable by the Shopper only when signed in and through a signed link valid for at most 10 minutes, and preparing it records an access event

**Given** a correction request
**When** the Owner corrects her name, email or a saved address
**Then** the change runs as a workflow and records a `shop-audit` event with before and after
**And** an invoice or credit note already issued is never changed (AD-25); the Owner is told so on the page

**Given** an erasure request
**When** the Owner confirms it for that Shopper
**Then** the same `delete-shopper-account` workflow as Story 3.23 runs, with the Owner as actor and the ticket number recorded in the erasure ledger
**And** the same open-Order rule applies: while she has an open Order the account deletion is refused, her Shopper photos and Try-on results are erased at once, and the ticket shows that the rest waits for the Order (AD-31)

**Given** a resolved complaint
**When** anyone tries to edit its reply or reopen it by changing times
**Then** it is refused; a further reply creates a new entry under the same ticket

**Requirements:** FR-49, FR-28, FR-54, NFR-5, AD-4, AD-14, AD-23, AD-25, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/resolve-complaint`, `workflows/prepare-data-report`, `admin/shop/complaints/*`, `src/admin` Complaints pages), `packages/api-client` and `apps/web` (reply and report under a ticket).
- The report file is stored in the private `documents` bucket and deleted by `delete-shopper-account`; add that step to the workflow here.
- Story 4.23 extends the AI-provider function and adds Try-on consents, withdrawals, stored photos and requests to the report.
- Finding a Shopper outside a complaint, and deactivating an account, are in Story 3.25.

---

### Story 3.25: Look up a Shopper and deactivate an account

As an Owner,
I want to find a Shopper by her mobile number or an Order number and see everything about her dealings with the shop,
So that I can answer her in one call and stop an account that is being misused.

**Acceptance Criteria:**

**Given** the Owner opens Shopper support
**When** the Owner searches by a full mobile number or an exact Order number
**Then** the matching Shopper is shown; a search that matches nobody says so; a part of a number never returns a list of Shoppers (FR-49)

**Given** a Shopper is found
**When** her page loads
**Then** it shows her account details, her Orders with state, her Returns and refunds, her consents (each terms acceptance with version, language and time), her complaints with state and deadlines, and whether an erasure has been run for her
**And** one access event is recorded for the page, and following a link to an Order or complaint records its own

**Given** the consents section
**When** it is built
**Then** it reads every consent type from the `consent` module through one list function, so that consent types added later appear without changing this page

**Given** an Order number whose Shopper has deleted her account
**When** the Owner searches for it
**Then** the Order and its kept records are shown, the Shopper is shown as "account deleted" with the erasure ledger entry, and no removed detail is shown

**Given** the Owner chooses to deactivate a Shopper's account and enters a reason
**When** the workflow `deactivate-shopper` runs
**Then** her sessions end, a request for a sign-in code for her number is answered as usual but the code is refused at verification with `auth.account_deactivated` and the support contact, and a `shop-audit` event records the Owner, time, reason, before and after
**And** her Orders, Returns and refunds in progress continue, and she still receives their messages

**Given** a deactivated account
**When** the Owner reactivates it
**Then** she can sign in again, and the change is audited

**Given** a deactivated Shopper uses the public account deletion page or files a complaint without signing in
**When** she completes either
**Then** both still work, so deactivation never blocks her privacy rights

**Requirements:** FR-49, FR-27, FR-28, NFR-5, AD-4, AD-14, AD-15
**Notes for the developer:**
- Touches `apps/commerce` (`admin/shop/shoppers/*`, `workflows/deactivate-shopper`, the one-time-code provider's verification check, `src/admin` Shopper support page), `packages/contracts`.
- The public deletion page verifies the code through a path that allows a deactivated account for deletion only; cover this with a test.
- Epic 4 adds Try-on consents to the consents list and reported results to the Shopper's page; neither exists here.

---

### Story 3.26: The honest-design checklist and its yearly record

As an Owner,
I want the shop checked against the official list of dark patterns, by tests on every build and by my own recorded audit once a year,
So that no Shopper is pushed or tricked and I can prove I looked.

**Acceptance Criteria:**

**Given** the repository
**When** this story is complete
**Then** `docs/honest-design-checklist.md` lists every pattern on the official list of dark patterns, and for each one says where in the shop it could occur, what the shop does instead, and whether an automated test or the Owner's yearly review checks it (NFR-13)

**Given** the website's cart, checkout, sign-in, terms acceptance, email, Return and rating screens
**When** the automated honest-design tests run in continuous integration
**Then** they fail if any tick box or optional choice is selected by default
**And** they fail if the Checkout snapshot total differs from the total shown in the cart for the same cart, address and discount, or if any charge appears at payment that was not shown before checkout began
**And** they fail if any line is in the cart that the Shopper did not add

**Given** a Shopper who is not signed in
**When** the tests browse, search, open a Design, open the Full saree view, check a pincode, add to the cart and open every policy
**Then** no step demands sign-in or an email; sign-in is asked only at checkout and order history

**Given** the Design page, cart and checkout
**When** the tests read every view model and content text they show
**Then** no countdown, "only N left" or "N people are viewing" text exists unless it is a server-computed fact from stock (a sold-out or unavailable-for-now status is allowed), and a discount is never shown without the lowest price of the previous 30 days beside it (FR-5)

**Given** the cancel, Return, account deletion and complaint flows
**When** the tests walk them
**Then** each is reachable from the Shopper's account or Order page in no more steps than the checklist states, and no step asks the Shopper to reconsider more than once

**Given** the Owner opens Honest-design audit in the Admin
**When** the Owner answers every item on the checklist as "pass", "fail" with a note, or "not applicable" with a note, and saves
**Then** the audit is recorded as a `shop-audit` event with the Owner, the date and every answer, and cannot be edited or deleted afterwards (AD-14)
**And** saving with an unanswered item is refused

**Given** the last recorded audit
**When** 11 months have passed since it, or none has ever been recorded 30 days after first deploy to production
**Then** a scheduled job alerts the Owner once by `message.send` that the yearly audit is due
**And** the Admin page shows the date of the last audit and the date the next is due, 12 months after the last

**Requirements:** NFR-13, FR-5, FR-26, NFR-10, AD-4, AD-13, AD-14, AD-26
**Notes for the developer:**
- Touches `docs/`, `apps/web` (end-to-end honest-design tests), `apps/commerce` (`admin/shop/honest-design-audit`, a workflow that writes the audit event, `src/jobs` audit-due job, `src/admin` page).
- The checklist items shown in the Admin are read from a versioned file in `packages/contracts` generated from the document, so the page and the document cannot drift.
- The official list must be read from its published source when the document is written; do not write it from memory. If it cannot be read, list that as an open item at the top of the document.
- The Try-on consent screen (Story 4.3) and the Android app (Story 6.15) add their own cases to the same tests and checklist.

## Epic 4: Try-on with consent, under the Owner's control

An adult Shopper accepts the Try-on consent notice, uploads her Shopper photo and sees herself in a Design, labelled as AI-generated; she can report a Try-on result, withdraw Try-on consent and have everything erased. The Owner chooses models and prompts within guardrails that are code, tests them on a saved sample set, caps spending and can switch Try-on off. The epic ends with the launch gate test of PRD §6.3, which decides whether Try-on is switched on at launch.

**FRs covered:** FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-39, FR-40, FR-41, FR-42, FR-43, FR-44, FR-45, FR-46, FR-51, FR-52
**NFRs:** NFR-2, NFR-3 (and the Try-on parts of NFR-5, NFR-6 and NFR-9)

**Rules that hold for every story in this epic**

- Try-on is built for the website (`apps/web`) here; the Android app follows in Epic 6 through the same `packages/api-client` functions.
- Automated tests never call a real AI provider. They use the fake provider and the fake result check from Stories 4.5 and 4.6. Only the test bench used by hand (Story 4.9) and the launch gate run by the Owner (Story 4.26) reach real providers.
- Every shape that crosses a unit boundary is a zod schema in `packages/contracts` (AD-19); every state change is a named workflow (AD-4); every state-changing Admin request writes a `shop-audit` event (AD-14); no photo, link or image bytes appear in logs, job results or error reports (AD-22).
- Shopper-facing screens are described by behaviour only and are styled from DESIGN.md when it exists. Shopper-facing text comes from content (the notice and other documents, message templates) or the interface translation bundles of Story 3.4, with the clients' built-in translation files as the fallback (interface text), as AD-28 divides them.
- Try-on cost is recorded in integer paise (AD-5). A provider's price, recorded on the Approved-model list in the provider's currency, is converted to paise with the exchange-rate setting at the moment the cost is recorded (AD-32). The amount an AI provider reports is stored beside it unchanged, with its currency, for comparison.
- `ResultCheck` uses a check model: a vision-capable model on the Approved-model list, marked as a check model and reached through the same `TryOnProvider` port. If the check fails to run, the result is not shown (AD-32).
- This epic builds on Epic 3: the notice's publish path and `record-notice-version` (Story 3.2), the `consent` module's acceptance records (Story 3.9), the `erasure` module, its ledger and `erase-shopper-media` (Story 3.23), `message.send` (Story 3.5) and Shopper support (Story 3.25).
- "AI service" means each outside party that receives a Shopper photo for a model: the aggregator and the company that runs the model behind it. Each has a stable AI-service id (a lower-case slug).

---

### Story 4.1: The Try-on consent notice states its retention period and can be read by Shoppers

As an Owner,
I want each published version of the Try-on consent notice to state how long photos are kept and to be readable by the shop's clients,
So that consent always refers to one numbered notice whose list of recipients and retention period are true.

**Acceptance Criteria:**

**Given** the Try-on consent notice in the content admin, which since Story 3.2 has one integer version shared by all its translations and a list of AI-service ids
**When** the Owner edits it
**Then** she can also enter the retention period shown to the Shopper, shared by all translations of that version
**And** a draft without AI-service ids or without a retention period cannot be published
**And** a draft that lacks the notice text in any configured language (the list from `/internal/settings/languages`, Story 3.2) cannot be published either, so that no Shopper is shown, and asked to accept, a notice in a language she did not choose (FR-8).

**Given** a draft that changes the notice's meaning, its list of AI-service ids or its retention period
**When** the Owner publishes it
**Then** the version number rises by one and content calls `/internal/content/notice-published` on commerce with a service token, as built in Story 3.2
**And** commerce's `record-notice-version` workflow stores the version, the AI-service ids, the retention period and the publish time.

**Given** a published notice
**When** the Owner publishes a translation fix marked as not changing the meaning
**Then** the version number does not change and commerce's stored version is unchanged.

**Given** commerce is unreachable or refuses the call
**When** the Owner publishes a new notice version
**Then** the publish is not shown as complete, the previous version stays the published one in both content and commerce, and she can retry, as Story 3.2 defines.

**Given** the same notice version is sent to commerce twice
**When** the second call arrives
**Then** commerce stores nothing new and answers success.

**Given** a published notice version
**When** a client calls `GET /store/shop/tryon/notice` with a language
**Then** commerce returns the latest published version number, its AI-service ids, its retention period and the notice text in that language; every configured language has its text because publishing requires it, and only a request in a language that is not configured is answered in English.

**Given** no notice version has been published
**When** a client calls the route
**Then** it answers with `tryon.notice_not_published` and no text.

**Requirements:** FR-8, FR-51, FR-59; AD-1, AD-3, AD-9, AD-11, AD-14, AD-19
**Notes for the developer:**
- Builds on Story 3.2, which built the notice collection, its numbered versions, the list of AI-service ids, the publish call to `/internal/content/notice-published` and the `record-notice-version` workflow. This story adds only the retention period to all three, and the Shopper-facing read. Do not add a second internal route or a second workflow.
- `apps/content`: the retention period on the notice collection; the content audit event is already written by Story 3.1's rule.
- `apps/commerce`: the `consent` module's notice-version record gains the retention period; route `store/shop/tryon/notice`.
- `packages/contracts`: `AiServiceId` and `NoticeVersion` (extend what Story 3.2 defined), the notice view model. `packages/api-client`: `getTryOnNotice`.
- Seeds the retention period key in the `settings` module (30 days, FR-51), the first setting this epic reads; Story 4.24 builds the retention job and the warning when the notice and the setting differ.
- The publish call carries the content admin's email since Story 3.2, so the notice version's audit event has its actor (Story 4.21 shows it).
- The consent record itself is Story 4.3. The check of a Model route against the notice is Story 4.11.

---

### Story 4.2: The Owner's off switch and the Try-on entry point

As an Owner,
I want to switch Try-on off for everyone at once, and back on,
So that Try-on stays off until it passes the launch gate and I can stop it at any moment.

**Acceptance Criteria:**

**Given** a new installation
**When** nobody has touched the switch
**Then** Try-on is switched off.

**Given** the Owner on the Try-on controls page in the Admin
**When** she switches Try-on on or off
**Then** the `set-tryon-switch` workflow stores the new value with its time, the change takes effect without a release
**And** a `shop-audit` event records who made it, when, and the before and after values.

**Given** Try-on is switched off
**When** a Shopper opens a Design page on the website
**Then** the Try-on entry point is absent, not broken, and the rest of the page is unchanged.

**Given** Try-on is switched on and a notice version is published
**When** a Shopper opens a Design page on a phone
**Then** the Try-on entry point is visible without scrolling, beside the Full saree view entry point
**And** the page does not wait for the Try-on status before it is usable (NFR-1).

**Given** Try-on is switched on but no notice version has been published
**When** a client calls `GET /store/shop/tryon/status`
**Then** it answers unavailable, and the entry point is absent
**And** it also answers unavailable for a request in a configured language in which the published notice has no text, which can happen only when a language was configured after the notice was published, until a translation fix adds that text (FR-8).

**Given** a Shopper who is not signed in
**When** she taps the Try-on entry point
**Then** she is taken to sign in by one-time code and returns to Try-on for the same Design afterwards.

**Given** the Owner on the Try-on controls page
**When** she limits Try-on to chosen Designs, picking them from published Designs, and saves
**Then** the `set-tryon-designs` workflow stores the list, the change takes effect without a release and is audited with before and after values (FR-42)
**And** while a list is set, `GET /store/shop/tryon/status` for a Design answers available only if that Design is on it, and the entry point is absent on every other Design
**And** clearing the list makes Try-on available for every published Design again.

**Requirements:** FR-42, FR-3 (entry point), FR-26; AD-2, AD-4, AD-13, AD-14
**Notes for the developer:**
- Creates the `tryon` module in `apps/commerce/src/modules/tryon`, which the status read of this story uses and to which Story 4.4 adds the first entity.
- `settings` module: the Try-on switch and the list of chosen Designs as dated settings; workflows `set-tryon-switch` and `set-tryon-designs`; routes `admin/shop/tryon/switch` and `admin/shop/tryon/designs`; a new Admin page "Try-on controls" that later stories add to.
- The chosen-Designs limit is how a "narrow" outcome of the launch gate is applied (FR-42, Story 4.25). Refusing a request for a Design outside the list is in Story 4.12.
- `store/shop/tryon/status` takes a Design id and returns `{ available, reason }`; later stories add reasons (daily cap, Model route not usable). `api-client`: `getTryOnStatus`.
- `apps/web`: the entry point on the Design page and an empty Try-on screen for a Design, which later stories fill.
- Refusing requests while switched off is in Story 4.12 and stopping queued jobs in Story 4.13, where requests and jobs first exist.

---

### Story 4.3: Accept the Try-on consent notice and confirm being an adult

As a Shopper,
I want to read a standalone notice and accept it by my own action before my first Try-on,
So that my photo is sent to AI services only with my informed agreement.

**Acceptance Criteria:**

**Given** a signed-in Shopper with no current Try-on consent
**When** she opens Try-on for a Design
**Then** she is shown the Try-on consent notice on its own screen, in her language, with the AI services it names, what is kept and for how long, how to withdraw and how to complain
**And** the screen contains no other terms and no pre-ticked control.

**Given** the notice screen
**When** she has not confirmed that she is 18 or older
**Then** the accept action does nothing and Try-on stays unavailable to her.

**Given** the notice screen
**When** she confirms she is 18 or older and accepts
**Then** the `give-tryon-consent` workflow records the Shopper, the notice version, the language, the AI-service ids of that version, the adult confirmation and the time
**And** she continues to Try-on for the Design she came from.

**Given** a Shopper who declines or leaves the screen
**When** she returns to the Design page
**Then** no consent is recorded and she can browse and buy as before.

**Given** a Shopper whose consent is for notice version 3
**When** version 4 is published and she next opens Try-on
**Then** her consent is not current, she is shown version 4, and she must accept again before any Try-on.

**Given** the client sends an acceptance for a version that is not the latest published version
**When** commerce receives it
**Then** it is refused with `tryon.notice_outdated` and nothing is recorded.

**Given** a Shopper with current consent
**When** `GET /store/shop/tryon/consent` is called with her session
**Then** it returns current, the version and the time; without a Shopper session the route is refused (AD-15).

**Given** the honest-design tests and checklist of Story 3.26
**When** this story is finished
**Then** they are extended with the Try-on consent screen: the tests fail if the adult confirmation or the accept control is selected by default, if the notice screen carries any other terms, or if declining stops her browsing or buying
**And** `docs/honest-design-checklist.md` gains these items (NFR-13).

**Given** the Owner looks up a Shopper in Shopper support (FR-49)
**When** the Shopper has given Try-on consent
**Then** the consent's version, language and time are listed with her other consents.

**Requirements:** FR-8, FR-9, FR-59; AD-11, AD-15, AD-4; NFR-13
**Notes for the developer:**
- `consent` module: a Try-on consent is an acceptance record of the same kind as the terms acceptances of Story 3.9 (document type, version, language, time; AD-31), with the AI-service ids and the adult confirmation added; one row per acceptance, never edited. Workflow `give-tryon-consent`; routes `store/shop/tryon/consent` (read and accept, with `Idempotency-Key`).
- Shopper support's consents list (Story 3.25) reads every consent type through one function, so this record appears there without changing that page.
- `apps/web`: the notice screen, styled from DESIGN.md when it exists. Text comes from Story 4.1's route.
- The own-photo confirmation is taken with each upload in Story 4.4. Withdrawal is Story 4.22.

---

### Story 4.4: Provide a Shopper photo through a single-use signed upload

As a Shopper,
I want to choose or take one full-length photo of myself with my device's own picker, with guidance on what works,
So that Try-on has a usable photo and the shop never sees the rest of my gallery.

**Acceptance Criteria:**

**Given** a Shopper with current Try-on consent and no stored Shopper photo
**When** she reaches the photo step
**Then** she is told what makes a good photo (full length, facing the camera, alone in the picture, good light) and is linked to the published contact through which a person shown without agreeing can ask for removal
**And** the photo is chosen with a file input that opens the system photo picker or camera; the website asks for no other access.

**Given** a chosen file
**When** it is not a JPEG, PNG or WebP image, is larger than the size limit in settings, is smaller than the minimum pixel size in settings, or is wider than it is tall
**Then** she is told in plain words why it cannot be used, on the device, and nothing is uploaded or sent to an AI provider.

**Given** a usable file
**When** she confirms the photo is of herself and continues
**Then** the browser re-encodes it to the maximum long side in settings, which drops location and camera data, asks commerce for an upload link, and uploads straight to the `shopper-media` bucket
**And** without the own-photo confirmation commerce refuses to issue a link.

**Given** a request for an upload link
**When** commerce issues it
**Then** the link is for one object key, accepts only the allowed types and sizes, and is valid at most 10 minutes
**And** a link is refused without current consent, without a Shopper session, or beyond the upload-link rate limit in settings.

**Given** an upload has finished
**When** the client confirms it to commerce
**Then** the `store-shopper-photo` workflow checks the object exists with an allowed type and size, records the Shopper photo with the own-photo confirmation and its time
**And** a second confirmation of the same key, or a confirmation of an object that fails the check, is refused and the object is deleted.

**Given** a Shopper with a stored Shopper photo
**When** she opens Try-on again
**Then** she can reuse it, shown through a signed link valid at most 10 minutes, or replace it.

**Given** she replaces her Shopper photo
**When** the new one is confirmed
**Then** the old one is erased by `erase-shopper-media` scoped to that photo, with a row in the erasure ledger, and she has exactly one stored Shopper photo.

**Given** a Shopper with a stored Shopper photo
**When** she asks to delete her account through Story 3.23, whether the deletion is carried out or refused because she has an open Order
**Then** `erase-shopper-media` deletes the photo file at once and marks the photo record erased (AD-31).

**Given** an upload link that was issued but never confirmed
**When** one hour has passed
**Then** a scheduled job deletes any object under that key.

**Requirements:** FR-9, FR-10; AD-22, AD-23, AD-11, AD-4; NFR-5
**Notes for the developer:**
- `tryon` module: the `shopper_photo` entity. Workflows `issue-photo-upload-link` and `store-shopper-photo`. Routes `store/shop/tryon/photo/upload-link` and `store/shop/tryon/photo`.
- Extend the `erase-shopper-media` workflow of Story 3.23 to cover Shopper photos, for a whole Shopper and for one photo; the `erasure` module and its ledger already exist from that story.
- `apps/web`: the photo step and the on-device checks. No image analysis library is added; the checks are type, size, pixel size and orientation only.
- The `shopper-media` bucket exists from Story 3.23 (private, never versioned, encrypted at rest; AD-22); this story puts the first files in it and does not create it again. Requests to AI providers are Story 4.13.
- Seeds the settings keys it first reads: the photo's maximum file size, minimum pixel size and maximum long side, and the upload-link rate limit `[ASSUMPTION: 15 MB, 1,000 pixels, 2,048 pixels and 10 links per Shopper per hour; the PRD gives none]`.

---

### Story 4.5: The `TryOnProvider` port, a fake provider and the OpenRouter adapter

As an Owner,
I want every AI provider reached through one interface with safety settings fixed in code,
So that I can change models without changing the shop and no setting of mine can weaken a guardrail.

**Acceptance Criteria:**

**Given** the worker
**When** any code needs an AI provider
**Then** it uses only the `TryOnProvider` port: `generate(input)` returns exactly one of `result` (image bytes, type, provider's reported cost and currency if any), `blocked` (provider's safety check refused) or `failed` (with a stable reason code); `requestErasure(reference)` returns `confirmed`, `accepted`, `unsupported` or `failed`
**And** a lint rule or test fails the build if a job imports an adapter directly.

**Given** the OpenRouter adapter
**When** it builds a request
**Then** it sends the Shopper photo and the saree image together with the prompt text and the requested image size and quality
**And** it always sets the provider's no-retention option and keeps request logging at the provider off; neither is read from the database or from the job payload.

**Given** the prompt for a request
**When** the worker composes it
**Then** the fixed safety wording held in worker code is added to the Prompt version's text on every request (no change to the person's face or body, no image without clothing, clothing only as in the saree image)
**And** a test proves that no input from the Admin can remove or alter it.

**Given** the provider answers with a safety refusal
**When** the adapter maps the answer
**Then** it returns `blocked`, not `failed`.

**Given** the provider times out, returns an error, or returns no image
**When** the adapter maps the answer
**Then** it returns `failed` with a reason code, and the call is abandoned when the caller's time limit passes.

**Given** the fake provider
**When** a test asks for a result, a block, a failure, a delay longer than the time limit, or a given cost
**Then** the fake returns exactly that, and the whole automated test suite passes with no network access to any AI provider.

**Given** the adapter's contract test (NFR-11)
**When** it runs before a release against the provider with a synthetic image that shows no person
**Then** it checks the request and answer shapes; it is not part of the ordinary test suite.

**Given** any adapter call
**When** it logs or throws
**Then** the log or error contains the request id, model and duration, and never image bytes, links or keys.

**Requirements:** FR-39, FR-40, FR-41; AD-10, AD-16, AD-22; NFR-11
**Notes for the developer:**
- `apps/worker/src/providers/`: `TryOnProvider` interface, `openrouter` adapter, `fake` adapter, the fixed safety wording and the prompt composer. Provider choice is by configuration plus the request's provider name.
- `packages/contracts`: the port's input and result schemas and the reason codes.
- Seeds the Try-on time limit as a dated key of the `settings` module (90 seconds, FR-11, AD-13). The port takes the limit as an argument from its caller; nothing in the worker holds it as a constant.
- The OpenRouter key and base address are environment variables checked at start. No vendor SDK beyond plain HTTP is added.
- If OpenRouter offers no erasure call, `requestErasure` returns `unsupported`; Story 4.23 records that in the erasure ledger as AD-32 says. `ResultCheck` is Story 4.6; the port also carries the call that asks a check model about an image, so the check goes through the same port (AD-32).

---

### Story 4.6: Check every image with `ResultCheck`

As a Shopper,
I want every Try-on result checked before I can see it,
So that I am never shown an image with nudity or sexual content.

**Acceptance Criteria:**

**Given** the worker
**When** an image comes back from a `TryOnProvider`
**Then** it is passed to `ResultCheck`, which returns exactly one of `pass`, `reject` (nudity or sexual content) or `unassessable`.

**Given** `ResultCheck`
**When** it asks about an image
**Then** it asks a check model, a vision-capable model on the Approved-model list marked as a check model, through the same `TryOnProvider` port as generation, with the no-retention and no-logging flags set in code (AD-32)
**And** which check model to ask is given to it with each job, from the Model route; it is not read from an environment variable and no code path calls a model that is not on the Approved-model list.

**Given** the check model cannot be reached, times out, or gives an answer that cannot be read
**When** `ResultCheck` returns
**Then** the verdict is `unassessable`, never `pass`: if the check fails to run, the result is not shown.

**Given** the question put to the check model and the rule that turns its answer into a verdict
**When** the code is inspected
**Then** both are in worker code and are not data
**And** nothing in the Admin or the database can switch the check off, skip it or change its verdict; the Owner can choose which approved check model is used and nothing more.

**Given** a job that arrives with no check model
**When** the worker handles it
**Then** it generates nothing and the job ends failed.

**Given** the fake result check
**When** a test asks for `pass`, `reject` or `unassessable`
**Then** it returns that verdict without any network call.

**Given** a call to the check
**When** it logs
**Then** the log holds the verdict, the duration and the request id only.

**Requirements:** FR-52; AD-10, AD-22, AD-32
**Notes for the developer:**
- `apps/worker/src/providers/`: `ResultCheck`, which calls the port of Story 4.5, and a fake. The fixed question and the verdict rule sit beside the fixed safety wording.
- Marking a model as a check model on the Approved-model list is Story 4.7; naming the check model on the Model route, with its AI services required in the notice and its price counted against the cost ceiling, is Story 4.11. Until those exist, tests pass the check model in the job input.
- Using the verdict in a job is Stories 4.13 and 4.14; showing it on the test bench is Story 4.9.

---

### Story 4.7: The Approved-model list

As an Owner,
I want to approve a model only after recording how it treats Shopper photos, its terms and its price,
So that no Try-on request can go to a model I have not vetted.

**Acceptance Criteria:**

**Given** the Owner on the Approved-model list page
**When** she adds a model
**Then** she must record: the provider name known to the worker, the model id, the AI-service ids that receive the Shopper photo, its data-retention policy and period, a link to its terms and the date she read them, the image size and quality options it offers with the provider's price per image of each and its currency, and a confirmation that it accepts a Shopper photo and a saree image together
**And** the `approve-model` workflow refuses the entry with a named error for each missing item.

**Given** a provider's price in a currency other than rupees
**When** the list, a cost or a ceiling check needs it
**Then** it is converted to integer paise with the exchange-rate setting, a dated setting the Owner edits on this page and whose changes are audited (AD-32)
**And** the page shows each price in the provider's currency and in rupees at today's rate.

**Given** a vision-capable model that is to check results
**When** the Owner adds it
**Then** she marks it as a check model and records the same policy, terms, AI-service ids and price per check; a check model is not offered as a primary or fallback, and a generating model is not offered as a check model (AD-32)
**And** a check model that keeps images for training cannot be approved.

**Given** a model whose recorded policy says it keeps Shopper photos for training
**When** the Owner tries to approve it
**Then** it is refused and cannot be saved as approved.

**Given** a model that does not accept two images together
**When** the Owner leaves that confirmation unset
**Then** it is refused.

**Given** an approved model whose AI-service ids are not all in the latest published notice version
**When** the list is shown
**Then** the model is marked "not named in the published notice" with the missing AI services listed.

**Given** an approved model
**When** the Owner edits its price or policy, or removes it from the list
**Then** the change runs as a workflow and a `shop-audit` event holds the before and after values
**And** a model used by the current Model route cannot be removed, and an edit that would make it unapprovable is refused.

**Given** the page
**When** the Owner looks for a way to turn on request logging at the AI provider or turn off the no-retention option
**Then** there is none; the page states that both are fixed by the system.

**Requirements:** FR-40, FR-39, FR-46, FR-52; AD-10, AD-11, AD-14, AD-5, AD-32
**Notes for the developer:**
- `tryon` module: the `approved_model` entity with a kind (generating or check). The exchange rate is a key of the `settings` module. Workflows `approve-model`, `update-approved-model`, `remove-approved-model`. Routes under `admin/shop/tryon/models`. Admin page in `apps/commerce/src/admin`.
- A model reached through a different AI provider needs a new adapter in the worker (Story 4.5's port); the list accepts only provider names the worker reports.
- Choosing models for a Model route is Story 4.11.

---

### Story 4.8: Write Prompt versions

As an Owner,
I want to write and keep numbered Prompt versions,
So that I can improve the instructions sent with a Try-on request and know exactly which wording produced each result.

**Acceptance Criteria:**

**Given** the Owner on the Prompt versions page
**When** she saves a new prompt
**Then** a Prompt version is created as a draft with the next number, its text, her account and the time.

**Given** a draft Prompt version
**When** she edits and saves it
**Then** the text changes and a `shop-audit` event holds the before and after text.

**Given** a Prompt version that has been used in a test-bench run or published
**When** she tries to edit its text
**Then** the edit is refused and she is offered "copy to a new draft" instead, so a number always means one wording.

**Given** the page
**When** it shows a Prompt version
**Then** it states that safety wording set by the system is added to every request, and offers no control to edit or remove it.

**Given** a Prompt version's text is empty or longer than the maximum length in settings
**When** she saves
**Then** it is refused with the reason.

**Given** a draft
**When** she looks for a publish action
**Then** none is offered yet for a version that has not been run on the sample set.

**Requirements:** FR-41, FR-46; AD-10, AD-14
**Notes for the developer:**
- `tryon` module: the `prompt_version` entity with states draft, tested, published, retired. Workflows `save-prompt-version`, `copy-prompt-version`. Routes under `admin/shop/tryon/prompts`.
- The safety wording itself lives only in worker code (Story 4.5); the Admin shows a fixed sentence from a translation file.
- Seeds the prompt maximum length key in the `settings` module `[ASSUMPTION: 4,000 characters]`.
- Running a version on the sample set is Story 4.9; publishing and rolling back is Story 4.10.

---

### Story 4.9: The sample set and the test bench

As an Owner,
I want to run any approved model and Prompt version on a saved set of sample sarees and sample photos and see the outputs side by side,
So that I can judge border, pallu and colour before any Shopper sees a change.

**Acceptance Criteria:**

**Given** the Owner on the sample set page
**When** she adds a sample photo
**Then** she must record the person's name and the date that person agreed to this use, and the photo is stored privately under a samples prefix in `shopper-media`
**And** a sample photo without that record cannot be saved, and it is never shown to a Shopper
**And** objects under the samples prefix are left alone, by prefix, by `erase-shopper-media` and by every job that sweeps Shopper media (the retention job of Story 4.24 applies the same rule when it is built), because a sample person is not a Shopper (AD-22, AD-23); a sample person withdraws by asking the Owner, who deletes the sample photo.

**Given** the sample set page
**When** she adds a sample saree
**Then** she picks a product photo of an existing Design, and the set stores the Design and the photo.

**Given** a sample set with at least one sample saree and one sample photo
**When** she starts a run for a chosen approved model, size and quality option, check model and Prompt version
**Then** the `start-bench-run` workflow creates the run and enqueues one `tryon.bench` job per pair, each with a deterministic id
**And** before it starts she is shown the number of images and the cost at the recorded price per image, and must confirm.

**Given** a `tryon.bench` job
**When** the worker runs it
**Then** it uses the same `TryOnProvider` call, safety wording, no-retention and no-logging flags, time limit and `ResultCheck` as a Shopper's request, stores the output privately, and reports outcome, duration, cost and check verdict to commerce through `/internal/*`.

**Given** a finished or running run
**When** she opens it
**Then** each sample pair is a row showing the real saree photo, the sample photo and the outputs of every run selected for comparison side by side, with model, Prompt version, duration, cost and check verdict under each
**And** a failed, blocked or rejected item shows its outcome in place of an image.

**Given** a Prompt version in draft
**When** a run that used it finishes with every pair attempted
**Then** the Prompt version becomes tested.

**Given** test-bench spending
**When** it is recorded
**Then** it is kept apart from Shoppers' Try-on spending and does not count toward the daily cap.

**Given** the Owner deletes a run or a sample photo
**When** the workflow completes
**Then** its stored images are deleted from the bucket and a `shop-audit` event records the deletion
**And** deleting a sample photo also deletes every test-bench output made from it, which is how a sample person's withdrawal is honoured.

**Given** the automated tests for this story
**When** they run
**Then** they use the fake provider and the fake result check only.

**Requirements:** FR-43, FR-41, FR-52; AD-8, AD-9, AD-10, AD-22, AD-14
**Notes for the developer:**
- `tryon` module: entities `sample_photo`, `sample_saree`, `bench_run`, `bench_item`. Workflows `start-bench-run`, `record-bench-item`, `delete-bench-run`. Routes under `admin/shop/tryon/bench` and `internal/tryon/bench-items/:id`.
- `packages/contracts`: job `tryon.bench` and its payload. `apps/worker/src/jobs/tryon.bench`. The worker reads and writes images only through signed links from commerce, valid at most 10 minutes.
- Sample people are not Shoppers; their agreement is the record on the sample photo, not a Try-on consent. A bench run does not need the model's AI services to be in the published notice.
- Rating outputs is Story 4.25.
- The time limit used is the setting seeded in Story 4.5.

---

### Story 4.10: Publish a Prompt version and roll back

As an Owner,
I want to publish a tested Prompt version and return to the previous one in one action,
So that a better prompt reaches Shoppers without a release and a worse one can be undone at once.

**Acceptance Criteria:**

**Given** a Prompt version in the tested state
**When** the Owner publishes it
**Then** the `publish-prompt-version` workflow makes it the published Prompt version, retires the one before it, and records the time
**And** the next Try-on job that starts uses it, with no release.

**Given** a Prompt version in draft, never run on the sample set
**When** a publish is attempted, in the Admin or by calling the route directly
**Then** it is refused with `tryon.prompt_not_tested`.

**Given** a published Prompt version and an earlier one that was published before it
**When** the Owner chooses "roll back"
**Then** the earlier version is published again in one action and the current one is retired.

**Given** only one Prompt version has ever been published
**When** the Owner looks for roll back
**Then** it is not offered.

**Given** any publish or roll back
**When** it completes
**Then** a `shop-audit` event records who, when, and the before and after published version numbers.

**Requirements:** FR-41, FR-46; AD-4, AD-10, AD-14
**Notes for the developer:**
- `tryon` module and workflow `publish-prompt-version` (roll back is the same workflow with the earlier version as input). Routes under `admin/shop/tryon/prompts/:id/publish`.
- The published Prompt version is read by the worker at job start in Story 4.13.

---

### Story 4.11: Choose and publish a Model route within the guardrails

As an Owner,
I want to choose the primary and fallback model for Try-on and publish the choice without a release,
So that I can change models while the system stops me from breaking the consent notice or the cost ceiling.

**Acceptance Criteria:**

**Given** the Owner on the Model route page
**When** she drafts a Model route
**Then** she can choose a primary and a fallback only from the generating models on the Approved-model list, and for each the image size and quality from the options recorded for that model
**And** she must choose the check model that `ResultCheck` uses from the models marked as check models; a Model route without a check model cannot be saved for publishing (AD-32).

**Given** a draft Model route whose models' AI-service ids, and the check model's AI-service ids, are all in the latest published notice version, and whose price per image for each model plus the price per check, converted to paise with the exchange-rate setting, is at or under the cost ceiling
**When** she publishes it
**Then** the `publish-model-route` workflow makes it the current Model route with a new route number and the time
**And** the next Try-on job that starts uses it, with no release.

**Given** a draft Model route naming a model, generating or check, that sends Shopper photos or results to an AI service not named in the published notice
**When** she publishes it
**Then** it is refused with `tryon.route_service_not_in_notice`, the missing AI services are listed, and she is told to publish a new notice version first.

**Given** a draft Model route in which the primary or the fallback costs more than the cost ceiling
**When** she publishes it
**Then** it is refused with `tryon.route_over_cost_ceiling`, showing the ceiling and the cost.

**Given** the cost ceiling setting
**When** the Owner changes it
**Then** the change is a dated setting, audited, and a ceiling lower than the current Model route's cost is accepted only after she confirms that Try-on will be unavailable until a cheaper route is published.

**Given** a current Model route and a previous one
**When** she chooses "return to previous"
**Then** the previous route is published again in one action through the same workflow and the same checks; if it now fails a check it is refused with that check's error.

**Given** a new notice version is recorded (Story 4.1) that no longer names an AI service the current Model route uses
**When** `record-notice-version` completes
**Then** Try-on status becomes unavailable with reason "Model route not usable", the Owner is alerted by a `message.send` job, and Try-on returns when a usable route is published.

**Given** a model on the current Model route
**When** someone calls the publish route directly with a model that is not on the Approved-model list
**Then** it is refused.

**Given** any publish, return to previous, or change of ceiling
**When** it completes
**Then** a `shop-audit` event records who, when, and the before and after values.

**Requirements:** FR-39, FR-46, FR-52; NFR-3; AD-10, AD-11, AD-13, AD-14, AD-26, AD-32
**Notes for the developer:**
- `tryon` module: the `model_route` entity (numbered, immutable once published; primary, fallback and check model). Workflow `publish-model-route` in `apps/commerce/src/workflows`. Cost ceiling in the `settings` module. Routes under `admin/shop/tryon/route`.
- Extend `record-notice-version` (Story 3.2) and `store/shop/tryon/status` for the "Model route not usable" reason.
- No Try-on request exists yet; using the route is Story 4.13.

---

### Story 4.12: Request a Try-on result and follow its progress

As a Shopper,
I want my Try-on request accepted at once and to follow it without keeping the screen open,
So that I can keep browsing while my Try-on result is made.

**Acceptance Criteria:**

**Given** a signed-in Shopper with current Try-on consent, a stored Shopper photo, Try-on switched on and a usable Model route and published Prompt version
**When** she requests Try-on for a published Design
**Then** the `request-tryon` workflow creates a Try-on request in state queued, enqueues `tryon.generate` with a deterministic id made from the request id, and the route answers accepted with the request id straight away
**And** the saree image for the request is the Design's first product photo.

**Given** the same request is sent twice with the same `Idempotency-Key`
**When** the second arrives
**Then** the same request id is returned and one job exists.

**Given** a request
**When** any of these is true: no Shopper session; no current consent, or consent that does not name every AI service of the current Model route, its check model included; no stored Shopper photo; Try-on switched off; no usable Model route or published Prompt version; a Design that is not published; a Design outside the Owner's chosen Designs when that list is set (Story 4.2)
**Then** it is refused with a distinct stable error code for that case and nothing is enqueued.

**Given** the per-Shopper limit in settings is 10 Try-on results per day
**When** a Shopper already has 10 requests today that are queued, running or ready
**Then** her next request is refused with `tryon.limit_reached` and the time, at the next start of day in the business time zone, when she can try again
**And** requests that ended failed, blocked or rejected by the check are not counted.

**Given** the Try-on request rate limit in settings
**When** a Shopper sends requests faster than it allows, whatever their outcome
**Then** the middleware refuses them with a rate-limit error.

**Given** a Shopper already has a request for the same Design queued or running
**When** she asks again
**Then** she is given the existing request rather than a second one.

**Given** an accepted request
**When** the client calls `GET /store/shop/tryon/requests/:id`
**Then** it returns the state (queued, running, ready, blocked, failed, erased) and nothing about the model
**And** another Shopper's session gets "not found".

**Given** the "used Try-on" function of Story 3.21, which has answered "no" until now
**When** this story is finished
**Then** it reads Try-on requests: it answers "yes" when the Shopper has a Try-on request for that Design that was accepted before the Order was paid, and "no" otherwise, so every rating recorded from now on is linked to whether she used Try-on (FR-53)
**And** the answer is fixed when the Order is created: `confirm-payment` asks the function once per Order item and stores the yes or no on that item, so the rating link survives a later erasure, and an erased Try-on request keeps no Shopper identity (AD-23)
**And** the Owner's Ratings page of Story 3.21 then shows real figures in its "used Try-on" and "did not" split.

**Given** a Shopper who closed the browser after requesting
**When** she later calls `GET /store/shop/tryon/requests`
**Then** she gets her requests from the retention period with their Designs and states, so a result that became ready is shown to her on return.

**Requirements:** FR-11, FR-14, FR-9; AD-4, AD-8, AD-11, AD-13, AD-15, AD-19
**Notes for the developer:**
- `tryon` module: the `tryon_request` entity (Shopper, Design, photo, state, times; route, prompt, cost and attempt fields are filled by Story 4.13). Workflow `request-tryon`. Routes `store/shop/tryon/requests`.
- `packages/contracts`: job `tryon.generate` and its payload (request id only; never a link), the request view model, the error codes. `api-client`: `requestTryOn`, `getTryOnRequest`, `listTryOnRequests`.
- The per-Shopper limit value is the Try-on limit already in shop settings (FR-56, Epic 3). The daily spending cap is Story 4.18. The worker job is Story 4.13 and the Shopper's screen is Story 4.16; until then a request stays queued.

---

### Story 4.13: The `tryon.generate` job: start, primary model, check, store and cost

As a Shopper,
I want my request run on the main model, checked and stored safely,
So that I get a Try-on result when the main model can make one.

**Acceptance Criteria:**

**Given** a queued Try-on request
**When** the worker takes the job
**Then** it calls `/internal/tryon/requests/:id/start`, and the `start-tryon-request` workflow re-checks the switch and current consent naming the AI services to be used, sets the request to running, records the Model route with its check model, Prompt version, time limit and the primary attempt with its AI services, and returns them with signed read links valid at most 10 minutes for the Shopper photo and the saree image.

**Given** the start check fails because consent was withdrawn, the request is erased, or Try-on was switched off after acceptance
**When** the worker receives the answer
**Then** it calls no AI provider, the request ends failed (or stays erased), and it does not count against her limit.

**Given** the primary model returns an image within the 90-second time limit and `ResultCheck` passes it
**When** the worker finishes
**Then** it stores the provider's file unchanged in `shopper-media` through a signed write link, reports the result to `/internal/tryon/requests/:id/result`, and the `record-tryon-result` workflow sets the request to ready
**And** the request records the AI provider, model, check model, AI services, Prompt version, duration of each attempt and the cost in paise, converted from the provider's price with the exchange-rate setting in force when it is recorded (AD-32).

**Given** a stored Try-on result
**When** a test compares it with the bytes the provider returned
**Then** the stored object is byte-identical (the same hash), so provenance information placed in the image by the AI provider is kept (FR-12, AD-22).

**Given** the primary model fails, times out or is blocked, or `ResultCheck` does not return `pass`
**When** the worker reports it in this story
**Then** nothing is stored or shown, the request ends failed with the reason recorded, and it does not count against her limit; Story 4.14 replaces this single ending with the fallback call and the distinct blocked and rejected outcomes.

**Given** the job's logs, results and error reports
**When** they are inspected
**Then** they contain ids, states, durations and costs, and no photo, link or image bytes.

**Requirements:** FR-11, FR-12 (provenance kept), FR-52; NFR-2, NFR-3; AD-1, AD-8, AD-9, AD-10, AD-11, AD-22, AD-32
**Notes for the developer:**
- The check fails closed: `unassessable`, which includes the check model not answering, never lets a result be stored or shown (AD-32).
- `apps/worker/src/jobs/tryon.generate` using Story 4.5's port and Story 4.6's check. Commerce: workflows `start-tryon-request`, `record-tryon-attempt`, `record-tryon-result`; routes `internal/tryon/requests/:id/{start,attempts,result}`.
- The time limit is the dated setting seeded in Story 4.5 (90 seconds at launch, AD-13), read at job start, never hardcoded.
- Tests use the fake provider: success, start refused, and the single failure ending. The fallback and the other outcomes are Story 4.14; erasure of results and requests is Story 4.15.

---

### Story 4.14: The `tryon.generate` job: fallback, blocked, rejected and repeated runs

As a Shopper,
I want my request tried once on the fallback when the main model fails, and an honest answer when no result can be shown,
So that a fault at one model does not cost me my Try-on, and I am never shown a result that failed its check.

**Acceptance Criteria:**

**Given** the primary model fails or gives no result within 90 seconds
**When** the limit passes
**Then** the worker records a fallback attempt with commerce and calls the fallback model once, with its own 90-second limit.

**Given** the fallback also fails or times out
**When** the worker reports it
**Then** the request ends failed, the Shopper is told her Try-on could not be made, and the attempt does not count against her limit.

**Given** an AI provider's safety check blocks the request, on the primary
**When** the worker receives `blocked`
**Then** the fallback is not called with the same photo, the request ends blocked, and the Shopper is asked for a different photo in neutral words
**And** a new request with the same Shopper photo is refused with `tryon.photo_blocked` until she replaces the photo.

**Given** `ResultCheck` returns `reject` or `unassessable` for a generated image
**When** the worker handles it
**Then** the image is not stored and not shown, the request ends with the outcome "rejected by check", it is counted as blocked in the cost and failure figures, its cost is still recorded, and the Shopper sees the same neutral failure message without being blamed.

**Given** the job runs twice, or the worker stops in the middle of an attempt
**When** the job runs again
**Then** a request already finished is left alone, an attempt recorded as started without an outcome is treated as failed, and no request ever causes more than one primary call and one fallback call.

**Given** a fallback attempt that returns an image
**When** `ResultCheck` passes it
**Then** it is stored, recorded and costed exactly as a primary result is in Story 4.13, with both attempts' durations and costs on the request.

**Requirements:** FR-11, FR-52; NFR-2, NFR-3; AD-8, AD-10, AD-22, AD-32
**Notes for the developer:**
- Extends `apps/worker/src/jobs/tryon.generate` and the workflows `record-tryon-attempt` and `record-tryon-result` of Story 4.13; adds the outcomes blocked and "rejected by check" and the error code `tryon.photo_blocked` (checked in `request-tryon`).
- Tests use the fake provider: timeout then fallback success, both fail, blocked, check reject, check unassessable, double run, worker stopped mid-attempt.
- A request left queued or running for too long is ended by the scheduled job of Story 4.17.

---

### Story 4.15: Erasure reaches Try-on results and requests

As a Shopper,
I want my Try-on results and requests erased with my photos, and no result to appear after I have erased,
So that erasure leaves nothing of me behind and no late job brings an image back.

**Acceptance Criteria:**

**Given** a Shopper whose account is deleted, or whose media are erased, after this story
**When** `erase-shopper-media` runs
**Then** it deletes her Try-on result files, marks her Try-on requests erased, and removes personal fields from them while keeping model, cost and times.

**Given** a result is reported for a request that has been marked erased
**When** `record-tryon-result` runs
**Then** the result is discarded, any stored file for it is deleted, the discard is written to the erasure ledger, and the request stays erased.

**Given** a request marked erased while its job is still queued
**When** the worker asks to start it
**Then** the start is refused as in Story 4.13 and no AI provider is called.

**Given** `erase-shopper-media` fails after deleting some result files
**When** it is retried
**Then** it resumes from the erasure ledger, deletes the rest, and marks each request erased once.

**Given** erased requests
**When** the Shopper lists her Try-on requests
**Then** none of them returns an image or a link.

**Requirements:** FR-15, FR-27; NFR-6; AD-4, AD-22, AD-23
**Notes for the developer:**
- Extends the `erase-shopper-media` workflow of Story 3.23, which Story 4.4 extended to Shopper photos, to cover Try-on result files and Try-on requests; it stays the only erasure path (AD-23).
- Extends `record-tryon-result` of Story 4.13 with the discard rule.
- Requests to AI providers for erasure are Story 4.23; withdrawal, which calls this workflow for a whole Shopper, is Story 4.22.
- Tests use the fake provider: erased before start, erased before result, erasure retried part-way.

---

### Story 4.16: See the Try-on result, labelled as AI-generated, and add the Design to the cart

As a Shopper,
I want to see my Try-on result clearly marked as AI-generated, with a way back to the real photos and a way to buy,
So that I can judge the saree on me without mistaking the image for a photograph.

**Acceptance Criteria:**

**Given** a request that is queued or running
**When** the Shopper is on the Try-on screen
**Then** she sees progress, the screen polls the status, and she can leave; on any later visit a ready result for that Design is shown to her without a new request.

**Given** a ready request
**When** the client asks for it
**Then** commerce returns a signed link valid at most 10 minutes, and the client draws a visible "AI-generated" label over the image wherever it is shown, including in her list of Try-on results
**And** when a link has expired the client asks again rather than showing a broken image.

**Given** the result screen
**When** it is shown
**Then** beside the result she is pointed to the Design's real photos and the Full saree view for true colour and design, each one tap away
**And** the Try-on result never appears among the Design's product photos, on the Design page gallery, in the catalogue or to any other Shopper.

**Given** the result screen
**When** she chooses "add to cart"
**Then** the Design's Variant is added to her cart through the existing cart function, with the same stock rules as on the Design page, and a sold-out Variant shows as sold out.

**Given** the result screen
**When** she chooses to save or share the image
**Then** the client fetches `GET /store/shop/tryon/requests/:id/labelled`, which returns a copy with the "AI-generated" label drawn into the pixels in her language, and offers only that copy
**And** the stored original stays unchanged, the route is refused for any other Shopper, and its answer is never cached by a shared cache
**And** the labelled copy carries over the provenance metadata of the stored original where the image format and sharp allow it; where they do not, the limit is written in `docs/`, and the stored original, byte-identical to the provider's file (Story 4.13), remains the record (FR-12).

**Given** a request that ended failed, blocked, or rejected by the check, or a refusal with `tryon.limit_reached`, `tryon.photo_blocked` or Try-on unavailable
**When** the Shopper sees the screen
**Then** each case has its own plain message from the translation file: could not be made and not counted; please choose a different photo, in neutral words; limit reached, with the time she can try again; Try-on is not available now.

**Given** a screen reader or the largest system font size
**When** the result screen is used
**Then** the label is announced with the image and every action is reachable.

**Requirements:** FR-11, FR-12, FR-14, FR-54; AD-2, AD-22; NFR-15
**Notes for the developer:**
- `apps/web`: the Try-on screen (progress, result, messages, list of her results), styled from DESIGN.md when it exists. Data only through `packages/api-client`.
- `apps/commerce`: route `store/shop/tryon/requests/:id/labelled`, drawing the label with sharp, which is already in the stack; label text from the translation file.
- Reading a result or the labelled copy counts as use for retention (Story 4.24 reads the last-used time; record it here on the request and photo).
- Reporting a result is Story 4.19. "Try-on result ready" is shown in the product, not sent by SMS (FR-54); there is no push service at launch, so a ready result is found by polling (spine, Consistency Conventions).

---

### Story 4.17: Try-on never slows or breaks the Design page

As a Shopper,
I want the Design page and my purchase to work whatever state Try-on is in,
So that a problem with AI never stops me buying a saree.

**Acceptance Criteria:**

**Given** the worker is stopped or the shop queue is unreachable
**When** a Shopper requests Try-on
**Then** the request is refused with "Try-on is not available now" or stays queued, and the Design page, cart and checkout behave as before.

**Given** a request that has been queued or running longer than twice the time limit plus five minutes
**When** the scheduled `expire-stale-tryon-requests` job runs
**Then** the request ends failed, does not count against her limit, and she sees the "could not be made" message.

**Given** commerce's Try-on status route is slow or fails
**When** the Design page loads
**Then** the page is usable within its normal time and the Try-on entry point is simply absent.

**Given** 20 fake-provider requests with a fixed delay
**When** they are run through the queue in a test
**Then** the time from acceptance to ready is recorded for each request, so that NFR-2 (95% within 60 seconds) can be measured from the same field in Story 4.20.

**Given** the worker's concurrency setting for `tryon.generate`
**When** more requests are queued than it allows
**Then** they wait in order and none is lost.

**Requirements:** FR-11; NFR-1, NFR-2; AD-4, AD-8
**Notes for the developer:**
- `apps/commerce/src/jobs`: `expire-stale-tryon-requests`, which starts a workflow (AD-4). Worker concurrency is an environment variable.
- `apps/web`: the entry point's failure path. No new entity.
- Alerts on a rising Try-on failure rate (NFR-9) are Story 7.2, which reads the Try-on request records. The 80% spend alert is built in Story 4.18.

---

### Story 4.18: The daily spending cap

As an Owner,
I want a daily cap on Try-on spending with a warning before it is reached,
So that a busy day or a fault cannot run up a bill I did not agree to.

**Acceptance Criteria:**

**Given** the Owner on the Try-on controls page
**When** she sets the daily spending cap in rupees
**Then** it is stored as a dated setting, takes effect without a release, and a `shop-audit` event records the before and after values.

**Given** a day in the business time zone
**When** a Try-on request is accepted
**Then** `request-tryon` reserves the higher of the primary and fallback price per image plus the price per check, and committed spend for the day is recorded cost plus reservations of requests still queued or running.

**Given** committed spend would pass the cap with one more request
**When** a Shopper requests Try-on
**Then** the request is refused with `tryon.paused_daily_cap`, she is told plainly that Try-on is paused for today and when it returns, and the status route reports unavailable with that reason
**And** the Owner is alerted once by a `message.send` job by email and SMS.

**Given** the daily cap is reached while a request is already running
**When** that request finishes
**Then** it is completed and shown; only new requests are refused, so spend never passes the cap by more than requests accepted before it.

**Given** committed spend first reaches 80% of the cap in a day
**When** the request that crosses it is accepted
**Then** the Owner is alerted once that day, within 5 minutes, by a `message.send` job whose id is the day plus "cap-80".

**Given** a request ends failed or blocked with a lower cost than reserved
**When** its result is recorded
**Then** the reservation is replaced by the recorded cost and the freed amount is available again.

**Given** the next day begins in the business time zone
**When** a Shopper requests Try-on
**Then** the pause has ended without any action by the Owner.

**Given** the Owner raises the cap during a pause
**When** the setting is saved
**Then** Try-on resumes at once.

**Given** no cap has been set
**When** the Owner tries to switch Try-on on
**Then** she is asked to set a cap first.

**Requirements:** FR-42, FR-14; NFR-9, NFR-3; AD-13, AD-14, AD-26
**Notes for the developer:**
- `settings` module for the cap; `tryon` module for the day's committed spend (a query over Try-on requests, not a separate counter that can drift). Extend `request-tryon`, `record-tryon-result` and `store/shop/tryon/status`.
- Message templates for the two alerts go into content; sending uses the existing `message.send` job.
- Test-bench spending is outside the cap (Story 4.9).

---

### Story 4.19: Report a Try-on result, and the Owner's review queue

As a Shopper,
I want to report a Try-on result as wrong or offensive from the screen where I see it,
So that the shop learns about bad results and can act.

**Acceptance Criteria:**

**Given** a Shopper looking at her Try-on result
**When** she chooses "report"
**Then** she picks "wrong" or "offensive", may add a short comment, and the `report-tryon-result` workflow records the report with the request's Design, Model route and Prompt version
**And** she is told it has been sent; reporting the same result again updates nothing and tells her it is already reported.

**Given** a report on a result that is not hers, or on a request that is not ready
**When** the route is called
**Then** it is refused.

**Given** the Owner on the review queue page
**When** she opens it
**Then** every reported Try-on result is listed with the Design, the Model route, the Prompt version, the Shopper's reason and comment, and the time
**And** she can filter by handled or not handled, and by Model route.

**Given** an entry in the queue
**When** the Owner opens the reported image
**Then** it is shown through a signed link valid at most 10 minutes with the "AI-generated" label drawn over it, and an access event is recorded for that Shopper's personal data, kept one year.

**Given** an entry
**When** the Owner marks it handled, with an optional note
**Then** the `handle-tryon-report` workflow records it and a `shop-audit` event is written; she can reopen it the same way.

**Given** a reported result that has since been erased
**When** the Owner opens the entry
**Then** the entry still shows the Design, Model route, Prompt version and reason, states that the image was erased, and shows no image and no Shopper identity.

**Given** the list itself
**When** it is shown
**Then** it contains no image thumbnails, so that only a deliberate open is an access.

**Requirements:** FR-13, FR-44; AD-14, AD-22; NFR-5
**Notes for the developer:**
- `tryon` module: the `tryon_report` entity. Workflows `report-tryon-result`, `handle-tryon-report`. Routes `store/shop/tryon/requests/:id/report` and `admin/shop/tryon/reports`.
- `apps/web`: the report control on the result screen (Story 4.16). `apps/commerce/src/admin`: the review queue page.
- A new unhandled report alerts the Owner through the existing `message.send` job, at most once an hour.

---

### Story 4.20: The cost and failure view

As an Owner,
I want to see by day and by Model route how many Try-on results were made, what they cost, how long they took and how many failed or were blocked,
So that I can tell whether a route is worth its price and meets its time target.

**Acceptance Criteria:**

**Given** the Owner on the cost and failure page
**When** she picks a range of days
**Then** each row is one day and one Model route, showing: requests, Try-on results made, failed, blocked by an AI provider, rejected by the check, fallback used, total cost, cost per result, median and 95th-percentile time from request to result, and the share that arrived within 60 seconds.

**Given** a day with sales
**When** the row is shown
**Then** the day's Try-on cost is also shown as a share of that day's sales value, and as "no sales" when there were none.

**Given** a request finished 61 minutes ago
**When** the page is opened
**Then** it is included; the page states the time of its figures, which are never more than one hour old.

**Given** requests whose Shopper data has been erased
**When** the figures are computed
**Then** they are still counted, because model, cost and times are kept (AD-23).

**Given** test-bench runs in the range
**When** the page is shown
**Then** their cost is shown on a separate line and is not mixed into Shoppers' figures.

**Given** provider-reported amounts
**When** the Owner opens a row's detail
**Then** the total reported by the AI provider is shown by currency beside the recorded cost in rupees, which was converted with the exchange-rate setting when each cost was recorded and is not converted again when the rate changes (AD-32).

**Given** days are counted
**When** a request falls near midnight
**Then** it belongs to the day of its acceptance in the business time zone.

**Requirements:** FR-45, FR-52; NFR-2, NFR-3; AD-10, AD-13, AD-23
**Notes for the developer:**
- Route `admin/shop/tryon/costs` reading the `tryon` module and the day's Order totals from the kernel in one read-only query step; no module calls another (the route composes them). Admin page in `apps/commerce/src/admin`.
- No new entity: figures are computed from Try-on requests and attempts. Add indexes if the query needs them.
- The page shows no Shopper identity and no images, so it records no access event.

---

### Story 4.21: The change history of Try-on controls

As an Owner,
I want one history of every change to the Model route, the Approved-model list, Prompt versions, limits, the chosen Designs, the cap, the cost ceiling, the exchange rate and the off switch,
So that I can see who changed what and when, and nobody can rewrite it.

**Acceptance Criteria:**

**Given** the Owner on the Try-on change history page
**When** she opens it
**Then** every such change is listed newest first with who made it, when, the action, and the before and after values
**And** she can filter by kind of change and by date.

**Given** each workflow from Stories 4.2, 4.7, 4.8, 4.10, 4.11 and 4.18, and the Try-on limit in shop settings
**When** a test runs the workflow
**Then** exactly one `shop-audit` event with before and after values appears in the history, and a refused change writes none.

**Given** a publish of a notice version in content
**When** the history is shown
**Then** the notice version recorded by commerce (Story 4.1) appears as an entry, with the content admin's email as actor.

**Given** any Admin account, the Admin pages and the shop routes
**When** someone tries to edit or delete a history entry
**Then** there is no page control and no route that does it; a direct call is refused.

**Given** a long prompt text in before and after values
**When** the entry is opened
**Then** both texts are shown in full with the differences marked.

**Requirements:** FR-46; AD-14
**Notes for the developer:**
- Route `admin/shop/tryon/history` reading the existing `shop-audit` module with a fixed list of Try-on action names from `packages/contracts`. Admin page in `apps/commerce/src/admin`.
- No new entity. This story also adds the test that walks every Try-on control workflow and fails if one writes no audit event.

---

### Story 4.22: Withdraw Try-on consent and erase everything

As a Shopper,
I want to withdraw my Try-on consent as easily as I gave it,
So that my photos and Try-on results are gone and nothing more is sent anywhere.

**Acceptance Criteria:**

**Given** a Shopper with Try-on consent
**When** she opens her account or the Try-on screen
**Then** "withdraw Try-on consent" is offered in both places and takes one action and one confirmation, no more steps than giving consent.

**Given** she confirms withdrawal
**When** the `withdraw-tryon-consent` workflow runs
**Then** her consent is recorded as withdrawn with the time, and `erase-shopper-media` is started for all her Try-on media
**And** from that moment a Try-on request from her is refused with `tryon.consent_required`.

**Given** `erase-shopper-media` runs for her
**When** it completes
**Then** her Shopper photos and Try-on result files are deleted from `shopper-media`, her Try-on requests are marked erased with personal fields removed and model, cost and times kept, and every step is written to the erasure ledger
**And** her signed links no longer return an image, and her list of Try-on results is empty.

**Given** she has a request queued or running when she withdraws
**When** the worker asks to start it, or reports a result for it
**Then** a job not yet started calls no AI provider, and a result arriving after withdrawal is discarded and not stored, with the discard written to the erasure ledger.

**Given** a step of the erasure fails, for example the bucket is unreachable
**When** the workflow retries
**Then** it resumes without repeating finished steps, the ledger shows the failure and the retry, and the withdrawal itself stays recorded.

**Given** a Shopper who withdrew
**When** she opens Try-on again
**Then** she is shown the consent notice again and, on accepting, starts with no stored photo.

**Given** withdrawal
**When** it completes
**Then** her Orders, invoices, cart and account are untouched, and the consent and withdrawal records are kept as evidence.

**Given** the Owner looks up the Shopper in Shopper support
**When** she views consents
**Then** the withdrawal and the state of the erasure are shown.

**Requirements:** FR-15; NFR-6; AD-11, AD-23, AD-22, AD-4
**Notes for the developer:**
- Workflow `withdraw-tryon-consent` in `apps/commerce/src/workflows`; route `store/shop/tryon/consent/withdraw`; `consent` module records withdrawal as a new fact, never by editing the acceptance row.
- `erase-shopper-media` already covers photos (Story 4.4) and results (Story 4.15); this story adds the whole-Shopper trigger, resumable steps and the ledger rows for each.
- `apps/web`: the withdrawal control in account and on the Try-on screen, styled from DESIGN.md when it exists.
- Erasure requests to AI providers and the 24-hour check are Story 4.23.

---

### Story 4.23: Ask AI providers to erase, and keep the erasure ledger honest

As a Shopper,
I want the AI services that received my photo asked to erase it, and the outcome recorded,
So that erasure does not stop at the shop's own storage.

**Acceptance Criteria:**

**Given** `erase-shopper-media` runs for a Shopper, or for one photo or result
**When** it finishes deleting the shop's own files
**Then** it enqueues one `media.erase-at-provider` job for each AI service that received a photo in the erased requests, including an attempt that had started but not finished, each with a deterministic id made from the erasure id and the AI-service id
**And** an erasure whose requests reached no AI service enqueues none and the ledger says so.

**Given** a `media.erase-at-provider` job
**When** the worker runs it
**Then** it calls `requestErasure` on the `TryOnProvider` for that AI service and reports the answer to `/internal/erasure/:id/provider-outcome`, and the `record-provider-erasure` workflow writes it to the erasure ledger with the time.

**Given** the answer is `confirmed` or `accepted`
**When** it is recorded
**Then** that AI service's line in the ledger is closed.

**Given** the answer is `unsupported` because the AI provider offers no erasure call
**When** it is recorded
**Then** the ledger line reads "not supported; relies on the provider's stated retention" and is closed (AD-32)
**And** the Owner is alerted once for that provider by a `message.send` job whose id is the provider plus "erasure-unsupported", not once per request or per erasure.

**Given** the answer is `failed`, or no answer arrives after the job's retries
**When** it is recorded
**Then** the Owner is alerted by a `message.send` job naming the AI service and the erasure, without the Shopper's photo
**And** the Owner can record in the Admin what she did by hand (for example a written request to the provider) and its outcome, which closes the line and is audited.

**Given** an erasure started more than 24 hours ago with any step or provider line still open
**When** the scheduled erasure-deadline job runs
**Then** the Owner is alerted, and the erasure is listed as overdue on the erasure ledger page.

**Given** the Owner on the erasure ledger page
**When** she opens it
**Then** each erasure shows its cause (withdrawal, single item, retention, account deletion, depicted person's request), its steps, each AI service's outcome and its times
**And** no page or route edits or deletes a ledger entry.

**Given** the job runs twice
**When** the second run reports
**Then** the ledger holds one outcome for that AI service and the Owner is alerted at most once.

**Given** a data request under FR-28
**When** the Owner answers it for a Shopper
**Then** the AI services that received her Shopper photos can be read from her requests and ledger entries
**And** the data report of Story 3.24 now also lists her Try-on consents with version, language and time, her withdrawals, whether a Shopper photo is stored and since when, and her Try-on requests with state and time only, never an image or a link (FR-28).

**Requirements:** FR-15, FR-28; NFR-6; AD-8, AD-9, AD-10, AD-23, AD-26, AD-32
**Notes for the developer:**
- `apps/worker/src/jobs/media.erase-at-provider`; the `media.erase-at-provider` payload that Story 3.23 put in `packages/contracts` (erasure id and AI-service id; never a photo). Commerce: workflow `record-provider-erasure`, route `internal/erasure/:id/provider-outcome`, Admin ledger page. The erasure-deadline job in `apps/commerce/src/jobs` exists from Story 3.23; extend it to count open provider lines.
- This story also extends the one function of Story 3.24 that lists the AI providers that received a Shopper's photos, and adds the Try-on section (consents, withdrawals, stored photo, requests) to the `prepare-data-report` workflow of that story.
- Tests use the fake provider for `confirmed`, `accepted`, `unsupported`, `failed` and no answer.
- With the no-retention option always set (Story 4.5) an AI provider may hold nothing to erase; the request is still sent and the answer recorded.

---

### Story 4.24: Delete a single item, and delete what has not been used for 30 days

As a Shopper,
I want to delete one Shopper photo or one Try-on result when I choose, and to have unused ones deleted for me,
So that nothing of me is kept longer than I want or longer than the notice says.

**Acceptance Criteria:**

**Given** a Shopper looking at her stored Shopper photo or one of her Try-on results
**When** she chooses delete and confirms
**Then** `erase-shopper-media` runs scoped to that item, with the same steps as withdrawal including the AI-service requests of Story 4.23, and her consent and other items stay as they are.

**Given** she deletes her Shopper photo while a request using it is running
**When** the result arrives
**Then** it is discarded and not stored.

**Given** the retention period in settings is 30 days
**When** the scheduled retention job runs each day
**Then** every Shopper photo and Try-on result whose last use is more than 30 days ago is erased through `erase-shopper-media` with the cause "retention"
**And** an item used 29 days ago is kept.

**Given** "last use"
**When** it is computed
**Then** a Shopper photo is used when it is uploaded, shown to her or used in a request; a Try-on result is used when it is made, shown to her or fetched as a labelled copy; a view by the Owner in the review queue is not a use.

**Given** the retention period shown in the published Try-on consent notice differs from the retention setting
**When** the Owner saves either
**Then** she is warned that they differ, and the Try-on controls page shows the mismatch until they agree.

**Given** the grievance form of Story 3.22
**When** this story is finished
**Then** it offers one more request type, "I appear in a Try-on image without agreeing", open to a person who is not signed in; it creates a ticket with a number, an acknowledgement and the same two deadlines, asks for a description and a way to answer her, and never asks her to upload the image (FR-9).

**Given** a person who appears in a Try-on result or Shopper photo without agreeing asks for removal through the published contact
**When** the Owner finds the item in Shopper support and chooses "erase this item"
**Then** `erase-shopper-media` runs scoped to it with the cause "depicted person's request", the view is recorded as an access event, and the action is audited.

**Given** the retention job fails part-way
**When** it next runs
**Then** it continues with the remaining items and erases none twice.

**Requirements:** FR-15, FR-51, FR-9; NFR-6; AD-4, AD-13, AD-14, AD-23
**Notes for the developer:**
- Routes `store/shop/tryon/photo` (delete) and `store/shop/tryon/requests/:id` (delete); job `retention` in `apps/commerce/src/jobs`, which only starts the workflow; the retention period is a dated setting.
- `apps/web`: delete controls on the photo step and the result screen, and the new request type on the grievance form (the `complaint` module's type list in `packages/contracts`). Admin: "erase this item" in Shopper support.
- The retention job and every Shopper erasure skip the samples prefix of Story 4.9.
- The last-used time was recorded from Story 4.16 on; this story adds any missing writes and the tests at 29, 30 and 31 days.

---

### Story 4.25: The launch gate tools: rating view, decision record and the rules that follow from it

As an Owner,
I want a blind rating view for test-bench outputs and a recorded launch gate decision that the off switch obeys,
So that Try-on can be switched on only on the strength of a recorded test.

**Acceptance Criteria:**

**Given** a finished test-bench run
**When** the Owner opens its rating view and enters a rater's name
**Then** the rater is shown each sample pair's outputs beside the real saree photo with models hidden behind letters in a shuffled order, and gives each output a score from 1 to 5 for border, for pallu and for colour, and marks whether it is still a draped saree
**And** scores are stored per rater and per output, and the run's summary shows, per model and Prompt version, the mean of each score, the share of outputs still a draped saree, the cost per image and the 95th-percentile time.

**Given** runs chosen for a decision
**When** any output of any model in them lacks a score from any named rater
**Then** a decision cannot be recorded, and the page lists what is missing.

**Given** the ratings are complete
**When** the Owner records the decision on the launch gate page
**Then** she enters the pass mark she has set, the raters, and one of: go (with the model and Prompt version to publish), no-go, or narrow (go only for the Designs she lists)
**And** the decision is stored with the runs it rests on, her account and the time, is audited, and cannot be edited; a later test records a new decision.

**Given** the decision is no-go, or no decision has been recorded
**When** anyone tries to switch Try-on on
**Then** `set-tryon-switch` refuses, the switch stays off, and the shop launches without Try-on: no entry point on any Design page.

**Given** the decision is narrow
**When** it is recorded
**Then** `record-gate-decision` sets the Owner's chosen-Designs limit of Story 4.2 to the listed Designs, through `set-tryon-designs`, so the narrow outcome is applied by the same control the Owner can use at any time (FR-42)
**And** when Try-on is switched on, the status route answers available only for those Designs, the entry point is absent on every other Design, and a request for another Design is refused (Stories 4.2 and 4.12).

**Given** the automated tests for the rating view, the decision record, the switch rule and the chosen-Designs limit
**When** they run
**Then** they use the fake provider and pass with no real AI provider and no human rater.

**Requirements:** PRD §6.3; FR-43, FR-42; AD-10, AD-14
**Notes for the developer:**
- `tryon` module: entities `bench_rating` and `gate_decision`; workflows `rate-bench-item`, `record-gate-decision`; extend `set-tryon-switch` for the decision; the Design list is the chosen-Designs setting of Story 4.2, not a second list. Admin pages: rating view and launch gate.
- This story is complete when the tools are built and tested with the fake provider. Running the gate with real sarees, real people and real providers is Story 4.26, which the Owner does.
- The research found that untuned older try-on models turned sarees into western-style garments; the "still a draped saree" mark exists to catch exactly that.

---

### Story 4.26: The Owner runs the launch gate and records the decision

As an Owner,
I want real sarees and consenting adults' photos run through the candidate models and rated by saree buyers, with the decision recorded,
So that Try-on ships only if it shows border, pallu and colour faithfully, and stays off if it does not.

**Acceptance Criteria:**

**Given** the launch gate
**When** the Owner prepares it
**Then** the sample set holds real sarees from the launch catalogue covering its weaves and border styles, and full-length photos of adults who each agreed to this use (recorded as in Story 4.9); no Shopper's photo is used.

**Given** the candidate models in the technical research (OpenAI `gpt-image-2.6`, Google `gemini-nano-banana-2.1`, Qwen-Image-Edit-2511 untuned, FASHN v1.6)
**When** the Owner runs the gate on staging with the real provider key
**Then** each candidate reachable through the OpenRouter adapter and approvable under Story 4.7 is approved and run on the whole sample set through the real AI provider
**And** each candidate that cannot be reached or approved is recorded in the decision as not tested, with the reason.

**Given** the runs are finished
**When** saree buyers named by the Owner rate them in the rating view of Story 4.25
**Then** every output of every tested model has scores from every rater, and the Owner records go, no-go or narrow with her pass mark on the launch gate page.

**Given** the decision is go or narrow
**When** the Owner publishes the Model route
**Then** it still passes every check of Story 4.11, including the notice naming its AI services and the cost ceiling
**And** she resets the Try-on time target and the cost ceiling in settings from the measured figures (NFR-2, NFR-3).

**Given** no candidate passes
**When** the decision is recorded as no-go
**Then** the switch stays off by the rule of Story 4.25 and the shop launches without Try-on (PRD §6.3).

**Requirements:** PRD §6.3; FR-43, FR-42, FR-39; NFR-2, NFR-3; AD-10
**Notes for the developer:**
- This is the Owner's task, not a build task: it needs real sarees, consenting adults, human raters and real provider keys, and a developer agent cannot finish it. It is tracked as an item on the launch checklist of Story 7.14 and is complete when a decision is recorded.
- What a developer agent can do here: check that Story 4.25's pages work on staging with the real key configured, prepare a one-page run sheet in `docs/` for the Owner, and hand the story back marked "waiting for the Owner".
- A fine-tuned or self-hosted model is deferred by the spine; if no candidate passes, that is the next thing to try, behind a new adapter.

## Epic 5: The Owner changes the shop's screens without a release

The Owner builds the home, category and campaign screens, and one region of the Design page, from Blocks in the content admin. She saves drafts, previews a screen at phone size as a Shopper would see it, publishes it now or at a set time, and returns to an earlier version. Published screens appear on the website without a release, with live prices and availability. A screen can only arrange components and actions already built in, and a client that meets a Block it does not know, or cannot fetch a screen, still shows something useful. The Android app renders the same screens in Epic 6.

**FRs covered:** FR-30, FR-31, FR-32, FR-33 (on the website)

**Conventions for every story in this epic**

- Shopper-facing screens are described by behaviour only; they are styled from DESIGN.md when it exists.
- Screens and Blocks are owned by the content application (AD-3). Content refers to a Design or a Weaver only by its commerce id and never stores price, stock or attributes.
- Every create, save, publish, schedule and restore in the content admin writes an audit event to content's append-only collection with the Owner's email, the time, the action and the before and after values (AD-14). Stories do not repeat this in each criterion.
- The content admin is reached through the access gate and the Owner's content sign-in (AD-15).
- Items tagged `[ASSUMPTION]` are choices made while writing the stories where the PRD and spine are still silent; each says what is assumed.
- This epic builds on the content application of Stories 1.23 and 3.1 (gate, audit rule, versioning helper, content reader in commerce) and on the first `ScreenV1` schema and `packages/blocks` of Story 1.28.

---

### Story 5.1: The Owner builds a screen from Blocks and saves it as a draft

As an Owner,
I want to build a Server-driven screen by adding, editing and reordering Blocks, and save it as a draft,
So that I can prepare the home screen or a campaign without it going live.

**Acceptance Criteria:**

**Given** the Owner is signed in to the content admin
**When** she creates a screen
**Then** she gives it a kind (home, category or campaign), a name and, for a category or campaign, an address that is unique among screens
**And** there is exactly one home screen; a second cannot be created

**Given** a screen is open
**When** she adds a Block
**Then** she can choose a banner, a text Block or an image Block, and fill in that type's properties as defined in `packages/blocks`
**And** a Block type that is not defined in `packages/blocks` cannot be added

**Given** a screen with several Blocks
**When** she moves a Block up or down, or removes one, and saves
**Then** the saved draft holds the Blocks in the new order

**Given** a banner or image Block
**When** she uploads its image
**Then** the image is stored in the `catalog` bucket and she must enter a description of the image for screen readers
**And** saving without that description is refused

**Given** a banner or image Block
**When** she gives it an action
**Then** she chooses one action from the fixed list in `packages/contracts`, which is AD-12's: `open-design`, `open-weaver`, `open-category` (a category screen), `open-screen` (another Server-driven screen), `open-search` (the Designs page with a search or filters) and `open-link` (an address on the same site only, such as a policy or notice page)
**And** `open-link` refuses any address that is not on the shop's own site, and there is no field in which code, markup or an expression can be entered as an action

**Given** a text, banner or image Block
**When** she enters its wording
**Then** she can enter it for English and for each configured language, the list read from the `/internal/settings/languages` lookup of Story 3.2, and a missing translation falls back to English (NFR-14)

**Given** a draft screen
**When** she saves it
**Then** it is stored as a draft version and is not visible to any Shopper
**And** the saved document passes the `ScreenV1` schema's checks for Block types, properties and actions, or the save is refused naming the Block at fault

**Given** a screen that has never been published
**When** she deletes it
**Then** it is removed; a published screen cannot be deleted, only replaced or unpublished

**Requirements:** FR-30, FR-31 (draft), FR-33; AD-3, AD-12, AD-14, AD-15, AD-19
**Notes for the developer:**
- Completes the `ScreenV1` schema that Story 1.28 began in `packages/contracts` and adds the fixed action list of AD-12 to it; completes `packages/blocks`, which Story 1.28 created for its sample, with the full properties of banner, text and image (no UI code); creates the screens collection with drafts in `apps/content`, using the versioning helper and audit rule of Story 3.1.
- `ScreenV1` and Block properties may only ever gain optional fields (AD-12); write the schema so that unknown fields are ignored by readers.
- Blocks that show Designs or Weavers are Story 5.2. Publishing is Story 5.3. The Design-page region is Story 5.5.

---

### Story 5.2: The Owner adds Blocks that show Designs and Weavers

As an Owner,
I want to add a row of Designs, a grid of Designs or a Weaver story to a screen, filled by hand or by a rule,
So that the screen shows the sarees and Weavers I choose and stays current without my editing it.

**Acceptance Criteria:**

**Given** a screen is open
**When** the Owner adds a Block
**Then** the list of types now also offers a row of Designs, a grid of Designs and a Weaver story, making the six launch Blocks of FR-30

**Given** a row or grid of Designs set to "by hand"
**When** she searches for Designs by name in the picker and chooses some
**Then** the Block stores their commerce ids in the order she set
**And** the picker shows only published Designs, with the name and photo read from commerce at that moment

**Given** a row or grid of Designs set to "by rule"
**When** she chooses the rule "newest", or a filter of fibre, weave, colour, occasion, Weaver or price range, and a number of Designs to show between 1 and 24 `[ASSUMPTION: the limit]`
**Then** the Block stores the rule and the number, not a list of Designs

**Given** a Weaver story Block
**When** she chooses a Weaver in the picker
**Then** the Block stores that Weaver's commerce id
**And** the story text itself is not copied into content

**Given** a row, grid or Weaver story Block
**When** she saves it with no Design chosen, no rule set, or no Weaver chosen
**Then** the save is refused naming the Block

**Given** a hand-filled Block
**When** the same Design is chosen twice
**Then** the second choice is refused

**Given** commerce cannot be reached
**When** she opens the picker
**Then** she is told the catalogue cannot be read just now, and the rest of the screen can still be edited and saved

**Given** any of these Blocks
**When** the draft is saved
**Then** the stored document holds only ids, rules, counts and headings; no price, availability or Design name

**Requirements:** FR-30; AD-3, AD-9, AD-12, AD-14, AD-28
**Notes for the developer:**
- Adds the three Block types to `packages/blocks` and to the screens collection in `apps/content`; the rule's filter uses the same filter names as `/store/shop/designs` (Epic 2).
- The pickers read Designs and Weavers from commerce over the private network with content's service token, through a read-only lookup route under `/internal/*`, which AD-9 allows and names as its example.
- Resolving ids and rules into Design cards is Story 5.3.

---

### Story 5.3: The Owner publishes a screen and it is served with live prices

As an Owner,
I want to publish a screen and have it served with each Design's current price and availability,
So that what Shoppers see on a screen I built is always true.

**Acceptance Criteria:**

**Given** a draft screen that passes the `ScreenV1` checks
**When** the Owner chooses "Publish now"
**Then** the draft becomes the screen's published version with a version number one higher than the last
**And** the earlier published version is kept in the screen's history

**Given** a published screen
**When** a client calls `/store/shop/screens` for it by kind and address, with no login
**Then** commerce reads the Blocks from content, resolves every Design id, Weaver id and rule, and returns one `ScreenV1` document
**And** each Design is embedded as a `DesignCard` with its current whole-rupee price, any discount with the lowest price of the previous 30 days, and server-computed availability

**Given** the Owner publishes a change
**When** a client reads the screen more than 60 seconds later
**Then** it receives the new version, with no release (AD-12)

**Given** a Design's price or stock changes
**When** a client next reads a screen that shows it
**Then** the card carries the new price and availability at once; price and availability are never served from the 60-second layout cache

**Given** a hand-filled Block that names a Design that is now a draft or deleted
**When** the screen is composed
**Then** that Design is left out and the rest of the Block is returned
**And** a sold-out Design is kept and marked as sold out

**Given** a Block that resolves to no Designs, or a Weaver story whose Weaver has no published Design
**When** the screen is composed
**Then** that Block is left out of the response and the other Blocks are returned in order

**Given** a rule Block
**When** the screen is composed
**Then** the rule is run against the catalogue at that moment and returns at most the number of Designs the Owner set

**Given** a screen that does not exist or has no published version
**When** it is requested
**Then** the route answers with the error code `screen.not_found`

**Given** content cannot be reached and the layout cache has expired
**When** a screen is requested
**Then** the route answers with the error code `screen.unavailable`; it never returns a partly built screen

**Given** the response
**When** it is sent
**Then** it has been checked against `ScreenV1`, it is in the request's language, and it contains nothing of content's own document shape (AD-12)

**Requirements:** FR-30, FR-31 (publish now), FR-33; AD-2, AD-3, AD-5, AD-12, AD-14, AD-19, AD-28
**Notes for the developer:**
- Adds "Publish now" to the screens collection in `apps/content`; creates `/store/shop/screens` in `apps/commerce/src/api/store/shop` and its function in `packages/api-client`.
- The layout cache is the kernel's in-memory cache, 60 seconds at most, keyed by screen and language; Design cards are resolved on every request through the same code as `/store/shop/designs`.
- Scheduling and returning to an earlier version are Story 5.7. Preview is Story 5.6. Rendering on the website is Story 5.4.

---

### Story 5.4: Shoppers see the home, category and campaign screens on the website

As a Shopper,
I want the home, category and campaign screens to show what the Owner has published,
So that I see the shop's current sarees and stories as soon as I arrive.

**Acceptance Criteria:**

**Given** a published home screen
**When** a Shopper opens the website's home address without logging in
**Then** the Blocks are shown in the Owner's order: banner, row of Designs, grid of Designs, Weaver story, text and image, each by its own component

**Given** a published category or campaign screen
**When** a Shopper opens its address
**Then** that screen is shown the same way
**And** an address with no published screen shows the "not found" page with a link to the Designs page

**Given** a row or grid of Designs
**When** it is shown
**Then** each card shows the photo, name, Weaver, whole-rupee price, any discount with the lowest price of the previous 30 days, and a sold-out or unavailable-for-now mark, exactly as the server returned them
**And** the website computes none of these

**Given** a Block with an action
**When** the Shopper activates it
**Then** the website performs that action from the fixed list of AD-12: `open-design`, `open-weaver`, `open-category`, `open-screen`, `open-search` or `open-link` to a same-site address
**And** a Block with no action is not shown as something to press

**Given** a Weaver story Block
**When** it is shown
**Then** it shows the Weaver's name, place, a photo and the story from commerce, with a link to the Weaver page

**Given** a published change to a screen
**When** a Shopper loads the page more than 60 seconds after the Owner published
**Then** she sees the change, with no release of the website

**Given** the Shopper's language
**When** the screen is shown
**Then** Block wording is in that language where the Owner entered it, and in English otherwise

**Given** the screen
**When** it is used with a screen reader or at the largest system font size
**Then** every image has its description, every action has a label, and the layout holds

**Given** no home screen has ever been published
**When** a Shopper opens the home address
**Then** she is shown the Designs page

**Requirements:** FR-30, FR-31, FR-33; AD-2, AD-12, AD-19; NFR-14
**Notes for the developer:**
- `apps/web`: one component per Block type keyed by the type names in `packages/blocks`, a screen renderer, and the home, category and campaign addresses. Data comes only from `packages/api-client`.
- Reuse the Design card and photo sizes from Epic 2.
- Skipping unknown Blocks and showing the last copy when a fetch fails are Story 5.8. Styled from DESIGN.md when it exists.

---

### Story 5.5: The Owner arranges the region below the Design page's fixed content

As an Owner,
I want to arrange one region of the Design page from Blocks,
So that I can add a Weaver's story or related sarees there without touching what the page must always show.

**Acceptance Criteria:**

**Given** the Owner opens the Design-page region in the content admin
**When** she adds a Block
**Then** only a row of Designs, a Weaver story, a text Block and an image Block are offered
**And** a banner or a grid of Designs cannot be added there, in the admin or by any save request

**Given** the region
**When** it is created
**Then** there is exactly one, and it applies to every Design page `[ASSUMPTION: one region shared by all Designs, not one per Design; PRD §4.7 says only "one region"]`

**Given** a Weaver story Block in the region
**When** the Owner sets it up
**Then** she can choose "the Weaver of the Design being viewed" instead of a named Weaver
**And** a row of Designs there can use the rule "more from this Weaver" `[ASSUMPTION: these two choices]`

**Given** a published region
**When** a Shopper opens any Design page
**Then** the region's Blocks are shown below the fixed content, composed by `/store/shop/screens` for that Design
**And** a row of Designs there never includes the Design being viewed

**Given** the Design page
**When** the region is empty, unpublished, or cannot be fetched
**Then** the page shows all its fixed content and no gap or error where the region would be

**Given** the fixed content required by FR-3 and FR-29: photos, price, description, attributes, Weaver, stock status, delivery estimate, the entry points to the Full saree view and Try-on, the maker's and consumer-care details and the terms
**When** the Owner edits the region in any way
**Then** none of it can be moved, hidden or removed, because it is not a Block (AD-12)

**Given** a Design page
**When** it loads
**Then** the fixed content does not wait for the region, and the page still meets the 3-second target of NFR-1

**Given** the Owner publishes a change to the region
**When** a Shopper loads a Design page more than 60 seconds later
**Then** she sees the change, with no release

**Requirements:** FR-30, FR-31, FR-33; AD-12, AD-14, AD-28; NFR-1
**Notes for the developer:**
- Adds the screen kind "Design-page region" with its allowed Block types to `packages/blocks` and `apps/content`, a Design id as context on `/store/shop/screens`, and the region slot on the Design page in `apps/web`.
- The allowed-types rule is enforced three times: in the content admin, in content's save check, and when commerce validates the composed `ScreenV1`.
- Checkout, payment, Shopper photo upload, Try-on and the Full saree view are not Server-driven screens (PRD §4.7) and get no region.

---

### Story 5.6: The Owner previews a screen as a Shopper would see it

As an Owner,
I want to preview a draft screen at phone size with real Designs and prices,
So that I can check it before any Shopper sees it.

**Acceptance Criteria:**

**Given** a draft screen, saved or with a later published version
**When** the Owner chooses "Preview" in the content admin
**Then** the website's preview page opens with the draft rendered at phone size, 360 pixels wide `[ASSUMPTION: the width]`
**And** it is rendered by the same components and the same `/store/shop/screens` route that Shoppers use (AD-12)

**Given** the preview
**When** it is composed
**Then** the request carries a signed token that names the screen and the draft version and expires after 15 minutes `[ASSUMPTION: the period]`
**And** Design cards in the preview carry current prices and availability

**Given** a preview token that is missing, altered, expired, or for a different screen
**When** the route receives it
**Then** it answers with the error code `screen.preview_token_invalid` and returns no draft content

**Given** a draft is being previewed
**When** a Shopper requests the same screen without a token
**Then** she receives the published version, or `screen.not_found` if there is none; never the draft

**Given** a preview response
**When** it is served
**Then** it is never stored in or served from the layout cache
**And** the preview page tells search engines not to index it

**Given** the draft of the Design-page region
**When** the Owner previews it
**Then** she chooses a published Design, and the preview shows that Design's page with the draft region below the fixed content

**Given** the preview is open
**When** the Owner saves the draft again and reloads the preview
**Then** the preview shows the newer draft

**Given** a draft that contains a Block that would be left out when composed, such as a row whose Designs are all drafts
**When** the preview is shown
**Then** the Owner is told which Blocks were left out and why; Shoppers are never shown such a note

**Requirements:** FR-31; AD-2, AD-12, AD-15
**Notes for the developer:**
- Content signs the token with a key from its environment that commerce verifies; the key is checked at start like every other setting (spine, Config and secrets) and is documented in the restore script's list of secrets.
- Adds the "Preview" control in `apps/content`, token handling on `/store/shop/screens`, and a preview page in `apps/web`.
- The token grants reading one draft and nothing else; it is not an admin session (AD-15).

---

### Story 5.7: The Owner schedules a screen and returns to an earlier version

As an Owner,
I want to publish a screen at a set time and go back to an earlier version in one action,
So that a festival campaign appears on the day without my being there, and a mistake is quickly undone.

**Acceptance Criteria:**

**Given** a draft screen
**When** the Owner chooses "Publish at" and enters a date and time in the business time zone that is in the future
**Then** the version is stored as scheduled with `publish_at` in UTC, and the currently published version stays live
**And** a time in the past is refused

**Given** a scheduled version
**When** a client reads the screen before `publish_at`
**Then** it receives the currently published version
**And** when it reads the screen more than 60 seconds after `publish_at`, it receives the scheduled version, with no action by the Owner and no release

**Given** a scheduled version
**When** the time passes
**Then** nothing in content runs to publish it: commerce chooses the newest version whose `publish_at` is not in the future each time it composes the screen (AD-12)
**And** content has no scheduler (AD-4)

**Given** a scheduled version whose time has not come
**When** the Owner cancels the schedule or changes its time
**Then** the version returns to draft, or carries the new time, and the published version is unaffected

**Given** two versions scheduled for the same screen
**When** both times have passed
**Then** the one with the later `publish_at` is served

**Given** a screen with earlier versions
**When** the Owner opens its history
**Then** she sees each version with its number, when it went live and who published it, and can view any of them in the preview of Story 5.6

**Given** an earlier version in the history
**When** the Owner chooses "Return to this version"
**Then** a new version with that version's Blocks is published now, with the next version number
**And** no version in the history is changed or removed

**Given** a restored version that names a Design which is now a draft or deleted
**When** the screen is composed
**Then** that Design is left out as in Story 5.3

**Given** a published screen
**When** the Owner unpublishes it
**Then** a category or campaign address shows "not found", the home address shows the Designs page, and the history is kept

**Requirements:** FR-31; AD-4, AD-12, AD-13, AD-14
**Notes for the developer:**
- `apps/content`: scheduling fields, version history and the restore action on the screens collection; `apps/commerce`: version selection by `publish_at` inside `/store/shop/screens`.
- The layout cache must not delay a scheduled version beyond 60 seconds: cache entries expire at the nearer of 60 seconds and the next `publish_at`.
- Test with a controllable clock: just before, at, and after `publish_at`; and the UJ-5 case of a campaign scheduled for a festival day.

---

### Story 5.8: Screens keep working when something is unknown or unreachable

As a Shopper,
I want a screen to show everything my version of the shop understands, and the last screen I saw when a new one cannot be fetched,
So that I never meet an error or a blank page because the Owner changed something.

**Acceptance Criteria:**

**Given** a `ScreenV1` response that contains a Block of a type the website has no component for
**When** the screen is rendered
**Then** that Block is skipped and every other Block is shown in order
**And** no error, placeholder or empty space is shown in its place

**Given** a Block the website knows that carries properties it does not know
**When** it is rendered
**Then** the unknown properties are ignored and the Block is shown

**Given** a Block whose action is not on the fixed list known to the website
**When** it is rendered
**Then** the Block is shown without an action

**Given** a Block's wording that contains markup or script
**When** it is rendered
**Then** it is shown as plain text and nothing in it is run
**And** nothing in a `ScreenV1` document is ever evaluated as code or as an expression

**Given** a screen document saved through any route of the content application
**When** it contains a Block type absent from `packages/blocks`, an action absent from the fixed list, or a property that the type does not define
**Then** the save is refused; a screen can only arrange components and actions already built in

**Given** a Block action that leads to Try-on, checkout or any other built-in flow, for example `open-design` or `open-link`
**When** it is activated
**Then** it only navigates to that built-in screen, which applies its own rules, including current Try-on consent under AD-11; screen data cannot grant consent, skip a step or switch on a capability

**Given** the website has shown a screen before
**When** `/store/shop/screens` fails or answers `screen.unavailable`
**Then** the website shows the last copy of that screen it received
**And** if it has never received one, the home address shows the Designs page and other screen addresses show a message with a link to the Designs page

**Given** a last copy is being shown
**When** a Shopper opens a Design from it
**Then** the Design page shows the current price and availability from the server, so an out-of-date card cannot lead to a wrong charge
**And** while a last copy is shown, the screen carries a plain notice that prices and availability on it may be out of date, because price and availability are never served as current from a stored copy (AD-12)

**Given** the continuous-integration checks
**When** they run
**Then** recorded `/store/shop/screens` responses from every earlier release of the schema still pass the current `ScreenV1`, and a test response with an unknown Block, an unknown property and an unknown action renders on the website without error
**And** a change that removes or renames a field of `ScreenV1` or of a Block type fails the check (AD-12, AD-27)

**Requirements:** FR-32, FR-33; AD-11, AD-12, AD-19, AD-27
**Notes for the developer:**
- `apps/web`: skip rules in the screen renderer and a server-side store of the last good response per screen and language; `packages/contracts` and `packages/blocks`: recorded-response fixtures and the additive-only check; `apps/content`: the strict save check.
- Record the fixtures in a place Epic 6 can reuse for the Android app's replay under AD-27. The `X-Client` header is sent since Story 1.2; the minimum app version check (FR-55) is Story 6.2.
- `[ASSUMPTION: FR-32 speaks of the app; on the website "the last screen it received" is taken to mean the last copy held by the website's server]`.

## Epic 6: The Android app

A Shopper does in the Android app everything she can do on the website: she browses Server-driven screens, finds and inspects a Design, opens the Full saree view, checks out in native screens and pays on the payment service's own hosted payment page opened from the app, follows and returns her Order, uses her privacy rights, and uses Try-on with the device's photo picker. The Owner can set the oldest app version allowed to run. The app is a client only: it reuses `packages/contracts`, `packages/api-client` and `packages/blocks`, holds no business rules, and keeps working when the server moves ahead of it.

**FRs covered (in the app):** FR-1 to FR-33 as built for the website, FR-55
**NFRs:** NFR-1, NFR-15 (and NFR-12, NFR-14 as they apply to the app)

**Rules that apply to every story in this epic**

- "Same behaviour as the website" means the acceptance criteria of the website story for the same FR in Epics 1 to 5 apply unchanged; each story below lists only what differs on the app and what must be proven again on a phone.
- UI code gets data only from `packages/api-client` (AD-2). Where the app needs a function that the website did not, it is added to `api-client` with its view model in `packages/contracts`, additively (AD-19, AD-27). No story adds a business rule, a total, a state or an availability calculation to `apps/mobile` (AD-5, AD-24, AD-28).
- No Shopper-facing text is written in code (Conventions): interface text comes from the translation bundle that content holds and commerce serves (Story 3.4), with the app's bundled translation files as the built-in fallback, Design and Weaver text comes from commerce, and documents come from content through commerce (AD-28). Every interactive element has a label and every layout holds at the largest system font size (NFR-15).
- Screens are described by behaviour only; they are styled from DESIGN.md when it exists.
- iOS is out of scope. There is no push service at launch, so a ready Try-on result is found by polling (spine, Consistency Conventions: Payments in the app). No analytics or advertising SDK is added (AD-29).
- The app is built on the minimal Expo application of Story 1.28, which settled spike items 5, 6 and 8 on a real phone; no story here creates `apps/mobile` again.

---

### Story 6.1: App shell, navigation and configuration

As a Shopper,
I want an Android app that opens, shows me where things are and tells me plainly when it cannot reach the shop,
So that everything else in the app has a dependable place to live.

**Acceptance Criteria:**

**Given** the minimal Expo application that Story 1.28 created in `apps/mobile`, with its neutral application id and `packages/contracts` and `packages/blocks` already wired in
**When** the developer builds the app shell on it, with Expo 58 and expo-router, and adds `packages/api-client`
**Then** a debug build installs and starts on an Android phone and on an emulator
**And** the proof's sample screen, sample tile page and measurement screens are removed from the shell or kept only in a development build
**And** the app has places for home, browse, cart and account, each showing a placeholder that later stories replace
**And** `apps/mobile` imports `packages/contracts`, `packages/api-client` and `packages/blocks` and nothing from the kernel's SDK; the lint rule from AD-2 runs on `apps/mobile` and fails the build on such an import

**Given** the app's configuration
**When** it is inspected
**Then** the application id, the URL scheme and the package names do not contain the product name, and the name shown under the icon comes from one configuration value (AD-20, NFR-12)
**And** a test fails the build if the product name appears anywhere in `apps/mobile` outside that configuration value
**And** the API address and environment come from build-time configuration checked against a zod schema; a build with a missing value fails with the name of the missing value

**Given** any request the app makes
**When** it leaves the phone
**Then** it carries `X-Client` with platform `android` and the app's version in the format defined in `packages/contracts`, the Shopper's language, a request id, and an `Idempotency-Key` when it changes state (AD-27, Conventions)

**Given** the phone has no network
**When** the Shopper opens a screen that needs data it does not have
**Then** she sees a "no connection" state with a retry action, never a blank screen or a raw error
**And** when the network returns and she retries, the screen loads

**Given** the server answers with the error envelope `{ code, message, details? }`
**When** the app receives a `code` it does not know
**Then** it shows a general "something went wrong, try again" state and does not crash (AD-27)

**Given** the Shopper presses the Android back button
**When** she is on a screen below a top-level place
**Then** she returns to the previous screen; from a top-level place, back leaves the app

**Requirements:** NFR-12, AD-2, AD-16, AD-19, AD-20, AD-27, AD-29
**Notes for the developer:**
- Builds on Story 1.28: `apps/mobile` exists; this story turns the proof into the shell and does not create the application or change its application id. Touches `apps/mobile` and, only if needed, a storage and header hook in `packages/api-client` so it runs outside a browser; `packages/*` still import no UI framework.
- Use the versions in the spine's Stack table. Add no library that is not part of the Expo SDK or named in the spine.
- Placeholder texts here are temporary; Story 6.3 moves all interface text to the app's translation files.
- Left for later stories: every real screen, sign-in, the forced-update screen.
- Styled from DESIGN.md when it exists.

---

### Story 6.2: Minimum app version and the forced-update screen

As an Owner,
I want to set the oldest app version allowed to run,
So that a version with a serious fault can no longer be used.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin
**When** she sets the minimum Android app version in shop settings and saves
**Then** the value takes effect without a release, and an audit event records who changed it, when, and the before and after values (FR-55, FR-56, AD-13, AD-14)
**And** a value that is not a valid version is refused with a clear message

**Given** the minimum version is 1.4.0
**When** an app sending `X-Client` for android 1.3.9 calls any `/store/*` route
**Then** commerce answers with the error code `client.update_required` and performs nothing else (AD-27)
**And** an app at 1.4.0 or 1.10.0 is served normally (versions are compared as numbers, not as text)
**And** requests from the website, the Admin, webhooks and `/internal/*` are never refused by this check

**Given** the app receives `client.update_required` from any request
**When** the response arrives
**Then** the app shows only the update screen: a message asking the Shopper to update and one action that opens the app's store page; no other screen can be reached (FR-55)
**And** the message is bundled with the app in every supported language, so it shows even though the server is refusing requests

**Given** the Shopper is on the update screen
**When** she closes and reopens the app, with or without a network
**Then** she sees the update screen again
**And** when the Owner lowers the minimum version, the next time the app is opened with a network it checks, is served, and returns to normal use

**Given** a Shopper has begun payment on a version that then falls below the minimum
**When** the payment service confirms her payment
**Then** her Order is still created on the server and she is messaged as usual, because confirmation does not depend on the app (AD-7)

**Given** the store page cannot be opened on the phone
**When** she taps the update action
**Then** she sees a short message telling her to update from her app store, and the app stays on the update screen

**Requirements:** FR-55, AD-13, AD-14, AD-27
**Notes for the developer:**
- Touches `apps/commerce` (a middleware in `src/api`, the `settings` module, one field on the shop settings admin page), `packages/contracts` (the error code and the `X-Client` format, if absent), `packages/api-client` (surface the error as a typed result) and `apps/mobile` (the update screen).
- No earlier epic builds this middleware or this setting; `X-Client` itself has been sent since Story 1.2.
- `[ASSUMPTION: a request with no `X-Client` is treated as the website]`; the check is a product control, not a security control.
- Styled from DESIGN.md when it exists.

---

### Story 6.3: Text in her language, large fonts and screen-reader basics

As a Shopper,
I want the app in my language, readable at my phone's font size and usable with a screen reader,
So that I can shop without struggling to read or reach anything.

**Acceptance Criteria:**

**Given** the app's interface text
**When** a screen shows it
**Then** it comes from the translation bundle for her language, fetched with `getTranslations` in `packages/api-client` from `/store/shop/translations/{language}` (Story 3.4) and cached on the phone (AD-28)
**And** the translation files bundled with the app, one for English and one for Tamil with the same keys as the website's where the wording is shared, are the built-in copy: the app uses them before its first fetch, for any key the bundle lacks, and whenever the fetch fails
**And** Design and Weaver text arrives in view models from commerce in the Shopper's language, and documents and notices arrive from content through commerce, so a change the Owner makes to those appears the next time the screen is loaded, without a release (NFR-14)

**Given** the Owner publishes a changed interface text in a translation bundle
**When** the app is next opened or brought to the front with a connection
**Then** it fetches the newer bundle version and shows the new wording, with no app release (NFR-14)
**And** with no network it shows the last bundle it cached, or the built-in copy; no screen waits on the bundle, a bundle key the app does not know is ignored, and bundle text is shown as plain text and never run (AD-27, FR-33)

**Given** the phone's language is one the shop has published (English at launch; Tamil is the first added language)
**When** the Shopper first opens the app
**Then** the app uses that language; otherwise it uses English
**And** she can change the language from the account place, the change applies at once, and every later request carries the new language

**Given** a text key has no translation in her language
**When** a screen shows it
**Then** the English text is shown, never the key or an empty space

**Given** any amount of money
**When** it is shown
**Then** it is a whole number of rupees with no paise, formatted by the shared formatter; the app never calculates an amount (FR-5, AD-5)
**And** dates and times are shown in the business time zone (Conventions)

**Given** the phone is set to the largest system font size
**When** the shell screens from Stories 6.1 and 6.2 are opened
**Then** no text is cut off or overlaps, and every action can still be reached, by scrolling if needed (NFR-15)
**And** Tamil text shows correctly with no missing characters

**Given** the Android screen reader is on
**When** the Shopper moves through a shell screen
**Then** every interactive element is announced with a label, its role and its state, in a sensible order (NFR-15)
**And** a shared set of basic components (text, button, text field, image with description, list row) carries these behaviours, and a lint or test rule fails the build when an interactive element has no label

**Requirements:** NFR-14, NFR-15, FR-5, AD-2, AD-5, AD-28
**Notes for the developer:**
- Touches `apps/mobile` (translation files, text lookup, language choice, the basic components). The language is sent on every request by `packages/api-client`, as on the website (Story 2.14). The app never calls `apps/content` directly (AD-2).
- AD-28: interface text is a translation bundle per language, held in content and served through commerce; the app caches it and carries a built-in copy as the fallback, so a wording change needs no app release (NFR-14). The route, the view model and `getTranslations` exist from Story 3.4; this story adds the app's cache, its built-in files and the lookup order. Add the app's own text keys to the bundles' seed so the Owner can edit them.
- Every later story builds its screens from these basic components; Story 6.18 audits the finished app.
- Styled from DESIGN.md when it exists.

---

### Story 6.4: Sign in with a one-time code

As a Shopper,
I want to sign in to the app with my mobile number and a one-time code,
So that I can check out, see my Orders and use Try-on.

**Acceptance Criteria:**

**Given** a Shopper who is not signed in
**When** she browses, searches, opens a Design or the Full saree view, or adds to her cart
**Then** she is never asked to sign in (FR-26)
**And** she is asked only when she starts checkout, opens her Orders or starts Try-on, and after signing in she continues to the place she was going

**Given** she enters her mobile number and asks for a code
**When** the code arrives and she enters it within 5 minutes
**Then** she is signed in: same behaviour as the website, including acceptance of the terms of use and privacy policy at first sign-in, recorded with version and time, and kept separate from Try-on consent (FR-26)

**Given** the limits in FR-26
**When** a code is older than 5 minutes, or a fourth code is requested for one number within 10 minutes, or a wrong code is entered
**Then** the app shows the matching message from the server's error code and, where the server gives it, when she can try again
**And** the app does not request the permission to read SMS; the code field offers the keyboard's own code suggestion where the phone provides one

**Given** she is signed in
**When** she closes and reopens the app, or restarts the phone
**Then** she is still signed in
**And** her session is kept in the phone's secure storage and never written to logs (Conventions)

**Given** her session has expired or she deleted her account elsewhere
**When** the app makes a request that needs her identity
**Then** she is asked to sign in again and loses nothing she had in her cart

**Given** she signs out from the account place
**When** sign-out completes
**Then** her session and any personal data the app stored on the phone (Orders, addresses, Try-on images held in memory or on disk) are removed, and the saved Server-driven screens and texts remain

**Given** the phone has no network
**When** she asks for a code or submits one
**Then** she is told there is no connection and can retry; no code is counted as used

**Requirements:** FR-26, AD-2, AD-15, AD-26
**Notes for the developer:**
- Touches `apps/mobile` and the session-storage hook in `packages/api-client`. The one-time-code provider, rate limits and messages already exist in commerce (Epic 3).
- A Shopper token must never be sent to an admin route; the app knows no admin route (AD-15).
- Changing the mobile number is in Story 6.14.
- Styled from DESIGN.md when it exists.

---

### Story 6.5: Server-driven home, category and campaign screens

As a Shopper,
I want the home, category and campaign screens to show what the Owner has published,
So that I always see the current shop without updating the app.

**Acceptance Criteria:**

**Given** the Owner has published a home screen
**When** the Shopper opens the app
**Then** the app requests the screen from the screens route through `packages/api-client` and shows its Blocks in the published order, using one native component for each Block type in `packages/blocks`: banner, row of Designs, grid of Designs, Weaver story, text, image (FR-30, AD-12)
**And** every Design shown comes from the embedded `DesignCard` with its whole-rupee price and its availability, including sold out and "unavailable for now", exactly as the server sent them (FR-1, FR-5, FR-19)

**Given** the Owner publishes a change, or a scheduled screen's time arrives
**When** the Shopper next opens or refreshes the screen
**Then** she sees the change without an app release (FR-31)

**Given** a screen contains a Block whose type this app version does not know
**When** the screen is shown
**Then** that Block is skipped and every other Block is shown; nothing is shown as an error (FR-32, AD-12)
**And** a Block with known type but fields the app does not know is shown using the fields it knows (AD-27)
**And** a known Block whose required properties fail the schema in `packages/blocks` is skipped in the same way

**Given** a Block carries an action
**When** the Shopper taps it
**Then** the app performs it only if it is on the fixed action list of AD-12 built into this version: `open-design`, `open-weaver`, `open-category`, `open-screen`, `open-search`, and `open-link` for a same-site address, which opens the matching screen in the app
**And** a Block whose action this version does not know is shown but cannot be tapped; screen data can never run code, load a remote script or open a capability that was not in the reviewed version (FR-33)

**Given** the app has shown a screen before
**When** it cannot fetch that screen (no network, time-out or server error)
**Then** it shows the last copy it received for that screen and language, with a short notice that it may be out of date (FR-32, AD-12)
**And** when the app has never received that screen, it shows the "no connection" state with retry

**Given** a category or campaign screen is opened from a Block action
**When** it loads
**Then** it behaves by the same rules as the home screen
**And** a screen that no longer exists shows a "not available" state with a way back home

**Given** the screens route answers
**When** the app shows the screen
**Then** the first Blocks are visible without waiting for images further down, and images are requested in a size fitted to the phone's screen (Conventions: Speed)

**Requirements:** FR-30, FR-31, FR-32, FR-33, FR-1, FR-5, AD-2, AD-12, AD-27
**Notes for the developer:**
- Touches `apps/mobile` only: a Block registry mapping each type in `packages/blocks` to one component, a screen renderer, and a saved-screen store on the phone. Start from the sample renderer of Story 1.28 and bring it up to these criteria.
- The app never reads content's own shape and never resolves a rule or a price itself (AD-12).
- Add unit tests with recorded screens: one with an unknown Block type, one with an unknown action, one with extra fields.
- The Design page's Server-driven region is in Story 6.7.
- Styled from DESIGN.md when it exists.

---

### Story 6.6: Browse, filter and search Designs, and read about a Weaver

As a Shopper,
I want to browse, filter and search Designs in the app and read about the Weaver,
So that I can find a saree I like and know who made it.

**Acceptance Criteria:**

**Given** a Shopper who is not signed in
**When** she opens the browse place
**Then** she sees Designs from `/store/shop/designs` through `packages/api-client`: same behaviour as the website (FR-1, AD-28)
**And** a Design with no Pieces in stock is shown as sold out, not hidden

**Given** the filters fibre, weave, colour, occasion, price and Weaver
**When** she chooses several
**Then** they combine, and the count of results the server returns is shown before she applies them (FR-1)
**And** the app computes no count, no filter and no availability itself (AD-28)

**Given** she types words in search
**When** she submits
**Then** results matching the name, description, weave or Weaver appear within 2 seconds on a 4G connection (FR-2)
**And** a search with no results shows the filter panel with its counts and the three weaves that have the most Designs, as the server returns them, instead of an empty screen (FR-2)

**Given** a long list of results
**When** she scrolls
**Then** more results load as she goes, her place in the list is kept when she opens a Design and comes back, and her chosen filters stay applied

**Given** a Design or a Weaver story Block
**When** she taps the Weaver
**Then** she sees the Weaver's name, place, story and photos and a list of that Weaver's Designs: same behaviour as the website (FR-4)

**Given** the phone has no network, or the request fails
**When** she opens browse, applies a filter or searches
**Then** she sees the "no connection" state with retry and her chosen filters and typed words are kept

**Given** a slow connection
**When** she changes a filter twice quickly
**Then** only the result of her latest choice is shown

**Requirements:** FR-1, FR-2, FR-4, FR-5, AD-2, AD-28
**Notes for the developer:**
- Touches `apps/mobile` only; reuses the `DesignCard` component from Story 6.5.
- No catalogue data is filtered or sorted on the phone.
- Left for the next story: the Design page itself.
- Styled from DESIGN.md when it exists.

---

### Story 6.7: Design page

As a Shopper,
I want to open a Design in the app and see everything about it,
So that I can decide whether to buy it.

**Acceptance Criteria:**

**Given** a published Design
**When** the Shopper opens it from any list, Block or search result
**Then** she sees its photos, whole-rupee tax-inclusive price, description, Weaver, stock status and delivery estimate, and the attributes fibre, weave, zari, where it was woven, length and width in metres, blouse piece included or not, care and country of origin: same behaviour as the website (FR-3, FR-5)
**And** the fixed content the website shows is all present and cannot be removed by screen data: the fabric close-up photo, the note that colours can look slightly different on different screens, the maker's name and address, the consumer-care contact, and the return, refund, delivery and payment terms including the return period and conditions (FR-3, FR-23)

**Given** a Design with a discount
**When** its price is shown
**Then** the lowest price of the previous 30 days, as returned by the server, is shown beside it (FR-5)

**Given** a phone screen of ordinary size at the default font size
**When** the Design page opens
**Then** the entry points to the Full saree view and to Try-on are visible without scrolling (FR-3)
**And** when the Design has no full-length image, the Full saree view entry point is absent (FR-6); when the server reports Try-on switched off, its entry point follows the website's behaviour

**Given** the photos of a Design
**When** she swipes through them and pinches one
**Then** she can move between photos and zoom a photo, and photos are requested in a size fitted to the screen (Conventions: Speed)
**And** a Try-on result never appears among the product photos (FR-12)

**Given** a Design with more than one Variant
**When** she chooses a Variant
**Then** the price, stock status and any photos of that Variant are shown, as the server returns them (FR-35 as built for the website)

**Given** the Design's last Piece is on Hold, or it is sold out
**When** the page is shown
**Then** it says "unavailable for now" or sold out as the server reports, and the add-to-cart action is not offered (FR-19)

**Given** the Owner has arranged the Design page's Server-driven region
**When** the page is shown
**Then** the region appears below the fixed content, built from the Block types allowed there (row of Designs, Weaver story, text, image) with the same skip rule for unknown Blocks as Story 6.5 (FR-30, FR-32)
**And** if the region cannot be loaded the rest of the page still shows

**Given** a Design that has been unpublished, or a link to one that never existed
**When** the page is opened
**Then** a "not available" state is shown with a way back to browsing

**Given** the phone has no network
**When** she opens a Design
**Then** she sees the "no connection" state with retry; a saved copy of a Design page is never shown with a price, because price and availability must be current (AD-12)

**Requirements:** FR-3, FR-4, FR-5, FR-19, FR-30, FR-32, NFR-1, AD-2, AD-12, AD-28
**Notes for the developer:**
- Touches `apps/mobile` only. The page must not wait on Try-on status, counts or messages before it is usable (Conventions: Speed).
- The add-to-cart action is wired in Story 6.9, the Full saree view in 6.8, the pincode delivery check in 6.9 and Try-on in 6.15; here their entry points open a placeholder.
- NFR-1 is measured on a real phone in Story 6.18; keep the first screenful to one catalogue request plus images.
- Styled from DESIGN.md when it exists.

---

### Story 6.8: Full saree view in the app

As a Shopper,
I want to open the Full saree view in the app and pan and zoom along the whole saree with my fingers,
So that I can inspect the body, border and pallu as if it were laid out in front of me.

**Acceptance Criteria:**

**Given** a Design with a full-length image that has finished processing
**When** the Shopper taps the Full saree view entry point
**Then** a native screen opens holding a web view that loads the same OpenSeadragon viewer page the website uses, showing the whole saree first (FR-6, AD-18)
**And** she can zoom in until one pixel of the image fills one pixel of the screen, and only the tiles for the part she is looking at are downloaded at full detail

**Given** the viewer is open on an Android phone
**When** she uses one finger to pan, two fingers to pinch, and a double tap
**Then** the saree pans, zooms and steps in smoothly; the native screen does not scroll, swipe back or zoom the whole page instead (AD-18)
**And** because Story 1.28 settled the touch-behaviour spike item with a sample tile set, this story re-runs the same checks and frame-rate measurement on the finished screen with a real Design, and records the result in `docs/` with the phone models and Android versions tested

**Given** the viewer is open
**When** she presses the Android back button or the close action
**Then** she returns to the Design page in one step, at the place she left

**Given** the web view
**When** the viewer page or any link inside it tries to go to an address outside the viewer page and the `tiles` bucket
**Then** the web view does not go there
**And** the web view receives no Shopper session, token or personal data

**Given** the phone has no network, or tiles stop loading part-way
**When** she opens or uses the Full saree view
**Then** she sees a "no connection" state with retry rather than a blank or broken viewer, and tiles already loaded stay visible

**Given** the screen reader is on, or the largest font size is set
**When** she opens the Full saree view
**Then** the image has a spoken description naming the Design, and zoom in, zoom out and close are available as labelled controls that work without gestures (NFR-15)

**Given** she turns the phone
**When** the screen rotates
**Then** the viewer fills the new shape and keeps the part of the saree she was looking at

**Requirements:** FR-6, NFR-15, AD-18, AD-22
**Notes for the developer:**
- Touches `apps/mobile` (a native screen with `react-native-webview`) and, only if needed, the shared viewer page so it accepts a mode without the website's surrounding page. There is one viewer, not two (AD-18).
- Do not build a native tile viewer.
- Counting Full saree view opens (NFR-16) is added in Epic 7 with the counts module.
- Styled from DESIGN.md when it exists.

---

### Story 6.9: Cart and delivery check

As a Shopper,
I want to add Pieces to my cart in the app and check delivery to my pincode,
So that I know what I am buying, what it costs and when it can arrive.

**Acceptance Criteria:**

**Given** a Design with Pieces in stock
**When** the Shopper adds it to her cart from the Design page
**Then** the cart shows it with its whole-rupee price, and she can change the quantity or remove it: same behaviour as the website (FR-16)
**And** the quantity cannot go above the Pieces in stock; the server's refusal is shown as a clear message (FR-16)

**Given** a Shopper who is not signed in has items in her cart
**When** she closes the app, reopens it later, and then signs in
**Then** her cart is still there after reopening, and after signing in it is the same cart she sees on the website and on her other devices (FR-16)

**Given** she enters a pincode on the Design page or in the cart
**When** the server answers
**Then** she sees whether the shop delivers there, with an earliest and a latest delivery date (FR-17)
**And** a pincode outside the delivery region is refused with a clear message before checkout can begin
**And** a pincode that is not six digits is caught before any request is sent

**Given** the cart
**When** it is shown
**Then** any shipping charge is shown here, before checkout begins, and the total is the server's total; the app adds nothing up itself (FR-5, AD-5)
**And** nothing is pre-selected or added to the cart that she did not add, and no countdown or "only a few left" pressure is shown beyond the server's true stock status (NFR-13)

**Given** an item in her cart has sold out or changed price since she added it
**When** she opens the cart or moves towards checkout
**Then** the item is flagged with what changed and she must accept the change or remove the item before payment can begin (FR-19)

**Given** her cart has a live Hold because payment has begun
**When** she tries to change the cart from the app or from another device
**Then** the change is refused with a message that payment is in progress, and she is offered the way back to that payment (AD-6)

**Given** the phone has no network
**When** she adds, changes or removes an item
**Then** the change is not shown as done; she is told there is no connection and can retry
**And** a repeated tap or a retry never adds the item twice (Conventions: Idempotency)

**Requirements:** FR-16, FR-17, FR-5, FR-19, NFR-13, AD-2, AD-5, AD-6, AD-21
**Notes for the developer:**
- Touches `apps/mobile` only; the cart id for an anonymous Shopper is kept on the phone.
- Only allow-listed cart routes are called, through `api-client` (AD-21).
- Checkout begins in Story 6.10.
- Styled from DESIGN.md when it exists.

---

### Story 6.10: Checkout: address, summary and Hold

As a Shopper,
I want to give my address, see exactly what I will pay and begin payment in the app,
So that the Pieces are kept for me while I pay.

**Acceptance Criteria:**

**Given** a Shopper with items in her cart
**When** she taps checkout
**Then** she is asked to sign in if she is not signed in, and then returns to checkout with her cart unchanged (FR-26)

**Given** she is at checkout
**When** she enters or chooses a delivery address
**Then** the same fields and checks as the website apply, the pincode is checked against the delivery region, and an address outside it is refused before payment with a clear message (FR-17)
**And** she is asked for an email address for the invoice and may leave it empty (FR-26)

**Given** a valid address
**When** the summary is shown
**Then** it shows each item, any discount, any shipping charge, the total in whole rupees, the delivery estimate, and the return period and conditions: same content as the website (FR-5, FR-18, FR-23)
**And** cash on delivery is not offered, and nothing is pre-ticked (FR-18, NFR-13)

**Given** the summary
**When** she taps pay
**Then** the app starts `begin-checkout` through `packages/api-client` once, with an `Idempotency-Key`; the server takes the Checkout snapshot and places the Pieces on Hold for 15 minutes (FR-19, AD-6)
**And** the app shows how long the Hold has left, counted from the expiry time the server returned

**Given** another Shopper got the Hold on the last Piece a moment earlier, or an item sold out or changed price
**When** `begin-checkout` is refused
**Then** she is told before any money is taken, the affected item is flagged as in Story 6.9, and no payment screen opens (FR-19)

**Given** she tapped pay twice, or the request timed out and she retried
**When** the server answers
**Then** there is one Checkout and one Hold (AD-6, Conventions: Idempotency)

**Given** she leaves checkout after the Hold began and before paying
**When** she chooses "back to cart"
**Then** the app asks the server to cancel the Checkout, the Hold is released, and her cart is as it was (AD-6)
**And** if she simply closes the app, the Hold ends by itself after 15 minutes and, on reopening, the app shows the true state the server reports

**Given** the phone has no network at any step
**When** she tries to continue
**Then** she is told there is no connection, nothing is charged, and she can retry

**Requirements:** FR-17, FR-18, FR-19, FR-23, FR-26, NFR-13, AD-2, AD-5, AD-6, AD-21
**Notes for the developer:**
- Touches `apps/mobile` only. The app never calls the kernel's cart-completion route; it is blocked for clients (AD-7, AD-21).
- This story ends with a live Checkout and the data needed to open the payment screen; opening it is Story 6.11. Until then the pay action ends on a screen that shows the Checkout's status from the server.
- Styled from DESIGN.md when it exists.

---

### Story 6.11: Payment and its outcome

As a Shopper,
I want to pay by UPI, card or netbanking on the payment service's own screen and be told truthfully what happened,
So that I am never unsure whether I have been charged or whether I have an Order.

**Acceptance Criteria:**

**Given** a live Checkout from Story 6.10
**When** the payment step opens
**Then** the payment service's own hosted payment page is opened from the app for that Checkout, offering UPI, card and netbanking, and the amount on it equals the total shown before payment began (FR-18, AD-2, AD-7)
**And** the app never sees, stores or logs a card number or UPI credential (FR-18, Conventions)
**And** when she chooses a UPI app, that app opens, and returning from it brings her back to the app's payment step

**Given** the payment screen closes for any reason (success shown, failure shown, she dismissed it, or she came back from a UPI app)
**When** the app regains control
**Then** it does not treat anything the payment screen reported as proof; it asks the server for the Checkout's status and shows only what the server says (AD-7)
**And** it asks again every 3 seconds for up to 60 seconds while the status is not final `[ASSUMPTION: the interval and length; use the website's values if they differ]`

**Given** the server reports the payment confirmed
**When** the status arrives
**Then** she sees the Order confirmation with the Order number, and the Order appears in her Orders (FR-20)

**Given** the server reports the payment failed
**When** the status arrives
**Then** she is told she has not been charged, her cart is as it was, and she can try again (FR-18)

**Given** she dismissed the payment screen without paying
**When** the server reports that no payment was made
**Then** she can open the payment screen again for the same Checkout while the Hold lasts, with the remaining time shown, or go back to her cart, which releases the Hold (AD-6)

**Given** the status is still pending after 60 seconds
**When** the wait ends
**Then** she sees a "payment pending" state that says it becomes an Order if confirmed within the Hold and is otherwise refunded automatically; her cart cannot be paid for a second time meanwhile (FR-18)
**And** the app checks the status again whenever it comes to the front and whenever she opens her Orders

**Given** the Hold ended before her payment was confirmed
**When** the late confirmation is handled by the server
**Then** the app shows what the server decided: an Order if the Pieces were still free, or "payment refunded automatically" if not (FR-19)

**Given** the app is closed by the phone, loses its network, or the phone restarts during payment
**When** she next opens the app
**Then** it finds the Checkout she had in progress, asks the server for its status and shows the matching state above; no second payment is started for it

**Given** the payment screen
**When** a page inside it tries to open an address that is not the payment service's, a bank's page reached through it, or a UPI app
**Then** the app does not load it

**Requirements:** FR-18, FR-19, FR-20, NFR-4, AD-2, AD-7
**Notes for the developer:**
- Touches `apps/mobile` only. Order creation stays in `confirm-payment` on the server; nothing here creates or completes anything (AD-7).
- Payment in the app is the payment service's own hosted payment page, opened from the app (spine, Consistency Conventions: Payments in the app); no Android payment library is added. Show the page in the `react-native-webview` already in the Stack and hand UPI links to Android.
- Test against the payment service's test mode: success, failure, dismissal, pending, late confirmation, duplicate webhook (one Order, one charge).
- Styled from DESIGN.md when it exists.

---

### Story 6.12: Orders, tracking, invoice and cancellation

As a Shopper,
I want to see my Orders in the app, follow each one, get its invoice and cancel it before dispatch,
So that I always know where my saree is and can change my mind in time.

**Acceptance Criteria:**

**Given** a signed-in Shopper
**When** she opens her Orders
**Then** she sees every Order she has placed on the website or the app, newest first, each with its state exactly as named in the Glossary (Paid, Packed, Dispatched, Out for delivery, Delivered, Delivery failed, Returned to shop, Cancelled, Refunded) as returned by the server (FR-21, AD-24)
**And** the app never works out a state from other fields

**Given** an Order
**When** she opens it
**Then** she sees its items, amounts, address, state history and tracking details: same behaviour as the website (FR-21)
**And** a change reported by the shipping service appears when she opens or refreshes the Order, without the Owner doing anything

**Given** an Order in the state Delivery failed
**When** she opens it
**Then** she is told what happens next; an Order in Returned to shop shows that it is refunded in full (FR-21)

**Given** an Order with an invoice
**When** she taps the invoice
**Then** the invoice file is fetched through a short-lived link and opened or shared with Android's own viewer or share sheet, and the app asks for no storage permission (FR-20, FR-54, AD-22)
**And** if the link has expired by the time she taps, the app asks for a fresh one once and then opens it

**Given** an Order that has not been dispatched
**When** she cancels it and confirms
**Then** the Order becomes Cancelled, and she sees the refund amount, that it goes to the payment method she used, and when it was started (FR-22, FR-24)
**And** an Order already Dispatched offers no cancel action; if it was dispatched in the moment between her opening the screen and tapping, the server's refusal is shown clearly and the Order is refreshed

**Given** an Order with a refund
**When** she opens it
**Then** she sees the refund amount and when it was started (FR-24)

**Given** the phone has no network
**When** she opens her Orders
**Then** she sees the "no connection" state with retry; cancelling is never shown as done until the server confirms it

**Given** she signs out
**When** another person opens the app on the same phone
**Then** no Order, address or invoice of hers can be seen

**Requirements:** FR-20, FR-21, FR-22, FR-24, AD-2, AD-22, AD-24
**Notes for the developer:**
- Touches `apps/mobile` only. States and allowed actions come from the server's view model (AD-24).
- Returns and the rating are in Story 6.13.
- Styled from DESIGN.md when it exists.

---

### Story 6.13: Returns and "did it match?"

As a Shopper,
I want to request a Return and rate whether the saree matched what I saw, from the app,
So that I can send back what disappointed me and tell the shop the truth.

**Acceptance Criteria:**

**Given** a Delivered Order inside the return period set by the Owner (7 days from delivery at launch)
**When** the Shopper requests a Return for an item
**Then** she gives a reason and books a pickup: same behaviour as the website (FR-23)
**And** "not as shown" and "defective or wrong item" are always offered, and return shipping for them is shown as free

**Given** an item outside the return period, or one the server says cannot be returned
**When** she opens the Order
**Then** the Return action is not offered, and she is shown why, using the server's reason

**Given** a Return exists
**When** she opens it
**Then** she sees its state exactly as named in the Glossary (Requested, Pickup booked, Picked up, Received, Accepted, Rejected, Refunded) as returned by the server (FR-23, AD-24)
**And** a Rejected Return shows the reason and the Owner's inspection photos, and says the item is being sent back to her
**And** an Accepted or Refunded Return shows the refund amount and when it was started (FR-24)

**Given** she taps "request Return" twice or retries after a time-out
**When** the server answers
**Then** there is one Return (Conventions: Idempotency)

**Given** an Order has been Delivered
**When** she opens the app or the Order afterwards
**Then** she is asked once to rate from 1 to 5 whether the saree matched what she saw, and may add a comment: same behaviour as the website (FR-53)
**And** she can dismiss the question and still find it on the Order; she is not asked again and again (NFR-13)
**And** a rating already given on the website shows as given in the app

**Given** the phone has no network
**When** she submits a Return or a rating
**Then** it is not shown as sent; she is told there is no connection, what she typed is kept, and she can retry

**Requirements:** FR-23, FR-24, FR-53, NFR-13, AD-2, AD-24
**Notes for the developer:**
- Touches `apps/mobile` only.
- The link between a rating and whether she used Try-on is made on the server (FR-53); the app sends only the rating and comment.
- Styled from DESIGN.md when it exists.

---

### Story 6.14: Account, disclosures, privacy requests and account deletion

As a Shopper,
I want to manage my account, read who runs the shop, use my privacy rights and delete my account from inside the app,
So that I stay in control of my data without leaving the app.

**Acceptance Criteria:**

**Given** the account place, signed in or not
**When** the Shopper opens "about and legal"
**Then** she sees the shop's legal name, address, contact details and grievance officer, and can open the privacy policy, the terms of use and the shop policies in her language, all from published content (FR-29)
**And** these are reachable without signing in and show their last received copy when the phone is offline

**Given** a signed-in Shopper
**When** she changes her mobile number
**Then** the change happens only after she enters a one-time code sent to the new number: same behaviour as the website (FR-26)

**Given** a signed-in Shopper
**When** she asks what data the shop holds about her and which services received it, or asks for a correction or erasure
**Then** the request is sent: same behaviour as the website, and the answer she later sees names the AI providers that received her Shopper photos (FR-28)

**Given** a signed-in Shopper
**When** she files a complaint
**Then** she receives a ticket number at once, and can see her complaints with their state in the app (FR-28)
**And** the screen states that complaints are acknowledged within 48 hours and resolved within one month

**Given** a person who appears in a Try-on result without agreeing
**When** she looks for how to ask for its removal
**Then** the published contact for this is shown in "about and legal" without signing in (FR-9)

**Given** a signed-in Shopper
**When** she chooses "delete my account" in the app
**Then** she is told what is removed (Shopper photos, Try-on results, personal details, with erasure requested from AI providers) and which records the law requires the shop to keep, such as invoices (FR-27)
**And** deletion needs one clear confirmation by her and no call, email or visit to the website
**And** when the server accepts it she is signed out, everything personal stored on the phone is removed, and signing in with the same number starts a new account

**Given** she has an open Order, one that is neither Delivered past its return period, nor Cancelled, nor Refunded
**When** she asks to delete her account
**Then** the server refuses the deletion with `account.has_open_order`, and the app tells her, as the website does, which Order is open and that her Shopper photos and Try-on results have been erased at once in any case (AD-31)
**And** she stays signed in and her Order continues

**Given** the phone has no network
**When** she submits a request, a complaint or the deletion
**Then** it is not shown as done; she is told there is no connection and can retry

**Requirements:** FR-9, FR-26, FR-27, FR-28, FR-29, NFR-6, AD-2, AD-23, AD-31
**Notes for the developer:**
- Touches `apps/mobile` only. Deletion runs the server's existing workflow, which calls `erase-shopper-media` (AD-23); the app only starts it.
- The public web page for account deletion already exists (Epic 3); the app opens no browser for deletion.
- Withdrawing Try-on consent is in Story 6.17.
- Styled from DESIGN.md when it exists.

---

### Story 6.15: Try-on consent and Shopper photo

As a Shopper,
I want to accept the Try-on consent notice and give one full-length photo of myself using my phone's own photo picker,
So that I can use Try-on knowing exactly what happens to my photo.

**Acceptance Criteria:**

**Given** a Shopper taps Try-on on a Design page
**When** she is not signed in
**Then** she is asked to sign in and then continues to Try-on for that Design (FR-26)

**Given** a signed-in Shopper with no current Try-on consent
**When** she starts Try-on
**Then** she sees the standalone Try-on consent notice in her language, at its latest published version, naming every AI service that can receive a Shopper photo, what is kept and for how long (30 days unused), how to withdraw and how to complain: same behaviour as the website (FR-8, FR-51, AD-11)
**And** nothing is pre-ticked, the notice is not combined with any other terms, and she must separately confirm that she is 18 or older and that the photo is of herself (FR-8, FR-9)
**And** accepting records the Shopper, the notice version, the language and the time on the server; declining returns her to the Design page with no penalty and no nagging (NFR-13)

**Given** she does not confirm both that she is 18 or older and that the photo is of herself
**When** she tries to continue
**Then** Try-on is unavailable to her and no photo can be chosen (FR-9)

**Given** the Owner has published a new version of the Try-on consent notice
**When** a Shopper who accepted an earlier version starts Try-on
**Then** she is shown the new notice and must accept it before anything else happens (FR-8, FR-59)

**Given** the notice cannot be fetched (no network)
**When** she starts Try-on
**Then** consent cannot be given from a saved copy; she sees the "no connection" state with retry

**Given** she has current consent and no stored Shopper photo
**When** she chooses "choose a photo"
**Then** the Android system photo picker opens and returns only the one photo she picks (FR-10)
**And** the app's built manifest does not contain the permissions for broad access to photos or storage (`READ_MEDIA_IMAGES`, `READ_MEDIA_VISUAL_USER_SELECTED`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`), and a test in continuous integration fails the build if any appears

**Given** she chooses "take a photo"
**When** the phone asks for camera permission and she allows it
**Then** she takes one photo and continues
**And** when she denies the permission, she is told the camera cannot be used and that she can still choose a photo; when she has denied it permanently, the message offers the way to the phone's settings; the app does not ask again on every visit

**Given** she is about to pick or take a photo
**When** the step opens
**Then** she is told what makes a good photo, and after she picks one the same on-device checks as the website (file type, size, dimensions) tell her at once when a photo cannot be used, before anything is sent to an AI provider (FR-10)

**Given** a usable photo
**When** she confirms it
**Then** the app asks commerce for a single-use signed upload link and uploads the photo straight to storage with it; the photo, the link and the image bytes never appear in the app's logs or error reports (AD-22)
**And** if the upload fails or the network drops, she can retry and a fresh link is requested; a link is never used twice
**And** if the server refuses a link because of the rate limit, she is told when she can try again

**Given** she already has a stored Shopper photo
**When** she starts Try-on
**Then** she can reuse it or replace it (FR-10)

**Given** she cancels the picker or the camera without choosing
**When** she returns to the app
**Then** nothing is uploaded and she is back at the photo step

**Given** the honest-design tests and checklist of Story 3.26, which Story 4.3 extended for the website's consent screen
**When** this story is finished
**Then** the app's cases are added: automated tests on the app fail if a confirmation or the accept control is selected by default, if the notice is combined with other terms, or if declining is followed by a repeated prompt
**And** `docs/honest-design-checklist.md` gains the app's cart, checkout, sign-in and consent screens as items for the Owner's yearly audit (NFR-13)

**Requirements:** FR-8, FR-9, FR-10, FR-51, NFR-13, AD-2, AD-11, AD-22
**Notes for the developer:**
- Touches `apps/mobile` and `docs/honest-design-checklist.md`, using the picker and camera modules that ship with the Expo SDK; configure them so no broad media permission is merged into the manifest.
- Consent, age confirmation, upload links and limits are all decided on the server (AD-11, AD-22); the app shows and sends.
- Requesting a Try-on result is Story 6.16.
- Styled from DESIGN.md when it exists.

---

### Story 6.16: Try-on result, labelled and reportable

As a Shopper,
I want to ask for a Try-on result, leave the screen while it is made, and see it clearly marked as AI-generated,
So that I can imagine the saree on me without mistaking the image for a real photo.

**Acceptance Criteria:**

**Given** a Shopper with current Try-on consent and a Shopper photo
**When** she requests a Try-on result for a Design
**Then** the request is accepted at once with a request id and she sees progress (FR-11)
**And** a repeated tap or a retry after a time-out does not create a second request or use a second attempt (Conventions: Idempotency)

**Given** a request in progress
**When** she leaves the screen, browses elsewhere in the app, or puts the app in the background
**Then** the request continues on the server; while the app is open it asks for the status at intervals and shows an in-app notice, on whatever screen she is on, when the Try-on result is ready (FR-11, FR-54)
**And** if she closed the app, the notice is shown the next time she opens it, and the result is waiting on that Design's page
**And** no push service is used at launch, so a ready Try-on result is found by polling (spine, Consistency Conventions); this is recorded in `docs/` as a known limit

**Given** the result is ready
**When** it is shown
**Then** it is fetched through a short-lived signed link and displayed with a visible "AI-generated" label drawn by the app over the image, wherever the result appears in the app (FR-12, AD-22)
**And** beside it she is pointed to the real photos and the Full saree view for true colour and design, with actions that open them, and she can add the Design to her cart from here (FR-12)
**And** the result is never shown among the Design's product photos

**Given** a Try-on result on screen
**When** she chooses to save or share it
**Then** the app uses the labelled copy from the server's route for this purpose, so the label is part of the saved image, and hands it to Android's share or save sheet without asking for a broad storage permission (FR-12, AD-22)

**Given** a Try-on result on screen
**When** she taps "report" and chooses wrong or offensive
**Then** the report is sent and acknowledged on the same screen, and it reaches the Owner's review queue with the Design, the Model route and the Prompt version (FR-13)
**And** the report control is visible on the screen where the result is shown, without opening a menu elsewhere

**Given** the primary model and then the fallback both fail
**When** the server reports failure
**Then** she is told the Try-on could not be made and that this attempt did not count against her limit (FR-11)

**Given** the AI provider's safety check blocked the request, or the result check did not pass
**When** the server reports it
**Then** she is asked, in neutral words, to use a different photo; the app does not resend the same photo for that Design by itself (FR-11, FR-52)

**Given** she has reached her limit (10 Try-on results per day at launch), or the daily spending cap is reached, or the Owner has switched Try-on off
**When** she tries to request a result
**Then** she sees the server's clear message, including when she can try again where the server gives it (FR-14, FR-42)

**Given** her consent became out of date or was withdrawn on another device while she was in the app
**When** she requests a result
**Then** the server refuses, and the app takes her to the consent notice (AD-11)

**Given** the signed link to a result has expired, or the phone has no network
**When** she opens the result
**Then** the app asks for a fresh link once, or shows the "no connection" state with retry; it keeps no copy of a Try-on result on the phone beyond what is needed to show it

**Given** the screen reader is on
**When** a Try-on result is shown
**Then** it is announced as an AI-generated image of her wearing the named Design, and report, save, add to cart and the links to real photos are all reachable (NFR-15)

**Requirements:** FR-11, FR-12, FR-13, FR-14, FR-52, FR-54, NFR-2, NFR-15, AD-2, AD-10, AD-11, AD-22
**Notes for the developer:**
- Touches `apps/mobile` only. Model route, fallback, time limits (90 seconds), limits and checks are the server's and the worker's (AD-10); the app shows states returned by the status read.
- Polling stops when no request is in progress and when the app is in the background.
- Withdrawal and deleting single items are in Story 6.17. Counting Try-on requests (NFR-16) is added in Epic 7.
- Styled from DESIGN.md when it exists.

---

### Story 6.17: Withdraw Try-on consent and delete Try-on data

As a Shopper,
I want to withdraw my Try-on consent, or delete a single Shopper photo or Try-on result, from the app,
So that taking my photo back is as easy as giving it was.

**Acceptance Criteria:**

**Given** a Shopper with Try-on consent
**When** she opens the account place or the Try-on screen
**Then** "withdraw Try-on consent" is reachable in no more steps than giving consent took, and needs no call, email or reason (FR-15)

**Given** she taps withdraw and confirms once
**When** the server accepts it
**Then** her Shopper photos and Try-on results disappear from the app at once, and she is told they are erased from the shop and that erasure has been requested from each AI provider that received them (FR-15, AD-23)
**And** the app removes any Try-on image it was holding on the phone
**And** the next time she starts Try-on she is shown the consent notice again

**Given** a Try-on request of hers was in progress when she withdrew
**When** its result arrives on the server
**Then** it is discarded and never shown in the app (AD-23)

**Given** her stored Shopper photos and Try-on results
**When** she opens "my Try-on photos"
**Then** she sees each one, every result with the "AI-generated" label, and the retention rule that they are deleted after 30 days unused (FR-12, FR-51)
**And** she can delete any single Shopper photo or Try-on result, with one confirmation, and it disappears at once (FR-15)

**Given** a photo or result was removed by the retention job or on another device
**When** she opens the list or a link to it
**Then** it is simply no longer listed; no broken image or error is shown

**Given** the phone has no network
**When** she taps withdraw or delete
**Then** it is not shown as done; she is told there is no connection and can retry, and a retry never fails because the first attempt had in fact succeeded

**Given** she has withdrawn consent
**When** she opens a Design page
**Then** everything except Try-on works as before; she is not pressed to consent again (NFR-13)

**Requirements:** FR-15, FR-51, FR-12, NFR-6, NFR-13, AD-2, AD-11, AD-23
**Notes for the developer:**
- Touches `apps/mobile` only. `erase-shopper-media` is the only erasure path and runs on the server (AD-23).
- The list of photos and results uses short-lived signed links (AD-22); none is cached on disk.
- Styled from DESIGN.md when it exists.

---

### Story 6.18: Fast and accessible on a real phone

As a Shopper,
I want the app to be quick on an ordinary phone on mobile data and fully usable with large text or a screen reader,
So that I can shop comfortably whatever phone and eyesight I have.

**Acceptance Criteria:**

**Given** the reference phone and network of the spine's test profile, written down in `docs/` with the phone's model before measuring: an Android phone with 4 GB of memory on a throttled 4G connection of 10 Mbit/s down with 100 ms delay, the same phone as Story 1.28 where it is still available
**When** a release build opens a Design page from a list, 10 times, with the app already running
**Then** in at least 9 of the 10 runs the page is usable within 3 seconds, where usable means the name, price, first photo and stock status are shown and the add-to-cart, Full saree view and Try-on entry points respond (NFR-1)
**And** the measurements and the build they were taken on are recorded in `docs/`

**Given** the same phone and network
**When** the home screen, a search and the Full saree view are opened
**Then** search results appear within 2 seconds (FR-2), and the times for the home screen and for the Full saree view's first whole-saree picture are recorded as baselines
**And** the Design page does not wait for Try-on status, messages or any other request that is not needed for its first screenful (Conventions: Speed)
**And** photos are requested in sizes fitted to the phone's screen, shown by checking the requested sizes on the reference phone

**Given** a run that misses the 3-second target
**When** the cause is found
**Then** it is fixed within `apps/mobile` or by an additive change to a view model, and the measurement is repeated until the target is met; if the cause is the server or hosting, the finding and the figures are recorded for the load test in Epic 7

**Given** the phone is set to the largest system font size
**When** every screen built in Stories 6.1 to 6.17 is opened, in English and in Tamil
**Then** no text is cut off or overlapping, and every action can be reached (NFR-15)
**And** the Full saree view and Try-on entry points remain reachable on the Design page, by scrolling if they no longer fit the first screenful

**Given** the Android screen reader is on
**When** the journey browse, Design page, Full saree view, cart, checkout up to the payment screen, Orders, Return, account deletion, and Try-on from consent to report is walked
**Then** every action in it can be reached and performed, every element is announced with a label, role and state, focus moves to new content when a screen or message appears, and errors are announced (NFR-15)
**And** every failure found is fixed and the walk repeated; the final result is recorded in `docs/` screen by screen

**Given** the finished app
**When** touch targets and contrast are checked
**Then** every control can be tapped without hitting its neighbour at the largest font size; contrast is checked again when DESIGN.md exists

**Requirements:** NFR-1, NFR-15, FR-2
**Notes for the developer:**
- Touches `apps/mobile` and `docs/`; measure release builds only, against staging.
- The measurements and walks on the real phone need a person holding it. The developer agent prepares the release build, the measurement steps and the record sheet and closes the automated criteria; the on-phone criteria wait for the Owner, and the story is handed back saying which are outstanding.
- The part of the journey inside the payment service's own screen is outside the app's control; note what was observed.
- "Mid-range phone" and "4G" are defined by the spine's test profile (Consistency Conventions, "Test profiles"), held as settings; Story 2.22 used the same profile by emulation and Story 7.11 uses this phone.
- Repeat here the blurred-bar frame-rate measurement of Story 1.28 on the styled app, if DESIGN.md uses that bar.
- Styled from DESIGN.md when it exists.

---

### Story 6.19: Release builds and compatibility tests

As a Shopper,
I want the app on my phone to keep working when the shop's server is updated,
So that I am not locked out of shopping by a change I never saw.

**Acceptance Criteria:**

**Given** a commit marked as an app release
**When** continuous integration runs
**Then** it produces a signed Android release bundle whose version name is the one sent in `X-Client` and whose version code is higher than the last release (AD-27)
**And** the signing key and its passwords are not in the repository, come from the build's secret settings, and are listed in the secrets document that the restore script relies on (Conventions: Config and secrets)
**And** the release build allows no unencrypted network traffic and contains no vendor secret, test key or `/internal` address

**Given** an app release is made
**When** the release job finishes
**Then** the zod schemas of every view model, `ScreenV1` and error code that this version uses are saved in the repository as that version's schema set (AD-19, AD-27)

**Given** a saved set of server responses covering every shop route the app calls, produced by running the current server against seed data
**When** continuous integration runs on any change to `apps/commerce`, `packages/contracts`, `packages/api-client` or `packages/blocks`
**Then** each recorded response is checked against the schema set of every released app version, and the build fails, naming the route, the field and the app version, if any released version could not read it (AD-27)
**And** a response with an added field passes, and a response with a removed or retyped field fails; both cases have a test proving it

**Given** a `ScreenV1` response that contains a Block type added after a release
**When** it is replayed against that release's schema set and renderer test
**Then** the screen is accepted and the new Block is skipped (FR-32)

**Given** a released version below the minimum app version in settings
**When** the tests run
**Then** that version is checked only for reading `client.update_required`, and versions at or above the minimum are checked in full (FR-55)

**Given** a failing compatibility test
**When** a deploy is attempted
**Then** the deploy does not happen (Conventions: Testing)

**Given** the release bundle
**When** it is installed on the reference phone from Story 6.18
**Then** the end-to-end journey browse, add to cart, pay in the payment service's test mode, see the Order, request a Return, and one Try-on in the AI provider's test setup, completes against staging

**Requirements:** FR-32, FR-55, NFR-11, AD-19, AD-27
**Notes for the developer:**
- Touches the continuous-integration configuration, `packages/contracts` (schema-set export), a fixtures directory, and `apps/mobile` build configuration. Use Expo's own build tooling; add no build service the spine does not name.
- The first schema set is saved from the first release made by this story.
- Store listing, declarations and submission are in Epic 7.

## Epic 7: Ready to launch and to run alone

The Owner is told within minutes when something breaks, can rebuild the whole shop on a clean server from backups, sees the counts behind the success metrics, has the reviewed legal documents and disclosures live, knows that every routine task is an Admin page, and has the Android app accepted by the store. The epic ends with real payments switched on. It adds no new functional requirement; it makes the requirements already built safe to run by one person.

**FRs covered:** none new; FR-50 stays deferred
**NFRs:** NFR-7, NFR-8 (complete), NFR-9, NFR-10, NFR-16, and a final pass on NFR-1 to NFR-15

**Rules that apply to every story in this epic**

- Every alert and every message to the Owner or a Shopper is a `message.send` job with a template from content (AD-26). The one exception is the "shop is down" alert, which must come from outside the shop.
- Thresholds, limits and regulated values are settings with an effective date, changed in the Admin and audited (AD-13, AD-14). Nothing here hardcodes one.
- No story adds a vendor SDK, an analytics or advertising SDK, or a tool the spine does not name (AD-16, AD-29). Where the spine defers a vendor choice (uptime check, SMS, email), the choice is configuration behind the existing adapter; the real SMS and email adapters are those of Story 3.6.
- Production never runs in a vendor's test mode and never holds a test Order, invoice or credit note, because invoices are immutable and gapless (AD-25) and nothing could remove one. Every test-mode check in this epic (load test, message checks, drills, rehearsals, the end-to-end purchase, purchases shown to store reviewers) runs on staging. Production's checkout stays closed until Story 7.15 switches the vendors to live mode.
- Some stories are done by the Owner with papers and consoles rather than by code. Their acceptance criteria are records that can be checked; the developer agent prepares the inputs and the checks, and the Owner performs the outside steps.
- Any Shopper-facing screen touched is described by behaviour only and is styled from DESIGN.md when it exists.

---

### Story 7.1: Know within 5 minutes when the shop is down

As an Owner,
I want to be alerted from outside the shop when it stops working,
So that I can act before Shoppers give up.

**Acceptance Criteria:**

**Given** the deployed system
**When** each unit's health route is called (commerce, content, worker, web)
**Then** it reports healthy only if that unit can do its work: commerce can reach its database, the Redis for queues and locks, and object storage; content can reach its database; the worker is consuming the shop queue; web can reach commerce (Conventions: Logging and alerts)
**And** one public health address behind Caddy reports the shop unhealthy when any unit is unhealthy or when the worker has not reported for 2 minutes
**And** the public answer contains no personal data, secret, version number or internal address

**Given** an outside uptime check configured to call the public health address and the website's home page every minute
**When** commerce is stopped on staging
**Then** the Owner receives an alert by email and by SMS within 5 minutes of the stop, sent by the outside check itself and not by the shop (NFR-9)
**And** when the shop is healthy again the Owner receives a "recovered" message

**Given** only the worker is stopped
**When** 2 minutes pass
**Then** the public health address reports unhealthy and the Owner is alerted within 5 minutes of the stop

**Given** the whole server is switched off, or its network is cut
**When** the outside check cannot connect
**Then** the Owner is alerted within 5 minutes

**Given** the site's certificate is within 14 days of expiry, or the domain stops resolving
**When** the outside check runs
**Then** the Owner is alerted `[ASSUMPTION: 14 days' warning before a certificate expires; NFR-9 does not cover certificates]`

**Given** a short blip of less than one minute
**When** the next check succeeds
**Then** no alert is sent; an alert needs two failed checks in a row

**Given** the chosen uptime service
**When** this story is done
**Then** `docs/` records which service is used, what it checks, whom it alerts and how to change those, and the service holds only the Owner's contact details and no Shopper data

**Requirements:** NFR-9, AD-16, AD-26
**Notes for the developer:**
- Touches the health routes in `apps/commerce`, `apps/content`, `apps/worker`, `apps/web` (verify or complete what earlier epics built), the Caddy configuration in `infra/`, and `docs/`.
- The uptime service is a deferred vendor choice in the spine; it is configuration, not code, and no SDK is added.
- Alerts about error rates, payments and Try-on are in Story 7.2.

---

### Story 7.2: Alerts for errors, payment failures, Try-on failures and Try-on spend

As an Owner,
I want to be alerted when errors, payment failures or Try-on failures rise above a rate I set, and when Try-on spend reaches 80% of the daily cap,
So that I learn of trouble from the shop and not from a Shopper.

**Acceptance Criteria:**

**Given** the Admin's shop settings
**When** the Owner opens the alert settings
**Then** she can set, for application errors, payment failures and Try-on failures, a rate, the period it is measured over and the smallest number of events that counts, and each change is audited (NFR-9, AD-13, AD-14)
**And** launch values are those of the spine's test profile: application errors above 2% of requests over 5 minutes; payment failures above 20% of payment attempts over 15 minutes; Try-on failures above 20% of requests over 15 minutes
**And** each has a smallest number of events that counts, so one failure in a quiet period is not an alert: 10 errors, 5 payment attempts, 5 Try-on requests `[ASSUMPTION: these three minimum counts; the spine gives the rates and periods only]`

**Given** a threshold is crossed
**When** the alert check next runs
**Then** a `message.send` job to the Owner is enqueued for email and for SMS within 5 minutes of the moment the threshold was crossed (NFR-9, AD-26)
**And** the message names the condition, the measured rate, the threshold and the period, and contains no Shopper's name, number, address, photo, link or code
**And** each job's id is the alert's id plus the channel, so a retry sends nothing twice

**Given** an alert is active
**When** the condition continues
**Then** no further alert is sent for it except one reminder every 60 minutes, and when the rate falls back under the threshold one "cleared" message is sent `[ASSUMPTION: a reminder every 60 minutes while an alert is active]`

**Given** the 80% spend alert and the alert and pause at 100% of the daily cap, both built in Story 4.18
**When** this story is complete
**Then** they are not built again: each is shown on the alerts page with the other alerts, and a test proves the 80% alert still reaches the Owner once for that day, within 5 minutes, with the amount spent and the cap (NFR-9, FR-42)
**And** this story adds one thing to it: raising the cap during the day re-arms the 80% alert against the new cap

**Given** application errors
**When** they are counted
**Then** the count includes server errors answered by commerce's shop and admin routes and shop-queue jobs that failed after their last retry; refusals that are the system working as designed (wrong code, rate limit, sold out, `client.update_required`) are not errors
**And** a payment the Shopper abandoned is not a payment failure; a failure reported by the payment service is

**Given** the Admin
**When** the Owner opens the alerts page
**Then** she sees every alert with when it started, when it cleared and whether each message was sent
**And** a "send a test alert" action delivers a test message by email and SMS so she can check the path

**Given** the SMS or email service refuses an alert message
**When** the worker has used its retries
**Then** the other channel is still sent, and the failure is shown on the alerts page

**Given** the alert check itself has not run for 5 minutes
**When** the public health address is called
**Then** it reports unhealthy, so Story 7.1's outside check alerts the Owner

**Requirements:** NFR-9, FR-42, FR-54, AD-4, AD-13, AD-14, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (a scheduled job in `src/jobs` that starts an alert workflow, the `settings` module, a tally of requests and errors kept in the commerce database, an admin page) and `apps/content` (message templates for each alert).
- Keep the tally out of the Redis that holds queues and locks (AD-8). Payment and Try-on figures are read from existing payment and Try-on request records.
- The thresholds are settings (spine, Consistency Conventions, "Test profiles"). The Owner's alert email and mobile number are the settings of Story 3.7, and `owner-alert` templates follow Story 3.20.
- Errors inside `apps/web` pages are not counted here; the outside check in Story 7.1 covers the website being down.

---

### Story 7.3: Counts and the Owner's view of the success metrics

As an Owner,
I want the shop to count the events behind the success metrics and show me each metric against its target,
So that I can tell whether the shop is working without handing Shopper data to anyone.

**Acceptance Criteria:**

**Given** the counts module in commerce
**When** an event is recorded
**Then** it is stored as a count for one of: Design-page view, Full saree view open, Try-on request, cart addition, Order; with the day in the business time zone, the Design, and the platform (website or android) (NFR-16, AD-29)
**And** nothing that identifies a Shopper or a device is stored or logged with it: no Shopper id, mobile number, address, session, device id or network address, even when the Shopper is signed in

**Given** the store route for counts
**When** a client reports a Design-page view, a Full saree view open or a cart addition through `packages/api-client`
**Then** the count for that day, Design and platform goes up by one, and the route answers at once
**And** a report with an unknown event name or an unknown Design is ignored without an error, and the route is rate limited by commerce middleware without storing who called it

**Given** a Try-on request is accepted, or an Order is created
**When** its workflow runs
**Then** the workflow records the matching count itself, so these two do not depend on a client's report `[ASSUMPTION: AD-29 says clients report counts; these two are recorded by the server instead so that none is missed]`
**And** a workflow that is retried records the count once

**Given** the Admin
**When** the Owner opens the success-metrics page and chooses a month
**Then** she sees each metric in PRD §9 with its target beside it: SM-1 paid Orders in the month (target 100 by month six); SM-2 average "matched what I saw" rating (4.5 or better); SM-3 Returns with the reason "not as shown" as a share of Orders (under 5%); SM-4 share of Shoppers who ordered again within 90 days (20%); SM-5 Design-page views that lead to a Try-on request, as Try-on requests per 100 Design-page views (30); SM-6 Try-on spend as a share of sales value (under 3%); SM-7 median time from creating a Design to publishing it (under 15 minutes); SM-8 Design-page views in which the Full saree view is opened, as Full saree view opens per 100 Design-page views (40)
**And** SM-5 and SM-8 are ratios of Design-page views, as PRD §9 defines them, because counts carry no Shopper identity and so cannot count visitors
**And** SM-1 is shown with SM-3 beside it, and SM-5 and SM-6 are shown with the counter-metric notes SM-C1 to SM-C3 from PRD §9
**And** figures are no more than one hour old, and can be split by website and android

**Given** a month with no Orders or no Design-page views
**When** the page is shown
**Then** each affected metric shows "no data yet" and never a division error

**Given** the counts and the metrics page
**When** the code and the deployed pages are inspected
**Then** no count is sent to any outside service, and nothing links a count to an advertising profile (NFR-16)

**Requirements:** NFR-16, PRD §9, AD-2, AD-4, AD-14, AD-29
**Notes for the developer:**
- Touches `apps/commerce` (the `counts` module, one store route, one workflow step used by the Try-on and Order workflows, one admin page), `packages/contracts` (event names, request shape) and `packages/api-client` (one function). No earlier epic creates the `counts` module; it is created here.
- SM-2, SM-3, SM-4, SM-6 and SM-7 are read from ratings, Returns, Orders, Try-on requests and audit events that already exist; they are not new counts.
- Clients start reporting in Story 7.4.

---

### Story 7.4: The website and the app report their counts

As an Owner,
I want the website and the Android app to report Design-page views, Full saree view opens and cart additions,
So that the success metrics reflect what Shoppers actually do on both.

**Acceptance Criteria:**

**Given** a Shopper opens a Design page on the website or in the app
**When** the page has been shown
**Then** one Design-page view is reported for that Design and platform through `packages/api-client` (NFR-16)
**And** returning to the same page with the back action does not report a second view, and a refresh or a new visit does

**Given** she opens the Full saree view, or adds a Design to her cart
**When** the action succeeds
**Then** one Full saree view open, or one cart addition, is reported
**And** at most one Full saree view open is reported for each Design-page view, so that SM-8 reads as a share of views

**Given** any report
**When** it is sent
**Then** it is sent after the page is usable and never delays or blocks the page, the cart or the viewer (NFR-1, Conventions: Speed)
**And** if it fails or the device is offline it is dropped silently; the Shopper sees no error and nothing is stored on her device to send later

**Given** an app version released in Epic 6, before this story
**When** it runs
**Then** it keeps working unchanged and simply reports nothing; the counts route is an addition (AD-27)

**Given** the website and the app
**When** their dependencies and the app's built manifest are checked in continuous integration
**Then** the build fails if any third-party analytics or advertising package is present, or if the app's manifest contains the advertising-id permission (AD-29)

**Given** the metrics page from Story 7.3
**When** a test session opens three Design pages, one Full saree view and adds one item to the cart on each platform against staging
**Then** the page shows exactly those counts for each platform within one hour

**Requirements:** NFR-16, NFR-1, AD-2, AD-27, AD-29
**Notes for the developer:**
- Touches `apps/web` and `apps/mobile` only, plus one continuous-integration check. The view of the Full saree view is counted by the native screen on the app and by the page on the website, not by the viewer page itself, so it is never counted twice.
- A new app release is needed for the app's reports; record its schema set as Story 6.19 requires.
- Try-on requests and Orders are already counted by the server (Story 7.3).

---

### Story 7.5: Daily payment reconciliation the Owner can act on

As an Owner,
I want to be alerted to any difference between payments and Orders each day and to settle it from the Admin,
So that no Shopper is charged without an Order and no Order exists without its money.

**Acceptance Criteria:**

**Given** the daily reconciliation job from Epic 1
**When** it runs for the previous business day
**Then** it compares the payment service's captured payments and refunds with the shop's Orders and refund records, and stores the run with its time, the totals compared and each difference found (NFR-4, AD-7)
**And** payments whose Hold could still be live (begun in the last 15 minutes before the run) are left for the next run, so that a payment in flight is not reported as a difference

**Given** a run finds one or more differences
**When** it finishes
**Then** the Owner is alerted by `message.send` on email and SMS, naming how many differences of which kind, without any Shopper's personal data (AD-26)
**And** a run with no difference sends no alert and is shown as "no unexplained difference"

**Given** the job did not run by its expected time, or could not read the payment service's records
**When** one hour has passed
**Then** the Owner is alerted that reconciliation did not complete, and the run is shown as failed, never as clean

**Given** the Admin's reconciliation page
**When** the Owner opens it
**Then** she sees each day's run and, for each difference, its kind (payment without Order, Order without payment, amount mismatch, refund mismatch), the payment service's reference, the amount and the linked Checkout or Order where one exists
**And** opening a difference that shows a Shopper's details records an access event (AD-14)

**Given** a payment without an Order whose Checkout snapshot exists
**When** the Owner chooses "rebuild Order"
**Then** `confirm-payment` runs for that Checkout: an Order with its invoice is created if the Pieces are still free, otherwise the payment is refunded automatically and the Shopper is messaged, exactly as FR-19 says for a late confirmation
**And** running it twice creates one Order and one charge (AD-7)

**Given** a payment without an Order whose Checkout snapshot is missing from the database, as after a restore
**When** the Owner chooses "rebuild Order", or the reconciliation job reaches it
**Then** the Order is rebuilt from the Checkout's recovery file in the `documents` bucket, found by the Checkout id carried on the payment: its items, quantities, prices, tax, address and Shopper id, with the Order id and invoice number already written in the file used again (AD-30, Stories 1.9 to 1.13)
**And** nothing but the Checkout id needs to be carried on the payment, and no address is sent to the payment service
**And** when there is no recovery file for the payment, the only action offered is a full refund to source

**Given** any difference
**When** the Owner settles it by rebuild, by refund, or by marking it explained with a written note
**Then** the action is audited with before and after, and the difference shows as settled (AD-14)
**And** a day counts as reconciled only when every difference on it is settled

**Requirements:** NFR-4, NFR-8, FR-19, FR-24, AD-4, AD-7, AD-14, AD-17, AD-26, AD-30
**Notes for the developer:**
- Builds on Story 1.12, which created the reconciliation job, its records, its Admin page and the rebuild from a recovery file. This story adds the alerts, the kinds of difference, the Owner's actions to settle one, and the rule that a day is reconciled only when every difference is settled. Touches `apps/commerce` (`src/jobs` reconciliation, a rebuild workflow that reuses `confirm-payment`, the admin page, the razorpay provider's read of payments and refunds) and `apps/content` (two message templates).
- Refunds still go only through the refund workflow; this page never edits a payment directly (AD-21).
- Story 7.7 relies on "rebuild Order" during the restore rehearsal.

---

### Story 7.6: Backups made complete

As an Owner,
I want the database, the stored files and the secrets backed up continuously to another location, and to be told if that stops,
So that losing the server does not lose the shop.

**Acceptance Criteria:**

**Given** the production and staging database server
**When** it is running
**Then** pgBackRest ships the write-ahead log continuously and takes a full backup every night, for both the `commerce` and `content` databases, to object storage in a different location from the server (AD-17, NFR-8)
**And** the newest shipped log is never more than 15 minutes old, including when the shop is idle
**And** the backup store is encrypted, and the server's access to it is by its own credential, separate from the buckets the shop uses (NFR-5)

**Given** the `catalog` and `documents` buckets
**When** a file is added, replaced or deleted
**Then** the bucket keeps earlier versions, and a daily copy of both buckets goes to the other location (NFR-8, AD-22)
**And** the `documents` bucket holds, besides invoices and credit notes, every Checkout's recovery file, written at `begin-checkout`; the bucket is in object storage off the server, so a recovery file survives the loss of the server from the moment it is written (AD-30)
**And** the `tiles` bucket is not copied, because the worker can rebuild it from the full-length images in `catalog`
**And** the `shopper-media` bucket is neither versioned nor copied anywhere, so that an erased Shopper photo cannot come back from a backup (AD-22, AD-23); a check fails if versioning is ever on for it

**Given** the secrets the shop needs to start, including those that encrypt admin second factors and the app signing key from Story 6.19
**When** the backup is made
**Then** an encrypted bundle of them is stored in the other location and one copy is held by the Owner offline, the passphrase is held only by the Owner, and `docs/` lists every secret, what it is for and where it is obtained again (AD-17, Conventions: Config and secrets)
**And** no secret is in the repository or in a log

**Given** backups are running
**When** the nightly backup has not completed by its expected time, or the newest shipped log is older than 15 minutes, or the daily bucket copy failed
**Then** the Owner is alerted by `message.send` within 5 minutes of the check finding it (AD-26)

**Given** a backup taken last night
**When** the check job verifies it
**Then** the backup's integrity is confirmed by pgBackRest's own check, and the result is stored with the time
**And** commerce learns each result without reaching into the backup tool: the backup, log-shipping and bucket-copy scripts in `infra/` post their result to `/internal/ops/backup-status` with the service token, and that route starts a workflow that stores it (AD-9)

**Given** backups older than the retention the Owner has set `[ASSUMPTION: 14 days of point-in-time recovery at launch; NFR-8 gives no retention]`
**When** the nightly job runs
**Then** they are removed, and backups within it are kept

**Given** the Redis that holds queues and locks
**When** the server is lost
**Then** its contents are not restored from a backup; `docs/` states that queued work is re-created after a restore from business records, as Story 7.7 proves (AD-8)

**Requirements:** NFR-8, NFR-5, AD-8, AD-16, AD-17, AD-22, AD-23, AD-26, AD-30
**Notes for the developer:**
- Builds on Story 1.25, which set up pgBackRest and the first restore script; this story completes the backups. Touches `infra/` (pgBackRest configuration, the bucket copy job using an S3 client only, the secrets bundle script), `apps/commerce` (the `/internal/ops/backup-status` route and its workflow, and a scheduled check that reads the stored status and raises the alert when a result is late or failed) and `docs/`.
- "A different location" means a different region or provider from the server; record which in `docs/`.
- The Admin page that shows backup status is in Story 7.10; the restore itself is Story 7.7.

---

### Story 7.7: A full restore, rehearsed on a clean server

As an Owner,
I want to rebuild the whole shop on a clean server from the backups, and to have done it once before launch,
So that I know a failure costs me hours and not the business.

**Acceptance Criteria:**

**Given** a clean server with nothing installed, of the other processor type from staging where one is available (x86-64 if staging is ARM64)
**When** the restore script in `infra/` is run with the secrets bundle and the backup location
**Then** it installs what is needed, restores the secrets, restores both databases to the latest point available, connects or restores the buckets, runs each application's migrations, starts every container from the one compose file and checks every health route (AD-16, AD-17)
**And** the script stops with a clear message at the first step that fails, and can be run again from the start safely

**Given** the rehearsal is timed from the start of the script
**When** the shop passes its health checks and the end-to-end purchase test in the vendors' test modes
**Then** the time taken is no more than 4 hours (NFR-8)

**Given** test Orders were paid on staging before the simulated failure, the last one within the final 15 minutes
**When** the restore is complete
**Then** every Order paid more than 15 minutes before the failure exists with its invoice (NFR-8)
**And** for any later payment with no Order, the reconciliation job, run by the restore script before the shop accepts Orders again, rebuilds the Order from its recovery file in the `documents` bucket with its original Order id and invoice number, or refunds it when there is no file; after that, reconciliation shows no unexplained difference (NFR-4, AD-17, AD-30)
**And** each invoice and credit-note counter row is set to the highest number issued before the shop accepts Orders again, so the first new invoice after the restore takes the next number: no number is used twice and none is skipped (AD-25, AD-30)
**And** the rehearsal proves this with a test Order whose invoice was issued in the lost period: after the restore it has the same invoice number and the same invoice file as before

**Given** the restored shop
**When** the Owner signs in to the Admin
**Then** her password and second factor work as before the failure, and audit events from before the failure are present (AD-14, AD-15)

**Given** a Shopper photo that was erased before the failure
**When** the restore is complete
**Then** the photo does not exist anywhere in the restored system (AD-22)
**And** any Shopper-media record whose file is absent after the restore is taken through `erase-shopper-media` and written to the erasure ledger as "found absent after restore" (AD-23); sample photos under the samples prefix of Story 4.9 are not Shopper media and are left out of this sweep
**And** the runbook states plainly that a withdrawal of Try-on consent made in the last 15 minutes before a failure may need to be made again, and that affected Shoppers' Try-on is paused until they are asked again `[ASSUMPTION: this handling of a withdrawal lost in the last 15 minutes; AD-17 and AD-23 do not cover it]`

**Given** work that was queued when the server was lost
**When** the restore's last step runs
**Then** invoices without a file, messages for Orders in the lost period, full-length images without tiles, and erasures not yet finished are enqueued again from business records, and because every job has a deterministic id nothing is sent or made twice (AD-8, AD-25, AD-26)

**Given** the catalogue before the failure
**When** the restored website and app are opened
**Then** every published Design shows with its photos, its Full saree view and its stock as of the restore point

**Given** the rehearsal is finished
**When** its record is written in `docs/`
**Then** it holds the date, who ran it, the time taken, the data loss measured, each problem met and how it was fixed in the script
**And** the date is stored in settings so the Admin can show it, and a `message.send` reminder goes to the Owner when 3 months have passed since the last rehearsal (NFR-8)

**Requirements:** NFR-8, NFR-4, NFR-10, AD-8, AD-16, AD-17, AD-22, AD-23, AD-25, AD-30
**Notes for the developer:**
- Builds on Story 1.25 (the restore script, the counter reset and the first rehearsal) and Story 1.12 (the rebuild from a recovery file). Touches `infra/` (the restore script), `apps/commerce` (the re-enqueue step as a workflow, the reminder job, the stored rehearsal date) and `docs/` (the restore runbook and the rehearsal record).
- The rehearsal is run by the Owner with the developer agent's script. The quarterly restore drill is not a routine task under NFR-10: it follows the written runbook and may use a command line. Keep it to one command and one document.
- On the free hosting tier the 4-hour and 15-minute figures are targets to test (NFR-8); record the measured figures either way.

---

### Story 7.8: Breach-response runbook, tools and drill

As an Owner,
I want a written plan and the tools to tell affected Shoppers without delay and to produce a detailed report within 72 hours,
So that a breach is handled correctly even though I am alone.

**Acceptance Criteria:**

**Given** `docs/`
**When** the breach runbook is opened
**Then** it gives numbered steps for: recognising a breach; containing it (switch Try-on off, rotate each secret, end Shopper and admin sessions, close a leaking route); working out which Shoppers and which data are affected; telling affected Shoppers without delay; telling the authority; writing the detailed report within 72 hours; and recording what was done (NFR-7)
**And** it names where each fact for the report comes from (access events, audit events, the erasure ledger, vendor consoles) and lists the contacts to call: the lawyer, the hosting provider, the payment service, each AI provider, the SMS and email services

**Given** the Admin
**When** the Owner opens the breach-notice page
**Then** she can choose the affected Shoppers as: all Shoppers; Shoppers with Shopper photos or Try-on results in a date range; Shoppers with Orders in a date range; or a list of mobile numbers or Order numbers she pastes
**And** she sees how many Shoppers are selected before sending, and must confirm
**And** sending enqueues one `message.send` job per Shopper and channel (SMS, and email where given) from a breach-notice template in content, in each Shopper's saved language (Story 3.8) (AD-26)
**And** the template has the purpose `breach-notice`, which this story adds to `packages/contracts`; `message.send` accepts that purpose only from the `send-breach-notice` workflow behind this page, and the test of Story 3.20 that no route or page sends a message to a list of Shoppers is amended to allow exactly this one page and still fails for any other
**And** the send is audited with who, when, the selection rule and the count, and retrying it sends nothing twice (AD-14)

**Given** the Admin
**When** the Owner asks for the report data for a period
**Then** she can download the access events and audit events for that period and a list of the affected Shoppers' ids, with a report outline that has a heading for each thing the 72-hour report must say
**And** producing the download is itself recorded as an access event

**Given** a breach notice
**When** it is sent
**Then** it is not treated as marketing and goes to every selected Shopper whatever her marketing choice (FR-54)
**And** no notice text contains another Shopper's data

**Given** the runbook and tools exist
**When** the Owner runs a drill on staging with a made-up incident (a leaked admin session that viewed 20 Shoppers' Try-on results)
**Then** following only the runbook she identifies the 20 Shoppers from access events, contains the incident, sends the notice to exactly those 20 test Shoppers, and produces a filled report
**And** the drill record in `docs/` holds the date, the time from "discovered" to notices enqueued, the time to a finished report (under 72 hours), and every gap found with its fix (NFR-7)

**Given** a step in the runbook rotates a secret
**When** the drill performs it on staging
**Then** the shop restarts with the new secret, the configuration check passes, and the secrets document from Story 7.6 is updated

**Requirements:** NFR-7, NFR-5, FR-54, AD-14, AD-26
**Notes for the developer:**
- Touches `docs/` (runbook, drill record), `apps/commerce` (one admin page, the `send-breach-notice` workflow that enqueues notices, two export routes), `packages/contracts` and `apps/worker` (the `breach-notice` purpose in the purpose check of Story 3.5) and `apps/content` (the breach-notice template and translations).
- The wording of the notice and the authority to notify are for the founder's lawyer; the runbook marks them as such and the launch checklist in Story 7.14 tracks the answer.
- Selection uses only data commerce already owns (AD-3).

---

### Story 7.9: Security pass

As an Owner,
I want the shop's security rules checked one by one against the running system,
So that Shoppers' data and photos are protected the way the shop says they are.

**Acceptance Criteria:**

**Given** staging running the release candidate
**When** the rate limits are tested
**Then** a fourth one-time code for one number within 10 minutes is refused and a code older than 5 minutes fails (FR-26); sign-in attempts, upload links and Try-on requests beyond their limits are refused with the correct error code; five wrong Admin passwords lock the account for 15 minutes (FR-60); and the content admin locks out by the same rule (AD-15)
**And** each limit is read from settings, shown by changing one and seeing the new value apply (AD-13)

**Given** signed links
**When** they are tested
**Then** a Shopper-photo or Try-on-result link stops working after its short life; a link issued to the worker stops working after at most 10 minutes; an upload link works once only and refuses a file over the size limit or of the wrong type (AD-22)
**And** the `shopper-media` and `documents` buckets refuse listing and any request without a valid signed link, and one Shopper's link cannot be obtained by another Shopper

**Given** the end-to-end tests have just run a purchase, a Return, a sign-in, a Try-on and an account deletion
**When** the logs of every unit, the job results held in Redis and any error reports are scanned
**Then** they contain no mobile number, email, name, address, one-time code, token, signed link, photo data or card data (Conventions: Logging and alerts, AD-22, AD-26)
**And** the scan is an automated test that runs before every deploy

**Given** an admin account that has not enrolled a second factor
**When** it calls any admin route other than enrolment
**Then** it is refused (AD-15, FR-60)
**And** the content admin cannot be reached from the internet without passing the proxy's access gate, or has its own second factor, whichever the spike settled

**Given** a machine outside the private network
**When** it calls any `/internal/*` address, or tries the database, Redis or object-storage ports
**Then** nothing answers; only the web ports and the Owner's server-access port are open (AD-9)
**And** inside the network, `/internal/*` refuses a call without a valid service token

**Given** the three kinds of identity
**When** a Shopper token is sent to an admin or internal route, an admin session to a store route that needs a Shopper, or a service token to a store or admin route
**Then** each is refused (AD-15)
**And** a kernel route that is not on the allow-list, including cart completion and direct edits of stock, payments and refunds, is refused for every caller from outside (AD-21)

**Given** a forged or replayed payment or shipping webhook
**When** it arrives
**Then** a wrong signature is refused, and a replay changes nothing (AD-7)

**Given** data in transit and at rest
**When** it is checked
**Then** every public address serves only encrypted connections and redirects plain ones; the database storage, the backups and the `shopper-media` bucket are encrypted at rest, and `infra/` documents how the server's volume encryption is verified (NFR-5); these checks are made here once, having been moved out of Story 3.16
**And** the Android release build allows no unencrypted traffic and holds the session only in secure storage

**Given** the Owner views a Shopper's details, a reported Try-on result or a data request
**When** the audit is read
**Then** an access event exists for each view; no route can change or delete an audit or access event; and access events are kept one year (NFR-5, AD-14)

**Given** the dependency lists of every unit
**When** the package manager's own audit runs
**Then** no known high-severity fault remains unaddressed, or each remaining one is written down with the reason it does not apply

**Given** any check above fails
**When** this story is worked
**Then** the fault is fixed and the check repeated; the story is done when every check passes and the results are recorded in `docs/`

**Requirements:** NFR-5, NFR-6, FR-26, FR-60, AD-7, AD-9, AD-13, AD-14, AD-15, AD-21, AD-22
**Notes for the developer:**
- Touches tests across `apps/commerce`, `apps/content`, `apps/worker` and `infra/` (Caddy and compose network rules), and `docs/` for the record. This is a verification story: expect small fixes, not new features.
- Add the checks as automated tests wherever they can run in continuous integration, so they keep running after launch.
- A fault too large to fix here is a reason to stop and tell the founder, not to pass the story.

---

### Story 7.10: Every routine task has an Admin page

As an Owner,
I want to do every routine task in the Admin and see the shop's health on one page,
So that running the shop never needs a command line or a release.

**Acceptance Criteria:**

**Given** the Admin
**When** the Owner opens the operations page
**Then** she sees: whether each unit is healthy; the shop queue's waiting and failed jobs; the time of the last nightly backup and the age of the newest shipped log; the last reconciliation run and whether it is reconciled; the date of the last restore rehearsal and when the next is due; any erasure older than 24 hours; active alerts; and the minimum app version (NFR-10)
**And** figures are no more than 5 minutes old, and the page shows no Shopper's personal data

**Given** a shop-queue job that failed after its last retry (a message, an invoice file, a tile build, an erasure at an AI provider)
**When** the Owner chooses "run again"
**Then** the admin route starts the `requeue-job` workflow, which enqueues it again with the same deterministic id (only commerce workflows enqueue, AD-8), the action is audited, and nothing is sent or made twice (AD-8, AD-14)
**And** a failed Try-on generation is not offered for re-run, because the Shopper was already told it failed

**Given** the list of routine tasks written in `docs/` by this story
**When** each is performed on staging using only the two admins, with no command line, no database tool and no release
**Then** every one succeeds: create and publish a Design with photos and a full-length image; add a Weaver; adjust stock and read a Variant's stock history; create a discount; change a tax rate for a tax code from a date; compose, preview, schedule and publish a Server-driven screen and go back a version; create a shipping label and mark dispatch; cancel an Order; move a Return through its states with inspection photos and restock or mark damaged; refund in full and in part; look up a Shopper, reply to and close a complaint, carry out a data request and deactivate an account; change the delivery region, shipping charge rule, return period and Try-on limits; publish a new version of a notice or policy and a translation; add an approved model, publish and roll back a Model route and a Prompt version, run the sample set, set the daily cap, switch Try-on off and on; handle the review queue; read the cost and failure view; set alert thresholds; settle a reconciliation difference; send a breach notice; read the success metrics; set the minimum app version (NFR-10)
**And** the result of each is recorded as pass or gap

**Given** a task recorded as a gap
**When** this story is worked
**Then** an Admin page or action is added that starts the existing workflow for it, audited like every other admin change, and the task is walked again until it passes (AD-4, AD-14)

**Given** the tasks that are deliberately not in the Admin
**When** `docs/` is read
**Then** it lists them with the reason: deploying a new version (done by continuous integration), the quarterly restore rehearsal and server maintenance (not routine under NFR-10; each follows a written runbook), rotating secrets in a breach, and recovering a lost second factor by the rehearsed process in FR-60

**Given** the Owner has two admins with separate sign-ins
**When** she uses a task that spans both (for example a notice version published in content that commerce must know)
**Then** each admin links to the other's page for that task, and she never has to copy an id by hand

**Requirements:** NFR-10, AD-4, AD-8, AD-14, AD-21
**Notes for the developer:**
- Touches `apps/commerce` (`src/admin` operations page, one admin route that starts the `requeue-job` workflow, any gap pages), `apps/content` (links only) and `docs/`.
- Kernel admin screens that are hidden under AD-21 stay hidden; a gap is closed with a shop page that starts a workflow, never by un-hiding a kernel screen.
- Staff accounts (FR-50) remain deferred; every action here is still recorded against the named account.

---

### Story 7.11: Load test and the production hosting decision

As an Owner,
I want the shop tested at its launch size and a recorded decision on where production runs,
So that real payments start on hosting I know can carry them.

**Acceptance Criteria:**

**Given** staging on the free ARM server, loaded with 100 Designs of about 10 Pieces each, their photos and Full saree views
**When** the k6 load script of Story 1.26 runs the whole launch load of the spine's test profile for 30 minutes: 50 Shoppers browsing, searching and opening Design pages at once, 5 Checkouts a minute through the payment service's test mode, 2 Try-on jobs at once against a stand-in AI provider, and Full saree view tiles being requested
**Then** the results are recorded: response times, error rate, memory and processor use of each container, and queue waiting times
**And** the test passes only if the pass conditions of Story 1.26 hold and also: the catalogue read behind the Design page answers within 1 second for 95% of requests; search answers within 2 seconds (FR-2); fewer than 0.5% of requests fail; total memory stays under 80% of the server's 12 GB; and the Try-on queue's waiting time leaves room for the 60-second target in NFR-2 `[ASSUMPTION: the 1-second, 0.5% and 80% figures and the 30-minute length; the spine gives the load, not the pass conditions]`

**Given** the same load
**When** 20 simulated Shoppers begin payment for the last Piece of one Design at the same moment
**Then** exactly one gets the Hold and one Order results; the others are refused before any money is taken; and the stock movements account for every change (FR-19, AD-6)

**Given** the load test has finished
**When** the reference phone from Story 6.18 opens a Design page in the app and on the website over 4G while a lighter load continues
**Then** the page is usable within 3 seconds (NFR-1)

**Given** the results
**When** the size gate is applied
**Then** the decision that Story 1.26 recorded in `docs/` is confirmed or revised: if every pass condition held, production takes the free server and staging runs on demand; if any did not, production starts on a paid server, with its size chosen from the measured use (spine: Deployment and environments)
**And** the decision records the monthly cost, who decided and the date, and answers PRD Open Question 7

**Given** the decision
**When** the production environment is built
**Then** it runs the same images from the same compose file as staging, with its own secrets, its own databases and buckets, backups to another location as in Story 7.6, and the outside uptime check from Story 7.1 pointed at it (AD-16, AD-17)
**And** production never runs in a vendor's test mode: until go-live it holds no payment keys, and its `shop open` setting, a dated setting created in this story that is off on a new production installation, makes `begin-checkout` refuse with `shop.not_open` while clients say the shop opens soon; so no Checkout, Order, invoice or credit note can exist on production before Story 7.15, and nothing ever has to be removed from it (AD-25)
**And** the configuration check at start refuses to run production with a missing value, with any vendor's test key, or with the fake AI provider selected
**And** if production is on a different processor type from staging, the end-to-end purchase test passes on a separate stack of that processor type built from the same images and the same compose file, never on production itself

**Given** production runs on the free server
**When** staging is needed for a restore rehearsal or a release check
**Then** `docs/` gives the steps to bring staging up on demand elsewhere and take it down again, and the rehearsal in Story 7.7 is not run on the production server

**Requirements:** NFR-1, NFR-2, NFR-8, FR-2, FR-19, AD-6, AD-16, AD-17
**Notes for the developer:**
- Builds on Story 1.26, which ran the size gate without Try-on and with a small catalogue. Touches `infra/` (the k6 load script extended with search, tiles and the Try-on part; production compose overrides and Caddy configuration) and `docs/`. The load tool is k6 (spine Stack); add no other.
- The stand-in AI provider is the fake provider of Story 4.5, not a new adapter; this story adds the production guard that makes it impossible to select there (AD-10).
- The `shop open` setting is a key of the `settings` module changed through `update-setting` and audited; on staging and locally it is seeded on, so every existing test still passes.
- Vendor live modes are switched on in Story 7.15, not here.

---

### Story 7.12: Reviewed legal documents and disclosures go live

As a Shopper,
I want the shop's terms, policies, notices and disclosures to be complete, reviewed and true,
So that I know who I am buying from and what happens to my data and my photo.

**Acceptance Criteria:**

**Given** the drafts in `docs/legal/` as reviewed by the founder's lawyer and accountant
**When** the Owner loads them into content on production
**Then** the terms of use, privacy policy, Try-on consent notice, returns, refunds and cancellation policy, shipping policy and grievance redressal each exist as a published, numbered version with an effective date (FR-59)
**And** every one of the 14 placeholders listed in `docs/legal/README.md` is filled, and a check refuses to publish any document that still contains a `{{...}}` placeholder or the "Draft, not yet reviewed" line
**And** each publication is recorded as a content audit event (AD-14)

**Given** the published Try-on consent notice
**When** it is compared with the live AI settings
**Then** the AI services it names are exactly the services that the Approved-model list says can receive a Shopper photo, including the aggregator and each model provider (FR-8, AD-11)
**And** the retention period it states equals the retention setting (30 days at launch) (FR-51)
**And** its statements about training, logging and no-retention match what the Approved-model list records and what the worker's fixed flags do (FR-40, AD-10)
**And** on publishing, content has told commerce the notice version and service ids, and the current Model route can be published against it; a Model route naming a service absent from the notice is refused (FR-39, AD-11)

**Given** a Shopper who accepted an earlier draft version of the notice during testing
**When** she next starts Try-on
**Then** she is asked to accept the published version (FR-8)

**Given** the shop settings and the published policies
**When** they are compared
**Then** the return period, the delivery region and the shipping charge rule in settings equal what the policies say, and the comparison is recorded (FR-56, AD-13)
**And** the same return period and conditions show on the Design page and at checkout, on the website and in the app (FR-23)

**Given** the website and the app
**When** a Shopper opens the footer or "about and legal"
**Then** she sees the shop's legal name, address, contact details and grievance officer, and working links to the privacy policy and the terms (FR-29)
**And** every Design page shows the maker's name and address, the consumer-care contact and the return, refund, delivery and payment terms (FR-3)
**And** the public web page for account deletion is reachable at the address written in the privacy policy (FR-27)

**Given** a launch language other than English is switched on (Tamil is the first)
**When** the documents are published
**Then** the Try-on consent notice exists in that language at the same version number, and every other document falls back to English where no translation exists (FR-8, NFR-14, AD-11)

**Given** the message templates in content
**When** each Shopper event in FR-54 is triggered on staging, after production's published templates and disclosures have been copied there by the import of this story
**Then** each message uses its template with the real shop name and contact details, and none contains a placeholder
**And** nothing is triggered on production, which holds no test Order or invoice (Story 7.11)

**Requirements:** FR-3, FR-8, FR-27, FR-29, FR-39, FR-40, FR-51, FR-59, NFR-14, AD-10, AD-11, AD-13, AD-14
**Notes for the developer:**
- Touches `apps/content` (the publish check for placeholders, loading the documents through the content admin or a one-time import that writes ordinary numbered versions) and `docs/legal/` (the filled copies kept as the record).
- The developer agent does not decide legal wording. Where the lawyer changed an assumption, change the setting or the document version, not code (PRD §8).
- If the Try-on launch gate decided that Try-on does not ship, the notice is still published so that switching Try-on on later needs no release.

---

### Story 7.13: Google Play requirements and submission

As an Owner,
I want the Android app to meet Google Play's requirements and be submitted for review,
So that Shoppers can install it from the store.

**Acceptance Criteria:**

**Given** the release build from the current app version, pointed at production
**When** it is checked against Google Play's requirements in the compliance research
**Then** each of these is shown true and recorded with its evidence in `docs/`: a report control is on the screen where a Try-on result is shown and feeds the Owner's review queue (FR-13, FR-44); the Shopper photo is chosen with the system photo picker and the manifest has no broad photo or storage permission (FR-10); account deletion works inside the app and at a public web address, and removes Shopper photos and Try-on results (FR-27); the privacy policy is linked inside the app and names photo collection and the AI services that receive photos (FR-29); Server-driven screens can only arrange components and actions already in the build (FR-33); the manifest has no advertising-id permission (AD-29)

**Given** the facts of what the app collects and shares
**When** the Data safety inputs are written in `docs/`
**Then** they list each kind of data (mobile number, name and address, optional email, Shopper photos, Try-on results, purchase history, complaints, and counts that are not linked to a person), why it is collected, whether it is required, and who receives it (the payment service, the shipping service, the SMS and email services, and for photos the AI services named in the consent notice)
**And** they state that data is encrypted in transit, that deletion can be requested in the app and at the public web address, and that no data is used for advertising
**And** every statement matches the published privacy policy from Story 7.12; a mismatch is fixed in whichever is wrong before submission

**Given** the store declarations
**When** the Owner completes them in the Play Console
**Then** the target audience is declared as adults (18 and over), the privacy policy address and the account-deletion address are entered, and the AI-generated-content questions are answered with the report control and the result check described (FR-9, FR-52)
**And** the application id contains no product name, and the listed name is the configured product name (NFR-12)

**Given** store reviewers cannot receive a one-time code by SMS
**When** the Owner needs to give them access
**Then** the Admin has a "store review access" setting, as the spine's Consistency Conventions provide: one reviewer account with a fixed sign-in code can be switched on for a single mobile number, and is off otherwise
**And** switching it on or off is audited, it is shown on the operations page while on, and the normal rate limits and Try-on limits still apply to it
**And** it has an end date at which it switches itself off `[ASSUMPTION: the end date; the spine says only that it is off otherwise]`
**And** the review notes give that number and code, say that checkout on production is closed until the launch date so that no test invoice is ever issued there, point to a recorded test purchase made on staging (and offer a staging-pointed build on an internal track if reviewers ask to buy), and explain Try-on, its consent step and its "AI-generated" label

**Given** the Try-on launch gate decided that Try-on does not ship at launch
**When** the declarations are made
**Then** they still describe Try-on, because it is in the build and can be switched on by the Owner later, and the review notes say how reviewers can see it (FR-33)

**Given** the listing needs screenshots and a description
**When** they are prepared
**Then** screenshots are taken from the release build after it is styled from DESIGN.md, show only real product photos and correctly labelled Try-on results, and make no claim the shop cannot evidence (FR-38, NFR-13)

**Given** everything above is complete
**When** the Owner uploads the build to a testing track and sends it for review
**Then** the Play Console shows no outstanding policy or declaration warning, and the submission date and any tester requirement Play sets for the developer account are recorded
**And** if the review is rejected, the reason is recorded, fixed and resubmitted; the outcome is tracked in the launch checklist

**Given** store policies change
**When** this story is done
**Then** `docs/` holds the checklist used, dated, with a note to re-check Google Play's policy before every later submission

**Requirements:** FR-9, FR-10, FR-13, FR-27, FR-29, FR-33, FR-52, NFR-12, NFR-13, AD-13, AD-14, AD-20, AD-29
**Notes for the developer:**
- Touches `docs/` (the requirements record, the Data safety inputs, review notes), `apps/commerce` (the store review access setting in the `settings` module and its check in the one-time-code provider of Story 3.8) and continuous integration (the manifest checks from Stories 6.15 and 7.4 reused as evidence).
- The Owner performs the Play Console steps; the developer agent cannot.
- Promotion from the testing track to public release happens in Story 7.15.

---

### Story 7.14: Launch checklist, final requirements check and honest-design self-audit

As an Owner,
I want one checklist that shows every cross-cutting requirement proven, every ⚖ item confirmed by my lawyer or accountant, and the dark-pattern self-audit done,
So that I launch knowing nothing was left on an unconfirmed assumption.

**Acceptance Criteria:**

**Given** the launch checklist in `docs/`
**When** it is opened
**Then** it has one row for each of NFR-1 to NFR-16 with the evidence that it holds and where that evidence is: NFR-1 the phone measurements (Stories 6.18, 7.11); NFR-2 the share of Try-on results within 60 seconds from the cost and failure view; NFR-3 the cost ceiling set and a Model route above it refused; NFR-4 reconciliation clean (7.5); NFR-5 and NFR-6 the security pass and an erasure completed within 24 hours (7.9); NFR-7 the drill (7.8); NFR-8 the rehearsal (7.7); NFR-9 each alert received (7.1, 7.2); NFR-10 the routine-task walk (7.10); NFR-11 the vendor contract tests passing before release, those of the SMS and email adapters of Story 3.6 included; NFR-12 the name check; NFR-13 the self-audit below; NFR-14 a document in content, a Design's translated text in commerce and one interface text in a translation bundle (Stories 3.4 and 6.3) each changed and appearing on the website and in the app without a release, and every interface text key present in each language's built-in file; NFR-15 the accessibility walk on the app (6.18) and on the website; NFR-16 the counts (7.3, 7.4)
**And** a row without evidence, or with a failed check, is marked open, and launch is blocked while any row is open

**Given** the items marked ⚖ in PRD §8
**When** the checklist lists them
**Then** each has its working assumption, the setting or document version where it lives, who confirms it, the date and the answer given
**And** the accountant's rows are: whether an unstitched saree above Rs 2,500 is taxed at 5%; pre-stitched sarees and blouse sets; tax on shipping charges; the deadline for credit notes
**And** the lawyer's rows are: a photo of someone other than the Shopper; one-year access logs alongside erasure; what age check is sufficient; whether the AI labelling rules bind a shop; the return-policy wording; the rules governing silk, handloom and regional-name claims; whether an aggregator's standard terms are a sufficient contract; and the breach-notice wording from Story 7.8

**Given** a professional's answer differs from the working assumption
**When** the Owner applies it
**Then** the change is made by a setting with an effective date or by a new document version, without a release, and the checklist records what was changed (AD-13)
**And** this is proven once on staging by changing the rate band of a tax code from a date and seeing a new invoice use it while an old one is unchanged (FR-37, AD-5, AD-25)
**And** an answer that cannot be met by a setting or a document is recorded as a blocker for the founder, not worked around

**Given** the official list of dark patterns
**When** the Owner completes the audit on the Admin page of Story 3.26, covering the website and the app screen by screen against each pattern on it
**Then** the audit is recorded there as a `shop-audit` event that states for each pattern whether any instance was found, with the screen and the fix, and specifically confirms: no pre-ticked extras; no false urgency; no charge added after the cart; no sign-up demanded for anything unrelated to the purchase; consent to Try-on never bundled or nagged (NFR-13)
**And** no second record and no second reminder is built here: the audit-due job of Story 3.26 reminds the Owner when the next yearly audit is due

**Given** the PRD's open questions
**When** the checklist is completed
**Then** it records the founder's answers on: the Try-on launch gate result and whether Try-on ships switched on or off; the shipping service; launch languages; the return period; Try-on limits and the daily cap; the delivery region; and the hosting decision from Story 7.11
**And** each answer is shown to equal the matching setting on production

**Given** the remaining launch conditions
**When** the checklist is reviewed
**Then** it also shows: the Try-on launch gate run by the Owner with its recorded decision (Story 4.26); the legal documents published (7.12); the store review outcome (7.13); the Owner's second-factor recovery rehearsed (FR-60); backups running on production (7.6); and the uptime check watching production (7.1)

**Requirements:** NFR-1 to NFR-16, FR-37, FR-60, PRD §8, PRD §10, AD-5, AD-13, AD-25
**Notes for the developer:**
- Touches `docs/` only; the yearly reminder is the audit-due job of Story 3.26, which is not built again. The website accessibility walk is done here because Epic 6 walked only the app.
- The developer agent gathers evidence and runs the checks; the lawyer's and accountant's answers come from the founder.
- A failed NFR check is fixed in the unit that fails it and re-checked before this story closes.

---

### Story 7.15: Go live

As an Owner,
I want to switch the shop to the vendors' live modes and open it to Shoppers,
So that real Shoppers can buy real sarees.

**Acceptance Criteria:**

**Given** every row of the launch checklist from Story 7.14 is closed
**When** go-live begins
**Then** it follows a written go-live list in `docs/`, step by step, with each step ticked and timed
**And** go-live does not begin while any checklist row is open

**Given** production
**When** the vendors are switched to live mode
**Then** the payment service uses live keys with its webhook pointing at production and verified by signature; the shipping service uses the live account; the SMS and email adapters of Story 3.6 use the vendors' live credentials with the approved live sender and templates; and the AI provider uses the live key with logging off and the no-retention option on where offered (AD-7, AD-10, AD-26, FR-40)
**And** the configuration check at start refuses to run production with any vendor's test key, and staging keeps only test keys (Conventions: Config and secrets)

**Given** production before it is opened
**When** it is inspected
**Then** it holds no test Order, invoice or credit note, because no Checkout could begin there before now (Story 7.11) and every test ran on staging; a check finds that no invoice or credit-note number has been issued, so numbering starts at the beginning and is gapless from there, with nothing deleted (AD-25); any Design or Weaver listed only for the store review is unpublished or deleted by the Owner in the Admin, and the reviewer account is deactivated through Shopper support; the store review access setting is off unless a review is in progress; and the minimum app version equals the released version (FR-55)

**Given** live modes are on and the Owner has switched the `shop open` setting of Story 7.11 on, which is audited
**When** the Owner buys one real Design with her own money, on the website and again in the app
**Then** each payment is confirmed by the payment service to the server, an Order is created with a correct invoice, the confirmation messages arrive by SMS and email, and a real shipping label can be created (FR-18, FR-20, FR-47, FR-54)
**And** she cancels one Order and returns the other; each refund goes back to the payment method used, with a credit note linked to its invoice (FR-22, FR-24)
**And** these are real sales and real documents and are kept; the next day's reconciliation shows no unexplained difference (NFR-4)

**Given** Try-on ships switched on
**When** the Owner makes one Try-on with her own photo on production
**Then** the consent notice shown is the published version, the result arrives labelled "AI-generated", its cost is recorded, and she then withdraws consent and sees the erasure completed and the AI provider's answer in the erasure ledger (FR-8, FR-12, FR-15, AD-23)
**And** if Try-on ships switched off, Shoppers see the "unavailable" behaviour and no Shopper photo can be uploaded

**Given** the live checks pass
**When** the shop is opened
**Then** the website is reachable at its public address, and the Android build approved in Story 7.13 is promoted to public release in the store
**And** the outside uptime check, the alerts from Story 7.2 and the backups from Story 7.6 are confirmed working on production by a test alert and a look at the operations page

**Given** something goes wrong during go-live
**When** a step fails
**Then** the go-live list says how to go back: switch the `shop open` setting off so that no new Checkout can begin, start the previous images, or switch Try-on off; production is never returned to a vendor's test mode; and the shop is not opened until the step passes

**Given** the shop is open
**When** the first day ends
**Then** the Owner has read the operations page, the reconciliation result and the success-metrics page, and the go-live record in `docs/` is signed off with the date

**Requirements:** NFR-4, NFR-8, NFR-9, NFR-11, FR-18, FR-20, FR-22, FR-24, FR-55, AD-7, AD-10, AD-16, AD-17, AD-25, AD-26
**Notes for the developer:**
- Touches production configuration, `infra/` and `docs/` only; no feature code. Anything found broken is fixed in its own unit, redeployed through continuous integration and re-checked.
- Vendor contract tests keep running against test modes on staging before every release (NFR-11); live modes are checked only by the real purchases above.
- Any requirement the SMS service has for approving sender names and templates was listed in `docs/` by Story 3.6; it is completed as part of live mode and ticked in the go-live list. This story builds no adapter.
- The developer agent prepares the go-live list and the configuration checks; the live keys, the real purchases and the sign-off are the Owner's.


## Changes after the epics were finalised

The PRD was updated on 2026-11-27 after the founder's design decisions. The stories above were written before these changes. Each affected story is revised when its epic is about to be built.

| Change | PRD | Stories affected |
|---|---|---|
| Weavers are Admin records only; Shoppers are never shown who wove a Design. No Weaver page, filter, search field, badge or Block. | FR-1, FR-2, FR-3, FR-4, FR-30, FR-57 | Epic 2: the Weavers, catalogue read, browse and filter, search, Weaver page and Design page stories; Epic 5: the Design and Weaver Blocks story; Epic 6: the browse and Design page stories |
| The product is for all garment categories. Departments and categories with thumbnails; attributes, variant choices and size charts depend on the category. | FR-65, NFR-17 | Epic 2: attributes, Variants, catalogue read, browse and Design page stories; Epic 5: Blocks (category tabs, category thumbnails); Epic 6: the same screens |
| New Shopper features: Buy now, similar products, public star rating, offer card. | FR-61, FR-62, FR-63, FR-64 | New stories needed in Epic 2 (similar products, offer card), Epic 3 (Buy now, public rating); Epic 6 mirrors them |
| Compact sizing and the reference layout. | NFR-18, PRD §7a | Every Shopper-facing story, through DESIGN.md |
| Blocks at launch now include banner carousel, category tabs, category thumbnail row and service strip. | FR-30 | Epic 5: the draft and Blocks stories; Epic 6: server-driven screens |
| Sign-in also by email code (not Google); a Shopper who signed in by email proves a mobile number before her first Order. Admin second factor is a code by email and SMS. | FR-26, FR-60 | Epic 3: sign-in stories; Epic 1 or 7: Admin sign-in; Epic 6 mirrors them. Needs an email-code adapter alongside the SMS one |
| Wishlist. | FR-66 (new) | New stories: Epic 3 (wishlist data and screens), Epic 6 (app) |
| Shopper-visible coupon list in the Cart; one code per Order. | FR-58 | Epic 3: discount and Cart stories |
| Push notifications for Order events and Try-on ready, with a Notifications screen; permission asked after the first Order or Try-on. | FR-54, section 6.2 | Epic 6: new push story; Epic 3 and 4: message jobs gain a push channel |
| True low-stock count at or below the Owner's level; free delivery as the launch shipping rule. | FR-3, FR-56 | Epic 2: Design page; Epic 3: Cart and shop settings |
| Rating may carry ready-made tags and a private note to the Owner. | FR-63 | Epic 3: rating story |
| Stated as out of the first version: exchange, WhatsApp, marketing push, tell-me-when-back, onboarding slides, third-party sign-in, staff roles, written public reviews. | section 6.2 | None; the boards for these are kept in the "later version" row of the canvas |
