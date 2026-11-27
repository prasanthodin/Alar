## Epic 4: Try-on with consent, under the Owner's control

An adult Shopper accepts the Try-on consent notice, uploads her Shopper photo and sees herself in a Design, labelled as AI-generated; she can report a Try-on result, withdraw Try-on consent and have everything erased. The Owner chooses models and prompts within guardrails that are code, tests them on a saved sample set, caps spending and can switch Try-on off. The epic ends with the launch gate test of PRD §6.3, which decides whether Try-on is switched on at launch.

**FRs covered:** FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-39, FR-40, FR-41, FR-42, FR-43, FR-44, FR-45, FR-46, FR-51, FR-52
**NFRs:** NFR-2, NFR-3 (and the Try-on parts of NFR-5, NFR-6 and NFR-9)

**Rules that hold for every story in this epic**

- Try-on is built for the website (`apps/web`) here; the Android app follows in Epic 6 through the same `packages/api-client` functions.
- Automated tests never call a real AI provider. They use the fake provider and the fake result check from Stories 4.5 and 4.6. Only the test bench used by hand (Story 4.9) and the launch gate run by the Owner (Story 4.26) reach real providers.
- Every shape that crosses a unit boundary is a zod schema in `packages/contracts` (AD-19); every state change is a named workflow (AD-4); every state-changing Admin request writes a `shop-audit` event (AD-14); no photo, link or image bytes appear in logs, job results or error reports (AD-22).
- Shopper-facing screens are described by behaviour only and are styled from DESIGN.md when it exists. Shopper-facing text comes from content (the notice and other documents, message templates) or the interface translation bundles of Story 3.4, with the clients' built-in translation files as the fallback (interface text), as AD-28 divides them.
- Try-on cost is recorded in integer paise (AD-5). A provider's price, recorded on the Approved-model list in the provider's currency, is converted to paise with the exchange-rate setting at the moment the cost is recorded (AD-32). The amount an AI provider reports is stored beside it unchanged, with its currency, for comparison.
- `ResultCheck` uses a check model: a vision-capable model on the Approved-model list, marked as a check model and reached through the same `TryOnProvider` port. If the check fails to run, the result is not shown (AD-32).
- This epic builds on Epic 3: the notice's publish path and `record-notice-version` (Story 3.2), the `consent` module's acceptance records (Story 3.9), the `erasure` module, its ledger and `erase-shopper-media` (Story 3.23), `message.send` (Story 3.5) and Shopper support (Story 3.25).
- "AI service" means each outside party that receives a Shopper photo for a model: the aggregator and the company that runs the model behind it. Each has a stable AI-service id (a lower-case slug).

---

### Story 4.1: The Try-on consent notice states its retention period and can be read by Shoppers

As an Owner,
I want each published version of the Try-on consent notice to state how long photos are kept and to be readable by the shop's clients,
So that consent always refers to one numbered notice whose list of recipients and retention period are true.

**Acceptance Criteria:**

**Given** the Try-on consent notice in the content admin, which since Story 3.2 has one integer version shared by all its translations and a list of AI-service ids
**When** the Owner edits it
**Then** she can also enter the retention period shown to the Shopper, shared by all translations of that version
**And** a draft without AI-service ids or without a retention period cannot be published
**And** a draft that lacks the notice text in any configured language (the list from `/internal/settings/languages`, Story 3.2) cannot be published either, so that no Shopper is shown, and asked to accept, a notice in a language she did not choose (FR-8).

**Given** a draft that changes the notice's meaning, its list of AI-service ids or its retention period
**When** the Owner publishes it
**Then** the version number rises by one and content calls `/internal/content/notice-published` on commerce with a service token, as built in Story 3.2
**And** commerce's `record-notice-version` workflow stores the version, the AI-service ids, the retention period and the publish time.

**Given** a published notice
**When** the Owner publishes a translation fix marked as not changing the meaning
**Then** the version number does not change and commerce's stored version is unchanged.

**Given** commerce is unreachable or refuses the call
**When** the Owner publishes a new notice version
**Then** the publish is not shown as complete, the previous version stays the published one in both content and commerce, and she can retry, as Story 3.2 defines.

**Given** the same notice version is sent to commerce twice
**When** the second call arrives
**Then** commerce stores nothing new and answers success.

**Given** a published notice version
**When** a client calls `GET /store/shop/tryon/notice` with a language
**Then** commerce returns the latest published version number, its AI-service ids, its retention period and the notice text in that language; every configured language has its text because publishing requires it, and only a request in a language that is not configured is answered in English.

**Given** no notice version has been published
**When** a client calls the route
**Then** it answers with `tryon.notice_not_published` and no text.

**Requirements:** FR-8, FR-51, FR-59; AD-1, AD-3, AD-9, AD-11, AD-14, AD-19
**Notes for the developer:**
- Builds on Story 3.2, which built the notice collection, its numbered versions, the list of AI-service ids, the publish call to `/internal/content/notice-published` and the `record-notice-version` workflow. This story adds only the retention period to all three, and the Shopper-facing read. Do not add a second internal route or a second workflow.
- `apps/content`: the retention period on the notice collection; the content audit event is already written by Story 3.1's rule.
- `apps/commerce`: the `consent` module's notice-version record gains the retention period; route `store/shop/tryon/notice`.
- `packages/contracts`: `AiServiceId` and `NoticeVersion` (extend what Story 3.2 defined), the notice view model. `packages/api-client`: `getTryOnNotice`.
- Seeds the retention period key in the `settings` module (30 days, FR-51), the first setting this epic reads; Story 4.24 builds the retention job and the warning when the notice and the setting differ.
- The publish call carries the content admin's email since Story 3.2, so the notice version's audit event has its actor (Story 4.21 shows it).
- The consent record itself is Story 4.3. The check of a Model route against the notice is Story 4.11.

---

### Story 4.2: The Owner's off switch and the Try-on entry point

As an Owner,
I want to switch Try-on off for everyone at once, and back on,
So that Try-on stays off until it passes the launch gate and I can stop it at any moment.

**Acceptance Criteria:**

**Given** a new installation
**When** nobody has touched the switch
**Then** Try-on is switched off.

**Given** the Owner on the Try-on controls page in the Admin
**When** she switches Try-on on or off
**Then** the `set-tryon-switch` workflow stores the new value with its time, the change takes effect without a release
**And** a `shop-audit` event records who made it, when, and the before and after values.

**Given** Try-on is switched off
**When** a Shopper opens a Design page on the website
**Then** the Try-on entry point is absent, not broken, and the rest of the page is unchanged.

**Given** Try-on is switched on and a notice version is published
**When** a Shopper opens a Design page on a phone
**Then** the Try-on entry point is visible without scrolling, beside the Full saree view entry point
**And** the page does not wait for the Try-on status before it is usable (NFR-1).

**Given** Try-on is switched on but no notice version has been published
**When** a client calls `GET /store/shop/tryon/status`
**Then** it answers unavailable, and the entry point is absent
**And** it also answers unavailable for a request in a configured language in which the published notice has no text, which can happen only when a language was configured after the notice was published, until a translation fix adds that text (FR-8).

**Given** a Shopper who is not signed in
**When** she taps the Try-on entry point
**Then** she is taken to sign in by one-time code and returns to Try-on for the same Design afterwards.

**Given** the Owner on the Try-on controls page
**When** she limits Try-on to chosen Designs, picking them from published Designs, and saves
**Then** the `set-tryon-designs` workflow stores the list, the change takes effect without a release and is audited with before and after values (FR-42)
**And** while a list is set, `GET /store/shop/tryon/status` for a Design answers available only if that Design is on it, and the entry point is absent on every other Design
**And** clearing the list makes Try-on available for every published Design again.

**Requirements:** FR-42, FR-3 (entry point), FR-26; AD-2, AD-4, AD-13, AD-14
**Notes for the developer:**
- Creates the `tryon` module in `apps/commerce/src/modules/tryon`, which the status read of this story uses and to which Story 4.4 adds the first entity.
- `settings` module: the Try-on switch and the list of chosen Designs as dated settings; workflows `set-tryon-switch` and `set-tryon-designs`; routes `admin/shop/tryon/switch` and `admin/shop/tryon/designs`; a new Admin page "Try-on controls" that later stories add to.
- The chosen-Designs limit is how a "narrow" outcome of the launch gate is applied (FR-42, Story 4.25). Refusing a request for a Design outside the list is in Story 4.12.
- `store/shop/tryon/status` takes a Design id and returns `{ available, reason }`; later stories add reasons (daily cap, Model route not usable). `api-client`: `getTryOnStatus`.
- `apps/web`: the entry point on the Design page and an empty Try-on screen for a Design, which later stories fill.
- Refusing requests while switched off is in Story 4.12 and stopping queued jobs in Story 4.13, where requests and jobs first exist.

---

### Story 4.3: Accept the Try-on consent notice and confirm being an adult

As a Shopper,
I want to read a standalone notice and accept it by my own action before my first Try-on,
So that my photo is sent to AI services only with my informed agreement.

**Acceptance Criteria:**

**Given** a signed-in Shopper with no current Try-on consent
**When** she opens Try-on for a Design
**Then** she is shown the Try-on consent notice on its own screen, in her language, with the AI services it names, what is kept and for how long, how to withdraw and how to complain
**And** the screen contains no other terms and no pre-ticked control.

**Given** the notice screen
**When** she has not confirmed that she is 18 or older
**Then** the accept action does nothing and Try-on stays unavailable to her.

**Given** the notice screen
**When** she confirms she is 18 or older and accepts
**Then** the `give-tryon-consent` workflow records the Shopper, the notice version, the language, the AI-service ids of that version, the adult confirmation and the time
**And** she continues to Try-on for the Design she came from.

**Given** a Shopper who declines or leaves the screen
**When** she returns to the Design page
**Then** no consent is recorded and she can browse and buy as before.

**Given** a Shopper whose consent is for notice version 3
**When** version 4 is published and she next opens Try-on
**Then** her consent is not current, she is shown version 4, and she must accept again before any Try-on.

**Given** the client sends an acceptance for a version that is not the latest published version
**When** commerce receives it
**Then** it is refused with `tryon.notice_outdated` and nothing is recorded.

**Given** a Shopper with current consent
**When** `GET /store/shop/tryon/consent` is called with her session
**Then** it returns current, the version and the time; without a Shopper session the route is refused (AD-15).

**Given** the honest-design tests and checklist of Story 3.26
**When** this story is finished
**Then** they are extended with the Try-on consent screen: the tests fail if the adult confirmation or the accept control is selected by default, if the notice screen carries any other terms, or if declining stops her browsing or buying
**And** `docs/honest-design-checklist.md` gains these items (NFR-13).

**Given** the Owner looks up a Shopper in Shopper support (FR-49)
**When** the Shopper has given Try-on consent
**Then** the consent's version, language and time are listed with her other consents.

**Requirements:** FR-8, FR-9, FR-59; AD-11, AD-15, AD-4; NFR-13
**Notes for the developer:**
- `consent` module: a Try-on consent is an acceptance record of the same kind as the terms acceptances of Story 3.9 (document type, version, language, time; AD-31), with the AI-service ids and the adult confirmation added; one row per acceptance, never edited. Workflow `give-tryon-consent`; routes `store/shop/tryon/consent` (read and accept, with `Idempotency-Key`).
- Shopper support's consents list (Story 3.25) reads every consent type through one function, so this record appears there without changing that page.
- `apps/web`: the notice screen, styled from DESIGN.md when it exists. Text comes from Story 4.1's route.
- The own-photo confirmation is taken with each upload in Story 4.4. Withdrawal is Story 4.22.

---

### Story 4.4: Provide a Shopper photo through a single-use signed upload

As a Shopper,
I want to choose or take one full-length photo of myself with my device's own picker, with guidance on what works,
So that Try-on has a usable photo and the shop never sees the rest of my gallery.

**Acceptance Criteria:**

**Given** a Shopper with current Try-on consent and no stored Shopper photo
**When** she reaches the photo step
**Then** she is told what makes a good photo (full length, facing the camera, alone in the picture, good light) and is linked to the published contact through which a person shown without agreeing can ask for removal
**And** the photo is chosen with a file input that opens the system photo picker or camera; the website asks for no other access.

**Given** a chosen file
**When** it is not a JPEG, PNG or WebP image, is larger than the size limit in settings, is smaller than the minimum pixel size in settings, or is wider than it is tall
**Then** she is told in plain words why it cannot be used, on the device, and nothing is uploaded or sent to an AI provider.

**Given** a usable file
**When** she confirms the photo is of herself and continues
**Then** the browser re-encodes it to the maximum long side in settings, which drops location and camera data, asks commerce for an upload link, and uploads straight to the `shopper-media` bucket
**And** without the own-photo confirmation commerce refuses to issue a link.

**Given** a request for an upload link
**When** commerce issues it
**Then** the link is for one object key, accepts only the allowed types and sizes, and is valid at most 10 minutes
**And** a link is refused without current consent, without a Shopper session, or beyond the upload-link rate limit in settings.

**Given** an upload has finished
**When** the client confirms it to commerce
**Then** the `store-shopper-photo` workflow checks the object exists with an allowed type and size, records the Shopper photo with the own-photo confirmation and its time
**And** a second confirmation of the same key, or a confirmation of an object that fails the check, is refused and the object is deleted.

**Given** a Shopper with a stored Shopper photo
**When** she opens Try-on again
**Then** she can reuse it, shown through a signed link valid at most 10 minutes, or replace it.

**Given** she replaces her Shopper photo
**When** the new one is confirmed
**Then** the old one is erased by `erase-shopper-media` scoped to that photo, with a row in the erasure ledger, and she has exactly one stored Shopper photo.

**Given** a Shopper with a stored Shopper photo
**When** she asks to delete her account through Story 3.23, whether the deletion is carried out or refused because she has an open Order
**Then** `erase-shopper-media` deletes the photo file at once and marks the photo record erased (AD-31).

**Given** an upload link that was issued but never confirmed
**When** one hour has passed
**Then** a scheduled job deletes any object under that key.

**Requirements:** FR-9, FR-10; AD-22, AD-23, AD-11, AD-4; NFR-5
**Notes for the developer:**
- `tryon` module: the `shopper_photo` entity. Workflows `issue-photo-upload-link` and `store-shopper-photo`. Routes `store/shop/tryon/photo/upload-link` and `store/shop/tryon/photo`.
- Extend the `erase-shopper-media` workflow of Story 3.23 to cover Shopper photos, for a whole Shopper and for one photo; the `erasure` module and its ledger already exist from that story.
- `apps/web`: the photo step and the on-device checks. No image analysis library is added; the checks are type, size, pixel size and orientation only.
- The `shopper-media` bucket exists from Story 3.23 (private, never versioned, encrypted at rest; AD-22); this story puts the first files in it and does not create it again. Requests to AI providers are Story 4.13.
- Seeds the settings keys it first reads: the photo's maximum file size, minimum pixel size and maximum long side, and the upload-link rate limit `[ASSUMPTION: 15 MB, 1,000 pixels, 2,048 pixels and 10 links per Shopper per hour; the PRD gives none]`.

---

### Story 4.5: The `TryOnProvider` port, a fake provider and the OpenRouter adapter

As an Owner,
I want every AI provider reached through one interface with safety settings fixed in code,
So that I can change models without changing the shop and no setting of mine can weaken a guardrail.

**Acceptance Criteria:**

**Given** the worker
**When** any code needs an AI provider
**Then** it uses only the `TryOnProvider` port: `generate(input)` returns exactly one of `result` (image bytes, type, provider's reported cost and currency if any), `blocked` (provider's safety check refused) or `failed` (with a stable reason code); `requestErasure(reference)` returns `confirmed`, `accepted`, `unsupported` or `failed`
**And** a lint rule or test fails the build if a job imports an adapter directly.

**Given** the OpenRouter adapter
**When** it builds a request
**Then** it sends the Shopper photo and the saree image together with the prompt text and the requested image size and quality
**And** it always sets the provider's no-retention option and keeps request logging at the provider off; neither is read from the database or from the job payload.

**Given** the prompt for a request
**When** the worker composes it
**Then** the fixed safety wording held in worker code is added to the Prompt version's text on every request (no change to the person's face or body, no image without clothing, clothing only as in the saree image)
**And** a test proves that no input from the Admin can remove or alter it.

**Given** the provider answers with a safety refusal
**When** the adapter maps the answer
**Then** it returns `blocked`, not `failed`.

**Given** the provider times out, returns an error, or returns no image
**When** the adapter maps the answer
**Then** it returns `failed` with a reason code, and the call is abandoned when the caller's time limit passes.

**Given** the fake provider
**When** a test asks for a result, a block, a failure, a delay longer than the time limit, or a given cost
**Then** the fake returns exactly that, and the whole automated test suite passes with no network access to any AI provider.

**Given** the adapter's contract test (NFR-11)
**When** it runs before a release against the provider with a synthetic image that shows no person
**Then** it checks the request and answer shapes; it is not part of the ordinary test suite.

**Given** any adapter call
**When** it logs or throws
**Then** the log or error contains the request id, model and duration, and never image bytes, links or keys.

**Requirements:** FR-39, FR-40, FR-41; AD-10, AD-16, AD-22; NFR-11
**Notes for the developer:**
- `apps/worker/src/providers/`: `TryOnProvider` interface, `openrouter` adapter, `fake` adapter, the fixed safety wording and the prompt composer. Provider choice is by configuration plus the request's provider name.
- `packages/contracts`: the port's input and result schemas and the reason codes.
- Seeds the Try-on time limit as a dated key of the `settings` module (90 seconds, FR-11, AD-13). The port takes the limit as an argument from its caller; nothing in the worker holds it as a constant.
- The OpenRouter key and base address are environment variables checked at start. No vendor SDK beyond plain HTTP is added.
- If OpenRouter offers no erasure call, `requestErasure` returns `unsupported`; Story 4.23 records that in the erasure ledger as AD-32 says. `ResultCheck` is Story 4.6; the port also carries the call that asks a check model about an image, so the check goes through the same port (AD-32).

---

### Story 4.6: Check every image with `ResultCheck`

As a Shopper,
I want every Try-on result checked before I can see it,
So that I am never shown an image with nudity or sexual content.

**Acceptance Criteria:**

**Given** the worker
**When** an image comes back from a `TryOnProvider`
**Then** it is passed to `ResultCheck`, which returns exactly one of `pass`, `reject` (nudity or sexual content) or `unassessable`.

**Given** `ResultCheck`
**When** it asks about an image
**Then** it asks a check model, a vision-capable model on the Approved-model list marked as a check model, through the same `TryOnProvider` port as generation, with the no-retention and no-logging flags set in code (AD-32)
**And** which check model to ask is given to it with each job, from the Model route; it is not read from an environment variable and no code path calls a model that is not on the Approved-model list.

**Given** the check model cannot be reached, times out, or gives an answer that cannot be read
**When** `ResultCheck` returns
**Then** the verdict is `unassessable`, never `pass`: if the check fails to run, the result is not shown.

**Given** the question put to the check model and the rule that turns its answer into a verdict
**When** the code is inspected
**Then** both are in worker code and are not data
**And** nothing in the Admin or the database can switch the check off, skip it or change its verdict; the Owner can choose which approved check model is used and nothing more.

**Given** a job that arrives with no check model
**When** the worker handles it
**Then** it generates nothing and the job ends failed.

**Given** the fake result check
**When** a test asks for `pass`, `reject` or `unassessable`
**Then** it returns that verdict without any network call.

**Given** a call to the check
**When** it logs
**Then** the log holds the verdict, the duration and the request id only.

**Requirements:** FR-52; AD-10, AD-22, AD-32
**Notes for the developer:**
- `apps/worker/src/providers/`: `ResultCheck`, which calls the port of Story 4.5, and a fake. The fixed question and the verdict rule sit beside the fixed safety wording.
- Marking a model as a check model on the Approved-model list is Story 4.7; naming the check model on the Model route, with its AI services required in the notice and its price counted against the cost ceiling, is Story 4.11. Until those exist, tests pass the check model in the job input.
- Using the verdict in a job is Stories 4.13 and 4.14; showing it on the test bench is Story 4.9.

---

### Story 4.7: The Approved-model list

As an Owner,
I want to approve a model only after recording how it treats Shopper photos, its terms and its price,
So that no Try-on request can go to a model I have not vetted.

**Acceptance Criteria:**

**Given** the Owner on the Approved-model list page
**When** she adds a model
**Then** she must record: the provider name known to the worker, the model id, the AI-service ids that receive the Shopper photo, its data-retention policy and period, a link to its terms and the date she read them, the image size and quality options it offers with the provider's price per image of each and its currency, and a confirmation that it accepts a Shopper photo and a saree image together
**And** the `approve-model` workflow refuses the entry with a named error for each missing item.

**Given** a provider's price in a currency other than rupees
**When** the list, a cost or a ceiling check needs it
**Then** it is converted to integer paise with the exchange-rate setting, a dated setting the Owner edits on this page and whose changes are audited (AD-32)
**And** the page shows each price in the provider's currency and in rupees at today's rate.

**Given** a vision-capable model that is to check results
**When** the Owner adds it
**Then** she marks it as a check model and records the same policy, terms, AI-service ids and price per check; a check model is not offered as a primary or fallback, and a generating model is not offered as a check model (AD-32)
**And** a check model that keeps images for training cannot be approved.

**Given** a model whose recorded policy says it keeps Shopper photos for training
**When** the Owner tries to approve it
**Then** it is refused and cannot be saved as approved.

**Given** a model that does not accept two images together
**When** the Owner leaves that confirmation unset
**Then** it is refused.

**Given** an approved model whose AI-service ids are not all in the latest published notice version
**When** the list is shown
**Then** the model is marked "not named in the published notice" with the missing AI services listed.

**Given** an approved model
**When** the Owner edits its price or policy, or removes it from the list
**Then** the change runs as a workflow and a `shop-audit` event holds the before and after values
**And** a model used by the current Model route cannot be removed, and an edit that would make it unapprovable is refused.

**Given** the page
**When** the Owner looks for a way to turn on request logging at the AI provider or turn off the no-retention option
**Then** there is none; the page states that both are fixed by the system.

**Requirements:** FR-40, FR-39, FR-46, FR-52; AD-10, AD-11, AD-14, AD-5, AD-32
**Notes for the developer:**
- `tryon` module: the `approved_model` entity with a kind (generating or check). The exchange rate is a key of the `settings` module. Workflows `approve-model`, `update-approved-model`, `remove-approved-model`. Routes under `admin/shop/tryon/models`. Admin page in `apps/commerce/src/admin`.
- A model reached through a different AI provider needs a new adapter in the worker (Story 4.5's port); the list accepts only provider names the worker reports.
- Choosing models for a Model route is Story 4.11.

---

### Story 4.8: Write Prompt versions

As an Owner,
I want to write and keep numbered Prompt versions,
So that I can improve the instructions sent with a Try-on request and know exactly which wording produced each result.

**Acceptance Criteria:**

**Given** the Owner on the Prompt versions page
**When** she saves a new prompt
**Then** a Prompt version is created as a draft with the next number, its text, her account and the time.

**Given** a draft Prompt version
**When** she edits and saves it
**Then** the text changes and a `shop-audit` event holds the before and after text.

**Given** a Prompt version that has been used in a test-bench run or published
**When** she tries to edit its text
**Then** the edit is refused and she is offered "copy to a new draft" instead, so a number always means one wording.

**Given** the page
**When** it shows a Prompt version
**Then** it states that safety wording set by the system is added to every request, and offers no control to edit or remove it.

**Given** a Prompt version's text is empty or longer than the maximum length in settings
**When** she saves
**Then** it is refused with the reason.

**Given** a draft
**When** she looks for a publish action
**Then** none is offered yet for a version that has not been run on the sample set.

**Requirements:** FR-41, FR-46; AD-10, AD-14
**Notes for the developer:**
- `tryon` module: the `prompt_version` entity with states draft, tested, published, retired. Workflows `save-prompt-version`, `copy-prompt-version`. Routes under `admin/shop/tryon/prompts`.
- The safety wording itself lives only in worker code (Story 4.5); the Admin shows a fixed sentence from a translation file.
- Seeds the prompt maximum length key in the `settings` module `[ASSUMPTION: 4,000 characters]`.
- Running a version on the sample set is Story 4.9; publishing and rolling back is Story 4.10.

---

### Story 4.9: The sample set and the test bench

As an Owner,
I want to run any approved model and Prompt version on a saved set of sample sarees and sample photos and see the outputs side by side,
So that I can judge border, pallu and colour before any Shopper sees a change.

**Acceptance Criteria:**

**Given** the Owner on the sample set page
**When** she adds a sample photo
**Then** she must record the person's name and the date that person agreed to this use, and the photo is stored privately under a samples prefix in `shopper-media`
**And** a sample photo without that record cannot be saved, and it is never shown to a Shopper
**And** objects under the samples prefix are left alone, by prefix, by `erase-shopper-media` and by every job that sweeps Shopper media (the retention job of Story 4.24 applies the same rule when it is built), because a sample person is not a Shopper (AD-22, AD-23); a sample person withdraws by asking the Owner, who deletes the sample photo.

**Given** the sample set page
**When** she adds a sample saree
**Then** she picks a product photo of an existing Design, and the set stores the Design and the photo.

**Given** a sample set with at least one sample saree and one sample photo
**When** she starts a run for a chosen approved model, size and quality option, check model and Prompt version
**Then** the `start-bench-run` workflow creates the run and enqueues one `tryon.bench` job per pair, each with a deterministic id
**And** before it starts she is shown the number of images and the cost at the recorded price per image, and must confirm.

**Given** a `tryon.bench` job
**When** the worker runs it
**Then** it uses the same `TryOnProvider` call, safety wording, no-retention and no-logging flags, time limit and `ResultCheck` as a Shopper's request, stores the output privately, and reports outcome, duration, cost and check verdict to commerce through `/internal/*`.

**Given** a finished or running run
**When** she opens it
**Then** each sample pair is a row showing the real saree photo, the sample photo and the outputs of every run selected for comparison side by side, with model, Prompt version, duration, cost and check verdict under each
**And** a failed, blocked or rejected item shows its outcome in place of an image.

**Given** a Prompt version in draft
**When** a run that used it finishes with every pair attempted
**Then** the Prompt version becomes tested.

**Given** test-bench spending
**When** it is recorded
**Then** it is kept apart from Shoppers' Try-on spending and does not count toward the daily cap.

**Given** the Owner deletes a run or a sample photo
**When** the workflow completes
**Then** its stored images are deleted from the bucket and a `shop-audit` event records the deletion
**And** deleting a sample photo also deletes every test-bench output made from it, which is how a sample person's withdrawal is honoured.

**Given** the automated tests for this story
**When** they run
**Then** they use the fake provider and the fake result check only.

**Requirements:** FR-43, FR-41, FR-52; AD-8, AD-9, AD-10, AD-22, AD-14
**Notes for the developer:**
- `tryon` module: entities `sample_photo`, `sample_saree`, `bench_run`, `bench_item`. Workflows `start-bench-run`, `record-bench-item`, `delete-bench-run`. Routes under `admin/shop/tryon/bench` and `internal/tryon/bench-items/:id`.
- `packages/contracts`: job `tryon.bench` and its payload. `apps/worker/src/jobs/tryon.bench`. The worker reads and writes images only through signed links from commerce, valid at most 10 minutes.
- Sample people are not Shoppers; their agreement is the record on the sample photo, not a Try-on consent. A bench run does not need the model's AI services to be in the published notice.
- Rating outputs is Story 4.25.
- The time limit used is the setting seeded in Story 4.5.

---

### Story 4.10: Publish a Prompt version and roll back

As an Owner,
I want to publish a tested Prompt version and return to the previous one in one action,
So that a better prompt reaches Shoppers without a release and a worse one can be undone at once.

**Acceptance Criteria:**

**Given** a Prompt version in the tested state
**When** the Owner publishes it
**Then** the `publish-prompt-version` workflow makes it the published Prompt version, retires the one before it, and records the time
**And** the next Try-on job that starts uses it, with no release.

**Given** a Prompt version in draft, never run on the sample set
**When** a publish is attempted, in the Admin or by calling the route directly
**Then** it is refused with `tryon.prompt_not_tested`.

**Given** a published Prompt version and an earlier one that was published before it
**When** the Owner chooses "roll back"
**Then** the earlier version is published again in one action and the current one is retired.

**Given** only one Prompt version has ever been published
**When** the Owner looks for roll back
**Then** it is not offered.

**Given** any publish or roll back
**When** it completes
**Then** a `shop-audit` event records who, when, and the before and after published version numbers.

**Requirements:** FR-41, FR-46; AD-4, AD-10, AD-14
**Notes for the developer:**
- `tryon` module and workflow `publish-prompt-version` (roll back is the same workflow with the earlier version as input). Routes under `admin/shop/tryon/prompts/:id/publish`.
- The published Prompt version is read by the worker at job start in Story 4.13.

---

### Story 4.11: Choose and publish a Model route within the guardrails

As an Owner,
I want to choose the primary and fallback model for Try-on and publish the choice without a release,
So that I can change models while the system stops me from breaking the consent notice or the cost ceiling.

**Acceptance Criteria:**

**Given** the Owner on the Model route page
**When** she drafts a Model route
**Then** she can choose a primary and a fallback only from the generating models on the Approved-model list, and for each the image size and quality from the options recorded for that model
**And** she must choose the check model that `ResultCheck` uses from the models marked as check models; a Model route without a check model cannot be saved for publishing (AD-32).

**Given** a draft Model route whose models' AI-service ids, and the check model's AI-service ids, are all in the latest published notice version, and whose price per image for each model plus the price per check, converted to paise with the exchange-rate setting, is at or under the cost ceiling
**When** she publishes it
**Then** the `publish-model-route` workflow makes it the current Model route with a new route number and the time
**And** the next Try-on job that starts uses it, with no release.

**Given** a draft Model route naming a model, generating or check, that sends Shopper photos or results to an AI service not named in the published notice
**When** she publishes it
**Then** it is refused with `tryon.route_service_not_in_notice`, the missing AI services are listed, and she is told to publish a new notice version first.

**Given** a draft Model route in which the primary or the fallback costs more than the cost ceiling
**When** she publishes it
**Then** it is refused with `tryon.route_over_cost_ceiling`, showing the ceiling and the cost.

**Given** the cost ceiling setting
**When** the Owner changes it
**Then** the change is a dated setting, audited, and a ceiling lower than the current Model route's cost is accepted only after she confirms that Try-on will be unavailable until a cheaper route is published.

**Given** a current Model route and a previous one
**When** she chooses "return to previous"
**Then** the previous route is published again in one action through the same workflow and the same checks; if it now fails a check it is refused with that check's error.

**Given** a new notice version is recorded (Story 4.1) that no longer names an AI service the current Model route uses
**When** `record-notice-version` completes
**Then** Try-on status becomes unavailable with reason "Model route not usable", the Owner is alerted by a `message.send` job, and Try-on returns when a usable route is published.

**Given** a model on the current Model route
**When** someone calls the publish route directly with a model that is not on the Approved-model list
**Then** it is refused.

**Given** any publish, return to previous, or change of ceiling
**When** it completes
**Then** a `shop-audit` event records who, when, and the before and after values.

**Requirements:** FR-39, FR-46, FR-52; NFR-3; AD-10, AD-11, AD-13, AD-14, AD-26, AD-32
**Notes for the developer:**
- `tryon` module: the `model_route` entity (numbered, immutable once published; primary, fallback and check model). Workflow `publish-model-route` in `apps/commerce/src/workflows`. Cost ceiling in the `settings` module. Routes under `admin/shop/tryon/route`.
- Extend `record-notice-version` (Story 3.2) and `store/shop/tryon/status` for the "Model route not usable" reason.
- No Try-on request exists yet; using the route is Story 4.13.

---

### Story 4.12: Request a Try-on result and follow its progress

As a Shopper,
I want my Try-on request accepted at once and to follow it without keeping the screen open,
So that I can keep browsing while my Try-on result is made.

**Acceptance Criteria:**

**Given** a signed-in Shopper with current Try-on consent, a stored Shopper photo, Try-on switched on and a usable Model route and published Prompt version
**When** she requests Try-on for a published Design
**Then** the `request-tryon` workflow creates a Try-on request in state queued, enqueues `tryon.generate` with a deterministic id made from the request id, and the route answers accepted with the request id straight away
**And** the saree image for the request is the Design's first product photo.

**Given** the same request is sent twice with the same `Idempotency-Key`
**When** the second arrives
**Then** the same request id is returned and one job exists.

**Given** a request
**When** any of these is true: no Shopper session; no current consent, or consent that does not name every AI service of the current Model route, its check model included; no stored Shopper photo; Try-on switched off; no usable Model route or published Prompt version; a Design that is not published; a Design outside the Owner's chosen Designs when that list is set (Story 4.2)
**Then** it is refused with a distinct stable error code for that case and nothing is enqueued.

**Given** the per-Shopper limit in settings is 10 Try-on results per day
**When** a Shopper already has 10 requests today that are queued, running or ready
**Then** her next request is refused with `tryon.limit_reached` and the time, at the next start of day in the business time zone, when she can try again
**And** requests that ended failed, blocked or rejected by the check are not counted.

**Given** the Try-on request rate limit in settings
**When** a Shopper sends requests faster than it allows, whatever their outcome
**Then** the middleware refuses them with a rate-limit error.

**Given** a Shopper already has a request for the same Design queued or running
**When** she asks again
**Then** she is given the existing request rather than a second one.

**Given** an accepted request
**When** the client calls `GET /store/shop/tryon/requests/:id`
**Then** it returns the state (queued, running, ready, blocked, failed, erased) and nothing about the model
**And** another Shopper's session gets "not found".

**Given** the "used Try-on" function of Story 3.21, which has answered "no" until now
**When** this story is finished
**Then** it reads Try-on requests: it answers "yes" when the Shopper has a Try-on request for that Design that was accepted before the Order was paid, and "no" otherwise, so every rating recorded from now on is linked to whether she used Try-on (FR-53)
**And** the answer is fixed when the Order is created: `confirm-payment` asks the function once per Order item and stores the yes or no on that item, so the rating link survives a later erasure, and an erased Try-on request keeps no Shopper identity (AD-23)
**And** the Owner's Ratings page of Story 3.21 then shows real figures in its "used Try-on" and "did not" split.

**Given** a Shopper who closed the browser after requesting
**When** she later calls `GET /store/shop/tryon/requests`
**Then** she gets her requests from the retention period with their Designs and states, so a result that became ready is shown to her on return.

**Requirements:** FR-11, FR-14, FR-9; AD-4, AD-8, AD-11, AD-13, AD-15, AD-19
**Notes for the developer:**
- `tryon` module: the `tryon_request` entity (Shopper, Design, photo, state, times; route, prompt, cost and attempt fields are filled by Story 4.13). Workflow `request-tryon`. Routes `store/shop/tryon/requests`.
- `packages/contracts`: job `tryon.generate` and its payload (request id only; never a link), the request view model, the error codes. `api-client`: `requestTryOn`, `getTryOnRequest`, `listTryOnRequests`.
- The per-Shopper limit value is the Try-on limit already in shop settings (FR-56, Epic 3). The daily spending cap is Story 4.18. The worker job is Story 4.13 and the Shopper's screen is Story 4.16; until then a request stays queued.

---

### Story 4.13: The `tryon.generate` job: start, primary model, check, store and cost

As a Shopper,
I want my request run on the main model, checked and stored safely,
So that I get a Try-on result when the main model can make one.

**Acceptance Criteria:**

**Given** a queued Try-on request
**When** the worker takes the job
**Then** it calls `/internal/tryon/requests/:id/start`, and the `start-tryon-request` workflow re-checks the switch and current consent naming the AI services to be used, sets the request to running, records the Model route with its check model, Prompt version, time limit and the primary attempt with its AI services, and returns them with signed read links valid at most 10 minutes for the Shopper photo and the saree image.

**Given** the start check fails because consent was withdrawn, the request is erased, or Try-on was switched off after acceptance
**When** the worker receives the answer
**Then** it calls no AI provider, the request ends failed (or stays erased), and it does not count against her limit.

**Given** the primary model returns an image within the 90-second time limit and `ResultCheck` passes it
**When** the worker finishes
**Then** it stores the provider's file unchanged in `shopper-media` through a signed write link, reports the result to `/internal/tryon/requests/:id/result`, and the `record-tryon-result` workflow sets the request to ready
**And** the request records the AI provider, model, check model, AI services, Prompt version, duration of each attempt and the cost in paise, converted from the provider's price with the exchange-rate setting in force when it is recorded (AD-32).

**Given** a stored Try-on result
**When** a test compares it with the bytes the provider returned
**Then** the stored object is byte-identical (the same hash), so provenance information placed in the image by the AI provider is kept (FR-12, AD-22).

**Given** the primary model fails, times out or is blocked, or `ResultCheck` does not return `pass`
**When** the worker reports it in this story
**Then** nothing is stored or shown, the request ends failed with the reason recorded, and it does not count against her limit; Story 4.14 replaces this single ending with the fallback call and the distinct blocked and rejected outcomes.

**Given** the job's logs, results and error reports
**When** they are inspected
**Then** they contain ids, states, durations and costs, and no photo, link or image bytes.

**Requirements:** FR-11, FR-12 (provenance kept), FR-52; NFR-2, NFR-3; AD-1, AD-8, AD-9, AD-10, AD-11, AD-22, AD-32
**Notes for the developer:**
- The check fails closed: `unassessable`, which includes the check model not answering, never lets a result be stored or shown (AD-32).
- `apps/worker/src/jobs/tryon.generate` using Story 4.5's port and Story 4.6's check. Commerce: workflows `start-tryon-request`, `record-tryon-attempt`, `record-tryon-result`; routes `internal/tryon/requests/:id/{start,attempts,result}`.
- The time limit is the dated setting seeded in Story 4.5 (90 seconds at launch, AD-13), read at job start, never hardcoded.
- Tests use the fake provider: success, start refused, and the single failure ending. The fallback and the other outcomes are Story 4.14; erasure of results and requests is Story 4.15.

---

### Story 4.14: The `tryon.generate` job: fallback, blocked, rejected and repeated runs

As a Shopper,
I want my request tried once on the fallback when the main model fails, and an honest answer when no result can be shown,
So that a fault at one model does not cost me my Try-on, and I am never shown a result that failed its check.

**Acceptance Criteria:**

**Given** the primary model fails or gives no result within 90 seconds
**When** the limit passes
**Then** the worker records a fallback attempt with commerce and calls the fallback model once, with its own 90-second limit.

**Given** the fallback also fails or times out
**When** the worker reports it
**Then** the request ends failed, the Shopper is told her Try-on could not be made, and the attempt does not count against her limit.

**Given** an AI provider's safety check blocks the request, on the primary
**When** the worker receives `blocked`
**Then** the fallback is not called with the same photo, the request ends blocked, and the Shopper is asked for a different photo in neutral words
**And** a new request with the same Shopper photo is refused with `tryon.photo_blocked` until she replaces the photo.

**Given** `ResultCheck` returns `reject` or `unassessable` for a generated image
**When** the worker handles it
**Then** the image is not stored and not shown, the request ends with the outcome "rejected by check", it is counted as blocked in the cost and failure figures, its cost is still recorded, and the Shopper sees the same neutral failure message without being blamed.

**Given** the job runs twice, or the worker stops in the middle of an attempt
**When** the job runs again
**Then** a request already finished is left alone, an attempt recorded as started without an outcome is treated as failed, and no request ever causes more than one primary call and one fallback call.

**Given** a fallback attempt that returns an image
**When** `ResultCheck` passes it
**Then** it is stored, recorded and costed exactly as a primary result is in Story 4.13, with both attempts' durations and costs on the request.

**Requirements:** FR-11, FR-52; NFR-2, NFR-3; AD-8, AD-10, AD-22, AD-32
**Notes for the developer:**
- Extends `apps/worker/src/jobs/tryon.generate` and the workflows `record-tryon-attempt` and `record-tryon-result` of Story 4.13; adds the outcomes blocked and "rejected by check" and the error code `tryon.photo_blocked` (checked in `request-tryon`).
- Tests use the fake provider: timeout then fallback success, both fail, blocked, check reject, check unassessable, double run, worker stopped mid-attempt.
- A request left queued or running for too long is ended by the scheduled job of Story 4.17.

---

### Story 4.15: Erasure reaches Try-on results and requests

As a Shopper,
I want my Try-on results and requests erased with my photos, and no result to appear after I have erased,
So that erasure leaves nothing of me behind and no late job brings an image back.

**Acceptance Criteria:**

**Given** a Shopper whose account is deleted, or whose media are erased, after this story
**When** `erase-shopper-media` runs
**Then** it deletes her Try-on result files, marks her Try-on requests erased, and removes personal fields from them while keeping model, cost and times.

**Given** a result is reported for a request that has been marked erased
**When** `record-tryon-result` runs
**Then** the result is discarded, any stored file for it is deleted, the discard is written to the erasure ledger, and the request stays erased.

**Given** a request marked erased while its job is still queued
**When** the worker asks to start it
**Then** the start is refused as in Story 4.13 and no AI provider is called.

**Given** `erase-shopper-media` fails after deleting some result files
**When** it is retried
**Then** it resumes from the erasure ledger, deletes the rest, and marks each request erased once.

**Given** erased requests
**When** the Shopper lists her Try-on requests
**Then** none of them returns an image or a link.

**Requirements:** FR-15, FR-27; NFR-6; AD-4, AD-22, AD-23
**Notes for the developer:**
- Extends the `erase-shopper-media` workflow of Story 3.23, which Story 4.4 extended to Shopper photos, to cover Try-on result files and Try-on requests; it stays the only erasure path (AD-23).
- Extends `record-tryon-result` of Story 4.13 with the discard rule.
- Requests to AI providers for erasure are Story 4.23; withdrawal, which calls this workflow for a whole Shopper, is Story 4.22.
- Tests use the fake provider: erased before start, erased before result, erasure retried part-way.

---

### Story 4.16: See the Try-on result, labelled as AI-generated, and add the Design to the cart

As a Shopper,
I want to see my Try-on result clearly marked as AI-generated, with a way back to the real photos and a way to buy,
So that I can judge the saree on me without mistaking the image for a photograph.

**Acceptance Criteria:**

**Given** a request that is queued or running
**When** the Shopper is on the Try-on screen
**Then** she sees progress, the screen polls the status, and she can leave; on any later visit a ready result for that Design is shown to her without a new request.

**Given** a ready request
**When** the client asks for it
**Then** commerce returns a signed link valid at most 10 minutes, and the client draws a visible "AI-generated" label over the image wherever it is shown, including in her list of Try-on results
**And** when a link has expired the client asks again rather than showing a broken image.

**Given** the result screen
**When** it is shown
**Then** beside the result she is pointed to the Design's real photos and the Full saree view for true colour and design, each one tap away
**And** the Try-on result never appears among the Design's product photos, on the Design page gallery, in the catalogue or to any other Shopper.

**Given** the result screen
**When** she chooses "add to cart"
**Then** the Design's Variant is added to her cart through the existing cart function, with the same stock rules as on the Design page, and a sold-out Variant shows as sold out.

**Given** the result screen
**When** she chooses to save or share the image
**Then** the client fetches `GET /store/shop/tryon/requests/:id/labelled`, which returns a copy with the "AI-generated" label drawn into the pixels in her language, and offers only that copy
**And** the stored original stays unchanged, the route is refused for any other Shopper, and its answer is never cached by a shared cache
**And** the labelled copy carries over the provenance metadata of the stored original where the image format and sharp allow it; where they do not, the limit is written in `docs/`, and the stored original, byte-identical to the provider's file (Story 4.13), remains the record (FR-12).

**Given** a request that ended failed, blocked, or rejected by the check, or a refusal with `tryon.limit_reached`, `tryon.photo_blocked` or Try-on unavailable
**When** the Shopper sees the screen
**Then** each case has its own plain message from the translation file: could not be made and not counted; please choose a different photo, in neutral words; limit reached, with the time she can try again; Try-on is not available now.

**Given** a screen reader or the largest system font size
**When** the result screen is used
**Then** the label is announced with the image and every action is reachable.

**Requirements:** FR-11, FR-12, FR-14, FR-54; AD-2, AD-22; NFR-15
**Notes for the developer:**
- `apps/web`: the Try-on screen (progress, result, messages, list of her results), styled from DESIGN.md when it exists. Data only through `packages/api-client`.
- `apps/commerce`: route `store/shop/tryon/requests/:id/labelled`, drawing the label with sharp, which is already in the stack; label text from the translation file.
- Reading a result or the labelled copy counts as use for retention (Story 4.24 reads the last-used time; record it here on the request and photo).
- Reporting a result is Story 4.19. "Try-on result ready" is shown in the product, not sent by SMS (FR-54); there is no push service at launch, so a ready result is found by polling (spine, Consistency Conventions).

---

### Story 4.17: Try-on never slows or breaks the Design page

As a Shopper,
I want the Design page and my purchase to work whatever state Try-on is in,
So that a problem with AI never stops me buying a saree.

**Acceptance Criteria:**

**Given** the worker is stopped or the shop queue is unreachable
**When** a Shopper requests Try-on
**Then** the request is refused with "Try-on is not available now" or stays queued, and the Design page, cart and checkout behave as before.

**Given** a request that has been queued or running longer than twice the time limit plus five minutes
**When** the scheduled `expire-stale-tryon-requests` job runs
**Then** the request ends failed, does not count against her limit, and she sees the "could not be made" message.

**Given** commerce's Try-on status route is slow or fails
**When** the Design page loads
**Then** the page is usable within its normal time and the Try-on entry point is simply absent.

**Given** 20 fake-provider requests with a fixed delay
**When** they are run through the queue in a test
**Then** the time from acceptance to ready is recorded for each request, so that NFR-2 (95% within 60 seconds) can be measured from the same field in Story 4.20.

**Given** the worker's concurrency setting for `tryon.generate`
**When** more requests are queued than it allows
**Then** they wait in order and none is lost.

**Requirements:** FR-11; NFR-1, NFR-2; AD-4, AD-8
**Notes for the developer:**
- `apps/commerce/src/jobs`: `expire-stale-tryon-requests`, which starts a workflow (AD-4). Worker concurrency is an environment variable.
- `apps/web`: the entry point's failure path. No new entity.
- Alerts on a rising Try-on failure rate (NFR-9) are Story 7.2, which reads the Try-on request records. The 80% spend alert is built in Story 4.18.

---

### Story 4.18: The daily spending cap

As an Owner,
I want a daily cap on Try-on spending with a warning before it is reached,
So that a busy day or a fault cannot run up a bill I did not agree to.

**Acceptance Criteria:**

**Given** the Owner on the Try-on controls page
**When** she sets the daily spending cap in rupees
**Then** it is stored as a dated setting, takes effect without a release, and a `shop-audit` event records the before and after values.

**Given** a day in the business time zone
**When** a Try-on request is accepted
**Then** `request-tryon` reserves the higher of the primary and fallback price per image plus the price per check, and committed spend for the day is recorded cost plus reservations of requests still queued or running.

**Given** committed spend would pass the cap with one more request
**When** a Shopper requests Try-on
**Then** the request is refused with `tryon.paused_daily_cap`, she is told plainly that Try-on is paused for today and when it returns, and the status route reports unavailable with that reason
**And** the Owner is alerted once by a `message.send` job by email and SMS.

**Given** the daily cap is reached while a request is already running
**When** that request finishes
**Then** it is completed and shown; only new requests are refused, so spend never passes the cap by more than requests accepted before it.

**Given** committed spend first reaches 80% of the cap in a day
**When** the request that crosses it is accepted
**Then** the Owner is alerted once that day, within 5 minutes, by a `message.send` job whose id is the day plus "cap-80".

**Given** a request ends failed or blocked with a lower cost than reserved
**When** its result is recorded
**Then** the reservation is replaced by the recorded cost and the freed amount is available again.

**Given** the next day begins in the business time zone
**When** a Shopper requests Try-on
**Then** the pause has ended without any action by the Owner.

**Given** the Owner raises the cap during a pause
**When** the setting is saved
**Then** Try-on resumes at once.

**Given** no cap has been set
**When** the Owner tries to switch Try-on on
**Then** she is asked to set a cap first.

**Requirements:** FR-42, FR-14; NFR-9, NFR-3; AD-13, AD-14, AD-26
**Notes for the developer:**
- `settings` module for the cap; `tryon` module for the day's committed spend (a query over Try-on requests, not a separate counter that can drift). Extend `request-tryon`, `record-tryon-result` and `store/shop/tryon/status`.
- Message templates for the two alerts go into content; sending uses the existing `message.send` job.
- Test-bench spending is outside the cap (Story 4.9).

---

### Story 4.19: Report a Try-on result, and the Owner's review queue

As a Shopper,
I want to report a Try-on result as wrong or offensive from the screen where I see it,
So that the shop learns about bad results and can act.

**Acceptance Criteria:**

**Given** a Shopper looking at her Try-on result
**When** she chooses "report"
**Then** she picks "wrong" or "offensive", may add a short comment, and the `report-tryon-result` workflow records the report with the request's Design, Model route and Prompt version
**And** she is told it has been sent; reporting the same result again updates nothing and tells her it is already reported.

**Given** a report on a result that is not hers, or on a request that is not ready
**When** the route is called
**Then** it is refused.

**Given** the Owner on the review queue page
**When** she opens it
**Then** every reported Try-on result is listed with the Design, the Model route, the Prompt version, the Shopper's reason and comment, and the time
**And** she can filter by handled or not handled, and by Model route.

**Given** an entry in the queue
**When** the Owner opens the reported image
**Then** it is shown through a signed link valid at most 10 minutes with the "AI-generated" label drawn over it, and an access event is recorded for that Shopper's personal data, kept one year.

**Given** an entry
**When** the Owner marks it handled, with an optional note
**Then** the `handle-tryon-report` workflow records it and a `shop-audit` event is written; she can reopen it the same way.

**Given** a reported result that has since been erased
**When** the Owner opens the entry
**Then** the entry still shows the Design, Model route, Prompt version and reason, states that the image was erased, and shows no image and no Shopper identity.

**Given** the list itself
**When** it is shown
**Then** it contains no image thumbnails, so that only a deliberate open is an access.

**Requirements:** FR-13, FR-44; AD-14, AD-22; NFR-5
**Notes for the developer:**
- `tryon` module: the `tryon_report` entity. Workflows `report-tryon-result`, `handle-tryon-report`. Routes `store/shop/tryon/requests/:id/report` and `admin/shop/tryon/reports`.
- `apps/web`: the report control on the result screen (Story 4.16). `apps/commerce/src/admin`: the review queue page.
- A new unhandled report alerts the Owner through the existing `message.send` job, at most once an hour.

---

### Story 4.20: The cost and failure view

As an Owner,
I want to see by day and by Model route how many Try-on results were made, what they cost, how long they took and how many failed or were blocked,
So that I can tell whether a route is worth its price and meets its time target.

**Acceptance Criteria:**

**Given** the Owner on the cost and failure page
**When** she picks a range of days
**Then** each row is one day and one Model route, showing: requests, Try-on results made, failed, blocked by an AI provider, rejected by the check, fallback used, total cost, cost per result, median and 95th-percentile time from request to result, and the share that arrived within 60 seconds.

**Given** a day with sales
**When** the row is shown
**Then** the day's Try-on cost is also shown as a share of that day's sales value, and as "no sales" when there were none.

**Given** a request finished 61 minutes ago
**When** the page is opened
**Then** it is included; the page states the time of its figures, which are never more than one hour old.

**Given** requests whose Shopper data has been erased
**When** the figures are computed
**Then** they are still counted, because model, cost and times are kept (AD-23).

**Given** test-bench runs in the range
**When** the page is shown
**Then** their cost is shown on a separate line and is not mixed into Shoppers' figures.

**Given** provider-reported amounts
**When** the Owner opens a row's detail
**Then** the total reported by the AI provider is shown by currency beside the recorded cost in rupees, which was converted with the exchange-rate setting when each cost was recorded and is not converted again when the rate changes (AD-32).

**Given** days are counted
**When** a request falls near midnight
**Then** it belongs to the day of its acceptance in the business time zone.

**Requirements:** FR-45, FR-52; NFR-2, NFR-3; AD-10, AD-13, AD-23
**Notes for the developer:**
- Route `admin/shop/tryon/costs` reading the `tryon` module and the day's Order totals from the kernel in one read-only query step; no module calls another (the route composes them). Admin page in `apps/commerce/src/admin`.
- No new entity: figures are computed from Try-on requests and attempts. Add indexes if the query needs them.
- The page shows no Shopper identity and no images, so it records no access event.

---

### Story 4.21: The change history of Try-on controls

As an Owner,
I want one history of every change to the Model route, the Approved-model list, Prompt versions, limits, the chosen Designs, the cap, the cost ceiling, the exchange rate and the off switch,
So that I can see who changed what and when, and nobody can rewrite it.

**Acceptance Criteria:**

**Given** the Owner on the Try-on change history page
**When** she opens it
**Then** every such change is listed newest first with who made it, when, the action, and the before and after values
**And** she can filter by kind of change and by date.

**Given** each workflow from Stories 4.2, 4.7, 4.8, 4.10, 4.11 and 4.18, and the Try-on limit in shop settings
**When** a test runs the workflow
**Then** exactly one `shop-audit` event with before and after values appears in the history, and a refused change writes none.

**Given** a publish of a notice version in content
**When** the history is shown
**Then** the notice version recorded by commerce (Story 4.1) appears as an entry, with the content admin's email as actor.

**Given** any Admin account, the Admin pages and the shop routes
**When** someone tries to edit or delete a history entry
**Then** there is no page control and no route that does it; a direct call is refused.

**Given** a long prompt text in before and after values
**When** the entry is opened
**Then** both texts are shown in full with the differences marked.

**Requirements:** FR-46; AD-14
**Notes for the developer:**
- Route `admin/shop/tryon/history` reading the existing `shop-audit` module with a fixed list of Try-on action names from `packages/contracts`. Admin page in `apps/commerce/src/admin`.
- No new entity. This story also adds the test that walks every Try-on control workflow and fails if one writes no audit event.

---

### Story 4.22: Withdraw Try-on consent and erase everything

As a Shopper,
I want to withdraw my Try-on consent as easily as I gave it,
So that my photos and Try-on results are gone and nothing more is sent anywhere.

**Acceptance Criteria:**

**Given** a Shopper with Try-on consent
**When** she opens her account or the Try-on screen
**Then** "withdraw Try-on consent" is offered in both places and takes one action and one confirmation, no more steps than giving consent.

**Given** she confirms withdrawal
**When** the `withdraw-tryon-consent` workflow runs
**Then** her consent is recorded as withdrawn with the time, and `erase-shopper-media` is started for all her Try-on media
**And** from that moment a Try-on request from her is refused with `tryon.consent_required`.

**Given** `erase-shopper-media` runs for her
**When** it completes
**Then** her Shopper photos and Try-on result files are deleted from `shopper-media`, her Try-on requests are marked erased with personal fields removed and model, cost and times kept, and every step is written to the erasure ledger
**And** her signed links no longer return an image, and her list of Try-on results is empty.

**Given** she has a request queued or running when she withdraws
**When** the worker asks to start it, or reports a result for it
**Then** a job not yet started calls no AI provider, and a result arriving after withdrawal is discarded and not stored, with the discard written to the erasure ledger.

**Given** a step of the erasure fails, for example the bucket is unreachable
**When** the workflow retries
**Then** it resumes without repeating finished steps, the ledger shows the failure and the retry, and the withdrawal itself stays recorded.

**Given** a Shopper who withdrew
**When** she opens Try-on again
**Then** she is shown the consent notice again and, on accepting, starts with no stored photo.

**Given** withdrawal
**When** it completes
**Then** her Orders, invoices, cart and account are untouched, and the consent and withdrawal records are kept as evidence.

**Given** the Owner looks up the Shopper in Shopper support
**When** she views consents
**Then** the withdrawal and the state of the erasure are shown.

**Requirements:** FR-15; NFR-6; AD-11, AD-23, AD-22, AD-4
**Notes for the developer:**
- Workflow `withdraw-tryon-consent` in `apps/commerce/src/workflows`; route `store/shop/tryon/consent/withdraw`; `consent` module records withdrawal as a new fact, never by editing the acceptance row.
- `erase-shopper-media` already covers photos (Story 4.4) and results (Story 4.15); this story adds the whole-Shopper trigger, resumable steps and the ledger rows for each.
- `apps/web`: the withdrawal control in account and on the Try-on screen, styled from DESIGN.md when it exists.
- Erasure requests to AI providers and the 24-hour check are Story 4.23.

---

### Story 4.23: Ask AI providers to erase, and keep the erasure ledger honest

As a Shopper,
I want the AI services that received my photo asked to erase it, and the outcome recorded,
So that erasure does not stop at the shop's own storage.

**Acceptance Criteria:**

**Given** `erase-shopper-media` runs for a Shopper, or for one photo or result
**When** it finishes deleting the shop's own files
**Then** it enqueues one `media.erase-at-provider` job for each AI service that received a photo in the erased requests, including an attempt that had started but not finished, each with a deterministic id made from the erasure id and the AI-service id
**And** an erasure whose requests reached no AI service enqueues none and the ledger says so.

**Given** a `media.erase-at-provider` job
**When** the worker runs it
**Then** it calls `requestErasure` on the `TryOnProvider` for that AI service and reports the answer to `/internal/erasure/:id/provider-outcome`, and the `record-provider-erasure` workflow writes it to the erasure ledger with the time.

**Given** the answer is `confirmed` or `accepted`
**When** it is recorded
**Then** that AI service's line in the ledger is closed.

**Given** the answer is `unsupported` because the AI provider offers no erasure call
**When** it is recorded
**Then** the ledger line reads "not supported; relies on the provider's stated retention" and is closed (AD-32)
**And** the Owner is alerted once for that provider by a `message.send` job whose id is the provider plus "erasure-unsupported", not once per request or per erasure.

**Given** the answer is `failed`, or no answer arrives after the job's retries
**When** it is recorded
**Then** the Owner is alerted by a `message.send` job naming the AI service and the erasure, without the Shopper's photo
**And** the Owner can record in the Admin what she did by hand (for example a written request to the provider) and its outcome, which closes the line and is audited.

**Given** an erasure started more than 24 hours ago with any step or provider line still open
**When** the scheduled erasure-deadline job runs
**Then** the Owner is alerted, and the erasure is listed as overdue on the erasure ledger page.

**Given** the Owner on the erasure ledger page
**When** she opens it
**Then** each erasure shows its cause (withdrawal, single item, retention, account deletion, depicted person's request), its steps, each AI service's outcome and its times
**And** no page or route edits or deletes a ledger entry.

**Given** the job runs twice
**When** the second run reports
**Then** the ledger holds one outcome for that AI service and the Owner is alerted at most once.

**Given** a data request under FR-28
**When** the Owner answers it for a Shopper
**Then** the AI services that received her Shopper photos can be read from her requests and ledger entries
**And** the data report of Story 3.24 now also lists her Try-on consents with version, language and time, her withdrawals, whether a Shopper photo is stored and since when, and her Try-on requests with state and time only, never an image or a link (FR-28).

**Requirements:** FR-15, FR-28; NFR-6; AD-8, AD-9, AD-10, AD-23, AD-26, AD-32
**Notes for the developer:**
- `apps/worker/src/jobs/media.erase-at-provider`; the `media.erase-at-provider` payload that Story 3.23 put in `packages/contracts` (erasure id and AI-service id; never a photo). Commerce: workflow `record-provider-erasure`, route `internal/erasure/:id/provider-outcome`, Admin ledger page. The erasure-deadline job in `apps/commerce/src/jobs` exists from Story 3.23; extend it to count open provider lines.
- This story also extends the one function of Story 3.24 that lists the AI providers that received a Shopper's photos, and adds the Try-on section (consents, withdrawals, stored photo, requests) to the `prepare-data-report` workflow of that story.
- Tests use the fake provider for `confirmed`, `accepted`, `unsupported`, `failed` and no answer.
- With the no-retention option always set (Story 4.5) an AI provider may hold nothing to erase; the request is still sent and the answer recorded.

---

### Story 4.24: Delete a single item, and delete what has not been used for 30 days

As a Shopper,
I want to delete one Shopper photo or one Try-on result when I choose, and to have unused ones deleted for me,
So that nothing of me is kept longer than I want or longer than the notice says.

**Acceptance Criteria:**

**Given** a Shopper looking at her stored Shopper photo or one of her Try-on results
**When** she chooses delete and confirms
**Then** `erase-shopper-media` runs scoped to that item, with the same steps as withdrawal including the AI-service requests of Story 4.23, and her consent and other items stay as they are.

**Given** she deletes her Shopper photo while a request using it is running
**When** the result arrives
**Then** it is discarded and not stored.

**Given** the retention period in settings is 30 days
**When** the scheduled retention job runs each day
**Then** every Shopper photo and Try-on result whose last use is more than 30 days ago is erased through `erase-shopper-media` with the cause "retention"
**And** an item used 29 days ago is kept.

**Given** "last use"
**When** it is computed
**Then** a Shopper photo is used when it is uploaded, shown to her or used in a request; a Try-on result is used when it is made, shown to her or fetched as a labelled copy; a view by the Owner in the review queue is not a use.

**Given** the retention period shown in the published Try-on consent notice differs from the retention setting
**When** the Owner saves either
**Then** she is warned that they differ, and the Try-on controls page shows the mismatch until they agree.

**Given** the grievance form of Story 3.22
**When** this story is finished
**Then** it offers one more request type, "I appear in a Try-on image without agreeing", open to a person who is not signed in; it creates a ticket with a number, an acknowledgement and the same two deadlines, asks for a description and a way to answer her, and never asks her to upload the image (FR-9).

**Given** a person who appears in a Try-on result or Shopper photo without agreeing asks for removal through the published contact
**When** the Owner finds the item in Shopper support and chooses "erase this item"
**Then** `erase-shopper-media` runs scoped to it with the cause "depicted person's request", the view is recorded as an access event, and the action is audited.

**Given** the retention job fails part-way
**When** it next runs
**Then** it continues with the remaining items and erases none twice.

**Requirements:** FR-15, FR-51, FR-9; NFR-6; AD-4, AD-13, AD-14, AD-23
**Notes for the developer:**
- Routes `store/shop/tryon/photo` (delete) and `store/shop/tryon/requests/:id` (delete); job `retention` in `apps/commerce/src/jobs`, which only starts the workflow; the retention period is a dated setting.
- `apps/web`: delete controls on the photo step and the result screen, and the new request type on the grievance form (the `complaint` module's type list in `packages/contracts`). Admin: "erase this item" in Shopper support.
- The retention job and every Shopper erasure skip the samples prefix of Story 4.9.
- The last-used time was recorded from Story 4.16 on; this story adds any missing writes and the tests at 29, 30 and 31 days.

---

### Story 4.25: The launch gate tools: rating view, decision record and the rules that follow from it

As an Owner,
I want a blind rating view for test-bench outputs and a recorded launch gate decision that the off switch obeys,
So that Try-on can be switched on only on the strength of a recorded test.

**Acceptance Criteria:**

**Given** a finished test-bench run
**When** the Owner opens its rating view and enters a rater's name
**Then** the rater is shown each sample pair's outputs beside the real saree photo with models hidden behind letters in a shuffled order, and gives each output a score from 1 to 5 for border, for pallu and for colour, and marks whether it is still a draped saree
**And** scores are stored per rater and per output, and the run's summary shows, per model and Prompt version, the mean of each score, the share of outputs still a draped saree, the cost per image and the 95th-percentile time.

**Given** runs chosen for a decision
**When** any output of any model in them lacks a score from any named rater
**Then** a decision cannot be recorded, and the page lists what is missing.

**Given** the ratings are complete
**When** the Owner records the decision on the launch gate page
**Then** she enters the pass mark she has set, the raters, and one of: go (with the model and Prompt version to publish), no-go, or narrow (go only for the Designs she lists)
**And** the decision is stored with the runs it rests on, her account and the time, is audited, and cannot be edited; a later test records a new decision.

**Given** the decision is no-go, or no decision has been recorded
**When** anyone tries to switch Try-on on
**Then** `set-tryon-switch` refuses, the switch stays off, and the shop launches without Try-on: no entry point on any Design page.

**Given** the decision is narrow
**When** it is recorded
**Then** `record-gate-decision` sets the Owner's chosen-Designs limit of Story 4.2 to the listed Designs, through `set-tryon-designs`, so the narrow outcome is applied by the same control the Owner can use at any time (FR-42)
**And** when Try-on is switched on, the status route answers available only for those Designs, the entry point is absent on every other Design, and a request for another Design is refused (Stories 4.2 and 4.12).

**Given** the automated tests for the rating view, the decision record, the switch rule and the chosen-Designs limit
**When** they run
**Then** they use the fake provider and pass with no real AI provider and no human rater.

**Requirements:** PRD §6.3; FR-43, FR-42; AD-10, AD-14
**Notes for the developer:**
- `tryon` module: entities `bench_rating` and `gate_decision`; workflows `rate-bench-item`, `record-gate-decision`; extend `set-tryon-switch` for the decision; the Design list is the chosen-Designs setting of Story 4.2, not a second list. Admin pages: rating view and launch gate.
- This story is complete when the tools are built and tested with the fake provider. Running the gate with real sarees, real people and real providers is Story 4.26, which the Owner does.
- The research found that untuned older try-on models turned sarees into western-style garments; the "still a draped saree" mark exists to catch exactly that.

---

### Story 4.26: The Owner runs the launch gate and records the decision

As an Owner,
I want real sarees and consenting adults' photos run through the candidate models and rated by saree buyers, with the decision recorded,
So that Try-on ships only if it shows border, pallu and colour faithfully, and stays off if it does not.

**Acceptance Criteria:**

**Given** the launch gate
**When** the Owner prepares it
**Then** the sample set holds real sarees from the launch catalogue covering its weaves and border styles, and full-length photos of adults who each agreed to this use (recorded as in Story 4.9); no Shopper's photo is used.

**Given** the candidate models in the technical research (OpenAI `gpt-image-2.6`, Google `gemini-nano-banana-2.1`, Qwen-Image-Edit-2511 untuned, FASHN v1.6)
**When** the Owner runs the gate on staging with the real provider key
**Then** each candidate reachable through the OpenRouter adapter and approvable under Story 4.7 is approved and run on the whole sample set through the real AI provider
**And** each candidate that cannot be reached or approved is recorded in the decision as not tested, with the reason.

**Given** the runs are finished
**When** saree buyers named by the Owner rate them in the rating view of Story 4.25
**Then** every output of every tested model has scores from every rater, and the Owner records go, no-go or narrow with her pass mark on the launch gate page.

**Given** the decision is go or narrow
**When** the Owner publishes the Model route
**Then** it still passes every check of Story 4.11, including the notice naming its AI services and the cost ceiling
**And** she resets the Try-on time target and the cost ceiling in settings from the measured figures (NFR-2, NFR-3).

**Given** no candidate passes
**When** the decision is recorded as no-go
**Then** the switch stays off by the rule of Story 4.25 and the shop launches without Try-on (PRD §6.3).

**Requirements:** PRD §6.3; FR-43, FR-42, FR-39; NFR-2, NFR-3; AD-10
**Notes for the developer:**
- This is the Owner's task, not a build task: it needs real sarees, consenting adults, human raters and real provider keys, and a developer agent cannot finish it. It is tracked as an item on the launch checklist of Story 7.14 and is complete when a decision is recorded.
- What a developer agent can do here: check that Story 4.25's pages work on staging with the real key configured, prepare a one-page run sheet in `docs/` for the Owner, and hand the story back marked "waiting for the Owner".
- A fine-tuned or self-hosted model is deferred by the spine; if no candidate passes, that is the next thing to try, behind a new adapter.
