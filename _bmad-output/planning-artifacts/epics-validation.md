# Epics and stories validation report

- **Document validated:** `_bmad-output/planning-artifacts/epics.md` (7 epics, 133 stories), read in full and in order
- **Against:** `prds/prd-saree-commerce-2026-11-27/prd.md` and `architecture/architecture-saree-commerce-2026-11-27/ARCHITECTURE-SPINE.md`
- **Date:** 2026-11-27
- **Not redone (established mechanically beforehand):** story format, FR and NFR citation coverage, Story 1.1 as starter setup

## Result

| Check | Result | Findings |
| --- | --- | --- |
| 1. Forward dependencies | **Fail** | 1 critical, 3 high, 11 medium, 4 low |
| 2. Duplicate creation | **Fail** (no blocker) | 3 medium, 6 low |
| 3. Requirement substance | **Fail** | 2 critical, 2 high, 3 medium |
| 4. Contradictions with the architecture | **Fail** | 2 high, 3 medium, 5 low (plus the two critical items of check 3, which are also AD breaches) |
| 5. Story size | **Fail** | 4 high, 22 medium, 1 low |
| 6. Epic independence | **Pass** | 2 low |

**Totals: 3 critical, 11 high, 42 medium, 18 low.**

Severity scale: **critical** will block or mislead a developer agent; **high** makes rework likely; **medium**; **low**.

Each finding has an id (F forward, D duplicate, R requirement, A architecture, S size, E epic).

---

## Check 1: Forward dependencies

A story uses something that only a later story creates, or that no story creates.

| Id | Story | What is wrong | Severity | Fix |
| --- | --- | --- | --- | --- |
| F1 | 3.4, used by 3.6, 3.18, 7.12, 7.15 | **No story builds a real SMS or email adapter.** Story 3.4 writes the `SmsSender` and `EmailSender` interfaces and "a test-mode adapter for each; a real vendor is a later adapter". No later story creates it. Story 7.15 then switches "the SMS and email services" to "the approved live sender" as if it existed. Without it no sign-in code can be sent in production, so checkout, order history and Try-on are unreachable. The NFR-11 contract tests in 3.4 also test only a sink. | critical | Add Story 3.4b "SMS and email vendor adapters" straight after 3.4: one adapter per vendor in `apps/worker/src/providers`, contract tests against each vendor's test mode, sender and template registration recorded in `docs/`. Give it the same rule as Story 1.15: if the founder has not named the vendors, stop and report. Point 7.15 at it. |
| F2 | 2.8 | **The `tiles` bucket is created by no story.** Story 1.3 says it is created "by Epic 2"; Story 2.8 writes to it but neither its criteria nor its touch list (`packages/contracts`, `apps/worker`, `apps/commerce`) creates it. Story 4.4, by contrast, states that it creates `shopper-media`. | high | Add to 2.8: "the public `tiles` bucket is created in this story, in `infra/` for local and staging", and add `infra/` to its touch list. |
| F3 | 3.18 (also 7.8) | **"The Shopper's saved language" has no creator.** 3.18 enqueues each message "with the Shopper's saved language" and 7.8 sends "in each Shopper's language". Story 2.12 remembers the language on the device only; 3.6 and 3.7 store nothing; 3.21 lists "language" among account details as if it existed. | high | Add to 3.6: the language of the sign-in request is saved on the Shopper account by a workflow and updated when she changes it (Story 2.12's control calls it when signed in). Add to 3.9 or 3.13: the Checkout snapshot records the language, so messages for a deleted account still have one. |
| F4 | 3.6, 3.7, 3.9, 3.16 | **The end-to-end test of Story 1.23 is broken by Epic 3 and no story repairs it.** The test signs a Shopper up with email and password (removed by 3.6), does not accept terms (required by 3.7), uses an address with no delivery check (3.9), and records one inspection action (replaced by `accept-return` in 3.16). The spine and Story 1.23 block every deploy while it fails. | high | Add one criterion to each of 3.6, 3.7, 3.9, 3.12 and 3.16: "the end-to-end test of Story 1.23 is updated for this change and passes" (3.6: sign in through the SMS test sink). |
| F5 | 1.22 | The size gate needs "100 published Designs with 10 Pieces each" but says "no application code should change". The seed script for about 100 Designs is created in Story 2.13. | medium | Move the seed script into 1.22 (or 1.8) and have 2.13 extend it with attributes and Weavers. |
| F6 | 2.19 | Uses "the shipping charge rule in the `settings` module ... using its seeded value". No earlier story seeds that key: Story 1.8 seeded a kernel shipping option of Rs 0, and the key is created by Story 3.5. | medium | State in 2.19 that it creates and seeds the `shipping charge rule` key (flat Rs 0) and maps it to the kernel shipping option; 3.5 then only makes it editable. |
| F7 | 1.12 | The reconciliation job reuses "the Order id and invoice number already written in the file". Invoices and invoice numbers do not exist until Story 1.13. | medium | Swap the order (1.13 before 1.12), or cut the invoice-number clause from 1.12 and keep it in 1.13, which already tests it. |
| F8 | 1.10 | Stores the Order state Paid in the new `order-state` module, but the Order state enum and transition table in `packages/contracts` are created by Story 1.13. | medium | Move the enum and transition table to 1.10; 1.13 only shows the state. |
| F9 | 4.5, 4.9, 4.12, 4.4, 4.8 | Settings read before the story that creates them: the Try-on time limit (used by 4.5 "the caller's time limit" and by 4.9; created in 4.13); the retention period (4.12 lists requests "from the retention period"; the setting is created in 4.22); photo size limits, the upload-link rate limit and the prompt maximum length ("in settings", no creator named). | medium | Add a line to each story: "seeds the keys it first reads". Seed the time limit in 4.5, the retention period in 4.1 (where the notice already carries it), the photo and rate limits in 4.4, the prompt length in 4.8. |
| F10 | 3.21 | `erase-shopper-media` "deletes every file of hers in `shopper-media`", a bucket created by Story 4.4. | medium | Create the bucket in 3.21 (private, unversioned, encrypted) and remove that line from 4.4; or state that the file step is skipped until 4.4. |
| F11 | 1.24 | The sample tile set is "served from staging object storage" with no bucket named; `tiles` does not exist yet. | medium | Name the `catalog` bucket under a `spike/` prefix and have 2.9 delete it when it replaces the sample page. |
| F12 | 3.2, 4.2 / 4.4, 1.12 | Three homes are used without ever being created: the `consent` module (first used by `record-notice-version` in 3.2, never "created here"), the `tryon` module (first entity in 4.4; 4.2 already has `store/shop/tryon/status`), and the reconciliation record of 1.12, which names no module. Every other module has an explicit "created in this story". | medium | Add "creates the `consent` module" to 3.2 and "creates the `tryon` module" to 4.2. Put the reconciliation record in the `checkout` module in 1.12. |
| F13 | 3.7, 3.10, 3.12, 3.13, 3.16, 3.17 | Each says "the Owner is alerted by a `message.send` job" but names no template. 3.4 says each story creates its own templates; the `owner-alert` templates are only defined in 3.18. A job with a missing template fails without sending (3.4). | medium | Each of these stories names and seeds its template key, or 3.4 seeds one generic `owner.alert` template that they all use. |
| F14 | 4.19 | Shows the notice version "with the content admin's email as actor", but the `/internal/content/notice-published` payload of 3.2 and 4.1 carries key, version, service ids and time only. | medium | Add the actor's email to the payload in 3.2 and to the `record-notice-version` audit event. |
| F15 | 3.19, 3.20, 3.24 | Three promises to Epic 4 and Epic 6 that no later story keeps: 3.20 "Epic 4 adds a request type for a person who appears in a Try-on result"; 3.24 "Try-on consent screens (Epic 4) and the Android app (Epic 6) add their own cases to the same tests and checklist". (The third, 3.19's "used Try-on" function, is R4; 3.22's data report is R5.) | medium | Add the request type to 4.22 (which already handles the depicted person in Shopper support). Add a criterion to 4.3 and to 6.15 extending the honest-design tests and checklist of 3.24. |
| F16 | 5.1 | Block wording is entered "for each configured language"; the language list lives in commerce's `settings` (2.11) and no lookup from content is defined. 3.2 has the same need. | low | Add a read-only `/internal/settings/languages` lookup in 3.2 and reuse it in 5.1. |
| F17 | 2.20 | Copies are "enqueued by the workflow that attaches a photo"; no such workflow exists (1.6 uploads through the kernel's file storage). | low | 2.20 creates an `attach-photo` workflow and routes Design, Variant and Weaver photo uploads through it. |
| F18 | 1.11 | "The scheduled job retries" a refused automatic refund; the job is not named or created. | low | Name it (`retry-pending-refunds`) and list it in 1.11's touch list. |
| F19 | 7.6 | Commerce runs "a scheduled check that reads backup status", but nothing says how commerce learns pgBackRest's status. | low | The backup script posts its result to `/internal/ops/backup-status` with the service token (starts a workflow), or writes a status object that commerce reads. |

---

## Check 2: Duplicate creation

| Id | Story | What is wrong | Severity | Fix |
| --- | --- | --- | --- | --- |
| D1 | 3.24 and 7.14 | The yearly honest-design audit is built twice in two homes. 3.24: an Admin page that records the audit as a `shop-audit` event, and an audit-due job that reminds after 11 months. 7.14: "a dated record in `docs/`" and "a `message.send` reminder ... scheduled for one year after the audit date". | medium | In 7.14 replace both with: "the Owner completes the audit on the Admin page of Story 3.24, covering the website and the app"; drop the second reminder. |
| D2 | 1.9 vs 3.8; 1.17 vs 3.17 | The same condition gets two error codes: `cart.locked` (1.9) and `cart.locked_by_checkout` (3.8); `refund.exceeds_paid` (1.17) and `refund.amount_exceeds_paid` (3.17). Codes must be stable (spine, Errors; AD-27). | medium | Keep the Epic 1 codes and correct 3.8 and 3.17. |
| D3 | 3.18 vs 3.10, 3.12, 3.13, 3.16, 3.17 | Owner alerts for "a pickup could not be booked", "a refund failed" and "a dispute was opened" are created in the stories that raise them and again in 3.18. | medium | 3.18 lists only the alerts not yet built (new Order Paid, Return Requested, Return Received) and references the others. |
| D4 | 3.1 and 3.3 | Both create "a read-only content reader" in commerce. | low | 3.3's touch list says "uses the content reader of Story 3.1". |
| D5 | 1.13 / 1.16 vs 3.10 / 3.13 | The Order and Return enums and transition tables are stated as outcomes of both stories ("holds exactly ..."). The Return workflows are unnamed in 1.16 and appear as new `request-return` and `book-return-pickup` in 3.13. | low | Name the workflows in 1.16; word 3.10 and 3.13 as "extends the table of Story 1.13 / 1.16 with these transitions". |
| D6 | 1.8, 2.19, 3.9; 1.9, 2.19, 3.8 | The shipping line in the cart is specified three times, and the "flag a changed line and require acceptance" rule three times. | low | Keep each rule in one story; the others cite it. |
| D7 | 7.11 | "The stand-in AI provider is an adapter behind `TryOnProvider` used only by tests" reads as a new adapter; it is the fake of Story 4.5. | low | Say "the fake provider of Story 4.5, with the production guard added here". |
| D8 | 1.8, 1.24, 2.13 | `DesignCard` is created "here if Story 1.8 did not create one" (1.24) and extended in 2.13; 1.8 creates `DesignView` and `CartView` only. | low | Decide: 1.8 creates `DesignCard` for its plain list; 1.24 and 2.13 extend it. |
| D9 | 3.5 vs 2.5, 4.2, 4.7, 4.11, 4.16 | `update-setting` is "the" workflow for a dated setting, yet tax bands, the switch, the exchange rate, the cost ceiling and the cap each get their own write path. | low | State in 3.5 that later settings reuse `update-setting` unless a story needs extra checks, and name those that do. |

---

## Check 3: Requirement substance

FR consequences in the PRD that no story's acceptance criteria satisfy. FRs not listed were checked consequence by consequence and are covered.

| Id | Requirement | What is wrong | Severity | Fix |
| --- | --- | --- | --- | --- |
| R1 | FR-37 (also AD-5) | "A tax-inclusive price that fits no tax band (Rs 2,626 to Rs 2,950) is refused, with the nearest valid prices offered." **No story refuses such a price.** Story 2.5's note says the opposite: "`[ASSUMPTION: for such a price the higher rate is used; the spine does not say]`". The spine does say: AD-5 makes `publish-design` and the discount workflow refuse it and name the nearest valid prices. 2.6, 2.10 and 2.18 have no such check. | critical | Delete the assumption in 2.5. Add a money function that returns the nearest valid prices. Add a criterion to 2.6 (`set-variant-price`), 2.10 (`publish-design`) and 2.18 (discounted price): refuse with `price.fits_no_tax_band` and the two nearest valid prices in `details`. |
| R2 | NFR-14 (also AD-28) | "All Shopper-facing text can be translated without a release." AD-28 as written: interface text is "a translation bundle per language, held in content and served through commerce; each client caches it and carries a built-in copy as a fallback, so wording changes need no release". **No story builds the bundle.** Stories 1.2, 2.11, 2.12, 6.3 and 7.14 state that "AD-28 puts interface text in the clients' translation files" and that a wording change needs a deploy or an app release. That misquotes the spine and leaves NFR-14 unmet for all interface text, on the app most of all. | critical | Add a story after 3.3: a translation-bundle collection in content (one per language, versioned, audited), `GET /store/shop/translations/{language}` in commerce, a function in `api-client`, client caching with the built-in file as fallback. Add one criterion to 6.3 for the app. Correct the notes in 1.2, 2.11, 2.12, 6.3 and the NFR-14 row of 7.14. |
| R3 | FR-20 | "A saree sold with a stitched blouse appears as two invoice lines when their tax treatment differs." Story 1.13 defers it to Epic 2; no Epic 2 story mentions it. | high | Add to 2.5 (or a new 2.5b): a Design can carry a stitched blouse component with its own tax code and share of the price; the Checkout snapshot and the invoice then carry two lines, each taxed by its own band, summing to the whole-rupee price. If the founder defers stitched items, say so in the coverage map instead. |
| R4 | FR-53 | "The rating is linked to ... whether she used Try-on for it." Story 3.19 builds a function that answers "no" until "Epic 4 changes [it] to read its Try-on requests". No Epic 4 story does. The Owner's split "used Try-on / did not" would always be empty, and SM-2 could not be read against Try-on. | high | Add a criterion to 4.12: the "used Try-on" function of 3.19 now reads Try-on requests (any request for that Design made before the Order, kept true after erasure because the erased request keeps Design and time). |
| R5 | FR-28 | The data report must show what is held. 3.22 says "Epic 4 extends the AI-provider function and adds Try-on consents and requests to the report". 4.21 extends only the AI-provider function. | medium | Add to 4.20 or 4.21: the report of Story 3.22 lists her Try-on consents, withdrawals, stored photos and requests (state and time only). |
| R6 | FR-8 | "The notice is available in English and in the launch languages." 4.1 falls back to English when a translation is missing, so a Tamil Shopper can be shown, and accept, an English notice. Only 7.12 checks Tamil, once, at launch. | medium | Add to 4.1: a notice version cannot be published while a configured language has no text (or the status route reports Try-on unavailable in that language). |
| R7 | FR-12 | "Provenance information placed in the image by the AI provider is kept." Covered only by implication ("stores the provider's file unchanged" in 4.13). No test proves it, and the labelled copy of 4.14 is re-encoded with sharp, which may drop it. | medium | Add to 4.13: a test that the stored object is byte-identical to the provider's answer. Add to 4.14: the labelled copy keeps the source's provenance metadata where the format allows, and the limit is recorded in `docs/`. |

NFR-1 to NFR-16, briefly: NFR-14 fails (R2). NFR-11 is hollow for SMS and email until F1 is fixed. NFR-13's automated tests do not reach the Try-on consent screens or the app (F15). NFR-1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15 and 16 are each satisfied by acceptance criteria (2.20, 6.18, 7.11; 4.15, 4.18; 4.11; 1.10 to 1.12, 7.5; 3.14, 7.9; 3.21, 4.20 to 4.22; 7.8; 1.21, 7.6, 7.7; 7.1, 7.2, 4.16; 7.10; 1.1, 6.1; 6.3, 6.18, 7.14; 7.3, 7.4).

---

## Check 4: Contradictions with the architecture

R1 (AD-5) and R2 (AD-28) are also AD breaches and are counted under check 3. No story has a client calling content directly, a second scheduler, a database sequence for invoice numbers (the ticket-number sequence in 3.20 is outside AD-25), or a third-party analytics SDK.

| Id | Story | What is wrong | Severity | Fix |
| --- | --- | --- | --- | --- |
| A1 | 1.17, 3.10, 3.16, 3.17 | **AD-31: "An Order is `Refunded` only when the total refunded equals the total paid."** The four stories use a different rule: "only if every item in it has been refunded", and "a part refund never changes the Order's state". The rules diverge whenever a shipping charge was paid, when 3.16 deducts a return shipping charge (every item refunded, total refunded below total paid, Order still marked Refunded), and when part refunds add up to the full amount (never Refunded). 3.17 then needs an assumption to define "item refunded". | high | Use AD-31's rule in all four: the Order moves to Refunded when the sum of its refunds equals the amount paid. Delete the assumption in 3.17 and the item-based transition wording in 3.10. |
| A2 | 7.15 (with 7.11, 7.12) | **AD-25: invoices are immutable and gapless.** 7.11 builds production in test mode and 7.12 triggers "each Shopper event in FR-54 ... on production in test mode", which issues test Orders and invoices there. 7.15 then requires that production "holds no test Design, test Order, ... test invoice" and that "the invoice and credit-note counter rows ... stand at zero". No route can delete an invoice and no story says how production is emptied. | high | Either run every test-mode check on staging only (change 7.12's last criterion), or add an explicit step to 7.15: before live keys are set, the production `commerce` database and `documents` bucket are created afresh from migrations and seeds, and content's published documents are kept. |
| A3 | 2.18 | AD-5 names "the discount workflow" as the place that refuses an invalid discounted price. 2.18 creates discounts through "the kernel routes it needs" added to the allow-list, with no shop workflow, so the whole-rupee rule, the band check (R1) and the before/after audit have no enforcement point. | medium | Add a `save-discount` workflow behind `/admin/shop/discounts`; keep the kernel's promotion write routes off the allow-list. |
| A4 | 3.15, 3.16 | AD-6: only the seven named workflows change stock and write stock-movement rows. "Damaged writes a stock movement" names no workflow. | medium | `restock-return` takes the inspection result (sellable or damaged) and writes the row in both cases; say so in 3.15 and 3.16. |
| A5 | 7.8 vs 3.4, 3.18 | The breach-notice page sends one message per selected Shopper. 3.4 refuses any template whose purpose is not `transactional` or `owner-alert`, and 3.18 adds a test that "there is no route or page that sends a message to a list of Shoppers". 7.8 would fail both. | medium | 7.8 adds the purpose `breach-notice` to `packages/contracts`, limited to its one workflow, and amends the 3.18 test to allow exactly that page. |
| A6 | 7.3 | AD-29 says clients report counts; 7.3 has the server record Try-on requests and Orders. Flagged in the story as an assumption and sensible. | low | Confirm with the founder and note it against AD-29. |
| A7 | 7.10 | AD-8: only commerce workflows enqueue. "One admin route to re-enqueue" must start a workflow. | low | Say "the route starts a `requeue-job` workflow". |
| A8 | 4.9 | Sample photos sit in `shopper-media` under a samples prefix. AD-22 and AD-23 treat that bucket as Shopper media: the retention job (4.22), `erase-shopper-media` and the "found absent after restore" sweep (7.7) must not touch them, and a sample person has no way to withdraw. | low | Add to 4.9: sample objects are excluded from retention and Shopper erasure by prefix, and deleting a sample photo is how a sample person's withdrawal is honoured. |
| A9 | 4.18 and other read routes | AD-4: "a shop module's service is called only from a workflow step". 4.18's route reads the `tryon` module and the kernel directly. | low | Either read through a query workflow step, or record with the founder that AD-4 applies to writes. |
| A10 | 5.8 | AD-12: price and availability are never cached. The website's "last good response" holds Design cards with old prices; the app version (6.5) shows a notice that it may be out of date, the website does not. | low | Add the same notice to 5.8, or strip price and availability from the stored copy. |

---

## Check 5: Story size

Stories that plainly exceed one developer-agent session, with a suggested split. "Blocks" are Given/When/Then groups.

| Id | Story | What is wrong | Severity | Suggested split |
| --- | --- | --- | --- | --- |
| S1 | 1.15 | 10 blocks across an Admin page, the shipping port and first adapter, labels, the `fulfil-order` stock workflow, a webhook, four transition workflows and contract tests. | high | 1.15a Orders page, Packed, shipping port, label. 1.15b `fulfil-order` and Dispatched. 1.15c tracking webhook, mapping table and the four transitions. |
| S2 | 1.17 | 9 blocks: inspection, `refund-order`, credit note with its counter, rendering, `restock-return`, Returned to shop, part refunds. | high | 1.17a inspection and `restock-return`. 1.17b `refund-order`, credit note and its file. 1.17c part refund and the Returned-to-shop refund. |
| S3 | 4.13 | 11 blocks spanning the worker job, three commerce workflows and routes, cost conversion, every failure branch and an extension of `erase-shopper-media`. | high | 4.13a start, primary call, check, store, result and cost. 4.13b fallback, blocked, rejected, stale and double-run cases. 4.13c erasure of results and requests. |
| S4 | 4.23 | "Complete when a decision is recorded": needs real sarees, consenting adults, human raters and real provider keys. A developer agent cannot finish it. | high | 4.23a rating view, decision record, switch rule and narrow rule (buildable, tested with the fake). 4.23b "the Owner runs the launch gate", tracked on the launch checklist of 7.14, not as a developer story. |
| S5 | 1.9 | 11 blocks; cohesive but covers two workflows, a job, a bucket and a screen. | medium | 1.9a `begin-checkout`, snapshot, Hold, recovery file. 1.9b `release-hold`, expiry job, cart lock, checkout screen. |
| S6 | 1.10 | 9 blocks: payment provider, payment creation, hosted screen, webhook, `confirm-payment`, `order-state`, mismatch refunds, contract tests; carries two spike items. | medium | 1.10a provider, payment creation, hosted screen, contract tests. 1.10b webhook, `confirm-payment`, idempotency, mismatch refunds. |
| S7 | 1.18 | Two unrelated things: sign-in with second factor, lockout and recovery; and the `shop-audit` module with access events. | medium | 1.18a second factor, lockout, recovery. 1.18b `shop-audit` and the first access event. |
| S8 | 2.10 | Publish gate, a migration of published Designs, and a timed rehearsal on staging done by the Owner. | medium | Move the timed rehearsal to its own short story after 2.10. |
| S9 | 2.18 | 9 blocks: Admin page, validation, per-piece calculation, automatic discounts on cards, codes in the cart, stacking, snapshot rule. | medium | 2.18a automatic discounts and the calculation. 2.18b discount codes in the cart and stacking. |
| S10 | 3.7 | Three separate features: terms acceptance, change of mobile number, email at checkout. | medium | One story each. |
| S11 | 3.10 | 9 blocks: full transition table, event handling, and the new `refund-undeliverable-order` with credit note. | medium | 3.10a states and shipping events. 3.10b `refund-undeliverable-order`. |
| S12 | 3.14 | Access events, plus an unrelated last block of staging checks (TLS, bucket, backup encryption, volume encryption). | medium | Move the last block to 7.9, which repeats it. |
| S13 | 3.17 | Refunds (page, part refunds, overdue list, deadline job) and payment disputes. | medium | 3.17a refunds. 3.17b disputes. |
| S14 | 3.18 | 9 blocks: about 15 Shopper templates, invoice attachment, the auto-refund subscriber, Owner alerts, failed-message display. | medium | 3.18a Shopper messages. 3.18b Owner alerts and failed-message display. |
| S15 | 3.19 | Rating capture, a reminder job and message, and an Admin ratings page. | medium | 3.19a capture. 3.19b reminder and Admin page. |
| S16 | 3.21 | The `erasure` module, ledger, `erase-shopper-media`, the deadline job, in-account deletion and a public page. | medium | 3.21a erasure module, workflow and deadline job. 3.21b account deletion in the account and on the public page. |
| S17 | 3.22 | Complaints page with reply and close; data report; correction; Owner-run erasure. | medium | 3.22a complaints. 3.22b data report. 3.22c correction and erasure requests. |
| S18 | 3.24 | A document, a suite of browser tests, an Admin audit page and a scheduled job. | medium | 3.24a checklist and tests. 3.24b Admin audit page and due job. |
| S19 | 4.4 | 9 blocks: bucket, upload link, store workflow, clean-up job, web photo step with checks, reuse, replace, erasure extension. | medium | 4.4a bucket, upload link, `store-shopper-photo`, clean-up job. 4.4b the web photo step, reuse and replace. |
| S20 | 4.9 | Sample set, bench run with a new worker job, and the comparison view. | medium | 4.9a sample set. 4.9b bench run and job. 4.9c comparison view. |
| S21 | 4.22 | Single-item delete, the retention job, the notice mismatch warning and the depicted person's request. | medium | 4.22a single-item delete and depicted person. 4.22b retention job and mismatch warning. |
| S22 | 6.14 | Five areas: about and legal, mobile change, privacy requests, complaints, account deletion. | medium | 6.14a about, legal and account. 6.14b requests and complaints. 6.14c deletion. |
| S23 | 6.15 | 11 blocks: consent, picker, camera permission, checks, upload. | medium | 6.15a consent. 6.15b picker, camera and upload. |
| S24 | 6.16 | 11 blocks: request and polling, result and label, save, report, every refusal. | medium | 6.16a request, progress and refusals. 6.16b result, label, save and report. |
| S25 | 7.9 | 11 verification blocks across every unit. | medium | 7.9a sign-in, rate limits, identities and webhooks. 7.9b files, logs, network and encryption. |
| S26 | 7.11 | A load test and decision, and inside it "the production environment is built". | medium | 7.11a load test and decision. 7.11b build production. |
| S27 | 6.18, 7.7, 7.8, 7.12, 7.13, 7.14, 7.15 | Each needs the Owner, a real phone, a lawyer or a store console. Epic 7's rules say so; 6.18 does not. | low | In each, mark which criteria the agent can close and which wait for the Owner, so the story can be handed back in a defined state. |

---

## Check 6: Epic independence

**Pass.** Each epic works on the output of earlier epics only. Epic 2 needs Epic 1; Epic 3 needs 1 and 2; Epic 4 needs 3 (notice publish path, `consent`, `erasure`, `message.send`, Shopper support); Epic 5 needs 1.19, 1.24, 3.1 and Epic 2's catalogue read, and not Epic 4; Epic 6 needs 1 to 5; Epic 7 needs all. No epic needs a later epic to function. Where an earlier epic leaves part of an FR for a later one (the automatic-refund message of FR-19 from Epic 1 to Story 3.18; cart on other devices), the story says so and the earlier epic still works. The epics deliver user value; Epic 1's technical stories are justified by the PRD's "thin slice first".

| Id | Where | What is wrong | Severity | Fix |
| --- | --- | --- | --- | --- |
| E1 | Epic 6 and Story 7.4 | The app released by 6.19 reports no counts; 7.4 needs a second release before launch. | low | Accept, or move the three client reports into Epic 6 behind a route that 7.3 adds (an unknown route is ignored by old servers only if 7.3 comes first; simplest is to accept). |
| E2 | All epics | The same files are reopened in several epics: `/store/shop/designs` and the Design page (1, 2, 4, 5), `begin-checkout` (1, 3), the Orders Admin page (1, 3), `erase-shopper-media` (3, 4). This is the cost of the thin slice and is deliberate. | low | No change; keep the "extends, does not create again" notes, and apply D5 and D6 so the extensions are unambiguous. |

---

## Fix order

1. The three critical items: F1 (SMS and email adapters), R1 (tax band gap), R2 (translation bundles).
2. High: F2, F3, F4, R3, R4, A1, A2, then the four splits S1 to S4.
3. Medium forward dependencies and the duplicate error codes (D2), which are one-line edits.
4. The remaining splits, as each story is picked up.
