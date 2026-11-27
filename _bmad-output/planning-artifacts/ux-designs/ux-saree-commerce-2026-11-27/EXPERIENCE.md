---
name: Alar
status: draft
created: '2026-11-27'
updated: '2026-11-27'
sources:
  - ../../prds/prd-saree-commerce-2026-11-27/prd.md
  - ../../architecture/architecture-saree-commerce-2026-11-27/ARCHITECTURE-SPINE.md
  - ../../research/ux-direction-2026-11-27/digest.md
  - ./.memlog.md
---

# Alar — Experience Spine

> Draft on the Fast path. Lines tagged `[ASSUMPTION]` were chosen here and are open to correction. This file owns how Alar behaves; `DESIGN.md` owns how it looks. Both win over any mock. Terms are the PRD Glossary's, used exactly.

## Foundation

- **Form factors.** Two Shopper surfaces: a responsive website, designed phone-first and built first; and an Android app. iOS follows from the same app codebase. The Admin is a third surface with inherited UI (see Information Architecture).
- **UI system.** Web: Next.js with Tailwind CSS 4 and shadcn. App: Expo / React Native with Uniwind and react-native-reusables (shadcn-style components) `[ASSUMPTION: Uniwind is the Tailwind-4-based library; the founder named only its kind]`. Both read the same tokens. Their default behaviour (focus trapping in dialogs, keyboard handling in menus, sheet dragging) is inherited; this file states only what Alar adds or changes.
- **Visual identity.** `DESIGN.md` is the reference. Tokens are cited here as `{path.to.token}`.
- **Two rules above all others** (PRD §7a): the saree and its Weaver are the centre of every screen; nothing may make a saree look better than it is. Where a pattern below could raise sales by pressure or flattery, it is not used (NFR-13, SM-C1, SM-C2).
- **Theme.** Light and dark, following the system setting `[ASSUMPTION]`.

## Information Architecture

### Shopper surfaces

"SD" = a Server-driven screen made of Blocks, arranged by the Owner. "Fixed" = built into the app and website; Blocks cannot change it.

| Surface | Kind | Web | App | Reached from | Purpose |
|---|---|---|---|---|---|
| Home | SD | yes | yes | Launch; Home tab; logo | Blocks: Banner, Row of Designs, Grid of Designs, Weaver story, Text Block, Image Block |
| Category | SD | yes | yes | Block action `open-category`; Top bar links (web) | A set of Designs introduced by Blocks |
| Campaign | SD | yes | yes | Block action `open-screen` | A scheduled screen such as Pongal |
| Search and results | Fixed | yes | yes | Search tab; Search field; Block action `open-search` | Search, Filter panel, results as a Grid of Designs |
| Design page | Fixed, with one SD region | yes | yes | Design card; Block action `open-design` | Fixed part: Design gallery, name, Price display, Weaver badge, stock, entry points to Full saree view and Try-on, Pincode delivery check, attributes, description, colour note, maker's details, consumer-care contact, terms. Arrangeable region below it: Row of Designs, Weaver story, Text Block, Image Block |
| Design gallery, full screen | Fixed | yes | yes | Tap a photo on the Design page | Zoom on product photos |
| Full saree view | Fixed | yes | yes (web view in a native screen, AD-18) | Design page entry point; Try-on result | The Full saree viewer |
| Weaver page | Fixed | yes | yes | Weaver badge; Weaver story; Block action `open-weaver` | Weaver's name, place, story, photos and Designs |
| Cart | Fixed | yes | yes | Cart tab; Top bar icon; after adding | Cart lines, shipping charge, total, start checkout |
| Sign in | Fixed | yes | yes | Try-on, checkout, order history, Account | Mobile number and one-time code; terms and privacy acceptance at first sign-in |
| Checkout | Fixed | yes | yes | Cart | Address, delivery dates, optional email, total, return terms, pay |
| Payment | Fixed (payment service's own sheet) | yes | yes | Checkout | UPI, card, netbanking |
| Payment result | Fixed | yes | yes | Return from Payment | Payment status: confirmed, pending, failed, refunded automatically |
| Order confirmation | Fixed | yes | yes | Payment confirmed | Order number, items, delivery dates, invoice |
| Orders | Fixed | yes | yes | Account | List of Orders |
| Order detail | Fixed | yes | yes | Orders; a message link | Order timeline, invoice download, cancel before dispatch, request a Return, Rating prompt, refund details |
| Return request | Fixed | yes | yes | Order detail | Return request form |
| Return detail | Fixed | yes | yes | Order detail | Return's timeline, inspection outcome, refund |
| Try-on consent | Fixed | yes | yes | First Try-on; after a new notice version | Consent screen with age and own-photo confirmations |
| Shopper photo | Fixed | yes | yes | After consent; "Change photo" | Photo guidance, choose or take, reuse or replace |
| Try-on progress | Fixed | yes | yes | Request a Try-on | Try-on progress; can be left |
| Try-on result | Fixed | yes | yes | Progress; "result ready" notice; My Try-on | Try-on result frame, report, add to cart, links to real photos and Full saree view |
| My Try-on | Fixed | yes | yes | Account | Stored Shopper photo and Try-on results; delete each; withdraw Try-on consent |
| Account | Fixed | yes | yes | Account tab; Top bar icon | Orders, My Try-on, mobile number, email, language, privacy, legal, sign out, delete account |
| Privacy and complaints | Fixed | yes | yes | Account; footer (web) | Data request, correction, erasure, complaint with ticket number |
| Legal and disclosures | Fixed | yes | yes | Account; footer (web); Design page | Terms, privacy policy, shop policies, legal name, address, contact, grievance officer |
| Delete account (public page) | Fixed | yes | opens the web page | Web address published in the store listing | Account deletion without the app (FR-27) |
| Update required | Fixed | no | yes | Launch on a version below the minimum | Update required screen |

**Navigation.** Phones and tablets, app and mobile web: a Bottom navigation bar with four items `[ASSUMPTION]`: Home, Search, Cart, Account. Desktop web: the Top bar carries the logo, category links, the Search field, Account and Cart; a footer carries Legal and disclosures and Privacy and complaints. The Design page on phones replaces the Bottom navigation bar with the Sticky add-to-cart bar. Checkout, Payment, Try-on consent, Shopper photo, the Full saree view and Update required show no navigation bar, only a back or close control. Overlays stack one level deep: a Dialog never opens over a Sheet.

**Block actions.** A Block carries data and one action from the fixed list in AD-12: `open-design`, `open-weaver`, `open-category`, `open-screen`, `open-search`, `open-link` (same site only). A Block cannot start checkout, payment, a photo upload or a Try-on.

**Deep links.** Every surface with content has one address that opens the same thing on web and in the app `[ASSUMPTION]`.

### Admin surfaces (Owner)

The Admin inherits the UI of the commerce and content back offices named in the architecture; it is not restyled with `DESIGN.md` `[ASSUMPTION]`. Only the phone-size preview of Shopper screens uses these spines. Surfaces the Owner's journeys land on: Designs and Variants (create, photos, full-length image, stock, tax, evidence, preview, publish); Weavers; Screens (Blocks, draft, preview, schedule, versions); Try-on controls (Model route, Approved-model list, Prompt versions, sample-set comparison, limits and spend, off switch, review queue, cost and failure view, change history); Orders, Returns and refunds; Shoppers and complaints; Shop settings; Notices, policies and translations.

## Voice and Tone

Microcopy. Brand posture lives in `DESIGN.md` → Brand & Style. The voice is a shopkeeper the Shopper trusts: honest, plain and warm, in that order.

| Rule | Do | Don't |
|---|---|---|
| Say what is true, including limits | "Colours can look slightly different on different screens." | "Exactly as pictured!" |
| Name the Weaver | "Woven by the Murugan family, Kanchipuram" | "Artisan-crafted" |
| Describe Try-on as what it is | "An AI-made picture of how this saree may look on you. For true colour, see the photos." | "See yourself in it!" or "Your perfect look" |
| Stock facts only when true | "Sold out" · "On hold right now. Check again in a few minutes." | "Hurry, only 1 left!" · "5 people are looking at this" |
| Money, plainly | "₹ 3,450, inclusive of all taxes" · "You have not been charged." | "Just ₹3,449.00!" |
| The Hold, calmly | "We are holding this saree for you until 4:32 pm." | "Offer expires in 14:59!" |
| Errors say what happened and what to do | "We could not reach the payment service. Your cart is safe. Try again." | "Something went wrong." · "Error 502" |
| A blocked photo, in neutral words | "This photo cannot be used for Try-on. Please choose a different one." | Any wording that blames or describes the Shopper or her photo |
| Consent, never nudged | "I agree" · "Not now" | "Yes, show me!" · "No, I don't want to see how I look" |
| Buttons name the action | "Add to cart" · "Pay ₹ 3,450" · "Request a Return" | "Continue" · "Submit" · "OK" |
| Short sentences, common words | "Your refund of ₹ 3,450 was started on 4 December." | "Your refund has been successfully initiated." |

- **State names.** Order and Return states are shown with the Glossary's names exactly (Paid, Packed, Dispatched, Out for delivery, Delivered, Delivery failed, Returned to shop, Cancelled, Refunded; Requested, Pickup booked, Picked up, Received, Accepted, Rejected, Refunded), translated per language as fixed terms.
- **Words for the Shopper.** The interface says "you"; "Shopper", "Design", "Piece", "Hold" and "Block" are internal terms. In Shopper-facing text a Design is "saree", a Piece is "piece" only where a count is needed, and a Hold is "holding this saree for you" `[ASSUMPTION]`. "Weaver", "Full saree view", "Try-on" and "AI-generated" appear as written.
- **No exclamation marks, no emoji, no capitals for emphasis.**
- **Dates and numbers.** Absolute dates ("4 December", "between 6 and 9 December"), 12-hour times, whole rupees with Indian digit grouping. Plurals use the language's plural rules.
- **Languages.** English at launch, Tamil the first added; the system is ready for Telugu, Kannada and Malayalam. All Shopper-facing text is translatable without a release (NFR-14). The Try-on consent notice is shown in the Shopper's chosen language and is available in every launch language (FR-8). Weaver names and place names are not translated, only transliterated by the Owner. Text is written so that it survives translation: no idioms, no sentences built by joining fragments.

## Component Patterns

Behavioural. Visual specs live in `DESIGN.md` → Components under the same names.

| Component | Use | Behavioural rules |
|---|---|---|
| Button | Everywhere | Feedback on press-down, action on release. One primary Button per screen region. While its action runs it shows a spinner, keeps its width, and ignores further presses. A disabled Button has a visible reason beside it. Payment and destructive Buttons name the amount or the thing ("Pay ₹ 3,450", "Delete my account"). |
| Text field | Forms | Label always visible above. Validation on leaving the field, never while typing; the error says how to fix it. The right keyboard for the content (number pad for pincode, mobile number and code). The one-time code fills from the SMS where the platform offers it, and submits by itself when six digits are in. |
| Search field | Top bar, Search tab | Opens Search and results. Searches on submit and, after a 300ms pause in typing, shows up to six suggestions from Design names, weaves and Weavers `[ASSUMPTION]`. A clear button empties it. Results within 2 seconds (FR-2). |
| Chip | Filters, option choices | Tap toggles. Selected state is announced. Applied filters appear as Chips above results, each removable by a tap. |
| Filter panel | Search and results; Category | Filters: fibre, weave, colour, occasion, price, Weaver. They combine. The count on the "Show N Designs" Button updates as each option is changed, before applying (FR-1). An option that would give zero results stays visible with a 0 count and is disabled. "Clear all" resets. On phones the panel is a Sheet; closing it without applying discards the changes. Filters are kept in the address so a results page can be shared and the back control restores it. |
| Design card | Lists, Blocks | The whole card is one target that opens the Design page. It shows live price and availability (never cached). A Design with no Pieces shows "Sold out" and is still openable, not hidden. A Design whose last Piece is on Hold by another Shopper shows "On hold right now". No hover-only content; no quick-add on the card. |
| Price display | Everywhere a price appears | Whole rupees, tax included, no paise. A discount always shows the lowest price of the previous 30 days beside it (FR-5). Any shipping charge appears in the Cart, before checkout begins. The total on the pay Button equals the amount charged. |
| Weaver badge | Design page, Design card, Cart line | Opens the Weaver page. Every Design shows exactly one Weaver. |
| Banner | SD screens | A Block. Tapping performs its one action. Static: it never rotates with other Banners. If several Banners are wanted, they are stacked or placed in a swiped row. |
| Row of Designs | SD screens; Design page region | A Block, and Alar's carousel. The Shopper swipes it; it never moves by itself. Free scrolling with snap to the start of a card; the next card is partly visible so the row reads as scrollable. "See all" opens the full set. On desktop, previous and next Buttons, also reachable by keyboard. Nothing essential is reachable only through the row. |
| Grid of Designs | SD screens; Search and results | A Block. Loads 24 Designs, then more as the Shopper nears the end, with a "Load more" Button as the keyboard and screen-reader path `[ASSUMPTION]`. Returning from a Design page restores the scroll position. |
| Weaver story | SD screens; Design page region | A Block. Opens the Weaver page. |
| Text Block | SD screens; Design page region | A Block. Links inside it open the same site only. |
| Image Block | SD screens; Design page region | A Block. Performs its one action if it has one; otherwise not interactive. |
| Top bar | All screens with navigation | Solid at the top of the page; switches to glass once content scrolls beneath it, or to the solid fallback (see Accessibility Floor). Back returns to the previous screen with its scroll position and filters intact. |
| Bottom navigation bar | Phones and tablets | Four destinations. Tapping the current tab scrolls that screen to the top. The Cart item shows the number of Pieces. Each tab keeps its own history. Hidden while the keyboard is open and on the surfaces listed in Navigation. |
| Sticky add-to-cart bar | Design page, phones | Present from the moment the Design page opens, showing the Price display and "Add to cart". After adding, the Button becomes "Go to cart". When the Design is sold out the Button is replaced by the words "Sold out"; when on Hold by another Shopper, by "On hold right now" and a "Check again" Button. It never covers the entry points to the Full saree view or Try-on on first view (FR-3). Trade-off noted: the research found no firm evidence for or against sticky purchase bars; it is kept because the founder asked for glass on floating controls and the bar holds only the price and one action. |
| Sheet | Phones: filters, options, confirmations | Opens from the bottom; follows the finger; dismissed by dragging down, tapping the scrim or the close control, unless it holds unsaved input, in which case it asks first. Its content scrolls without moving the page behind. Focus moves into it on open and back to the trigger on close. |
| Dialog | Confirmations that must be answered | Used for destructive or irreversible choices only: cancel an Order, withdraw Try-on consent, delete account, delete a photo. Escape or the back control cancels. The safe choice is the default focus. |
| Toast | Brief confirmations | One at a time, for 4 seconds, 8 if it carries an action; dismissible by swipe; announced politely to screen readers. Used for "Added to cart" (with "Go to cart"), "Photo deleted", "Result ready" (with "View"). Never used for errors that need action or for anything the Shopper must read. |
| Badge | Stock, state, counts | Not interactive. State is always in words, never colour alone. |
| Inline notice | Cart, Checkout, Try-on, global | Appears in the page beside what it concerns and stays until the condition ends or the Shopper dismisses it. At most one action. |
| Skeleton | Loading | Shown only if content takes longer than 300ms; matches the layout that will appear so nothing shifts. |
| Empty state | Empty lists | Says what is empty in one sentence and offers one way forward. |
| Design gallery | Design page | Product photos only, in the Owner's order, with the fabric close-up always among them. Phones: swipe between photos, with thumbnails beneath that show position and jump on tap (thumbnails, not dots). Tap opens the full-screen view: pinch and double-tap zoom, pan, swipe between photos at rest; a higher-resolution image loads on zoom. Desktop: photos in a grid; click to zoom. A Try-on result never appears here. No video autoplay; no auto-advance. |
| Full saree viewer | Full saree view | Opens showing the whole saree. Pinch, double-tap and the zoom controls zoom until one image pixel fills one screen pixel, then stop. Drag pans along the length. Only the visible part loads at full detail (FR-6). A position strip shows which part is in view; tapping it jumps there. Reset returns to the whole saree. Close returns to where the Shopper came from. Keyboard: arrows pan, plus and minus zoom, Escape closes. If a Design has no full-length image, the entry point is absent. |
| Cart line | Cart, Checkout summary | Quantity changes and removal apply at once, with a Toast offering "Undo" for removal. A line whose Design has sold out or changed price is flagged with an Inline notice, and the Shopper must accept the change or remove the line before she can pay (FR-19). |
| Quantity stepper | Cart line | Cannot go above the Pieces in stock or below 1; at the limit, plus is disabled and the reason is shown. |
| Pincode delivery check | Design page, Cart, Checkout | Six digits, then "Check". Answers with an earliest and a latest delivery date, or says plainly that Alar does not deliver there yet, before checkout (FR-17). The last pincode is remembered on the device and prefilled in Checkout. |
| Hold countdown | Checkout after "Pay"; Payment result (pending) | Starts when payment begins and the 15-minute Hold is placed. States the end time and the minutes left; in the last minute, seconds. Read to screen readers at the start, at 5 minutes and at 1 minute, not continuously. It is information, not pressure: it never appears before payment begins, and never on the Design page or Cart. At zero: "We have released this saree. You have not been charged." with a Button back to the Cart. |
| Payment status | Payment result | One of four states; see State Patterns. Confirmation comes from Alar's server, never from the device alone; until then the state is pending. |
| Order timeline | Order detail, Return detail | Shows the Glossary's states in order, with the time each was reached. Updates from the shipping service appear when the screen is opened or pulled to refresh. An exception state (Delivery failed, Rejected) says what happens next. |
| Return request form | Return request | Available within the return period shown on the Design page and at Checkout. Reasons are radio options; "Not as shown" and "Defective or wrong item" are always present and state that return shipping is free. Then pickup address and date, the refund amount and where it will go, and "Request a Return". |
| Rating prompt | Order detail, after Delivered | Asks once: "Did the saree match what you saw?" on a scale of 1 to 5, with an optional comment. It is shown inside Order detail, not as an interrupting pop-up, and can be ignored. One answer per Order item; it can be changed for 30 days `[ASSUMPTION]`. |
| Consent screen | Try-on consent | Standalone, shown before the first Try-on and again after a new notice version. Nothing is pre-ticked. The Shopper ticks "I am 18 or older" and "This photo will be of me", then "I agree"; until both are ticked, "I agree" is disabled and says why. "Not now" returns to the Design page with nothing recorded and no repeated asking in that visit. The notice names every AI service that may receive her photo, what is kept and for how long, how to withdraw and how to complain. It is not combined with the terms of use or any other agreement. |
| Photo guidance | Shopper photo | Shows what makes a good photo before the picker opens: full length, standing, facing the camera, good light, only you in the picture. "Choose a photo" opens the device's own photo picker; "Take a photo" opens the camera. The app never asks for access to the whole gallery. After choosing, checks that can run on the device (size, format, whether a full-length person is visible) run before anything is sent; a photo that fails is refused with the reason and the guidance. A stored Shopper photo can be reused or replaced. |
| Try-on progress | Try-on progress | The request is accepted at once. The screen says it usually takes under a minute and that she can keep browsing. If she leaves, a "Result ready" Toast with "View" appears wherever she is in the app or site; if she closed it, the result waits in My Try-on. The progress fill reflects stages (sent, creating, checking), not a guessed percentage `[ASSUMPTION]`. |
| Try-on result frame | Try-on result, My Try-on | Shows the result with the AI-generated label, the sentence pointing to the real photos and the Full saree view, and four actions: "Add to cart", "See real photos", "Full saree view", "Report". A further menu holds "Save" (the saved copy carries the label) and "Delete". The result can be pinched to zoom; the label stays visible while zoomed. |
| AI-generated label | Every Try-on result | Present wherever a Try-on result is shown or saved, at every size, including thumbnails in My Try-on. Read by screen readers as part of the image description: "AI-generated image of you wearing [saree name]". |
| Update required screen | App below the minimum version | Blocks everything else; one Button opens the store listing (FR-55). |

### Flow patterns

Patterns built from the components above.

| Pattern | Rules |
|---|---|
| Search with no results | Never an empty page. Shows "No sarees match '[words]'", then the Filter panel with counts, then the three weaves that have the most Designs as tappable Chips with a Row of Designs each (FR-2). |
| Add to cart | No sign-in needed. The Button confirms in place ("Added"), the Cart count animates once, and a Toast offers "Go to cart". The Shopper stays on the Design page. Nothing else is added with it, offered pre-selected, or suggested in a pop-up. |
| Cart | Lists Cart lines, the Pincode delivery check, the shipping charge, and the total. The cart survives closing the app or browser and, after sign-in, is the same on her other devices. "Checkout" asks for sign-in if needed and returns her to the Checkout. |
| Checkout | One scrolling screen in this order: delivery address (with pincode checked), delivery dates, optional email for the invoice (marked optional), order summary, return period and conditions, total, and "Pay ₹ N". Above the Button: "When you pay, we hold your saree for 15 minutes while the payment completes." No extra items, no pre-ticked options, no charge that was not already shown in the Cart. |
| Payment and its return | "Pay" places the Hold, then opens the payment service's sheet. If another Shopper took the last Piece first, she is told before the sheet opens and no money is taken. On return the Payment result shows one of the Payment status states. Leaving the payment sheet without paying returns her to Checkout with the Hold countdown still running and "Try again" available until it ends. |
| Order tracking | Orders lists each Order with its current state. Order detail shows the Order timeline, items, address, invoice download, and the actions that apply in the current state: "Cancel Order" before Dispatched; "Request a Return" from Delivered until the return period ends; the Rating prompt after Delivered. |
| Cancel before dispatch | A Dialog states that the Order will be cancelled and refunded in full to the payment method she used; on confirming, the state becomes Cancelled and the refund line appears. |
| Return | After the Return request form, Return detail shows the Return's timeline. Accepted leads to Refunded with the amount and the date the refund was started. Rejected shows the reason and the Owner's photos, and says the saree is being sent back to her. |
| Report a Try-on result | "Report" on the Try-on result opens a Sheet: two reasons, "It looks wrong" and "It is offensive", an optional comment, and "Send report". A Toast confirms. The result stays visible unless she deletes it. |
| Try-on limit reached | The "Try on" Button is replaced by an Inline notice: "You have used today's 10 Try-ons. You can try again tomorrow after [time]." The number comes from the Owner's setting. |
| Withdraw Try-on consent | In My Try-on, "Withdraw consent" is as easy to reach as giving consent was: one screen, one Dialog. The Dialog says her photos and Try-on results will be erased from Alar and that erasure will be requested from the AI services. On confirming, photos and results disappear from the screen at once, and a line confirms "Consent withdrawn on [date]". Try-on asks for consent again next time. |
| Delete one photo or result | A Dialog, then removal at once, with a Toast. No undo, and the Dialog says so. |
| Account deletion | Account → "Delete my account". A screen states what will be removed (Shopper photos, Try-on results, personal details) and what the law requires Alar to keep (invoices), then asks for a fresh one-time code and a final "Delete my account" danger Button. Open Orders and Returns are listed first with what will happen to them `[ASSUMPTION]`. The same flow is on a public web page. |
| Sign in | Asked only at Try-on, checkout, order history and Account. Mobile number, then a six-digit code that expires after 5 minutes; "Send again" becomes available after 30 seconds `[ASSUMPTION]` and stops after 3 codes in 10 minutes with the time she can try again. First sign-in shows the terms and privacy policy with an explicit "I accept"; this is separate from Try-on consent. After sign-in she returns to exactly what she was doing. |
| Language switching | Account → Language, and the footer on web. Changes all Shopper-facing text at once without losing the cart, the screen or the scroll position. The choice is remembered on the device and on her account. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Loading, first open | SD screens | Skeleton in the shape of the last known layout. The app shows the last screen it received at once and refreshes behind it. |
| Loading | Design page | Photo area and text Skeletons; the photo appears first. Usable within 3 seconds on a mid-range phone on 4G (NFR-1). |
| Loading | Lists, Orders, My Try-on | Skeleton rows after 300ms. |
| Empty | Cart | Empty state: "Your cart is empty." Button: "Browse sarees". |
| Empty | Orders | Empty state: "You have no orders yet." Button: "Browse sarees". |
| Empty | My Try-on | Empty state: "No Try-on pictures yet. Open a saree and choose Try on." |
| Empty | Weaver page with no Designs in stock | The Weaver's story stays; Designs show as Sold out. |
| No results | Search and results | The "Search with no results" pattern. |
| Error, screen cannot load | SD screens | The last copy is shown (FR-32). If there is none: Empty state with "We could not load this. Check your connection and try again." and "Try again". |
| Unknown Block | SD screens | Skipped silently; the rest of the screen shows (FR-32). |
| Error, action failed | Any form | Inline notice (danger) beside the action, saying what happened and what to do; what she typed is kept. |
| Offline | Global | Inline notice (info) under the Top bar: "You are offline. Showing what was last loaded." Browsing of loaded screens continues; add to cart, checkout and Try-on Buttons are disabled with the reason. It clears by itself on reconnecting. |
| Sold out | Design card, Design page | Badge "Sold out" below the photo; the page stays fully viewable, with the Full saree view. The purchase Button is replaced by "Sold out". Try-on stays available `[ASSUMPTION]`. No "notify me" (not in the PRD). |
| On Hold by another Shopper | Design card, Design page, Cart | Badge "On hold right now" and the sentence "Someone is paying for the last piece. Check again in a few minutes." with a "Check again" Button. No timer of the other Shopper's Hold is shown. |
| Last Piece taken as she pays | Checkout | Before any money is taken: Inline notice (warning) "This saree was just sold. You have not been charged." The line is flagged in the Cart. |
| Cart item changed | Cart, Checkout | Inline notice (warning) on the line: "The price changed from ₹ A to ₹ B" or "Sold out", with "Accept" or "Remove". Pay is disabled until resolved. |
| Pincode not served | Design page, Cart, Checkout | "We do not deliver to [pincode] yet. We deliver within Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana and Puducherry." (the list comes from the Owner's setting). Checkout cannot begin for that address. |
| Payment confirmed | Payment result | Payment status (success), then Order confirmation with the Order number, delivery dates and invoice. A single success check draws once. |
| Payment pending | Payment result | Payment status (pending): "We are waiting for your bank to confirm. This can take a few minutes. You do not need to pay again." with the Hold countdown. The screen checks by itself; she may leave, and will be messaged. If confirmed within the Hold it becomes an Order; otherwise: "The payment did not complete in time. If money left your account, it is refunded automatically." |
| Payment failed | Payment result | Payment status (failed): "The payment did not go through. You have not been charged. Your cart is as you left it." Buttons: "Try again", "Back to cart". |
| Paid after the Hold ended, Pieces gone | Payment result, message | "Your payment arrived after the saree was sold. We have refunded ₹ N to the account you paid from." Sent by message within 5 minutes as well (FR-19). |
| Delivery failed | Order detail | Timeline shows Delivery failed with what happens next; if it cannot be delivered: Returned to shop, then Refunded in full. |
| Try-on unavailable for this Design | Design page | The Try-on entry point is absent (not disabled) when the Owner has limited Try-on to other Designs or switched it off. |
| Try-on paused | Design page, Try-on | When the daily spending cap is reached: Inline notice "Try-on is taking a break today. Please try again tomorrow." The photos and Full saree view are offered. |
| Try-on blocked: photo | Shopper photo, Try-on progress | When an AI service's safety check refuses the request: "This photo cannot be used for Try-on. Please choose a different one." No retry with the same photo; no reason that describes her or the photo. |
| Try-on blocked: result | Try-on progress | When the result fails Alar's own check (FR-52) it is never shown: "We could not make a picture this time. This did not count towards your daily limit." with "Try a different photo" and "See real photos". |
| Try-on failed or timed out | Try-on progress | After the fallback also fails: "Try-on is not working right now. This did not count towards your daily limit." with "Try again" and "See real photos". |
| Try-on limit reached | Design page, Try-on | The "Try-on limit reached" pattern. |
| Try-on not confirmed | Try-on consent | Without both confirmations Try-on stays unavailable; the rest of the shop is unaffected. |
| New consent notice version | Try-on entry | The Consent screen appears again before her next Try-on, saying what changed. |
| Code problems | Sign in | Wrong code: "That code is not right. Check the SMS and try again." Expired: "That code has expired." with "Send a new code". Too many: "Please wait until [time] to ask for another code." |
| Signed out during a task | Checkout, Try-on | Sign in, then return to the same step with the cart and inputs intact. |
| Update required | App | Update required screen; nothing else is reachable. |
| Focus | All interactive elements | A visible 2px outline (`{colors.focus-ring}`, `{spacing.focus-width}`, `{spacing.focus-offset}`) whenever focus arrives by keyboard or switch. |

## Interaction Primitives

- **Tap.** The only way to act. Feedback on press-down (`{components.motion.press-scale}` over `{components.motion.duration-press}`), action on release; a finger that drifts off the target cancels. No double-tap or long-press is required for any action; long-press stays with the system (text selection, link menus).
- **Swipe.** Horizontal swipe moves a Row of Designs and the Design gallery. Vertical swipe scrolls the page and drags a Sheet. No swipe-to-delete, and no swipe navigation between tabs. Rows claim only horizontal movement, so the page still scrolls when a finger starts on a row.
- **Pull.** Pull to refresh on Home, Search and results, Orders, Order detail and My Try-on in the app. On mobile web the browser's own pull to refresh is left alone.
- **Pinch.** In the Full saree viewer and the full-screen Design gallery only: pinch to zoom, double-tap to step in and out, drag to pan. Zoom stops at one image pixel per screen pixel; the image is never enlarged beyond its real detail. Pinch on the Try-on result works the same way.
- **Sheets.** Follow the finger; released past half way or with a downward flick they close, otherwise they settle back (`{components.motion.spring-sheet}`). The content of a Sheet scrolls to its top before a downward drag starts to close it.
- **Carousels.** Moved by the Shopper only. No auto-rotation, no auto-advance, no looping.
- **Hover** (pointer devices only). Adds a tint step to a control; never reveals content or actions that touch cannot reach.
- **Keyboard** (web). Tab order follows reading order; Enter and Space activate; Escape closes the top overlay; arrow keys move within a Row of Designs, the Design gallery and the Full saree viewer.
- **Haptics** (app only), always together with a visible change and never the only feedback: a light impact when a Piece is added to the cart and when a Sheet settles; a selection tick when the Quantity stepper changes; a success notification on payment confirmed; an error notification on payment failed. None while scrolling, none on ordinary navigation `[ASSUMPTION]`.
- **Motion.** Durations and curves are the tokens in `{components.motion.duration-fast}`, `{components.motion.duration-base}`, `{components.motion.duration-sheet}` and `{components.motion.ease-out}`. Screen-to-screen transitions are the platform's own.
- **Banned everywhere:** auto-rotating or auto-advancing carousels; pop-ups on arrival or on leaving; countdowns other than the real Hold; stock or viewer counts used as pressure; pre-ticked boxes; items added to the cart by Alar; any charge first shown during checkout; a sign-in wall before browsing; glass, text or effects laid over a saree photo; animations that play on scroll.

## Accessibility Floor

Behavioural. Colour contrast and sizes are in `DESIGN.md`. The floor is WCAG 2.2 AA on the web and the equivalent in the app (NFR-15).

- **Focus order** follows reading order on every surface. Opening a Sheet or Dialog moves focus into it and keeps it there; closing returns focus to the control that opened it. After a screen change, focus goes to the screen's title. A "Skip to content" link is the first stop on web.
- **Screen-reader labels.** Every interactive element has a name, role and state. A Design card is read as one item: "[saree name], woven by [Weaver], ₹ [price], [stock state]". Product photos carry a description written with the Design (which part: full drape, border, pallu, close-up). Prices are read as rupees in words. The Try-on result is read as "AI-generated image of you wearing [saree name]". Order and Return states are read with their names and dates.
- **Announcements.** Result counts in the Filter panel, cart changes, Toasts, the outcome of the Pincode delivery check, payment state changes and "Try-on result ready" are announced politely. The Hold countdown is announced at the start, at 5 minutes and at 1 minute.
- **Full saree viewer without sight or gestures.** Zoom and pan have Buttons and keys. For screen-reader users the entry point is described, and the Design's written attributes (fibre, weave, zari, border, pallu, dimensions) are the equivalent content `[ASSUMPTION]`.
- **Large fonts.** Text follows the system font size and browser zoom to 200%. At large sizes the Grid of Designs drops from two columns to one on phones, Buttons grow in height and wrap their labels, and nothing is truncated that the Shopper needs in order to decide or consent. No screen locks zooming.
- **Reduced motion.** When the system asks for it, movement and scaling are removed and changes become short fades (`{components.motion.reduced-duration}`); Sheets fade in; the Skeleton is static; the success check and badge animations show their end state.
- **Reduced transparency and increased contrast.** When the system asks for either, the Top bar, Bottom navigation bar and Sticky add-to-cart bar use their solid fallback (`{components.glass.fallback}`). The same fallback applies where blur is unavailable or slow. Under increased contrast, hairline borders use `{colors.border-strong}`.
- **Touch targets.** At least `{spacing.touch-min}` square with `{spacing.target-gap-min}` between them, including close controls, thumbnails, checkboxes on the Consent screen and the Quantity stepper.
- **Not colour alone.** Selection, errors, stock states and Order states always have words or an icon as well.
- **Time.** The only time limit is the Hold, set by stock, and it is stated before it starts. Sign-in codes can be requested again. No screen times out while she is reading the Consent screen.
- **Language switching.** The page language is declared so screen readers use the right voice; mixed-language content (a Tamil Weaver name in English text) is marked. Switching language keeps her place. Layouts allow for text up to 40% longer than English and for the taller lines of Indic scripts.
- **Forms.** Labels are visible, errors are tied to their fields and announced, and autofill works for name, address, pincode, mobile number, email and one-time code.

## Responsive & Platform

### Web breakpoints

| Range | Behaviour |
|---|---|
| Under 640px (phone) | One column; 2-column Grid of Designs. Top bar with back or logo, search and cart; Bottom navigation bar. Filter panel in a Sheet. Design page: full-bleed Design gallery, then content; Sticky add-to-cart bar. Dialogs become Sheets except destructive confirmations. |
| 640–1023px (tablet) | 3-column Grid of Designs; gutters `{spacing.gutter-tablet}`. Bottom navigation bar stays. Filter panel in a Sheet. |
| 1024px and up (desktop) | Content centred to `{spacing.content-max}`; 4-column Grid of Designs; Filter panel as a left column. Top bar holds all navigation; no Bottom navigation bar; footer present. Design page in two columns: Design gallery left, details and "Add to cart" right, staying in view while the gallery scrolls; no Sticky add-to-cart bar. Row of Designs gains previous and next Buttons. Checkout: form left, order summary right. |

The website is the full product on a phone browser: every Shopper surface, including Try-on and the Full saree view, works there.

### App (Android)

- System back works everywhere: it closes the top overlay first, then goes back a screen; from a tab's first screen it goes to Home, then leaves the app.
- Edge-to-edge layout; bars respect the status bar and gesture bar insets.
- The Shopper photo comes from the system photo picker or the camera; no storage permission is requested (FR-10). The camera permission is asked only when she chooses "Take a photo", with a sentence explaining why.
- The Full saree view is the same web viewer inside a native screen with native close and back (AD-18); its touch behaviour on Android is to be proven in the architecture's spike.
- "Try-on result ready" is shown inside the app, not as a push notification (FR-54). Order messages go by SMS and email; the app asks for no notification permission at launch `[ASSUMPTION]`.
- Server-driven screens show their last received copy when offline; an unknown Block is skipped; a version below the minimum shows the Update required screen.
- Glass uses blur on Android 12 and later and the solid fallback below that.
- Payment opens the payment service's own sheet; UPI apps open from it and return to Alar.
- iOS, when it follows, uses the same spines; system sheets and bars there may draw their own depth, which is the platform's and is accepted `[ASSUMPTION]`.

### Mobile-web fixes

From the mobile-native guidance; all are part of the baseline, tested on a real mid-range Android phone and an iPhone, not only in an emulator.

| Problem | Fix |
|---|---|
| Hover sticks after a tap | All hover styles inside `@media (hover: hover) and (pointer: fine)` |
| Grey flash on tap | Tap highlight colour transparent; press feedback is our own, on press-down |
| Bars cut off or jumping | Full-height layouts and bottom-fixed bars use `100dvh`, never `100vh` |
| Page zooms into a field | Field text is 16px; zooming is never disabled |
| Taps feel late | `touch-action: manipulation` on controls |
| Page behind a Sheet scrolls | `overscroll-behavior: contain` on Sheet content and other inner scrollers |
| Content under the notch or gesture bar | `viewport-fit=cover` with safe-area insets on the Top bar, Bottom navigation bar and Sticky add-to-cart bar |
| Long-press selects a Button's label | Text selection off on controls only, never on content |
| Row of Designs drags the page sideways or stutters | Native horizontal scrolling with scroll snap; in the Design gallery's zoom view, `touch-action` set so the viewer owns the gesture |
| Browser bar colour does not match | A `theme-color` for light (`{colors.background}`) and for dark (`{colors.background-dark}`) |
| Keyboard covers the pay Button or a field | The keyboard resizes the layout (`interactive-widget=resizes-content`); the focused field scrolls into view |

## Inspiration & Anti-patterns

No reference apps were gathered (the screen-reference tool was unavailable during research), so this section rests on the research digest's evidence and the founder's decisions.

**Taken up**

- **Material's tonal surfaces and the move to borders over drop shadows** (digest claims 9, 10, 13): depth by tint step and hairline, which is the founder's no-shadow rule.
- **Apple's rule for glass** (claims 2 to 4): a functional layer for navigation and floating controls only, used sparingly, with a frostier, more opaque look when the Shopper asks for less transparency.
- **Gallery thumbnails rather than dots, and zoom that loads real detail** (claim 37): most mobile shops use dots that Shoppers overlook, and many limit pinch; Alar does neither.
- **Neutral surrounds for judging colour** (claim 42, weak evidence): product photos on an untinted surface.
- **The shop counter.** The Full saree view and the Weaver's name do online what a trusted shop does in person: lay the whole saree out and say who made it.

**Rejected**

- **Auto-rotating carousels** (claim 36): Shoppers miss their content and read them as adverts. Every carousel is swiped by the Shopper, and nothing essential lives only in one.
- **Glass over content** (claims 3, 5, 17): tints and dimming layers change how cloth colour reads. No glass on cards, pages or photos.
- **False urgency**: countdown offers, "only 1 left", "N people viewing", flashing stock (NFR-13). The one countdown is the real Hold, shown only after payment begins.
- **Pre-ticked extras and bundled consent** (NFR-13, FR-8): nothing is pre-selected; Try-on consent stands alone.
- **Late-added charges** (FR-5): shipping is shown in the Cart.
- **Sign-in walls** (FR-26): browsing never asks for an account.
- **Flattering imagery** (PRD §7a, SM-C2): no filters on photos, no Try-on result in place of a product photo, no beautifying of the Shopper in a Try-on result.
- **Try-on as a social feature** (PRD §5): no sharing feed, no public gallery.
- **Overshooting, bouncy motion on frequent actions** (claims 12, 34): Material's expressive springs are not adopted for taps and navigation.

Trade-off noted: Google's current direction is bolder shape, colour and spring motion; the founder asked to follow platform direction but also for restraint around the saree, so Alar takes the tonal surfaces and rounder controls and leaves the expressive motion.

## Key Flows

Journey names and protagonists are the PRD's. UJ-3, UJ-4 and UJ-5 take place in the Admin, whose UI is inherited; their steps name what the Owner does and what the Shopper-facing result is.

### UJ-1. Lakshmi buys a saree for her cousin's engagement

Lakshmi, 34, in Coimbatore, on her phone, usually buys from a shop she trusts.

1. She opens the website without signing in. Home loads from Blocks; a Row of Designs for the wedding season is the second thing she sees.
2. She taps Search, opens the Filter panel, and chooses occasion "Wedding and functions" and a price range. The Button reads "Show 14 Designs" before she applies.
3. She opens a saree. The Design page shows the Design gallery, the Price display, and "Woven by" with the Weaver's name. She taps the Weaver badge, reads the family's story, and comes back to where she was.
4. Under the photos she taps "Full saree view". The whole saree appears end to end; she pinches in along the border, then drags to the pallu.
5. She taps "Try on". She signs in with her mobile number and a code, and accepts the terms.
6. The Consent screen opens by itself. She reads which AI services receive her photo and that it is deleted after 30 days unused, ticks the two boxes, and taps "I agree".
7. Photo guidance shows what works. She picks a full-length photo from her phone's picker.
8. Try-on progress says it usually takes under a minute. She waits on the screen.
9. **Climax:** the Try-on result appears in its frame, labelled "AI-generated", with the line beneath it pointing her back to the real photos and the Full saree view. She looks at herself in the saree, taps "Full saree view" once more to check the border against the picture, and decides. What convinced her was seeing the real cloth and an honest picture side by side, with neither pretending to be the other.
10. She taps "Add to cart", goes to the Cart, enters her pincode and sees delivery between two dates, with the shipping charge shown.
11. In Checkout she enters her address and an email for the invoice, reads the total, and taps "Pay ₹ 3,450". The sentence about the 15-minute Hold is above the Button.
12. She pays by UPI. The Payment result shows payment confirmed, then the Order confirmation with her Order number and invoice; an SMS and email follow.

**Edge case (PRD):** the last Piece is sold while she is paying. If another Shopper got the Hold first, she sees "This saree was just sold. You have not been charged." before the payment sheet opens. If her payment arrives after her Hold has ended and the Piece is gone, she sees and is messaged within 5 minutes: "Your payment arrived after the saree was sold. We have refunded ₹ 3,450 to the account you paid from."

**Other failure paths:** payment fails → "You have not been charged. Your cart is as you left it." Payment pending → the pending state with the Hold countdown. Her photo is refused → neutral wording and the guidance again. Try-on fails → the real photos are offered and the attempt does not count. She taps "Not now" on consent → back on the Design page, and the purchase path is untouched.

### UJ-2. Lakshmi returns a saree whose colour disappointed her

1. The saree arrives. In Order detail the timeline shows Delivered, and the Rating prompt asks whether it matched what she saw. She answers 2 and writes that the colour is duller.
2. She taps "Request a Return". The Return request form lists the reasons; she picks "Not as shown" and sees that return shipping is free.
3. She confirms the pickup address, chooses a pickup date, sees the refund amount and that it will go to the UPI account she paid from, and taps "Request a Return".
4. Return detail shows Requested, then Pickup booked with the date. SMS messages follow each change.
5. The saree is collected: Picked up, then Received.
6. **Climax:** she opens Return detail and reads Accepted, then Refunded: "Your refund of ₹ 3,450 was started on 12 December, to the UPI account you paid from." The shop took the saree back on her word about the colour, without argument.

**Failure paths:** outside the return period → the action is absent and the Order shows the date the period ended. Inspection fails → Rejected, with the reason and photos, and the saree is sent back to her. Pickup missed → the timeline says a new pickup is being booked `[ASSUMPTION]`.

### UJ-3. The owner lists a new design in under 15 minutes

1. The Owner photographs the saree: drape, border, pallu, a fabric close-up, and one full-length image.
2. In the Admin the Owner creates a Design and chooses its Weaver, fibre, weave, dimensions, tax code and price. A price that fits no tax band is refused with the nearest valid prices.
3. The Owner uploads the photos and marks the close-up. A claim such as "handloom" asks for its evidence before it can be saved.
4. The Owner uploads the full-length image. The Admin shows processing, then "Ready"; an image under 8,000 pixels on its long side is refused with that minimum stated.
5. The Owner sets stock to 10 Pieces and ticks the confirmation that the photos show the saree's true colour.
6. The Owner opens the preview at phone size.
7. **Climax:** the preview shows the Design page exactly as a Shopper will see it: the photos on their neutral surface, the Weaver's name under the title, the whole-rupee price, and the Full saree view opening end to end. The Owner taps Publish, and the saree is in the shop without anyone else's help.

**Failure paths:** a required item is missing (Weaver, fibre, dimensions, tax code, price, close-up, a second photo) → Publish is disabled and the missing items are listed. Processing of the full-length image fails → the Design can still be published and the Full saree view entry point is simply absent for Shoppers.

### UJ-4. The owner changes the try-on model after complaints about borders

1. The Owner opens the review queue and sees several reported Try-on results, each with its Design, Model route, Prompt version and the Shopper's reason; most say the border looks wrong.
2. The Owner opens the test screen, picks another model from the Approved-model list and writes a new Prompt version.
3. The Owner runs both on the saved sample sarees and sample photos.
4. **Climax:** the outputs appear side by side, old route against new, for the same saree and the same photo. On the new one the border matches the product photo. The Owner can see the difference before any Shopper does.
5. The Owner publishes the new Model route and Prompt version. It takes effect for Shoppers without a release; the change is recorded.
6. Over the next days the Owner watches reports and the cost and failure view, and marks the old reports handled.

**Failure paths:** the new route is worse → one action returns to the previous Model route. The new model is not named in the published Try-on consent notice → publishing is refused until a new notice version is published, and Shoppers then see the Consent screen again. The route costs more than the ceiling → it cannot be published.

### UJ-5. The owner prepares the home screen for Pongal

1. The Owner opens Screens and creates a campaign screen and a new version of Home.
2. The Owner adds Blocks: a Banner for Pongal, a Row of Designs filled by a rule, a Weaver story, a Grid of Designs chosen by hand, and reorders them.
3. The Owner sets the Banner's action to open the campaign screen.
4. The Owner saves a draft and opens the preview at phone size.
5. The Owner schedules both screens for the morning of the festival.
6. **Climax:** on the day, a Shopper opens the app she installed weeks ago and Home shows the Pongal Banner and rows; the website shows the same. No app release happened, and the Owner did not touch anything that morning.

**Failure paths:** the Owner dislikes the result → return to the earlier version in one action. An older app does not know a Block → that Block is skipped and the rest of the screen shows. A Shopper is offline → she sees the last screen her app received.

### UJ-6. A shopper withdraws consent

1. The Shopper opens Account, then My Try-on. She sees her stored Shopper photo and her Try-on results, each labelled "AI-generated".
2. She taps "Withdraw consent". It is on this screen, no further away than giving consent was.
3. A Dialog says plainly what will happen: her photos and Try-on results will be erased from Alar, and Alar will ask each AI service that received them to erase them too.
4. She confirms.
5. **Climax:** the photo and every result disappear from the screen at once, and one line remains: "Consent withdrawn on 27 November. Your photos and Try-on pictures have been removed." Leaving was as easy as joining.
6. Later she taps "Try on" on a saree, and the Consent screen appears again, as if for the first time.

**Failure paths:** she is offline → the action is disabled with the reason, and nothing is half-done. An AI service does not confirm erasure → nothing changes for her (her data is already gone from Alar); the Owner is alerted. She wants only one picture gone → "Delete" on that picture, without withdrawing.
