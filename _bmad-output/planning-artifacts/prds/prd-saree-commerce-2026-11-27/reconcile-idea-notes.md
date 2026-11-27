# Reconciliation: idea notes against the PRD

Input: `docs/idea-notes.md` (the founder's own statements).
Checked against: `prd.md` and `addendum.md` in this folder. The PRD was not edited.

Status values: **covered**, **partly covered**, **not covered**, **contradicted**. "By reference" means the item lives only in the brief's addendum, which the PRD's addendum points to.

## Summary

- 44 items checked.
- 33 covered, 9 partly covered, 2 not covered, 0 contradicted.
- The gaps that matter most: the price band is absent from the PRD; the launch-time wish and its later replacement are absent; "user management" and "everything operational from admin" have holes (Weavers, shopper accounts, discounts, shipping and return settings, legal text); acceptance of terms and conditions before try-on is not required anywhere; "mobile apps are the main target" is weakened by a website-first order of work and iOS deferred on an assumption.

## Product

| # | Founder statement | Status | Where / what is missing |
|---|---|---|---|
| 1 | Fashion e-commerce for India, clothing only | covered | §1 Vision, §6.1 |
| 2 | Starts with sarees; other clothing later | covered | §6.1, §6.2, FR-35 |
| 3 | Mobile apps for Android and iOS are the main target; a web site as well | partly covered | Android and website are in §6.1. iOS is out of the first version on an analyst assumption (§6.2, §11) that the founder has not confirmed. The order of work in §6.3 builds the website first and the Android app second to last, and the PRD never says the apps are the main target. |

## What makes it different

| # | Founder statement | Status | Where / what is missing |
|---|---|---|---|
| 4 | Try-on: user uploads a full-length photo and sees herself in the saree, realistically, before buying | covered | FR-10, FR-11; "realistically" is carried by the launch gate in §6.3 and SM-C3 |
| 5 | Full saree view: the complete saree as one image to open, scroll and inspect | covered | FR-6, FR-7 |
| 6 | Intended flow: view the design, try it on, then purchase | partly covered | UJ-1 tells this flow and FR-3 puts both entry points on the Design page. No requirement lets the Shopper add to cart or buy from the Try-on result screen; FR-12 only points her back to the real photos. |

## Platform requirements

| # | Founder statement | Status | Where / what is missing |
|---|---|---|---|
| 7 | Server-driven UI for the apps | covered | §4.7, FR-30 to FR-33 |
| 8 | Backend language open; Java excluded | covered | PRD addendum, technology choices (TypeScript). The Java exclusion is not written down but is moot. |
| 9 | The stack must come with an open-source CMS and admin tooling | covered | PRD addendum (Payload, Medusa admin) |
| 10 | Microservices acceptable, including gRPC | covered | PRD addendum: "Not microservices: three deployables". The founder allowed microservices, did not require them. |
| 11 | Razorpay for payments; a delivery API for shipping (credentials exist) | covered | PRD addendum; FR-17, FR-18, FR-21, FR-47 |
| 12 | Production-level inventory: image upload, colour and size variants, stock per variant | covered | FR-34, FR-35, FR-36 |
| 13 | AI prompts and their governance manageable from admin | covered | FR-41, FR-43, FR-46 |
| 14 | User management from admin | partly covered | FR-49 only looks up a Shopper's Orders, consents and complaints. FR-50 covers staff. Nothing lets the Owner deactivate or block a Shopper account, correct her details, or carry out the erasure and data requests that FR-28 promises her. |
| 15 | Everything operational manageable from admin | partly covered | NFR-10 states the principle. Missing admin requirements: create and edit a Weaver (FR-34 needs one, no FR makes one); create a discount or coupon (FR-5 and FR-37 assume discounts exist); set the delivery region, shipping charge and return period; edit the consent notice (FR-8 has versions but no editor), the legal disclosures (FR-29) and translations (NFR-14); answer and close a complaint (FR-49 shows deadlines only). |
| 16 | Backend, AI integration and database schema designed for production | covered | NFR-4, NFR-5, NFR-8, NFR-9, NFR-11; FR-19, FR-36 |

## Process requirements

| # | Founder statement | Status | Where / what is missing |
|---|---|---|---|
| 17 | Use the BMAD method itself | covered | §0 names the downstream BMAD workflows |
| 18 | Thorough research, including market research, before development | covered | §0 cites the three research reports |
| 19 | Then PRD, epics and stories | covered | this PRD; epics and stories follow |

## Decided

| # | Founder statement | Status | Where / what is missing |
|---|---|---|---|
| 20 | Own inventory, not a marketplace | covered | §2.2, §5 |
| 21 | Medusa + Payload, TypeScript on Postgres, separate try-on worker, subject to a one-week spike | covered | PRD addendum. The third spike question (stock hold) is dropped with a reason given in the brief's addendum. |
| 22 | Price band about Rs 1,500 to 5,000 | not covered | The PRD never states the price band. §5 only says Alar does not chase the under-Rs 800 segment. |
| 23 | Shopper prices are always whole rupees | covered | FR-5, FR-37 |
| 24 | Launch region: South India first | partly covered | §6.1, FR-17. "South India" is never defined as a list of states or pincodes, and it is not an open question. |
| 25 | Prepaid only in the MVP; cash on delivery later | covered | FR-18, §6.2 |
| 26 | Try-on for adults only at first | covered | FR-9, §2.2 |
| 27 | Before try-on: a clear declaration that the photo is processed by AI models | covered | FR-8 |
| 28 | Before try-on: the shopper must accept the terms and conditions | partly covered | No requirement makes the Shopper accept terms and conditions, before try-on or at sign-up. FR-8 says the notice "is not bundled with other terms" and FR-9 mentions "the terms of use" without any acceptance step. The note that the dictated words were "process emails" and need confirming is also not carried as an open question. |
| 29 | Sarees come directly from weaver families; the main difference from other apps | covered | §1, FR-4 |
| 30 | The founder builds alone with cloud AI agents; a team later | covered | §0, §1, NFR-10, FR-50 |
| 31 | Name is Alar and may change; renaming must be easy | covered | NFR-12 |
| 32 | The founder's family and family friends weave; the agenda is to cut out the dealer | covered | §1 |
| 33 | Launch catalogue about 100 designs, about 10 pieces each | covered | §6.1, Glossary |
| 34 | Launch within one to two months at most, including all testing | not covered | The PRD has no timeline at all. The brief records that the founder later chose full scope over this date, with an analyst estimate of four to six months; the PRD carries neither the wish nor the replacement. |
| 35 | Hosting: Oracle Cloud free tier for testing and deployment | partly covered | PRD addendum says "for building and testing", which drops deployment. Open Question 7 asks whether real payments run on free hosting, so the decision is reopened, not lost; the founder's stated preference should be recorded beside it. |
| 36 | Floci as the free AWS emulator in development (name to confirm) | covered | PRD addendum. The "to confirm" is not carried. |

## AI controls the admin must have

| # | Founder statement | Status | Where / what is missing |
|---|---|---|---|
| 37 | Image-model routing is admin-managed; switch models without a release | covered | FR-39 |
| 38 | OpenRouter preferred | covered | PRD addendum; FR-39 ("a model aggregator") |
| 39 | Prompts are admin-editable | covered | FR-41 |
| 40 | Every AI setting customisable and controllable from admin | partly covered | FR-39 to FR-46 and NFR-3 cover route, prompts, limits, spend, off switch. Not covered: per-model generation settings (image size, quality, timeout), how long photos and results are kept, and the failure-rate threshold in NFR-9. Also, FR-40 and FR-41 lock some settings on purpose (safety wording, no-retention routing). That comes from the brief's addendum and is sound, but it is a limit on "everything" that the founder should see stated. |
| 41 | Everything built to production level | covered | §7 |

## OpenRouter notes

| # | Note | Status | Where / what is missing |
|---|---|---|---|
| 42 | Reference images are honoured only by models that accept image input; limits vary by model; the model list reports supported parameters | not carried (minor) | Not in either addendum. The Approved-model list (FR-40) should record whether a model accepts a reference image and its limits. Counted under item 40. |
| 43 | Zero-retention routing exists but which image models qualify is unknown | covered | PRD addendum, FR-40 line |
| 44 | OpenRouter is the default provider behind an interface, not the only one | covered | PRD addendum; FR-39 |

## Not yet decided

| Founder statement | Status | Where |
|---|---|---|
| Where sarees are sourced | covered | resolved: weaver families, §1 |
| Languages at launch | covered | Open Question 3, NFR-14 |
| Which shipping provider | covered | Open Question 2 |
| Budget and team size | covered | Open Question 6; one builder |

## Qualitative wishes

- "Realistically" (try-on): kept, through the launch gate and SM-C3.
- "Open, scroll and inspect" (full saree view): kept in FR-6.
- Look and feel: the idea notes say nothing about look. The PRD addendum records the founder's later wish for a "modern, distinctive and attractive" look and passes it to the UX step. It is in the addendum only; the PRD has no requirement or quality bar for it.

## Suggested fixes

1. Price band: add "about Rs 1,500 to 5,000" to §1 Vision and §6.1.
2. Timeline: add a line to §6.3 stating the founder's first wish (one to two months), the later choice of full scope over date, and the analyst estimate, tagged as an assumption.
3. Admin gaps: add FRs to §4.8 (manage Weavers; manage discounts) and §4.10 (manage Shopper accounts and action privacy requests; shop settings for region, shipping charge, return period; edit consent notice, disclosures and translations; answer complaints).
4. Terms and conditions: add an acceptance step to FR-26 or FR-9, and add "confirm 'process emails' meant photos" to §10.
5. Mobile target and iOS: state in §1 or §6.1 that the apps are the main target, and move "iOS follows Android" from an assumption to an open question for the founder in §10.
6. South India: define the region in §6.1 or add it to §10.
7. AI settings: extend FR-39 or FR-40 with per-model settings and image-input capability; add retention period to FR-42; state the locked settings in the §4.9 description.
8. Hosting: in the PRD addendum change "building and testing" to "testing and first deployment, pending Open Question 7".
9. Flow: add to FR-12 that the Shopper can add the Design to her cart from the Try-on result.
