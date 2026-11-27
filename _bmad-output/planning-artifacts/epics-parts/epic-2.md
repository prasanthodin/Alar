## Epic 2: Shoppers find a saree and trust what they see

A Shopper browses, filters and searches about 100 Designs on the website without logging in, reads who wove each one, sees honest whole-rupee prices, and inspects the whole saree in the Full saree view. The Owner lists Designs with full attributes, Weavers, Variants, tax data, evidence-backed claims and discounts, and can list a Design in under 15 minutes. Everything here is built for the website; the Android app shows the same things in Epic 6.

**FRs covered:** FR-1, FR-2, FR-3 (complete), FR-4, FR-5, FR-6, FR-7, FR-34 (complete), FR-35, FR-37, FR-38, FR-57, FR-58
**NFRs:** NFR-1, NFR-14

**Conventions for every story in this epic**

- Shopper-facing screens are described by behaviour only; they are styled from DESIGN.md when it exists.
- No Shopper-facing text is written in code (spine, Consistency Conventions). Until Story 2.11, new Shopper-facing text goes in the website's translation file; from Story 2.12 it is read through `packages/api-client`.
- Every state-changing Admin request writes a `shop-audit` event with actor, time, action, before and after (AD-14), and every state change runs as a named workflow (AD-4). Stories do not repeat this in each criterion.
- Items tagged `[ASSUMPTION]` are choices made while writing the stories where the PRD and spine are silent.

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
- Linking a Weaver to a Design is Story 2.2. The Shopper-facing Weaver page is Story 2.16. Translations of the story are Story 2.11.

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
**When** the Owner chooses fibre, weave, colour or occasion
**Then** she chooses from lists of options that she can add to and rename on an Admin page, without a release
**And** colour and occasion accept several options; fibre and weave accept one each

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
**Then** the draft is saved; completeness is checked at publishing (Story 2.10), not at saving

**Requirements:** FR-34, FR-3, FR-4, FR-1 (the filterable attributes); AD-3, AD-14, AD-19, AD-28
**Notes for the developer:**
- Extends the `design-attributes` module and its schema in `packages/contracts`: adds by migration whichever of these fields Epic 1 did not already create, the link to `weaver`, and an attribute-option table for fibre, weave, colour and occasion.
- Colour and occasion are not in AD-28's field list but FR-1 filters by them; they are added here as typed fields `[ASSUMPTION]`. Colour is held on the Design at launch because a saree has one Variant.
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
- The list of protected regional names is an Owner-editable option list like those in Story 2.2 `[ASSUMPTION]`. The rest of the publish gate is Story 2.10.

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
- Prices entered here are validated as whole rupees in Story 2.6. Choosing a Variant on the Design page is Story 2.17.

---

### Story 2.5: The Owner sets tax rates by tax code from a date

As an Owner,
I want to change the tax rate of a tax code from a given date,
So that a change in the law or in my accountant's advice changes a setting, not the software.

**Acceptance Criteria:**

**Given** the Owner opens the Tax page in the Admin
**When** the page loads
**Then** she sees each tax code with its value bands (per-piece value range and rate) and the date each set of bands took effect
**And** the two codes seeded from the PRD's working assumptions are present: unstitched saree at 5% at any value; stitched garment at 5% up to Rs 2,500 per piece and 18% above

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

**Given** a stitched Variant priced at Rs 2,800 with a discount of Rs 400 per piece
**When** the money functions choose the rate
**Then** the rate is taken from the band for the per-piece value after the discount, here the 5% band
**And** the same Variant with no discount falls in the 18% band

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
- Add table-driven tests for the money functions: flat rate, threshold rule, boundary at Rs 2,500, a dated change. Whether the band applies to the tax-inclusive or the taxable per-piece value is the accountant's question (PRD §8); keep it one switch inside the money functions.
- Discounts themselves are Story 2.18; this story only makes the functions accept a per-piece discount.

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

**Given** a Variant
**When** its price is set for the first time or changed
**Then** the `set-variant-price` workflow writes one price-history row with the Variant, the old price, the new price, the time and the Owner's account
**And** no price-history row is ever updated or deleted

**Given** the Variants that existed before this story
**When** it is deployed
**Then** each has one price-history row recording its current price from its creation time

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
- Creates the `price-history` module and table, the `set-variant-price` workflow, the shop admin route for prices and the lowest-price function used by the catalogue read.
- Remove the kernel's direct price-edit routes from the allow-list in `packages/contracts` and hide the matching built-in admin control.
- Showing the 30-day lowest price beside a discount is Stories 2.18 and 2.19.

---

### Story 2.7: The Owner uploads the full-length image of a saree

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
**Then** the new image is recorded as a new version and the earlier Full saree view stays in use until the new one is ready (Story 2.8)

**Given** a Design with a full-length image
**When** the Owner removes it
**Then** the Design has no full-length image and its status is "none"

**Given** the minimum of 8,000 pixels
**When** the code reads it
**Then** it comes from the `settings` module, not from a constant in code (AD-13)

**Requirements:** FR-7; AD-4, AD-13, AD-14, AD-22
**Notes for the developer:**
- Adds full-length image fields to `design-attributes` (object key, version, width, height, status: none, uploaded, processing, ready, failed), an `admin/shop/*` route that issues the upload link, and the `attach-full-image` workflow.
- The original is stored in the `catalog` bucket, which is versioned and backed up (NFR-8). Accepted types are JPEG and PNG `[ASSUMPTION]`.
- Cutting tiles and the "ready" status are Story 2.8; the viewer and preview are Story 2.9.

---

### Story 2.8: The full-length image is made ready and the Owner sees when it is finished

As an Owner,
I want the full-length image cut into tiles in the background and to see when that is finished,
So that I can carry on listing the Design while it is processed.

**Acceptance Criteria:**

**Given** a full-length image has been recorded with the status "uploaded"
**When** `attach-full-image` completes
**Then** it enqueues one `tiles.build` job on the shop queue with a deterministic id made from the Design id and the image version, and sets the status to "processing" (AD-8)

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
- Adds the `tiles.build` job name and payload to `packages/contracts`, the job in `apps/worker/src/jobs`, and the internal route and workflow in `apps/commerce`.
- The worker reads the original from `catalog` and writes to `tiles`; both are public buckets, so no signed links are needed for this job.
- Test with a 20,000-pixel-long image on the ARM64 staging server and record how long the job takes; the PRD sets no time limit.

---

### Story 2.9: A Shopper views the whole saree

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
- One viewer page in `apps/web` using OpenSeadragon 6.1.1, reading the tile descriptor location from the Design view model through `packages/api-client`. Build it as a self-contained page so that Epic 6 can load the same page in the Android web view (AD-18).
- Adds an `admin/shop/*` route that issues the signed Design preview link; Story 2.10 reuses it for the Design page preview. The 15-minute validity is `[ASSUMPTION]`.
- Placing the entry point so that it is visible without scrolling is Story 2.17. Styled from DESIGN.md when it exists.

---

### Story 2.10: The Owner previews a Design and publishes it only when it is complete

As an Owner,
I want to preview a Design as a Shopper will see it and publish it only when nothing required is missing,
So that every listing is complete and honest, and listing one takes me under 15 minutes.

**Acceptance Criteria:**

**Given** a draft Design
**When** the Owner chooses "Preview"
**Then** the website's Design page opens for that Design through the signed preview link from Story 2.9
**And** the Design is not visible to Shoppers or in the catalogue read

**Given** a Design that lacks any of: a Weaver, a fibre, a length and a width, a tax code, a whole-rupee price on every Variant, a photo marked as the fabric close-up, and at least one other photo
**When** the Owner chooses "Publish"
**Then** `publish-design` refuses with the error code `design.incomplete` and the details list every missing item at once
**And** the Design stays a draft

**Given** a Design with a claim that has no evidence
**When** the Owner chooses "Publish"
**Then** it is refused as in Story 2.3

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

**Given** photos and a full-length image already taken, and a Weaver already created
**When** the Owner lists a new Design on staging from "New Design" to "Published", with attributes, one Variant, 10 Pieces of stock, photos, the full-length image and a preview
**Then** a timed rehearsal recorded in `docs/` takes under 15 minutes, not counting time waiting for tiles
**And** an automated end-to-end test performs the same steps and passes

**Requirements:** FR-34, FR-38, FR-4; AD-4, AD-14, AD-28
**Notes for the developer:**
- Completes the `publish-design` workflow in `apps/commerce/src/workflows` and the Design admin page; adds a "fabric close-up" mark on a photo and the true-colour confirmation fields to `design-attributes`.
- `publish-design` is the only way a Design becomes published (AD-28); the kernel's own product-status edit stays off the allow-list.
- If the rehearsal exceeds 15 minutes, shorten the form (for example, sensible defaults for one Variant) within this story; do not relax a check.

---

### Story 2.11: The Owner translates the shop's text without a release

As an Owner,
I want to enter translations of the shop's wording and of each Design's and Weaver's text,
So that Shoppers can read Alar in their language without waiting for a release.

**Acceptance Criteria:**

**Given** the Owner is signed in to the content admin, reached through the access gate (AD-15)
**When** she opens Translations
**Then** she can edit, for English and Tamil, the value of each interface text key used by the website
**And** she can enter, for a Design chosen by its commerce id, a translated name, description and care text; for a Weaver, a translated name, place and story; and for an attribute option, a translated label

**Given** a translation has been saved
**When** commerce next builds a Shopper-facing response in that language
**Then** the translated text is used within 60 seconds of the save, with no release and no restart

**Given** a text with no translation in the Shopper's language
**When** it is requested in that language
**Then** the English text is returned
**And** a text key is never shown to a Shopper in place of text

**Given** the website's interface texts
**When** a client asks for them in a language through a `/store/shop/*` read
**Then** commerce returns every key with its text in that language, with English for missing ones
**And** clients never call the content application directly (AD-2)

**Given** content refers to a Design, a Weaver or an option
**When** the record is stored
**Then** it holds only the commerce id, never a copy of price, stock or attributes (AD-3)

**Given** the Owner saves or deletes a translation
**When** the change is stored
**Then** content writes an audit event to its append-only collection with her email, the time, the action and the before and after values (AD-14)
**And** no content route updates or deletes an audit event

**Given** the content application cannot be reached
**When** commerce builds a catalogue response
**Then** the response is still returned, with English text from commerce's own records

**Requirements:** NFR-14; AD-2, AD-3, AD-14, AD-15, AD-19
**Notes for the developer:**
- Creates in `apps/content` the translations collection (interface texts, and Design, Weaver and option texts by commerce id) and the content audit-event collection; creates in `apps/commerce` the read of content over HTTP and a `/store/shop/*` route for interface texts. Schemas go in `packages/contracts`.
- Seed the interface-text keys from the translation file used by earlier stories, with English values. English and Tamil are the configured languages (PRD §10, working answer 3).
- The 60-second freshness uses the kernel's in-memory cache, as AD-12 allows for layout. The website's use of these texts and the language choice are Story 2.12.

---

### Story 2.12: A Shopper reads the shop in her language

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

**Given** the Owner changes a translation in the content admin
**When** a Shopper loads a page more than 60 seconds later
**Then** she sees the new text, with no release

**Given** the website's source code
**When** the build runs
**Then** a check fails the build if a Shopper-facing page contains literal text instead of a text key

**Given** a price, a date or a measurement
**When** it is shown in any language
**Then** the price is a whole number of rupees and the value is the one the server returned; only its formatting follows the language

**Given** the interface texts cannot be fetched
**When** a page is rendered
**Then** the website uses the last set of texts it received, and English from its translation file if it has none

**Requirements:** NFR-14; AD-2, AD-19
**Notes for the developer:**
- Touches `packages/api-client` (send the language on every request, fetch interface texts) and `apps/web` (language control, text lookup, the build check).
- Replace the literal texts on the pages Epic 1 built (Design page, cart, checkout, order pages) with text keys.
- Styled from DESIGN.md when it exists.

---

### Story 2.13: The catalogue is read from one place, with filters, counts and availability

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
**Then** options within one filter are alternatives and different filters must all hold `[ASSUMPTION]`
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
**Then** 95% of responses are sent within 500 milliseconds `[ASSUMPTION]`

**Given** UI code in `apps/web`
**When** it needs catalogue data
**Then** it calls a function in `packages/api-client` that returns these view models, and the lint rule fails the build if it imports the kernel's SDK or types (AD-2)

**Requirements:** FR-1, FR-5; AD-2, AD-5, AD-6, AD-19, AD-28
**Notes for the developer:**
- Extends `/store/shop/designs` in `apps/commerce/src/api/store/shop`, the `DesignCard` and listing schemas and the availability enum in `packages/contracts`, and the function in `packages/api-client`.
- Default order is newest first and the page size is 24 `[ASSUMPTION]`. Text comes in the request's language (Story 2.11).
- Search is Story 2.15. Discount fields on the card are Story 2.18. Add a seed script that creates about 100 Designs for tests.

---

### Story 2.14: A Shopper browses and filters Designs on the website

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
- `apps/web` only, using the `packages/api-client` function from Story 2.13, including its count-only mode. The page computes no counts and no availability.
- No countdowns or "only N left" pressure (NFR-13).
- Styled from DESIGN.md when it exists. Search is Story 2.15.

---

### Story 2.15: A Shopper searches Designs

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
**Then** a Design matches only if every word is found in at least one of the four fields `[ASSUMPTION]`

**Given** about 100 published Designs on staging
**When** a Shopper submits a search
**Then** results are shown within 2 seconds of submitting, measured by an automated test

**Given** a search that matches no Design
**When** the results page loads
**Then** it says nothing matched and offers the nearest filters: the fibre, weave, colour, occasion and Weaver options whose labels resemble a search word, or, if none does, the options with the most Designs `[ASSUMPTION]`
**And** choosing one opens the Designs page with that filter applied

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
- Adds a search parameter and a `suggested_filters` field to `/store/shop/designs` using Postgres full-text search inside commerce (spine, Deferred: no separate search engine); adds the search box and results state to `apps/web`.
- Search covers the text held in commerce (the default language). Translated text lives in the content database and is not searched in this story `[ASSUMPTION]`.
- Styled from DESIGN.md when it exists.

---

### Story 2.16: A Shopper reads about a Weaver

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
- Styled from DESIGN.md when it exists. The link from the Design page is Story 2.17.

---

### Story 2.17: The Design page tells a Shopper everything she needs

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
**Then** the Weaver's name and place are shown with a link to the Weaver page from Story 2.16

**Given** the page
**When** it loads
**Then** it shows the maker's name and address, a consumer-care contact, and the return, refund, delivery and payment terms
**And** these come from settings and from text the Owner can change without a release

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
- Until Epic 3, the delivery estimate is the earliest and latest number of days for the delivery region, and the maker's name and address and consumer-care contact are the shop's own, all read from the `settings` module `[ASSUMPTION]`; the terms are interface texts from Story 2.11. Epic 3 adds the pincode check (FR-17) and the numbered policies (FR-59).
- The region below the fixed content that the Owner arranges from Blocks is Epic 5. Styled from DESIGN.md when it exists.

---

### Story 2.18: The Owner creates a discount

As an Owner,
I want to create a discount as a percentage or an amount, for chosen Designs, between two dates, applied automatically or by a code,
So that I can run an offer without breaking whole-rupee prices or the tax calculation.

**Acceptance Criteria:**

**Given** the Owner opens Discounts in the Admin
**When** she creates a discount with a percentage or a whole-rupee amount, one or more chosen Designs, a start and an end date and time, and either "automatic" or a code
**Then** the discount is saved and applies only to those Designs and only between those times

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
**Then** only the larger of the two discounts applies to that Piece `[ASSUMPTION]`

**Given** a Checkout whose Hold has begun
**When** the discount ends or is edited
**Then** the Checkout snapshot's amounts do not change, and the amount charged equals the total shown before payment began

**Given** the Owner edits or ends a discount
**When** she saves
**Then** the change applies to carts priced afterwards and a `shop-audit` event records it

**Requirements:** FR-58, FR-5, FR-37; AD-5, AD-14, AD-21, AD-28
**Notes for the developer:**
- A discount is a kernel record (AD-3). Add the shop's Discounts admin page, the kernel routes it needs to the allow-list, the per-piece discount step in the money functions, and discount fields on `DesignCard` and the Design detail schema in `packages/contracts`.
- If the kernel's own percentage calculation cannot round each piece down to a whole rupee, compute the per-piece amount with the money functions and hand the kernel a fixed amount; the shop's tax provider remains the only tax calculation.
- "The lowest price of the previous 30 days" means the lowest price at which the Variant was offered in the 30 days before this discount began `[ASSUMPTION]`. Showing it to Shoppers is Story 2.19.

---

### Story 2.19: A Shopper sees discounts and charges honestly

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
**And** any "percent off" figure that is shown is supplied by the server, measured against the 30-day lowest price `[ASSUMPTION]`

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
- The shipping charge is computed by commerce from the shipping charge rule in the `settings` module (AD-13) using its seeded value; the Admin page where the Owner changes that rule is Epic 3 (FR-56).
- Styled from DESIGN.md when it exists.

---

### Story 2.20: The Design page is usable within 3 seconds on a phone

As a Shopper,
I want the Design page to be usable quickly on my phone on mobile data,
So that I can look at a saree without waiting.

**Acceptance Criteria:**

**Given** the Owner attaches a photo to a Design, a Variant or a Weaver
**When** it is stored
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
**When** it is loaded in a test that emulates a mid-range Android phone on a 4G connection
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
- The copies are made by a job on the shop queue in `apps/worker` (name and payload added to `packages/contracts`, deterministic id, safe to run twice), enqueued by the workflow that attaches a photo; widths are 320, 640, 960, 1280 and 1920 pixels `[ASSUMPTION]`.
- Use the end-to-end test runner from Epic 1 with processor and network throttling for the measurement; the PRD does not define "mid-range" or the 4G speed, so write down the profile chosen.
- The Android app's own measurement is Epic 6. A CDN is deferred by the spine.
