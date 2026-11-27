# Adversarial review — Architecture Spine, Alar

- Reviewed: `../ARCHITECTURE-SPINE.md` (draft, 2026-11-27) against `prd.md` (final, 2026-11-27)
- Lenses: A (adversarial pairs: two units obey every AD and still build incompatibly) and B (good-spine rubric)
- Inputs read: the spine and the PRD only. Statements about how the commerce system (Medusa) and content system (Payload) behave by default come from general knowledge of their v2 and v3 lines, not from this project's research; each is marked "default behaviour" and should be confirmed in the spike.

## Verdict

The spine fixes the big ownership questions well (one writer, worker reports back, money in paise, screens as versioned data, erasure through one workflow). It is not yet safe to hand to independent agents: it adopts a commerce kernel with its own routes, workflows, admin screens and data shapes, and then writes rules as if every state change were custom. Most holes below are places where the kernel's standard path and the shop's custom path both satisfy the ADs and produce different results. 3 critical, 11 high, 22 medium, 10 low.

Severity is rework if found mid-build: critical = several epics rebuilt or a money, stock or consent defect; high = one epic rebuilt or two units reconciled; medium = a story or two; low = an edit.

---

## Critical

### C1. The kernel's standard routes and admin screens bypass AD-4, AD-6, AD-7 and AD-14

- **Units:** checkout story on `apps/web` (uses "its standard store API for catalogue, cart and checkout", AD-2) and the hold and payment story in `apps/commerce` (AD-6, AD-7). Also: the stock admin extension and the commerce system's built-in inventory, order, refund and product screens.
- **How they diverge:** AD-2 tells clients to use the standard store API for checkout. By default that API has a cart-completion call that the client makes after the payment screen, and it creates the Order and reserves stock at that moment. That is an Order "from a client's word", which AD-7 forbids, and a reservation outside `begin-checkout`, which AD-6 forbids. Both units obey the AD they were given. The same holds in the Admin: the built-in inventory screen changes stocked quantity through a core workflow that is not one of the five and writes no stock-movement row; built-in refund, cancel, fulfilment and product-publish actions run core workflows that write no audit event (AD-14) and skip the publish checks in FR-34 and FR-38. AD-4 and AD-14 say "every", but nothing says what happens to the paths the kernel ships with.
- **Contradiction:** AD-2 against AD-7.
- **Fix — new AD "Kernel routes are allow-listed":**
  - **Binds:** `apps/commerce/src/api`, `packages/api-client`, commerce admin, FR-16..FR-25, FR-34..FR-38, FR-47, FR-48
  - **Prevents:** a standard route or built-in admin screen changing an Order, stock, refund or published Design outside the shop's workflows.
  - **Rule:** `packages/contracts` lists the standard store and admin routes that may be used. Every other standard route that changes state is blocked in middleware, including cart completion; checkout starts only through `/store/shop/checkout` and Orders are created only by `confirm-payment`. A built-in admin screen that changes stock, an Order, a refund or a Design's published status is either hidden and replaced by an extension that starts the shop workflow, or its core workflow is wrapped by a hook that writes the stock-movement row and the audit event; a test fails if an un-listed state-changing route answers.

### C2. A Design's attributes have no defined shape or home

- **Units:** admin catalogue story (FR-34, FR-37, FR-38), discovery story (FR-1, FR-2), Design page on web and on mobile (FR-3), invoice and tax story (FR-20, FR-37).
- **How they diverge:** AD-3 says the kernel owns "Design" and stops there. Fibre, weave, zari, place woven, length, width, blouse piece, care, origin, occasion, colour, tax code, stitched flag, claim evidence and the true-colour confirmation are not kernel fields. One agent stores them in the product's free-form metadata; another builds filter and facet counts expecting typed, indexed columns; a third reads the tax code from a tax class; a fourth puts evidence in a custom module. Each obeys AD-3 and AD-19, because AD-19 governs shapes that cross a boundary, not how the central entity is stored. The standard product-list route cannot filter on custom fields or return "result count before applying" (FR-1), so discovery also needs a route nobody has named. The Deferred row "Postgres full-text search" says what engine, not what it indexes or who builds it.
- **Fix — new AD "One Design record, one discovery route":**
  - **Binds:** FR-1..FR-4, FR-34, FR-35, FR-37, FR-38
  - **Prevents:** four stories storing and reading Design attributes four ways.
  - **Rule:** every Design attribute not native to the kernel lives in one `design-attributes` module, one typed row per Design linked to the product, with its fields and allowed values defined in `packages/contracts`; product metadata is not used for business data. Shoppers list, filter and search Designs only through `/store/shop/designs`, which returns results, facet counts and an availability value (`in_stock`, `on_hold`, `sold_out`) computed by the server. A Design is published only by the `publish-design` workflow, which enforces FR-34 and FR-38.

### C3. The relation between consent-notice versions in content and consent records in commerce is undefined

- **Units:** consent module story in commerce (FR-8, FR-15), notice story in content (FR-59), Model route story (FR-39), try-on request story (AD-11).
- **How they diverge:** AD-11 requires "a current Try-on consent whose notice names the receiving AI service". The notice is free text in content; the Approved-model list is in commerce. Nothing says (a) how commerce learns which services a notice names — parsed from text, a structured list on the notice, or a copy kept in commerce; (b) what "current" means — latest published in content read live on every request, a cached value, or a pointer the Owner sets in commerce; (c) how a publish in content reaches commerce, given the diagram allows no arrow from content to commerce; (d) whether a translation is a version, so whether fixing a Tamil typo forces every Shopper to accept again (FR-59 says a new version does); (e) what the consent record stores — version only, or version plus locale plus the service list as accepted; (f) what happens to Try-on when content is down. The FR-39 rule "a route cannot be published until the notice names the service" needs a check across both systems that no AD assigns. Two agents will produce a consent record and a notice that cannot be joined, on the feature with the highest legal exposure. The same gap applies to terms and privacy acceptance at first sign-in (FR-26).
- **Fix — new AD "Notices are structured, and commerce decides what is current":**
  - **Binds:** FR-8, FR-26, FR-39, FR-59, AD-3, AD-11
  - **Prevents:** a consent record that cannot prove which notice and which services the Shopper accepted; a Model route sending photos to an unnamed service.
  - **Rule:** a notice in content is a document with an integer version shared by all its translations, plus, for the Try-on notice, a structured list of AI-service ids taken from the Approved-model list. A wording-only or translation-only edit is a revision and does not change the version; any change to the service list or to meaning is a new version. Commerce reads the latest published version through one content port, keeps a copy of `{document id, version, service ids}` in the consent module when it first sees it, and uses that copy for every check, so Try-on does not depend on content being up. A consent record stores Shopper, document id, version, locale shown, service ids and time. `publish-model-route` fails unless every service on the route is in the copied list; a request fails unless the Shopper's latest consent version equals the current version.

---

## High

### H1. Order and Return states have no owner and no mapping to the kernel's statuses

- **Units:** order tracking on web and mobile (FR-21, FR-23), admin orders (FR-47), shipping webhook story.
- **How they diverge:** the Glossary fixes nine Order states and seven Return states. The kernel has separate order, payment and fulfilment statuses with other names. One client derives "Dispatched" from fulfilment status, another from a custom field; the shipping webhook story writes a third. No AD names the state field, the transitions, the workflow per transition, or which shipping events map to which state. `src/workflows` ends in "...".
- **Fix — new AD "One state machine per Order and Return":**
  - **Binds:** FR-21..FR-25, FR-47, FR-48
  - **Prevents:** clients and admin showing different states for one Order.
  - **Rule:** the Glossary states are enums in `packages/contracts` with a table of allowed transitions; each transition is one named workflow. The server returns the Glossary state; clients never derive it from kernel statuses. The shipping adapter maps vendor events to transitions in one table, and a shipping webhook is idempotent on the vendor's event id and ignored if it would move a state backwards.

### H2. Hold and payment races that AD-6 and AD-7 leave open

- **Units:** cart story (standard cart routes), `begin-checkout`, `confirm-payment`, the `release-hold` job.
- **How they diverge or fail:**
  1. AD-6 puts only `begin-checkout` under the inventory lock. `release-hold` (job) and `confirm-payment` (webhook) can run at the same instant on one Hold: the Hold is released and the Order is created without re-reserving, which oversells.
  2. Nothing stops a second `begin-checkout` on the same cart from another tab or device (FR-16 shares the cart), giving two Holds for one cart.
  3. Nothing freezes the cart while a Checkout is live; the cart story lets the Shopper add an item during payment, so the amount charged differs from the cart (FR-18).
  4. AD-7 is idempotent "on the payment service's payment id". One Checkout can have several payment ids (a failed attempt, then a success; or two captures). Two captured payments with different ids produce two Orders.
  5. The diagram releases the Hold on "payment fails", but the payment screen lets the Shopper retry inside the same payment order; a success then arrives on a released Hold and goes down the late-webhook path needlessly.
  6. Nothing ties the payment service's own timeout to the Hold length, or checks the confirmed amount against the amount shown.
- **Fix — tighten AD-6 and AD-7:**
  - **AD-6 Rule, add:** all five workflows take the same lock on each inventory item. A cart has at most one live Hold; `begin-checkout` on a cart with a live Hold returns it. While a Hold is live the cart cannot be changed; changing it means cancelling the Checkout first. A Hold is treated as ended from its expiry time, whether or not the job has run.
  - **AD-7 Rule, change:** `begin-checkout` stores a snapshot of lines, prices, tax and total, and creates the payment order for exactly that total with an expiry equal to the Hold. `confirm-payment` is idempotent on the Checkout id: the first captured payment whose amount equals the snapshot creates the Order; any further captured payment for that Checkout is refunded automatically. A failed attempt does not release the Hold; only expiry or the Shopper cancelling does.

### H3. Two calculators for tax and discount, and no discount mechanism chosen

- **Units:** cart totals (kernel's own tax and promotion calculation), invoice story (AD-5 money functions), discount admin story (FR-58), Design page price display (FR-5).
- **How they diverge:** AD-5 says all arithmetic uses the functions in `packages/contracts`, but the kernel computes cart totals with its own tax and promotion code, so the total charged and the invoice can differ by a paisa. The kernel offers two discount mechanisms (a sale price list, or a promotion that adjusts the cart); one agent picks each, and only one of them can show a struck-through prior price on the Design page. "A discounted price is still a whole rupee" has no rounding direction. AD-13 says "tax rates per tax code", which cannot express the garment rule (5% up to Rs 2,500 per piece after discount, 18% above). Splitting tax into two halves for an in-state sale has no remainder rule. The price history needed for the 30-day lowest price has no owner.
- **Fix — tighten AD-5 and AD-13:**
  - **AD-5 Rule, add:** the kernel's tax calculation is replaced by one tax provider that calls the money functions in `packages/contracts`; nothing else computes tax. A discount of either kind is applied per unit and rounded down to a multiple of 100 paise before tax is derived. Automatic discounts are sale prices; code discounts are promotions; both pass through the same function. In-state tax is split in two with any odd paisa on the first half. The Checkout snapshot (H2) is the only source for the invoice; an invoice is never recomputed.
  - **AD-13 Rule, change:** a tax code maps to a dated rule, not a rate: a list of `{value up to, rate}` bands evaluated on per-unit value after discount.
  - **AD-3 table, add:** price history (every price change with dates) — owner: a commerce module; the 30-day lowest price is computed by the server and returned with the price.

### H4. Invoice, invoice number and credit note have no home

- **Unit and requirement:** FR-20, FR-24, FR-54 (invoice sent and downloadable), NFR-8 (invoices backed up).
- **How it fails:** AD-3 lists "invoice" under the kernel, which has no such entity. No module, workflow or job produces the document; nothing fixes numbering (tax invoices need an unbroken series), the file format, which bucket holds it, or how a Shopper downloads it. Invoices hold personal data but AD-11 covers only photos, and AD-17 turns on versioning for the invoice bucket. Credit notes (FR-24) appear nowhere. The capability map sends FR-20 to "commerce kernel; razorpay provider; hold workflows".
- **Fix — new AD "Invoices and credit notes are immutable documents":**
  - **Binds:** FR-20, FR-24, FR-27, FR-48
  - **Prevents:** two numbering schemes; an invoice that changes after issue.
  - **Rule:** an `invoice` module owns invoices and credit notes. `confirm-payment` creates the invoice record from the Checkout snapshot with the next number from one database sequence per document type and financial year; a refund creates a credit note linked to it. The worker job `invoice.render` writes the file to a private documents bucket; Shoppers and the Owner read it only through a signed link. Records and files are never edited or deleted, including on account deletion.

### H5. `packages/api-client` has no defined output types, and the web starter breaks AD-2 on day one

- **Units:** `apps/web` (built from the commerce system's storefront starter) and `apps/mobile` (built fresh).
- **How they diverge:** AD-19 requires every cross-boundary shape to be a schema in `packages/contracts`, but the standard store API returns the kernel's own types. The starter calls the kernel's SDK and uses its types throughout UI code; the mobile agent builds against whatever `api-client` exposes. Either `api-client` passes kernel types through (then AD-2's stated purpose, "a swap of commerce system not reaching into UI code", fails and AD-19 is broken) or it maps them (then the web starter's screens must be rewritten). Nothing says which, so web and mobile end up with different models for cart, Design and Order.
- **Fix — tighten AD-2:**
  - **Rule, add:** `packages/api-client` returns only view models defined in `packages/contracts` (for example `DesignCard`, `DesignDetail`, `CartView`, `CheckoutView`, `OrderView`). Kernel SDK types and calls do not appear outside `packages/api-client`; the starter's data layer is replaced before any screen is built. A lint rule fails the build if `apps/web` or `apps/mobile` imports the kernel SDK, its types, or `fetch` for backend calls.

### H6. No compatibility rule for released apps outside `ScreenV1`, and FR-55 has no mechanism

- **Units:** any commerce API story, and the Android app already installed on phones.
- **How it fails:** AD-12 makes `ScreenV1` additive-only. Every other route, error code and enum can change freely under the spine. `api-client` is compiled into the app, so an old app meets a new server. If the app parses responses strictly, an added field or a new Order state crashes it. A kernel upgrade that changes a standard route does the same. FR-55 is mapped to AD-12, whose Rule does not mention a minimum version: how the app reports its version, where the check runs and what the server returns are open, so the mobile agent and the commerce agent will each invent one. "Migrations run before the new containers start" allows a migration that breaks the still-running old containers.
- **Fix — new AD "The API is additive; old apps are refused cleanly":**
  - **Binds:** `apps/commerce/src/api`, `packages/api-client`, `apps/mobile`, FR-32, FR-55
  - **Prevents:** a server deploy breaking installed apps.
  - **Rule:** within a major version, responses only gain optional fields and enums only gain values; clients ignore unknown fields and show a neutral fallback for an unknown enum value. Every client request carries `X-Client` (platform and app version); commerce middleware compares it with the minimum-version setting and returns error code `client.update_required`, on which the app shows only the update screen. A breaking change needs new route paths and the old ones kept until the minimum version passes them. Recorded responses from each released app version are replayed in CI against the new server.

### H7. Shopper photo upload path, result file path and the "AI-generated" label are undecided

- **Units:** photo upload on mobile and web (FR-10), try-on module in commerce, worker `tryon.generate` (FR-11, FR-12, FR-52).
- **How they diverge:** AD-11 covers reading through signed links only. Upload could be a signed upload link straight to the bucket (which AD-2 seems to forbid: "never call any third party directly") or a multipart post through commerce; the two client agents and the commerce agent can each pick. Nobody owns validation (type, size, stripping location data). For results, AD-11 bars image bytes in job results, so the worker must write the file itself — but the sequence diagram has the worker receive read links only, and the container diagram gives it bucket access. The label: the sequence diagram says "labelled result", so one agent burns it into the pixels in the worker; a client agent overlays it in the UI; the saved copy then has two labels or none. Re-encoding to burn a label can strip the provider's provenance data, which FR-12 says must be kept.
- **Fix — new AD "One path in and one path out for try-on images":**
  - **Binds:** FR-10, FR-11, FR-12, FR-52, AD-2, AD-11
  - **Prevents:** two upload paths; unlabelled saved results; lost provenance data.
  - **Rule:** a client uploads a Shopper photo only to a single-use signed upload link issued by commerce for a key commerce chose, with type and size limits in the link; commerce confirms the object and strips location data before the photo can be used. The worker reads inputs and writes the result only through signed links for keys named by commerce, and reports the key, never bytes. The worker stores the provider's file unchanged; clients draw the label on screen, and "save" or "share" goes through one commerce route that returns a labelled copy. A blocked or uncheckable result is never written.

### H8. Erasure: no provider port, an in-flight race, undefined survivors, and bucket versions

- **Units:** `erase-shopper-media` workflow in commerce, worker `media.erase` job, worker `tryon.generate`, cost view (FR-45), data-request story (FR-28), backup scripts (AD-17).
- **How they diverge or fail:**
  1. AD-10 says the worker reaches AI providers only through `TryOnProvider.generate` and `ResultCheck`. Provider erasure has no method, so the erasure agent must break AD-10 or call the provider from commerce.
  2. AD-11 says the workflow "deletes files"; the worker also has `media.erase`. Who deletes files is unclear; two agents may both, or neither.
  3. A Try-on job in flight when consent is withdrawn reports its result after erasure and recreates a result file and record.
  4. "Deletes records" would remove the request rows that FR-45 (cost by day), FR-28 (which providers received her photos), FR-53 (whether she used Try-on) and NFR-5 (access log) still need.
  5. If the private bucket keeps versions (AD-17 names buckets, not their layout), a delete leaves the old version. A database restore brings back erased records.
  6. Deleting one photo or result (FR-15) is not said to use the same workflow.
- **Fix — tighten AD-10 and AD-11:**
  - **AD-10 Rule, add:** `TryOnProvider` has a second method, `requestErasure(request reference)`, returning accepted, unsupported or failed.
  - **AD-11 Rule, add:** `erase-shopper-media` takes a scope (one file, or all for a Shopper), deletes the files itself, marks affected requests erased, and enqueues one `media.erase` job per provider that received them; the job's outcome is recorded per provider and a failure or no answer in 24 hours alerts the Owner. The internal report route refuses a result for an erased request and the worker then deletes the file. Erasure removes file keys and the Shopper link from request rows and keeps the de-identified row (day, route, provider, cost, outcome) plus an erasure ledger. The private media bucket has versioning off and a lifecycle rule as a backstop; after any restore the erasure ledger is replayed before the shop opens.

### H9. Two owners of message sending; one-time codes and message text have no path

- **Units:** auth story (`commerce/src/providers/one-time-code` and `messaging`), worker `message.send` (`worker/src/providers/sms`, `email`), content translations story.
- **How they diverge:** the repository tree puts a `messaging` provider in commerce and SMS and email adapters in the worker; AD-8 says messages are jobs; the container diagram shows only the worker reaching SMS and email. The auth agent sends the code from commerce; the messaging agent sends everything from the worker; there are now two SMS adapters and two sets of credentials. If the code does go through the queue, a secret sits in Redis and in job payloads, against the logging convention. Message text must come from content (NFR-14), but the worker has no arrow to content, so either commerce renders text before enqueuing or the worker breaks the diagram. No unit owns the Shopper's language. Indian SMS routes require pre-registered templates, so SMS text cannot be freely edited in content. Nothing makes a message once-only per event.
- **Fix — new AD "One message path":**
  - **Binds:** FR-26, FR-54, NFR-9, NFR-14, AD-8
  - **Prevents:** two senders; codes in logs; text in two places.
  - **Rule:** all SMS and email, including one-time codes and Owner alerts, are `message.send` jobs handled by the worker's adapters; commerce has no messaging adapter. A job carries a template key, locale and variables; the worker reads the template through an internal commerce route that reads content. Each SMS template in content carries its registered template id and is flagged as fixed wording. The job id is `{event id}:{channel}`, so a repeat is dropped. The one-time code is generated and checked in commerce, travels only as a job variable, and that variable is excluded from logs and removed when the job completes. The Shopper record holds her language.

### H10. The content admin sits outside AD-14 and AD-15; read access to personal data is unlogged

- **Units:** content admin (notices, policies, screens) and the audit module; any admin screen that shows personal data.
- **How it fails:** AD-14 audits "every workflow started from the admin". Edits in the content admin are not commerce workflows, and content may not write to commerce (no arrow), so a change to the Try-on consent notice — the most consequential admin change in the product — writes no audit event, though FR-60 says every Admin action is recorded against a named account. AD-15 requires password plus second factor for "Admin accounts" without saying it covers the content system, which by default has neither a second factor nor the FR-60 lockout. The two admins have separate accounts with nothing tying them to one person. Separately, NFR-5 and FR-44 require access to personal data to be logged for a year; AD-14 covers changes only, and reads are not workflows.
- **Fix — tighten AD-14 and AD-15, and add an access-log rule:**
  - **AD-14 Rule, add:** content keeps its own append-only audit collection with the same event shape from `packages/contracts`, written by a hook on every create, update, publish and delete; version history alone does not count. An Owner account has the same email in both admins, and that email is the actor key.
  - **AD-15 Rule, add:** the second factor and the FR-60 lockout apply to both admins. The content system's public API serves no one but commerce; only its admin path is exposed through the proxy.
  - **New rule (AD-14 or own AD):** every admin route that returns a Shopper's personal data, and every signed link issued to an admin account, writes an access-log event (actor, Shopper, what, time; never the data). Access-log events are kept one year and are not removed by erasure.

### H11. Screen composition: Design references, rule Blocks, scheduling, caching and preview

- **Units:** `packages/blocks` story, commerce `/store/shop/screens` story, content screens story, web and mobile renderers.
- **How they diverge:**
  1. A "row of Designs" Block: the blocks agent defines it as a list of Design ids and has clients fetch each card; the screens-route agent embeds full Design cards. Both fit "commerce returns `ScreenV1`".
  2. A rule such as "newest" (FR-30) is resolved by content (which may not read commerce), by commerce at compose time, or by the client. Unstated.
  3. The Owner must pick Designs and Weavers in the content admin, but no arrow lets content read commerce, so the picker cannot list them.
  4. Scheduled publishing (FR-31) in the content system uses its own job runner by default, a second job system against AD-8.
  5. The container diagram shows Redis as cache, but no rule sets what is cached or how a publish invalidates it; content cannot notify commerce. Embedded prices and stock go stale.
  6. Preview (FR-31) of a draft has no path through commerce.
  7. An unknown action name or a changed property on a known Block has no rule; AD-12 covers unknown Block types only.
- **Fix — tighten AD-12 and add one arrow:**
  - **Rule, add:** content stores Design and Weaver references as ids and rules as data; commerce resolves both when it composes the screen and embeds `DesignCard` view models, so clients make no further calls. Content's admin may call one read-only commerce route to list Designs and Weavers for pickers (add `content -. HTTP read .-> commerce` to the diagram). A screen version carries `publish_at`; commerce picks the newest version whose time has passed, so no scheduler runs in content. Composed screens are cached for at most 60 seconds; prices and availability in them are filled at read time, not cached. A draft is read through the same route with a short-lived preview token minted by commerce for an admin. A Block whose action or required property the client does not know is skipped like an unknown type; a breaking change to a Block is a new type name.

---

## Medium

### M1. "Day" is undefined
- **Units:** Try-on limit (FR-14), daily cap (FR-42), cost view (FR-45), reconciliation (AD-7), 30-day lowest price, return period, discount dates, scheduled screens.
- **Divergence:** the convention stores UTC and lets clients display India time. A limit that resets at UTC midnight resets at 05:30 for the Shopper; the cost view by UTC day will not match the Owner's sales day.
- **Fix (convention "Ids and time", add):** a business day is a calendar day in `Asia/Kolkata`; every per-day rule, effective date and period uses the day functions in `packages/contracts`. Effective dates start at 00:00 India time.

### M2. Try-on limit, daily cap and retries can be overrun
- **Units:** try-on request route, worker, queue retry settings.
- **Divergence:** the limit is checked on request and (per FR-11) counted on success, so 50 parallel requests all pass. The cap is known only after cost is reported. A queue-level retry re-runs primary plus fallback, multiplying paid calls beyond "fallback once".
- **Fix (tighten AD-10):** accepting a request reserves one unit of the Shopper's limit and the model's listed price against the cap in the same transaction; a failed or blocked outcome releases the limit unit, and actual cost replaces the estimate. `tryon.generate` has one queue attempt; primary-then-fallback happens inside it; a rerun first asks commerce for the request's state and stops if it is final. A sweeper fails requests with no report after a set time.

### M3. Try-on limits and Hold have two owners inside the spine
- **Divergence:** the paradigm lists a `hold` module; AD-3 puts Hold in the kernel; the repository tree has no hold module. "Limits" sit in AD-3 under commerce modules (try-on) and in AD-13 as dated settings; the PRD lets the Owner set them in both FR-42 and FR-56.
- **Fix (tighten AD-3):** a Hold is the kernel's reservation plus an expiry and Checkout id, with no separate module. Every setting, including Try-on limits, cap, cost ceiling and off switch, is a key in the `settings` module; other modules and both admin screens read and write it there.

### M4. Cancelling before dispatch has no stock path
- **Unit and requirement:** FR-22, FR-36 ("cancellation" is a stock cause) against AD-6's five workflows.
- **Failure:** none of the five returns sold Pieces to stock for a cancelled, undispatched Order; `restock-return` implies inspection (FR-25). The cancel agent must either break AD-6 or leave stock wrong.
- **Fix (tighten AD-6):** name the path: `cancel-order` calls `restock-return` as a step with cause "cancelled before dispatch" and no inspection; an undelivered or returned Piece requires the inspection result. Also state that a workflow may run another as a step, and that "only these five" means only their steps touch quantities.

### M5. AD-11 forbids the sample-set runs FR-43 requires
- **Failure:** "No Try-on job starts without a current Try-on consent" blocks test runs on sample photos, which have no Shopper. The sample set and its outputs have no owner in AD-3; whether test runs count against the cap is open.
- **Fix (tighten AD-11, AD-3):** a Try-on job has a purpose, `shopper` or `sample`. Sample jobs use only the sample set (owner: try-on module, each photo with a recorded agreement), skip the consent check, are counted in spend separately, and never produce a Shopper-visible result.

### M6. No image pipeline for product photos; absolute URLs block the CDN and a move
- **Units:** web (framework image resizing) and mobile (none).
- **Divergence:** web gets resized images, mobile downloads originals, breaking NFR-1. By default the kernel stores full file URLs, so adding a CDN or moving cloud (AD-16) means rewriting stored data. The stack also lists the content system's S3 storage plugin, but the container diagram has no content-to-storage arrow.
- **Fix (new AD):** the worker job `image.derive` makes a fixed set of widths, listed in `packages/contracts`, for every product, Weaver and content image. Records store object keys; one function in `packages/contracts` builds a URL from a key, a width and the configured media base URL. Content may write only to its own prefix in the public bucket (add the arrow).

### M7. Where the Full saree view page lives, and tile versions
- **Units:** web viewer story, mobile viewer story, `tiles.build`.
- **Divergence:** "the same OpenSeadragon page" can be a route on `apps/web` loaded by the app (a mobile-to-web dependency the diagram does not allow) or HTML bundled in the app (two copies). Replacing a full-length image under the same path leaves stale tiles in caches. The 8,000-pixel check (FR-7) has no owner; the tile-set status record has no owner; previews put unpublished tiles in a public bucket.
- **Fix (tighten AD-18):** the viewer is one static page built from `packages/viewer` and published to the public bucket; web embeds it and mobile loads it in the web view, with settings passed in the URL. Tiles are stored under `{design id}/{image version}/`, never overwritten. A tile-set record (owner: a commerce module) holds status and dimensions; the size check runs in commerce on upload and again in the worker.

### M8. Catalogue text has no translation home; locale has no protocol
- **Divergence:** AD-3 gives "translations" to content, but Design descriptions and Weaver stories are commerce data. The "Text" convention allows "content or a translation file"; a file in the app needs a release, against NFR-14. No rule says how a client states its language or what the fallback is.
- **Fix (new convention "Language"):** clients send `Accept-Language`; the server answers in that language or English, and says which in `Content-Language`. Interface strings are served by commerce from content as a versioned bundle the client caches; a bundled copy is the offline fallback only. Translated Design and Weaver text is stored in commerce beside the original, keyed by locale. API error `message` is for developers; clients show text looked up by `code`.

### M9. Timed work depends on job frequency; enqueue is not atomic; one Redis serves queue and cache
- **Divergence:** if the Hold job runs every five minutes, Holds last 15 to 20 minutes unless readers compare expiry time (see H2). A crash between a workflow's commit and its enqueue loses the job: a Try-on request hangs, or the automatic-refund message (5-minute duty, FR-19) is never sent. The queue needs Redis never to evict keys; a cache wants eviction.
- **Fix (tighten AD-8):** every job is derivable from a row in commerce (request, message, erasure or tile-set record) with a status; a sweeper each minute enqueues rows that are due and not done. Redis runs with eviction off and persistence on; every cache key has a time limit and a `cache:` prefix. The spine lists every scheduled job with its interval.

### M10. Rate limiting and abuse are silent
- **Requirement:** FR-26 (3 codes per 10 minutes), FR-60 (lockout), cost of SMS and search.
- **Divergence:** limits could sit in the proxy, in commerce middleware or in the adapter; code-sending is open to paid-SMS abuse by number rotation.
- **Fix (new convention "Limits"):** rate limits are enforced in commerce middleware with Redis counters, defined in one table in `packages/contracts` (per number, per IP, per account). One-time-code sends are limited per number and per IP; the proxy applies only a coarse per-IP ceiling.

### M11. AD-15 names three identities; the system has five
- **Failure:** "each route accepts exactly one kind" leaves no place for anonymous browsing with a guest cart (FR-1, FR-16) or vendor webhooks, which carry a signature, not a token. Cart merge at sign-in is unruled.
- **Fix (tighten AD-15):** five route classes — public (publishable key, optional guest cart id), Shopper, admin, service, vendor webhook (signature verified per adapter). A guest cart is attached to the Shopper at sign-in by one workflow; if she already has a cart, lines are merged and capped by stock.

### M12. How a Shopper learns a Try-on result is ready
- **Divergence:** the sequence diagram polls; FR-11 says "without keeping the screen open … told when the result is ready". One agent builds polling only; another adds push notifications, which need a device-token entity (no owner) and a vendor call from somewhere.
- **Fix (tighten AD-8 or new AD):** state the decision. Either: at launch, readiness is shown in-app by polling a status route with back-off, plus a badge on next open, and there is no push. Or: push is one more `message.send` channel in the worker; device tokens are owned by a commerce module and removed on sign-out and account deletion.

### M13. Clients have no defined source for shop configuration
- **Requirement:** FR-42 (off switch, cap pause), FR-55, FR-17, FR-23 (return period shown), §6.3 (launch without Try-on).
- **Divergence:** each client story invents how it learns whether Try-on is on, the return period, the shipping rule and the minimum version.
- **Fix (new AD or under H6):** one route, `/store/shop/config`, returns a `ShopConfig` schema from `packages/contracts` with every client-visible setting and feature state; clients read these values nowhere else and re-fetch on start and on a `config.changed` error code.

### M14. NFR-16 measurement has no home
- **Failure:** counting page views, viewer opens, Try-on requests and cart additions needs events from clients. AD-2 bars clients from third parties; no route, entity or owner exists. An agent will add an analytics SDK.
- **Fix (new AD):** clients send named events from a fixed list in `packages/contracts` to `/store/shop/events`; a `metrics` module stores daily counts with no Shopper id. No analytics or advertising SDK is added to either client.

### M15. NFR-9 monitoring has no evaluator, and alerts ride on the thing they monitor
- **Failure:** the map sends NFR-9 to "reconciliation job; `infra/`" and defers vendors. Nobody computes error rate, payment-failure rate, Try-on failure rate or 80% of cap. If alerts are `message.send` jobs, a dead worker or Redis cannot report itself. Error tracking in clients is a third-party call under AD-2.
- **Fix (new AD "Health and alerts"):** every unit exposes `/health`. Threshold alerts are computed by a commerce job each minute from its own records and sent through `message.send`. Shop-down and worker-down are detected by a service outside the server that calls `/health` and alerts by its own channel. Error tracking is one adapter per client and server, named as the second exception in AD-2, and sends no personal data.

### M16. Refunds and disputes have no truth rule
- **Requirement:** FR-18, FR-19, FR-22, FR-24, FR-48.
- **Divergence:** automatic refund, cancel refund, Return refund and partial refund can each call the payment adapter their own way; a retried refund pays twice; "Refunded" may be set on request or on the vendor's confirmation. Disputes (FR-48) have no entity or webhook mapping.
- **Fix (tighten AD-7):** every refund runs through one `refund-payment` workflow, idempotent on a refund id created before the vendor call and never more than the amount paid less earlier refunds. A refund is "started" on the vendor's acceptance and "completed" only by webhook. Disputes arrive by webhook into a `dispute` record linked to the Order. Daily reconciliation covers refunds.

### M17. Events and subscribers are outside AD-4
- **Divergence:** the conventions name events, and AD-19 schemas them, but no AD says who may emit or what a subscriber may do. The kernel emits events of its own; a subscriber that changes state is a path AD-4 does not list ("routes, admin actions, scheduled jobs and webhook handlers").
- **Fix (tighten AD-4):** add "event subscribers" to the list of things that only start a workflow. Events are emitted only as the last step of a workflow; a subscriber is used only for side effects that may be retried.

### M18. Entities the PRD needs that AD-3 does not list
- **Missing:** Try-on report (FR-13, FR-44; not the same as a complaint), terms and privacy acceptance (FR-26), age and own-photo confirmation (FR-9), depicted-person removal request (FR-9), price history (FR-37), credit note (FR-24), claim evidence (FR-38), sample set (FR-43), tile-set record (FR-7), Return inspection photos (FR-47, private), access-log event (NFR-5), erasure ledger (FR-15), payment dispute (FR-48), metric counts (NFR-16), Shopper language.
- **Divergence:** each is stored wherever its story's agent chooses; the report in particular may be built as a complaint by one agent and as a try-on record by another.
- **Fix (AD-3 table):** add each with one owner; say that a new entity needs a row here before it is built. Inspection photos and evidence files go in the private documents bucket under signed links.

### M19. Most Rules have no enforcement mechanism
- **Rubric:** a rule agents can break silently will be broken. AD-1, AD-2, AD-3, AD-9, AD-19 and the "no arrow" rule depend on reading.
- **Fix (new convention "Enforcement"):** the import graph is checked in CI by a dependency rule file that mirrors the diagram. Each app has its own database user with rights on its own database only; the worker has none. `/internal/*` is on a compose network the proxy is not on. CI fails on a number type in a money field, on an inline shape in a route handler, and on a product-name string outside settings.

### M20. Over-the-air app updates are not addressed
- **Requirement:** FR-33 ("no capability that was not in the version the app stores reviewed"), FR-55.
- **Divergence:** the mobile framework can ship code updates without store review. One agent enables it for speed; that is an unreviewed-feature path, and "app version" for FR-55 becomes ambiguous.
- **Fix (tighten AD-12):** state the decision: over-the-air code updates are off at launch, or allowed for fixes only with the store version unchanged and no new Block, action or permission. The version in `X-Client` is the store build version.

### M21. Web caching is unruled
- **Divergence:** the storefront framework caches server fetches by default. A cached Design page shows an old price or "in stock" for a sold-out Design; another agent disables all caching and misses NFR-1.
- **Fix (new convention "Caching"):** price, availability, cart, Checkout, Order and Try-on responses are never cached anywhere. Design content and screens may be cached for at most 60 seconds. Tiles and derived images are immutable and cached for a year.

### M22. Account deletion and data requests have no workflow
- **Requirement:** FR-27, FR-28, FR-49.
- **Failure:** `erase-shopper-media` covers media only. Removing "personal details" while keeping invoices, Orders and logs, and the public web deletion page, belong to no workflow. One agent deletes the Shopper row and orphans Orders; another anonymises.
- **Fix (new AD):** `delete-account` runs `erase-shopper-media`, then replaces the Shopper's personal fields with a tombstone and keeps the id, so Orders, invoices, access logs and the erasure ledger stay linked. `export-shopper-data` builds the FR-28 answer from the same list of personal fields, kept in `packages/contracts`. Both are started from the app, the public page (after a one-time code) and the Admin.

---

## Low

- **L1. AD-4 read path.** "A module's service is called only from a workflow step" literally forbids a route reading through a service. Add: reads may call a module service or the kernel's query layer directly; they change nothing.
- **L2. AD-2 and the diagram omit media.** Clients fetch tiles and photos from the public bucket and (after H7) upload to a signed link; the Design viewer runs in a web view. Add these as named exceptions and arrows. The container diagram also shows the proxy routing to content; say only the admin path is exposed (see H10).
- **L3. Repository tree against the container diagram.** `apps/commerce/src/providers/messaging` contradicts "worker sends" (resolved by H9); the paradigm's `hold` module contradicts the tree (M3); `media.erase` in the worker against "the workflow deletes files" (H8). Align the tree once those are decided.
- **L4. AD-20 and the app's display name.** The launcher name and store listing are fixed at build and submission, so the name cannot be "only in settings and content". Say: the display name is one build-time value in the mobile app's configuration; nothing else.
- **L5. Migrations.** Add: every migration must work with the previous release still running (add first, remove a release later); the content system's automatic schema sync is off outside local; each app migrates only its own database; a failed migration stops the deploy.
- **L6. Accessibility (NFR-15) has no rule.** Add a convention: every interactive component has a label and role; text scales with the system setting to 200% without clipping; the viewer page (AD-18) offers button controls for pan and zoom; a check runs in CI for web and on a checklist for mobile.
- **L7. Shared packages and framework versions.** Web is on one framework major, content on another, mobile on React Native. Add: `packages/contracts`, `packages/blocks` and `packages/api-client` import no UI framework. Confirm in the spike that the schema library version in the stack works inside the kernel's own validation.
- **L8. Encryption at rest (NFR-5).** Silent. Add under AD-16: the database volume, both buckets and off-server backups are encrypted at rest; backup credentials are write-only from the server.
- **L9. Deferred "Cash on delivery: the Order model already allows it".** AD-7 and the Glossary ("an Order exists only once payment is confirmed") do not allow it. Reword: cash on delivery will need a change to AD-7.
- **L10. Environments for the app, and worker sizing.** Say which backend each app build points to (a build-time base URL; separate application ids for staging and production). Set worker concurrency per job type in configuration, with tile building at one at a time, since the free server's memory is the limit named in Deferred.

---

## Lens B walk

### PRD requirements with no home or no governing rule

Not in the Capability Map at all:

| Requirement | Gap | Finding |
| --- | --- | --- |
| NFR-1 Speed | no caching or image rule | M6, M21 |
| NFR-2 Try-on time | appears only in a diagram | M2 |
| NFR-3 Cost ceiling | no setting or publish check named | M3, C3 fix (`publish-model-route`) |
| NFR-5 Security | at-rest encryption and personal-data access logs unruled | H10, L8 |
| NFR-6 Erasure in 24 hours | no deadline or alert rule | H8 |
| NFR-7 Breach response | nothing; depends on access logs and a way to message affected Shoppers | H9, H10 |
| NFR-10 One operator | no rule that every setting has an admin screen | M3 |
| NFR-13 Honest design | process only; acceptable, but say so | — |
| NFR-15 Accessibility | no rule | L6 |
| NFR-16 Measurement | no route, entity or owner | M14 |

In the map, but the Rule cited does not govern the capability:

| Requirement | Gap | Finding |
| --- | --- | --- |
| FR-1, FR-2 | filters, counts and search have no route or data shape | C2 |
| FR-5, FR-37 | 30-day lowest price and price history | H3 |
| FR-8, FR-39, FR-59 | notice-to-consent relation | C3 |
| FR-9 | where age and own-photo confirmations and removal requests are kept | M18 |
| FR-10 | upload path | H7 |
| FR-12 | label and provenance | H7 |
| FR-13, FR-44 | report entity; access logging on view | M18, H10 |
| FR-17 | delivery check not tied to the shipping adapter or region setting | M13 |
| FR-20, FR-24 | invoice and credit note | H4 |
| FR-21, FR-23, FR-47 | states and shipping events | H1 |
| FR-22 | stock on cancel | M4 |
| FR-26 | terms acceptance record; code limits; code delivery | M18, M10, H9 |
| FR-27, FR-28, FR-49 | deletion and data request | M22 |
| FR-31 | schedule, preview, rollback | H11 |
| FR-38 | evidence | C2, M18 |
| FR-43 | sample runs | M5 |
| FR-48 | part refunds, disputes | M16 |
| FR-55 | mapped to AD-12, which is silent on it | H6 |
| FR-58 | discount mechanism and rounding | H3 |
| FR-60 | content admin | H10 |

FR-50 is deferred by the PRD itself; no gap.

### Deferred items that can cause divergence

- **One sign-in for both admins** — safe only with the shared actor key in H10.
- **Search engine** — the engine can wait; the route and index fields cannot (C2).
- **SMS, email, error-tracking and uptime vendors** — the vendor can wait; who sends, and whether clients may carry an error-tracking SDK, cannot (H9, M15).
- **CDN** — "CDN-ready" is true only if records hold keys, not URLs (M6).
- **Cash on delivery** — the claim is wrong against AD-7 (L9).
- **Whether the free server is large enough** — add worker concurrency limits now (L10).
- The rest (model choice, self-hosted model, iOS, staff roles, moving servers) are safe as written.

### Structural dimensions

| Dimension | State | Finding |
| --- | --- | --- |
| API versioning for released apps | silent outside `ScreenV1` | H6 |
| Caching and invalidation | silent | H11, M21 |
| Rate limiting and abuse | silent | M10 |
| Shopper photo upload | silent | H7 |
| Product image pipeline | silent | M6 |
| Search | deferred without a contract | C2 |
| Notifications | two owners; push undecided | H9, M12 |
| Scheduled jobs | three named; many more implied; no intervals | M9 |
| Migrations, two apps on one server | one sentence | L5 |
| Secrets | covered by convention | — |
| Environments | covered; app builds missing | L10 |
| CI/CD | server covered; app release and over-the-air updates missing | M20 |
| Observability and alerting | logging covered; alerting has no evaluator | M15 |
| Admin extension boundary | built-in screens bypass rules; content admin unaudited | C1, H10 |
| Notice versions against consent records | undefined | C3 |
| Time zones | storage covered; business day missing | M1 |
| Localisation | text source ambiguous; catalogue text and locale protocol missing | M8 |
| Accessibility | silent | L6 |
| Cost controls | Try-on cap can be overrun; SMS unbounded | M2, M10 |

### Contradictions

1. AD-2 (standard store API for checkout) against AD-7 (Order only from webhook) — C1.
2. AD-11 (no job without consent) against FR-43 — M5.
3. AD-10 (provider reached only through `generate` and `ResultCheck`) against AD-11 (erase provider copies) — H8.
4. AD-8 (one job system) against scheduled publishing in content — H11.
5. AD-3 (content refers to Designs by id) against the dependency diagram (no content-to-commerce arrow), which leaves the picker with nothing to read — H11.
6. Repository tree (`commerce/src/providers/messaging`) against the container diagram and AD-8 — H9.
7. Paradigm (`hold` module) against AD-3 (kernel) and the tree — M3.
8. Stack (content S3 plugin) against the container diagram (no content-to-storage arrow) — M6.
9. AD-19 (all cross-boundary shapes in contracts) against AD-2 (kernel's standard API shapes reach clients) — H5.
10. AD-15 (exactly one of three identities per route) against anonymous browsing and webhooks — M11.
11. AD-17 (versioned buckets) against AD-11 (erasure) unless the private media bucket is excluded — H8.
12. AD-20 against the app's build-time display name — L4.
13. Deferred "Cash on delivery" against AD-7 — L9.

## Counts

| Severity | Count |
| --- | --- |
| Critical | 3 |
| High | 11 |
| Medium | 22 |
| Low | 10 |
