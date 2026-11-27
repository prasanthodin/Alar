# Reconciliation: product brief against the PRD

Input: `../../briefs/brief-saree-commerce-2026-11-27/brief.md`.
Checked against: `prd.md` and `addendum.md` in this folder. The PRD was not edited.

Status values: **covered**, **partly covered**, **not covered**, **contradicted**.

## Summary

- 47 items checked.
- 36 covered, 8 partly covered, 3 not covered, 0 contradicted.
- The gaps that matter most: the brief's promise of "true colour" has no requirement behind it; two success metrics have no feature that collects them; the price band, the timeline and the buyer persona are missing; "whether buyers want the full saree view" is an unknown the PRD neither asks nor measures.

## Executive summary

| # | Brief commitment | Status | Where / what is missing |
|---|---|---|---|
| 1 | Mobile-first shop | partly covered | NFR-1, FR-3 and FR-31 are phone-sized, and UJ-1 runs on a phone. But the order of work in §6.3 is website first and the Android app near the end, and iOS is deferred. See the idea-notes reconciliation, item 3. |
| 2 | Sells to women in South India | covered | §1, §6.1, FR-17 |
| 3 | About Rs 1,500 to 5,000 each | not covered | No price band anywhere in the PRD. |
| 4 | Woven by the founder's family and weaver families the founder knows; removes the dealer | covered | §1, §6.1 |
| 5 | Holds its own stock; sells nothing it has not sourced | covered | §2.2, §5 |
| 6 | Three answers: nameable origin, full saree view, try-on | covered | §4.1 to §4.3 |
| 7 | Try-on ships only if it passes a pre-launch fidelity test | covered | §6.3 |
| 8 | Built and run by one person using AI coding agents | covered | §0, §1, NFR-10 |
| 9 | Bought-in components wherever one exists | partly covered | Implied by the technology choices in the PRD addendum; not stated as a constraint for architecture to follow. |
| 10 | The launch date gives way to scope and quality | not covered | The PRD has no statement about time. See item 36. |

## The problem

| # | Brief commitment | Status | Where / what is missing |
|---|---|---|---|
| 11 | Buyers complain colour and fabric do not match the photo | partly covered | See item 20. |
| 12 | Sarees sold as "pure silk" sometimes are not | covered | FR-38 |
| 13 | She cannot see how it looks on her or see the whole design | covered | §4.2, §4.3 |
| 14 | Returns are slow and trust is gone | partly covered | FR-23 to FR-25 make returns possible. No target for how quickly a refund is started after inspection; FR-24 only shows when it was started. |
| 15 | Weaver families have no direct route to buyers | covered | §1, FR-4 |

## The solution

| # | Brief commitment | Status | Where / what is missing |
|---|---|---|---|
| 16 | Every listing says who wove it | covered | FR-4, FR-34 |
| 17 | One continuous, zoomable image of the entire saree | covered | FR-6 |
| 18 | Try-on: adult, full-length photo, clear declaration, labelled AI-generated, never the only picture | covered | FR-8 to FR-12 |
| 19 | Catalogue, stock, content, screen layouts, AI models and prompts, orders and returns managed from admin without a release | covered | §4.7 to §4.10, NFR-10 (admin holes are listed in the idea-notes reconciliation, item 15) |

## What makes this different

| # | Brief commitment | Status | Where / what is missing |
|---|---|---|---|
| 20 | Imagery the buyer can trust: true colour, the whole design, a faithful drape | partly covered | Whole design: FR-6. Faithful drape: §6.3 gate. True colour: FR-12 sends the Shopper to "the real photos ... for true colour", but nothing requires the photos to be colour-true. No photography standard, no colour check at listing, no close-up of fabric texture, no note to the Shopper about screen differences. SM-2 and SM-3 measure the outcome only. |
| 21 | Provenance counts only if the buyer sees who wove it, where, and what the fabric is | partly covered | Who: FR-4. Fabric: FR-3. Where: the Glossary gives a Weaver a place, but FR-3 lists only "country of origin" among shown attributes; the weaving town or region is not required on the Design page. |
| 22 | Try-on on the buyer's own photo is a hypothesis, not a proven advantage | covered | §4.3 description, §6.3 |
| 23 | If try-on is only average, provenance and imagery must carry the product | covered | §6.3 ("Alar launches without Try-on"), FR-42 off switch |

## Who this serves

| # | Brief commitment | Status | Where / what is missing |
|---|---|---|---|
| 24 | Primary buyer (assumption): woman of 28 to 45 in Chennai, Bengaluru, Hyderabad or Coimbatore; buys for festivals, functions and work; pays by UPI; buys today from a trusted shop or Instagram seller | partly covered | §2 has jobs to be done but no description of the buyer. UJ-1's Lakshmi (34, Coimbatore) carries part of it. The age band, the cities, the current habit and the assumption tag are not in §2 or §11. |
| 25 | Secondary: weaver families gain a direct channel | covered | §1; no weaver-facing feature is needed in the first version |
| 26 | Secondary: the owner runs the whole business from admin | covered | §2.1, NFR-10 |

## Success criteria

| # | Brief commitment | Status | Where / what is missing |
|---|---|---|---|
| 27 | Paid orders: 100 a month by month six | covered | SM-1 |
| 28 | "Matched what I saw" rating 4.5 of 5 or better | partly covered | SM-2 carries the target. No requirement asks a buyer for this rating after delivery, so the metric cannot be measured. SM-2 cites FR-3, FR-6 and FR-12, none of which collects it. |
| 29 | Returns for "not as shown" under 5% | covered | SM-3, FR-23 |
| 30 | Repeat buyers within 90 days: 20% | covered | SM-4 |
| 31 | 30% of product-page visitors use try-on | partly covered | SM-5 carries the target. No requirement records page visits or feature use; FR-45 counts Try-on results only. The same gap affects any measure of Full saree view use. |
| 32 | Try-on spend divided by orders under Rs 25 | covered | SM-6, FR-45 |
| 33 | Owner lists a new saree in under 15 minutes | covered | SM-7, FR-34, UJ-3 |
| 34 | Launch gate for try-on: real sarees, real photos, rated by saree buyers for border, pallu and colour | covered | §6.3, Open Question 1 |

## Scope

| # | Brief commitment | Status | Where / what is missing |
|---|---|---|---|
| 35 | In: sarees only, own stock, 100 designs × 10 pieces; South India; prepaid through Razorpay; one shipping provider; whole-rupee tax-inclusive prices with exact tax on the invoice; catalogue, full saree view, try-on with consent, cart, checkout, orders, returns; admin with user management; OpenRouter first; website and Android with server-driven home, category, product layout and campaign screens; iOS after Android (assumption) | covered | §6.1, §6.2, FR-5, FR-20, §4.7, PRD addendum. User management is partly covered; see the idea-notes reconciliation, item 14. |
| 36 | Out: cash on delivery, other clothing, other sellers, try-on for under-18s, regions beyond South India | covered | §6.2, §2.2, §5 |

## Constraints

| # | Brief commitment | Status | Where / what is missing |
|---|---|---|---|
| 37 | One builder; every component operable by one person | covered | NFR-10 |
| 38 | Full scope over a fast launch; analyst estimate four to six months | not covered | No timeline, estimate or statement of this trade-off in the PRD. |
| 39 | Thin slice first | covered | §6.3 |
| 40 | Lowest-cost hosting: Oracle free tier for testing and first deployment | partly covered | PRD addendum says "for building and testing"; "first deployment" is dropped. Open Question 7 reopens it. |
| 41 | Production grade: payments, stock, consent and deletion correct from day one | covered | NFR-4, FR-19, FR-8, FR-15, FR-27 |
| 42 | Renameable; app-store identifier must not contain the name | covered | NFR-12 |

## What is not yet known

| # | Brief item | Status | Where / what is missing |
|---|---|---|---|
| 43 | Whether any model drapes a saree faithfully | covered | §6.3, Open Question 1 |
| 44 | Whether buyers want the full saree view | not covered | Not in §10, and no metric measures Full saree view use. |
| 45 | Margin; budget for try-on, hosting and marketing | covered | Open Question 6 |
| 46 | Whether the free tier is dependable enough for real payments | covered | Open Question 7 |
| 47 | Tax on unstitched sarees above Rs 2,500; whether AI-labelling rules bind a shop | covered | §8, Open Question 8 |

## Vision

| Brief commitment | Status | Where / what is missing |
|---|---|---|
| Later: more weaving regions, cash on delivery, iOS, other clothing with variants, a direct named channel for weavers across India | partly covered (counted under none of the above; minor) | §6.2 lists cash on delivery, iOS and other clothing as later. "More weaving regions" and "a named channel for weavers across India" are not in §1 Vision, which describes only the first version. |

## Qualitative wishes

- The brief's opening picture ("has it draped on her shoulder, sees the pallu and border opened out, and feels the fabric") is kept in §1 except for "feels the fabric". Nothing in the PRD tries to convey fabric feel beyond listed attributes and zoom.
- "A saree she can trust" is kept through FR-4, FR-38, NFR-13 and the counter-metrics.

## Suggested fixes

1. True colour: add an acceptance line to FR-34 (or a new FR in §4.8) for a colour-checked photo set including a fabric close-up, and a Shopper-facing colour note in FR-3.
2. Rating: add an FR to §4.5 that asks the buyer after delivery "did it match what you saw?" and stores the answer; point SM-2 at it.
3. Usage measurement: add an NFR to §7 for privacy-respecting counts of Design-page visits, Full saree view opens and Try-on starts; point SM-5 at it.
4. Price band: add to §1 and §6.1.
5. Timeline: add to §6.3 the full-scope-over-date decision and the four-to-six-month estimate as an assumption; list it in §11.
6. Persona: add a short "Primary buyer" paragraph to §2 with the assumption tag, and list it in §11.
7. Full saree view demand: add to §10, and add a secondary metric in §9 for the share of Design-page visitors who open it.
8. Weaving place: add "weaving place" to the attributes shown in FR-3.
9. Refund speed: add a target to FR-24 or §7 for starting a refund after inspection.
10. Vision: add one sentence on the later direction to §1.
11. Hosting wording and bought-in components: fix in the PRD addendum.
