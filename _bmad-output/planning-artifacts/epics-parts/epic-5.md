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
