---
title: 'technical research: Backend stack, CMS, commerce core, try-on models and SDUI'
type: 'technical'
topic: 'Backend stack, CMS, commerce core, try-on models and SDUI'
decision: 'Choose the backend stack, open-source CMS and commerce core (not Java) for an own-inventory saree app with server-driven UI; and ground the try-on model, SDUI and inventory-model choices in current practice'
source: 'native run'
status: complete
preset: 'standard'
validation: 'normal'
created: '2026-11-27'
updated: '2026-11-27'
---

# Technical research: backend stack, CMS, commerce core, try-on models and server-driven UI

**Decision this research serves:** choose the backend stack, open-source CMS and commerce core (not Java) for an own-inventory saree app with server-driven UI; and ground the try-on model, server-driven UI and inventory-model choices in current practice.

**Evidence basis.** Seven digests, two rounds. Unlike the market run, most deciding facts here were read at source: package registries, repository files and docs kept in repositories, Apple's and Google's policy pages, and OpenAI, FASHN and Hugging Face pages. Still unread at source: Google's own image-model pricing and terms, Kling, Razorpay's Indian fee, and all company engineering blogs (search extracts only). No performance benchmark and no India hiring data were found for any candidate, so those two criteria do not separate the finalists.

## Executive summary

**Pick: Medusa (commerce) + Payload (CMS), both TypeScript on Postgres, run as two applications plus a separate try-on worker. Not microservices.**

1. **Go and Rust fail the CMS requirement, not a speed test.** The only credible Go commerce project found is a toolkit with no admin or CMS [22]; no Rust candidate was found at all. Language speed could not be compared: no finalist publishes a benchmark [20].
2. **Medusa + Payload scores highest on the agreed weights (73 of 100), narrowly.** Medusa has per-variant images, per-location stock with reservations, returns, exchanges, claims and promotions built in [1][2][3]. Payload's block fields, drafts, scheduled publish and role-based access are in its MIT core [9][11][12]. The margin over the runners-up (66–68) is small and rests on judgement scores; the matrix below can be re-weighted.
3. **Every option needs India integration work.** The most-used Medusa Razorpay plugin is pinned eleven minor versions behind current Medusa, and all Shiprocket packages are at 0.0.x [6][7]. Saleor has no Razorpay app and needs a separately hosted payment service [14]. Plan to write and own the Razorpay and shipping integrations.

**Biggest caveats.** Medusa's admin role permissions, single sign-on and audit logs are paid features tied to its cloud plans [5]; the founder asked for admin-managed users and governance, so this is a real cost or a build item. Medusa places no hold on stock while an item sits in a cart [2], which matters for one-of-a-kind sarees. And the try-on finding stands apart from the stack: no provider documents saree support, and the one benchmark shows untuned try-on models fail on sarees [34].

## 1. Stack selection

### Candidate screen

| Candidate | Outcome | Reason |
|---|---|---|
| Medusa, Vendure, Saleor, Payload, Wagtail, Bagisto | Pass | Open source, released in November 2026 [8][17][18][21] |
| Directus (CMS) | Cut | Licence is source-available with a competing-use restriction, not open source [23] |
| Statamic (CMS) | Cut | Declared proprietary [23] |
| Flamingo Commerce (Go) | Cut | Toolkit of modules; no admin, CMS or stock back office [22] |
| Rust | No candidate | None found |
| django-oscar, django CMS, Lunar, Strapi | Not finalists | Low activity (django-oscar: 20 commits in 3 months), or weaker fit than the chosen alternative [23] |

### Evidence that separates the finalists

- **Medusa:** variant images since 2.11.2 [1]. Stock is reserved when the order is placed, serialised per inventory item by a lock; add-to-cart only checks availability. The default lock works on a single instance only; Redis or Postgres lock providers are official [2]. Returns, exchanges and claims are built in and merchant-initiated [3]. Tax engine is generic, with nothing GST-specific [4]. MIT, except role-based access, single sign-on and audit logs [5]. 779 commits in three months [23]. An official guide covers syncing with Payload [23].
- **Payload:** blocks stored as typed objects with a `blockType`; nesting follows from the schema, though no live nested REST response was fetched [9]. Live preview is a web iframe, so previewing a native app screen needs a web build of the renderer [10]. Drafts, versions and scheduled publish (needs its job queue running) [11]. Access control is defined in code, not edited in the admin [12]. Its own commerce plugin is beta: one stock counter, no shipping, taxes or discounts [13].
- **Saleor:** the only finalist with an optional timed stock hold during checkout [15]. Product media assignable to variants [15]. No Razorpay, UPI or Indian shipping app; payment apps are separate deployed services [14]. Its official CMS sync app supports Payload, Strapi and others, not Wagtail [16].
- **Wagtail:** block content serialises to nested JSON, but the v3 API is a preview that may break in any release, and v2 is slated for deprecation [17].
- **Vendure:** variant assets, stock ledger; GPLv3 with a commercial alternative [18]. One stale Razorpay plugin, no Shiprocket [23].
- **Bagisto:** Razorpay, PayU, PhonePe, returns and inventory sources in the core repository, MIT, 597 commits in three months; its CMS is a page table with no blocks, so it needs a CMS in another language [21].

### Decision matrix

Scores are 1–5 and are the lead's judgement from the evidence above; weights are the owner's. Performance and hiring are scored 3 for all because no evidence was found.

| Criterion (weight) | Medusa + Payload | Bagisto + Payload | Saleor + Payload | Vendure + Payload | Saleor + Wagtail | Payload alone |
|---|---|---|---|---|---|---|
| Server-driven UI content fit (25) | 4 | 3 | 4 | 4 | 3 | 5 |
| Commerce out of the box (25) | 4 | 4 | 4 | 4 | 4 | 1 |
| Speed to launch (20) | 3 | 3 | 2 | 2 | 2 | 2 |
| Ecosystem health (15) | 4 | 4 | 3 | 3 | 3 | 3 |
| Raw performance (10) | 3 | 3 | 3 | 3 | 3 | 3 |
| Hiring in India (5) | 3 | 3 | 3 | 3 | 3 | 3 |
| **Weighted total (of 100)** | **73** | **68** | **66** | **66** | **61** | **56** |

"Saleor + Payload" was not a round-1 finalist; it is scored because Saleor's official CMS app supports Payload [16]. "Bagisto + Payload" pairs PHP with a TypeScript CMS and has no documented integration.

### Verdict

- **Pick:** Medusa + Payload.
- **Runner-up and when it wins:** Saleor + Payload, if a timed stock hold for unique sarees and strong typed product attributes [15] matter more than launch speed, or if the team is stronger in Python. Bagisto wins if ready-made Indian payment methods outweigh the CMS mismatch.
- **Strongest argument against the pick:** two systems to keep in sync; paid role permissions and audit logs [5]; no cart-stage stock hold [2]; Razorpay and shipping integrations to write [6][7]; Payload 4.0 is in beta, so a major upgrade is coming [8].
- **Cheapest hedge:** put one API of your own in front of both systems, so the apps never call Medusa or Payload directly. Swapping either later then changes the server, not the apps.

### Microservices and gRPC

Evidence is thin and leans against it for a small team: one small team reported faster delivery after merging microservices into one application, and one self-reported benchmark found gRPC 1.3–1.6 times faster per call than REST [24] (low confidence). Every finalist ships as a single application [23]. The architecture the evidence supports is a small number of services split where the workload differs: commerce, CMS, and an asynchronous try-on worker.

## 2. Try-on models

| Option | Type | Price per image | Speed | Licence and photo terms | Saree evidence |
|---|---|---|---|---|---|
| OpenAI `gpt-image-2.6` (4 Nov 2026) | General editor, API | About $0.034 medium, $0.041 high at 1024×1536, output only | "Up to 2 minutes" for complex prompts | Likeness needs express consent; no training on API data; logs up to 30 days; under-13 data needs zero retention [29] | None stated |
| Google `gemini-nano-banana-2.1` | General editor, API | $0.044 at 1K, $0.063 at 2K via a reseller; Google's own price unread [32] | Not stated | Unread | Used by saree hobby projects (round 1, low) |
| Qwen-Image-Edit-2511 | Open weights | $0.03 per megapixel via a reseller, or own GPU [31] | Minutes on a small GPU (round 1, low) | Apache-2.0; consent and retention are the app's own job [31] | Can be fine-tuned |
| FASHN v1.6 | Try-on API | $0.075 | 5–17 s | Commercial licence; no training by default; inputs deleted after the request; outputs after 3 days [30] | Categories are tops, bottoms, one-pieces; sarees not mentioned |
| FASHN Try-On Max (preview) | Try-on API | $0.075–0.30 by resolution and mode | 10–55 s | Same [30] | Not mentioned |
| Kling try-on | Try-on API | Unverified | Unverified | Unverified | Unverified |

- **No provider page read lists sarees or draped garments as supported or unsupported.**
- **Benchmark on South Asian clothing** (1,013 image pairs, 332 sarees): three older try-on models, untuned, turned sarees into western-style garments or misaligned the cloth; fine-tuning improved all three, one model's error score falling from about 100 to 50. Scores are pooled across garments [34].
- **Skip:** the older open try-on models reported as non-commercial, and Google's Vertex try-on model, reported to retire in January 2027 (round 1, unverified).

## 3. Server-driven UI

- **Dominant pattern:** a registry of components compiled into the app, selected and arranged by a typed schema from the server; published by Airbnb, Shopify, Duolingo, Nubank and PhonePe [26] (medium, search extracts).
- **Documented pitfalls:** old app versions meeting unknown components; over-configurable schemas ("horrendous, overly configurable messes"); debugging moving into JSON [26][27]. Duolingo's answer is to send old clients a reduced response they can already render [26].
- **Not for the whole app:** the Flutter team's own library says moving a whole app to it "won't work" and that new features should ship through normal app updates [25].
- **Libraries:** Flutter has `rfw` 2.0.0 (Flutter team, October 2026) and Stac 1.6.0 (MIT, single young vendor with a cloud product) [25]. DivKit (Yandex, Apache-2.0) has active native Android, iOS and web clients but a two-year-stale Flutter package [25]. Nothing credible exists for React Native. With Payload, a hand-written renderer that maps each `blockType` to a native component needs no library [9].
- **Store rules (read at source).** Apple 2.5.2 bars downloading "code which introduces or changes features or functionality"; its licence clause 3.3.1(C) bars unlocking features outside the App Store [28]. Google bars downloading executable code from outside Play [28]. Neither names server-driven UI. Reading: JSON that arranges components already in the reviewed build is data and fits; using it to switch on a feature reviewers never saw does not. Confidence medium for Apple, medium-high for Google.

## 4. Inventory model

- Medusa, Saleor and Vendure all hold stock per variant and per location with reserved or allocated quantities; Vendure also keeps a stock-movement ledger [2][15][18].
- Only Saleor offers a timed hold during checkout [15]. Shopify moved reservations into its ledger database so that reserve and claim commit together [33] (medium, search extract).
- **What a saree needs beyond a shirt** (inference, not sourced): often a single unique piece (quantity 1, where two buyers at once is the normal failure case), no size, a blouse-piece flag, and fabric, weave and zari attributes. Later categories need the usual colour and size variants.
- Returned and undelivered COD parcels need inspection before restocking; unprocessed returns distort stock counts (vendor blogs, low).

## 5. Full-saree viewer

- Standard approach: cut the image into a tile pyramid with libvips, serve from a CDN, view with OpenSeadragon 6.1.1 (BSD-3) on web [35].
- **Native tile viewers are weak:** Flutter has one single-author package; React Native has none maintained, so OpenSeadragon inside a web view is the practical mobile route [35].

## Cross-dimension insights

1. **The CMS requirement, not performance, decides the language.** It removes Go and Rust and leaves TypeScript, Python and PHP.
2. **Unique-piece stock collides with the pick.** Medusa reserves at order placement [2]; for one-of-a-kind sarees a cart or checkout hold is needed and would be custom work. This is the best reason to prefer Saleor.
3. **The founder's governance requirement collides with Medusa's licence split** [5]. Payload's free access control covers content staff; commerce staff roles in Medusa are paid.
4. **Server-driven UI preview is web-only in Payload** [10], and the viewer's best renderer is also web [35]. A mobile framework with a solid web build (to host previews) or good web-view embedding is favoured; the mobile framework itself was not selected in this run.
5. **Try-on is a provider-replaceable worker,** whichever stack wins: prices range tenfold and model line-ups changed within the last month [29][30].

## Contrary evidence

No red-team pass was run. Counter-evidence found: Medusa's docs and code disagree on a default (`manage_inventory`), a sign that docs lag code [2]; a practitioner reports long debugging sessions and stale Medusa v1 material in search results (round 1, low).

## Recommendations

1. **Architecture:** Medusa + Payload on Postgres, with your own API in front and a Redis or Postgres lock provider from day one [2]. Three deployables: commerce, CMS, try-on worker. Basis: read at source; matrix margin is narrow.
2. **Before committing, run a one-week spike** on the three risks: a Razorpay provider for current Medusa [6], a checkout stock hold for quantity-1 items [2], and a Payload block rendered in the mobile app with preview [9][10]. If the stock hold proves awkward, re-score Saleor + Payload.
3. **Decide the Medusa licence question early:** pay for role permissions and audit logs, or build an audit trail and staff roles yourself [5].
4. **Server-driven UI:** component registry; only home, category, product layout and campaign screens; checkout, payment, upload and try-on native; unknown-component fallback and schema version in the first release [25][26][28].
5. **Try-on hands-on test:** OpenAI, Gemini, Qwen-Image-Edit (untuned and fine-tuned) and FASHN on real sarees, scored on border, pallu and colour fidelity; write consent, retention and minors rules from the providers' terms [29][30][31][34].
6. **PRD inputs:** unique-piece stock and holds; inspection before restock for returns and undelivered COD; GST handled in your own code [4]; Razorpay server-created orders with signature and webhook verification [19].
7. **Refresh this report before acting if more than two quarters pass.**

## Open questions

| Question | What would answer it |
|---|---|
| Does any model drape a saree faithfully from a shop photo? | The hands-on test. |
| Google's own image-model price and photo terms; Kling's | Reading the pages in a browser. |
| Razorpay's Indian standard fee | The founder's Razorpay dashboard. |
| Does Medusa prevent overselling end to end under load? | A concurrency test in the spike. |
| Exact JSON shape of nested Payload blocks over REST | The spike. |
| Mobile framework (Flutter or React Native) | A short selection run once the renderer and viewer needs are fixed. |
| Throughput of Medusa or Saleor | Own load test; none published. |
| Availability of developers in India for each stack | Job-board data; not reachable here. |

## Source appendix

| n | Supports | Publisher | Pub date | Accessed | Confidence |
|---|---|---|---|---|---|
| [1] | Medusa variant images | [MedusaJS repository](https://github.com/medusajs/medusa), `packages/modules/product/src/models/product-variant.ts` | 2026-11 | 2026-11-27 | High |
| [2] | Medusa reservation at order placement, locking, `manage_inventory` | [MedusaJS repository](https://github.com/medusajs/medusa), `packages/core/core-flows/src/cart/steps/reserve-inventory.ts` and locking docs | 2026-11 | 2026-11-27 | High for behaviour; medium for oversell protection |
| [3] | Medusa returns, exchanges, claims, promotions | [MedusaJS repository](https://github.com/medusajs/medusa), docs under `www/apps/resources/app/commerce-modules/order/` and `/promotion/` | 2026-11 | 2026-11-27 | High |
| [4] | Medusa tax engine | [MedusaJS repository](https://github.com/medusajs/medusa), docs under `www/apps/resources/app/commerce-modules/tax/` | 2026-11 | 2026-11-27 | High |
| [5] | Medusa paid features | [MedusaJS repository](https://github.com/medusajs/medusa), `ENTERPRISE-LICENSE.md` | 2026-11 | 2026-11-27 | High |
| [6] | Razorpay plugin pinned to Medusa 2.12.3 | [npm registry](https://registry.npmjs.org/medusa-plugin-razorpay-v2) | 2025-12-31 | 2026-11-27 | High |
| [7] | Medusa Shiprocket packages | [npm registry](https://registry.npmjs.org/-/v1/search?text=medusa+shiprocket) | 2026-11 | 2026-11-27 | High |
| [8] | Medusa 2.23.1; Payload 4.0 beta | [npm registry](https://registry.npmjs.org/@medusajs/medusa) | 2026-11-26 | 2026-11-27 | High |
| [9] | Payload blocks | [Payload repository](https://github.com/payloadcms/payload), `docs/fields/blocks.mdx` | 2026-11 | 2026-11-27 | High; nested REST shape unverified |
| [10] | Payload live preview is a web iframe | [Payload repository](https://github.com/payloadcms/payload), `docs/live-preview/overview.mdx` | 2026-11 | 2026-11-27 | High |
| [11] | Payload drafts and scheduled publish | [Payload repository](https://github.com/payloadcms/payload), `docs/versions/drafts.mdx` | 2026-11 | 2026-11-27 | High |
| [12] | Payload access control | [Payload repository](https://github.com/payloadcms/payload), `docs/access-control/overview.mdx` | 2026-11 | 2026-11-27 | High |
| [13] | Payload commerce plugin is beta | [Payload repository](https://github.com/payloadcms/payload), `docs/ecommerce/overview.mdx` | 2026-11 | 2026-11-27 | High |
| [14] | Saleor apps; no Razorpay; payment apps are services | [Saleor apps repository](https://github.com/saleor/apps) | 2026 | 2026-11-27 | High |
| [15] | Saleor stock reservation, variant media | [Saleor docs repository](https://github.com/saleor/saleor-docs), `docs/developer/stock/stock-reservation.mdx` | 2026-10 | 2026-11-27 | High |
| [16] | Saleor CMS app supports Payload | [Saleor docs repository](https://github.com/saleor/saleor-docs), `docs/developer/app-store/apps/cms.mdx` | 2026-02 | 2026-11-27 | High |
| [17] | Wagtail API v3 preview | [Wagtail repository](https://github.com/wagtail/wagtail), `docs/advanced_topics/api/index.md` | 2026 | 2026-11-27 | High |
| [18] | Vendure licence and stock model | [npm registry](https://registry.npmjs.org/@vendure/core) | 2026-11-12 | 2026-11-27 | High |
| [19] | Razorpay order, signature and webhook flow | [Razorpay docs](https://razorpay.com/docs/webhooks/validate-test/) | undated | 2026-11-27 | High |
| [20] | No published benchmarks | [Vendure repository](https://github.com/vendure-ecommerce/vendure), `packages/dev-server/load-testing/` | 2026-11 | 2026-11-27 | High (absence) |
| [21] | Bagisto packages and release | [Bagisto repository](https://github.com/bagisto/bagisto) | 2026-11-25 | 2026-11-27 | High |
| [22] | Flamingo Commerce is a toolkit | [Flamingo Commerce repository](https://github.com/i-love-flamingo/flamingo-commerce) | 2026-10-14 | 2026-11-27 | High |
| [23] | Screen, licences, commit counts, integrations (round-1 digest) | [Directus licence file](https://raw.githubusercontent.com/directus/directus/main/license) | 2026-11 | 2026-11-27 | High for registry data; medium for extracts |
| [24] | Microservices and gRPC anecdotes | [Indie Hackers](https://www.indiehackers.com/post/why-we-replaced-our-microservices-with-a-monolith-and-it-worked-NEec3alGYvYoRLHjgrGv) | undated | 2026-11-27 | Low |
| [25] | rfw, Stac, DivKit | [Flutter packages repository](https://raw.githubusercontent.com/flutter/packages/main/packages/rfw/README.md) | 2026-10 | 2026-11-27 | High |
| [26] | Server-driven UI patterns in practice | [Duolingo engineering blog](https://blog.duolingo.com/server-driven-ui/) | undated | 2026-11-27 | Medium (extract) |
| [27] | Server-driven UI cautions | [Thoughtworks Technology Radar](https://www.thoughtworks.com/radar/techniques/server-driven-ui) | undated | 2026-11-27 | Medium (extract) |
| [28] | Apple and Google policy wording | [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) | 2026-10-16 | 2026-11-27 | High for wording; medium for interpretation |
| [29] | OpenAI image model, price, terms | [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) | 2026-11 | 2026-11-27 | High |
| [30] | FASHN models, price, terms | [FASHN docs](https://docs.fashn.ai/api-reference/tryon-v1-6) | 2026-11 | 2026-11-27 | High |
| [31] | Qwen-Image-Edit-2511 licence | [Hugging Face model card](https://huggingface.co/Qwen/Qwen-Image-Edit-2511) | 2025-12 | 2026-11-27 | High |
| [32] | Gemini image model ID and reseller price | [fal model page](https://fal.ai/models/google/nano-banana-2.1/edit) | 2026-11 | 2026-11-27 | Medium (reseller) |
| [33] | Shopify inventory reservations | [Shopify Engineering](https://shopify.engineering/scaling-inventory-reservations) | undated | 2026-11-27 | Medium (extract) |
| [34] | Try-on benchmark on South Asian clothing | [arXiv 2603.07291](https://arxiv.org/html/2603.07291) | 2026-03 | 2026-11-27 | High |
| [35] | Deep-zoom tooling and mobile viewers | [OpenSeadragon on npm](https://registry.npmjs.org/openseadragon) | 2026-09-09 | 2026-11-27 | High for versions |

## Staleness map

Windows from the technical pack: versions 1 month, AI models and pricing 3 months, ecosystem 6 months, patterns 24 months.

| Claim | Published | Re-check by | Stale now? |
|---|---|---|---|
| [8] Medusa and Payload versions | 2026-11-26 | 2026-12-26 | No |
| [6][7] Razorpay and Shiprocket package state | 2026-11 | 2026-12-27 | No |
| [29][30][32] Try-on model names and prices | 2026-11 | 2027-02-27 | No |
| [28] Store policy wording | 2026-10 | 2027-04-16 | No |
| [5] Medusa licence split | 2026-11 | 2027-05-27 | No |
| [34] Try-on benchmark | 2026-03 | 2028-03 | No |

Earliest re-check: 26 December 2026 (versions). The whole selection should be refreshed before acting if more than two quarters pass.

Claims ledger: 2 unverified, 15 verified (17 tracked).
