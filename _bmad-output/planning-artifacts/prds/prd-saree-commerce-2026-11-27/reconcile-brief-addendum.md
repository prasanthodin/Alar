# Reconciliation: brief addendum against the PRD

Input: `../../briefs/brief-saree-commerce-2026-11-27/addendum.md`.
Checked against: `prd.md` and `addendum.md` in this folder. The PRD was not edited.

Status values: **covered**, **by reference** (present only in the brief's addendum, which the PRD's addendum points to, and no functional requirement is needed), **partly covered**, **not covered**, **contradicted**.

## Summary

- 45 items checked.
- 30 covered, 8 by reference, 5 partly covered, 1 not covered, 1 contradicted.
- The gaps that matter most: "provider logging kept off" is a guardrail with no requirement; four questions for the accountant and lawyer are missing from §8, which is the list Open Question 8 relies on; "managed Postgres, managed hosting" is stated as a requirement in the brief's addendum and sits against the free-tier hosting plan without the PRD saying so; the saree viewer is "native" in the brief's addendum and "most likely ... in a web view" in the PRD's addendum.

## Admin controls for AI

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 1 | Model and provider routing in admin, with a fallback model | covered | FR-39 |
| 2 | OpenRouter as default behind an interface that allows a fine-tuned or self-hosted model and a dedicated try-on service | covered | FR-39; PRD addendum |
| 3 | Prompts as versioned drafts: test on sample sarees, publish, roll back | covered | FR-41, FR-43 |
| 4 | Guardrail: approved-model list with each model's data policy and terms | covered | FR-40 |
| 5 | Guardrail: locked safety wording | covered | FR-41 |
| 6 | Guardrail: zero-retention routing where offered | covered | FR-40 |
| 7 | Guardrail: provider logging kept off | not covered | No requirement in the PRD or its addendum. It needs one, because it is a setting on each request or account that must be enforced and cannot be left to reference. |
| 8 | Guardrails cannot be removed in the admin | partly covered | Stated for safety wording (FR-41) and the change history (FR-46). FR-40 says no-retention is used and training models cannot be approved, but does not say these rules cannot be switched off in the Admin. The §4.9 description says so in general terms. |
| 9 | Per-user quotas | covered | FR-14, FR-42 |
| 10 | Daily spend cap | covered | FR-42 |
| 11 | Cost and failure dashboard | covered | FR-45 |
| 12 | Kill switch | covered | FR-42 |
| 13 | Audit log of changes | covered | FR-46 |
| 14 | Review queue for reported try-on images | covered | FR-13, FR-44 |

## Try-on rules

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 15 | Adults only; the shopper confirms the photo is of herself | covered | FR-9 |
| 16 | Standalone, itemised consent screen naming the AI services; recorded; withdrawable as easily as given | covered | FR-8, FR-15 |
| 17 | On withdrawal or deletion, photos and results are erased at the shop and at the providers | partly covered | FR-15 and FR-27 erase at Alar and say erasure "is requested from each AI provider". Nothing records whether a provider confirmed, or what happens if it does not. |
| 18 | Account deletion in the app and on the web | covered | FR-27 |
| 19 | Every result labelled AI-generated and keeps its provenance metadata | covered | FR-12 |
| 20 | System photo picker only | covered | FR-10 |
| 21 | A moderation block is never retried on the same input; switch to the fallback model or ask for another photo | covered | FR-11 takes the stricter of the two options: ask for another photo. |

## Catalogue, stock and tax

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 22 | Stock per design; overselling the last piece is the failure to prevent | covered | FR-19; PRD addendum |
| 23 | Per product: tax code, fibre, weave, zari, stitched or not, blouse piece, dimensions, weaver and origin, evidence for claims | covered | FR-3, FR-34, FR-37, FR-38 |
| 24 | Variant model ready for later clothing | covered | FR-35 |
| 25 | Tax rate with effective dates; per-piece threshold on the discounted pre-tax price for stitched items; two invoice lines for saree plus stitched blouse; credit notes | covered | FR-37, FR-20, FR-24. FR-37 says "per-piece value after any discount" and omits "pre-tax". |
| 26 | From 1 January 2027, store the lowest price of the previous 30 days | covered | FR-5, FR-37 |

## Commerce and payments

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 27 | Razorpay: server-created order, signature and webhook confirmation, refunds to the original method, no card storage | covered | FR-18, FR-24; signature and webhook detail by reference |
| 28 | Shipping: pincode serviceability, label, tracking, failed delivery, return pickup, inspection before restock | covered | FR-17, FR-47, FR-21, FR-23, FR-25 |
| 29 | Disclosures; complaints acknowledged in 48 hours and resolved in a month; yearly dark-pattern self-audit | covered | FR-29, FR-28, NFR-13 |
| 30 | Cash on delivery designed for but off: order value cap, separate reconciliation, refund details | by reference | §6.2 says "Designed for, switched off". The three design points live only in the brief's addendum; acceptable until cash on delivery is built. |

## Server-driven screens

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 31 | Only home, category, product layout and campaign screens are server-driven | covered | §4.7, §5 |
| 32 | Checkout, payment, photo upload, try-on and the saree viewer are native | contradicted | Brief addendum: "Checkout, payment, photo upload, try-on and the saree viewer are native." PRD addendum: "on phones the viewer most likely runs in a web view." The PRD itself only says these "are not Server-driven screens". The brief's addendum is itself uneven here, since it also says the best viewer is web-based and favours web-view embedding. |
| 33 | Registry of compiled-in components; typed JSON; safe fallback for unknown components; versioned schema | covered | FR-32; PRD addendum |
| 34 | The server never switches on a feature app-store reviewers have not seen | covered | FR-33 |

## Technical decisions and their conditions

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 35 | Medusa + Payload, TypeScript on Postgres, try-on worker, own API in front; one-week spike with two questions | covered | PRD addendum |
| 36 | Medusa charges for staff roles and audit logs | covered | PRD addendum |
| 37 | Not microservices: three deployables | covered | PRD addendum |
| 38 | Payload preview and the best viewer are web-based, which favours a mobile framework with good web output or web-view embedding | by reference | PRD addendum notes both facts separately (FR-31, FR-6 lines) but not the conclusion for the framework choice. |
| 39 | Full saree view: tiled image pyramid from a CDN | covered | PRD addendum |

## Options set aside

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 40 | Marketplace; under-Rs 800 segment; Django with Wagtail or Saleor; Go or Rust; Bagisto | by reference | §5 carries the first two as non-goals. The stack alternatives live only in the brief's addendum. |

## Hosting

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 41 | Oracle free tier for testing and first deployment; reduced allowance; idle reclaim; no service guarantee; likely tight for five workloads | partly covered | PRD addendum carries reclaim and no guarantee (NFR-8 line) and says "building and testing", dropping "first deployment". The reduced allowance and the "likely to be tight" warning are by reference only. Open Question 7 keeps the decision open. |
| 42 | Floci for local development; code against the S3 interface; try-on images and tiles are the heavy storage users | covered | PRD addendum; the storage note is by reference |

## Solo-builder implications

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 43 | Managed Postgres, managed hosting, automated backups, error alerts and uptime checks "are requirements, not extras" | partly covered | Backups: NFR-8. Uptime and failure alerts: NFR-9. Managed Postgres and managed hosting are not carried, and NFR-8 ("rebuilt on a new server from backups") assumes a server the Owner runs. The free tier is not managed hosting, so the two statements pull against each other and neither document says so. Application error alerts in general are not in NFR-9, which names four cases. |
| 44 | Every external integration needs a sandbox and automated tests | covered | NFR-11 |

## Open decisions

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| — | Which deployable hosts the shop's own API; mobile framework; pay Medusa or build; hosting for real payments | covered | PRD addendum, Open technical decisions; Open Question 7; NFR-8 carries off-site backup and rehearsed restore |
| — | The free tier's storage and egress limits have not been checked | by reference | Not in the PRD addendum's open decisions. Minor. |

## For professionals before launch

| # | Item | Status | Where / what is missing |
|---|---|---|---|
| 45 | Accountant: GST on unstitched sarees above Rs 2,500; pre-stitched sarees and blouse sets; GST on shipping fees; credit-note deadline. Lawyer: AI-labelling rules; age checking; photos of other people; one-year log retention versus erasure; OpenRouter's terms as a processor contract; return-policy wording | partly covered | §8 carries six of the ten. Missing from §8, and so from Open Question 8: GST on shipping fees; the credit-note deadline; photos of other people (FR-9 handles the mechanics but the legal question is not flagged); one-year log retention versus erasure. The last is live inside the PRD: NFR-5 keeps access logs one year and NFR-6 completes erasure in 24 hours, with no note on which wins. |

## Suggested fixes

1. Provider logging: add "provider-side logging of requests is kept off" as an acceptance line in FR-40.
2. Professional questions: add the four missing ⚖ items to §8 (Tax: GST on shipping fees, credit-note deadline; Shopper photos: photos of other people; a new line on log retention versus erasure, citing NFR-5 and NFR-6).
3. Managed services: add to §7 (NFR-8 or NFR-10) whether the database and hosting are managed, or record in the PRD addendum's open decisions that the free tier conflicts with the brief addendum's "managed" requirement, tied to Open Question 7.
4. Saree viewer: in the PRD addendum's FR-6 line, state that this departs from "native" in the brief's addendum and why; add native versus web view to the open technical decisions.
5. Provider erasure: add to FR-15 that each provider erasure request and its outcome is recorded and that failures alert the Owner.
6. Guardrails: add to FR-40 that its two rules cannot be switched off in the Admin.
7. Hosting wording: in the PRD addendum change "building and testing" to "testing and first deployment, pending Open Question 7", and add the unchecked storage and egress limits to the open decisions.
8. Error alerts: add application errors to NFR-9.
