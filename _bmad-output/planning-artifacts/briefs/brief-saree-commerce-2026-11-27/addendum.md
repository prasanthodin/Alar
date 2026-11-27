---
title: 'Addendum to the Alar product brief'
status: draft
created: '2026-11-27'
updated: '2026-11-27'
---

# Addendum: detail for the PRD and architecture

Depth that does not belong in the brief but must not be lost. Sources are the founder's statements and the three research reports under `_bmad-output/planning-artifacts/research/`.

## Admin controls for AI (founder requirement)

- Model and provider routing chosen in admin, with a fallback model; OpenRouter as the default provider behind an interface that also allows a fine-tuned or self-hosted model and a dedicated try-on service.
- Prompts as versioned drafts: test on sample sarees, publish, roll back.
- Guardrails the admin cannot remove: an approved-model list with each model's data policy and terms recorded; locked safety wording; zero-retention routing where offered; provider logging kept off.
- Per-user quotas, a daily spend cap, a cost and failure dashboard, a kill switch, an audit log of changes.
- A queue of try-on images that shoppers report.
- A moderation block is never retried on the same input; fall back or ask for another photo.

## Try-on rules

- Adults only at first. The shopper confirms the photo is of herself.
- A standalone, itemised consent screen names the AI services that receive the photo; consent is recorded and can be withdrawn as easily as it was given.
- On withdrawal or account deletion, photos and generated images are erased at the shop and at the providers. Account deletion is available in the app and on the web.
- Every result is labelled AI-generated and keeps its provenance metadata.
- System photo picker only; no broad gallery access.

## Catalogue, stock and tax

- About 100 designs with about 10 pieces each at launch. Stock is per design, so overselling the last piece is the failure case to prevent; a timed checkout hold is useful but less urgent than it would be for one-of-a-kind pieces. Medusa reserves stock when the order is placed.
- Per product: tax code, fibre, weave, zari, stitched or unstitched, blouse piece, dimensions in metres, weaver and origin, evidence behind any "silk" or "handloom" claim.
- Variant model (colour, size, stock per variant, images per variant) must be ready for later clothing categories.
- Tax rate per product with effective dates; per-piece threshold computed on the discounted pre-tax price for stitched items; two invoice lines for a saree sold with a stitched blouse; credit notes on returns.
- Whole-rupee shelf prices include tax; the invoice shows exact tax.
- From 1 January 2027: 30-day lowest prior price stored behind any discount claim; yearly dark-pattern self-audit.

## Commerce and payments

- Razorpay: order created on the server, payment confirmed by signature and webhook, refunds to the original method, no card storage.
- Shipping: pincode serviceability, label, tracking updates, failed delivery, return pickup, inspection before restock.
- Disclosures: legal name, address, grievance officer; complaints acknowledged in 48 hours and resolved in a month.
- Cash on delivery designed for but switched off: order value cap, separate reconciliation, refund details.

## Server-driven screens

- Only home, category, product layout and campaign screens are server-driven. Checkout, payment, photo upload, try-on and the saree viewer are native.
- A registry of components compiled into the app; the server sends typed JSON that arranges them. Unknown components fall back safely; the schema carries a version.
- The server never switches on a feature that app reviewers have not seen.

## Technical decisions and their conditions

- Medusa (commerce) + Payload (CMS), TypeScript on Postgres, a separate try-on worker, and one API of the shop's own in front. Accepted by the founder subject to a one-week spike: a Razorpay provider for current Medusa, a checkout stock hold for quantity-one items, and a Payload block rendered in the app with preview.
- The stock hold is no longer a deciding risk at about 10 pieces per design; the Razorpay provider and the Payload-to-app rendering remain the spike's main questions.
- Medusa charges for staff role permissions and audit logs. With one operator this matters less at launch; decide before a team joins.
- Not microservices: three deployables split by workload.
- Mobile framework not yet chosen. Payload's preview and the best saree viewer are both web-based, which favours a framework with good web output or web-view embedding.
- Full saree view: tiled image pyramid served from a CDN.

## Options considered and set aside

- Marketplace of many sellers: rejected by the founder in favour of own inventory.
- Django with Wagtail or django CMS: Wagtail's new API is a preview; Saleor has no Razorpay app.
- Go or Rust backend: no open-source CMS and commerce core found.
- Bagisto: strong Indian payment support, but its CMS has no content blocks.
- Value segment under Rs 800: where growth is, but served by Meesho at an average order near Rs 274 with high cash-on-delivery failure.

## Hosting (founder preference)

- Oracle Cloud free tier for testing and first deployment. A quick check of public sources (search extracts, not Oracle's page read in full): the free ARM allowance was reduced in 2026 to the equivalent of 2 CPUs and 12 GB of memory running continuously; Oracle may reclaim free instances it judges idle (95th-percentile CPU under 20% over 7 days); there is no service guarantee. Commerce, CMS, database, cache and try-on worker on that allowance is likely tight and needs testing.
- Suitable for development and testing. For taking real payments, either accept the reclaim and outage risk knowingly, with off-site database backups and a rehearsed restore, or move to a paid instance at launch.
- Floci is a free, MIT-licensed local AWS emulator (a replacement for LocalStack). It is a development and test tool, not a production service. Code against the S3 interface so that images work locally on Floci and in production on Oracle's S3-compatible object storage.
- Try-on images and the tiled saree views are the heavy storage and bandwidth users; the free tier's storage and egress limits were not checked.

## Solo-builder implications

- Two server applications plus a worker is real operational load for one person: managed Postgres, managed hosting, automated backups, error alerts and uptime checks are requirements, not extras.
- Every external integration needs a sandbox and automated tests, because there is no second person to catch a regression.
- Sequence so that a thin end-to-end purchase works before any breadth is added.

## For professionals before launch

- Accountant: GST on unstitched sarees above Rs 2,500; pre-stitched sarees and blouse sets; GST on shipping fees; credit-note deadline.
- Lawyer: whether AI-image labelling rules bind the shop; age checking; photos of other people; one-year log retention versus erasure; whether OpenRouter's standard terms are a valid processor contract; return-policy wording.
