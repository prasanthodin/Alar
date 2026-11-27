## Epic 1: One saree, bought and returned end to end

The Owner lists one Design with stock; a Shopper pays for it on the website, sees her Order and its tax invoice, has it shipped, returns it and is refunded to the payment method she used. To make that slice work, this epic also creates the repository from the Medusa DTC starter, the shared contracts and the api-client seam, the local and staging environments, the route allow-list, admin sign-in with an enforced second factor, continuous database backup with one rehearsed restore, the size gate, one automated test that buys, ships and returns a saree, and a proof on a real Android phone of the three things the app depends on. It builds only the first working version of FR-3, FR-16, FR-18, FR-19, FR-20, FR-21, FR-23, FR-24, FR-25, FR-34, FR-36, FR-47, FR-48 and FR-60; later epics complete them. In this slice a Shopper signs in with the kernel's email-and-password customer sign-in, the simplest the kernel offers; sign-in by one-time code (FR-26) replaces it in Epic 3. Catalogue browsing and filters, Try-on, Server-driven screens and the Android app are not in this epic. Screens are described by behaviour only and are styled from DESIGN.md when it exists.

**Spike items proven here:** item 1 in Story 1.10; item 2 in Stories 1.4 and 1.10; item 3 in Stories 1.3 and 1.24; item 4 in Story 1.26; item 7 in Story 1.23; items 5, 6 and 8 (a sample `ScreenV1` document, OpenSeadragon under touch in a web view, and a blurred translucent navigation bar, all in a minimal Expo app on a real mid-range Android phone) in Story 1.28. The Server-driven screens themselves, the Full saree view and the Android app are built by Epics 5, 2 and 6 on what Story 1.28 proves.

### Story 1.1: Create the repository from the starter and reshape it

As a builder,
I want the repository created from the Medusa DTC starter and reshaped to the spine's layout,
So that every later story starts from the agreed structure, versions and names.

**Acceptance Criteria:**

**Given** an empty repository
**When** it is created from the Medusa DTC starter (current `main`)
**Then** `apps/backend` is renamed `apps/commerce` and `apps/storefront` is renamed `apps/web`, and `infra/` and `docs/` exist
**And** the workspace still uses pnpm workspaces and Turborepo as the starter pins them
**And** no other `apps/*` or `packages/*` directory is created yet; each is created by the story that first needs it

**Given** the reshaped repository
**When** install, lint, type-check, test and build are run from the root on Node.js 24 LTS
**Then** all pass for `apps/commerce` and `apps/web`
**And** `@medusajs/medusa` is pinned to 2.23.1 and TypeScript to 6.0.x
**And** the kernel and the storefront start with the starter's own documented development commands and the storefront loads its home page

**Given** the package manifests
**When** they are inspected
**Then** every workspace package name uses the scope `@shop/*`
**And** no package name, application id, bucket name, database name or domain in code contains the product name

**Given** a commit that adds the product name to any file under `apps/` or `packages/`, other than content or settings data
**When** continuous integration runs
**Then** a name check fails the build and names the file
**And** the check takes the forbidden name from continuous-integration configuration, not from source code

**Given** a push to any branch
**When** continuous integration runs
**Then** it runs install, lint, type-check, test and build, and fails if any of them fails

**Requirements:** NFR-12; AD-16, AD-19, AD-20; Additional Requirements "Starter template" and "Repository shape"
**Notes for the developer:**
- Touches the repository root, `apps/commerce`, `apps/web` and continuous-integration configuration only.
- Keep the starter's data layer and checkout working for now; Story 1.2 replaces the data layer and Story 1.10 replaces the card-payment checkout.
- Naming follows the Consistency Conventions: kebab-case files and directories.
- Record the starter commit used in `docs/`.

### Story 1.2: Shared contracts and the api-client seam

As a Shopper,
I want to create an account and sign in on the website through one shared client package,
So that I can be recognised at checkout, and every screen reads the backend the same way.

**Acceptance Criteria:**

**Given** the repository from Story 1.1
**When** `packages/contracts` is created
**Then** it holds zod 4.6.7 schemas for the error envelope `{ code, message, details? }`, the list of stable error codes, id and UTC ISO 8601 time shapes, and the `ShopperView` view model
**And** types are inferred from the schemas and the package imports no UI framework

**Given** `packages/api-client` is created
**When** UI code needs data
**Then** it calls only functions of `packages/api-client` (`signUp`, `signIn`, `signOut`, `getShopper` in this story), each returning a view model from `packages/contracts`
**And** the kernel's SDK is a dependency of `packages/api-client` only, and its types appear in no exported signature

**Given** a file under `apps/web` that imports the kernel's SDK or its types
**When** lint runs
**Then** the build fails with a message naming the rule

**Given** the storefront from the starter
**When** this story is finished
**Then** the starter's data layer is deleted, and the starter pages outside this epic (collections, categories, search, the starter's account pages other than sign-in and sign-up, and the starter's checkout) are removed
**And** the remaining pages (a home shell, sign-up, sign-in, a signed-in account stub) build and get all their data from `packages/api-client`

**Given** a Shopper with no account
**When** she signs up with an email address and a password and then signs in
**Then** she is signed in through the kernel's email-and-password customer sign-in and the account stub shows her email
**And** signing out ends the session

**Given** a wrong password or an unknown email
**When** she tries to sign in
**Then** she gets the same error code for both cases and no session
**And** the screen shows a message taken from the translation file, not from code

**Given** any request made by `packages/api-client`
**When** it is sent
**Then** it carries `X-Client` with platform and version, the Shopper's language, and a request id
**And** every state-changing request carries an `Idempotency-Key`

**Given** a server response with a field the view model does not know
**When** `packages/api-client` parses it
**Then** the field is ignored and the call succeeds
**And** a response that fails the schema returns a typed error with a stable code, not a thrown kernel type

**Requirements:** AD-2, AD-15, AD-19, AD-27; Consistency Conventions (Errors, Idempotency, Text and languages); Additional Requirements "Contracts first"
**Notes for the developer:**
- Touches `packages/contracts`, `packages/api-client`, `apps/web`.
- Email-and-password sign-in is a deliberate stand-in for this slice; the one-time-code provider (FR-26, AD-15) replaces it in Epic 3 behind the same `api-client` functions.
- Shopper-facing interface text goes in one English translation file in `apps/web`. That file is the website's built-in copy (AD-28): Story 2.13 adds the other languages, and Story 3.4 serves a translation bundle per language from content through commerce, with this file kept as the fallback. Documents and message templates live in content from Epic 3.
- Screens are behaviour only; styled from DESIGN.md when it exists.
- Add schemas to `packages/contracts` only as stories need them.

### Story 1.3: Local environment from one compose file

As a builder,
I want the whole system started locally by one compose file with the local AWS emulator,
So that I develop against the same services and the same file that staging will use.

**Acceptance Criteria:**

**Given** a machine with Docker Compose v2
**When** `infra/compose.yaml` is started
**Then** PostgreSQL 17 with a database named `commerce`, Redis 8, Floci at a pinned release tag, Caddy 2, `commerce` and `web` start and report healthy
**And** commerce runs in the kernel's shared mode, so its subscribers and scheduled jobs run in the same container
**And** the website is reached through Caddy and a Shopper can sign up and sign in as in Story 1.2

**Given** the Redis container
**When** its configuration is read
**Then** it never evicts keys and persists to disk
**And** nothing uses it as a cache

**Given** the kernel on Node.js 24 with Redis 8 and PostgreSQL 17
**When** the kernel starts, emits an event, runs a workflow and takes and releases a lock
**Then** all four work, proving the local part of spike item 3
**And** if any of them fails on Redis 8, stop and report which kernel component failed and with what error; do not substitute another version without the founder's decision

**Given** a required environment variable is missing or malformed
**When** commerce or web starts
**Then** the process exits with a non-zero code and names the variable, never its value
**And** the check uses a zod schema in that application

**Given** the emulator is running
**When** the stack starts
**Then** a public, versioned bucket for `catalog` exists, and a file uploaded through the kernel's file storage is stored there and can be fetched by its public address
**And** no cloud vendor's SDK other than an S3 client is added

**Given** any request to commerce
**When** it is logged
**Then** the log line is structured JSON with a request id and contains no personal data, token or password
**And** commerce and web each expose a health route

**Requirements:** AD-3, AD-8, AD-16; Stack; Consistency Conventions (Config and secrets, Logging and alerts); spike item 3 (local part)
**Notes for the developer:**
- Touches `infra/`, and start-up configuration in `apps/commerce` and `apps/web`.
- Only the `catalog` bucket and the `commerce` database are created here; the `documents` bucket is created in Story 1.9, the `content` database in Story 1.23, the `tiles` bucket in Story 2.9 and the `shopper-media` bucket in Story 3.23.
- Bucket, database and service names must not contain the product name (AD-20).
- Container images must build for ARM64 and x86-64; the multi-architecture build itself is in Story 1.24.

### Story 1.4: Route allow-list for the kernel

As a builder,
I want every kernel route refused unless it is on one list,
So that no built-in route or admin screen can change stock, payments or Orders outside the shop's workflows.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is finished
**Then** it holds the list of kernel store and admin routes that may be called, each as a method and a path pattern
**And** the list contains the customer sign-up and sign-in routes used in Story 1.2 and the admin routes that the built-in admin screens kept in use need

**Given** a request to a kernel store or admin route that is not on the list
**When** it reaches commerce
**Then** a middleware refuses it with the error envelope and the code `route.not_allowed`
**And** nothing in the database changes

**Given** the kernel's cart-completion route
**When** a client calls it, signed in or not
**Then** it is refused with `route.not_allowed`, proving the first half of spike item 2
**And** an automated test asserts the same refusal for direct edits of stock levels, reservations, payments and refunds

**Given** the list
**When** a developer tries to add cart completion or a direct stock, reservation, payment or refund edit to it
**Then** a test in `packages/contracts` fails, because those routes are on a never-allowed list in the same file

**Given** `packages/api-client`
**When** it builds a request to a kernel route
**Then** the path comes from the allow-list, and a test fails if `api-client` contains a kernel path that is not on it

**Given** the Admin
**When** the Owner opens it
**Then** the built-in screens for stock levels, reservations, payments and refunds are not reachable from its navigation
**And** if the kernel cannot hide one of them, its write routes are still refused and the screen is listed in `docs/` as visible but inert

**Given** a Shopper's token
**When** it is sent to an admin route, or an admin session is sent to a store route that needs a Shopper
**Then** the request is refused, because each route accepts exactly one kind of identity

**Requirements:** AD-21, AD-15, AD-7 (blocking only); spike item 2 (first half)
**Notes for the developer:**
- Touches `packages/contracts` (the list), `apps/commerce/src/api/middlewares`, and admin configuration in `apps/commerce/src/admin`.
- Shop routes (`/store/shop/*`, `/admin/shop/*`, `/internal/*`, `/webhooks/*`) are the shop's own and are not on this list.
- If blocking cart completion for clients cannot be done without also breaking the kernel's server-side completion, stop and report; Story 1.10 proves the server-side half.
- Later stories add a kernel route to the list only in the story that first calls it.

### Story 1.5: Shop settings with dates, and one tax calculation

As an Owner,
I want the shop's name, time zone and tax rates held as dated settings, and tax worked out in one place,
So that a rename or a tax answer changes data, not code, and every total is exact.

**Acceptance Criteria:**

**Given** the `settings` module is created in commerce
**When** a setting is read
**Then** the value returned is the one whose effective date is the latest not after the time asked for
**And** each key's value is checked against a zod schema in `packages/contracts`

**Given** the seed for this story
**When** it runs
**Then** it sets the shop name, the business time zone, and the tax bands for the saree tax code as 5% at any per-piece taxable value, as the PRD's working assumption states
**And** a band is a range of per-piece taxable value, after discount and before tax, with a rate (AD-5)
**And** it creates the kernel's one region for India in rupees

**Given** a tax band value dated tomorrow
**When** tax is calculated today and again after midnight in the business time zone
**Then** today's result uses the old rate and tomorrow's uses the new one, with no release

**Given** the money functions in `packages/contracts`
**When** tax is derived from a tax-inclusive price
**Then** all amounts are integer paise, the taxable value plus the tax equals the price to the paisa, and any rounding remainder is in the tax line
**And** a price of Rs 2,100 at 5% gives a taxable value of 200000 paise and tax of 10000 paise
**And** a shelf price that is not a multiple of 100 paise is rejected

**Given** the kernel's tax provider
**When** the kernel computes totals for any cart
**Then** the provider is the shop's own, it calls the money functions, and its lines equal the money functions' result for the same input
**And** no other code computes tax

**Given** a tax code with no band at the time asked for
**When** tax is requested
**Then** the call fails with a stable error code and no total is returned

**Given** the website
**When** any page is shown
**Then** the shop name comes from settings through `packages/api-client`
**And** the name check from Story 1.1 still passes

**Requirements:** NFR-12; AD-5, AD-13, AD-20; first data for FR-20
**Notes for the developer:**
- Touches `apps/commerce/src/modules/settings`, `apps/commerce/src/providers/tax`, `packages/contracts` (money functions, setting schemas), and the page header in `apps/web`.
- Settings are seeded in this epic; the Admin page to edit them is FR-56 in Epic 3, and changing a tax rate in the Admin is FR-37 in Epic 2.
- Later stories seed their own keys (Hold length, return period, seller details) when they first need them.
- Discounts and value-threshold bands for stitched items are left to Epic 2; the band shape must already allow them.

### Story 1.6: Owner creates and publishes one Design

As an Owner,
I want to create a Design with its photos, attributes and price and publish it,
So that there is a saree to sell.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin with her password
**When** she opens the shop's Designs page and creates a Design
**Then** she can enter a name, a description, fibre, weave, length and width in metres, whether a blouse piece is included, care, country of origin, a tax code and whether it is stitched
**And** she can upload photos, mark one as the fabric close-up, and set one Variant with a price in whole rupees
**And** the Design is saved as unpublished

**Given** the `design-attributes` module is created
**When** a Design's attributes are saved
**Then** they are typed fields linked to the kernel product, with their schema in `packages/contracts`
**And** the kernel's free-form metadata is not used for them

**Given** an unpublished Design
**When** the Owner publishes it
**Then** the `publish-design` workflow publishes it only if it has a fibre, dimensions, a tax code that has a band in settings, a price that is a multiple of 100 paise, a fabric close-up photo and at least one other photo
**And** it requires the Owner's confirmation that the photos show the saree's true colour, and records that confirmation with the time

**Given** a Design missing any one of those
**When** the Owner tries to publish it
**Then** publishing is refused, the Design stays unpublished, and the page names each missing item

**Given** a Variant's price is set or changed
**When** the change is saved
**Then** one price-history row is written with the old price, the new price and the time

**Given** the kernel's own route for changing a product's status
**When** it is called directly
**Then** it is refused under Story 1.4, so a Design is published only by `publish-design`

**Given** uploaded photos
**When** they are stored
**Then** they are in the `catalog` bucket and referenced by the Design

**Requirements:** FR-34 (first version); AD-4, AD-5, AD-21, AD-28
**Notes for the developer:**
- Touches `apps/commerce/src/modules/design-attributes`, `apps/commerce/src/modules/price-history`, `apps/commerce/src/workflows/publish-design`, `apps/commerce/src/admin`.
- The rule that a Design needs a Weaver is added to `publish-design` in Epic 2, when Weavers exist (FR-57); colour, occasion tags, zari, place woven and claims with evidence (FR-38) are also added there.
- Stock is set in Story 1.7; the Shopper's page and the Owner's preview are in Story 1.8.
- A Design has exactly one Variant in this epic (FR-35 is Epic 2).
- Admin page is behaviour only; styled from DESIGN.md when it exists.

### Story 1.7: Owner sets and adjusts stock in Pieces

As an Owner,
I want to set and adjust how many Pieces of a Variant are in stock and see why the number changed,
So that the shop never shows a saree I do not have.

**Acceptance Criteria:**

**Given** a Design from Story 1.6
**When** the Owner sets its stock to 10 Pieces on the shop's stock page
**Then** the `adjust-stock` workflow takes the Redis lock on the inventory item, sets the stocked quantity to 10 and writes one stock-movement row
**And** the row records the time, the cause "manual adjustment", the change, the Owner's email and the reason she typed

**Given** the `stock-ledger` module is created
**When** the Owner opens a Variant's stock history
**Then** she sees every stock-movement row for it, newest first, with time, cause, change and who made it
**And** no route edits or deletes a row

**Given** two adjustments of +1 sent at the same moment
**When** both finish
**Then** the stocked quantity has risen by 2 and there are two rows

**Given** a Variant with 3 Pieces stocked and 2 reserved
**When** the Owner tries to set stock to 1
**Then** the change is refused with the code `stock.below_reserved` and nothing changes

**Given** the lock cannot be taken within its time limit
**When** an adjustment is attempted
**Then** it fails with a stable error code, the quantity is unchanged and no row is written

**Given** the stock-movement row cannot be written
**When** `adjust-stock` runs
**Then** its compensation restores the earlier quantity

**Given** the kernel's own routes for editing stock levels
**When** they are called
**Then** they are refused under Story 1.4

**Requirements:** FR-36; AD-4, AD-6, AD-21
**Notes for the developer:**
- Touches `apps/commerce/src/modules/stock-ledger`, `apps/commerce/src/workflows/adjust-stock`, `apps/commerce/src/admin`.
- Available = stocked − reserved (AD-6); nothing reserves yet, so reserved is 0 until Story 1.9.
- Seed the kernel's single stock location here.
- Later stock workflows reuse the same lock helper and the same row shape; write tests for success, each failure and compensation.

### Story 1.8: Shopper opens the Design and puts it in her cart

As a Shopper,
I want to open the Design, see what it is and what it costs, and put it in a cart,
So that I can decide to buy it.

**Acceptance Criteria:**

**Given** a published Design with stock
**When** a Shopper who is not signed in opens the website
**Then** the home page shows a plain list of published Designs from `/store/shop/designs`, each a `DesignCard` view model created in this story, with no filters and no search
**And** an unpublished Design is not in that list and its page returns not found

**Given** a published Design
**When** the Shopper opens its page
**Then** she sees its photos, its price as a whole number of rupees with no paise and a statement that the price includes tax, its description, and its fibre, weave, length and width in metres, blouse piece, care and country of origin
**And** she sees its stock status, computed by the server: available, or sold out
**And** a Design with no Pieces in stock is shown as sold out with adding to cart disabled, not hidden

**Given** the Owner is signed in to the Admin
**When** she asks for a preview of an unpublished Design
**Then** she gets a link with a signed token that shows the same page a Shopper would see
**And** the link stops working when the token expires

**Given** an available Design
**When** the Shopper adds it to her cart, changes the quantity and removes it
**Then** each change is made through `packages/api-client` and the cart view model shows lines, tax-inclusive line prices and a total computed by the server
**And** the client formats amounts and never computes them

**Given** a Variant with 2 Pieces available
**When** the Shopper asks for a quantity of 3
**Then** the change is refused with a stable error code and the cart keeps its earlier quantity

**Given** a Shopper with a cart
**When** she closes the browser and returns
**Then** her cart is as she left it

**Given** the cart page
**When** it is shown
**Then** the shipping charge is shown before checkout begins; in this epic it is one seeded shipping option with a charge of Rs 0

**Requirements:** FR-3 (first version), FR-16 (first version); AD-2, AD-5, AD-21, AD-28
**Notes for the developer:**
- Touches `apps/commerce/src/api/store/shop/designs`, `packages/contracts` and `packages/api-client` (`DesignCard` for the list, `DesignView`, `CartView`), `apps/web`. Stories 1.28 and 2.15 extend `DesignCard`; they do not create it again.
- Kernel cart routes used here are added to the allow-list; cart completion stays off it.
- Left for Epic 2: Weaver, delivery estimate, maker's address and terms, the Full saree view and Try-on entry points, filters and search. Left for Epic 3: the same cart on a Shopper's other devices, and the shipping charge rule.
- Screens are behaviour only; styled from DESIGN.md when it exists.

### Story 1.9: Begin checkout: snapshot and Hold

As a Shopper,
I want the Pieces in my cart held for me from the moment I start to pay,
So that nobody else can buy them while I am paying.

**Acceptance Criteria:**

**Given** a Shopper with a cart who is not signed in
**When** she starts checkout
**Then** she is asked to sign in or sign up first, and her cart is kept

**Given** a signed-in Shopper who has entered her name, mobile number, address, pincode and state
**When** she begins checkout
**Then** the `begin-checkout` workflow, under the Redis lock on every inventory item in the cart, creates a Checkout with a snapshot of the lines, unit prices, tax per line, shipping charge, total and address
**And** it creates a Hold with the Checkout id and an expiry 15 minutes later, the length coming from a setting seeded in this story
**And** it creates kernel reservations tagged with the Hold id and writes one stock-movement row per change

**Given** `begin-checkout` has created a Checkout
**When** the workflow finishes
**Then** it has written the Checkout snapshot (items, quantities, prices, tax, address, Shopper id) as a recovery file in the private, versioned `documents` bucket, created in this story, keyed by the Checkout id (AD-30)
**And** if the file cannot be written the workflow fails, its compensation removes the reservations, the Hold and the Checkout, and no payment can be started
**And** the file's contents and address appear in no log

**Given** the last Piece of a Variant and two Shoppers who begin checkout at the same moment
**When** both requests finish
**Then** exactly one has a Hold
**And** the other receives the code `stock.unavailable` and is told the saree is unavailable for now, before any payment is started

**Given** a Design whose last Piece is on Hold
**When** another Shopper opens its page
**Then** its stock status is "unavailable for now", not sold out, and it cannot be added to a cart

**Given** a cart line whose price has changed or whose Pieces have sold out since the Shopper last saw the cart
**When** she begins checkout
**Then** no Hold is created, the response has the code `cart.changed` with each changed line, and she must accept the change before she can begin again

**Given** a cart with a live Hold
**When** anyone tries to add, change or remove a line
**Then** the change is refused with the code `cart.locked`
**And** a second `begin-checkout` for the same cart returns the existing Checkout and creates no second Hold

**Given** a Checkout with a live Hold
**When** the Shopper cancels checkout
**Then** the `release-hold` workflow removes the Hold's reservations under the lock, writes the stock-movement rows, and the cart can be changed again

**Given** a Hold whose 15 minutes have passed
**When** the kernel's scheduled job for expired Holds next runs (every minute)
**Then** it runs `release-hold`, the Pieces return to stock and the Checkout is marked expired

**Given** a cart with two lines where the second cannot be reserved
**When** `begin-checkout` fails
**Then** its compensation removes the first line's reservation and no Hold or Checkout remains

**Given** the checkout screen
**When** it is shown
**Then** it shows the snapshot total and the time the Hold ends, taken from the server

**Requirements:** FR-19 (Hold, last Piece, flagged changes), FR-16 (cart locked during a Hold), NFR-4, NFR-8; AD-4, AD-6, AD-13, AD-22, AD-30
**Notes for the developer:**
- Touches `apps/commerce/src/modules/hold` and `checkout`, `apps/commerce/src/workflows/begin-checkout` and `release-hold`, `apps/commerce/src/jobs`, `apps/commerce/src/api/store/shop/checkouts`, `infra/` (the `documents` bucket), and the checkout screen in `apps/web`.
- The recovery file is what lets a restore rebuild an Order with its original numbers; Story 1.10 adds the Order id to it, Story 1.13 the invoice number, and Stories 1.12 and 1.25 read it.
- No payment is started in this story; Story 1.10 adds the payment step to `begin-checkout`.
- The delivery check by pincode (FR-17) is Epic 3; here the address is only recorded.
- The time shown is the true end of the Hold; it must not be styled as pressure (NFR-13).

### Story 1.10: Pay with Razorpay; the Order is created from the webhook

As a Shopper,
I want to pay by UPI, card or netbanking and have my Order confirmed by the shop's server,
So that I am charged exactly once and only for a saree that is mine.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is finished
**Then** it holds the Order states Paid, Packed, Dispatched, Out for delivery, Delivered, Delivery failed, Returned to shop, Cancelled and Refunded as an enum, with a table of allowed transitions (AD-24)
**And** the `order-state` module, created in this story, stores an Order's state, and no state is written that the enum does not hold

**Given** the Razorpay payment provider is added to commerce and the starter's card-payment provider is removed
**When** a Shopper begins checkout
**Then** `begin-checkout` also creates a payment for exactly the snapshot total in paise in Razorpay test mode, tied to the Checkout id
**And** if creating the payment fails, compensation releases the Hold and the Shopper is told she has not been charged

**Given** a Checkout with a live Hold
**When** the Shopper continues
**Then** the website opens the payment service's own payment screen, which offers UPI, card and netbanking and no cash on delivery
**And** the website has no field for a card number and stores none

**Given** the payment service's webhook for a captured payment
**When** it arrives at the kernel's built-in payment hook route with a valid signature
**Then** the provider verifies the signature, never reports the payment as pending, and a subscriber starts the `confirm-payment` workflow
**And** a webhook with an invalid signature is refused and changes nothing

**Given** a verified payment whose amount equals the snapshot total and whose Hold is live
**When** `confirm-payment` runs
**Then** inside one lock it releases the Hold's reservations and completes the cart into an Order
**And** afterwards the reserved quantity for each Variant equals the quantity ordered, not double, and available stock is unchanged from before the payment, proving spike item 1
**And** the Order's state is stored as Paid by the `order-state` module, created in this story, and stock-movement rows are written
**And** the Order id is added to the Checkout's recovery file in the `documents` bucket (AD-30)

**Given** the cart-completion route is blocked for clients (Story 1.4)
**When** `confirm-payment` completes the cart on the server
**Then** the Order is created, proving the second half of spike item 2

**Given** the same webhook delivered twice, or two deliveries at the same moment
**When** both are processed
**Then** there is one Order and one charge, because `confirm-payment` is idempotent on the Checkout id

**Given** a verified payment whose amount differs from the snapshot total
**When** `confirm-payment` runs
**Then** no Order is created, the whole captured amount is refunded automatically, the Hold is released and the Checkout is marked as refunded automatically
**And** a second capture for a Checkout that already has an Order is refunded automatically and the Order is unchanged

**Given** the Shopper returns from the payment screen
**When** the website asks for the Checkout's status
**Then** the status comes only from the server, and nothing the client sends can create an Order
**And** once the Order exists she sees a confirmation with her Order number

**Given** the Razorpay adapter
**When** its contract tests run against Razorpay test mode
**Then** creating a payment, verifying a signature and starting a refund all pass, and the tests are part of the checks run before a release

**Requirements:** FR-18, FR-19 (confirmed twice), NFR-4, NFR-11; AD-4, AD-6, AD-7, AD-24, AD-30; spike items 1 and 2
**Notes for the developer:**
- Touches `apps/commerce/src/providers/razorpay` (Razorpay Node SDK 2.9.8), `apps/commerce/src/workflows/confirm-payment`, `apps/commerce/src/subscribers`, `apps/commerce/src/modules/order-state`, `packages/contracts` (the Order state enum and transition table), and the checkout screens in `apps/web`.
- If spike item 1 or 2 fails (the Hold cannot be released and the cart completed in one lock without double-reserving, or the server-side completion stops working once the route is blocked), stop and report with the failing test; the spine names no fallback, and no workaround may leave two sets of reservations or open the route to clients.
- Locally a webhook is a test-mode payload signed with the test secret; the round trip from the payment service itself is exercised on staging in Story 1.24.
- Failed, pending and late payments are Story 1.11; the invoice is Story 1.13.
- The payment screen is the payment service's own, the one direct vendor call AD-2 allows a client.

### Story 1.11: Failed, pending and late payments

As a Shopper,
I want a payment that fails, stalls or arrives late to end either in an Order or in my money back,
So that I never pay for a saree I do not get.

**Acceptance Criteria:**

**Given** a Checkout with a live Hold
**When** the payment fails or the Shopper closes the payment screen without paying
**Then** `release-hold` runs, the cart is as it was before checkout, and she is told she has not been charged

**Given** a Checkout whose payment has not yet been confirmed and whose Hold is live
**When** the Shopper looks at its status
**Then** it is shown as pending, not as an Order and not as failed

**Given** a payment confirmed after its Hold has ended and the Pieces are still free
**When** `confirm-payment` runs
**Then** it reserves the Pieces and creates the Order in state Paid inside the same lock, with stock-movement rows

**Given** a payment confirmed after its Hold has ended and the Pieces are no longer free
**When** `confirm-payment` runs
**Then** no Order is created and a full refund to the payment method used is started automatically within 5 minutes of the webhook
**And** the Checkout's status shows "refunded automatically" with the amount and the time
**And** the event `payment.auto-refunded` is recorded and logged, without personal data, with the Checkout id and the time; no message is sent in this epic

**Given** the last Piece, a late confirmed payment from one Shopper and a `begin-checkout` from another at the same moment
**When** both finish
**Then** exactly one of them has the Piece: either the first has an Order and the second receives `stock.unavailable` before paying, or the second has a Hold and the first is refunded automatically

**Given** an automatic refund that the payment service refuses or does not answer
**When** the workflow finishes
**Then** the Checkout is marked refund pending, the kernel's scheduled job `retry-pending-refunds`, created in this story, retries it, and no second refund is ever created for the same payment

**Given** a failed-payment event delivered twice
**When** both are processed
**Then** the Hold is released once and stock-movement rows are not duplicated

**Requirements:** FR-18 (failed and pending payments), FR-19 (payment after the Hold ended), NFR-4; AD-6, AD-7
**Notes for the developer:**
- Touches `apps/commerce/src/workflows/confirm-payment` and `release-hold`, `apps/commerce/src/jobs` (the new `retry-pending-refunds` job, which only starts a workflow), the Checkout status view model, and the status screen in `apps/web`.
- The spine's Checkout and Hold state diagram is the specification; test every arrow.
- The message to the Shopper for an automatic refund (FR-19 "messaged within 5 minutes", FR-54) is delivered from Epic 3 onward: Story 3.20 subscribes to `payment.auto-refunded`. In this epic the event is recorded and logged and the Shopper sees the refund on the Checkout status screen.
- Test with a controllable clock; do not wait 15 minutes in tests.

### Story 1.12: Daily reconciliation of payments and Orders

As an Owner,
I want payments and Orders compared every day,
So that no payment is left without an Order or a refund, and no Order without a payment.

**Acceptance Criteria:**

**Given** the kernel's scheduled job for reconciliation
**When** it runs after the end of a business day in the business time zone
**Then** it fetches that day's captured payments and refunds from the payment service and compares them with Orders and automatic refunds
**And** it writes one reconciliation record, an entity of the `checkout` module, with the date, the counts and every difference

**Given** a day on which every captured payment has exactly one Order or one full automatic refund, and every Order has a captured payment equal to its snapshot total
**When** the job runs
**Then** the record shows no unexplained difference

**Given** a captured payment with neither an Order nor a refund, because its webhook never arrived
**When** the job runs
**Then** it starts `confirm-payment` for that payment, which creates the Order or refunds it by the rules of Stories 1.10 and 1.11
**And** the record shows the payment as found and resolved

**Given** a captured payment whose Checkout is not in the database, as after a restore
**When** the job runs
**Then** it rebuilds the Checkout from its recovery file in the `documents` bucket and starts `confirm-payment`, so the Order has the items, prices, tax and address of the snapshot, and the Order id already written in the file is used again (AD-30)
**And** a captured payment with no recovery file is listed as an unexplained difference and nothing is created for it

**Given** an Order with no captured payment, or with a payment of a different amount
**When** the job runs
**Then** the record lists it as an unexplained difference and it is logged at error level without personal data

**Given** the job is run twice for the same day
**When** the second run finishes
**Then** no Order, refund or record is duplicated

**Given** the payment service cannot be reached
**When** the job runs
**Then** the run is recorded as failed and retried, and the day is never shown as clean

**Given** the Owner opens the shop's reconciliation page in the Admin
**When** she looks at it
**Then** she sees each day's record and any unexplained difference linked to its Order or payment

**Requirements:** NFR-4; AD-4, AD-7, AD-17 (rebuilding a missing Order), AD-30
**Notes for the developer:**
- Touches `apps/commerce/src/jobs` (reconciliation), the `checkout` module (the reconciliation record), the Razorpay adapter (listing payments and refunds), `apps/commerce/src/admin`.
- Invoices do not exist yet. Story 1.13 adds the invoice number to the recovery file and tests that a rebuilt Order takes that number again; Story 1.25 rehearses it.
- The job only starts workflows; it does not write Orders itself (AD-4).
- The alert to the Owner by message (NFR-9) is Epic 7; here a difference is on the Admin page and in the error log.
- Add a contract test for listing payments against Razorpay test mode (NFR-11).

### Story 1.13: Shopper sees her Order and its tax invoice

As a Shopper,
I want to see my Order, its state and its tax invoice after paying,
So that I know what I bought and what tax I paid.

**Acceptance Criteria:**

**Given** the Order state enum and transition table that Story 1.10 put in `packages/contracts`
**When** an Order is returned to a client
**Then** the `OrderView` view model carries the state from that enum, named as in the Glossary
**And** the server stores and returns the state; no client derives it

**Given** a signed-in Shopper with an Order
**When** she opens her Orders and then one Order
**Then** she sees the Order number, the items, the amount paid and the state as named in the Glossary
**And** another Shopper asking for the same Order gets not found

**Given** `confirm-payment` creates an Order
**When** the `invoice` module, created in this story, issues the invoice in the same workflow
**Then** the invoice is built from the Checkout snapshot and shows, for each item, its tax code, taxable value and tax exact to the paisa, and the state whose tax applies
**And** it shows the seller's legal name, address and tax registration from settings seeded in this story
**And** the lines add up to the amount paid

**Given** invoices issued in one financial year, in the business time zone
**When** their numbers are compared
**Then** they are gapless and have no duplicates: each comes from one counter row for invoices for that year, locked and incremented in the same transaction that creates the invoice record, not from a database sequence (AD-25)
**And** 20 Orders created at the same moment get 20 consecutive numbers
**And** an Order paid at 23:59 on 31 March and one paid at 00:00 on 1 April, business time, are numbered from different years' counter rows
**And** the invoice number is written to the Checkout's recovery file in the `documents` bucket (AD-30)

**Given** a Checkout whose recovery file already holds an invoice number, rebuilt after a restore
**When** its invoice is issued again
**Then** it takes the number in the file, the counter is not incremented for it, and the counter is never below the highest number issued

**Given** an issued invoice
**When** any route or service method tries to change it
**Then** there is none that can; the record is never edited

**Given** a webhook delivered twice
**When** both are processed
**Then** there is one invoice

**Given** the invoice step fails
**When** `confirm-payment` is tested with that failure forced
**Then** the outcome is either a retry that succeeds or an automatic refund, never an Order without an invoice
**And** a failed attempt rolls back the counter increment with the record, so it leaves no gap

**Given** the Order page
**When** it is shown
**Then** the invoice number and its lines appear on it

**Requirements:** FR-20 (first version), FR-21 (first version); AD-5, AD-13, AD-19, AD-24, AD-25, AD-30
**Notes for the developer:**
- The counter is a table row per document type and financial year in the `invoice` module; take a row lock on it inside the transaction that inserts the invoice.
- Touches `apps/commerce/src/modules/invoice`, `apps/commerce/src/api/store/shop/orders`, `packages/contracts` and `packages/api-client` (`OrderView`), and the Order pages in `apps/web`.
- The financial year runs from 1 April to 31 March in the business time zone; hold the start month as a setting.
- Two invoice lines for a saree with a stitched blouse (FR-20) depend on FR-37 and are Epic 2. The invoice file is Story 1.14. The confirmation message (FR-54) is Epic 3.
- Only the transition into Paid exists so far; later stories add one workflow per transition.

### Story 1.14: Invoice file rendered by the shop worker

As a Shopper,
I want to download my tax invoice as a file,
So that I have a record of my purchase.

**Acceptance Criteria:**

**Given** `apps/worker` is created and added to the compose file
**When** it starts
**Then** it consumes one BullMQ queue with the prefix `shop`, at BullMQ 6.7.6, exposes a health route, and has no connection to the `commerce` database
**And** the kernel's own queues are not used for shop jobs

**Given** an invoice has been issued
**When** the workflow enqueues `invoice.render`
**Then** the job's name and payload are defined in `packages/contracts` and its id is derived from the invoice id
**And** only a commerce workflow enqueues it and only the worker consumes it

**Given** the worker takes an `invoice.render` job
**When** it runs
**Then** it reads the invoice from `/internal/*` on commerce with a service token, renders the file with PDFKit, stores it in the private, versioned `documents` bucket created in Story 1.9, and reports the file to commerce through `/internal/*`
**And** that internal route starts a workflow that records the file against the invoice

**Given** the same job runs twice
**When** both runs finish
**Then** the invoice has one file and its content is the same

**Given** the worker is stopped when an Order is paid
**When** the Shopper opens her Order
**Then** the Order and invoice details are there and the file is shown as being prepared
**And** when the worker starts again the file appears without anyone acting

**Given** the Shopper asks to download her invoice
**When** commerce answers
**Then** it gives a short-lived signed link to the file, and another Shopper cannot get a link to it

**Given** a request to `/internal/*`
**When** it comes from outside the private network through Caddy, or without a service token, or with a Shopper's or an admin's token
**Then** it is refused

**Given** the worker's logs and job results
**When** they are inspected
**Then** they contain no name, address, mobile number, link or token

**Requirements:** FR-20 (invoice file); AD-1, AD-8, AD-9, AD-15, AD-16, AD-22, AD-25
**Notes for the developer:**
- Touches `apps/worker` (new), `apps/commerce/src/api/internal`, `infra/` (compose service, Caddy rule), and one link on the Order page in `apps/web`.
- The invoice file is a PDF rendered with PDFKit (`pdfkit` 0.21.0, spine Stack); check that it builds on ARM64 and x86-64.
- Sending the invoice by message (FR-54) is Epic 3.
- Other worker jobs (`message.send`, `tiles.build`, `tryon.generate`) are created by the epics that need them.

### Story 1.15: Owner finds an Order, packs it and creates its shipping label

As an Owner,
I want to find an Order, mark it Packed and create its shipping label,
So that the parcel is ready to hand over and I never retype an address.

**Acceptance Criteria:**

**Given** the Owner opens the shop's Orders page in the Admin
**When** she filters by state or searches by Order number or mobile number
**Then** she sees the matching Orders and can open one to see its items, address and state

**Given** an Order in state Paid
**When** the Owner marks it Packed and then creates a shipping label
**Then** the Order moves to Packed through that transition's workflow, and the shipping adapter creates a shipment in the shipping service's test mode from the Order's address, with nothing retyped
**And** the label file and tracking number are stored against the Order and the Owner can print the label

**Given** label creation fails at the shipping service
**When** the Owner sees the error and tries again
**Then** the Order is still Packed and at most one shipment exists for the Order

**Given** an Order that is not in state Paid
**When** the Owner tries to mark it Packed
**Then** the request is refused by the transition table of Story 1.10 and the state does not change

**Given** the shipping adapter
**When** its contract test for creating a shipment runs against the shipping service's test mode
**Then** it passes, and the test is part of the checks run before a release

**Requirements:** FR-47 (first version), NFR-11; AD-4, AD-14, AD-24; Consistency Conventions (Vendors)
**Notes for the developer:**
- Touches `apps/commerce/src/providers/shipping` (the port and one adapter), the Paid→Packed transition workflow, `apps/commerce/src/admin` (Orders page).
- The shipping service is undecided in the PRD (Open Question 2: the founder's existing provider first). Write the port first, with workflow tests against recorded test-mode responses. If the founder has not named the service or given test-mode credentials when this story starts, stop and report.
- The label file goes in the `documents` bucket.
- Dispatch and the stock change are Story 1.16; tracking events are Story 1.17.
- Admin page is behaviour only; styled from DESIGN.md when it exists.

### Story 1.16: Owner dispatches an Order and its Pieces leave stock

As an Owner,
I want to mark a packed and labelled Order as Dispatched,
So that the saree is on its way and my stock count shows it has left the shop.

**Acceptance Criteria:**

**Given** an Order that is Packed and has a tracking number
**When** the Owner marks it Dispatched
**Then** the `fulfil-order` workflow, under the lock, reduces the stocked quantity, removes the Order's reservation, writes stock-movement rows with the cause "sale", and sets the state to Dispatched
**And** an Order without a tracking number cannot be marked Dispatched

**Given** the Owner presses Dispatched twice, or the request is sent twice
**When** both are processed
**Then** the stocked quantity is reduced once and the stock-movement rows are not duplicated

**Given** the stock-movement row cannot be written
**When** `fulfil-order` runs
**Then** its compensation restores the stocked and reserved quantities and the Order stays Packed

**Given** an Order that has been Dispatched
**When** the Shopper opens her Order page
**Then** she sees the state Dispatched and the tracking number

**Requirements:** FR-21 (first version), FR-47 (first version), FR-36; AD-4, AD-6, AD-14, AD-24
**Notes for the developer:**
- Touches `apps/commerce/src/workflows/fulfil-order`, the Orders page in `apps/commerce/src/admin`, and the Order page in `apps/web`.
- `fulfil-order` is one of the stock workflows AD-6 names; reuse the lock helper and row shape of Story 1.7 and test success, each failure and compensation.
- Tracking events after dispatch are Story 1.17. Cancelling before dispatch (FR-22) is Epic 3.

### Story 1.17: Tracking events from the shipping service move the Order

As a Shopper,
I want my Order's state to follow the parcel as the shipping service reports it,
So that I can see where my saree is without asking anyone.

**Acceptance Criteria:**

**Given** a tracking event from the shipping service
**When** it arrives at `/webhooks/shipping` and passes the adapter's verification
**Then** the one mapping table in the shipping adapter turns it into a transition to Out for delivery, Delivered, Delivery failed or Returned to shop, performed by that transition's workflow
**And** the Shopper's Order page shows the new state and the tracking number without the Owner acting

**Given** the same event delivered twice, an event the transition table does not allow from the current state, or an event type the mapping table does not know
**When** it is processed
**Then** the state does not change and the event is recorded

**Given** an event that fails verification
**When** it arrives
**Then** it is refused and nothing changes

**Given** an Order becomes Delivered
**When** the transition is recorded
**Then** the delivery time is stored, in UTC

**Given** an Order in Delivery failed
**When** the Shopper opens it
**Then** she is told what happens next, and when the shipping service reports it back at the shop the Order moves to Returned to shop

**Given** the shipping adapter
**When** its contract test for reading an event runs against the shipping service's test mode
**Then** it passes, and the test is part of the checks run before a release

**Requirements:** FR-21 (first version), NFR-11; AD-4, AD-24; Consistency Conventions (Vendors)
**Notes for the developer:**
- Touches `apps/commerce/src/providers/shipping` (event verification and the mapping table), the four transition workflows, `apps/commerce/src/api/webhooks`, and the Order page in `apps/web`.
- The mapping table lives in the shipping adapter and nowhere else (AD-24).
- The inspection of an Order in Returned to shop is Story 1.19 and its full refund is Story 1.21.

### Story 1.18: Shopper requests a Return and books a pickup

As a Shopper,
I want to ask to return a delivered saree, say why and book a pickup,
So that I can send back a saree that disappointed me.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is finished
**Then** it holds the Return states Requested, Pickup booked, Picked up, Received, Accepted, Rejected and Refunded as an enum with a table of allowed transitions, and one workflow performs each transition; the two the Shopper starts are named `request-return` and `book-return-pickup`, and Story 3.15 extends them

**Given** an Order in state Delivered, within the return period of 7 days from delivery, the period coming from a setting seeded in this story
**When** the Shopper requests a Return for an item and picks the reason "Not as shown" or "Defective or wrong item"
**Then** a Return is created in state Requested
**And** she is shown that return shipping for these reasons is free

**Given** a Return in state Requested
**When** the Shopper books a pickup
**Then** the shipping adapter books a return pickup in the shipping service's test mode from the Order's address, and the Return moves to Pickup booked
**And** if the booking fails the Return stays Requested and she can try again without a second pickup being booked

**Given** an Order delivered 8 days ago, counted in days of the business time zone
**When** the Shopper requests a Return
**Then** it is refused with the code `return.period_ended`

**Given** an Order that is not Delivered, or an item that already has a Return
**When** the Shopper requests a Return
**Then** it is refused with a stable error code

**Given** a pickup event from the shipping service
**When** it arrives at `/webhooks/shipping`
**Then** the adapter's mapping table moves the Return to Picked up
**And** a repeated event changes nothing

**Given** the returned saree arrives at the shop
**When** the Owner marks the Return Received on the Orders page
**Then** the Return moves to Received and available stock does not change

**Given** a Return in any state
**When** the Shopper opens her Order, or the Owner opens it in the Admin
**Then** each sees the Return's state as named in the Glossary

**Requirements:** FR-23 (first version), FR-47 (Returns); AD-13, AD-19, AD-24
**Notes for the developer:**
- Touches `apps/commerce/src/modules/order-state` (the Return record and state), the Return transition workflows, the shipping adapter (return pickup), `apps/commerce/src/api/store/shop/orders`, the Order page in `apps/web` and the Orders page in `apps/commerce/src/admin`.
- Only the two always-accepted reasons are offered in this epic; other reasons, the conditions for worn items and showing the return period on the Design page and at checkout are Epic 3.
- Inspection and restock are Story 1.19; the refund is Stories 1.20 and 1.21.
- Screens are behaviour only; styled from DESIGN.md when it exists.

### Story 1.19: Owner inspects a returned saree and restocks a sound Piece

As an Owner,
I want to record what I found when a returned saree arrives and put a sound Piece back in stock,
So that stock stays true and nothing is sold again before I have looked at it.

**Acceptance Criteria:**

**Given** a Return in state Received
**When** the Owner records the inspection as accepted and sellable, accepted and damaged, or rejected with a reason
**Then** the Return moves to Accepted or Rejected and the inspection result, the Owner's email and the time are stored
**And** a rejected Return shows the Shopper the reason

**Given** an inspection result of sellable or damaged for a Piece
**When** the `restock-return` workflow runs with that result
**Then** for a sellable Piece it raises the stocked quantity by one under the lock and writes a stock-movement row with the cause "Return"
**And** for a damaged Piece it leaves the stocked quantity unchanged and writes a stock-movement row with the cause "Return, damaged", so the Piece is not returned to stock and the count can still be explained (AD-6)
**And** no Piece is sellable again before the Owner has recorded an inspection

**Given** the same inspection is recorded twice, or `restock-return` is retried
**When** both runs finish
**Then** the stocked quantity has changed once and there is one stock-movement row

**Given** the stock-movement row cannot be written
**When** `restock-return` runs
**Then** its compensation restores the earlier stocked quantity

**Given** an Order in state Returned to shop
**When** the Owner records the inspection of its Pieces
**Then** `restock-return` runs with each result in the same way, so sound Pieces are restocked only after inspection and damaged ones are not

**Requirements:** FR-25, FR-47 (inspection result), FR-36; AD-4, AD-6, AD-14
**Notes for the developer:**
- Touches `restock-return` in `apps/commerce/src/workflows`, the Return transition workflows for Accepted and Rejected, and the Orders page in `apps/commerce/src/admin`.
- `restock-return` is the only workflow that writes a stock-movement row for a returned or undelivered Piece, sellable or damaged (AD-6); it takes the inspection result as input.
- The refund for an Accepted Return is Story 1.20; the refund for an Order in Returned to shop is Story 1.21. Until those stories, an Accepted Return simply waits.
- Inspection photos (files in the `documents` bucket linked to the Return) and sending a rejected item back are Epic 3 (FR-47, FR-23; AD-31).

### Story 1.20: An accepted Return is refunded to the payment method used, with a credit note

As a Shopper,
I want my money returned to the payment method I used once my Return is accepted,
So that I am not out of pocket for a saree I sent back.

**Acceptance Criteria:**

**Given** a Return becomes Accepted
**When** the refund workflow `refund-order` runs
**Then** it starts a refund through the payment service to the payment method the Shopper used, for the amount she paid for that item including tax, with an idempotency key derived from the Return id
**And** the `invoice` module issues a credit note linked to the original invoice, reversing the item's taxable value and tax to the paisa, with a gapless number from the credit-note counter row for that financial year, locked and incremented in the same transaction (AD-25)
**And** once the payment service accepts the refund the Return moves to Refunded, and the Shopper sees the refund amount and when it was started
**And** the Order moves to Refunded only when the total refunded for the Order equals the total paid; any smaller total is recorded against the Return and the Order keeps its state (AD-31)

**Given** the Owner presses refund twice, or the workflow is retried
**When** both runs finish
**Then** there is one refund and one credit note

**Given** the payment service refuses or does not answer the refund
**When** the workflow ends
**Then** the Return stays Accepted, and the Admin shows the date by which the refund must start, 2 working days after acceptance, and marks it overdue after that date; working days are Monday to Saturday in the business time zone, excluding the holidays listed in settings
**And** a later retry does not create a second refund

**Given** the kernel's own refund and payment routes
**When** they are called directly
**Then** they are refused under Story 1.4

**Given** a credit note
**When** it is issued
**Then** the worker renders its file through `invoice.render` into the `documents` bucket, and the Shopper can download it from her Order

**Requirements:** FR-24, FR-48 (first version), NFR-4; AD-4, AD-7, AD-21, AD-25, AD-31; Consistency Conventions (Working days)
**Notes for the developer:**
- Touches the refund workflow `refund-order` in `apps/commerce/src/workflows`, the `invoice` module (credit note and its counter row), `apps/commerce/src/admin`, the Order page in `apps/web`; the worker change is limited to accepting the credit-note document type.
- Seed two settings here: working days (Monday to Saturday) and the list of holidays (empty). The Admin page to edit them is Story 3.7.
- "Refunded" for an Order is decided by amounts, not by items: the sum of the Order's refunds equals the amount paid (AD-31). Put that test in one function that every refund path calls.
- Add the refund to the Razorpay contract tests if Story 1.10's test does not already cover a refund of part of a payment.

### Story 1.21: Owner refunds part of an Order, and an undelivered Order in full

As an Owner,
I want to refund any amount up to what a Shopper paid, and the whole amount when her parcel came back undelivered,
So that I can put things right whatever went wrong.

**Acceptance Criteria:**

**Given** an Order in state Returned to shop
**When** the Owner records its inspection (Story 1.19)
**Then** the same `refund-order` workflow refunds the whole amount paid, including any shipping charge, with a credit note, and the Order moves to Refunded because the total refunded equals the total paid

**Given** any Order
**When** the Owner refunds part of it from the Orders page
**Then** the amount can be anything up to what was paid less what was already refunded, a reason is required, a credit note is issued, and a larger amount is refused with the code `refund.exceeds_paid`
**And** the refund is recorded against the Order and the Order keeps its state while the total refunded is below the total paid (AD-31)

**Given** an Order paid Rs 2,100 with one earlier part refund of Rs 1,000
**When** the Owner refunds a further Rs 1,100
**Then** the total refunded equals the total paid and the Order moves to Refunded (AD-31)
**And** no further refund can be made for it

**Given** the Owner submits the same part refund twice, or the workflow is retried
**When** both runs finish
**Then** there is one refund and one credit note

**Given** the payment service refuses a part refund
**When** the workflow ends
**Then** no credit note is issued, the amount that can still be refunded is unchanged, and the Owner sees that the refund did not start

**Requirements:** FR-48 (first version), FR-24, FR-21 (an undeliverable Order is refunded in full), NFR-4; AD-4, AD-7, AD-14, AD-25, AD-31
**Notes for the developer:**
- Touches `refund-order` in `apps/commerce/src/workflows` and the Orders page in `apps/commerce/src/admin`.
- Reuses the refund-to-source step, the credit note and the "total refunded equals total paid" function of Story 1.20; do not write a second refund path.
- Payment disputes (records of the `checkout` module) are Epic 3 (FR-48; AD-31).
- Story 3.12 later starts the refund for an Order in Returned to shop from the shipping event itself; the inspection recorded in Story 1.19 then governs only restocking.

### Story 1.22: Admin sign-in with an enforced second factor, and an audit trail

As an Owner,
I want the Admin to require my password and a second factor and to record every change I make,
So that nobody else can run my shop and every change can be traced.

**Acceptance Criteria:**

**Given** the Owner's admin account
**When** she signs in
**Then** she must give her password and a code from the kernel's built-in second factor

**Given** an admin account that has not enrolled a second factor
**When** it sends any admin request other than those needed to enrol
**Then** a middleware refuses it with the code `admin.second_factor_required`
**And** this applies to kernel admin routes and to `/admin/shop/*` alike

**Given** five wrong attempts on one account, by password or by code
**When** a sixth attempt is made within 15 minutes, even with the right password and code
**Then** it is refused and the account stays locked until 15 minutes have passed
**And** the lock is recorded

**Given** a lost second factor
**When** the documented recovery process in `docs/` is followed
**Then** the Owner regains access, and the process has been rehearsed once on the local stack with the date written into the document

**Given** the `shop-audit` module is created
**When** any state-changing admin request succeeds
**Then** one audit event is recorded with the actor's email, the time, the action, and the before and after values
**And** a test shows an event for each admin action built so far: creating and publishing a Design, adjusting stock, marking Packed and Dispatched, creating a label, marking Received, recording an inspection and refunding

**Given** audit events
**When** any route is searched for one that updates or deletes them
**Then** there is none

**Given** the Owner opens an Order, which shows a Shopper's name, address and mobile number
**When** the page loads
**Then** an access event is recorded with her email, the time and what was read, and not the data itself

**Given** the kernel's configuration
**When** it is inspected
**Then** none of the kernel's paid features for roles, single sign-on or audit is enabled

**Requirements:** FR-60, FR-36 (who made each change); AD-14, AD-15
**Notes for the developer:**
- Touches `apps/commerce/src/api/middlewares`, `apps/commerce/src/modules/shop-audit`, `docs/` (recovery process).
- The secrets that encrypt second factors are environment variables; list them in the secrets document that the restore script will use (Story 1.25).
- Deleting access events after one year (NFR-5) and the Owner's view of the audit trail are Epic 3 and Epic 4.
- The content admin is Story 1.23.

### Story 1.23: Content application behind the access gate

As an Owner,
I want the content admin running beside the shop and locked behind an extra gate,
So that the place where notices and screens will be edited is safe from its first day.

**Acceptance Criteria:**

**Given** `apps/content` is created as a Payload 3.94.2 application and added to the compose file
**When** the stack starts
**Then** content runs on Node.js 24 beside commerce and the worker, uses a database named `content` on the same Postgres server, migrates only that database, and exposes a health route
**And** content's database account has no rights on the `commerce` database, and a test proves a query to it fails

**Given** the Owner's content admin account, keyed by the same email as her commerce admin account
**When** she signs in to the content admin
**Then** she reaches it only through Caddy
**And** five wrong attempts lock the account for 15 minutes

**Given** spike item 7
**When** the developer tries to enforce a second factor on the content admin using only what Payload provides at the pinned version
**Then** if it can be enforced, an account without an enrolled second factor is refused, as in Story 1.22
**And** if it cannot, the content admin stays reachable only through an extra access gate at Caddy that asks for a separate credential before any content admin page is served, which is the fallback AD-15 names
**And** the outcome is recorded in `docs/`

**Given** the gate is in place
**When** a request for a content admin page arrives without the gate's credential
**Then** Caddy refuses it before it reaches content

**Given** a change made in the content admin, such as creating an admin account
**When** it succeeds
**Then** content records an audit event with the same shape as commerce's, in its own append-only collection, with the admin's email as the actor

**Given** the website
**When** its network requests are inspected
**Then** none goes to content; clients never call content directly

**Given** content
**When** its configuration is inspected
**Then** it has no scheduler

**Requirements:** AD-1, AD-3, AD-12 (no scheduler), AD-14, AD-15, AD-16; spike item 7 and the local part of spike item 3
**Notes for the developer:**
- Touches `apps/content` (new), `infra/` (compose service, Caddy gate, the `content` database).
- Create no content collections other than admin accounts and audit events; notices, policies and message templates are created by Epic 3 and screens by Epic 5. Story 3.1 extends this application (service calls to and from commerce, audit on every document collection); it does not create it again.
- Do not add a dependency the spine does not name to obtain a second factor; if Payload alone cannot do it, take the gate.
- If Payload does not run beside the kernel on Node.js 24, stop and report.

### Story 1.24: Deploy the slice to the staging server

As a builder,
I want the slice deployed to the staging server from continuous integration,
So that it is proven on the real ARM server with the vendors' test modes.

**Acceptance Criteria:**

**Given** a commit on the main branch whose checks all pass
**When** continuous integration runs
**Then** it builds ARM64 and x86-64 images for commerce, web, worker and content
**And** a commit with a failing check is not built for deployment

**Given** built images
**When** the deploy runs against the Oracle Cloud free ARM server
**Then** it runs each application's migrations on its own database before starting new containers, and then replaces the containers
**And** the server runs the same `infra/compose.yaml` as the local stack, with configuration only from environment variables

**Given** the deployed stack
**When** the health routes are checked
**Then** Caddy, commerce, web, worker, content, PostgreSQL 17 and Redis 8 are all healthy on Node.js 24 on ARM64, proving spike item 3
**And** if any unit cannot run there, stop and report which one and why

**Given** a migration fails, or a required environment variable is missing
**When** the deploy runs
**Then** the new containers are not started, the deploy is reported as failed and the earlier containers keep serving

**Given** staging
**When** its storage and network are inspected
**Then** files are in an object store reached through the S3 interface outside the server, not in the local AWS emulator
**And** Postgres and Redis are not reachable from the internet, `/internal/*` is refused at Caddy, and Caddy serves the site over TLS on a domain that comes from configuration and does not contain the product name

**Given** staging with the payment service and the shipping service in test mode
**When** a purchase is made by hand through the payment service's test payment screen
**Then** the payment service's own webhook reaches staging and the Order appears in state Paid with its invoice
**And** a test-mode tracking event from the shipping service moves the Order

**Given** the repository
**When** it is searched
**Then** it contains no secret, and `docs/` lists every secret the deployment needs by name

**Requirements:** NFR-11; AD-16; Consistency Conventions (Migrations, Config and secrets, Testing); spike item 3
**Notes for the developer:**
- Touches `infra/` (compose, Caddy, deploy script), continuous-integration configuration, and container files for the four applications.
- Staging runs vendor test modes only; no live keys.
- Backup and restore are Story 1.25; the size gate is Story 1.26.
- Record the server's CPU and memory allowance as found; the spine reports 2 CPUs and 12 GB for the whole account.

### Story 1.25: Continuous database backup and one rehearsed restore

As an Owner,
I want the database backed up continuously to another location and a restore rehearsed once,
So that losing the server does not lose paid Orders, invoices or the catalogue.

**Acceptance Criteria:**

**Given** staging
**When** pgBackRest is configured
**Then** Postgres ships its write-ahead log continuously and takes a full backup every night, for both the `commerce` and `content` databases, to object storage in a different location from the server
**And** the result of each nightly backup is recorded, and a failed one is logged at error level

**Given** an Order paid on staging
**When** 15 minutes have passed
**Then** the write-ahead log that contains it is in the backup location, shown by restoring to that time and finding the Order

**Given** a clean server, or the staging server after its volumes are destroyed
**When** the restore script in `infra/` is run by following its document alone
**Then** it rebuilds the whole system and the time taken is measured against the 4-hour target
**And** the document names every secret needed, including those that encrypt second factors

**Given** the restored system
**When** it is checked
**Then** the Owner signs in with her password and second factor, the Design, its stock-movement rows, the Order and its invoice are present, the invoice file downloads, and the next invoice issued takes the next number with no gap and no duplicate

**Given** a restore to a time just before an Order was paid, so that the Order is missing
**When** the restore script runs its last step, before the shop accepts Orders again
**Then** the reconciliation job of Story 1.12 rebuilds the Order from the payment service's records and the Checkout's recovery file in the `documents` bucket, with its original Order id and invoice number (AD-30)
**And** each invoice and credit-note counter is set to the highest number issued, read from the recovery files and the `documents` bucket, so the next number neither repeats nor skips one
**And** the invoice file already in the `documents` bucket under that number is kept, not rendered again or overwritten

**Given** the rehearsal is finished
**When** its record in `docs/` is read
**Then** it states the date, the time taken, the amount of data lost in minutes, and each step that failed or needed a manual fix
**And** it states that on the free hosting tier the 15-minute and 4-hour figures are targets under test, not promises

**Requirements:** NFR-8 (first version), NFR-4; AD-16, AD-17, AD-25, AD-30
**Notes for the developer:**
- Touches `infra/` (pgBackRest configuration, restore script), a counter-reset workflow in `apps/commerce`, and `docs/` (restore runbook, rehearsal record).
- The restore is not a routine task under NFR-10; it follows the written runbook in `docs/` and may use a command line.
- Backing up stored files (product photos, invoices, recovery files) to a second location, the quarterly rehearsal and alerts on a failed backup are Epic 7; here the files survive because object storage is outside the server.
- The backup location and its credentials are environment variables; no cloud vendor's SDK is added.
- If the free server cannot hold a second copy of the system for the rehearsal, restore onto the same server after destroying its volumes.

### Story 1.26: The size gate

As an Owner,
I want to know whether the free server can carry the shop at launch,
So that I choose production hosting on evidence before real payments run.

**Acceptance Criteria:**

**Given** staging with every container running
**When** the k6 load script in `infra/` is run
**Then** it simulates the launch load of the spine's test profile against the shop routes that `packages/api-client` calls: 100 published Designs with 10 Pieces each, 50 Shoppers browsing at once, and 5 Checkouts a minute each confirmed by a signed test-mode webhook, for 30 minutes, with a nightly backup running during the test `[ASSUMPTION: the 30-minute length and the backup running; the load figures are the spine's]`
**And** the 100 Designs are created by a seed script written in this story, which publishes each through `publish-design` and sets its stock through `adjust-stock`, and can be run again without creating duplicates
**And** the profile's third part, 2 Try-on jobs at once, cannot run before Try-on exists; Story 7.11 runs the whole profile and confirms or revises this decision
**And** the profile is a small number of named constants so the founder can change it and run the script again

**Given** the run
**When** it ends
**Then** the script reports, per container, peak memory and CPU, restarts, and for commerce the 95th-percentile time of the Design read and of `begin-checkout`
**And** it reports the count of failed Checkouts, of Orders without an invoice file and of Variants with more Pieces sold than stocked

**Given** the report
**When** the gate is judged
**Then** it holds only if no container restarted or was stopped for lack of memory, total peak memory stayed within the server's allowance, no Checkout failed for a reason other than stock, no Variant was oversold, and every Order has its invoice file `[ASSUMPTION: these pass conditions; the spine says only "if it holds"]`

**Given** the gate holds
**When** the decision is recorded in `docs/`
**Then** it says production takes the free server at launch and staging runs on demand, and staging can be stopped and started by one documented command each

**Given** the gate does not hold
**When** the decision is recorded in `docs/`
**Then** it says production starts on a paid server, names the container that failed and the measurement, and confirms that the same compose file and the x86-64 or ARM64 images run there without redesign

**Given** either outcome
**When** the reconciliation job runs for the test day
**Then** it shows no unexplained difference

**Requirements:** NFR-8 (portable to a paid server); AD-16, AD-17; Deployment "Size gate"; spike item 4
**Notes for the developer:**
- Touches `infra/` (load script), a seed script in `apps/commerce` for the 100 Designs, and `docs/` (the decision); no other application code should change. Story 2.15 extends the same seed script with Weavers and the filterable attributes.
- The launch load is the spine's (Consistency Conventions, "Test profiles") and is held as settings; the pass conditions above are an assumption for the founder to confirm. Record both with the result.
- The load tool is k6 (spine Stack). The script calls the shop's HTTP routes directly; keep its paths in step with `packages/api-client`.
- Keep the script: Story 7.11 runs it again with the Try-on part and the full catalogue.

### Story 1.27: One end-to-end test buys, ships and returns a saree

As a builder,
I want one automated test that lists, buys, ships and returns a saree,
So that every later change is checked against the whole slice before it is deployed.

**Acceptance Criteria:**

**Given** the local stack started from the compose file
**When** the end-to-end test runs
**Then** it signs the Owner in with password and second factor, creates and publishes a Design, and sets its stock to 1 Piece
**And** it signs a Shopper up, adds the Design to her cart and begins checkout, and asserts a Hold that ends 15 minutes later

**Given** the Hold in the test
**When** a second Shopper tries to begin checkout for the same Design
**Then** the test asserts she receives `stock.unavailable` and the Design shows as unavailable for now

**Given** the Checkout in the test
**When** a signed test-mode payment webhook is posted to the kernel's payment hook route, twice
**Then** the test asserts one Order in state Paid, one invoice with tax lines that add up to the amount paid, and an invoice file that downloads

**Given** the Order in the test
**When** the Owner marks it Packed, creates the label and marks it Dispatched, and signed tracking events are posted
**Then** the test asserts the states Packed, Dispatched, Out for delivery and Delivered in turn, and that stocked Pieces are 0

**Given** the Delivered Order
**When** the Shopper requests a Return for "Not as shown", books a pickup, the pickup event is posted, and the Owner marks it Received and records it as accepted and sellable
**Then** the test asserts the Return states Requested, Pickup booked, Picked up, Received, Accepted and Refunded in turn, one refund for the amount paid, and one credit note linked to the invoice
**And** stocked Pieces are 1 again and the Design shows as available

**Given** the test has finished
**When** it checks the records
**Then** the Variant's stock-movement rows explain every change from 1 to 0 to 1, an audit event exists for each Owner action, and the reconciliation job for the day shows no unexplained difference

**Given** the test is run twice in a row
**When** the second run finishes
**Then** it passes without any manual clean-up

**Given** continuous integration
**When** the end-to-end test or any workflow test fails
**Then** the deploy of Story 1.24 does not run

**Given** staging after a deploy
**When** the same test is run against it with the payment service and the shipping service in their real test modes
**Then** it passes, with the pay step driven through the payment service's test payment screen where that can be automated
**And** if that one step cannot be automated, it is done by hand from a written release checklist and the limit is reported

**Requirements:** NFR-11, NFR-4; Consistency Conventions (Testing); FR-18, FR-19, FR-20, FR-21, FR-23, FR-24, FR-25, FR-34, FR-36, FR-47, FR-48, FR-60 as verified end to end
**Notes for the developer:**
- Touches a test package at the repository root or under `apps/web`, and continuous-integration configuration; it should change no application code.
- In continuous integration the payment service and the shipping service are replaced at the HTTP edge by recorded test-mode responses; the adapters themselves are unchanged and still run.
- The test runner is Playwright (`@playwright/test` 1.65.1, spine Stack); drive the Shopper's and the Owner's steps through the website and the Admin in a browser.
- Use a controllable clock for the Hold; do not wait 15 minutes.
- This test blocks every deploy, so any later story that changes sign-in, checkout, or the Order and Return states updates the test in that same story and leaves it passing; those stories say so in their acceptance criteria.

### Story 1.28: Android proof on a real phone: screen, viewer and blurred bar

As a builder,
I want a minimal Android app run on a real mid-range phone that renders a sample screen, the saree viewer and a blurred navigation bar,
So that the choice of React Native, the web-view viewer and the design system's translucent bar are settled before any breadth is built on them.

**Acceptance Criteria:**

**Given** the repository after Story 1.27
**When** `apps/mobile` is created as a minimal Expo 58.1.0 application with expo-router
**Then** a build installs and starts on a real Android phone with 4 GB of memory, the phone of the spine's test profile, whose model and Android version are written in `docs/`
**And** its application id is the neutral one required by AD-20, with no product name in the id, the URL scheme or any package name, and the name check from Story 1.1 passes for `apps/mobile`
**And** `apps/mobile` imports `packages/contracts` and `packages/blocks` and nothing from the kernel's SDK, and the lint rule of Story 1.2 runs on it

**Given** `packages/blocks` is created with the properties of the sample Block types (banner, text and row of Designs), with no UI code
**When** a sample `ScreenV1` document, defined by a first `ScreenV1` schema in `packages/contracts` and bundled with the app, is opened
**Then** the app renders each Block in order with one native component per type, the row of Designs from sample `DesignCard` data embedded in the document, using the `DesignCard` schema that Story 1.8 created
**And** a Block of a type the app does not know, placed in the sample, is skipped and the rest is shown, settling spike item 5

**Given** a sample Deep Zoom tile set cut once with sharp from a full-length saree image at least 8,000 pixels long and served from the public `catalog` bucket on staging, under a `spike/` prefix
**When** the app opens a native screen holding a `react-native-webview` 14.0.1 web view with a page that shows the tile set in OpenSeadragon 6.1.1
**Then** one finger pans and two fingers pinch to zoom the saree, to both ends and to full detail, and the native screen does not scroll, go back or zoom the whole page instead
**And** the frame rate while panning and pinching is measured on the phone and recorded, settling spike item 6

**Given** a screen with a long list of full-width images
**When** it is scrolled quickly under a blurred, translucent navigation bar
**Then** the frame rate is measured on the phone over at least three 10-second scrolls and recorded with the method used, settling spike item 8

**Given** the three measurements
**When** the outcome is judged
**Then** the proof passes if the sample screen renders correctly, the viewer pans and pinches as described, and both frame-rate measurements hold a median of at least 50 frames a second with no stretch of one second below 30 `[ASSUMPTION: these figures; the spine says only "a smooth frame rate"]`
**And** on a pass, `docs/` records that React Native, the web-view viewer and the blurred bar are confirmed, with the figures, for the design system and for Epics 5 and 6 to build on

**Given** any of the three fails
**When** the outcome is recorded
**Then** work stops and the failure is reported to the founder with the measurements, because it reopens the choice of React Native; no workaround, native tile viewer or other framework is started without the founder's decision

**Requirements:** NFR-12; AD-12, AD-18, AD-19, AD-20; Consistency Conventions (Test profiles); spike items 5, 6 and 8
**Notes for the developer:**
- Touches `apps/mobile` (new), `packages/blocks` (new), `packages/contracts` (a first `ScreenV1` schema and the sample), and `docs/` (the record).
- This is a proof, not the app: no sign-in, no network data beyond the tiles, no styling from DESIGN.md. Story 6.1 builds the app shell on this application; Story 5.1 completes `ScreenV1` and `packages/blocks`; Story 2.10 builds the real viewer page and deletes the objects under `spike/`.
- Use only the Expo SDK's own modules and the versions in the spine's Stack; the blur comes from the Expo SDK's blur module.
- Measure on the phone itself, in a release build, not on an emulator.
