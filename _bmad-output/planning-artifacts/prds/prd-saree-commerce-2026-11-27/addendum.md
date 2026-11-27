---
title: 'Addendum to the Alar PRD'
status: draft
created: '2026-11-27'
updated: '2026-11-27'
---

# Addendum: technical and design detail behind the PRD

The PRD states capabilities. This addendum records the choices and constraints that belong to architecture and UX. The brief's addendum (`../../briefs/brief-saree-commerce-2026-11-27/addendum.md`) remains the fuller record; this file lists what the PRD depends on and what is new since.

## Technology choices already made by the founder

- Commerce system and content system: Medusa and Payload, TypeScript on Postgres, with a separate Try-on worker and the shop's own API in front of them; subject to a one-week spike (a Razorpay provider for the current Medusa version; a Payload block rendered in the app with preview).
- Payment service: Razorpay. Shipping service: the founder holds credentials; name to confirm.
- First AI provider: OpenRouter, behind an interface that also admits a self-hosted or fine-tuned model and a dedicated try-on service.
- Hosting: the founder prefers Oracle Cloud's free tier for testing and first deployment; Floci as the local AWS emulator; storage through the S3 interface. The brief's addendum called managed database, managed hosting, backups and alerts requirements for a single operator; that pulls against a self-run free server and against NFR-8. The conflict is unresolved (PRD Open Question 7).
- Buy, do not build: use a bought-in or open-source component wherever one exists.
- Not microservices: three deployables (commerce, content, Try-on worker).

## How PRD requirements map to known technical facts

- FR-19 (no overselling): the PRD requires a 15-minute Hold from the moment payment begins. Medusa reserves stock only when the order is placed, under a per-item lock, so the Hold is custom work; the default lock works on one instance only, so a database or cache lock provider is needed.
- FR-36 (stock history): Medusa's reservation and stock levels are not a full ledger; a stock-movement record must be added or derived.
- FR-37 (whole-rupee prices): tax is computed backwards from the tax-inclusive price; rounding differences sit in the tax line, never in the Shopper's price.
- FR-31 (preview): Payload's live preview is a web frame, so previewing a phone screen needs a web build of the screen renderer.
- FR-32, FR-33 (old apps, no unreviewed features): a registry of built-in components, a versioned schema, and data-only screen descriptions.
- FR-6, FR-7 (Full saree view): tiled image pyramid served from a CDN. The brief's addendum listed the viewer among native screens; the technical research found native tile viewers weak, so on phones it most likely runs in a web view inside a native screen. This departs from the brief's addendum and is listed below as an open decision.
- FR-46, FR-50 (change history, staff roles): Medusa charges for audit logs and staff role permissions; the AI change history in FR-46 is Alar's own and does not depend on that.
- FR-40 (no-retention option): which image models on the aggregator qualify for zero-retention routing is not yet known.
- NFR-8 (recovery): the free hosting tier can reclaim idle servers and carries no service guarantee.

## Open technical decisions

- Mobile framework for the Android app.
- Which deployable hosts the shop's own API.
- Hosting for real payments (PRD Open Question 7).
- Whether to pay for the commerce system's staff roles and audit logs or build them.
- Whether the Full saree view on phones is a native viewer or a web view.
- The free hosting tier's storage and data-transfer limits, not yet checked.

## Design and media assets

- The founder asked for the look to be modern, distinctive and attractive, and has connected Higgsfield for images and video and Mobbin for interface references.
- The Higgsfield connection available in this session can list models, browse past generations and check credits, but cannot start a generation. Image and video prompts are therefore written here for the founder to run in Higgsfield.
- The Mobbin connection failed to connect in this session (blocked by the session's network settings).
- Visual direction, screens and asset prompts belong to the UX step that follows this PRD.
