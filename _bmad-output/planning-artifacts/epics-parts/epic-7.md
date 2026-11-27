## Epic 7: Ready to launch and to run alone

The Owner is told within minutes when something breaks, can rebuild the whole shop on a clean server from backups, sees the counts behind the success metrics, has the reviewed legal documents and disclosures live, knows that every routine task is an Admin page, and has the Android app accepted by the store. The epic ends with real payments switched on. It adds no new functional requirement; it makes the requirements already built safe to run by one person.

**FRs covered:** none new; FR-50 stays deferred
**NFRs:** NFR-7, NFR-8 (complete), NFR-9, NFR-10, NFR-16, and a final pass on NFR-1 to NFR-15

**Rules that apply to every story in this epic**

- Every alert and every message to the Owner or a Shopper is a `message.send` job with a template from content (AD-26). The one exception is the "shop is down" alert, which must come from outside the shop.
- Thresholds, limits and regulated values are settings with an effective date, changed in the Admin and audited (AD-13, AD-14). Nothing here hardcodes one.
- No story adds a vendor SDK, an analytics or advertising SDK, or a tool the spine does not name (AD-16, AD-29). Where the spine defers a vendor choice (uptime check, SMS, email), the choice is configuration behind the existing adapter.
- Some stories are done by the Owner with papers and consoles rather than by code. Their acceptance criteria are records that can be checked; the developer agent prepares the inputs and the checks, and the Owner performs the outside steps.
- Any Shopper-facing screen touched is described by behaviour only and is styled from DESIGN.md when it exists.

---

### Story 7.1: Know within 5 minutes when the shop is down

As an Owner,
I want to be alerted from outside the shop when it stops working,
So that I can act before Shoppers give up.

**Acceptance Criteria:**

**Given** the deployed system
**When** each unit's health route is called (commerce, content, worker, web)
**Then** it reports healthy only if that unit can do its work: commerce can reach its database, the Redis for queues and locks, and object storage; content can reach its database; the worker is consuming the shop queue; web can reach commerce (Conventions: Logging and alerts)
**And** one public health address behind Caddy reports the shop unhealthy when any unit is unhealthy or when the worker has not reported for 2 minutes
**And** the public answer contains no personal data, secret, version number or internal address

**Given** an outside uptime check configured to call the public health address and the website's home page every minute
**When** commerce is stopped on staging
**Then** the Owner receives an alert by email and by SMS within 5 minutes of the stop, sent by the outside check itself and not by the shop (NFR-9)
**And** when the shop is healthy again the Owner receives a "recovered" message

**Given** only the worker is stopped
**When** 2 minutes pass
**Then** the public health address reports unhealthy and the Owner is alerted within 5 minutes of the stop

**Given** the whole server is switched off, or its network is cut
**When** the outside check cannot connect
**Then** the Owner is alerted within 5 minutes

**Given** the site's certificate is within 14 days of expiry, or the domain stops resolving
**When** the outside check runs
**Then** the Owner is alerted `[ASSUMPTION: 14 days' warning before a certificate expires; NFR-9 does not cover certificates]`

**Given** a short blip of less than one minute
**When** the next check succeeds
**Then** no alert is sent; an alert needs two failed checks in a row

**Given** the chosen uptime service
**When** this story is done
**Then** `docs/` records which service is used, what it checks, whom it alerts and how to change those, and the service holds only the Owner's contact details and no Shopper data

**Requirements:** NFR-9, AD-16, AD-26
**Notes for the developer:**
- Touches the health routes in `apps/commerce`, `apps/content`, `apps/worker`, `apps/web` (verify or complete what earlier epics built), the Caddy configuration in `infra/`, and `docs/`.
- The uptime service is a deferred vendor choice in the spine; it is configuration, not code, and no SDK is added.
- Alerts about error rates, payments and Try-on are in Story 7.2.

---

### Story 7.2: Alerts for errors, payment failures, Try-on failures and Try-on spend

As an Owner,
I want to be alerted when errors, payment failures or Try-on failures rise above a rate I set, and when Try-on spend reaches 80% of the daily cap,
So that I learn of trouble from the shop and not from a Shopper.

**Acceptance Criteria:**

**Given** the Admin's shop settings
**When** the Owner opens the alert settings
**Then** she can set, for application errors, payment failures and Try-on failures, a rate, the period it is measured over and the smallest number of events that counts, and each change is audited (NFR-9, AD-13, AD-14)
**And** launch values are those of the spine's test profile: application errors above 2% of requests over 5 minutes; payment failures above 20% of payment attempts over 15 minutes; Try-on failures above 20% of requests over 15 minutes
**And** each has a smallest number of events that counts, so one failure in a quiet period is not an alert: 10 errors, 5 payment attempts, 5 Try-on requests `[ASSUMPTION: these three minimum counts; the spine gives the rates and periods only]`

**Given** a threshold is crossed
**When** the alert check next runs
**Then** a `message.send` job to the Owner is enqueued for email and for SMS within 5 minutes of the moment the threshold was crossed (NFR-9, AD-26)
**And** the message names the condition, the measured rate, the threshold and the period, and contains no Shopper's name, number, address, photo, link or code
**And** each job's id is the alert's id plus the channel, so a retry sends nothing twice

**Given** an alert is active
**When** the condition continues
**Then** no further alert is sent for it except one reminder every 60 minutes, and when the rate falls back under the threshold one "cleared" message is sent `[ASSUMPTION: a reminder every 60 minutes while an alert is active]`

**Given** the 80% spend alert and the alert and pause at 100% of the daily cap, both built in Story 4.16
**When** this story is complete
**Then** they are not built again: each is shown on the alerts page with the other alerts, and a test proves the 80% alert still reaches the Owner once for that day, within 5 minutes, with the amount spent and the cap (NFR-9, FR-42)
**And** this story adds one thing to it: raising the cap during the day re-arms the 80% alert against the new cap

**Given** application errors
**When** they are counted
**Then** the count includes server errors answered by commerce's shop and admin routes and shop-queue jobs that failed after their last retry; refusals that are the system working as designed (wrong code, rate limit, sold out, `client.update_required`) are not errors
**And** a payment the Shopper abandoned is not a payment failure; a failure reported by the payment service is

**Given** the Admin
**When** the Owner opens the alerts page
**Then** she sees every alert with when it started, when it cleared and whether each message was sent
**And** a "send a test alert" action delivers a test message by email and SMS so she can check the path

**Given** the SMS or email service refuses an alert message
**When** the worker has used its retries
**Then** the other channel is still sent, and the failure is shown on the alerts page

**Given** the alert check itself has not run for 5 minutes
**When** the public health address is called
**Then** it reports unhealthy, so Story 7.1's outside check alerts the Owner

**Requirements:** NFR-9, FR-42, FR-54, AD-4, AD-13, AD-14, AD-26
**Notes for the developer:**
- Touches `apps/commerce` (a scheduled job in `src/jobs` that starts an alert workflow, the `settings` module, a tally of requests and errors kept in the commerce database, an admin page) and `apps/content` (message templates for each alert).
- Keep the tally out of the Redis that holds queues and locks (AD-8). Payment and Try-on figures are read from existing payment and Try-on request records.
- The thresholds are settings (spine, Consistency Conventions, "Test profiles"). The Owner's alert email and mobile number are the settings of Story 3.5, and `owner-alert` templates follow Story 3.18.
- Errors inside `apps/web` pages are not counted here; the outside check in Story 7.1 covers the website being down.

---

### Story 7.3: Counts and the Owner's view of the success metrics

As an Owner,
I want the shop to count the events behind the success metrics and show me each metric against its target,
So that I can tell whether the shop is working without handing Shopper data to anyone.

**Acceptance Criteria:**

**Given** the counts module in commerce
**When** an event is recorded
**Then** it is stored as a count for one of: Design-page view, Full saree view open, Try-on request, cart addition, Order; with the day in the business time zone, the Design, and the platform (website or android) (NFR-16, AD-29)
**And** nothing that identifies a Shopper or a device is stored or logged with it: no Shopper id, mobile number, address, session, device id or network address, even when the Shopper is signed in

**Given** the store route for counts
**When** a client reports a Design-page view, a Full saree view open or a cart addition through `packages/api-client`
**Then** the count for that day, Design and platform goes up by one, and the route answers at once
**And** a report with an unknown event name or an unknown Design is ignored without an error, and the route is rate limited by commerce middleware without storing who called it

**Given** a Try-on request is accepted, or an Order is created
**When** its workflow runs
**Then** the workflow records the matching count itself, so these two do not depend on a client's report `[ASSUMPTION: AD-29 says clients report counts; these two are recorded by the server instead so that none is missed]`
**And** a workflow that is retried records the count once

**Given** the Admin
**When** the Owner opens the success-metrics page and chooses a month
**Then** she sees each metric in PRD §9 with its target beside it: SM-1 paid Orders in the month (target 100 by month six); SM-2 average "matched what I saw" rating (4.5 or better); SM-3 Returns with the reason "not as shown" as a share of Orders (under 5%); SM-4 share of Shoppers who ordered again within 90 days (20%); SM-5 Design-page views that lead to a Try-on request, as Try-on requests per 100 Design-page views (30); SM-6 Try-on spend as a share of sales value (under 3%); SM-7 median time from creating a Design to publishing it (under 15 minutes); SM-8 Design-page views in which the Full saree view is opened, as Full saree view opens per 100 Design-page views (40)
**And** SM-5 and SM-8 are ratios of Design-page views, as PRD §9 defines them, because counts carry no Shopper identity and so cannot count visitors
**And** SM-1 is shown with SM-3 beside it, and SM-5 and SM-6 are shown with the counter-metric notes SM-C1 to SM-C3 from PRD §9
**And** figures are no more than one hour old, and can be split by website and android

**Given** a month with no Orders or no Design-page views
**When** the page is shown
**Then** each affected metric shows "no data yet" and never a division error

**Given** the counts and the metrics page
**When** the code and the deployed pages are inspected
**Then** no count is sent to any outside service, and nothing links a count to an advertising profile (NFR-16)

**Requirements:** NFR-16, PRD §9, AD-2, AD-4, AD-14, AD-29
**Notes for the developer:**
- Touches `apps/commerce` (the `counts` module, one store route, one workflow step used by the Try-on and Order workflows, one admin page), `packages/contracts` (event names, request shape) and `packages/api-client` (one function). No earlier epic creates the `counts` module; it is created here.
- SM-2, SM-3, SM-4, SM-6 and SM-7 are read from ratings, Returns, Orders, Try-on requests and audit events that already exist; they are not new counts.
- Clients start reporting in Story 7.4.

---

### Story 7.4: The website and the app report their counts

As an Owner,
I want the website and the Android app to report Design-page views, Full saree view opens and cart additions,
So that the success metrics reflect what Shoppers actually do on both.

**Acceptance Criteria:**

**Given** a Shopper opens a Design page on the website or in the app
**When** the page has been shown
**Then** one Design-page view is reported for that Design and platform through `packages/api-client` (NFR-16)
**And** returning to the same page with the back action does not report a second view, and a refresh or a new visit does

**Given** she opens the Full saree view, or adds a Design to her cart
**When** the action succeeds
**Then** one Full saree view open, or one cart addition, is reported
**And** at most one Full saree view open is reported for each Design-page view, so that SM-8 reads as a share of views

**Given** any report
**When** it is sent
**Then** it is sent after the page is usable and never delays or blocks the page, the cart or the viewer (NFR-1, Conventions: Speed)
**And** if it fails or the device is offline it is dropped silently; the Shopper sees no error and nothing is stored on her device to send later

**Given** an app version released in Epic 6, before this story
**When** it runs
**Then** it keeps working unchanged and simply reports nothing; the counts route is an addition (AD-27)

**Given** the website and the app
**When** their dependencies and the app's built manifest are checked in continuous integration
**Then** the build fails if any third-party analytics or advertising package is present, or if the app's manifest contains the advertising-id permission (AD-29)

**Given** the metrics page from Story 7.3
**When** a test session opens three Design pages, one Full saree view and adds one item to the cart on each platform against staging
**Then** the page shows exactly those counts for each platform within one hour

**Requirements:** NFR-16, NFR-1, AD-2, AD-27, AD-29
**Notes for the developer:**
- Touches `apps/web` and `apps/mobile` only, plus one continuous-integration check. The view of the Full saree view is counted by the native screen on the app and by the page on the website, not by the viewer page itself, so it is never counted twice.
- A new app release is needed for the app's reports; record its schema set as Story 6.19 requires.
- Try-on requests and Orders are already counted by the server (Story 7.3).

---

### Story 7.5: Daily payment reconciliation the Owner can act on

As an Owner,
I want to be alerted to any difference between payments and Orders each day and to settle it from the Admin,
So that no Shopper is charged without an Order and no Order exists without its money.

**Acceptance Criteria:**

**Given** the daily reconciliation job from Epic 1
**When** it runs for the previous business day
**Then** it compares the payment service's captured payments and refunds with the shop's Orders and refund records, and stores the run with its time, the totals compared and each difference found (NFR-4, AD-7)
**And** payments whose Hold could still be live (begun in the last 15 minutes before the run) are left for the next run, so that a payment in flight is not reported as a difference

**Given** a run finds one or more differences
**When** it finishes
**Then** the Owner is alerted by `message.send` on email and SMS, naming how many differences of which kind, without any Shopper's personal data (AD-26)
**And** a run with no difference sends no alert and is shown as "no unexplained difference"

**Given** the job did not run by its expected time, or could not read the payment service's records
**When** one hour has passed
**Then** the Owner is alerted that reconciliation did not complete, and the run is shown as failed, never as clean

**Given** the Admin's reconciliation page
**When** the Owner opens it
**Then** she sees each day's run and, for each difference, its kind (payment without Order, Order without payment, amount mismatch, refund mismatch), the payment service's reference, the amount and the linked Checkout or Order where one exists
**And** opening a difference that shows a Shopper's details records an access event (AD-14)

**Given** a payment without an Order whose Checkout snapshot exists
**When** the Owner chooses "rebuild Order"
**Then** `confirm-payment` runs for that Checkout: an Order with its invoice is created if the Pieces are still free, otherwise the payment is refunded automatically and the Shopper is messaged, exactly as FR-19 says for a late confirmation
**And** running it twice creates one Order and one charge (AD-7)

**Given** a payment without an Order whose Checkout snapshot is missing from the database, as after a restore
**When** the Owner chooses "rebuild Order", or the reconciliation job reaches it
**Then** the Order is rebuilt from the Checkout's recovery file in the `documents` bucket, found by the Checkout id carried on the payment: its items, quantities, prices, tax, address and Shopper id, with the Order id and invoice number already written in the file used again (AD-30, Stories 1.9 to 1.13)
**And** nothing but the Checkout id needs to be carried on the payment, and no address is sent to the payment service
**And** when there is no recovery file for the payment, the only action offered is a full refund to source

**Given** any difference
**When** the Owner settles it by rebuild, by refund, or by marking it explained with a written note
**Then** the action is audited with before and after, and the difference shows as settled (AD-14)
**And** a day counts as reconciled only when every difference on it is settled

**Requirements:** NFR-4, NFR-8, FR-19, FR-24, AD-4, AD-7, AD-14, AD-17, AD-26, AD-30
**Notes for the developer:**
- Builds on Story 1.12, which created the reconciliation job, its records, its Admin page and the rebuild from a recovery file. This story adds the alerts, the kinds of difference, the Owner's actions to settle one, and the rule that a day is reconciled only when every difference is settled. Touches `apps/commerce` (`src/jobs` reconciliation, a rebuild workflow that reuses `confirm-payment`, the admin page, the razorpay provider's read of payments and refunds) and `apps/content` (two message templates).
- Refunds still go only through the refund workflow; this page never edits a payment directly (AD-21).
- Story 7.7 relies on "rebuild Order" during the restore rehearsal.

---

### Story 7.6: Backups made complete

As an Owner,
I want the database, the stored files and the secrets backed up continuously to another location, and to be told if that stops,
So that losing the server does not lose the shop.

**Acceptance Criteria:**

**Given** the production and staging database server
**When** it is running
**Then** pgBackRest ships the write-ahead log continuously and takes a full backup every night, for both the `commerce` and `content` databases, to object storage in a different location from the server (AD-17, NFR-8)
**And** the newest shipped log is never more than 15 minutes old, including when the shop is idle
**And** the backup store is encrypted, and the server's access to it is by its own credential, separate from the buckets the shop uses (NFR-5)

**Given** the `catalog` and `documents` buckets
**When** a file is added, replaced or deleted
**Then** the bucket keeps earlier versions, and a daily copy of both buckets goes to the other location (NFR-8, AD-22)
**And** the `documents` bucket holds, besides invoices and credit notes, every Checkout's recovery file, written at `begin-checkout`; the bucket is in object storage off the server, so a recovery file survives the loss of the server from the moment it is written (AD-30)
**And** the `tiles` bucket is not copied, because the worker can rebuild it from the full-length images in `catalog`
**And** the `shopper-media` bucket is neither versioned nor copied anywhere, so that an erased Shopper photo cannot come back from a backup (AD-22, AD-23); a check fails if versioning is ever on for it

**Given** the secrets the shop needs to start, including those that encrypt admin second factors and the app signing key from Story 6.19
**When** the backup is made
**Then** an encrypted bundle of them is stored in the other location and one copy is held by the Owner offline, the passphrase is held only by the Owner, and `docs/` lists every secret, what it is for and where it is obtained again (AD-17, Conventions: Config and secrets)
**And** no secret is in the repository or in a log

**Given** backups are running
**When** the nightly backup has not completed by its expected time, or the newest shipped log is older than 15 minutes, or the daily bucket copy failed
**Then** the Owner is alerted by `message.send` within 5 minutes of the check finding it (AD-26)

**Given** a backup taken last night
**When** the check job verifies it
**Then** the backup's integrity is confirmed by pgBackRest's own check, and the result is stored with the time

**Given** backups older than the retention the Owner has set `[ASSUMPTION: 14 days of point-in-time recovery at launch; NFR-8 gives no retention]`
**When** the nightly job runs
**Then** they are removed, and backups within it are kept

**Given** the Redis that holds queues and locks
**When** the server is lost
**Then** its contents are not restored from a backup; `docs/` states that queued work is re-created after a restore from business records, as Story 7.7 proves (AD-8)

**Requirements:** NFR-8, NFR-5, AD-8, AD-16, AD-17, AD-22, AD-23, AD-26, AD-30
**Notes for the developer:**
- Builds on Story 1.21, which set up pgBackRest and the first restore script; this story completes the backups. Touches `infra/` (pgBackRest configuration, the bucket copy job using an S3 client only, the secrets bundle script), `apps/commerce` (a scheduled check that reads backup status and raises the alert) and `docs/`.
- "A different location" means a different region or provider from the server; record which in `docs/`.
- The Admin page that shows backup status is in Story 7.10; the restore itself is Story 7.7.

---

### Story 7.7: A full restore, rehearsed on a clean server

As an Owner,
I want to rebuild the whole shop on a clean server from the backups, and to have done it once before launch,
So that I know a failure costs me hours and not the business.

**Acceptance Criteria:**

**Given** a clean server with nothing installed, of the other processor type from staging where one is available (x86-64 if staging is ARM64)
**When** the restore script in `infra/` is run with the secrets bundle and the backup location
**Then** it installs what is needed, restores the secrets, restores both databases to the latest point available, connects or restores the buckets, runs each application's migrations, starts every container from the one compose file and checks every health route (AD-16, AD-17)
**And** the script stops with a clear message at the first step that fails, and can be run again from the start safely

**Given** the rehearsal is timed from the start of the script
**When** the shop passes its health checks and the end-to-end purchase test in the vendors' test modes
**Then** the time taken is no more than 4 hours (NFR-8)

**Given** test Orders were paid on staging before the simulated failure, the last one within the final 15 minutes
**When** the restore is complete
**Then** every Order paid more than 15 minutes before the failure exists with its invoice (NFR-8)
**And** for any later payment with no Order, the reconciliation job, run by the restore script before the shop accepts Orders again, rebuilds the Order from its recovery file in the `documents` bucket with its original Order id and invoice number, or refunds it when there is no file; after that, reconciliation shows no unexplained difference (NFR-4, AD-17, AD-30)
**And** each invoice and credit-note counter row is set to the highest number issued before the shop accepts Orders again, so the first new invoice after the restore takes the next number: no number is used twice and none is skipped (AD-25, AD-30)
**And** the rehearsal proves this with a test Order whose invoice was issued in the lost period: after the restore it has the same invoice number and the same invoice file as before

**Given** the restored shop
**When** the Owner signs in to the Admin
**Then** her password and second factor work as before the failure, and audit events from before the failure are present (AD-14, AD-15)

**Given** a Shopper photo that was erased before the failure
**When** the restore is complete
**Then** the photo does not exist anywhere in the restored system (AD-22)
**And** any Shopper-media record whose file is absent after the restore is taken through `erase-shopper-media` and written to the erasure ledger as "found absent after restore" (AD-23)
**And** the runbook states plainly that a withdrawal of Try-on consent made in the last 15 minutes before a failure may need to be made again, and that affected Shoppers' Try-on is paused until they are asked again `[ASSUMPTION: this handling of a withdrawal lost in the last 15 minutes; AD-17 and AD-23 do not cover it]`

**Given** work that was queued when the server was lost
**When** the restore's last step runs
**Then** invoices without a file, messages for Orders in the lost period, full-length images without tiles, and erasures not yet finished are enqueued again from business records, and because every job has a deterministic id nothing is sent or made twice (AD-8, AD-25, AD-26)

**Given** the catalogue before the failure
**When** the restored website and app are opened
**Then** every published Design shows with its photos, its Full saree view and its stock as of the restore point

**Given** the rehearsal is finished
**When** its record is written in `docs/`
**Then** it holds the date, who ran it, the time taken, the data loss measured, each problem met and how it was fixed in the script
**And** the date is stored in settings so the Admin can show it, and a `message.send` reminder goes to the Owner when 3 months have passed since the last rehearsal (NFR-8)

**Requirements:** NFR-8, NFR-4, NFR-10, AD-8, AD-16, AD-17, AD-22, AD-23, AD-25, AD-30
**Notes for the developer:**
- Builds on Story 1.21 (the restore script, the counter reset and the first rehearsal) and Story 1.12 (the rebuild from a recovery file). Touches `infra/` (the restore script), `apps/commerce` (the re-enqueue step as a workflow, the reminder job, the stored rehearsal date) and `docs/` (the restore runbook and the rehearsal record).
- The rehearsal is run by the Owner with the developer agent's script. The quarterly restore drill is not a routine task under NFR-10: it follows the written runbook and may use a command line. Keep it to one command and one document.
- On the free hosting tier the 4-hour and 15-minute figures are targets to test (NFR-8); record the measured figures either way.

---

### Story 7.8: Breach-response runbook, tools and drill

As an Owner,
I want a written plan and the tools to tell affected Shoppers without delay and to produce a detailed report within 72 hours,
So that a breach is handled correctly even though I am alone.

**Acceptance Criteria:**

**Given** `docs/`
**When** the breach runbook is opened
**Then** it gives numbered steps for: recognising a breach; containing it (switch Try-on off, rotate each secret, end Shopper and admin sessions, close a leaking route); working out which Shoppers and which data are affected; telling affected Shoppers without delay; telling the authority; writing the detailed report within 72 hours; and recording what was done (NFR-7)
**And** it names where each fact for the report comes from (access events, audit events, the erasure ledger, vendor consoles) and lists the contacts to call: the lawyer, the hosting provider, the payment service, each AI provider, the SMS and email services

**Given** the Admin
**When** the Owner opens the breach-notice page
**Then** she can choose the affected Shoppers as: all Shoppers; Shoppers with Shopper photos or Try-on results in a date range; Shoppers with Orders in a date range; or a list of mobile numbers or Order numbers she pastes
**And** she sees how many Shoppers are selected before sending, and must confirm
**And** sending enqueues one `message.send` job per Shopper and channel (SMS, and email where given) from a breach-notice template in content, in each Shopper's language (AD-26)
**And** the send is audited with who, when, the selection rule and the count, and retrying it sends nothing twice (AD-14)

**Given** the Admin
**When** the Owner asks for the report data for a period
**Then** she can download the access events and audit events for that period and a list of the affected Shoppers' ids, with a report outline that has a heading for each thing the 72-hour report must say
**And** producing the download is itself recorded as an access event

**Given** a breach notice
**When** it is sent
**Then** it is not treated as marketing and goes to every selected Shopper whatever her marketing choice (FR-54)
**And** no notice text contains another Shopper's data

**Given** the runbook and tools exist
**When** the Owner runs a drill on staging with a made-up incident (a leaked admin session that viewed 20 Shoppers' Try-on results)
**Then** following only the runbook she identifies the 20 Shoppers from access events, contains the incident, sends the notice to exactly those 20 test Shoppers, and produces a filled report
**And** the drill record in `docs/` holds the date, the time from "discovered" to notices enqueued, the time to a finished report (under 72 hours), and every gap found with its fix (NFR-7)

**Given** a step in the runbook rotates a secret
**When** the drill performs it on staging
**Then** the shop restarts with the new secret, the configuration check passes, and the secrets document from Story 7.6 is updated

**Requirements:** NFR-7, NFR-5, FR-54, AD-14, AD-26
**Notes for the developer:**
- Touches `docs/` (runbook, drill record), `apps/commerce` (one admin page, one workflow that enqueues notices, two export routes) and `apps/content` (the breach-notice template and translations).
- The wording of the notice and the authority to notify are for the founder's lawyer; the runbook marks them as such and the launch checklist in Story 7.14 tracks the answer.
- Selection uses only data commerce already owns (AD-3).

---

### Story 7.9: Security pass

As an Owner,
I want the shop's security rules checked one by one against the running system,
So that Shoppers' data and photos are protected the way the shop says they are.

**Acceptance Criteria:**

**Given** staging running the release candidate
**When** the rate limits are tested
**Then** a fourth one-time code for one number within 10 minutes is refused and a code older than 5 minutes fails (FR-26); sign-in attempts, upload links and Try-on requests beyond their limits are refused with the correct error code; five wrong Admin passwords lock the account for 15 minutes (FR-60); and the content admin locks out by the same rule (AD-15)
**And** each limit is read from settings, shown by changing one and seeing the new value apply (AD-13)

**Given** signed links
**When** they are tested
**Then** a Shopper-photo or Try-on-result link stops working after its short life; a link issued to the worker stops working after at most 10 minutes; an upload link works once only and refuses a file over the size limit or of the wrong type (AD-22)
**And** the `shopper-media` and `documents` buckets refuse listing and any request without a valid signed link, and one Shopper's link cannot be obtained by another Shopper

**Given** the end-to-end tests have just run a purchase, a Return, a sign-in, a Try-on and an account deletion
**When** the logs of every unit, the job results held in Redis and any error reports are scanned
**Then** they contain no mobile number, email, name, address, one-time code, token, signed link, photo data or card data (Conventions: Logging and alerts, AD-22, AD-26)
**And** the scan is an automated test that runs before every deploy

**Given** an admin account that has not enrolled a second factor
**When** it calls any admin route other than enrolment
**Then** it is refused (AD-15, FR-60)
**And** the content admin cannot be reached from the internet without passing the proxy's access gate, or has its own second factor, whichever the spike settled

**Given** a machine outside the private network
**When** it calls any `/internal/*` address, or tries the database, Redis or object-storage ports
**Then** nothing answers; only the web ports and the Owner's server-access port are open (AD-9)
**And** inside the network, `/internal/*` refuses a call without a valid service token

**Given** the three kinds of identity
**When** a Shopper token is sent to an admin or internal route, an admin session to a store route that needs a Shopper, or a service token to a store or admin route
**Then** each is refused (AD-15)
**And** a kernel route that is not on the allow-list, including cart completion and direct edits of stock, payments and refunds, is refused for every caller from outside (AD-21)

**Given** a forged or replayed payment or shipping webhook
**When** it arrives
**Then** a wrong signature is refused, and a replay changes nothing (AD-7)

**Given** data in transit and at rest
**When** it is checked
**Then** every public address serves only encrypted connections and redirects plain ones; the database storage, the backups and the `shopper-media` bucket are encrypted at rest (NFR-5)
**And** the Android release build allows no unencrypted traffic and holds the session only in secure storage

**Given** the Owner views a Shopper's details, a reported Try-on result or a data request
**When** the audit is read
**Then** an access event exists for each view; no route can change or delete an audit or access event; and access events are kept one year (NFR-5, AD-14)

**Given** the dependency lists of every unit
**When** the package manager's own audit runs
**Then** no known high-severity fault remains unaddressed, or each remaining one is written down with the reason it does not apply

**Given** any check above fails
**When** this story is worked
**Then** the fault is fixed and the check repeated; the story is done when every check passes and the results are recorded in `docs/`

**Requirements:** NFR-5, NFR-6, FR-26, FR-60, AD-7, AD-9, AD-13, AD-14, AD-15, AD-21, AD-22
**Notes for the developer:**
- Touches tests across `apps/commerce`, `apps/content`, `apps/worker` and `infra/` (Caddy and compose network rules), and `docs/` for the record. This is a verification story: expect small fixes, not new features.
- Add the checks as automated tests wherever they can run in continuous integration, so they keep running after launch.
- A fault too large to fix here is a reason to stop and tell the founder, not to pass the story.

---

### Story 7.10: Every routine task has an Admin page

As an Owner,
I want to do every routine task in the Admin and see the shop's health on one page,
So that running the shop never needs a command line or a release.

**Acceptance Criteria:**

**Given** the Admin
**When** the Owner opens the operations page
**Then** she sees: whether each unit is healthy; the shop queue's waiting and failed jobs; the time of the last nightly backup and the age of the newest shipped log; the last reconciliation run and whether it is reconciled; the date of the last restore rehearsal and when the next is due; any erasure older than 24 hours; active alerts; and the minimum app version (NFR-10)
**And** figures are no more than 5 minutes old, and the page shows no Shopper's personal data

**Given** a shop-queue job that failed after its last retry (a message, an invoice file, a tile build, an erasure at an AI provider)
**When** the Owner chooses "run again"
**Then** commerce enqueues it again with the same deterministic id, the action is audited, and nothing is sent or made twice (AD-8, AD-14)
**And** a failed Try-on generation is not offered for re-run, because the Shopper was already told it failed

**Given** the list of routine tasks written in `docs/` by this story
**When** each is performed on staging using only the two admins, with no command line, no database tool and no release
**Then** every one succeeds: create and publish a Design with photos and a full-length image; add a Weaver; adjust stock and read a Variant's stock history; create a discount; change a tax rate for a tax code from a date; compose, preview, schedule and publish a Server-driven screen and go back a version; create a shipping label and mark dispatch; cancel an Order; move a Return through its states with inspection photos and restock or mark damaged; refund in full and in part; look up a Shopper, reply to and close a complaint, carry out a data request and deactivate an account; change the delivery region, shipping charge rule, return period and Try-on limits; publish a new version of a notice or policy and a translation; add an approved model, publish and roll back a Model route and a Prompt version, run the sample set, set the daily cap, switch Try-on off and on; handle the review queue; read the cost and failure view; set alert thresholds; settle a reconciliation difference; send a breach notice; read the success metrics; set the minimum app version (NFR-10)
**And** the result of each is recorded as pass or gap

**Given** a task recorded as a gap
**When** this story is worked
**Then** an Admin page or action is added that starts the existing workflow for it, audited like every other admin change, and the task is walked again until it passes (AD-4, AD-14)

**Given** the tasks that are deliberately not in the Admin
**When** `docs/` is read
**Then** it lists them with the reason: deploying a new version (done by continuous integration), the quarterly restore rehearsal and server maintenance (not routine under NFR-10; each follows a written runbook), rotating secrets in a breach, and recovering a lost second factor by the rehearsed process in FR-60

**Given** the Owner has two admins with separate sign-ins
**When** she uses a task that spans both (for example a notice version published in content that commerce must know)
**Then** each admin links to the other's page for that task, and she never has to copy an id by hand

**Requirements:** NFR-10, AD-4, AD-8, AD-14, AD-21
**Notes for the developer:**
- Touches `apps/commerce` (`src/admin` operations page, one admin route to re-enqueue, any gap pages), `apps/content` (links only) and `docs/`.
- Kernel admin screens that are hidden under AD-21 stay hidden; a gap is closed with a shop page that starts a workflow, never by un-hiding a kernel screen.
- Staff accounts (FR-50) remain deferred; every action here is still recorded against the named account.

---

### Story 7.11: Load test and the production hosting decision

As an Owner,
I want the shop tested at its launch size and a recorded decision on where production runs,
So that real payments start on hosting I know can carry them.

**Acceptance Criteria:**

**Given** staging on the free ARM server, loaded with 100 Designs of about 10 Pieces each, their photos and Full saree views
**When** the k6 load script of Story 1.22 runs the whole launch load of the spine's test profile for 30 minutes: 50 Shoppers browsing, searching and opening Design pages at once, 5 Checkouts a minute through the payment service's test mode, 2 Try-on jobs at once against a stand-in AI provider, and Full saree view tiles being requested
**Then** the results are recorded: response times, error rate, memory and processor use of each container, and queue waiting times
**And** the test passes only if the pass conditions of Story 1.22 hold and also: the catalogue read behind the Design page answers within 1 second for 95% of requests; search answers within 2 seconds (FR-2); fewer than 0.5% of requests fail; total memory stays under 80% of the server's 12 GB; and the Try-on queue's waiting time leaves room for the 60-second target in NFR-2 `[ASSUMPTION: the 1-second, 0.5% and 80% figures and the 30-minute length; the spine gives the load, not the pass conditions]`

**Given** the same load
**When** 20 simulated Shoppers begin payment for the last Piece of one Design at the same moment
**Then** exactly one gets the Hold and one Order results; the others are refused before any money is taken; and the stock movements account for every change (FR-19, AD-6)

**Given** the load test has finished
**When** the reference phone from Story 6.18 opens a Design page in the app and on the website over 4G while a lighter load continues
**Then** the page is usable within 3 seconds (NFR-1)

**Given** the results
**When** the size gate is applied
**Then** the decision that Story 1.22 recorded in `docs/` is confirmed or revised: if every pass condition held, production takes the free server and staging runs on demand; if any did not, production starts on a paid server, with its size chosen from the measured use (spine: Deployment and environments)
**And** the decision records the monthly cost, who decided and the date, and answers PRD Open Question 7

**Given** the decision
**When** the production environment is built
**Then** it runs the same images from the same compose file as staging, with its own secrets, its own databases and buckets, backups to another location as in Story 7.6, and the outside uptime check from Story 7.1 pointed at it (AD-16, AD-17)
**And** it starts in the vendors' test modes, and the configuration check at start refuses to run production with a missing value
**And** if production is on a different processor type from staging, the end-to-end purchase test passes on it before this story is done

**Given** production runs on the free server
**When** staging is needed for a restore rehearsal or a release check
**Then** `docs/` gives the steps to bring staging up on demand elsewhere and take it down again, and the rehearsal in Story 7.7 is not run on the production server

**Requirements:** NFR-1, NFR-2, NFR-8, FR-2, FR-19, AD-6, AD-16, AD-17
**Notes for the developer:**
- Builds on Story 1.22, which ran the size gate without Try-on and with a small catalogue. Touches `infra/` (the k6 load script extended with search, tiles and the Try-on part; production compose overrides and Caddy configuration) and `docs/`. The load tool is k6 (spine Stack); add no other.
- The stand-in AI provider is an adapter behind `TryOnProvider` used only by tests (AD-10); it must be impossible to select it in production.
- Vendor live modes are switched on in Story 7.15, not here.

---

### Story 7.12: Reviewed legal documents and disclosures go live

As a Shopper,
I want the shop's terms, policies, notices and disclosures to be complete, reviewed and true,
So that I know who I am buying from and what happens to my data and my photo.

**Acceptance Criteria:**

**Given** the drafts in `docs/legal/` as reviewed by the founder's lawyer and accountant
**When** the Owner loads them into content on production
**Then** the terms of use, privacy policy, Try-on consent notice, returns, refunds and cancellation policy, shipping policy and grievance redressal each exist as a published, numbered version with an effective date (FR-59)
**And** every one of the 14 placeholders listed in `docs/legal/README.md` is filled, and a check refuses to publish any document that still contains a `{{...}}` placeholder or the "Draft, not yet reviewed" line
**And** each publication is recorded as a content audit event (AD-14)

**Given** the published Try-on consent notice
**When** it is compared with the live AI settings
**Then** the AI services it names are exactly the services that the Approved-model list says can receive a Shopper photo, including the aggregator and each model provider (FR-8, AD-11)
**And** the retention period it states equals the retention setting (30 days at launch) (FR-51)
**And** its statements about training, logging and no-retention match what the Approved-model list records and what the worker's fixed flags do (FR-40, AD-10)
**And** on publishing, content has told commerce the notice version and service ids, and the current Model route can be published against it; a Model route naming a service absent from the notice is refused (FR-39, AD-11)

**Given** a Shopper who accepted an earlier draft version of the notice during testing
**When** she next starts Try-on
**Then** she is asked to accept the published version (FR-8)

**Given** the shop settings and the published policies
**When** they are compared
**Then** the return period, the delivery region and the shipping charge rule in settings equal what the policies say, and the comparison is recorded (FR-56, AD-13)
**And** the same return period and conditions show on the Design page and at checkout, on the website and in the app (FR-23)

**Given** the website and the app
**When** a Shopper opens the footer or "about and legal"
**Then** she sees the shop's legal name, address, contact details and grievance officer, and working links to the privacy policy and the terms (FR-29)
**And** every Design page shows the maker's name and address, the consumer-care contact and the return, refund, delivery and payment terms (FR-3)
**And** the public web page for account deletion is reachable at the address written in the privacy policy (FR-27)

**Given** a launch language other than English is switched on (Tamil is the first)
**When** the documents are published
**Then** the Try-on consent notice exists in that language at the same version number, and every other document falls back to English where no translation exists (FR-8, NFR-14, AD-11)

**Given** the message templates in content
**When** each Shopper event in FR-54 is triggered on production in test mode
**Then** each message uses its template with the real shop name and contact details, and none contains a placeholder

**Requirements:** FR-3, FR-8, FR-27, FR-29, FR-39, FR-40, FR-51, FR-59, NFR-14, AD-10, AD-11, AD-13, AD-14
**Notes for the developer:**
- Touches `apps/content` (the publish check for placeholders, loading the documents through the content admin or a one-time import that writes ordinary numbered versions) and `docs/legal/` (the filled copies kept as the record).
- The developer agent does not decide legal wording. Where the lawyer changed an assumption, change the setting or the document version, not code (PRD §8).
- If the Try-on launch gate decided that Try-on does not ship, the notice is still published so that switching Try-on on later needs no release.

---

### Story 7.13: Google Play requirements and submission

As an Owner,
I want the Android app to meet Google Play's requirements and be submitted for review,
So that Shoppers can install it from the store.

**Acceptance Criteria:**

**Given** the release build from the current app version, pointed at production
**When** it is checked against Google Play's requirements in the compliance research
**Then** each of these is shown true and recorded with its evidence in `docs/`: a report control is on the screen where a Try-on result is shown and feeds the Owner's review queue (FR-13, FR-44); the Shopper photo is chosen with the system photo picker and the manifest has no broad photo or storage permission (FR-10); account deletion works inside the app and at a public web address, and removes Shopper photos and Try-on results (FR-27); the privacy policy is linked inside the app and names photo collection and the AI services that receive photos (FR-29); Server-driven screens can only arrange components and actions already in the build (FR-33); the manifest has no advertising-id permission (AD-29)

**Given** the facts of what the app collects and shares
**When** the Data safety inputs are written in `docs/`
**Then** they list each kind of data (mobile number, name and address, optional email, Shopper photos, Try-on results, purchase history, complaints, and counts that are not linked to a person), why it is collected, whether it is required, and who receives it (the payment service, the shipping service, the SMS and email services, and for photos the AI services named in the consent notice)
**And** they state that data is encrypted in transit, that deletion can be requested in the app and at the public web address, and that no data is used for advertising
**And** every statement matches the published privacy policy from Story 7.12; a mismatch is fixed in whichever is wrong before submission

**Given** the store declarations
**When** the Owner completes them in the Play Console
**Then** the target audience is declared as adults (18 and over), the privacy policy address and the account-deletion address are entered, and the AI-generated-content questions are answered with the report control and the result check described (FR-9, FR-52)
**And** the application id contains no product name, and the listed name is the configured product name (NFR-12)

**Given** store reviewers cannot receive a one-time code by SMS
**When** the Owner needs to give them access
**Then** the Admin has a "store review access" setting, as the spine's Consistency Conventions provide: one reviewer account with a fixed sign-in code can be switched on for a single mobile number, and is off otherwise
**And** switching it on or off is audited, it is shown on the operations page while on, and the normal rate limits and Try-on limits still apply to it
**And** it has an end date at which it switches itself off `[ASSUMPTION: the end date; the spine says only that it is off otherwise]`
**And** the review notes give that number and code, say that payments are in test mode during review if they are, and explain Try-on, its consent step and its "AI-generated" label

**Given** the Try-on launch gate decided that Try-on does not ship at launch
**When** the declarations are made
**Then** they still describe Try-on, because it is in the build and can be switched on by the Owner later, and the review notes say how reviewers can see it (FR-33)

**Given** the listing needs screenshots and a description
**When** they are prepared
**Then** screenshots are taken from the release build after it is styled from DESIGN.md, show only real product photos and correctly labelled Try-on results, and make no claim the shop cannot evidence (FR-38, NFR-13)

**Given** everything above is complete
**When** the Owner uploads the build to a testing track and sends it for review
**Then** the Play Console shows no outstanding policy or declaration warning, and the submission date and any tester requirement Play sets for the developer account are recorded
**And** if the review is rejected, the reason is recorded, fixed and resubmitted; the outcome is tracked in the launch checklist

**Given** store policies change
**When** this story is done
**Then** `docs/` holds the checklist used, dated, with a note to re-check Google Play's policy before every later submission

**Requirements:** FR-9, FR-10, FR-13, FR-27, FR-29, FR-33, FR-52, NFR-12, NFR-13, AD-13, AD-14, AD-20, AD-29
**Notes for the developer:**
- Touches `docs/` (the requirements record, the Data safety inputs, review notes), `apps/commerce` (the store review access setting in the `settings` module and its check in the one-time-code provider of Story 3.6) and continuous integration (the manifest checks from Stories 6.15 and 7.4 reused as evidence).
- The Owner performs the Play Console steps; the developer agent cannot.
- Promotion from the testing track to public release happens in Story 7.15.

---

### Story 7.14: Launch checklist, final requirements check and honest-design self-audit

As an Owner,
I want one checklist that shows every cross-cutting requirement proven, every ⚖ item confirmed by my lawyer or accountant, and the dark-pattern self-audit done,
So that I launch knowing nothing was left on an unconfirmed assumption.

**Acceptance Criteria:**

**Given** the launch checklist in `docs/`
**When** it is opened
**Then** it has one row for each of NFR-1 to NFR-16 with the evidence that it holds and where that evidence is: NFR-1 the phone measurements (Stories 6.18, 7.11); NFR-2 the share of Try-on results within 60 seconds from the cost and failure view; NFR-3 the cost ceiling set and a Model route above it refused; NFR-4 reconciliation clean (7.5); NFR-5 and NFR-6 the security pass and an erasure completed within 24 hours (7.9); NFR-7 the drill (7.8); NFR-8 the rehearsal (7.7); NFR-9 each alert received (7.1, 7.2); NFR-10 the routine-task walk (7.10); NFR-11 the vendor contract tests passing before release; NFR-12 the name check; NFR-13 the self-audit below; NFR-14 a document in content and a Design's translated text in commerce each changed and appearing on the website and app without a release, and every interface text key present in each language's translation file (the difference between NFR-14 and AD-28 on interface text, noted in Story 2.11, is listed for the founder); NFR-15 the accessibility walk on the app (6.18) and on the website; NFR-16 the counts (7.3, 7.4)
**And** a row without evidence, or with a failed check, is marked open, and launch is blocked while any row is open

**Given** the items marked ⚖ in PRD §8
**When** the checklist lists them
**Then** each has its working assumption, the setting or document version where it lives, who confirms it, the date and the answer given
**And** the accountant's rows are: whether an unstitched saree above Rs 2,500 is taxed at 5%; pre-stitched sarees and blouse sets; tax on shipping charges; the deadline for credit notes
**And** the lawyer's rows are: a photo of someone other than the Shopper; one-year access logs alongside erasure; what age check is sufficient; whether the AI labelling rules bind a shop; the return-policy wording; the rules governing silk, handloom and regional-name claims; whether an aggregator's standard terms are a sufficient contract; and the breach-notice wording from Story 7.8

**Given** a professional's answer differs from the working assumption
**When** the Owner applies it
**Then** the change is made by a setting with an effective date or by a new document version, without a release, and the checklist records what was changed (AD-13)
**And** this is proven once on staging by changing the rate band of a tax code from a date and seeing a new invoice use it while an old one is unchanged (FR-37, AD-5, AD-25)
**And** an answer that cannot be met by a setting or a document is recorded as a blocker for the founder, not worked around

**Given** the official list of dark patterns
**When** the Owner audits the website and the app screen by screen against each pattern on it
**Then** a dated record in `docs/` states for each pattern whether any instance was found, with the screen and the fix, and specifically confirms: no pre-ticked extras; no false urgency; no charge added after the cart; no sign-up demanded for anything unrelated to the purchase; consent to Try-on never bundled or nagged (NFR-13)
**And** a `message.send` reminder to the Owner is scheduled for one year after the audit date

**Given** the PRD's open questions
**When** the checklist is completed
**Then** it records the founder's answers on: the Try-on launch gate result and whether Try-on ships switched on or off; the shipping service; launch languages; the return period; Try-on limits and the daily cap; the delivery region; and the hosting decision from Story 7.11
**And** each answer is shown to equal the matching setting on production

**Given** the remaining launch conditions
**When** the checklist is reviewed
**Then** it also shows: the legal documents published (7.12); the store review outcome (7.13); the Owner's second-factor recovery rehearsed (FR-60); backups running on production (7.6); and the uptime check watching production (7.1)

**Requirements:** NFR-1 to NFR-16, FR-37, FR-60, PRD §8, PRD §10, AD-5, AD-13, AD-25
**Notes for the developer:**
- Touches `docs/` and one scheduled reminder in `apps/commerce`; the website accessibility walk is done here because Epic 6 walked only the app.
- The developer agent gathers evidence and runs the checks; the lawyer's and accountant's answers come from the founder.
- A failed NFR check is fixed in the unit that fails it and re-checked before this story closes.

---

### Story 7.15: Go live

As an Owner,
I want to switch the shop to the vendors' live modes and open it to Shoppers,
So that real Shoppers can buy real sarees.

**Acceptance Criteria:**

**Given** every row of the launch checklist from Story 7.14 is closed
**When** go-live begins
**Then** it follows a written go-live list in `docs/`, step by step, with each step ticked and timed
**And** go-live does not begin while any checklist row is open

**Given** production
**When** the vendors are switched to live mode
**Then** the payment service uses live keys with its webhook pointing at production and verified by signature; the shipping service uses the live account; the SMS and email services use the approved live sender and templates; and the AI provider uses the live key with logging off and the no-retention option on where offered (AD-7, AD-10, AD-26, FR-40)
**And** the configuration check at start refuses to run production with any vendor's test key, and staging keeps only test keys (Conventions: Config and secrets)

**Given** production before it is opened
**When** it is inspected
**Then** it holds no test Design, test Order, test Shopper, test invoice or test Try-on data; the invoice and credit-note counter rows for the financial year stand at zero, so numbering starts at the beginning and is gapless from there (AD-25); the store review access setting is off unless a review is in progress; and the minimum app version equals the released version (FR-55)

**Given** live modes are on
**When** the Owner buys one real Design with her own money, on the website and again in the app
**Then** each payment is confirmed by the payment service to the server, an Order is created with a correct invoice, the confirmation messages arrive by SMS and email, and a real shipping label can be created (FR-18, FR-20, FR-47, FR-54)
**And** she cancels one Order and returns the other; each refund goes back to the payment method used, with a credit note linked to its invoice (FR-22, FR-24)
**And** these are real sales and real documents and are kept; the next day's reconciliation shows no unexplained difference (NFR-4)

**Given** Try-on ships switched on
**When** the Owner makes one Try-on with her own photo on production
**Then** the consent notice shown is the published version, the result arrives labelled "AI-generated", its cost is recorded, and she then withdraws consent and sees the erasure completed and the AI provider's answer in the erasure ledger (FR-8, FR-12, FR-15, AD-23)
**And** if Try-on ships switched off, Shoppers see the "unavailable" behaviour and no Shopper photo can be uploaded

**Given** the live checks pass
**When** the shop is opened
**Then** the website is reachable at its public address, and the Android build approved in Story 7.13 is promoted to public release in the store
**And** the outside uptime check, the alerts from Story 7.2 and the backups from Story 7.6 are confirmed working on production by a test alert and a look at the operations page

**Given** something goes wrong during go-live
**When** a step fails
**Then** the go-live list says how to go back: return a vendor to test mode, start the previous images, or switch Try-on off; and the shop is not opened until the step passes

**Given** the shop is open
**When** the first day ends
**Then** the Owner has read the operations page, the reconciliation result and the success-metrics page, and the go-live record in `docs/` is signed off with the date

**Requirements:** NFR-4, NFR-8, NFR-9, NFR-11, FR-18, FR-20, FR-22, FR-24, FR-55, AD-7, AD-10, AD-16, AD-17, AD-25, AD-26
**Notes for the developer:**
- Touches production configuration, `infra/` and `docs/` only; no feature code. Anything found broken is fixed in its own unit, redeployed through continuous integration and re-checked.
- Vendor contract tests keep running against test modes on staging before every release (NFR-11); live modes are checked only by the real purchases above.
- Any requirement the SMS service has for approving sender names and templates is handled as part of its live mode and recorded in the go-live list.
