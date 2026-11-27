## Epic 3: A complete shop: accounts, orders, returns and support

A Shopper signs in with a one-time code, checks delivery to her pincode, follows her Order, cancels or returns it, rates whether it matched, is told about every step, and can use her privacy rights. The Owner runs Orders, Returns, refunds, complaints and shop settings from the Admin.

**FRs covered:** FR-16 (complete), FR-17, FR-21 (complete), FR-22, FR-23 (complete), FR-26, FR-27, FR-28, FR-29, FR-47 (complete), FR-48 (complete), FR-49, FR-53, FR-54, FR-56, FR-59
**NFRs:** NFR-5, NFR-6, NFR-13

**Starting point.** Epic 1 left a working prepaid purchase (Hold, `confirm-payment`, invoice, basic Order states, shipping label and tracking, a basic Return with inspection, refund and credit note, admin sign-in with second factor, the route allow-list). Epic 1 also stood up `apps/content` behind its access gate, with admin accounts and an audit collection only (Story 1.23). Epic 2 left the full catalogue. This epic gives the content application its first documents and message templates and completes the shop around those parts. Try-on does not exist yet; where a story touches consent or erasure it says what Epic 4 adds to the same code.

**Conventions for every story in this epic.** Every new route, job payload, state and error code is first a zod schema in `packages/contracts` (AD-19). Every state change is a named workflow with tests for success, each failure and compensation (AD-4). Every state-changing Shopper request carries an `Idempotency-Key`. Shop routes change additively only (AD-27). No Shopper-facing text is in code: documents and message templates come from content, interface text from the translation bundles that content holds and commerce serves (Story 3.4) with the clients' built-in files as the fallback, and Design and Weaver text from commerce (AD-28). Wherever a story says the Owner is alerted, it enqueues a `message.send` job with the generic `owner.alert` template seeded in Story 3.5. Shopper-facing screens are described by behaviour only and are styled from DESIGN.md when it exists.

---

### Story 3.1: Extend the content application: service calls to commerce and an audit trail on every document

As an Owner,
I want the content admin that Epic 1 stood up to talk to the shop safely and to record every change I make to any document,
So that notices, policies and message texts have one home and no edit to them goes untraced.

**Acceptance Criteria:**

**Given** the content application of Story 1.23, already running on its own `content` database behind the access gate, with admin accounts, the lockout rule and an append-only audit collection
**When** this story is complete
**Then** nothing of Story 1.23 has been built again: the same application, database, gate and audit collection are extended
**And** content's configuration comes from environment variables checked at start against a zod schema; a missing variable stops the container with a message naming the variable
**And** it still has no connection string for the `commerce` database, and a test fails the build if one is configured (AD-1, AD-3)

**Given** a browser outside the private network
**When** it requests anything of content through Caddy
**Then** only the admin path is routed, and only past the access gate of Story 1.23; content's data API is reachable only on the private network

**Given** commerce or the worker calls content, or content calls commerce
**When** the call carries no service token or a wrong one
**Then** it is refused with the error envelope `{ code, message }`
**And** `/internal/*` on commerce accepts only a service token and is not routed by Caddy; each `/internal/*` route either starts a workflow or is a read-only lookup (AD-9)
**And** a Shopper token or a commerce admin session is never accepted by content (AD-15)

**Given** commerce needs a document or a message template from content
**When** it reads one
**Then** it does so through one read-only content reader in commerce, over the private network with a service token; no client and no worker job calls content directly (AD-2, AD-26)

**Given** the Owner creates, changes, publishes or deletes any content document, in any collection added from this story on
**When** the change is saved
**Then** one event is appended to content's audit collection with actor (the admin's email), time, action, before and after, in the same shape as a `shop-audit` event defined in `packages/contracts`, by one rule shared by every collection
**And** a test fails the build if a collection is added without that rule
**And** no user, including the Owner, can update or delete an audit event through the admin or the API; a test proves both are refused (AD-14)

**Given** a document collection that carries numbered versions
**When** it is defined
**Then** it uses one shared versioning helper created here: a draft, an integer version, a published time, and published versions that can no longer be edited; Story 3.2 gives it its first documents

**Requirements:** FR-59 (foundation), NFR-5, AD-1, AD-2, AD-3, AD-9, AD-14, AD-15, AD-16, AD-19
**Notes for the developer:**
- Builds on Story 1.23. Touches `apps/content` (environment check, the shared audit rule, the versioning helper, the service-token check), `apps/commerce` (the content reader, the service-token check on `/internal/*` if Story 1.14 left it for the worker only), `infra/` (Caddy routes only the admin path), `packages/contracts` (audit event shape, service-token header).
- The gate, the lockout and the second-factor outcome of spike item 7 are as Story 1.23 left them; keep the gate configurable. Gate credentials are environment variables.
- No document, template or screen collection is created here. They come in the stories that first need them (documents in Story 3.2, templates in Story 3.5, screens in Epic 5).
- Use the versions in the spine's Stack table; do not add a scheduler to content (AD-4, AD-12).

---

### Story 3.2: Notices, terms, policies and disclosures as numbered versions with translations

As an Owner,
I want to edit each legal document and its translations as numbered versions and publish them myself,
So that I can correct a policy or add a language without a release and always know which version a Shopper saw.

**Acceptance Criteria:**

**Given** the content admin
**When** the Owner opens the documents section
**Then** these document types exist: Try-on consent notice, terms of use, privacy policy, returns, refunds and cancellation policy, shipping policy, grievance redressal, and one disclosures record (legal name, registered address, GSTIN, support email, grievance officer name, email and phone, website address, jurisdiction city, helpline contact)
**And** each document has a draft, an integer version shared by all its translations, a published time, and one text per language, with English required

**Given** a draft whose meaning has changed
**When** the Owner publishes it as a new version
**Then** the version number rises by exactly one, the published text of every language is stored unchanged from then on, and earlier versions stay readable
**And** an attempt to edit a published version is refused; the Owner must start a new draft

**Given** a published version
**When** the Owner corrects or adds a translation and publishes it as a translation fix
**Then** the version number does not change, the fix is recorded in the audit collection with before and after, and the English text cannot be changed this way (AD-11)

**Given** a document text that contains a placeholder such as `{{LEGAL_ENTITY_NAME}}` or `{{RETURN_WINDOW_DAYS}}`
**When** the Owner publishes it
**Then** each placeholder is replaced from the published disclosures record or from the value commerce returns for a named setting, and the replaced text is what is stored for that version
**And** publishing is refused, naming the placeholders, while any placeholder has no value

**Given** a Try-on consent notice draft
**When** the Owner publishes a new version
**Then** it must carry a list of AI-service ids, and content calls `/internal/content/notice-published` on commerce with document key, version, service ids, time and the email of the content admin who published it
**And** commerce stores that record through the `record-notice-version` workflow, idempotent on key and version, which also writes a `shop-audit` event with that email as the actor; if the call fails, the publish is not shown as complete, the previous version stays the published one, and the Owner sees that commerce was not told and can retry

**Given** any other document type is published
**When** publishing completes
**Then** content tells commerce the key, version and time through `/internal/content/document-published`, and commerce records the latest published version of each document

**Given** content needs the list of configured languages to show one text field per language
**When** a document form is built
**Then** content reads the list from `/internal/settings/languages` on commerce, a read-only lookup created in this story and called with the service token (AD-9); the list is the `settings` value of Story 2.13 and content keeps no list of its own

**Given** commerce asks content for a document by key, language and optional version
**When** that language has no text
**Then** the English text of the same version is returned with the language actually served

**Requirements:** FR-59, NFR-14, AD-3, AD-9, AD-11, AD-13, AD-14
**Notes for the developer:**
- Touches `apps/content` (document collections, publish hooks), `apps/commerce` (`internal/content/*` routes, the `internal/settings/languages` lookup, the `record-notice-version` workflow that records notice versions in the `consent` module, which this story creates, and a workflow that records other documents' published versions in the `settings` module), `packages/contracts`.
- The rule "a new notice version makes every Shopper accept again before her next Try-on" is enforced by Epic 4's consent check against the record stored here; this story only stores it. Story 4.1 adds the retention period to the notice and the Shopper's read of it; it does not build the publish path again.
- No Shopper-facing page yet; that is Story 3.3. No message templates yet; that is Story 3.5.

---

### Story 3.3: Load the draft legal documents and show them, with the required disclosures, on the website

As a Shopper,
I want to read who I am buying from, how to complain, and the terms and policies, from any page,
So that I can trust the shop before I give it my number or my money.

**Acceptance Criteria:**

**Given** a fresh local or staging environment
**When** the content seed runs
**Then** the six drafts in `docs/legal/` (terms of use, privacy policy, Try-on consent notice, returns, refunds and cancellation policy, shipping policy, grievance redressal) are loaded as version 1 drafts in English, with their placeholders intact, and the disclosures record is created with the fields the 14 placeholders need
**And** running the seed twice creates nothing twice, and the seed never overwrites a document the Owner has edited

**Given** local or staging with the seed's sample disclosure values
**When** the seed is run with its publish option
**Then** version 1 of each document is published through the same publish path as Story 3.2
**And** in production the seed never publishes; the documents stay drafts marked "not yet reviewed by a lawyer" until the Owner publishes them

**Given** any website page
**When** a Shopper looks at the footer
**Then** she sees the shop's legal name, registered address, support contact, the grievance officer's name and contact, and links to the privacy policy, terms of use, returns policy, shipping policy and grievance page, all taken from the published disclosures and documents (FR-29)
**And** none of these values or texts is in website code, and the product name appears only in content and settings (AD-20)

**Given** a Shopper who is not signed in
**When** she opens a document link
**Then** `GET /store/shop/documents/{key}` returns the latest published version as a view model with title, text, version, published date and the language served, and the page shows the version and date
**And** a key with no published version returns `document.not_published` and the page says the document is not available, with the support contact

**Given** a Shopper whose language is Tamil and a document with no Tamil text
**When** she opens it
**Then** she sees the English text

**Given** the website
**When** any page is built or rendered
**Then** it reads documents and disclosures only through `packages/api-client`, never from content directly (AD-2)

**Requirements:** FR-29, FR-59, NFR-12, NFR-14, AD-2, AD-12 (commerce reads content), AD-20
**Notes for the developer:**
- Touches `apps/content` (seed script reading `docs/legal/*.md`), `apps/commerce` (`store/shop/documents`, `store/shop/disclosures`, both using the content reader of Story 3.1), `packages/api-client`, `apps/web` (footer, document page).
- A published version never changes, so commerce may cache a document by key, version and language.
- The Try-on consent notice is loaded and can be published, but nothing shows it to Shoppers until Epic 4.
- `{{AI_SERVICE_LIST}}` stays unfilled until the Approved-model list exists (Epic 4), so the notice and privacy policy seed values for it are sample text in local and staging only.
- Styled from DESIGN.md when it exists.

---

### Story 3.4: Interface wording as translation bundles the Owner changes without a release

As an Owner,
I want the website's own wording held as one bundle per language that I can edit and publish,
So that I can correct or translate any text a Shopper reads without a release.

**Acceptance Criteria:**

**Given** the content admin
**When** the Owner opens Interface translations
**Then** there is one translation bundle per configured language, the list read from the `/internal/settings/languages` lookup of Story 3.2, each holding a text for every interface text key
**And** each bundle uses the versioning helper of Story 3.1 (a draft, an integer version, a published time, published versions that cannot be edited), and every change is audited by the shared rule of Story 3.1 (AD-14)

**Given** a fresh environment
**When** the content seed runs
**Then** the English and Tamil bundles are loaded as version 1 from the website's built-in translation files (Stories 1.2 and 2.13), and on local and staging they are published
**And** running the seed twice creates nothing twice, and the seed never overwrites a bundle the Owner has edited
**And** a test fails if a key in the built-in English file is missing from the seeded English bundle

**Given** the Owner publishes a bundle
**When** publishing completes
**Then** its version rises by exactly one and content tells commerce the language, version and time through `/internal/content/document-published`, the route of Story 3.2; commerce records the latest published version for each language
**And** a text that drops a named placeholder which the English text carries is refused at publish, naming the key

**Given** a client asks for `GET /store/shop/translations/{language}`, signed in or not
**When** commerce answers
**Then** it returns the published bundle's version and texts as a view model defined in `packages/contracts`, read through the content reader of Story 3.1; no client calls content (AD-2)
**And** a client that sends the version it already holds receives a "not changed" answer without the texts
**And** a language that is not configured is refused with `translation.language_not_configured`, and a language with no published bundle answers `translation.not_published`

**Given** the website
**When** a page looks up a text key
**Then** the one lookup function of Story 2.14 takes the text from the cached bundle fetched through `getTranslations` in `packages/api-client`; if the bundle lacks the key it takes it from the built-in file for that language, and then from the built-in English file; a key is never shown in place of text (AD-28)
**And** the website asks commerce for a newer bundle version at most once every 5 minutes `[ASSUMPTION: the 5-minute interval; AD-28 says only that each client caches the bundle]`

**Given** the Owner changes one text in the Tamil bundle and publishes it
**When** a Shopper loads a page in Tamil after the next version check
**Then** she sees the new wording, with no deploy of the website and no restart; an automated test proves it on the local stack (NFR-14)

**Given** commerce or content cannot be reached, or no bundle has been published
**When** a page is rendered
**Then** the website uses its built-in copy and no page fails or waits on the bundle

**Given** a bundle text that contains markup or script
**When** a client shows it
**Then** it is shown as plain text; a bundle carries text only, never code

**Requirements:** NFR-14, FR-59 (translations); AD-2, AD-9, AD-14, AD-27, AD-28
**Notes for the developer:**
- Touches `apps/content` (the translation-bundle collection and its seed), `apps/commerce` (`store/shop/translations/{language}`, the recorded bundle versions in the `settings` module), `packages/contracts` (the bundle view model and the two error codes), `packages/api-client` (`getTranslations`), `apps/web` (the lookup function of Story 2.14).
- AD-28: interface text is a translation bundle per language, held in content and served through commerce; each client caches it and carries a built-in copy as a fallback. The built-in files stay in the repository and stay complete; they are what a client uses before its first fetch.
- The labels of the fixed colour list are keys in the bundle. Documents and message templates are not part of it; they keep their own collections (Stories 3.2 and 3.5). Design and Weaver text stays in commerce (Story 2.13).
- The Android app uses the same route and `getTranslations` with its own built-in copy; that is Story 6.3.
- Styled from DESIGN.md when it exists; the bundle changes words, never layout.

---

### Story 3.5: One way to send a message, with templates from content

As an Owner,
I want every SMS and email to be sent by one job from a text I can edit,
So that message wording never needs a release and nothing is sent twice.

**Acceptance Criteria:**

**Given** the content admin
**When** the Owner opens message templates
**Then** each template has a key, a channel (SMS or email), a purpose, a subject for email, a body with named variables, and one text per language with English required
**And** a template change is audited as in Story 3.1, and the seed creates the template `auth.sign-in-code` for SMS and one generic template `owner.alert` for each of SMS and email, with the purpose `owner-alert` and variables for what happened and where in the Admin to look

**Given** a commerce workflow, or the kernel's notification provider, needs to send a message
**When** it does so
**Then** it only enqueues a `message.send` job on the shop queue with template key, language, variables, channel and recipient reference, whose job id is the event id plus the channel (AD-26, AD-8)
**And** enqueuing the same event and channel twice results in one job and one message

**Given** the worker takes a `message.send` job
**When** it runs
**Then** it fetches the template through commerce (never from content directly), fills the variables, and sends through the SMS or email adapter in `apps/worker/src/providers`
**And** a missing variable or missing template fails the job without sending, and the failure is reported with the template key but no variable values

**Given** the adapter returns a temporary failure
**When** the job retries
**Then** it retries with back-off up to the configured number of attempts and the recipient receives at most one message
**And** the final outcome (sent or failed, time, channel, template key) is reported to `/internal/messages/outcome` and recorded against the kernel's notification record without the body, the variables or the recipient's number in any log or job result

**Given** a template whose purpose is not `transactional` or `owner-alert`
**When** a job names it
**Then** the job is refused with `message.purpose_not_allowed`, so that no marketing message can be sent (FR-54)

**Given** local, staging or continuous integration
**When** the SMS or email adapter runs in test mode
**Then** nothing leaves the system and the message is held in a test sink that tests can read
**And** each test-mode adapter has a test of its interface that runs before a deploy; the contract tests against the real vendors' test modes (NFR-11) are Story 3.6

**Requirements:** FR-54 (foundation), FR-59, NFR-11, AD-8, AD-9, AD-26
**Notes for the developer:**
- Touches `apps/content` (templates collection), `apps/commerce` (`providers/notification`, `internal/messages/*`, template read route for the worker), `apps/worker` (`jobs/message.send`, `providers/sms`, `providers/email`), `packages/contracts` (job payload, template keys).
- SMS and email vendors are undecided: write the `SmsSender` and `EmailSender` interfaces and a test-mode adapter for each here; the real vendor adapters and their contract tests are Story 3.6.
- Only the sign-in code template and the generic `owner.alert` template are created here. Every later story that alerts the Owner uses `owner.alert`, so no alert can fail for a missing template. Order, Return, refund and complaint templates are created by the stories that raise those events.
- Epic 1 sent no messages; it only recorded events such as `payment.auto-refunded`. Story 3.20 attaches messages to them.

---

### Story 3.6: Real SMS and email adapters, tested against each vendor's test mode

As a Shopper,
I want my sign-in code and my Order messages to really reach my phone and my inbox,
So that I can sign in and follow my Order once the shop is live.

**Acceptance Criteria:**

**Given** the spine leaves the SMS and email vendors undecided
**When** this story starts
**Then** it proceeds only if the founder has named both vendors and given test-mode credentials for each
**And** if either is missing, the developer stops and reports; no vendor is chosen by the developer

**Given** the `SmsSender` and `EmailSender` interfaces of Story 3.5
**When** this story is finished
**Then** one adapter per vendor in `apps/worker/src/providers` implements each interface, selected by an environment variable, and the test-mode adapters of Story 3.5 stay the default locally and in continuous integration
**And** no vendor-specific code exists outside those adapters, and no cloud vendor's SDK is added (AD-16)

**Given** the SMS adapter
**When** its contract tests run against the SMS vendor's test mode
**Then** sending a message is accepted, an invalid number is reported as a permanent failure, and a rate-limit or server error is reported as a temporary failure that the retry of Story 3.5 handles
**And** the tests are part of the checks run before a release (NFR-11)

**Given** the email adapter
**When** its contract tests run against the email vendor's test mode
**Then** sending a message with a subject and body, and sending one with a file attached, are accepted, and permanent and temporary failures are told apart in the same way
**And** the tests are part of the checks run before a release (NFR-11)

**Given** staging with both real adapters selected and the vendors in test mode
**When** a Shopper asks for a sign-in code
**Then** the `message.send` job goes through the real SMS adapter and its outcome is reported to `/internal/messages/outcome`
**And** where the vendor's test mode delivers to a registered number, the code arrives on the founder's own phone

**Given** a `message.send` job retried after the vendor accepted the message
**When** the adapter sends again
**Then** it passes the job id as the vendor's own reference or idempotency key where the vendor offers one, so the recipient gets one message; where the vendor offers none, that limit is written in `docs/`

**Given** the vendor refuses a message because the sender or the template is not registered
**When** the job ends
**Then** it fails with the reason `message.sender_not_registered`, reported with the template key and without the body, the variables or the recipient

**Given** `docs/`
**When** this story is finished
**Then** it records, for each vendor: the sender id, the registration each SMS template needs with the operator registry, the sending domain and its DNS records for email, every secret by name, and which of these steps the Owner must do herself and which are done `[ASSUMPTION: transactional SMS in India needs sender and template registration; confirm with the vendor]`

**Given** the worker's logs and job results
**When** they are searched after the contract tests
**Then** no mobile number, email address, code or message body appears in them

**Requirements:** FR-26, FR-54, NFR-11; AD-16, AD-26; Consistency Conventions (Vendors, Config and secrets)
**Notes for the developer:**
- Touches `apps/worker/src/providers/sms` and `providers/email` (one real adapter each), the worker's environment schema, continuous-integration configuration (the contract tests), `infra/` and `docs/`.
- Without this story no sign-in code can be sent in production, so checkout, order history and Try-on would be unreachable there. Story 7.15 only switches these adapters from the vendors' test credentials to the approved live sender; it builds no adapter.
- The adapters receive text already filled from the template by the `message.send` job; they hold no wording.
- The developer agent can close every criterion except the registrations the vendors require of the account holder; hand the story back with those listed in `docs/` as outstanding for the Owner.

---

### Story 3.7: Shop settings with effective dates

As an Owner,
I want to set the delivery region, the shipping charge rule, the return period and conditions and the Try-on limits in the Admin,
So that a business or legal decision changes a setting, not the software.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin with a second factor
**When** the Owner opens Shop settings
**Then** the page shows, each with its current value and effective date: delivery region; shipping charge rule; return period in days; return conditions; Try-on limit per Shopper per day; sign-in code rules; working days and the list of holidays; dispatch time in working days; the Owner's alert email and mobile number; business time zone
**And** on a fresh environment the values are: delivery region Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana and Puducherry; return period 7 days; Try-on limit 10 per day; code expiry 5 minutes; 3 codes per number in 10 minutes; working days Monday to Saturday with no holidays listed

**Given** the working days and holidays
**When** any deadline in working days is worked out
**Then** a working day is Monday to Saturday in the business time zone, excluding the holidays listed in settings, and one function in `packages/contracts` does the counting for every caller

**Given** the delivery region setting
**When** the Owner edits it
**Then** it accepts a list of states and territories, a list of six-digit pincodes to add, and a list of six-digit pincodes to exclude
**And** a pincode that is not six digits is refused with the field named

**Given** the shipping charge rule
**When** the Owner edits it
**Then** it accepts a flat charge and an optional Order value from which shipping is free, both in whole rupees and stored as integer paise that are multiples of 100 (AD-5)

**Given** the return conditions
**When** the Owner edits them
**Then** the Owner can add or remove other return reasons and set a return shipping charge for them in whole rupees
**And** "Not as shown" and "Defective or wrong item" cannot be removed, renamed in meaning or given a charge; an attempt is refused with `settings.always_accepted_reason` (FR-23)

**Given** the Owner saves a change with an effective date of today or later
**When** that date begins in the business time zone
**Then** every read of the setting returns the new value without a release, and before that date returns the old one
**And** a change dated in the past is refused

**Given** any saved change
**When** it is stored
**Then** it runs as the workflow `update-setting`, keeps the earlier values as history, and records a `shop-audit` event with the Owner's email, time, before and after (FR-56, AD-14)
**And** the page shows the history of each setting

**Given** code anywhere in commerce needs one of these values
**When** it reads it
**Then** it reads the settings module as of the present time; a test searches the code for the literal defaults and fails if one is hardcoded outside the seed (AD-13)

**Requirements:** FR-56, NFR-10, AD-4, AD-13, AD-14, AD-20
**Notes for the developer:**
- Touches the `settings` module in `apps/commerce` (add these keys to the dated-settings mechanism Epics 1–2 used for Hold length, tax bands and working days; create only the keys that do not exist yet: the shipping charge rule was created and seeded by Story 2.21 and the language list by Story 2.13, and this story makes them editable), `src/admin` (settings page), `packages/contracts` (setting schemas, the working-day function).
- Working days follow the spine's Consistency Conventions; Story 1.20 seeded them and this story makes them editable. `[ASSUMPTION: a dispatch time of 2 working days, used for delivery dates; the PRD gives none]`.
- The Try-on limit is stored and audited here; Epic 4 enforces it and adds the daily spending cap.
- The settings are consumed in later stories: region and charge in Story 3.11, return period and conditions in Story 3.15, code rules in Story 3.8.
- `update-setting` is the workflow for every dated setting. A later setting reuses it unless its story names a workflow of its own because the change needs extra checks, as tax bands do (Story 2.5).

---

### Story 3.8: Sign in with a mobile number and a one-time code

As a Shopper,
I want to sign in with my mobile number and a code sent to it,
So that I can check out and see my Orders without remembering a password.

**Acceptance Criteria:**

**Given** a Shopper who is not signed in
**When** she browses, searches, opens a Design, opens the Full saree view or adds a Piece to her cart
**Then** she is never asked to sign in (FR-26, NFR-13)
**And** when she begins checkout or opens order history she is asked to sign in, and after signing in she is returned to where she was with her cart unchanged

**Given** she enters a valid Indian mobile number
**When** she asks for a code
**Then** a code is created, stored only as a hash, and sent as a `message.send` job with the template `auth.sign-in-code` (AD-26)
**And** the response is the same whether or not an account exists for that number
**And** a number that is not a valid mobile number is refused with `auth.mobile_invalid` and no message is sent

**Given** 3 codes have been sent to a number within 10 minutes
**When** a fourth is requested
**Then** it is refused with `auth.too_many_codes` and the time she can try again, and no message is sent
**And** the limits are read from settings, enforced in commerce middleware

**Given** a code was sent less than 5 minutes ago
**When** she enters it correctly
**Then** she is signed in through the kernel's customer auth with the one-time-code provider, and a Shopper account is created if the number is new
**And** the code cannot be used again

**Given** a code was sent 5 minutes ago or more
**When** she enters it
**Then** it is refused with `auth.code_expired` and she is offered a new code

**Given** a live code
**When** she enters a wrong code
**Then** it is refused with `auth.code_invalid`; after the number of wrong attempts set in settings the code is cancelled and she must ask for a new one
**And** asking for a new code cancels the earlier one

**Given** a Shopper whose requests carry her language (Story 2.14)
**When** her code is verified
**Then** the workflow `save-shopper-language` saves that language on her Shopper account, and every later message to her is enqueued with it; the sign-in code itself is sent in the language of the request that asked for it
**And** when a signed-in Shopper changes language with the control of Story 2.14, the control calls the same workflow through `packages/api-client`; a language that is not configured is refused

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (it no longer signs a Shopper up with an email and a password; it signs her in with a one-time code read from the SMS adapter's test sink) and passes, so that deploys are not blocked

**Given** a signed-in Shopper's token
**When** it is sent to an admin route, an `/internal/*` route or the content admin
**Then** it is refused; and an admin session or service token is refused by Shopper routes (AD-15)

**Given** the whole sign-in flow has run in a test
**When** the logs, job results and error reports are searched
**Then** neither the code nor the full mobile number appears in any of them

**Given** a signed-in Shopper
**When** she signs out
**Then** her session ends on that device and her cart stays with her account

**Requirements:** FR-26, FR-54 (sign-in code), NFR-13, AD-13, AD-15, AD-19, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`providers/one-time-code`, rate-limit middleware, `store/shop/auth/*`, the `save-shopper-language` workflow and the language on the Shopper account), `packages/api-client`, `apps/web` (sign-in step, the language control of Story 2.14), and the end-to-end test of Story 1.27.
- Replaces the email-and-password customer sign-in of Story 1.2 behind the same `api-client` functions and removes its sign-up page; `begin-checkout` already requires a signed-in Shopper.
- The reviewer account with a fixed sign-in code (spine, Consistency Conventions: App-store review) is added to this provider by Story 7.13; leave one place in the verification step where it can be checked.
- An anonymous cart is attached to the account at sign-in when the account has no cart; merging two carts is Story 3.10. Terms acceptance is Story 3.9.
- Test through the SMS adapter's test sink. Styled from DESIGN.md when it exists.

---

### Story 3.9: Accept the terms at first sign-in, change mobile number, give an email

As a Shopper,
I want to accept the terms once, clearly, and keep my contact details right,
So that I know what I agreed to and my invoices and messages reach me.

**Acceptance Criteria:**

**Given** a Shopper signing in for the first time
**When** her code is verified
**Then** she is shown one step that links to the terms of use and the privacy policy and asks her to accept both by her own action; nothing is pre-ticked (NFR-13)
**And** this step does not mention or include Try-on consent (FR-8 is separate)

**Given** she accepts
**When** the acceptance is stored
**Then** the workflow `record-terms-acceptance` writes two records of the `consent` module, one for the terms of use and one for the privacy policy, each holding the Shopper, the document type, the version, the language shown and the time (AD-31)
**And** she continues to where she was going

**Given** she has not accepted
**When** she calls checkout or order-history routes
**Then** they return `terms.acceptance_required`
**And** if she declines or leaves, she is signed out and is asked again at her next sign-in; browsing still works

**Given** no terms of use or privacy policy version is published
**When** a new Shopper reaches the acceptance step
**Then** she is told sign-in is not available right now, no acceptance is recorded, and the Owner is alerted by a `message.send` job

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (its Shopper accepts the terms of use and the privacy policy at first sign-in, with version 1 of both published by the seed of Story 3.3) and passes, so that deploys are not blocked

**Given** a Shopper who accepted version 1
**When** she signs in again
**Then** she is not asked again, and her record still shows version 1

**Given** a signed-in Shopper who wants to change her mobile number
**When** she enters the new number
**Then** a code is sent to the new number under the same limits as Story 3.8, and the number changes only when she enters that code correctly within 5 minutes
**And** if the new number already belongs to another account the change is refused with `auth.mobile_in_use` after the code is verified, and nothing changes
**And** on success a message goes to the old number saying the number on the account was changed, and her Orders and cart stay with her

**Given** a Shopper at checkout
**When** she reaches the contact step
**Then** she is asked for an email address so the invoice can be sent, she can leave it empty and continue, and nothing about the email is pre-filled or pre-ticked
**And** an address that is not a valid email is refused with the field named; a valid one is saved on her account by a workflow and can be changed or removed from her account page

**Requirements:** FR-26, FR-29, NFR-13, AD-4, AD-11 (versions), AD-15, AD-26, AD-31
**Notes for the developer:**
- Touches the `consent` module in `apps/commerce` (the acceptance record with document type, version, language and time; Story 3.2 already keeps notice versions in this module, and Epic 4 records Try-on consent as the same kind of record), `store/shop/account/*`, `packages/api-client`, `apps/web` (acceptance step, account page, checkout contact step).
- Acceptances of terms, policies and the Try-on consent notice all live in the `consent` module (AD-31).
- The PRD asks for acceptance at first sign-in only; asking again when a new terms version is published is not built.
- Adds the template `account.mobile-changed`. Styled from DESIGN.md when it exists.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.10: One cart on every device

As a Shopper,
I want my cart to be the same on my phone and my laptop once I sign in,
So that I can choose on one and pay on the other.

**Acceptance Criteria:**

**Given** a Shopper who is not signed in and has Pieces in her cart
**When** she closes the browser and opens the website again on the same device
**Then** her cart has the same Variants and quantities (FR-16)

**Given** a signed-in Shopper with a cart
**When** she signs in on a second device
**Then** she sees the same cart, and a change made on one device is shown on the other the next time the cart is loaded

**Given** she has an anonymous cart on this device and her account already has a cart
**When** she signs in
**Then** the workflow `merge-cart` leaves her one cart: quantities of the same Variant are added, and each quantity is cut to the Pieces available
**And** she is told which quantities were cut, and the anonymous cart no longer exists
**And** running the merge twice gives the same cart

**Given** her account's cart has a live Hold because a Checkout is in progress on another device
**When** she signs in on this device with an anonymous cart
**Then** the cart under Hold is not changed (AD-6); she is told a payment is in progress, and the anonymous items are merged once the Hold has ended
**And** any attempt to add, change or remove a line while the Hold is live returns `cart.locked`, the code Story 1.9 defined for this case

**Given** a Variant with 2 Pieces available
**When** she sets its quantity to 3
**Then** the request is refused with `cart.quantity_exceeds_stock` and the available number, and the cart keeps its earlier quantity

**Given** a Variant in her cart has sold out or changed price since she added it
**When** she opens the cart
**Then** the line is flagged with what changed, and she must accept the change or remove the line before payment can begin (FR-19)

**Given** she removes the last line
**When** the cart is loaded on any device
**Then** it is empty

**Requirements:** FR-16, FR-19, AD-2, AD-4, AD-6, AD-21
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/merge-cart`, `store/shop/cart` view model and the cart middlewares), `packages/api-client`, `apps/web` (cart).
- Cart line edits use the kernel cart routes already on the allow-list; add none without updating the list in `packages/contracts` (AD-21).
- Availability is stocked minus reserved, computed on the server; the client never computes it.
- Styled from DESIGN.md when it exists.

---

### Story 3.11: Delivery check by pincode, with dates and the shipping charge shown early

As a Shopper,
I want to enter my pincode and learn whether you deliver to me, when, and what shipping costs,
So that I do not reach payment and find out I cannot have the saree.

**Acceptance Criteria:**

**Given** a Shopper on a Design page or in her cart, signed in or not
**When** she enters a six-digit pincode inside the delivery region that the shipping service serves
**Then** `GET /store/shop/delivery-check` answers that Alar delivers there, with an earliest and a latest delivery date (FR-17)
**And** the dates are worked out on the server from today in the business time zone, the dispatch time in working days from settings, and the shipping adapter's shortest and longest transit time; the earliest date is never after the latest

**Given** a pincode whose state is not in the delivery region, or that is on the excluded list
**When** she checks it
**Then** the answer is `delivery.outside_region` with a clear message that Alar does not deliver there yet, and no dates

**Given** a pincode inside the region that the shipping service does not serve
**When** she checks it
**Then** the answer is `delivery.not_serviceable` with a clear message, and no dates

**Given** an entry that is not six digits
**When** she checks it
**Then** it is refused with `delivery.pincode_invalid` and the shipping adapter is not called

**Given** the shipping adapter fails or does not answer in time
**When** she checks a pincode
**Then** she is told the check is not available right now; she is never told "yes" without an answer from the adapter

**Given** her cart
**When** she views it before beginning checkout
**Then** the shipping charge from the shipping charge rule is shown as its own line with the total, in whole rupees, and "free" when the rule makes it free (FR-5, NFR-13)
**And** the total in the Checkout snapshot equals the total she was shown; a test fails if any charge appears in the snapshot that was not in the cart view

**Given** she begins checkout with a delivery address
**When** `begin-checkout` runs
**Then** it repeats the delivery check on the address pincode before it places a Hold, and refuses with the same error codes, so that no Hold is placed and no money is taken for an address Alar cannot deliver to
**And** the earliest and latest dates are saved in the Checkout snapshot and shown on the Order
**And** the snapshot also records the language of the Shopper's request, so that a message about this Checkout or its Order still has a language after her account is deleted

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (its delivery address has a pincode inside the delivery region that the shipping adapter's test mode serves, and it asserts that a pincode outside the region is refused before a Hold) and passes, so that deploys are not blocked

**Given** a change to the delivery region setting takes effect
**When** the same pincode is checked again
**Then** the answer follows the new region without a release

**Requirements:** FR-17, FR-5, FR-56, NFR-13, AD-2, AD-5, AD-13, AD-24 (shipping adapter)
**Notes for the developer:**
- Touches `apps/commerce` (`providers/shipping`: add `checkServiceability(pincode)` returning state, serviceable, and transit days; `store/shop/delivery-check`; `begin-checkout` step), `packages/api-client`, `apps/web` (Design page, cart, checkout).
- The shipping vendor is a setting: write against the adapter interface and its test mode with fixture pincodes; add a contract test (NFR-11).
- The shipping line in the cart was built by Story 2.21 and the charge rule made editable by Story 3.7; this story adds only the test that the snapshot total equals the cart total.
- The Design page's "delivery estimate" (FR-3) uses this route once a pincode has been entered and remembers the last pincode on the device.
- Tax on a shipping charge is an open question for the accountant; use the money functions in `packages/contracts` as they stand and do not compute tax anywhere else (AD-5).
- Styled from DESIGN.md when it exists.

---

### Story 3.12: All Order states, driven by the shipping service

As a Shopper,
I want my Order's state to move by itself as the parcel moves,
So that what I see is true without anyone at the shop typing it in.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is complete
**Then** the Order state enum and transition table that Story 1.10 created are extended, not created again, so that the enum holds exactly Paid, Packed, Dispatched, Out for delivery, Delivered, Delivery failed, Returned to shop, Cancelled, Refunded, with one table of allowed transitions: Paid→Packed; Paid→Cancelled; Packed→Dispatched; Packed→Cancelled; Dispatched→Out for delivery; Dispatched→Delivery failed; Out for delivery→Delivered; Out for delivery→Delivery failed; Delivery failed→Out for delivery; Delivery failed→Returned to shop; Cancelled→Refunded; Returned to shop→Refunded; and Dispatched, Out for delivery, Delivery failed or Delivered→Refunded. Every transition into Refunded happens only when the total refunded for the Order equals the total paid; any smaller refund is recorded against the Order or its Return and the Order keeps its state (AD-24, AD-31)
**And** one workflow performs each transition, refuses any transition not in the table with `order.transition_not_allowed`, and writes a state-history row with the time and the cause

**Given** an Order in Dispatched
**When** the shipping service's webhook reports out for delivery, then delivered
**Then** the Order moves to Out for delivery, then Delivered, without any Owner action (FR-21)
**And** the delivered time is stored on the Order

**Given** a webhook from the shipping service
**When** its signature or token cannot be verified
**Then** it is refused and nothing changes
**And** a verified event received twice changes the state once (idempotent on the shipping service's event id)

**Given** events arrive out of order, or an event maps to a transition the table does not allow
**When** the event is handled
**Then** the Order state is unchanged, the event is stored against the shipment, and no error is returned to the shipping service

**Given** the shipping service reports an event type that is not in the adapter's mapping table
**When** it is handled
**Then** it is stored, the Owner is alerted once per event type per day, and no state changes

**Given** a failed delivery attempt
**When** the event is handled
**Then** the Order moves to Delivery failed and stores what happens next: the date of the next attempt when the shipping service gives one, or that the parcel is coming back to the shop

**Given** the shipping service reports the parcel returned to the shop
**When** the event is handled
**Then** the Order moves to Returned to shop and the workflow `refund-undeliverable-order` refunds the full amount paid, including any shipping charge, to the payment method used, creates a credit note linked to the invoice, and moves the Order to Refunded when the refund is started
**And** if the payment service refuses the refund, the Order stays Returned to shop, the Owner is alerted, and a retry does not refund twice
**And** the Pieces are not added back to available stock by this workflow (FR-25)

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (it runs against the extended transition table, and a second run asserts that a parcel reported back at the shop ends in Returned to shop, then Refunded, with one refund of the whole amount paid) and passes, so that deploys are not blocked

**Given** the only table that maps shipping events to transitions
**When** the code is searched
**Then** it is in the shipping adapter and nowhere else, and clients receive the state from the server and never derive it

**Requirements:** FR-21, FR-24, FR-25, AD-4, AD-6, AD-7, AD-24, AD-25
**Notes for the developer:**
- Touches `packages/contracts` (states, transition table, events), `apps/commerce` (`order-state` module, transition workflows, `providers/shipping` event mapping, `api/webhooks/shipping`).
- Extends the states of Story 1.10 and the transition workflows and shipping mapping table of Stories 1.15, 1.16 and 1.17; migrate existing Orders without changing their state.
- `refund-undeliverable-order` reuses the refund-to-source and credit-note steps of `refund-order` (Story 1.20). It replaces Story 1.21's rule that an Order in Returned to shop is refunded when the Owner records its inspection: the refund now starts from the shipping event, and inspection governs only restocking (Story 3.17).
- Test with the adapter's test mode and recorded events. Paid→Packed, Packed→Dispatched and the two Cancelled transitions are exercised from the Shopper side in Story 3.14 and from the Admin in Story 3.17; inspection of undelivered Pieces is in Story 3.17.
- Messages for these events are added in Story 3.20; raise the events (`order.dispatched`, `order.delivered` and so on) here.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.13: Order history and tracking for the Shopper

As a Shopper,
I want to see all my Orders and exactly where each one is,
So that I do not have to call anyone to find out.

**Acceptance Criteria:**

**Given** a signed-in Shopper who has accepted the terms
**When** she opens order history
**Then** she sees her Orders, newest first, each with Order number, date, total in whole rupees, the Designs bought and the current state named exactly as in the Glossary
**And** a Shopper who is not signed in is asked to sign in; a Shopper can never read another Shopper's Order (a request for one returns `order.not_found`)

**Given** she opens one Order
**When** the page loads
**Then** she sees every state the Order has been through with its time shown in the business time zone, the expected delivery dates from the Checkout snapshot, the delivery address, the shipping service's tracking number and link once a label exists, each line with its price, the shipping charge, and the total
**And** she can download the tax invoice through a signed link valid for at most 10 minutes; the link is created on request and never stored in the page (AD-22)

**Given** an Order in Delivery failed
**When** she opens it
**Then** she sees what happens next: the next attempt date, or that the parcel is returning to the shop and she will be refunded in full

**Given** an Order in Returned to shop, Cancelled or Refunded
**When** she opens it
**Then** she sees the refund amount and when the refund was started, or that it has not started yet (FR-24)

**Given** the shipping service changes the Order's state while she has the page open
**When** she reloads or returns to the page
**Then** the new state is shown; the page never works out a state from tracking events itself

**Given** a Shopper with no Orders
**When** she opens order history
**Then** she sees that she has no Orders yet and a way back to the Designs

**Given** the largest system font size or a screen reader
**When** she uses these pages
**Then** every action has a label and no text is cut off (NFR-15)

**Requirements:** FR-21, FR-20 (invoice download), FR-24, AD-2, AD-19, AD-22, AD-24
**Notes for the developer:**
- Touches `apps/commerce` (`store/shop/orders`, `store/shop/orders/{id}`, invoice link route), `packages/contracts` (Order view models), `packages/api-client`, `apps/web` (order history, Order page).
- Reading her own Orders is not an admin read, so no access event is written here.
- The buttons to cancel, return and rate are added by Stories 3.14, 3.15 and 3.21; leave their places empty.
- Styled from DESIGN.md when it exists.

---

### Story 3.14: Cancel an Order before dispatch

As a Shopper,
I want to cancel an Order that has not left the shop and get all my money back,
So that a change of mind costs me nothing.

**Acceptance Criteria:**

**Given** her Order is Paid or Packed
**When** she opens it
**Then** she can cancel it, and before she confirms she is told she will be refunded in full to the payment method she used (FR-22)

**Given** she confirms
**When** the workflow `cancel-order` runs
**Then** under the lock of AD-6 the Order moves to Cancelled, its Pieces are released and one stock-movement row per Variant is written with cause "cancellation" and the Shopper as actor
**And** a refund of the full amount paid, including any shipping charge, is started to the payment method used; a credit note linked to the invoice is created (AD-25); and the Order moves to Refunded when the payment service accepts the refund
**And** the released Pieces are available to other Shoppers at once, because they never left the shop

**Given** her Order is Dispatched or any later state
**When** she opens it
**Then** no cancel action is offered, and a cancel request returns `order.cannot_cancel_after_dispatch` with a pointer to Returns

**Given** the Owner marks the Order Dispatched at the same moment she cancels
**When** both workflows run
**Then** exactly one succeeds; the Order is never both Dispatched and Cancelled, and stock is changed once

**Given** the payment service refuses or does not answer the refund request
**When** `cancel-order` reaches the refund step
**Then** the Order stays Cancelled, the Owner is alerted by a `message.send` job, and a retry with the same idempotency key does not refund twice
**And** a refund not started by the end of the second working day after cancellation is listed as overdue for the Owner (FR-24)

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (a second purchase is cancelled by the Shopper while Paid, and the test asserts Cancelled, then Refunded, one credit note, and the Piece available again) and passes, so that deploys are not blocked

**Given** she sends the same cancel request twice
**When** the second arrives
**Then** it returns the same result and nothing is refunded twice

**Given** a shipping label already exists for a Packed Order
**When** the Order is cancelled
**Then** the shipment is cancelled through the shipping adapter; if that fails, the Order is still Cancelled and the Owner is alerted to stop the parcel

**Requirements:** FR-22, FR-24, FR-36, AD-4, AD-6, AD-7, AD-24, AD-25
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/cancel-order`, created here as the stock workflow AD-6 names, with refund and credit-note steps; `store/shop/orders/{id}/cancel`; `providers/shipping` cancel-shipment), `packages/api-client`, `apps/web` (Order page).
- Reuses the refund-to-source and credit-note steps of `refund-order` (Story 1.20); do not write a second refund path. Working days are counted by the function of Story 3.7.
- Raise `order.cancelled` and `refund.started`; their messages are added in Story 3.20. The overdue list itself appears on the Owner's refund page in Story 3.19; here, store what that page will need (cancelled time, refund started time).
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.15: Request a Return and book a pickup

As a Shopper,
I want to ask to send a saree back, say why, and book a pickup from my Order page,
So that a saree that disappointed me is collected without argument.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is complete
**Then** the Return state enum and transition table that Story 1.18 created are extended, not created again, so that the enum holds exactly Requested, Pickup booked, Picked up, Received, Accepted, Rejected, Refunded, with the allowed transitions Requested→Pickup booked; Pickup booked→Picked up; Picked up→Received; Received→Accepted; Received→Rejected; Accepted→Refunded, each performed by one workflow (AD-24)

**Given** a Delivered Order whose return period has not ended
**When** the Shopper opens it
**Then** she can request a Return for one or more items and quantities, and she is shown the last day she can do so
**And** the return period is the number of days stored in the Checkout snapshot when she paid (7 at launch), counted from the delivered time to the end of that day in the business time zone (AD-13)

**Given** the return period has ended, or the Order is not Delivered
**When** she tries to request a Return
**Then** no action is offered and a request returns `return.period_ended` or `return.order_not_delivered`
**And** an item already in a Return that is not Rejected cannot be requested again (`return.already_requested`)

**Given** she is choosing a reason
**When** the reasons are shown
**Then** "Not as shown" and "Defective or wrong item" are always present, and return shipping for them is shown as free (FR-23)
**And** any other reason comes from the return conditions setting, with its conditions and its return shipping charge shown before she confirms; nothing is added after she confirms (NFR-13)

**Given** she confirms with a reason and an optional comment
**When** the workflow `request-return` runs
**Then** a Return is created in Requested with the items, reason, comment, the return shipping charge that applied (zero for the two always-accepted reasons) and the time
**And** a request with an always-accepted reason is never refused at this step for the state of the saree

**Given** a Return in Requested
**When** she chooses a pickup date from those the shipping adapter offers for her address and confirms
**Then** the pickup is booked through the shipping adapter and the Return moves to Pickup booked, with the pickup date and reference shown to her
**And** if the adapter cannot book, the Return stays Requested, she is told the shop will arrange the pickup, and the Owner is alerted

**Given** the shipping service reports the parcel collected
**When** the event is handled through the adapter's mapping table
**Then** the Return moves to Picked up without Owner action, and she sees each state with its time, named exactly as in the Glossary

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (the Return is requested through `request-return` inside the return period stored in the Checkout snapshot, and the pickup is booked on a date the shipping adapter offers) and passes, so that deploys are not blocked

**Given** a Design page and the checkout review step
**When** a Shopper views them
**Then** the return period in days and the return conditions are shown with a link to the returns policy, read from settings and content (FR-23)

**Requirements:** FR-23, FR-21, FR-56, NFR-13, AD-4, AD-13, AD-24
**Notes for the developer:**
- Touches `packages/contracts` (Return states, transitions, reasons), `apps/commerce` (`order-state` module Return entity completed, `workflows/request-return` and `workflows/book-return-pickup`, both named in Story 1.18 and completed here, `providers/shipping` pickup slots and booking, `store/shop/returns`), `packages/api-client`, `apps/web`.
- Extends Epic 1's basic Return; migrate existing Returns to the nearest state. `begin-checkout` must now write the return period into the Checkout snapshot.
- Received, Accepted, Rejected and Refunded are moved by the Owner in Story 3.18; the Shopper's page must already show them when they occur.
- The glossary has no state for a Return the Shopper withdraws, so withdrawing is not built. Styled from DESIGN.md when it exists.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.16: Record every Admin read of personal data

As an Owner,
I want every look at a Shopper's personal data in the Admin to be recorded,
So that I can show who saw what and when if a Shopper or an authority asks.

**Acceptance Criteria:**

**Given** `packages/contracts`
**When** this story is complete
**Then** an access event schema exists with actor (admin email), time, the Shopper concerned, the kind of data read (for example Order contact details, address, complaint, inspection photo) and the route, and it never holds the data itself, a photo, a link or a mobile number (NFR-5, NFR-6)

**Given** an admin route marked in code as returning personal data
**When** the Owner calls it successfully
**Then** one access event is recorded in `shop-audit` by a workflow
**And** if the event cannot be recorded, the request fails with `audit.unavailable` and returns no personal data

**Given** an admin list route that shows many Shoppers
**When** it is called
**Then** it returns mobile numbers masked to the last four digits and records one access event for the list, not one per row; opening one record shows the full details and records an access event for that Shopper

**Given** a new admin route under `admin/shop/*`
**When** continuous integration runs
**Then** a test fails unless the route is declared as either "returns personal data" or "returns no personal data"

**Given** any role or route
**When** it tries to update or delete an access event or an audit event
**Then** it is refused, and no job removes events younger than one year (AD-14)

**Given** the Owner opens the access log page
**When** the Owner filters by Shopper or by date
**Then** the matching events are listed, newest first
**And** opening the access log does not itself read a Shopper's data and writes no event

**Requirements:** NFR-5, NFR-6, AD-4, AD-14
**Notes for the developer:**
- Touches `apps/commerce` (`shop-audit` module: access event entity; an admin middleware and a route declaration helper; `src/admin` access log page), `packages/contracts`. The staging checks of encryption in transit and at rest (TLS, the `documents` bucket, backup and volume encryption) are made once, in Story 7.9.
- Uses the `shop-audit` module of Story 1.22, which already records a first access event when the Owner opens an Order; this story gives the access event its schema, the route declaration helper, the masking rule and the log page, and brings that first event under them.
- Purging events older than one year is not built: how the one-year duty sits with erasure is a question for the lawyer (NFR-6).
- Every later Admin story in this epic declares its routes with this helper. Shopper photos do not exist until Epic 4, which marks its own routes the same way.

---

### Story 3.17: The Owner's Orders page: find, pack, label, dispatch, cancel, inspect

As an Owner,
I want one page where I find any Order and send it out,
So that packing and dispatch take minutes and I never retype an address.

**Acceptance Criteria:**

**Given** the Owner is signed in to the Admin with a second factor
**When** the Owner opens Orders
**Then** Orders are listed newest first with Order number, date, state, total and masked mobile number, and can be filtered by any Order state (FR-47)
**And** a search by exact Order number or by full mobile number returns the matching Orders; a search with no match says so

**Given** the kernel's built-in order, fulfilment, payment and refund screens
**When** the Owner uses the Admin
**Then** those screens are hidden and their routes for editing stock, payments and refunds are not on the allow-list; only the shop pages act on Orders (AD-21)

**Given** an Order in Paid
**When** the Owner marks it packed
**Then** it moves to Packed through its workflow and a `shop-audit` event records the Owner, time, before and after

**Given** an Order in Paid or Packed
**When** the Owner creates a shipping label
**Then** the label is created through the shipping adapter from the Order's address and items with nothing retyped, the tracking number is stored, and the label can be opened for printing
**And** if the adapter refuses (for example the address is not serviceable), the reason is shown, the Order's state does not change and nothing is half-created
**And** creating a label twice returns the same label

**Given** a Packed Order with a label
**When** the Owner marks dispatch
**Then** `fulfil-order` moves it to Dispatched under the lock of AD-6 and writes the stock movements
**And** marking dispatch without a label is refused with `order.label_required`

**Given** an Order in Paid or Packed
**When** the Owner cancels it and enters a reason
**Then** the same `cancel-order` workflow as Story 3.14 runs, with the Owner as actor and the reason recorded

**Given** an Order in Returned to shop or Refunded after an undelivered parcel
**When** the Owner records the inspection of each Piece as "sellable" or "damaged"
**Then** each result is handed to `restock-return`, the only workflow that writes these stock-movement rows (AD-6): for "sellable" the Piece becomes available with a stock movement of cause "undelivered, inspected"; for "damaged" stock is unchanged, a stock movement of cause "undelivered, damaged" is written, and the Piece is not returned to stock (FR-25)
**And** until inspection is recorded, those Pieces are not available to Shoppers

**Given** the Owner opens one Order
**When** the page loads
**Then** it shows the state history, lines, totals, invoice and credit notes, shipment events, any Returns and refunds, and the Shopper's name, mobile number and address
**And** an access event is recorded as in Story 3.16

**Requirements:** FR-47, FR-25, FR-36, NFR-10, AD-4, AD-6, AD-14, AD-21, AD-24
**Notes for the developer:**
- Touches `apps/commerce` (`admin/shop/orders/*`, `src/admin` Orders pages, `providers/shipping` label creation hardened), `packages/contracts`.
- Completes Epic 1's first Orders page; keep its workflows and extend them.
- Returns are handled on their own page in Story 3.18; refunds and disputes in Story 3.19. Show links to them here only as read-only summaries.

---

### Story 3.18: The Owner's Returns page: receive, inspect, accept or reject with photos

As an Owner,
I want to move each Return through its states and record what I found on inspection,
So that a fair return is refunded quickly and an unfair one is explained with evidence.

**Acceptance Criteria:**

**Given** the Owner opens Returns
**When** the page loads
**Then** Returns are listed with their state, reason, Order number and age, and can be filtered by any Return state (FR-47)
**And** opening one Return records an access event

**Given** a Return in Requested whose pickup could not be booked
**When** the Owner books the pickup from the page
**Then** the same `book-return-pickup` workflow runs and the Return moves to Pickup booked

**Given** a Return in Picked up
**When** the parcel arrives and the Owner marks it received
**Then** the Return moves to Received

**Given** a Return in Received
**When** the Owner records the inspection as passed
**Then** the workflow `accept-return` moves it to Accepted and starts the refund to the payment method used: the price paid for the returned items, less the return shipping charge stored on the Return (zero for "Not as shown" and "Defective or wrong item")
**And** a credit note linked to the original invoice is created, and the Return moves to Refunded when the payment service accepts the refund (FR-24)
**And** the Order moves to Refunded only when the total refunded for the Order equals the total paid; otherwise, as when a return shipping charge was deducted or a shipping charge paid is not refunded, the refund shows on the Return and the Order keeps its state (AD-31)
**And** the Owner then records each Piece as "sellable" or "damaged", and `restock-return` runs with that result: it returns a sellable Piece to stock and, for a damaged one, writes the stock-movement row without returning it (FR-25, AD-6)

**Given** a Return in Received
**When** the Owner records the inspection as failed
**Then** a reason and at least one photo are required; without them the action is refused with `return.rejection_needs_reason_and_photo`
**And** the workflow `reject-return` moves the Return to Rejected, no refund is made, the Pieces are not returned to stock, and a shipment back to the Shopper's address is created through the shipping adapter with its tracking number stored

**Given** her Return is Rejected
**When** the Shopper opens it on her Order page
**Then** she sees the reason, the inspection photos through signed links valid for at most 10 minutes, and the tracking of the parcel coming back to her (FR-23)

**Given** an inspection photo is uploaded
**When** it is stored
**Then** it is uploaded with a single-use signed upload link limited by size and image type, kept as a file in the private `documents` bucket linked to the Return (AD-31), and is never reachable by a public URL (AD-22)

**Given** the payment service refuses the refund in `accept-return`
**When** the workflow reaches that step
**Then** the Return stays Accepted, the Owner is alerted, and a retry does not refund twice

**Given** the end-to-end test of Story 1.27
**When** this story is finished
**Then** the test is updated for this change (the Owner's single inspection action is replaced by `accept-return` followed by the "sellable" result, and the test still ends with the Return Refunded, one refund, one credit note and the Piece back in stock) and passes, so that deploys are not blocked

**Given** the Owner tries a transition the table does not allow, such as Requested→Accepted
**When** the request is made
**Then** it is refused with `return.transition_not_allowed`
**And** every transition made by the Owner records a `shop-audit` event

**Requirements:** FR-47, FR-23, FR-24, FR-25, AD-4, AD-6, AD-14, AD-22, AD-24, AD-25, AD-31
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/accept-return`, `workflows/reject-return`, `admin/shop/returns/*`, `src/admin` Returns pages, upload-link route), `packages/api-client` and `apps/web` (Rejected view on the Return).
- Builds on the inspection and restock of Story 1.19 and the refund of Story 1.20: `accept-return` and `reject-return` replace its single inspection action and reuse the refund-to-source and credit-note steps of `refund-order`.
- Inspection photos are files in the `documents` bucket, linked to the Return (AD-31).
- Who pays to send a rejected saree back is a founder decision; no charge is made to the Shopper here.
- Raise `return.state-changed` for each transition; its messages are added in Story 3.20.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.

---

### Story 3.19: The Owner's refunds and payment disputes

As an Owner,
I want to refund all or part of an Order and see every dispute raised against a payment,
So that I can put things right for a Shopper and never miss a dispute deadline.

**Acceptance Criteria:**

**Given** an Order with a confirmed payment
**When** the Owner opens its refund page
**Then** the page shows the amount paid, each refund already made with its amount, reason, start time and credit note, and the amount that can still be refunded (FR-48)

**Given** the Owner enters an amount and a reason
**When** the amount is above zero and no more than the amount paid less refunds already made
**Then** the workflow `refund-order` starts a refund of exactly that amount to the payment method used (AD-7), creates a credit note linked to the original invoice with tax reversed by the money functions in `packages/contracts`, exact to the paisa (AD-5, AD-25), and records a `shop-audit` event
**And** stock is not changed by a refund

**Given** an amount above what can still be refunded, an amount of zero, or no reason
**When** the Owner submits
**Then** it is refused with `refund.exceeds_paid` (the code Story 1.21 defined), `refund.amount_invalid` or `refund.reason_required`, and nothing is refunded

**Given** a refund that brings the total refunded for an Order that is Dispatched, Out for delivery, Delivery failed or Delivered up to the total paid
**When** the refund is started
**Then** the Order moves to Refunded (AD-31)
**And** a refund that leaves the total refunded below the total paid is recorded against the Order, or against its Return when it belongs to one, and the Order keeps its state; part refunds that together reach the total paid do move it to Refunded
**And** a refund that would bring the total refunded for an Order in Paid or Packed up to the total paid is refused with a pointer to cancel the Order instead

**Given** the Owner submits the same refund twice, or the page is sent twice
**When** the second request arrives with the same idempotency key
**Then** one refund is made

**Given** the payment service refuses the refund
**When** the workflow runs
**Then** no credit note is created, the Owner sees the payment service's reason, and the amount that can be refunded is unchanged

**Given** Cancelled Orders and Accepted Returns
**When** the Owner opens the refunds list
**Then** each shows when its refund was started, and any whose refund has not started is shown with its deadline: the end of the second working day after it was Cancelled or Accepted, using the working days and business time zone from settings (FR-24)
**And** a scheduled job alerts the Owner once when a refund is still not started at the end of the first working day

**Given** the payment service sends a verified dispute event for a payment
**When** it is handled
**Then** the workflow `record-payment-dispute` stores or updates a dispute, a record of the `checkout` module (AD-31), with the payment service's dispute id, amount, reason, status and respond-by date, linked to the Order of that payment, idempotent on the event id
**And** the Owner is alerted when a dispute is opened
**And** a dispute whose payment matches no Order is stored unlinked and the Owner is alerted

**Given** the Owner opens Disputes
**When** the page loads
**Then** each dispute is listed with its Order, amount, reason, status and respond-by date, and links to the Order; the dispute also appears on the Order's page

**Requirements:** FR-48, FR-24, NFR-4, AD-4, AD-5, AD-7, AD-14, AD-21, AD-25, AD-31
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/refund-order` from Stories 1.20 and 1.21, completed here; `workflows/record-payment-dispute`; the `checkout` module's dispute record; `providers/razorpay` dispute events through the kernel's payment hook route; `src/jobs` refund-deadline job; `admin/shop/refunds/*`, `admin/shop/disputes/*`, `src/admin` pages).
- A payment dispute is a record of the `checkout` module, linked to the Order (AD-31).
- AD-31 decides Refunded by amounts: the Order is Refunded only when the total refunded equals the total paid. No refund needs to be tied to an item for that test; use the one function Story 1.20 wrote for it.
- Owner alerts raised in this story are `message.send` jobs with the generic `owner.alert` template seeded in Story 3.5 (purpose `owner-alert`), sent to the Owner's alert email and mobile number from settings (Story 3.7); no new template is needed.
- Answering a dispute is done at the payment service; this story shows and links, it does not submit evidence.
- How tax is split on a part refund that is not tied to an item is for the accountant; implement one money function that spreads it across the invoice lines in proportion and sums exactly.

---

### Story 3.20: Messages for every Order, Return and refund event

As a Shopper,
I want to be told when my Order is confirmed, sent, delivered, returned or refunded,
So that I never have to wonder what is happening with my money or my saree.

**Acceptance Criteria:**

**Given** the events raised by Epic 1 and Stories 3.12 to 3.19
**When** each of these occurs
**Then** one `message.send` job per channel is enqueued with the Shopper's saved language (saved on her account by Story 3.8; when the account has been deleted, the language recorded in the Checkout snapshot by Story 3.11): Order confirmed (with invoice), dispatched, out for delivery, delivered, delivery failed, each Return state change (Requested, Pickup booked, Picked up, Received, Accepted, Rejected, Refunded), refund started, Order cancelled, payment refunded automatically (FR-54)
**And** the content seed creates one template per event and channel, in English, and the Owner can edit each one

**Given** a Shopper with no email on her account
**When** an event occurs
**Then** she receives an SMS only
**And** a Shopper with an email receives the SMS and an email

**Given** the Order confirmed event
**When** the email is sent
**Then** the tax invoice is attached, read by the worker through a signed link from commerce valid for at most 10 minutes; if the invoice file is not yet rendered the job waits and retries rather than sending without it
**And** the SMS gives the Order number and points to order history, where the invoice can be downloaded

**Given** the event `payment.auto-refunded`, which Epic 1 (Stories 1.10 and 1.11) records and logs without sending anything
**When** it is raised for a payment confirmed after its Hold ended with the Pieces gone, or for any other automatic refund
**Then** this story's subscriber enqueues the "payment refunded automatically" message for it, to the mobile number in the Checkout snapshot, and, in a test with the worker running, the message reaches the test sink within 5 minutes of the webhook (FR-19)
**And** from this story on, an automatic refund without that message enqueued fails a test

**Given** a delivery failed or a Rejected Return
**When** the message is sent
**Then** it says what happens next and points to the Order page; it contains no photo and no link to a photo

**Given** the same event is delivered twice, or a workflow is retried
**When** jobs are enqueued
**Then** the job id (event id plus channel) makes the second a no-op and one message is sent

**Given** these events, which need the Owner to act and have no alert yet: a new Order is Paid; a Return is Requested; a Return is Received and awaits inspection
**When** each occurs
**Then** the Owner receives an alert by email and SMS at the addresses in settings, through `message.send` with the `owner.alert` template of Story 3.5
**And** the alerts for a pickup that could not be booked, a refund that failed and a dispute that was opened were built by Stories 3.14, 3.15, 3.18 and 3.19 and are not built again here; one test lists all six events and asserts that each sends exactly one alert

**Given** a message job fails on every attempt
**When** the outcome is reported
**Then** the failure is recorded against the event, the Owner sees failed messages on the Order's page, and no state change is undone because a message failed

**Given** the template list after this story
**When** it is reviewed in a test
**Then** every template's purpose is `transactional` or `owner-alert`; none is marketing, and there is no route or page that sends a message to a list of Shoppers

**Requirements:** FR-54, FR-20, FR-19, NFR-9 (path), AD-8, AD-22, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`src/subscribers` mapping events to `message.send`, one table of event → template key in `packages/contracts`), `apps/content` (seeded templates), `apps/worker` (invoice attachment in the email path).
- Epic 1 sent no messages. This story is where `payment.auto-refunded` (Story 1.11) and the Order confirmation are first delivered, so there is one sender (AD-26).
- "Try-on result ready" is shown in the app and belongs to Epic 4. Complaint and account-deletion messages are added by Stories 3.22 and 3.23 with their own events.
- No template may contain a one-time code, a photo or a signed link to Shopper media.

---

### Story 3.21: Ask whether the saree matched what she saw

As a Shopper,
I want to say, from 1 to 5, whether the saree matched what I saw online,
So that the shop learns when its photos mislead and fixes them.

**Acceptance Criteria:**

**Given** an Order in Delivered
**When** the Shopper opens it
**Then** for each Design in the Order she is asked "did it match what you saw?" with a rating from 1 to 5 and an optional comment; no rating is pre-selected (FR-53, NFR-13)

**Given** she submits a rating
**When** the workflow `record-rating` runs
**Then** a rating is stored with the Order item, the Design, the rating, the comment, the time, and whether she used Try-on for that Design before buying
**And** "used Try-on" is answered by one function in the `rating` workflow step that reports whether she has a Try-on request for that Design made before the Order; while no Try-on records exist it answers "no"

**Given** a rating outside 1 to 5, or not a whole number, or a comment longer than the limit in contracts
**When** it is submitted
**Then** it is refused with `rating.invalid` and nothing is stored

**Given** she has already rated an Order item
**When** she submits again
**Then** it is refused with `rating.already_given` and the first rating stands

**Given** an Order that is not Delivered, or belongs to another Shopper
**When** a rating is submitted for it
**Then** it is refused with `rating.order_not_delivered` or `order.not_found`

**Given** an Order has been Delivered for the number of days in the setting "ask for rating after" (default 2) and has an item with no rating
**When** the daily scheduled job runs
**Then** one message asking for the rating is sent through `message.send`, and it is never sent a second time for that Order
**And** she can still rate an item she has returned

**Given** the Owner opens Ratings in the Admin
**When** the page loads
**Then** for each Design it shows the number of ratings, the average to one decimal place, the count of each value from 1 to 5, the same figures split by "used Try-on" and "did not", and the comments, newest first (FR-53)
**And** the list can be sorted by lowest average, and a Design with no ratings shows "no ratings yet"

**Requirements:** FR-53, FR-54, NFR-13, AD-4, AD-13, AD-14, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`rating` module created here, `workflows/record-rating`, `store/shop/orders/{id}/ratings`, `src/jobs` rating reminder, `admin/shop/ratings`, `src/admin` page), `packages/api-client`, `apps/web` (Order page).
- Story 4.12 changes only the "used Try-on" function to read its Try-on requests; the schema already holds the field.
- Ratings are not shown to other Shoppers; the PRD asks only that the Owner sees them. A comment shown in the Admin is linked to an Order, so the ratings route is declared as returning personal data (Story 3.16).
- Adds the setting "ask for rating after" `[ASSUMPTION: 2 days after delivery; FR-53 says only "after delivery"]` and the template `order.rate-request`. Styled from DESIGN.md when it exists.

---

### Story 3.22: Privacy requests and complaints, each with a ticket and two deadlines

As a Shopper,
I want to ask what data the shop holds about me, ask for it to be corrected or erased, or file a complaint,
So that I can use my rights and know when I will be answered.

**Acceptance Criteria:**

**Given** a Shopper on the website, signed in or not
**When** she opens the grievance page from the footer
**Then** she sees the grievance officer's name and contact from the disclosures and a form to file one of: a complaint; a request for the data held about her and the services that received it; a correction; an erasure (FR-28, FR-29)
**And** a Shopper who is not signed in must give a mobile number or an email so she can be answered

**Given** she submits the form with a description
**When** the workflow `file-complaint` runs
**Then** a complaint is created with a unique ticket number from a database sequence, its type, description, the Order it concerns if she chose one, the time filed, an acknowledgement deadline 48 hours after filing and a resolution deadline one calendar month after filing
**And** she is shown the ticket number at once

**Given** a complaint was filed
**When** the workflow completes
**Then** a "complaint acknowledged" message with the ticket number and the resolution deadline is sent by SMS, and by email when she gave one, through `message.send`
**And** when the outcome reported for that message is "sent", the complaint is marked acknowledged with that time; if every attempt fails it stays unacknowledged and the Owner is alerted

**Given** an empty description, or no way to answer a Shopper who is not signed in
**When** the form is submitted
**Then** it is refused with the field named and no ticket is created
**And** the form is rate-limited in commerce middleware with limits from settings, and the same submission sent twice creates one ticket

**Given** a signed-in Shopper
**When** she opens her requests and complaints
**Then** she sees each ticket with its number, type, state (Open, Acknowledged or Resolved), the date it will be resolved by, and any reply
**And** she cannot see another Shopper's ticket

**Given** an unacknowledged complaint 12 hours before its 48-hour deadline, or an unresolved complaint 7 days before its one-month deadline
**When** the scheduled job runs
**Then** the Owner is alerted once for each, by `message.send`
**And** a complaint past either deadline is marked overdue and stays listed as overdue until resolved

**Given** a request of type erasure
**When** it is filed
**Then** she is also told she can delete her account herself and is pointed to the account deletion page

**Requirements:** FR-28, FR-29, FR-54, AD-4, AD-13, AD-19, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`complaint` module created here, `workflows/file-complaint`, `store/shop/complaints`, `src/jobs` complaint-deadline job), `packages/api-client`, `apps/web` (grievance page, account requests list), `apps/content` (templates `complaint.acknowledged`, `complaint.resolved`, Owner alerts).
- `[ASSUMPTION: the three complaint states Open, Acknowledged and Resolved, and alert lead times of 12 hours and 7 days; the PRD gives only the two deadlines]`. The lead times are settings.
- The Owner's reply, closing a ticket, and carrying out a data request are in Story 3.24, which sends `complaint.resolved`. The account deletion page is built in Story 3.23; until then the pointer names the grievance contact.
- Story 4.24 adds a request type for a person who appears in a Try-on result without agreeing (FR-9). Styled from DESIGN.md when it exists.

---

### Story 3.23: Delete my account, on the website and from a public page

As a Shopper,
I want to delete my account myself, whether or not I can still sign in on my usual device,
So that the shop stops holding my details when I no longer want it to.

**Acceptance Criteria:**

**Given** a signed-in Shopper on her account page
**When** she chooses to delete her account
**Then** before she confirms she is told what will be removed (her mobile number, email, name, saved addresses, cart, language, rating comments, and any Shopper photos and Try-on results) and what is kept because the law requires it (invoices, credit notes, Order, payment and refund records with the delivery details they were issued with, complaint tickets, access logs and the erasure record) (FR-27)
**And** she confirms by entering a new one-time code sent to her number; nothing is deleted without it

**Given** anyone on the public web page `/delete-account`, reachable without signing in and without the app, linked from the footer and the privacy policy
**When** she enters her mobile number and the one-time code sent to it
**Then** she is shown the same explanation and the same confirmation, and the same workflow runs
**And** a number with no account gets the same first response as one with an account, and the code limits of Story 3.8 apply

**Given** she has confirmed
**When** the workflow `delete-shopper-account` runs
**Then** her sessions end at once and her number can no longer sign in to that account
**And** it calls `erase-shopper-media`, the only erasure path (AD-23), which writes an erasure ledger entry for her with each step and its time, deletes every file of hers in `shopper-media`, and enqueues one `media.erase-at-provider` job per AI service that received a photo of hers; with no Try-on in the system yet it records zero files and zero providers
**And** the private `shopper-media` bucket, never versioned and encrypted at rest, is created in this story, in `infra/` for local and staging, so that the file step acts on a real bucket from the start (AD-22); Story 4.4 puts the first files in it
**And** it removes her personal details from the account, deletes her cart, removes the comment from and the Shopper link to her ratings while keeping the rating value and Design, and blanks the recipient on stored message records
**And** invoices, credit notes, Orders, payments, refunds, complaints, audit events, access events and the erasure ledger are not changed

**Given** she has an open Order, meaning one that is neither Delivered past its return period, nor Cancelled, nor Refunded (AD-31)
**When** she asks to delete her account, in her account or on the public page
**Then** the deletion is refused with `account.has_open_order`; she is told which Order is open, that she can delete her account once it is finished, and how to reach the grievance contact
**And** `erase-shopper-media` still runs at once for her, so her Shopper photos and Try-on results are erased in any case, with an erasure ledger entry
**And** her account, cart and Orders are otherwise unchanged, and her open Order continues to completion

**Given** the workflow fails part-way
**When** it is retried
**Then** it resumes from the ledger, repeats no finished step, and ends in the same result
**And** a scheduled job alerts the Owner when any erasure ledger entry is unfinished 24 hours after it began (NFR-6)

**Given** the deletion has finished
**When** the same mobile number signs in again
**Then** a new account is created with no Orders, no cart and no earlier terms acceptance, and she is asked to accept the terms again

**Given** the deletion has finished
**When** the final step runs
**Then** a confirmation message was sent to her number before it was removed, saying the account is deleted and which records are kept

**Requirements:** FR-27, FR-28, NFR-6, AD-4, AD-22, AD-23, AD-26, AD-31
**Notes for the developer:**
- The open-Order rule is AD-31's; "Delivered past its return period" uses the return period stored in the Order's Checkout snapshot (Story 3.15). The explanation shown before she confirms says that deletion waits for an open Order.
- Touches `apps/commerce` (`erasure` module and ledger created here, `workflows/erase-shopper-media`, `workflows/delete-shopper-account`, `src/jobs` erasure-deadline job, `store/shop/account/delete`), `packages/contracts` (`media.erase-at-provider` payload), `packages/api-client`, `apps/web` (account page, `/delete-account`), `infra/` (the `shopper-media` bucket).
- This story covers everything that exists so far. Epic 4 extends the same `erase-shopper-media` workflow with Shopper photos, Try-on results, Try-on requests and the worker's `media.erase-at-provider` job and provider answers; it adds no second erasure path, and withdrawal and the retention job will call the same workflow.
- `[ASSUMPTION: the list of records kept after deletion, as named in the first criterion, and that they are kept without a time limit; pending the lawyer]`. The kept list shown to the Shopper comes from content, not code.
- Adds the template `account.deleted`. Styled from DESIGN.md when it exists.

---

### Story 3.24: The Owner answers complaints and carries out data requests

As an Owner,
I want to see every open complaint with its deadlines, reply, close it, and carry out a data request,
So that every Shopper is answered inside 48 hours and one month.

**Acceptance Criteria:**

**Given** the Owner opens Complaints in the Admin
**When** the page loads
**Then** open complaints are listed with ticket number, type, time filed, the 48-hour acknowledgement deadline and the one-month resolution deadline, each shown with the time left or as overdue, soonest deadline first (FR-49)
**And** the list can be filtered by state and type, and opening a complaint records an access event

**Given** an unacknowledged complaint whose automatic acknowledgement failed
**When** the Owner marks it acknowledged after contacting the Shopper
**Then** it moves to Acknowledged with the time and the Owner as actor

**Given** an open complaint
**When** the Owner writes a reply and closes it
**Then** the workflow `resolve-complaint` stores the reply, moves the complaint to Resolved with the time, and sends "complaint resolved" through `message.send`; the message says a reply is waiting and gives the ticket number, and does not contain the reply's personal data
**And** a signed-in Shopper sees the reply under her ticket; a Shopper without an account receives the reply by email when she gave one
**And** closing without a reply is refused with `complaint.reply_required`

**Given** a request for the data held
**When** the Owner runs "prepare data report" for that Shopper
**Then** the workflow `prepare-data-report` builds a report listing her account details, addresses, Orders, Returns, refunds, ratings, terms acceptances, complaints, messages sent to her (template and time only), and the services that received her data: the payment service, the shipping service, the SMS and email services, and each AI provider that received a Shopper photo of hers (FR-28)
**And** the AI provider list comes from one function that reads the erasure and Try-on records; with no Try-on in the system it states that no AI provider received a photo
**And** the report is attached to the reply, is readable by the Shopper only when signed in and through a signed link valid for at most 10 minutes, and preparing it records an access event

**Given** a correction request
**When** the Owner corrects her name, email or a saved address
**Then** the change runs as a workflow and records a `shop-audit` event with before and after
**And** an invoice or credit note already issued is never changed (AD-25); the Owner is told so on the page

**Given** an erasure request
**When** the Owner confirms it for that Shopper
**Then** the same `delete-shopper-account` workflow as Story 3.23 runs, with the Owner as actor and the ticket number recorded in the erasure ledger
**And** the same open-Order rule applies: while she has an open Order the account deletion is refused, her Shopper photos and Try-on results are erased at once, and the ticket shows that the rest waits for the Order (AD-31)

**Given** a resolved complaint
**When** anyone tries to edit its reply or reopen it by changing times
**Then** it is refused; a further reply creates a new entry under the same ticket

**Requirements:** FR-49, FR-28, FR-54, NFR-5, AD-4, AD-14, AD-23, AD-25, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (`workflows/resolve-complaint`, `workflows/prepare-data-report`, `admin/shop/complaints/*`, `src/admin` Complaints pages), `packages/api-client` and `apps/web` (reply and report under a ticket).
- The report file is stored in the private `documents` bucket and deleted by `delete-shopper-account`; add that step to the workflow here.
- Story 4.23 extends the AI-provider function and adds Try-on consents, withdrawals, stored photos and requests to the report.
- Finding a Shopper outside a complaint, and deactivating an account, are in Story 3.25.

---

### Story 3.25: Look up a Shopper and deactivate an account

As an Owner,
I want to find a Shopper by her mobile number or an Order number and see everything about her dealings with the shop,
So that I can answer her in one call and stop an account that is being misused.

**Acceptance Criteria:**

**Given** the Owner opens Shopper support
**When** the Owner searches by a full mobile number or an exact Order number
**Then** the matching Shopper is shown; a search that matches nobody says so; a part of a number never returns a list of Shoppers (FR-49)

**Given** a Shopper is found
**When** her page loads
**Then** it shows her account details, her Orders with state, her Returns and refunds, her consents (each terms acceptance with version, language and time), her complaints with state and deadlines, and whether an erasure has been run for her
**And** one access event is recorded for the page, and following a link to an Order or complaint records its own

**Given** the consents section
**When** it is built
**Then** it reads every consent type from the `consent` module through one list function, so that consent types added later appear without changing this page

**Given** an Order number whose Shopper has deleted her account
**When** the Owner searches for it
**Then** the Order and its kept records are shown, the Shopper is shown as "account deleted" with the erasure ledger entry, and no removed detail is shown

**Given** the Owner chooses to deactivate a Shopper's account and enters a reason
**When** the workflow `deactivate-shopper` runs
**Then** her sessions end, a request for a sign-in code for her number is answered as usual but the code is refused at verification with `auth.account_deactivated` and the support contact, and a `shop-audit` event records the Owner, time, reason, before and after
**And** her Orders, Returns and refunds in progress continue, and she still receives their messages

**Given** a deactivated account
**When** the Owner reactivates it
**Then** she can sign in again, and the change is audited

**Given** a deactivated Shopper uses the public account deletion page or files a complaint without signing in
**When** she completes either
**Then** both still work, so deactivation never blocks her privacy rights

**Requirements:** FR-49, FR-27, FR-28, NFR-5, AD-4, AD-14, AD-15
**Notes for the developer:**
- Touches `apps/commerce` (`admin/shop/shoppers/*`, `workflows/deactivate-shopper`, the one-time-code provider's verification check, `src/admin` Shopper support page), `packages/contracts`.
- The public deletion page verifies the code through a path that allows a deactivated account for deletion only; cover this with a test.
- Epic 4 adds Try-on consents to the consents list and reported results to the Shopper's page; neither exists here.

---

### Story 3.26: The honest-design checklist and its yearly record

As an Owner,
I want the shop checked against the official list of dark patterns, by tests on every build and by my own recorded audit once a year,
So that no Shopper is pushed or tricked and I can prove I looked.

**Acceptance Criteria:**

**Given** the repository
**When** this story is complete
**Then** `docs/honest-design-checklist.md` lists every pattern on the official list of dark patterns, and for each one says where in the shop it could occur, what the shop does instead, and whether an automated test or the Owner's yearly review checks it (NFR-13)

**Given** the website's cart, checkout, sign-in, terms acceptance, email, Return and rating screens
**When** the automated honest-design tests run in continuous integration
**Then** they fail if any tick box or optional choice is selected by default
**And** they fail if the Checkout snapshot total differs from the total shown in the cart for the same cart, address and discount, or if any charge appears at payment that was not shown before checkout began
**And** they fail if any line is in the cart that the Shopper did not add

**Given** a Shopper who is not signed in
**When** the tests browse, search, open a Design, open the Full saree view, check a pincode, add to the cart and open every policy
**Then** no step demands sign-in or an email; sign-in is asked only at checkout and order history

**Given** the Design page, cart and checkout
**When** the tests read every view model and content text they show
**Then** no countdown, "only N left" or "N people are viewing" text exists unless it is a server-computed fact from stock (a sold-out or unavailable-for-now status is allowed), and a discount is never shown without the lowest price of the previous 30 days beside it (FR-5)

**Given** the cancel, Return, account deletion and complaint flows
**When** the tests walk them
**Then** each is reachable from the Shopper's account or Order page in no more steps than the checklist states, and no step asks the Shopper to reconsider more than once

**Given** the Owner opens Honest-design audit in the Admin
**When** the Owner answers every item on the checklist as "pass", "fail" with a note, or "not applicable" with a note, and saves
**Then** the audit is recorded as a `shop-audit` event with the Owner, the date and every answer, and cannot be edited or deleted afterwards (AD-14)
**And** saving with an unanswered item is refused

**Given** the last recorded audit
**When** 11 months have passed since it, or none has ever been recorded 30 days after first deploy to production
**Then** a scheduled job alerts the Owner once by `message.send` that the yearly audit is due
**And** the Admin page shows the date of the last audit and the date the next is due, 12 months after the last

**Requirements:** NFR-13, FR-5, FR-26, NFR-10, AD-4, AD-13, AD-14, AD-26
**Notes for the developer:**
- Touches `docs/`, `apps/web` (end-to-end honest-design tests), `apps/commerce` (`admin/shop/honest-design-audit`, a workflow that writes the audit event, `src/jobs` audit-due job, `src/admin` page).
- The checklist items shown in the Admin are read from a versioned file in `packages/contracts` generated from the document, so the page and the document cannot drift.
- The official list must be read from its published source when the document is written; do not write it from memory. If it cannot be read, list that as an open item at the top of the document.
- The Try-on consent screen (Story 4.3) and the Android app (Story 6.15) add their own cases to the same tests and checklist.
