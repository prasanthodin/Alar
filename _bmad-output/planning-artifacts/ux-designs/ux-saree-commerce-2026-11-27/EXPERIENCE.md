---
name: Alar
status: final
created: '2026-11-27'
updated: '2026-11-27'
sources:
  - ../../prds/prd-saree-commerce-2026-11-27/prd.md
  - ../../architecture/architecture-saree-commerce-2026-11-27/ARCHITECTURE-SPINE.md
  - ../../research/ux-direction-2026-11-27/digest.md
  - ./.memlog.md
  - ./.working/design-canvas/project/
---

# Alar — Experience Spine

> How Alar works. `DESIGN.md` owns how it looks. Both win over any mock. The mocks are the 72 boards of the design canvas; each surface below names its board file (in `.working/design-canvas/project/`, suffix `.dc.html`). Terms are the PRD Glossary's. Lines tagged `[ASSUMPTION]` were chosen here.
>
> The boards once showed 14 things the PRD did not contain. Each has been decided; see "First-release scope decisions".

## Foundation

- **Form factors.** Three surfaces. The Android app (Expo / React Native) and the website (Next.js), which share one design and one behaviour on a phone; the website also has a desktop layout from 1024px. The Admin is a desktop web console at 1440px. iOS follows from the app codebase.
- **UI system.** Web and Admin: Tailwind CSS 4 with shadcn components. App: the React Native equivalents, reading the same tokens. Their built-in behaviour (focus trapping in dialogs, keyboard handling in menus, sheet dragging) is inherited; this file states only what Alar adds or changes.
- **Visual identity.** `DESIGN.md`. Tokens are cited as `{path.to.token}`.
- **Familiar by design.** The founder asked for the layout of a mainstream Indian shopping app, about 90% the same, with Alar's own bottom navigation. A Shopper should not have to learn where anything is.
- **Category-neutral.** Sarees come first, but no screen, word or rule assumes a saree. A Design has Variants by colour, and by size where its category uses sizes (PRD FR-35, FR-65, NFR-17).
- **Honest by rule.** Nothing may make an item look better than it is, and nothing may push by false pressure (NFR-13). Weavers are recorded in the Admin and never shown to Shoppers (FR-4).
- **Words.** The PRD's "Cart" is shown to Shoppers as **"Bag"**. All other Glossary terms are used as they stand.

## Information Architecture

### Navigation

- **App and mobile web:** a floating bottom navigation with four items: **Home, Categories, Try-on, Bag**. The current item is a tinted pill with its icon and name; the others are icons with accessible names. Profile, Wishlist and Notifications are reached from the Home top bar. Screens with a purchase or confirm action hide the navigation and show a bottom action bar.
- **Website from 1024px:** a top bar with the wordmark, departments (Women, Men, Kids, Offers, Try-on), search, and Profile, Wishlist, Bag. No bottom navigation.
- **Admin:** a left sidebar: Dashboard, Products, Categories, Stock, Orders, Returns, Customers, App content, AI try-on, Offers, Settings.

### Shopper surfaces

"SD" = a server-driven screen composed of Blocks by the Owner (FR-30). "Fixed" = built in. Sign-in is needed only for Try-on, checkout, order history and the account (FR-26); everything else is open.

| Surface | Kind | Board | Reached from | Purpose |
|---|---|---|---|---|
| Log in or sign up | Fixed | `Login`, `WebLogin` | Any action that needs an account | Mobile number and SMS code, or email address and email code |
| One-time code | Fixed | `Otp` | Login | Six-digit code, resend timer |
| Sign-up details | Fixed | `SignUp` | First successful code | Name required; email and PIN code optional; message choices unticked except order updates |
| Home | SD | `Main`, `WebHome` | Launch; Home tab; wordmark | Address bar, search, department tabs, category rail, banner carousel, service strip, product grid |
| Categories | Fixed shell, SD content | `Categories` | Categories tab | Departments in a left rail, category thumbnails at the right; draft departments are hidden |
| Search | Fixed | `Search` | Search field | Suggestions, matching products, trending terms |
| Listing | Fixed | `Listing`, `WebListing` | Category, search, banner | 2-column grid with a floating Sort and filter bar; filter column on desktop |
| Filters | Fixed | `Filters` | Listing | Filter groups in a left rail, options at the right, live item count |
| Product page | Fixed | `Product`, `Shirt`, `WebProduct` | Any product card | Photos, price, offer, colour, size where used, Try-on entry, delivery check, details, similar products |
| Size chart | Fixed | `SizeChart` | Product page of a sized category | Measurements; the chosen size highlighted |
| Full saree view | Fixed | `FullSaree` | Product page | The whole item end to end, zoom and pan, section chips, mini-map |
| Wishlist | Fixed | `Wishlist` | Home top bar, Profile | Saved Designs; move to Bag |
| Try-on consent | Fixed | `Consent`, `ConsentNotice` | First "Try it on"; new notice version | Short notice, two confirmations, link to the full text |
| Choose photo | Fixed | `TryOnPhoto` | Consent | Guidance, system picker or camera |
| Try-on in progress | Fixed | `TryOnWait` | Choose photo | Progress; she may leave |
| Try-on result | Fixed | `TryOnResult` | Progress; Try-on tab | The picture with its AI label, save, share, report, delete, try another |
| Try-on problem | Fixed | `TryOnProblem` | Progress | Photo not usable, or no result; the attempt is not counted |
| Try-on tab | Fixed | `TryOnHub` | Try-on tab | Her Try-on results, her stored photo, attempts left today |
| Bag | Fixed | `Bag`, `EmptyBag`, `WebBag` | Bag tab | Items, coupon, price details |
| Coupons | Fixed | `Coupons` | Bag | Codes she can use, and why another cannot be used yet |
| Checkout | Fixed | `Checkout`, `WebCheckout` | Bag | Address, items, payment method, total; the Hold starts here |
| Payment result | Fixed | `OrderPlaced`, `PaymentFailed` | Payment service | Confirmed, pending or failed |
| My orders | Fixed | `Orders` | Profile; Order confirmed | Orders by state |
| Order detail | Fixed | `OrderDetail` | My orders | Timeline, items, address, payment, invoice, return, help |
| Return | Fixed | `ReturnReason`, `ReturnConfirm` | Order detail | Reason, pickup, refund |
| Rate | Fixed | `Review` | My orders after delivery | "Did it match what you saw" and a star rating (FR-53, FR-63) |
| Profile | Fixed | `Profile`, `EditProfile` | Home top bar | Entry to orders, wishlist, try-ons, addresses, settings |
| Addresses | Fixed | `Addresses`, `AddAddress` | Profile; Checkout | Saved addresses; delivery check on the PIN code |
| Notifications | Fixed | `Notifications` | Profile; Home top bar | Order events and "Try-on ready"; no offers |
| Language | Fixed | `Language` | Profile | Interface language |
| Privacy and consent | Fixed | `Privacy`, `DeleteAccount` | Profile; Try-on tab | Consent state, her Try-on data, message choices, data requests, account deletion |
| Help | Fixed | `Help` | Profile; Order detail | Topics, and ways to reach a person |
| Offline | Fixed | `NoInternet` | Any screen with nothing cached | Retry |

Surfaces not drawn and built from this file alone: the full-screen photo gallery, the payment-pending state, address change inside checkout, the sold-out product page, search with no results, the "update required" screen, legal pages as plain text, and the tablet width. They follow the Component and State patterns below `[ASSUMPTION: no board needed]`.

### Admin surfaces

The architecture has two Admins (commerce, and content). The boards show one console in the Alar look. **Decided (founder, 2026-11-27):** build two Admins, both themed in the Alar colours and linked to each other from the sidebar. The boards are the target for content, wording and layout of each page; a pixel match to one shared shell is not required at launch.

| Surface | Board | Purpose |
|---|---|---|
| Sign in | `AdminLogin` | Password, then a one-time code by email and SMS on every sign-in (FR-60) |
| Dashboard | `AdminDashboard` | Today's sales, orders to pack, Try-on use and health, AI spend, low stock |
| Products | `AdminProducts`, `AdminProductEdit` | List; one Design with details, weaver (Admin only), photos, Variants, stock, price, visibility |
| Categories | `AdminCategories` | Department and category tree; the details each category asks for; whether it uses sizes, the full-length view and Try-on |
| Stock | `AdminInventory` | Stock movements with reason and person; receive stock; counts |
| Orders | `AdminOrders` | Orders by state; pack, book courier, print label, cancel and refund |
| Returns | `AdminReturns` | Review a Return, book pickup, inspect, refund or reject |
| Customers | `AdminCustomers`, `AdminAudit` | Shoppers with consent state; deletion requests; the audit log. Staff and roles are for a later version |
| App content | `AdminContent` | Compose Home and other SD screens from Blocks; preview, schedule, publish |
| AI try-on | `AdminAI`, `AdminPrompts`, `AdminConsent`, `AdminAIReports` | Model route, prompt versions with test, limits, safety checks, consent notice versions, reported results, cost |
| Offers | `AdminOffers` | Coupons and sale prices |
| Settings | `AdminSettings`, `AdminMessages`, `AdminLegal` | Store name and brand, payments, delivery, tax bands, messages, legal pages, dated legal values |

## Voice and Tone

Plain, warm, short. Written for a Shopper reading in her second language on a small screen.

- **Say what happened, then what to do.** "Payment did not go through. No order has been placed. Try again."
- **One idea per sentence.** No idioms, no exclamation marks, no "Oops".
- **Name things the same way everywhere:** Bag, Wishlist, Try-on, Order, Return, Refund.
- **Money is exact:** "₹4,950", "You save ₹650", "Prices include all taxes." Refund lines say where the money goes and when.
- **Try-on is always called what it is.** "This picture is made by AI. The real drape, colour and fall can look different." Never "see exactly how it looks".
- **Consent is asked, not assumed.** Every box starts unticked, including "I am 18 or older".
- **No pressure.** No "Hurry", no "Selling fast", no invented countdown. The only timer is the real Hold.
- **Buttons are verbs:** "Add to bag", "Get OTP", "Confirm return". Not "OK", not "Submit".
- **Languages:** English, Tamil, Telugu, Kannada, Malayalam for the interface, notices and messages (FR-59). Product and weave names are not translated.

## Component Patterns

Behaviour. Visual specification is in `DESIGN.md` under Components.

| Pattern | Behaviour |
|---|---|
| **Address bar** | Shows the saved or last-entered delivery place. Tapping opens address choice (signed in) or a PIN-code entry (signed out). Delivery dates across the app follow it. |
| **Department tabs** | Filter Home content by department. Only live departments show. |
| **Category rail** | Scrolls sideways; each thumbnail opens a Listing. |
| **Banner carousel** | Moved by the Shopper only. No auto-advance, no looping. Dots show position. The whole banner is one target. |
| **Product card** | The whole card opens the Product page. The heart toggles the Wishlist without leaving the page (sign-in asked first if needed, then the action completes). |
| **Sort and filter bar** | Floats above the grid while it scrolls. Each item opens its sheet; a count shows how many filters are on. |
| **Filters** | Choosing an option updates the item count at once; "Apply" closes; "Clear all" resets. Options with no items are shown disabled, not hidden. |
| **Search** | Suggestions appear from the second character. A suggestion fills the field and runs the search. Past searches are kept on the device and can be cleared. |
| **Product gallery** | Swipe between photos; tap opens full screen with pinch zoom. Controls over the photo are solid. |
| **Action tiles** | "Full saree", "Try it on", "Share" under the gallery. A tile is absent, not disabled, when its feature is off for that Design. |
| **Variant choice** | Colour by photo thumbnail; size by chip where the category uses sizes. A sold-out Variant is shown struck through and can be opened but not bought. The price, photos and stock follow the chosen Variant. |
| **Delivery check** | A PIN code gives a date, or says the place is not served and lists where Alar delivers (FR-17). |
| **Buy now / Add to bag** | "Add to bag" adds and stays on the page with a confirmation. "Buy now" goes straight to Checkout with that item only (FR-61). On a sized item, both ask for a size first. |
| **Try-on entry** | Signed out: sign in, then continue. No consent on record, or a newer notice version: the Consent screen. Otherwise: Choose photo if no photo is stored, else straight to progress. |
| **Consent screen** | Three plain facts, two confirmations, a link to the full notice. "I agree" is enabled only when both are ticked. "Not now" returns to where she was with nothing lost. |
| **Photo choice** | The system photo picker or the camera; no storage permission (FR-10). The camera permission is asked only on "Camera". |
| **Try-on result** | Hold the picture to compare with the real product photo. Save, Share, Report and Delete are one tap each. "Report" hides the picture at once and tells the Owner (FR-13). |
| **Quantity stepper** | Never goes above the stock of that Variant; at the limit, "+" is disabled and a line says why. |
| **Coupon** | One per Order. A code that does not apply says exactly what is missing. |
| **Price details** | Always the same four lines in the same order: Total MRP, Discount, Delivery, Total. No line appears for the first time at payment. |
| **Hold timer** | Starts when payment starts, 15 minutes, shown at Checkout and on a failed payment. It is the real stock Hold (FR-19). |
| **Order timeline** | States are the Glossary's. The current state carries its date and, when shipped, the tracking number. |
| **Return** | Step 1 reason, step 2 pickup and refund. Reasons that need photos say so before she chooses. |
| **Address form** | The PIN code is checked as soon as it is complete and fills city and state. |
| **Notes** | Explain a rule next to where it applies. They are not dismissible and never cover content. |
| **Admin list and panel** | Selecting a row opens its detail in the right panel; the list stays. Destructive actions ask once, naming the thing. |
| **Admin drafts** | Content, prompts, notice versions and prices are edited as drafts and take effect only on "Publish" or "Save changes"; each publish is a new version that can be restored (FR-31, FR-41, FR-46). |
| **Admin stock** | Stock changes only through named actions (receive, sell, hold, return, write off, count), each with a reason and a person. No field lets a number be typed over. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Loading, first open | SD screens | Skeleton in the shape of the last known layout; the app shows the last copy it received and refreshes behind it |
| Loading | Product page | Photo area and text skeletons; the photo first. Usable within 3 seconds on a mid-range phone on 4G (NFR-1) |
| Loading | Lists | Skeleton rows after 300ms |
| Empty | Bag | `EmptyBag`: "Your bag is empty", "Start shopping", and a row from her Wishlist if she has one |
| Empty | Orders, Wishlist, Try-on tab, Notifications | The empty-state pattern with one sentence and one button to the natural next step |
| No results | Search, Listing | "Nothing matches." with the active filters as removable chips and "Clear all" |
| Offline | Global | Cached screens stay usable with a line under the top bar; add to Bag, Checkout and Try-on are disabled with the reason. With nothing cached: `NoInternet` |
| Unknown Block | SD screens | Skipped silently; the rest shows (FR-32) |
| Action failed | Any form | A red note beside the action saying what happened and what to do; what she typed is kept |
| Low stock | Product page, Bag | The true count at or below the Owner's level ("Only 3 left"); nothing above it |
| Sold out | Card, Product page, Wishlist | "Sold out" replaces the purchase buttons; the page stays fully viewable |
| On Hold by another Shopper | Product page, Bag | "Someone is paying for the last piece. Check again in a few minutes." No timer of the other Shopper's Hold |
| Bag item changed | Bag, Checkout | An amber note on the line: the price changed, or sold out, with "Accept" or "Remove". Paying is disabled until resolved |
| PIN code not served | Product page, Address, Checkout | Says so and lists where Alar delivers. Checkout cannot begin for that address |
| Payment confirmed | `OrderPlaced` | Order number, amount, delivery date, items; one success tick draws once |
| Payment pending | Payment result | "We are waiting for your bank to confirm. You do not need to pay again." with the Hold timer; she may leave and is messaged |
| Payment failed | `PaymentFailed` | No order placed; items still held with the time left; "Try again", "Pay another way" |
| Paid after the Hold ended | Payment result, message | "Your payment arrived after the item was sold. We have refunded ₹N to the account you paid from." within 5 minutes (FR-19) |
| Cash on delivery | Checkout | Shown as "Not available yet", not selectable |
| Try-on in progress | `TryOnWait` | Three steps with the current one marked; "About 15 seconds"; she may leave |
| Try-on: photo not usable | `TryOnProblem` | Says which rule the photo missed in neutral words; never describes her. Not counted |
| Try-on: no result | `TryOnProblem` | When the result fails Alar's own check or every model fails: "We could not make a picture this time." Not counted; real photos offered |
| Try-on limit reached | Product page, Try-on tab | "You have used today's try-ons. Come back tomorrow." The entry stays visible |
| Try-on paused by the Owner | Product page | The entry is absent |
| New notice version | Try-on entry | The Consent screen appears again and says what changed |
| Consent withdrawn | Privacy, Try-on tab | Photo and pictures vanish at once; one line records the date |
| Code problems | `Otp` | Wrong: "That code is not right." Expired: "Send a new code". Too many requests: says when she can ask again |
| Account deletion with an open Order | `DeleteAccount` | Explains that deletion is possible after delivery and the return window; the button is disabled until then |
| Signed out during a task | Checkout, Try-on | Sign in, then return to the same step with everything intact |
| Update required | App | A full screen with one button to the store (FR-55) |
| Admin: nothing to do | Any queue | "Nothing waiting." with the time of the last item |
| Admin: publish blocked | Consent notice, legal pages | The button is disabled and the missing item is named beside it (approval not recorded; blanks remaining) |
| Focus | All interactive elements | A visible 2px `{colors.focus-ring}` outline whenever focus arrives by keyboard or switch |

## Interaction Primitives

- **Tap.** Feedback on press-down (`{components.motion.press-scale}`), action on release; drifting off cancels. No action needs a double-tap or long-press, except "hold to compare" on a Try-on result, which also has a button for those who cannot hold.
- **Swipe.** Sideways moves a rail, a carousel and the gallery. Up and down scrolls and drags a sheet. No swipe-to-delete. Rails claim only sideways movement, so the page still scrolls when a finger starts on one.
- **Pull to refresh** in the app on Home, Listing, My orders, Order detail and the Try-on tab. On mobile web the browser's own is left alone.
- **Pinch and pan** in the Full saree view, the full-screen gallery and the Try-on result: pinch to zoom, double-tap to step, drag to pan. Zoom stops at one image pixel per screen pixel.
- **Sheets** follow the finger; past half way or with a flick they close, otherwise they settle back. Content scrolls to its top before a drag starts to close.
- **Carousels** are moved by the Shopper only.
- **Hover** (pointer devices) adds a tint step; it never reveals anything touch cannot reach.
- **Keyboard** (web, Admin). Tab order follows reading order; Enter and Space activate; Escape closes the top overlay; arrows move within a rail, the gallery and the Full saree view.
- **Haptics** (app), always with a visible change: a light tap on add to Bag and on wishlisting; a success on payment confirmed; an error on payment failed.
- **Banned everywhere:** auto-rotating carousels; pop-ups on arrival or leaving; countdowns other than the real Hold; pre-ticked consent or marketing boxes; items added to the Bag by Alar; a charge first shown at payment; a sign-in wall before browsing; anything laid over a product photo beyond its label, wishlist button and rating.

## Accessibility Floor

Behavioural. Contrast and sizes are in `DESIGN.md`. The floor is WCAG 2.2 AA on the web and the equivalent in the app (NFR-15).

- **Focus** follows reading order. Opening a sheet or dialog moves focus into it and keeps it there; closing returns it. After a screen change, focus goes to the title. "Skip to content" is the first stop on web.
- **Names.** Every control has a name, role and state. A product card is read as one item: name, colour, price, discount, stock state. Photos carry a written description of what they show. An AI-made picture is announced as "AI-made preview".
- **Announcements.** Filter counts, Bag changes, the delivery check, payment state changes and "Try-on ready" are announced politely. The Hold timer is announced at the start, at 5 minutes and at 1 minute.
- **Full saree view without sight or gestures.** Zoom and pan have buttons and keys; the section chips jump to blouse piece, body, border and pallu; the written details are the equivalent content.
- **Large text.** Text follows the system size and browser zoom to 200%. At large sizes the 2-column grid becomes one column, buttons grow and wrap, and nothing needed to decide or consent is cut off.
- **Touch targets** are at least `{spacing.touch-min}` in effect: a 40px button or 32px chip has its hit area extended to 44px, and neighbours keep 8px between them.
- **Not colour alone.** Selection, errors, stock and Order states always carry words or an icon.
- **Time.** The only limit is the Hold, stated before it starts. Codes can be requested again. Nothing times out on the Consent screen.
- **Reduced motion and reduced transparency** are honoured as `DESIGN.md` describes; glass bars become solid.
- **Language.** The page language is declared; mixed-language text is marked; switching language keeps her place. Layouts allow 40% longer text and the taller lines of Indic scripts.
- **Forms.** Labels are visible, errors are tied to their fields and announced, and autofill works for name, address, PIN code, mobile number, email and the one-time code.

## Responsive & Platform

| Width | Behaviour |
|---|---|
| Under 640px | The phone design: one column, 2-column grid, top bar, floating bottom navigation, filters in a full-screen panel, bottom action bar on purchase screens |
| 640–1023px | The phone design with a 3-column grid and 24px gutters `[ASSUMPTION]` |
| 1024px and up | Top navigation, no bottom navigation; filter column beside a 4-column grid; Product page in two columns with the details staying in view; Bag and Checkout with a summary column; login as a dialog |

**App (Android).** System back closes the top overlay, then goes back a screen. Edge-to-edge, with bars inside the safe areas. The Full saree view is the web viewer inside a native screen (AD-18). Payment opens the payment service's own sheet. SD screens show their last copy offline. Glass uses blur on Android 12 and later, solid below.

**Mobile web.** Hover styles only for real pointers; no tap highlight; full-height layouts use `100dvh`; field text is 16px and zoom is never disabled; inner scrollers contain their overscroll; bars respect the safe-area insets; the keyboard resizes the layout so the pay button stays reachable. Tested on a real mid-range Android phone and an iPhone.

**Admin.** Desktop only at launch, 1280px and wider `[ASSUMPTION]`. Tables scroll inside their card; the right panel becomes a full-width page below 1280px.

## Key Flows

Journeys and protagonists are the PRD's (§2), retold against the boards.

### UJ-1. Lakshmi buys a saree for her cousin's engagement

Lakshmi, 34, in Coimbatore, on her phone.

1. She opens Alar without signing in. Home shows her PIN code, the category rail and a wedding banner (`Main`).
2. She taps "Wedding", then opens Filters and chooses silk and a price range; the count reads "73 items" before she applies (`Listing`, `Filters`).
3. She opens a saree (`Product`). She sees the photos, ₹3,150 with the MRP struck through, the colours, and a delivery date for her PIN code.
4. She taps "Full saree" and drags from the blouse piece to the pallu, pinching in on the border (`FullSaree`).
5. She taps "Try it on". She signs in with her mobile number and the code sent by SMS (`Login`, `Otp`), and gives her name (`SignUp`).
6. The Consent screen says what is used, who receives it and how long it is kept. She ticks both boxes and agrees (`Consent`).
7. She picks a full-length photo from her phone's picker (`TryOnPhoto`) and watches the three steps (`TryOnWait`).
8. **Climax:** the picture appears, labelled "AI PREVIEW", with the line that the real drape and colour can differ (`TryOnResult`). She holds it to compare with the product photo, opens the full saree once more to check the border, and decides. Two honest views, side by side, are what convince her.
9. She adds it to the Bag, sees the four price lines and no surprises (`Bag`), and goes to Checkout.
10. She confirms her address, chooses UPI, reads "We hold your items for 15 minutes while you pay", and pays ₹4,950 (`Checkout`).
11. Order confirmed, with the order number and delivery date (`OrderPlaced`); an SMS follows.

**Edge case (PRD):** the last Piece goes while she pays. If another Shopper held it first, she is told before the payment sheet opens and is not charged. If her payment arrives after her Hold ended, she is refunded automatically and told within 5 minutes.

**Other paths:** payment fails → `PaymentFailed`, items still held. Her photo cannot be used → `TryOnProblem`, not counted. She taps "Not now" on consent → back on the Product page, purchase untouched.

### UJ-2. Lakshmi returns a saree whose colour disappointed her

1. The saree arrives. In My orders she taps "Return or exchange" (`Orders`, `OrderDetail`).
2. She chooses "Return for refund" and "Colour looks different from the photos"; photos are optional for this reason (`ReturnReason`).
3. She picks a pickup day and reads what she gets back and when (`ReturnConfirm`).
4. **Climax:** before she confirms, the screen says in one line: ₹4,950, to the UPI account she paid from, within 5 to 7 working days after the check. Nothing is left to wonder about.
5. The Order shows the Return's states; when the saree passes inspection the refund is sent and she is messaged.

**Other paths:** the saree fails inspection → she is told why, with photos, and it is sent back (FR-23). She wants another colour → she returns this one and orders the other; exchange is for a later version.

### UJ-3. The owner lists a new design in under 15 minutes

1. In Products he taps "Add product" (`AdminProducts`).
2. He fills name, description, category, fabric and weave; the fields asked for come from the category (`AdminProductEdit`, `AdminCategories`). He picks the weaver; the field is marked hidden from Shoppers.
3. He uploads the photos and the full-length image, and ticks that they show the true colour.
4. He adds colours as Variants, sets 10 Pieces and a whole-rupee price for each; the screen shows the tax inside the price and the margin.
5. He taps "Preview in app", then turns on "Live in the store" and saves.
6. **Climax:** the saree is on the phone in his hand, with the full saree view working, in under 15 minutes from the first tap.

**Failure paths:** a photo is too small for the full-length view → the upload says the size it needs. He leaves a required detail empty → Save names the field.

### UJ-4. The owner changes the try-on model after complaints about borders

1. The Dashboard shows "2 to review" (`AdminDashboard`). He opens Reports and sees a result with the face hidden beside the real photo: the gold border came out silver (`AdminAIReports`).
2. In Prompts he opens the saree prompt, adds a line about the border metal, and runs a test on a sample model photo (`AdminPrompts`).
3. **Climax:** version 7 and version 8 sit side by side on the same saree, and version 8 has the gold border. He can see the fix before any Shopper does.
4. He publishes version 8. In Models and routing he could also change the order of models or switch one off (`AdminAI`).
5. If results get worse, History has "Restore" on the earlier version.

**Failure paths:** he wants a model from a company not named in the consent notice → the model stays off until a new notice version is published (`AdminConsent`).

### UJ-5. The owner prepares the home screen for Pongal

1. In App content he opens Home and selects the Banner carousel Block (`AdminContent`).
2. He replaces the image, edits the label and headline, chooses the category it opens, and sets the dates.
3. He checks the phone preview, taps "Preview on my phone", then "Schedule".
4. **Climax:** on the morning of the festival the banner is on every phone, and no new app version was released.

**Failure paths:** he dislikes it → Published versions restores the earlier one. An older app does not know a Block → it is skipped and the rest shows.

### UJ-6. A shopper withdraws consent

1. She opens Profile, then Privacy and consent (`Profile`, `Privacy`). She sees which notice version she agreed to and what is stored: 1 photo, 6 pictures.
2. She taps "Withdraw consent". It is on this screen, no further away than giving consent was.
3. A dialog says what will happen: her photo and pictures are erased from Alar, and Alar asks each AI service that received them to erase them.
4. **Climax:** she confirms, and the photo and every picture are gone at once, with one line left: "Consent withdrawn on 27 November." Leaving was as easy as joining.
5. Next time she taps "Try it on", the Consent screen appears as if for the first time.

**Failure paths:** she is offline → the action is disabled with the reason. She wants one picture gone → "Delete" on that picture, without withdrawing.

## First-release scope decisions

The boards were first drawn with 14 things the PRD did not contain. The founder asked for a recommendation on each (2026-11-27) and these are the choices made, on three tests: does it make the app easier to use, can one builder ship it in the plan, and does it keep the promise of honesty. The PRD and the boards have been updated to match. Boards for the "later" items sit in the last row of the canvas.

| # | Feature | Decision | Why | PRD |
|---|---|---|---|---|
| 1 | Sign-in | **Mobile code first; email code as the second way.** No Google sign-in | SMS is what Indian shoppers expect; email covers the times an SMS does not arrive and costs nothing to send. A third-party login adds a dependency and a second consent screen for no gain | FR-26 |
| 2 | Wishlist | **In** | Expected in every shopping app, small to build, and gives a reason to sign in and come back | FR-66 |
| 3 | Coupon list in the Bag | **In** | Discount codes already exist; showing which ones apply removes guessing | FR-58 |
| 4 | Written reviews with photos | **Later.** Stars, ready-made tags and a private note now | Public text and photos need moderation every day; with about 100 Designs at launch there would be few reviews to show | FR-63 |
| 5 | Exchange for another colour | **Later** | It is a second stock workflow with money moving both ways; return and re-order covers the need | §6.2 |
| 6 | Notifications | **In, for Order events and "Try-on ready" only**, as push plus a list in the app | A Try-on takes about 15 seconds and the Shopper may leave; push brings her back. Free to send. No marketing push | FR-54 |
| 7 | WhatsApp updates | **Later** | Needs a business account, approved templates and a fee per message; SMS, email and push cover launch | §6.2 |
| 8 | "Tell me when it is back" | **Later** | Handwoven stock may never come back in the same design; a promise to notify would often be broken | §6.2 |
| 9 | "Only 3 left" | **In, as the true count at or below the Owner's level** | With about 10 Pieces of a Design it is real, useful information; it is never invented | FR-3, FR-56 |
| 10 | Staff accounts and roles | **Later.** One Owner at launch | Every Admin action is already recorded against a named account, so roles can be added without rework | FR-50 |
| 11 | Onboarding slides | **Out** | The app should open straight on Home; Try-on is explained at the moment she taps it | §6.2 |
| 12 | Delivery charge | **Free on every Order at launch**, as an Owner setting | One price with no late charge is the simplest honest offer at ₹1,500–5,000; the setting allows a threshold later | FR-56 |
| 13 | Birthday and marketing choices | **Marketing choice in, unticked. Birthday out** | The marketing choice is needed by law before any offer message; a birthday is data with no use yet | FR-54 |
| 14 | Men and Kids tabs on Home | **Hidden until a second department is live** | An empty tab is a dead end; the tabs appear by themselves when menswear is published | FR-65 |

While only one department is live, the Home tabs show its top categories (All, Silk, Cotton, Wedding) and the website bar shows Sarees, Silk, Cotton, Wedding, Offers, Try-on. When a second department is published, the tabs become departments.

## Open items

- Dark theme: not designed.
- Numbers shown on the boards are examples and become Owner settings: try-ons per day, AI spend limits, photo retention, code lifetime, return window.
- The wording of the try-on notice, the legal pages and the dated legal values are drafts for a lawyer and an accountant (see `docs/legal/`).
- Product photos on the boards are AI-made placeholders; real photographs replace every one before launch.
