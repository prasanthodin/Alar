---
title: 'PRD: Alar'
status: draft
created: '2026-11-27'
updated: '2026-11-27'
---

# PRD: Alar

*Working name; see NFR-12.*

## 0. Document purpose

This PRD defines what the first version of Alar must do. Its readers are the founder, who is also the only builder, and the downstream BMAD workflows for UX, architecture, and epics and stories. It builds on the product brief and its addendum (`../../briefs/brief-saree-commerce-2026-11-27/`) and on three research reports (`../../research/`); it does not repeat their evidence.

Vocabulary is fixed in the Glossary (§3). Features are grouped in §4 with functional requirements nested and numbered globally (FR-1 onward). Items the analyst inferred are tagged `[ASSUMPTION]` inline and indexed in §11. Technology choices live in `addendum.md`, not here.

## 1. Vision

Alar sells sarees woven by the founder's own family, and by weaver families the founder knows, directly to women in South India. Today these sarees pass through a dealer. Alar removes the dealer and lets the buyer see exactly what she is buying and who made it.

A woman choosing a saree in a shop sees it draped on her shoulder and opened out end to end. Alar gives her the same confidence on a phone: a named weaver and an honest description, a full view of the entire saree, and an image of herself wearing it, made by AI from her own photo with her consent.

The whole business is run by one person. Everything that changes week to week (the catalogue, stock, home screen, AI model and prompts) is changed in the admin without releasing new software.

## 2. Target user

### 2.1 Jobs to be done

- When I buy a saree online, I want to be sure the colour, fabric and design are what I will receive, so that I am not disappointed or embarrassed at a function.
- I want to see how this saree looks on me before I pay.
- I want to know the saree is genuine and where it came from.
- As the owner, I want to list, sell, ship and take back sarees alone, and change how the shop looks and how try-on works without a developer.

### 2.2 Non-users in the first version

- Shoppers under 18, for try-on.
- Shoppers who want cash on delivery.
- Buyers outside South India.
- Other sellers; Alar is not a marketplace.

### 2.3 Key user journeys

Journeys are `[ASSUMPTION]`: written by the analyst from the brief, not narrated by the founder.

- **UJ-1. Lakshmi buys a saree for her cousin's engagement.** Lakshmi, 34, in Coimbatore, usually buys from a shop she trusts. She opens the website on her phone without logging in, filters by occasion and price, and opens a design. She reads who wove it, opens the full saree view and zooms along the border and pallu. She taps try-on, logs in, reads and accepts the consent screen, picks a full-length photo, and within a minute sees herself in the saree, labelled as AI-generated. She adds it to the cart, enters her pincode and address, pays by UPI, and receives an order confirmation and invoice. **Edge case:** the last piece is sold while she is paying; she is told before money is taken, or refunded automatically if it was.
- **UJ-2. Lakshmi returns a saree whose colour disappointed her.** From her order she requests a return, picks "not as shown", and books a pickup. When the saree passes inspection she is refunded to the UPI account she paid from.
- **UJ-3. The owner lists a new design in under 15 minutes.** The owner photographs the saree, creates the design with its weaver, fibre, weave and price, uploads the photos and the full-length image, sets 10 pieces of stock, previews the product page and publishes.
- **UJ-4. The owner changes the try-on model after complaints about borders.** In the admin the owner sees reported results, tries a different approved model and a new prompt version on sample sarees, compares outputs, publishes the new route, and rolls back if it is worse.
- **UJ-5. The owner prepares the home screen for Pongal.** The owner builds a campaign from blocks, previews it, schedules it, and it appears in the app and website on the day without an app release.
- **UJ-6. A shopper withdraws consent.** From her account she withdraws try-on consent; her photos and try-on results disappear from Alar and from the AI providers, and try-on asks for consent again next time.

## 3. Glossary

- **Shopper** — a person browsing or buying. May be anonymous or logged in.
- **Owner** — the person who runs the shop in the admin. One person in the first version.
- **Admin** — the back office used by the Owner.
- **Weaver** — a weaving family that makes sarees; has a name, place and short story. One Weaver makes many Designs.
- **Design** — one saree as listed: a product with its own photos, description, price and Weaver. Launch has about 100 Designs.
- **Piece** — one physical saree of a Design. Stock is counted in Pieces; launch has about 10 Pieces per Design.
- **Variant** — a purchasable version of a Design that differs by colour or size. Sarees at launch have one Variant; later clothing has several.
- **Full saree view** — one continuous, zoomable image of an entire saree, end to end.
- **Try-on** — the feature that generates an image of the Shopper wearing a Design.
- **Shopper photo** — the full-length photo of herself that a Shopper uploads for Try-on.
- **Try-on result** — the AI-generated image returned by Try-on.
- **Try-on consent** — the Shopper's recorded acceptance that her Shopper photo is sent to AI services to make a Try-on result.
- **AI provider** — an outside service that runs an image model. A provider may be an aggregator that reaches several models.
- **Model route** — the Admin setting that says which model at which AI provider serves Try-on, and which model is the fallback.
- **Approved-model list** — the models the Owner may choose for a Model route, each with its data policy and terms recorded.
- **Prompt version** — one saved version of the instructions sent with a Try-on request.
- **Server-driven screen** — a screen whose content and arrangement come from the Admin as data, shown by components already built into the app or website.
- **Block** — one unit of a Server-driven screen, such as a banner or a row of Designs.
- **Order** — a paid purchase of one or more Pieces.
- **Return** — a Shopper's request to send back an Order item for a refund.

## 4. Features

### 4.1 Catalogue and discovery

**Description:** Shoppers browse and search Designs without logging in. Each Design page states who wove it and what it is made of, in terms the Owner can back with evidence. Realizes UJ-1.

#### FR-1: Browse and filter Designs
A Shopper can browse Designs and filter by fibre, weave, colour, occasion, price and Weaver. Realizes UJ-1.
- No login is required to browse, search or open a Design.
- Filters combine; the result count updates before the Shopper applies them.
- A Design with no Pieces in stock is shown as sold out, not hidden.

#### FR-2: Search Designs
A Shopper can search by words in a Design's name, description, weave or Weaver.
- A search with no results offers the nearest filters instead of an empty page.

#### FR-3: Design page
A Shopper can open a Design and see its photos, price, description, attributes, Weaver, stock status and delivery estimate. Realizes UJ-1.
- Attributes shown: fibre, weave, zari, length and width in metres, blouse piece included or not, care, country of origin.
- The page shows the maker's name and address, a consumer-care contact, and the return, refund, delivery and payment terms.
- Entry points to the Full saree view and Try-on are visible without scrolling on a phone. `[ASSUMPTION]`

#### FR-4: Weaver provenance
A Shopper can see who wove a Design and read about that Weaver.
- Every published Design is linked to exactly one Weaver.
- A Weaver page lists that Weaver's Designs.

#### FR-5: Whole-rupee, all-inclusive prices
Every price a Shopper sees is a whole number of rupees and includes tax.
- No Shopper-facing price shows paise.
- Any shipping charge is shown before checkout begins, not added during it.
- A discount is shown only with the lowest price of the previous 30 days beside it.

### 4.2 Full saree view

**Description:** One zoomable image of the whole saree, so the Shopper can inspect the body, border and pallu as if it were laid out in front of her. Realizes UJ-1.

#### FR-6: View the whole saree
A Shopper can open the Full saree view of a Design and pan and zoom along its entire length.
- The view opens at a size that shows the whole saree and zooms far enough to see weave detail.
- Only the part being looked at is downloaded at full detail, so the view works on a mobile connection.
- If a Design has no full-length image, the entry point is absent, not broken.

#### FR-7: Prepare a Full saree view
The Owner can upload one full-length image of a saree and have it made ready for the Full saree view. Realizes UJ-3.
- The Owner sees when processing is finished and can preview the result before publishing.
- An image too small to zoom usefully is rejected with the minimum size stated.

### 4.3 AI try-on

**Description:** An adult Shopper sees herself in a Design. Try-on ships only if it passes the launch gate in §6.3. It never replaces product photos. Realizes UJ-1, UJ-6.

#### FR-8: Try-on consent
Before a Shopper's first Try-on, she is shown a standalone notice and must accept it. Realizes UJ-1.
- The notice states, in plain language: that her Shopper photo is sent to named AI services to create an image; what is kept and for how long; how to withdraw; how to complain.
- Acceptance is an action by the Shopper; nothing is pre-ticked, and the notice is not bundled with other terms.
- The time, the notice version and the Shopper are recorded. A changed notice requires fresh acceptance.
- The notice is available in English and in the launch languages (see Open Question 3).

#### FR-9: Adults only, own photo only
A Shopper must confirm she is 18 or older and that the Shopper photo is of herself before using Try-on.
- Try-on is unavailable to a Shopper who does not confirm both.
- The terms of use forbid uploading another person's photo.
- A person who appears in a Try-on result without agreeing can ask for it to be removed through a published contact.

#### FR-10: Provide a Shopper photo
A logged-in Shopper can choose or take one full-length photo for Try-on.
- The app uses the device's own photo picker and never requests access to the whole gallery.
- The Shopper is told what makes a good photo and is told when a photo cannot be used, without the photo being sent to an AI provider first where that can be judged on the device. `[ASSUMPTION]`
- A Shopper can reuse a stored Shopper photo or replace it.

#### FR-11: Generate a Try-on result
A Shopper can request a Try-on result for a Design and receive it without keeping the screen open. Realizes UJ-1.
- The request is accepted immediately; the Shopper sees progress and is told when the result is ready.
- The request uses the current Model route and published Prompt version.
- If the primary model fails or times out, the fallback model is used once; if that fails, the Shopper is told and is not charged against her quota.
- A request blocked by an AI provider's safety check is not retried with the same photo; the Shopper is asked for a different photo in neutral words.

#### FR-12: Present a Try-on result honestly
Every Try-on result is shown as AI-generated and separate from product photos.
- A visible "AI-generated" label is on every Try-on result wherever it is shown or saved.
- Provenance information placed in the image by the AI provider is kept.
- A Try-on result is never used as a Design's product photo.
- Beside the result, the Shopper is pointed to the real photos and the Full saree view for true colour and design.

#### FR-13: Report a Try-on result
A Shopper can report a Try-on result as wrong or offensive from the screen where she sees it.
- A report reaches the Owner's review queue (FR-44) with the Design, the Model route and the Prompt version that produced it.

#### FR-14: Try-on limits
Try-on use by each Shopper is limited.
- A Shopper who reaches her limit is told when she can try again.
- Limits are set by the Owner (FR-42).

#### FR-15: Withdraw consent and erase
A Shopper can withdraw Try-on consent as easily as she gave it. Realizes UJ-6.
- On withdrawal, her Shopper photos and Try-on results are erased from Alar, and erasure is requested from each AI provider that received them.
- A Shopper can delete a single Shopper photo or Try-on result at any time.
- Shopper photos are never used for advertising, analytics or model training.

### 4.4 Cart, checkout and payment

**Description:** Prepaid purchase of in-stock Pieces, delivered within South India. Realizes UJ-1.

#### FR-16: Cart
A Shopper can add Pieces to a cart, change quantities and remove them.
- A cart survives closing the app or browser and, once the Shopper logs in, is the same on her other devices.
- Quantity cannot exceed Pieces in stock.

#### FR-17: Delivery check
A Shopper can enter a pincode and learn whether Alar delivers there and roughly when.
- A pincode outside the launch region is refused before checkout with a clear message.

#### FR-18: Prepaid checkout
A Shopper can pay for her cart by UPI, card or netbanking.
- Cash on delivery is not offered.
- The amount charged equals the total shown before payment began.
- Alar never stores card numbers.
- An Order exists only after the payment is confirmed by the payment service to Alar's server, not by the Shopper's device alone.

#### FR-19: No overselling
A Piece is never sold twice. Realizes UJ-1 edge case.
- When two Shoppers pay for the last Piece at the same time, exactly one Order is created.
- A Shopper whose payment succeeded but whose Piece is gone is refunded automatically and told at once.
- A payment confirmed late does not create a second Order or a second charge.

#### FR-20: Order confirmation and invoice
After paying, a Shopper receives an Order confirmation and a tax invoice.
- The invoice shows each item's tax code, taxable value and tax, exact to the paisa, and the state whose tax applies.
- A saree sold with a stitched blouse appears as two invoice lines when their tax treatment differs.

### 4.5 Orders, shipping and returns

**Description:** The Shopper follows her Order and can send an item back. Realizes UJ-2.

#### FR-21: Track an Order
A Shopper can see the status of each Order from payment to delivery.
- Status changes from the shipping service appear without the Owner's action.
- A failed delivery is shown with what happens next.

#### FR-22: Cancel before dispatch
A Shopper can cancel an Order that has not been dispatched and is refunded in full.

#### FR-23: Request a Return
A Shopper can request a Return within the return period, give a reason and book a pickup. Realizes UJ-2.
- "Not as shown" and "defective or wrong item" are always accepted reasons.
- The return period and conditions are shown on the Design page and at checkout (see Open Question 4).

#### FR-24: Refunds to source
A refund goes back to the payment method the Shopper used, unless she asks otherwise.
- The Shopper sees the refund amount and when it was started.
- Tax on the returned item is reversed with a credit note linked to the original invoice.

#### FR-25: Inspect before restock
A returned or undelivered Piece becomes sellable again only after the Owner marks it inspected.
- A Piece marked damaged is not returned to stock.

### 4.6 Accounts and privacy

**Description:** Minimal accounts, and the rights the app stores and Indian law give Shoppers.

#### FR-26: Sign in
A Shopper can sign in with her mobile number and a one-time code. `[ASSUMPTION]`
- Sign-in is required only for Try-on, checkout and order history.

#### FR-27: Delete account
A Shopper can delete her account from inside the app and from a public web page.
- Deletion removes her Shopper photos, Try-on results and personal details, and requests erasure from AI providers.
- Records the law requires Alar to keep, such as invoices, are kept and the Shopper is told which.

#### FR-28: Privacy requests and complaints
A Shopper can ask what data Alar holds about her and which services received it, ask for correction or erasure, and file a complaint.
- Every complaint gets a ticket number and an acknowledgement within 48 hours, and is resolved within one month.
- The answer to a data request names the AI providers that received her Shopper photos.

#### FR-29: Required disclosures
The website and app show Alar's legal name, address, contact details and grievance officer, and link to the privacy policy and terms.

### 4.7 Server-driven screens and content

**Description:** The Owner changes what the home, category, Design-page layout and campaign screens show without an app release. Checkout, payment, Shopper photo upload, Try-on and the Full saree view are not Server-driven screens. Realizes UJ-5.

#### FR-30: Compose a screen from Blocks
The Owner can build and reorder a Server-driven screen from Blocks.
- Blocks available at launch: banner, row of Designs, grid of Designs, Weaver story, text, image. `[ASSUMPTION]`
- A Block that lists Designs can be filled by hand or by a rule such as "newest" or a filter.

#### FR-31: Draft, preview, schedule, publish
The Owner can save a screen as a draft, preview it as a Shopper would see it, publish it now or at a set time, and return to an earlier version.
- A published change appears in the app and website without an app release.
- Preview shows the screen at phone size.

#### FR-32: Old apps keep working
An app version that does not know a Block still shows the rest of the screen.
- Unknown Blocks are skipped, never shown as errors.
- If the screen data cannot be fetched, the app shows the last screen it received.

#### FR-33: No unreviewed features
A Server-driven screen can only arrange components and actions already built into the app.
- Screen data cannot carry code or switch on a capability that was not in the version the app stores reviewed.

### 4.8 Admin: catalogue and stock

**Description:** How the Owner lists Designs and keeps stock true. Realizes UJ-3.

#### FR-34: Create and publish a Design
The Owner can create a Design with photos, attributes, Weaver, price and stock, preview it and publish it.
- A Design cannot be published without a Weaver, fibre, dimensions, a tax code and at least one photo.
- The Owner can list a Design in under 15 minutes once photos are taken.

#### FR-35: Variants
The Owner can give a Design several Variants, each with its own stock, price and photos.
- Sarees at launch need only one Variant; the Admin and the shop already handle several.

#### FR-36: Stock in Pieces
The Owner can set and adjust how many Pieces of each Variant are in stock.
- Every change to stock (sale, cancellation, Return, manual adjustment) is recorded with its time, cause and who made it.
- The Owner can see the history of any Variant's stock.

#### FR-37: Tax and price data
The Owner can set each Design's tax code, fibre, whether it is stitched, and tax rate, and can change tax rates from a given date.
- Tax is worked out from the tax-inclusive price so that the Shopper's price stays a whole rupee.
- For stitched items the rate follows the per-piece value after any discount.
- Every price change is kept so that the 30-day lowest price can be shown (FR-5).

#### FR-38: Claims need evidence
The Owner can describe a Design as silk, handloom or by a protected regional name only with supporting evidence recorded against it.
- Such a claim cannot be published while its evidence field is empty.

### 4.9 Admin: AI controls

**Description:** The Owner controls which model makes Try-on results and what it is told, within guardrails that cannot be switched off. Realizes UJ-4.

#### FR-39: Model route
The Owner can choose the model and AI provider for Try-on and a fallback model, and the change takes effect without a release.
- Only models on the Approved-model list can be chosen.
- The first AI provider is a model aggregator; a model reached another way can be added to the list without changing the shop. 
- The Owner can return to the previous Model route in one action.

#### FR-40: Approved-model list
The Owner can add a model to the Approved-model list only after recording its data-retention policy, its terms and its price per image.
- A model that keeps Shopper photos for training cannot be approved.
- Where an AI provider offers a no-retention option, requests use it.

#### FR-41: Prompt versions
The Owner can write a new Prompt version, test it, publish it and roll back.
- Safety wording set by the system is added to every request and cannot be edited or removed in the Admin.
- A Prompt version cannot be published until it has been run on the sample set (FR-43).

#### FR-42: Limits and spend
The Owner can set Try-on limits per Shopper and a daily spending cap.
- When the daily cap is reached, Try-on pauses for Shoppers with a clear message and the Owner is alerted.
- The Owner can switch Try-on off for everyone at once, and back on.

#### FR-43: Test before publishing
The Owner can run any approved model and Prompt version on a saved set of sample sarees and sample photos and compare the outputs side by side.
- Sample photos are of people who agreed to this use.

#### FR-44: Review queue
The Owner can see every reported Try-on result with what produced it, and mark each as handled.

#### FR-45: Cost and failure view
The Owner can see, by day and by Model route, how many Try-on results were made, what they cost, how long they took, and how many failed or were blocked.

#### FR-46: Change history
Every change to a Model route, the Approved-model list, a Prompt version, a limit or the off switch is recorded with who made it, when, and the before and after values.
- The history cannot be edited or deleted in the Admin.

### 4.10 Admin: orders, shoppers and staff

#### FR-47: Manage Orders
The Owner can see Orders, create shipping labels, mark dispatch, and handle cancellations and Returns.

#### FR-48: Refund
The Owner can refund all or part of an Order; the refund follows FR-24.

#### FR-49: Shopper support
The Owner can look up a Shopper's Orders, consents and complaints, and see the 48-hour and one-month deadlines for each open complaint.

#### FR-50: Staff accounts
The Owner can add another person to the Admin and limit what that person can do. `[ASSUMPTION: needed before a team joins, not at launch]`

## 5. Non-goals

- Alar is not a marketplace and will not host other sellers' listings.
- Try-on is not a styling or social feature: no sharing feed, no public gallery.
- Try-on never alters the Shopper's body or face on purpose and never produces images without clothing.
- The whole app is not server-driven; only the screens named in §4.7.
- Alar does not chase the under-Rs 800 value segment.

## 6. Scope of the first version

### 6.1 In scope

- Website and Android app.
- Sarees only: about 100 Designs, about 10 Pieces each, from the founder's family and Weavers the founder knows.
- Delivery within South India; prepaid payment; one shipping service.
- Everything in §4, with FR-50 last.

### 6.2 Out of scope for the first version

- Cash on delivery. Designed for, switched off.
- iOS app. `[ASSUMPTION: follows once Android is stable]`
- Other clothing categories. The Variant model is ready for them.
- Try-on for under-18s.
- Regions beyond South India.

### 6.3 Gates and order of work

- **Launch gate for Try-on.** Before Try-on ships, real sarees and real photos of consenting adults are run through the candidate models and rated by saree buyers for border, pallu and colour fidelity. If no model passes, Alar launches without Try-on and the feature waits. `[ASSUMPTION: the pass mark is set by the founder after seeing the first results]`
- **Thin slice first.** One Design listed, paid for, shipped and returned end to end, before any breadth is added.
- **Order of work** `[ASSUMPTION]`: technical spike and Try-on test; thin slice on the website; catalogue and Full saree view; Try-on with consent; Admin AI controls; Android app with Server-driven screens; compliance checks and launch.

## 7. Cross-cutting requirements

- **NFR-1 Speed on a phone.** A Design page is usable within 3 seconds on a mid-range Android phone on a 4G connection. `[ASSUMPTION]`
- **NFR-2 Try-on time.** 95% of Try-on results arrive within 60 seconds of the request. `[ASSUMPTION: to be reset after the Try-on test]`
- **NFR-3 Try-on cost.** The Owner sets a ceiling on cost per Try-on result; a Model route above it cannot be published.
- **NFR-4 Payments are exact.** No Order without a confirmed payment, no payment without an Order or an automatic refund; daily reconciliation between payments and Orders shows no unexplained difference.
- **NFR-5 Security.** Personal data and Shopper photos are encrypted in transit and at rest; Shopper photos are reachable only through short-lived links; Admin access needs a second factor; access to personal data is logged and the logs kept one year.
- **NFR-6 Erasure.** A withdrawal or deletion is complete within Alar in 24 hours, and erasure requests to AI providers are sent in the same period. `[ASSUMPTION]`
- **NFR-7 Breach response.** Alar can tell affected Shoppers without delay and produce a detailed report within 72 hours.
- **NFR-8 Recovery.** The database is backed up daily to a separate location, and a restore is rehearsed before launch and every quarter. The shop can be rebuilt on a new server from backups within 4 hours. `[ASSUMPTION]`
- **NFR-9 Monitoring.** The Owner is alerted when the shop is down, payments fail, Try-on fails above a set rate, or the daily Try-on spend nears its cap.
- **NFR-10 One operator.** Every routine task is done in the Admin; nothing routine needs a command line or a release.
- **NFR-11 Tested integrations.** Payment, shipping and each AI provider have automated tests against their test environments that run before every release.
- **NFR-12 Renameable.** The product name appears only in settings and content; the app-store identifier does not contain it.
- **NFR-13 Honest design.** No pre-ticked extras, false urgency, late-added charges or forced sign-ups; a yearly self-audit against the official list of dark patterns is recorded.
- **NFR-14 Languages.** All Shopper-facing text can be translated without a release.
- **NFR-15 Accessibility.** Text is readable at large system font sizes and every action is reachable by screen reader. `[ASSUMPTION]`

## 8. Compliance and regulatory

Summarised from the compliance research; items marked ⚖ need the lawyer or accountant before launch.

- **Shopper photos.** Itemised notice, recorded consent, easy withdrawal, erasure at Alar and at AI providers, no secondary use (FR-8, FR-15, FR-27). Most duties under India's data-protection rules begin about May 2027; the app stores require the same mechanics now.
- **Under-18s.** Try-on is adults-only (FR-9). ⚖ What age check is sufficient.
- **AI-generated images.** Labelled, provenance kept, unlawful output blocked (FR-12, FR-41). ⚖ Whether India's labelling rules bind a shop.
- **Tax.** Per-Design tax data and exact invoices (FR-20, FR-37). ⚖ Whether an unstitched saree above Rs 2,500 is taxed at 5%; pre-stitched sarees and blouse sets.
- **Consumer rules.** Disclosures, grievance clocks, prior-price display, declarations for garments (FR-3, FR-5, FR-28, FR-29, NFR-13). ⚖ Return-policy wording.
- **Claims.** Evidence behind silk, handloom and regional names (FR-38). ⚖ Governing rules.
- **App stores.** Report control on AI output, photo picker, account deletion in app and on web, declared adult audience, no unreviewed features (FR-10, FR-13, FR-27, FR-33).
- **AI providers.** Alar stays responsible for what they do with Shopper photos (FR-40). ⚖ Whether an aggregator's standard terms are a sufficient contract.

## 9. Success metrics

Targets are `[ASSUMPTION]`, proposed for the six months after launch.

**Primary**
- **SM-1** Paid Orders per month: 100 by month six. Validates FR-1 to FR-20.
- **SM-2** "Matched what I saw" rating from buyers: 4.5 out of 5 or better. Validates FR-3, FR-6, FR-12.

**Secondary**
- **SM-3** Returns for "not as shown": under 5% of Orders. Validates FR-3, FR-6, FR-12.
- **SM-4** Shoppers who order again within 90 days: 20%.
- **SM-5** Design-page visitors who use Try-on: 30%. Validates FR-8 to FR-11.
- **SM-6** Total Try-on spend divided by Orders placed: under Rs 25. Validates FR-42, NFR-3.
- **SM-7** Owner time to list a Design: under 15 minutes. Validates FR-34.

**Counter-metrics (do not optimise)**
- **SM-C1** Try-on use (SM-5) must not be raised by weakening consent, or by showing Try-on results in place of real photos. Counterbalances SM-5.
- **SM-C2** Orders (SM-1) must not be raised by pressure tactics or by flattering Try-on results; watch SM-3 alongside. Counterbalances SM-1.
- **SM-C3** Try-on cost (SM-6) must not be cut by choosing a model that loses border, pallu or colour fidelity. Counterbalances SM-6.

## 10. Open questions

1. What is the pass mark for the Try-on launch gate, and who are the raters?
2. Which shipping service, and what does it charge for forward and return shipments?
3. Which languages at launch besides English?
4. What is the return period, and what are the conditions for worn items?
5. What are the Try-on limits per Shopper and the daily spending cap at launch?
6. What margin do the sarees carry, and what is the budget for Try-on, hosting and marketing?
7. Will real payments run on free hosting, or on a paid server from launch?
8. The questions marked ⚖ in §8.

## 11. Assumptions index

- §2.3: all six journeys were written by the analyst.
- FR-3: Full saree view and Try-on entry points visible without scrolling.
- FR-10: photo suitability judged on the device where possible.
- FR-26: sign-in by mobile number and one-time code.
- FR-30: the launch set of Blocks.
- FR-50: staff accounts are needed before a team joins, not at launch.
- §6.2: iOS follows Android.
- §6.3: the pass mark for the Try-on gate is set after first results; the order of work.
- NFR-1, NFR-2, NFR-6, NFR-8, NFR-15: the numeric targets.
- §9: all metric targets.
