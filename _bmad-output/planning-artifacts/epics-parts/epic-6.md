## Epic 6: The Android app

A Shopper does in the Android app everything she can do on the website: she browses Server-driven screens, finds and inspects a Design, opens the Full saree view, checks out in native screens and pays on the payment service's own hosted payment page opened from the app, follows and returns her Order, uses her privacy rights, and uses Try-on with the device's photo picker. The Owner can set the oldest app version allowed to run. The app is a client only: it reuses `packages/contracts`, `packages/api-client` and `packages/blocks`, holds no business rules, and keeps working when the server moves ahead of it.

**FRs covered (in the app):** FR-1 to FR-33 as built for the website, FR-55
**NFRs:** NFR-1, NFR-15 (and NFR-12, NFR-14 as they apply to the app)

**Rules that apply to every story in this epic**

- "Same behaviour as the website" means the acceptance criteria of the website story for the same FR in Epics 1 to 5 apply unchanged; each story below lists only what differs on the app and what must be proven again on a phone.
- UI code gets data only from `packages/api-client` (AD-2). Where the app needs a function that the website did not, it is added to `api-client` with its view model in `packages/contracts`, additively (AD-19, AD-27). No story adds a business rule, a total, a state or an availability calculation to `apps/mobile` (AD-5, AD-24, AD-28).
- No Shopper-facing text is written in code (Conventions): interface text comes from the translation bundle that content holds and commerce serves (Story 3.4), with the app's bundled translation files as the built-in fallback, Design and Weaver text comes from commerce, and documents come from content through commerce (AD-28). Every interactive element has a label and every layout holds at the largest system font size (NFR-15).
- Screens are described by behaviour only; they are styled from DESIGN.md when it exists.
- iOS is out of scope. There is no push service at launch, so a ready Try-on result is found by polling (spine, Consistency Conventions: Payments in the app). No analytics or advertising SDK is added (AD-29).
- The app is built on the minimal Expo application of Story 1.28, which settled spike items 5, 6 and 8 on a real phone; no story here creates `apps/mobile` again.

---

### Story 6.1: App shell, navigation and configuration

As a Shopper,
I want an Android app that opens, shows me where things are and tells me plainly when it cannot reach the shop,
So that everything else in the app has a dependable place to live.

**Acceptance Criteria:**

**Given** the minimal Expo application that Story 1.28 created in `apps/mobile`, with its neutral application id and `packages/contracts` and `packages/blocks` already wired in
**When** the developer builds the app shell on it, with Expo 58 and expo-router, and adds `packages/api-client`
**Then** a debug build installs and starts on an Android phone and on an emulator
**And** the proof's sample screen, sample tile page and measurement screens are removed from the shell or kept only in a development build
**And** the app has places for home, browse, cart and account, each showing a placeholder that later stories replace
**And** `apps/mobile` imports `packages/contracts`, `packages/api-client` and `packages/blocks` and nothing from the kernel's SDK; the lint rule from AD-2 runs on `apps/mobile` and fails the build on such an import

**Given** the app's configuration
**When** it is inspected
**Then** the application id, the URL scheme and the package names do not contain the product name, and the name shown under the icon comes from one configuration value (AD-20, NFR-12)
**And** a test fails the build if the product name appears anywhere in `apps/mobile` outside that configuration value
**And** the API address and environment come from build-time configuration checked against a zod schema; a build with a missing value fails with the name of the missing value

**Given** any request the app makes
**When** it leaves the phone
**Then** it carries `X-Client` with platform `android` and the app's version in the format defined in `packages/contracts`, the Shopper's language, a request id, and an `Idempotency-Key` when it changes state (AD-27, Conventions)

**Given** the phone has no network
**When** the Shopper opens a screen that needs data it does not have
**Then** she sees a "no connection" state with a retry action, never a blank screen or a raw error
**And** when the network returns and she retries, the screen loads

**Given** the server answers with the error envelope `{ code, message, details? }`
**When** the app receives a `code` it does not know
**Then** it shows a general "something went wrong, try again" state and does not crash (AD-27)

**Given** the Shopper presses the Android back button
**When** she is on a screen below a top-level place
**Then** she returns to the previous screen; from a top-level place, back leaves the app

**Requirements:** NFR-12, AD-2, AD-16, AD-19, AD-20, AD-27, AD-29
**Notes for the developer:**
- Builds on Story 1.28: `apps/mobile` exists; this story turns the proof into the shell and does not create the application or change its application id. Touches `apps/mobile` and, only if needed, a storage and header hook in `packages/api-client` so it runs outside a browser; `packages/*` still import no UI framework.
- Use the versions in the spine's Stack table. Add no library that is not part of the Expo SDK or named in the spine.
- Placeholder texts here are temporary; Story 6.3 moves all interface text to the app's translation files.
- Left for later stories: every real screen, sign-in, the forced-update screen.
- Styled from DESIGN.md when it exists.

---

### Story 6.2: Minimum app version and the forced-update screen

As an Owner,
I want to set the oldest app version allowed to run,
So that a version with a serious fault can no longer be used.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin
**When** she sets the minimum Android app version in shop settings and saves
**Then** the value takes effect without a release, and an audit event records who changed it, when, and the before and after values (FR-55, FR-56, AD-13, AD-14)
**And** a value that is not a valid version is refused with a clear message

**Given** the minimum version is 1.4.0
**When** an app sending `X-Client` for android 1.3.9 calls any `/store/*` route
**Then** commerce answers with the error code `client.update_required` and performs nothing else (AD-27)
**And** an app at 1.4.0 or 1.10.0 is served normally (versions are compared as numbers, not as text)
**And** requests from the website, the Admin, webhooks and `/internal/*` are never refused by this check

**Given** the app receives `client.update_required` from any request
**When** the response arrives
**Then** the app shows only the update screen: a message asking the Shopper to update and one action that opens the app's store page; no other screen can be reached (FR-55)
**And** the message is bundled with the app in every supported language, so it shows even though the server is refusing requests

**Given** the Shopper is on the update screen
**When** she closes and reopens the app, with or without a network
**Then** she sees the update screen again
**And** when the Owner lowers the minimum version, the next time the app is opened with a network it checks, is served, and returns to normal use

**Given** a Shopper has begun payment on a version that then falls below the minimum
**When** the payment service confirms her payment
**Then** her Order is still created on the server and she is messaged as usual, because confirmation does not depend on the app (AD-7)

**Given** the store page cannot be opened on the phone
**When** she taps the update action
**Then** she sees a short message telling her to update from her app store, and the app stays on the update screen

**Requirements:** FR-55, AD-13, AD-14, AD-27
**Notes for the developer:**
- Touches `apps/commerce` (a middleware in `src/api`, the `settings` module, one field on the shop settings admin page), `packages/contracts` (the error code and the `X-Client` format, if absent), `packages/api-client` (surface the error as a typed result) and `apps/mobile` (the update screen).
- No earlier epic builds this middleware or this setting; `X-Client` itself has been sent since Story 1.2.
- `[ASSUMPTION: a request with no `X-Client` is treated as the website]`; the check is a product control, not a security control.
- Styled from DESIGN.md when it exists.

---

### Story 6.3: Text in her language, large fonts and screen-reader basics

As a Shopper,
I want the app in my language, readable at my phone's font size and usable with a screen reader,
So that I can shop without struggling to read or reach anything.

**Acceptance Criteria:**

**Given** the app's interface text
**When** a screen shows it
**Then** it comes from the translation bundle for her language, fetched with `getTranslations` in `packages/api-client` from `/store/shop/translations/{language}` (Story 3.4) and cached on the phone (AD-28)
**And** the translation files bundled with the app, one for English and one for Tamil with the same keys as the website's where the wording is shared, are the built-in copy: the app uses them before its first fetch, for any key the bundle lacks, and whenever the fetch fails
**And** Design and Weaver text arrives in view models from commerce in the Shopper's language, and documents and notices arrive from content through commerce, so a change the Owner makes to those appears the next time the screen is loaded, without a release (NFR-14)

**Given** the Owner publishes a changed interface text in a translation bundle
**When** the app is next opened or brought to the front with a connection
**Then** it fetches the newer bundle version and shows the new wording, with no app release (NFR-14)
**And** with no network it shows the last bundle it cached, or the built-in copy; no screen waits on the bundle, a bundle key the app does not know is ignored, and bundle text is shown as plain text and never run (AD-27, FR-33)

**Given** the phone's language is one the shop has published (English at launch; Tamil is the first added language)
**When** the Shopper first opens the app
**Then** the app uses that language; otherwise it uses English
**And** she can change the language from the account place, the change applies at once, and every later request carries the new language

**Given** a text key has no translation in her language
**When** a screen shows it
**Then** the English text is shown, never the key or an empty space

**Given** any amount of money
**When** it is shown
**Then** it is a whole number of rupees with no paise, formatted by the shared formatter; the app never calculates an amount (FR-5, AD-5)
**And** dates and times are shown in the business time zone (Conventions)

**Given** the phone is set to the largest system font size
**When** the shell screens from Stories 6.1 and 6.2 are opened
**Then** no text is cut off or overlaps, and every action can still be reached, by scrolling if needed (NFR-15)
**And** Tamil text shows correctly with no missing characters

**Given** the Android screen reader is on
**When** the Shopper moves through a shell screen
**Then** every interactive element is announced with a label, its role and its state, in a sensible order (NFR-15)
**And** a shared set of basic components (text, button, text field, image with description, list row) carries these behaviours, and a lint or test rule fails the build when an interactive element has no label

**Requirements:** NFR-14, NFR-15, FR-5, AD-2, AD-5, AD-28
**Notes for the developer:**
- Touches `apps/mobile` (translation files, text lookup, language choice, the basic components). The language is sent on every request by `packages/api-client`, as on the website (Story 2.14). The app never calls `apps/content` directly (AD-2).
- AD-28: interface text is a translation bundle per language, held in content and served through commerce; the app caches it and carries a built-in copy as the fallback, so a wording change needs no app release (NFR-14). The route, the view model and `getTranslations` exist from Story 3.4; this story adds the app's cache, its built-in files and the lookup order. Add the app's own text keys to the bundles' seed so the Owner can edit them.
- Every later story builds its screens from these basic components; Story 6.18 audits the finished app.
- Styled from DESIGN.md when it exists.

---

### Story 6.4: Sign in with a one-time code

As a Shopper,
I want to sign in to the app with my mobile number and a one-time code,
So that I can check out, see my Orders and use Try-on.

**Acceptance Criteria:**

**Given** a Shopper who is not signed in
**When** she browses, searches, opens a Design or the Full saree view, or adds to her cart
**Then** she is never asked to sign in (FR-26)
**And** she is asked only when she starts checkout, opens her Orders or starts Try-on, and after signing in she continues to the place she was going

**Given** she enters her mobile number and asks for a code
**When** the code arrives and she enters it within 5 minutes
**Then** she is signed in: same behaviour as the website, including acceptance of the terms of use and privacy policy at first sign-in, recorded with version and time, and kept separate from Try-on consent (FR-26)

**Given** the limits in FR-26
**When** a code is older than 5 minutes, or a fourth code is requested for one number within 10 minutes, or a wrong code is entered
**Then** the app shows the matching message from the server's error code and, where the server gives it, when she can try again
**And** the app does not request the permission to read SMS; the code field offers the keyboard's own code suggestion where the phone provides one

**Given** she is signed in
**When** she closes and reopens the app, or restarts the phone
**Then** she is still signed in
**And** her session is kept in the phone's secure storage and never written to logs (Conventions)

**Given** her session has expired or she deleted her account elsewhere
**When** the app makes a request that needs her identity
**Then** she is asked to sign in again and loses nothing she had in her cart

**Given** she signs out from the account place
**When** sign-out completes
**Then** her session and any personal data the app stored on the phone (Orders, addresses, Try-on images held in memory or on disk) are removed, and the saved Server-driven screens and texts remain

**Given** the phone has no network
**When** she asks for a code or submits one
**Then** she is told there is no connection and can retry; no code is counted as used

**Requirements:** FR-26, AD-2, AD-15, AD-26
**Notes for the developer:**
- Touches `apps/mobile` and the session-storage hook in `packages/api-client`. The one-time-code provider, rate limits and messages already exist in commerce (Epic 3).
- A Shopper token must never be sent to an admin route; the app knows no admin route (AD-15).
- Changing the mobile number is in Story 6.14.
- Styled from DESIGN.md when it exists.

---

### Story 6.5: Server-driven home, category and campaign screens

As a Shopper,
I want the home, category and campaign screens to show what the Owner has published,
So that I always see the current shop without updating the app.

**Acceptance Criteria:**

**Given** the Owner has published a home screen
**When** the Shopper opens the app
**Then** the app requests the screen from the screens route through `packages/api-client` and shows its Blocks in the published order, using one native component for each Block type in `packages/blocks`: banner, row of Designs, grid of Designs, Weaver story, text, image (FR-30, AD-12)
**And** every Design shown comes from the embedded `DesignCard` with its whole-rupee price and its availability, including sold out and "unavailable for now", exactly as the server sent them (FR-1, FR-5, FR-19)

**Given** the Owner publishes a change, or a scheduled screen's time arrives
**When** the Shopper next opens or refreshes the screen
**Then** she sees the change without an app release (FR-31)

**Given** a screen contains a Block whose type this app version does not know
**When** the screen is shown
**Then** that Block is skipped and every other Block is shown; nothing is shown as an error (FR-32, AD-12)
**And** a Block with known type but fields the app does not know is shown using the fields it knows (AD-27)
**And** a known Block whose required properties fail the schema in `packages/blocks` is skipped in the same way

**Given** a Block carries an action
**When** the Shopper taps it
**Then** the app performs it only if it is on the fixed action list of AD-12 built into this version: `open-design`, `open-weaver`, `open-category`, `open-screen`, `open-search`, and `open-link` for a same-site address, which opens the matching screen in the app
**And** a Block whose action this version does not know is shown but cannot be tapped; screen data can never run code, load a remote script or open a capability that was not in the reviewed version (FR-33)

**Given** the app has shown a screen before
**When** it cannot fetch that screen (no network, time-out or server error)
**Then** it shows the last copy it received for that screen and language, with a short notice that it may be out of date (FR-32, AD-12)
**And** when the app has never received that screen, it shows the "no connection" state with retry

**Given** a category or campaign screen is opened from a Block action
**When** it loads
**Then** it behaves by the same rules as the home screen
**And** a screen that no longer exists shows a "not available" state with a way back home

**Given** the screens route answers
**When** the app shows the screen
**Then** the first Blocks are visible without waiting for images further down, and images are requested in a size fitted to the phone's screen (Conventions: Speed)

**Requirements:** FR-30, FR-31, FR-32, FR-33, FR-1, FR-5, AD-2, AD-12, AD-27
**Notes for the developer:**
- Touches `apps/mobile` only: a Block registry mapping each type in `packages/blocks` to one component, a screen renderer, and a saved-screen store on the phone. Start from the sample renderer of Story 1.28 and bring it up to these criteria.
- The app never reads content's own shape and never resolves a rule or a price itself (AD-12).
- Add unit tests with recorded screens: one with an unknown Block type, one with an unknown action, one with extra fields.
- The Design page's Server-driven region is in Story 6.7.
- Styled from DESIGN.md when it exists.

---

### Story 6.6: Browse, filter and search Designs, and read about a Weaver

As a Shopper,
I want to browse, filter and search Designs in the app and read about the Weaver,
So that I can find a saree I like and know who made it.

**Acceptance Criteria:**

**Given** a Shopper who is not signed in
**When** she opens the browse place
**Then** she sees Designs from `/store/shop/designs` through `packages/api-client`: same behaviour as the website (FR-1, AD-28)
**And** a Design with no Pieces in stock is shown as sold out, not hidden

**Given** the filters fibre, weave, colour, occasion, price and Weaver
**When** she chooses several
**Then** they combine, and the count of results the server returns is shown before she applies them (FR-1)
**And** the app computes no count, no filter and no availability itself (AD-28)

**Given** she types words in search
**When** she submits
**Then** results matching the name, description, weave or Weaver appear within 2 seconds on a 4G connection (FR-2)
**And** a search with no results shows the filter panel with its counts and the three weaves that have the most Designs, as the server returns them, instead of an empty screen (FR-2)

**Given** a long list of results
**When** she scrolls
**Then** more results load as she goes, her place in the list is kept when she opens a Design and comes back, and her chosen filters stay applied

**Given** a Design or a Weaver story Block
**When** she taps the Weaver
**Then** she sees the Weaver's name, place, story and photos and a list of that Weaver's Designs: same behaviour as the website (FR-4)

**Given** the phone has no network, or the request fails
**When** she opens browse, applies a filter or searches
**Then** she sees the "no connection" state with retry and her chosen filters and typed words are kept

**Given** a slow connection
**When** she changes a filter twice quickly
**Then** only the result of her latest choice is shown

**Requirements:** FR-1, FR-2, FR-4, FR-5, AD-2, AD-28
**Notes for the developer:**
- Touches `apps/mobile` only; reuses the `DesignCard` component from Story 6.5.
- No catalogue data is filtered or sorted on the phone.
- Left for the next story: the Design page itself.
- Styled from DESIGN.md when it exists.

---

### Story 6.7: Design page

As a Shopper,
I want to open a Design in the app and see everything about it,
So that I can decide whether to buy it.

**Acceptance Criteria:**

**Given** a published Design
**When** the Shopper opens it from any list, Block or search result
**Then** she sees its photos, whole-rupee tax-inclusive price, description, Weaver, stock status and delivery estimate, and the attributes fibre, weave, zari, where it was woven, length and width in metres, blouse piece included or not, care and country of origin: same behaviour as the website (FR-3, FR-5)
**And** the fixed content the website shows is all present and cannot be removed by screen data: the fabric close-up photo, the note that colours can look slightly different on different screens, the maker's name and address, the consumer-care contact, and the return, refund, delivery and payment terms including the return period and conditions (FR-3, FR-23)

**Given** a Design with a discount
**When** its price is shown
**Then** the lowest price of the previous 30 days, as returned by the server, is shown beside it (FR-5)

**Given** a phone screen of ordinary size at the default font size
**When** the Design page opens
**Then** the entry points to the Full saree view and to Try-on are visible without scrolling (FR-3)
**And** when the Design has no full-length image, the Full saree view entry point is absent (FR-6); when the server reports Try-on switched off, its entry point follows the website's behaviour

**Given** the photos of a Design
**When** she swipes through them and pinches one
**Then** she can move between photos and zoom a photo, and photos are requested in a size fitted to the screen (Conventions: Speed)
**And** a Try-on result never appears among the product photos (FR-12)

**Given** a Design with more than one Variant
**When** she chooses a Variant
**Then** the price, stock status and any photos of that Variant are shown, as the server returns them (FR-35 as built for the website)

**Given** the Design's last Piece is on Hold, or it is sold out
**When** the page is shown
**Then** it says "unavailable for now" or sold out as the server reports, and the add-to-cart action is not offered (FR-19)

**Given** the Owner has arranged the Design page's Server-driven region
**When** the page is shown
**Then** the region appears below the fixed content, built from the Block types allowed there (row of Designs, Weaver story, text, image) with the same skip rule for unknown Blocks as Story 6.5 (FR-30, FR-32)
**And** if the region cannot be loaded the rest of the page still shows

**Given** a Design that has been unpublished, or a link to one that never existed
**When** the page is opened
**Then** a "not available" state is shown with a way back to browsing

**Given** the phone has no network
**When** she opens a Design
**Then** she sees the "no connection" state with retry; a saved copy of a Design page is never shown with a price, because price and availability must be current (AD-12)

**Requirements:** FR-3, FR-4, FR-5, FR-19, FR-30, FR-32, NFR-1, AD-2, AD-12, AD-28
**Notes for the developer:**
- Touches `apps/mobile` only. The page must not wait on Try-on status, counts or messages before it is usable (Conventions: Speed).
- The add-to-cart action is wired in Story 6.9, the Full saree view in 6.8, the pincode delivery check in 6.9 and Try-on in 6.15; here their entry points open a placeholder.
- NFR-1 is measured on a real phone in Story 6.18; keep the first screenful to one catalogue request plus images.
- Styled from DESIGN.md when it exists.

---

### Story 6.8: Full saree view in the app

As a Shopper,
I want to open the Full saree view in the app and pan and zoom along the whole saree with my fingers,
So that I can inspect the body, border and pallu as if it were laid out in front of me.

**Acceptance Criteria:**

**Given** a Design with a full-length image that has finished processing
**When** the Shopper taps the Full saree view entry point
**Then** a native screen opens holding a web view that loads the same OpenSeadragon viewer page the website uses, showing the whole saree first (FR-6, AD-18)
**And** she can zoom in until one pixel of the image fills one pixel of the screen, and only the tiles for the part she is looking at are downloaded at full detail

**Given** the viewer is open on an Android phone
**When** she uses one finger to pan, two fingers to pinch, and a double tap
**Then** the saree pans, zooms and steps in smoothly; the native screen does not scroll, swipe back or zoom the whole page instead (AD-18)
**And** because Story 1.28 settled the touch-behaviour spike item with a sample tile set, this story re-runs the same checks and frame-rate measurement on the finished screen with a real Design, and records the result in `docs/` with the phone models and Android versions tested

**Given** the viewer is open
**When** she presses the Android back button or the close action
**Then** she returns to the Design page in one step, at the place she left

**Given** the web view
**When** the viewer page or any link inside it tries to go to an address outside the viewer page and the `tiles` bucket
**Then** the web view does not go there
**And** the web view receives no Shopper session, token or personal data

**Given** the phone has no network, or tiles stop loading part-way
**When** she opens or uses the Full saree view
**Then** she sees a "no connection" state with retry rather than a blank or broken viewer, and tiles already loaded stay visible

**Given** the screen reader is on, or the largest font size is set
**When** she opens the Full saree view
**Then** the image has a spoken description naming the Design, and zoom in, zoom out and close are available as labelled controls that work without gestures (NFR-15)

**Given** she turns the phone
**When** the screen rotates
**Then** the viewer fills the new shape and keeps the part of the saree she was looking at

**Requirements:** FR-6, NFR-15, AD-18, AD-22
**Notes for the developer:**
- Touches `apps/mobile` (a native screen with `react-native-webview`) and, only if needed, the shared viewer page so it accepts a mode without the website's surrounding page. There is one viewer, not two (AD-18).
- Do not build a native tile viewer.
- Counting Full saree view opens (NFR-16) is added in Epic 7 with the counts module.
- Styled from DESIGN.md when it exists.

---

### Story 6.9: Cart and delivery check

As a Shopper,
I want to add Pieces to my cart in the app and check delivery to my pincode,
So that I know what I am buying, what it costs and when it can arrive.

**Acceptance Criteria:**

**Given** a Design with Pieces in stock
**When** the Shopper adds it to her cart from the Design page
**Then** the cart shows it with its whole-rupee price, and she can change the quantity or remove it: same behaviour as the website (FR-16)
**And** the quantity cannot go above the Pieces in stock; the server's refusal is shown as a clear message (FR-16)

**Given** a Shopper who is not signed in has items in her cart
**When** she closes the app, reopens it later, and then signs in
**Then** her cart is still there after reopening, and after signing in it is the same cart she sees on the website and on her other devices (FR-16)

**Given** she enters a pincode on the Design page or in the cart
**When** the server answers
**Then** she sees whether the shop delivers there, with an earliest and a latest delivery date (FR-17)
**And** a pincode outside the delivery region is refused with a clear message before checkout can begin
**And** a pincode that is not six digits is caught before any request is sent

**Given** the cart
**When** it is shown
**Then** any shipping charge is shown here, before checkout begins, and the total is the server's total; the app adds nothing up itself (FR-5, AD-5)
**And** nothing is pre-selected or added to the cart that she did not add, and no countdown or "only a few left" pressure is shown beyond the server's true stock status (NFR-13)

**Given** an item in her cart has sold out or changed price since she added it
**When** she opens the cart or moves towards checkout
**Then** the item is flagged with what changed and she must accept the change or remove the item before payment can begin (FR-19)

**Given** her cart has a live Hold because payment has begun
**When** she tries to change the cart from the app or from another device
**Then** the change is refused with a message that payment is in progress, and she is offered the way back to that payment (AD-6)

**Given** the phone has no network
**When** she adds, changes or removes an item
**Then** the change is not shown as done; she is told there is no connection and can retry
**And** a repeated tap or a retry never adds the item twice (Conventions: Idempotency)

**Requirements:** FR-16, FR-17, FR-5, FR-19, NFR-13, AD-2, AD-5, AD-6, AD-21
**Notes for the developer:**
- Touches `apps/mobile` only; the cart id for an anonymous Shopper is kept on the phone.
- Only allow-listed cart routes are called, through `api-client` (AD-21).
- Checkout begins in Story 6.10.
- Styled from DESIGN.md when it exists.

---

### Story 6.10: Checkout: address, summary and Hold

As a Shopper,
I want to give my address, see exactly what I will pay and begin payment in the app,
So that the Pieces are kept for me while I pay.

**Acceptance Criteria:**

**Given** a Shopper with items in her cart
**When** she taps checkout
**Then** she is asked to sign in if she is not signed in, and then returns to checkout with her cart unchanged (FR-26)

**Given** she is at checkout
**When** she enters or chooses a delivery address
**Then** the same fields and checks as the website apply, the pincode is checked against the delivery region, and an address outside it is refused before payment with a clear message (FR-17)
**And** she is asked for an email address for the invoice and may leave it empty (FR-26)

**Given** a valid address
**When** the summary is shown
**Then** it shows each item, any discount, any shipping charge, the total in whole rupees, the delivery estimate, and the return period and conditions: same content as the website (FR-5, FR-18, FR-23)
**And** cash on delivery is not offered, and nothing is pre-ticked (FR-18, NFR-13)

**Given** the summary
**When** she taps pay
**Then** the app starts `begin-checkout` through `packages/api-client` once, with an `Idempotency-Key`; the server takes the Checkout snapshot and places the Pieces on Hold for 15 minutes (FR-19, AD-6)
**And** the app shows how long the Hold has left, counted from the expiry time the server returned

**Given** another Shopper got the Hold on the last Piece a moment earlier, or an item sold out or changed price
**When** `begin-checkout` is refused
**Then** she is told before any money is taken, the affected item is flagged as in Story 6.9, and no payment screen opens (FR-19)

**Given** she tapped pay twice, or the request timed out and she retried
**When** the server answers
**Then** there is one Checkout and one Hold (AD-6, Conventions: Idempotency)

**Given** she leaves checkout after the Hold began and before paying
**When** she chooses "back to cart"
**Then** the app asks the server to cancel the Checkout, the Hold is released, and her cart is as it was (AD-6)
**And** if she simply closes the app, the Hold ends by itself after 15 minutes and, on reopening, the app shows the true state the server reports

**Given** the phone has no network at any step
**When** she tries to continue
**Then** she is told there is no connection, nothing is charged, and she can retry

**Requirements:** FR-17, FR-18, FR-19, FR-23, FR-26, NFR-13, AD-2, AD-5, AD-6, AD-21
**Notes for the developer:**
- Touches `apps/mobile` only. The app never calls the kernel's cart-completion route; it is blocked for clients (AD-7, AD-21).
- This story ends with a live Checkout and the data needed to open the payment screen; opening it is Story 6.11. Until then the pay action ends on a screen that shows the Checkout's status from the server.
- Styled from DESIGN.md when it exists.

---

### Story 6.11: Payment and its outcome

As a Shopper,
I want to pay by UPI, card or netbanking on the payment service's own screen and be told truthfully what happened,
So that I am never unsure whether I have been charged or whether I have an Order.

**Acceptance Criteria:**

**Given** a live Checkout from Story 6.10
**When** the payment step opens
**Then** the payment service's own hosted payment page is opened from the app for that Checkout, offering UPI, card and netbanking, and the amount on it equals the total shown before payment began (FR-18, AD-2, AD-7)
**And** the app never sees, stores or logs a card number or UPI credential (FR-18, Conventions)
**And** when she chooses a UPI app, that app opens, and returning from it brings her back to the app's payment step

**Given** the payment screen closes for any reason (success shown, failure shown, she dismissed it, or she came back from a UPI app)
**When** the app regains control
**Then** it does not treat anything the payment screen reported as proof; it asks the server for the Checkout's status and shows only what the server says (AD-7)
**And** it asks again every 3 seconds for up to 60 seconds while the status is not final `[ASSUMPTION: the interval and length; use the website's values if they differ]`

**Given** the server reports the payment confirmed
**When** the status arrives
**Then** she sees the Order confirmation with the Order number, and the Order appears in her Orders (FR-20)

**Given** the server reports the payment failed
**When** the status arrives
**Then** she is told she has not been charged, her cart is as it was, and she can try again (FR-18)

**Given** she dismissed the payment screen without paying
**When** the server reports that no payment was made
**Then** she can open the payment screen again for the same Checkout while the Hold lasts, with the remaining time shown, or go back to her cart, which releases the Hold (AD-6)

**Given** the status is still pending after 60 seconds
**When** the wait ends
**Then** she sees a "payment pending" state that says it becomes an Order if confirmed within the Hold and is otherwise refunded automatically; her cart cannot be paid for a second time meanwhile (FR-18)
**And** the app checks the status again whenever it comes to the front and whenever she opens her Orders

**Given** the Hold ended before her payment was confirmed
**When** the late confirmation is handled by the server
**Then** the app shows what the server decided: an Order if the Pieces were still free, or "payment refunded automatically" if not (FR-19)

**Given** the app is closed by the phone, loses its network, or the phone restarts during payment
**When** she next opens the app
**Then** it finds the Checkout she had in progress, asks the server for its status and shows the matching state above; no second payment is started for it

**Given** the payment screen
**When** a page inside it tries to open an address that is not the payment service's, a bank's page reached through it, or a UPI app
**Then** the app does not load it

**Requirements:** FR-18, FR-19, FR-20, NFR-4, AD-2, AD-7
**Notes for the developer:**
- Touches `apps/mobile` only. Order creation stays in `confirm-payment` on the server; nothing here creates or completes anything (AD-7).
- Payment in the app is the payment service's own hosted payment page, opened from the app (spine, Consistency Conventions: Payments in the app); no Android payment library is added. Show the page in the `react-native-webview` already in the Stack and hand UPI links to Android.
- Test against the payment service's test mode: success, failure, dismissal, pending, late confirmation, duplicate webhook (one Order, one charge).
- Styled from DESIGN.md when it exists.

---

### Story 6.12: Orders, tracking, invoice and cancellation

As a Shopper,
I want to see my Orders in the app, follow each one, get its invoice and cancel it before dispatch,
So that I always know where my saree is and can change my mind in time.

**Acceptance Criteria:**

**Given** a signed-in Shopper
**When** she opens her Orders
**Then** she sees every Order she has placed on the website or the app, newest first, each with its state exactly as named in the Glossary (Paid, Packed, Dispatched, Out for delivery, Delivered, Delivery failed, Returned to shop, Cancelled, Refunded) as returned by the server (FR-21, AD-24)
**And** the app never works out a state from other fields

**Given** an Order
**When** she opens it
**Then** she sees its items, amounts, address, state history and tracking details: same behaviour as the website (FR-21)
**And** a change reported by the shipping service appears when she opens or refreshes the Order, without the Owner doing anything

**Given** an Order in the state Delivery failed
**When** she opens it
**Then** she is told what happens next; an Order in Returned to shop shows that it is refunded in full (FR-21)

**Given** an Order with an invoice
**When** she taps the invoice
**Then** the invoice file is fetched through a short-lived link and opened or shared with Android's own viewer or share sheet, and the app asks for no storage permission (FR-20, FR-54, AD-22)
**And** if the link has expired by the time she taps, the app asks for a fresh one once and then opens it

**Given** an Order that has not been dispatched
**When** she cancels it and confirms
**Then** the Order becomes Cancelled, and she sees the refund amount, that it goes to the payment method she used, and when it was started (FR-22, FR-24)
**And** an Order already Dispatched offers no cancel action; if it was dispatched in the moment between her opening the screen and tapping, the server's refusal is shown clearly and the Order is refreshed

**Given** an Order with a refund
**When** she opens it
**Then** she sees the refund amount and when it was started (FR-24)

**Given** the phone has no network
**When** she opens her Orders
**Then** she sees the "no connection" state with retry; cancelling is never shown as done until the server confirms it

**Given** she signs out
**When** another person opens the app on the same phone
**Then** no Order, address or invoice of hers can be seen

**Requirements:** FR-20, FR-21, FR-22, FR-24, AD-2, AD-22, AD-24
**Notes for the developer:**
- Touches `apps/mobile` only. States and allowed actions come from the server's view model (AD-24).
- Returns and the rating are in Story 6.13.
- Styled from DESIGN.md when it exists.

---

### Story 6.13: Returns and "did it match?"

As a Shopper,
I want to request a Return and rate whether the saree matched what I saw, from the app,
So that I can send back what disappointed me and tell the shop the truth.

**Acceptance Criteria:**

**Given** a Delivered Order inside the return period set by the Owner (7 days from delivery at launch)
**When** the Shopper requests a Return for an item
**Then** she gives a reason and books a pickup: same behaviour as the website (FR-23)
**And** "not as shown" and "defective or wrong item" are always offered, and return shipping for them is shown as free

**Given** an item outside the return period, or one the server says cannot be returned
**When** she opens the Order
**Then** the Return action is not offered, and she is shown why, using the server's reason

**Given** a Return exists
**When** she opens it
**Then** she sees its state exactly as named in the Glossary (Requested, Pickup booked, Picked up, Received, Accepted, Rejected, Refunded) as returned by the server (FR-23, AD-24)
**And** a Rejected Return shows the reason and the Owner's inspection photos, and says the item is being sent back to her
**And** an Accepted or Refunded Return shows the refund amount and when it was started (FR-24)

**Given** she taps "request Return" twice or retries after a time-out
**When** the server answers
**Then** there is one Return (Conventions: Idempotency)

**Given** an Order has been Delivered
**When** she opens the app or the Order afterwards
**Then** she is asked once to rate from 1 to 5 whether the saree matched what she saw, and may add a comment: same behaviour as the website (FR-53)
**And** she can dismiss the question and still find it on the Order; she is not asked again and again (NFR-13)
**And** a rating already given on the website shows as given in the app

**Given** the phone has no network
**When** she submits a Return or a rating
**Then** it is not shown as sent; she is told there is no connection, what she typed is kept, and she can retry

**Requirements:** FR-23, FR-24, FR-53, NFR-13, AD-2, AD-24
**Notes for the developer:**
- Touches `apps/mobile` only.
- The link between a rating and whether she used Try-on is made on the server (FR-53); the app sends only the rating and comment.
- Styled from DESIGN.md when it exists.

---

### Story 6.14: Account, disclosures, privacy requests and account deletion

As a Shopper,
I want to manage my account, read who runs the shop, use my privacy rights and delete my account from inside the app,
So that I stay in control of my data without leaving the app.

**Acceptance Criteria:**

**Given** the account place, signed in or not
**When** the Shopper opens "about and legal"
**Then** she sees the shop's legal name, address, contact details and grievance officer, and can open the privacy policy, the terms of use and the shop policies in her language, all from published content (FR-29)
**And** these are reachable without signing in and show their last received copy when the phone is offline

**Given** a signed-in Shopper
**When** she changes her mobile number
**Then** the change happens only after she enters a one-time code sent to the new number: same behaviour as the website (FR-26)

**Given** a signed-in Shopper
**When** she asks what data the shop holds about her and which services received it, or asks for a correction or erasure
**Then** the request is sent: same behaviour as the website, and the answer she later sees names the AI providers that received her Shopper photos (FR-28)

**Given** a signed-in Shopper
**When** she files a complaint
**Then** she receives a ticket number at once, and can see her complaints with their state in the app (FR-28)
**And** the screen states that complaints are acknowledged within 48 hours and resolved within one month

**Given** a person who appears in a Try-on result without agreeing
**When** she looks for how to ask for its removal
**Then** the published contact for this is shown in "about and legal" without signing in (FR-9)

**Given** a signed-in Shopper
**When** she chooses "delete my account" in the app
**Then** she is told what is removed (Shopper photos, Try-on results, personal details, with erasure requested from AI providers) and which records the law requires the shop to keep, such as invoices (FR-27)
**And** deletion needs one clear confirmation by her and no call, email or visit to the website
**And** when the server accepts it she is signed out, everything personal stored on the phone is removed, and signing in with the same number starts a new account

**Given** she has an open Order, one that is neither Delivered past its return period, nor Cancelled, nor Refunded
**When** she asks to delete her account
**Then** the server refuses the deletion with `account.has_open_order`, and the app tells her, as the website does, which Order is open and that her Shopper photos and Try-on results have been erased at once in any case (AD-31)
**And** she stays signed in and her Order continues

**Given** the phone has no network
**When** she submits a request, a complaint or the deletion
**Then** it is not shown as done; she is told there is no connection and can retry

**Requirements:** FR-9, FR-26, FR-27, FR-28, FR-29, NFR-6, AD-2, AD-23, AD-31
**Notes for the developer:**
- Touches `apps/mobile` only. Deletion runs the server's existing workflow, which calls `erase-shopper-media` (AD-23); the app only starts it.
- The public web page for account deletion already exists (Epic 3); the app opens no browser for deletion.
- Withdrawing Try-on consent is in Story 6.17.
- Styled from DESIGN.md when it exists.

---

### Story 6.15: Try-on consent and Shopper photo

As a Shopper,
I want to accept the Try-on consent notice and give one full-length photo of myself using my phone's own photo picker,
So that I can use Try-on knowing exactly what happens to my photo.

**Acceptance Criteria:**

**Given** a Shopper taps Try-on on a Design page
**When** she is not signed in
**Then** she is asked to sign in and then continues to Try-on for that Design (FR-26)

**Given** a signed-in Shopper with no current Try-on consent
**When** she starts Try-on
**Then** she sees the standalone Try-on consent notice in her language, at its latest published version, naming every AI service that can receive a Shopper photo, what is kept and for how long (30 days unused), how to withdraw and how to complain: same behaviour as the website (FR-8, FR-51, AD-11)
**And** nothing is pre-ticked, the notice is not combined with any other terms, and she must separately confirm that she is 18 or older and that the photo is of herself (FR-8, FR-9)
**And** accepting records the Shopper, the notice version, the language and the time on the server; declining returns her to the Design page with no penalty and no nagging (NFR-13)

**Given** she does not confirm both that she is 18 or older and that the photo is of herself
**When** she tries to continue
**Then** Try-on is unavailable to her and no photo can be chosen (FR-9)

**Given** the Owner has published a new version of the Try-on consent notice
**When** a Shopper who accepted an earlier version starts Try-on
**Then** she is shown the new notice and must accept it before anything else happens (FR-8, FR-59)

**Given** the notice cannot be fetched (no network)
**When** she starts Try-on
**Then** consent cannot be given from a saved copy; she sees the "no connection" state with retry

**Given** she has current consent and no stored Shopper photo
**When** she chooses "choose a photo"
**Then** the Android system photo picker opens and returns only the one photo she picks (FR-10)
**And** the app's built manifest does not contain the permissions for broad access to photos or storage (`READ_MEDIA_IMAGES`, `READ_MEDIA_VISUAL_USER_SELECTED`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`), and a test in continuous integration fails the build if any appears

**Given** she chooses "take a photo"
**When** the phone asks for camera permission and she allows it
**Then** she takes one photo and continues
**And** when she denies the permission, she is told the camera cannot be used and that she can still choose a photo; when she has denied it permanently, the message offers the way to the phone's settings; the app does not ask again on every visit

**Given** she is about to pick or take a photo
**When** the step opens
**Then** she is told what makes a good photo, and after she picks one the same on-device checks as the website (file type, size, dimensions) tell her at once when a photo cannot be used, before anything is sent to an AI provider (FR-10)

**Given** a usable photo
**When** she confirms it
**Then** the app asks commerce for a single-use signed upload link and uploads the photo straight to storage with it; the photo, the link and the image bytes never appear in the app's logs or error reports (AD-22)
**And** if the upload fails or the network drops, she can retry and a fresh link is requested; a link is never used twice
**And** if the server refuses a link because of the rate limit, she is told when she can try again

**Given** she already has a stored Shopper photo
**When** she starts Try-on
**Then** she can reuse it or replace it (FR-10)

**Given** she cancels the picker or the camera without choosing
**When** she returns to the app
**Then** nothing is uploaded and she is back at the photo step

**Given** the honest-design tests and checklist of Story 3.26, which Story 4.3 extended for the website's consent screen
**When** this story is finished
**Then** the app's cases are added: automated tests on the app fail if a confirmation or the accept control is selected by default, if the notice is combined with other terms, or if declining is followed by a repeated prompt
**And** `docs/honest-design-checklist.md` gains the app's cart, checkout, sign-in and consent screens as items for the Owner's yearly audit (NFR-13)

**Requirements:** FR-8, FR-9, FR-10, FR-51, NFR-13, AD-2, AD-11, AD-22
**Notes for the developer:**
- Touches `apps/mobile` and `docs/honest-design-checklist.md`, using the picker and camera modules that ship with the Expo SDK; configure them so no broad media permission is merged into the manifest.
- Consent, age confirmation, upload links and limits are all decided on the server (AD-11, AD-22); the app shows and sends.
- Requesting a Try-on result is Story 6.16.
- Styled from DESIGN.md when it exists.

---

### Story 6.16: Try-on result, labelled and reportable

As a Shopper,
I want to ask for a Try-on result, leave the screen while it is made, and see it clearly marked as AI-generated,
So that I can imagine the saree on me without mistaking the image for a real photo.

**Acceptance Criteria:**

**Given** a Shopper with current Try-on consent and a Shopper photo
**When** she requests a Try-on result for a Design
**Then** the request is accepted at once with a request id and she sees progress (FR-11)
**And** a repeated tap or a retry after a time-out does not create a second request or use a second attempt (Conventions: Idempotency)

**Given** a request in progress
**When** she leaves the screen, browses elsewhere in the app, or puts the app in the background
**Then** the request continues on the server; while the app is open it asks for the status at intervals and shows an in-app notice, on whatever screen she is on, when the Try-on result is ready (FR-11, FR-54)
**And** if she closed the app, the notice is shown the next time she opens it, and the result is waiting on that Design's page
**And** no push service is used at launch, so a ready Try-on result is found by polling (spine, Consistency Conventions); this is recorded in `docs/` as a known limit

**Given** the result is ready
**When** it is shown
**Then** it is fetched through a short-lived signed link and displayed with a visible "AI-generated" label drawn by the app over the image, wherever the result appears in the app (FR-12, AD-22)
**And** beside it she is pointed to the real photos and the Full saree view for true colour and design, with actions that open them, and she can add the Design to her cart from here (FR-12)
**And** the result is never shown among the Design's product photos

**Given** a Try-on result on screen
**When** she chooses to save or share it
**Then** the app uses the labelled copy from the server's route for this purpose, so the label is part of the saved image, and hands it to Android's share or save sheet without asking for a broad storage permission (FR-12, AD-22)

**Given** a Try-on result on screen
**When** she taps "report" and chooses wrong or offensive
**Then** the report is sent and acknowledged on the same screen, and it reaches the Owner's review queue with the Design, the Model route and the Prompt version (FR-13)
**And** the report control is visible on the screen where the result is shown, without opening a menu elsewhere

**Given** the primary model and then the fallback both fail
**When** the server reports failure
**Then** she is told the Try-on could not be made and that this attempt did not count against her limit (FR-11)

**Given** the AI provider's safety check blocked the request, or the result check did not pass
**When** the server reports it
**Then** she is asked, in neutral words, to use a different photo; the app does not resend the same photo for that Design by itself (FR-11, FR-52)

**Given** she has reached her limit (10 Try-on results per day at launch), or the daily spending cap is reached, or the Owner has switched Try-on off
**When** she tries to request a result
**Then** she sees the server's clear message, including when she can try again where the server gives it (FR-14, FR-42)

**Given** her consent became out of date or was withdrawn on another device while she was in the app
**When** she requests a result
**Then** the server refuses, and the app takes her to the consent notice (AD-11)

**Given** the signed link to a result has expired, or the phone has no network
**When** she opens the result
**Then** the app asks for a fresh link once, or shows the "no connection" state with retry; it keeps no copy of a Try-on result on the phone beyond what is needed to show it

**Given** the screen reader is on
**When** a Try-on result is shown
**Then** it is announced as an AI-generated image of her wearing the named Design, and report, save, add to cart and the links to real photos are all reachable (NFR-15)

**Requirements:** FR-11, FR-12, FR-13, FR-14, FR-52, FR-54, NFR-2, NFR-15, AD-2, AD-10, AD-11, AD-22
**Notes for the developer:**
- Touches `apps/mobile` only. Model route, fallback, time limits (90 seconds), limits and checks are the server's and the worker's (AD-10); the app shows states returned by the status read.
- Polling stops when no request is in progress and when the app is in the background.
- Withdrawal and deleting single items are in Story 6.17. Counting Try-on requests (NFR-16) is added in Epic 7.
- Styled from DESIGN.md when it exists.

---

### Story 6.17: Withdraw Try-on consent and delete Try-on data

As a Shopper,
I want to withdraw my Try-on consent, or delete a single Shopper photo or Try-on result, from the app,
So that taking my photo back is as easy as giving it was.

**Acceptance Criteria:**

**Given** a Shopper with Try-on consent
**When** she opens the account place or the Try-on screen
**Then** "withdraw Try-on consent" is reachable in no more steps than giving consent took, and needs no call, email or reason (FR-15)

**Given** she taps withdraw and confirms once
**When** the server accepts it
**Then** her Shopper photos and Try-on results disappear from the app at once, and she is told they are erased from the shop and that erasure has been requested from each AI provider that received them (FR-15, AD-23)
**And** the app removes any Try-on image it was holding on the phone
**And** the next time she starts Try-on she is shown the consent notice again

**Given** a Try-on request of hers was in progress when she withdrew
**When** its result arrives on the server
**Then** it is discarded and never shown in the app (AD-23)

**Given** her stored Shopper photos and Try-on results
**When** she opens "my Try-on photos"
**Then** she sees each one, every result with the "AI-generated" label, and the retention rule that they are deleted after 30 days unused (FR-12, FR-51)
**And** she can delete any single Shopper photo or Try-on result, with one confirmation, and it disappears at once (FR-15)

**Given** a photo or result was removed by the retention job or on another device
**When** she opens the list or a link to it
**Then** it is simply no longer listed; no broken image or error is shown

**Given** the phone has no network
**When** she taps withdraw or delete
**Then** it is not shown as done; she is told there is no connection and can retry, and a retry never fails because the first attempt had in fact succeeded

**Given** she has withdrawn consent
**When** she opens a Design page
**Then** everything except Try-on works as before; she is not pressed to consent again (NFR-13)

**Requirements:** FR-15, FR-51, FR-12, NFR-6, NFR-13, AD-2, AD-11, AD-23
**Notes for the developer:**
- Touches `apps/mobile` only. `erase-shopper-media` is the only erasure path and runs on the server (AD-23).
- The list of photos and results uses short-lived signed links (AD-22); none is cached on disk.
- Styled from DESIGN.md when it exists.

---

### Story 6.18: Fast and accessible on a real phone

As a Shopper,
I want the app to be quick on an ordinary phone on mobile data and fully usable with large text or a screen reader,
So that I can shop comfortably whatever phone and eyesight I have.

**Acceptance Criteria:**

**Given** the reference phone and network of the spine's test profile, written down in `docs/` with the phone's model before measuring: an Android phone with 4 GB of memory on a throttled 4G connection of 10 Mbit/s down with 100 ms delay, the same phone as Story 1.28 where it is still available
**When** a release build opens a Design page from a list, 10 times, with the app already running
**Then** in at least 9 of the 10 runs the page is usable within 3 seconds, where usable means the name, price, first photo and stock status are shown and the add-to-cart, Full saree view and Try-on entry points respond (NFR-1)
**And** the measurements and the build they were taken on are recorded in `docs/`

**Given** the same phone and network
**When** the home screen, a search and the Full saree view are opened
**Then** search results appear within 2 seconds (FR-2), and the times for the home screen and for the Full saree view's first whole-saree picture are recorded as baselines
**And** the Design page does not wait for Try-on status, messages or any other request that is not needed for its first screenful (Conventions: Speed)
**And** photos are requested in sizes fitted to the phone's screen, shown by checking the requested sizes on the reference phone

**Given** a run that misses the 3-second target
**When** the cause is found
**Then** it is fixed within `apps/mobile` or by an additive change to a view model, and the measurement is repeated until the target is met; if the cause is the server or hosting, the finding and the figures are recorded for the load test in Epic 7

**Given** the phone is set to the largest system font size
**When** every screen built in Stories 6.1 to 6.17 is opened, in English and in Tamil
**Then** no text is cut off or overlapping, and every action can be reached (NFR-15)
**And** the Full saree view and Try-on entry points remain reachable on the Design page, by scrolling if they no longer fit the first screenful

**Given** the Android screen reader is on
**When** the journey browse, Design page, Full saree view, cart, checkout up to the payment screen, Orders, Return, account deletion, and Try-on from consent to report is walked
**Then** every action in it can be reached and performed, every element is announced with a label, role and state, focus moves to new content when a screen or message appears, and errors are announced (NFR-15)
**And** every failure found is fixed and the walk repeated; the final result is recorded in `docs/` screen by screen

**Given** the finished app
**When** touch targets and contrast are checked
**Then** every control can be tapped without hitting its neighbour at the largest font size; contrast is checked again when DESIGN.md exists

**Requirements:** NFR-1, NFR-15, FR-2
**Notes for the developer:**
- Touches `apps/mobile` and `docs/`; measure release builds only, against staging.
- The measurements and walks on the real phone need a person holding it. The developer agent prepares the release build, the measurement steps and the record sheet and closes the automated criteria; the on-phone criteria wait for the Owner, and the story is handed back saying which are outstanding.
- The part of the journey inside the payment service's own screen is outside the app's control; note what was observed.
- "Mid-range phone" and "4G" are defined by the spine's test profile (Consistency Conventions, "Test profiles"), held as settings; Story 2.22 used the same profile by emulation and Story 7.11 uses this phone.
- Repeat here the blurred-bar frame-rate measurement of Story 1.28 on the styled app, if DESIGN.md uses that bar.
- Styled from DESIGN.md when it exists.

---

### Story 6.19: Release builds and compatibility tests

As a Shopper,
I want the app on my phone to keep working when the shop's server is updated,
So that I am not locked out of shopping by a change I never saw.

**Acceptance Criteria:**

**Given** a commit marked as an app release
**When** continuous integration runs
**Then** it produces a signed Android release bundle whose version name is the one sent in `X-Client` and whose version code is higher than the last release (AD-27)
**And** the signing key and its passwords are not in the repository, come from the build's secret settings, and are listed in the secrets document that the restore script relies on (Conventions: Config and secrets)
**And** the release build allows no unencrypted network traffic and contains no vendor secret, test key or `/internal` address

**Given** an app release is made
**When** the release job finishes
**Then** the zod schemas of every view model, `ScreenV1` and error code that this version uses are saved in the repository as that version's schema set (AD-19, AD-27)

**Given** a saved set of server responses covering every shop route the app calls, produced by running the current server against seed data
**When** continuous integration runs on any change to `apps/commerce`, `packages/contracts`, `packages/api-client` or `packages/blocks`
**Then** each recorded response is checked against the schema set of every released app version, and the build fails, naming the route, the field and the app version, if any released version could not read it (AD-27)
**And** a response with an added field passes, and a response with a removed or retyped field fails; both cases have a test proving it

**Given** a `ScreenV1` response that contains a Block type added after a release
**When** it is replayed against that release's schema set and renderer test
**Then** the screen is accepted and the new Block is skipped (FR-32)

**Given** a released version below the minimum app version in settings
**When** the tests run
**Then** that version is checked only for reading `client.update_required`, and versions at or above the minimum are checked in full (FR-55)

**Given** a failing compatibility test
**When** a deploy is attempted
**Then** the deploy does not happen (Conventions: Testing)

**Given** the release bundle
**When** it is installed on the reference phone from Story 6.18
**Then** the end-to-end journey browse, add to cart, pay in the payment service's test mode, see the Order, request a Return, and one Try-on in the AI provider's test setup, completes against staging

**Requirements:** FR-32, FR-55, NFR-11, AD-19, AD-27
**Notes for the developer:**
- Touches the continuous-integration configuration, `packages/contracts` (schema-set export), a fixtures directory, and `apps/mobile` build configuration. Use Expo's own build tooling; add no build service the spine does not name.
- The first schema set is saved from the first release made by this story.
- Store listing, declarations and submission are in Epic 7.
