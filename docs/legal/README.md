# Customer-facing legal and policy drafts

> **Draft, not yet reviewed by a lawyer.** Effective date: {{EFFECTIVE_DATE}}

**These are unreviewed first drafts and are not legal or tax advice.** They were written so that development is not blocked. Do not publish them until a lawyer and an accountant have checked them. They are grounded in the compliance research (`_bmad-output/planning-artifacts/research/domain-india-compliance-saree-tryon-app-2026-11-27/research.md`) and the PRD (`_bmad-output/planning-artifacts/prds/prd-saree-commerce-2026-11-27/prd.md`). Several rules the drafts rely on were not read in official text by the research (the E-Commerce Rules, the Legal Metrology rules, the GST rate notification, the DPDP commencement notification); the research's staleness map says to re-check regulatory status before acting.

## Files

| File | What it is |
|---|---|
| `terms-of-use.md` | The agreement with the shopper: eligibility, sign-in, orders, prices, the Hold, delivery, Try-on rules, liability, complaints, governing law. |
| `privacy-policy.md` | What data is collected, why, who receives it, retention, rights, deletion, breach, complaints. |
| `try-on-consent-notice.md` | The standalone notice shown before the first Try-on: short screen version, full "read more" version, exact button and tick-box wording. |
| `returns-refunds-cancellation-policy.md` | Cancellation, return window, accepted reasons, conditions, inspection, rejection, refunds. |
| `shipping-policy.md` | Delivery region, pincode check, estimates, charges, failed delivery, damaged parcels. |
| `grievance-redressal.md` | Grievance Officer, how to complain, ticket and time limits, escalation routes. |

## Placeholders to fill (14)

| Placeholder | Meaning |
|---|---|
| `{{SHOP_NAME}}` | Product name (working name: Alar). |
| `{{LEGAL_ENTITY_NAME}}` | Registered name of the seller. |
| `{{REGISTERED_ADDRESS}}` | Registered address. |
| `{{GSTIN}}` | GST registration number. |
| `{{GRIEVANCE_OFFICER_NAME}}` | Named grievance officer. |
| `{{GRIEVANCE_EMAIL}}` | Grievance email. |
| `{{GRIEVANCE_PHONE}}` | Grievance phone. |
| `{{SUPPORT_EMAIL}}` | General support email. |
| `{{RETURN_WINDOW_DAYS}}` | Return window in days from delivery. Suggested default: **7**. PRD Open Question 4. |
| `{{EFFECTIVE_DATE}}` | Date each document takes effect. |
| `{{AI_SERVICE_LIST}}` | Every AI service that can receive a Shopper photo: OpenRouter plus each model provider on the Approved-model list. |
| `{{JURISDICTION_CITY}}` | City whose courts hear disputes. |
| `{{WEBSITE_URL}}` | Website address (added while drafting; used for the web account-deletion page). |
| `{{NCH_CONTACT}}` | Current National Consumer Helpline contact details (added while drafting; not in the research file, so not written in). |

## Points for the lawyer and accountant to confirm

Each working assumption below is an assumption to be confirmed, not settled law.

### From the research file's open questions

| # | Question | Who | Document and clause affected | Working assumption in the drafts |
|---|---|---|---|---|
| 1 | Is an unstitched saree above Rs 2,500 still taxed at 5% after September 2025? Pre-stitched sarees and blouse sets? | Accountant | Terms 5.1; Returns 1 (prices and refunds). No rate is stated to shoppers. | Unstitched sarees are 5% at any price as fabric; stitched blouses and pre-stitched sarees follow the garment rule (5% up to Rs 2,500 per piece, 18% above). Policies say only "prices include applicable taxes". |
| 2 | GST on COD fees; credit-note deadline | Accountant | Returns 9 (refunds). COD is not offered, so no COD wording appears. | No COD at launch. Each refund is backed by a credit note linked to the invoice; the deadline does not change shopper wording. Also confirm treatment of shipping charges that are refunded or deducted (Returns 4.2, 5.3). |
| 3 | Do the synthetic-content labelling rules bind the shop? | Lawyer | Terms 11.5 to 11.7; Notice B8; Privacy 3 | Every Try-on result is labelled AI-generated and provenance data is kept, whether or not the rules apply. The drafts do not say the rules apply. |
| 4 | What age check is sufficient; is self-declared age enough? | Lawyer | Terms 2.2, 2.3, 11.3; Privacy 10; Notice A tick box and B7 | Age is self-declared (18 or older) with a confirmation step; no document check. The shop may suspend Try-on and delete photos if it has reason to believe the user is under 18. |
| 5 | How to treat a photo of someone other than the shopper | Lawyer | Terms 11.4, 11.9, 11.11; Privacy 14; Grievance 4.3; Notice B7 | Prohibited. A depicted person can ask for removal through the grievance contact without an account; the shop removes it without proof beyond a reasonable description. |
| 6 | One-year log retention versus erasure for photos | Lawyer | Privacy 7, 11.4; Notice B6 | Photos and results are deleted after 30 days unused, on withdrawal, or on account deletion. Access logs, which never contain the photo, are kept one year. The one-year rule is read as not requiring the photo itself to be kept. |
| 7 | Do OpenRouter's standard terms count as a valid processor contract? | Lawyer | Privacy 5 ("work under their own published terms"; "we stay responsible"); Notice B4 | OpenRouter's and the model providers' standard terms are treated as the processor contract for now. |
| 8 | Which privacy rules apply to photos before May 2027 | Lawyer | Privacy 4.5 and the whole policy; Notice | The drafts follow the DPDP Act and Rules from the effective date, as if in force. The interim rules were not read by the research; confirm nothing more is needed (for example extra wording for sensitive data). |
| 9 | Is a sealed-pack saree a pre-packaged commodity? | Lawyer | Terms 4.1 (what a Design page states). Mostly affects product pages and tags, not these policies. | Design pages show maker, consumer-care contact, dimensions, price and origin in any case. No packaged-commodity wording is included. |
| 10 | Return-policy wording for worn items and refused COD parcels | Lawyer | Returns 4, 5, 8; Shipping 8.1 | "No return" never applies to not-as-shown, defective or wrong items. Other returns need the saree unworn, unwashed, unaltered, with tags; a brief drape to look at it is allowed. No COD wording. |
| 11 | Which OpenRouter image models are zero-retention | OpenRouter support or live model list | Privacy 5; Notice B4 (statements on training, logging, no-retention); `{{AI_SERVICE_LIST}}` | Only models that do not keep photos for training are approved; logging is off; a no-retention option is used "where a service offers one". The drafts do not promise zero retention at providers. These statements must match actual settings before publishing. |
| 12 | Google's Gemini usage policy on real-person edits | Read in a browser | Terms 11.9 (prohibited uses); `{{AI_SERVICE_LIST}}` | Prohibited uses were drafted from the store rules and OpenAI's policy. If a Google model is listed, check its policy and add any missing restriction. |

### Further points raised while drafting (not in the research file)

| # | Point | Who | Document and clause | Working assumption |
|---|---|---|---|---|
| 13 | Legal basis for non-photo data: is "data given for a stated purpose" a sound "legitimate use" for sign-in, orders, delivery and usage counts, or is consent needed? | Lawyer | Privacy 3 (basis column), 4.2, 4.3 | Consent for photos only; everything else rests on data voluntarily given for the purpose, or a legal duty. |
| 14 | Limitation of liability: is a cap at the order value, and the exclusion of unforeseeable loss, enforceable and fair in a consumer contract? | Lawyer | Terms 14.3 to 14.5 | Cap at the amount paid for the Order, with carve-outs for defective or misdescribed goods, fraud, and death or injury. |
| 15 | Jurisdiction clause against a consumer | Lawyer | Terms 16.2, 16.3 | Courts at `{{JURISDICTION_CITY}}`, without limiting any consumer forum the law allows. |
| 16 | Is the list of data rights complete under the DPDP Act and Rules (the research lists access, processor list, correction, erasure, withdrawal, grievance)? Is one month, against the 90 days in the Rules, a wise promise? | Lawyer | Privacy 9; Grievance 5 | Only the rights named in the research are listed. One month is used for all complaints, matching the consumer rule. |
| 17 | Notice languages: how many scheduled languages must be offered | Lawyer | Notice (builder notes); Terms 18.3 | English plus launch languages (PRD Open Question 3); English prevails for the terms. Confirm whether "English prevails" may apply to the consent notice (the draft does not apply it there). |
| 18 | Price-error cancellation | Lawyer | Terms 5.6 | The shop may cancel before dispatch and refund in full. |
| 19 | Whether Try-on being free and "not part of what you pay for" holds | Lawyer | Terms 11.8, 14.6 | Try-on is a free aid, not part of the goods sold. |

### Decisions for the founder (business choices the drafts had to assume)

| Decision | Document and clause | Draft position |
|---|---|---|
| Return window | All uses of `{{RETURN_WINDOW_DAYS}}` | 7 days from delivery suggested. |
| Change-of-mind returns: who pays shipping | Returns 5.3 | Original shipping not refunded; a return shipping charge may be deducted, shown before the shopper confirms. |
| Rejected returns: who pays to send the saree back | Returns 8.2 | The shop sends it back; no charge is stated. |
| Exchanges | Returns 9.5 | Not offered. |
| Refusing a visibly damaged parcel | Shipping 8.1 | Allowed; treated as undeliverable and refunded. |
| Lost parcels | Shipping 9 | Full refund once the shipping service confirms the loss. |
| Screen labels | Notice A and B9 | "Account > Try-on consent", "Withdraw consent", "Request return" are working labels. |

## Keeping these in step with the product

- The numbers come from the PRD: 30-day photo retention, 10 Try-on results a day, 15-minute Hold, refunds started within 2 working days, 48-hour acknowledgement and one-month resolution, 24-hour erasure, 5-minute message for automatic refunds, sign-in code rules. If the PRD changes, change the documents.
- A new version of the Try-on consent notice makes every shopper accept again (PRD FR-59). Change it deliberately.
- If cash on delivery, iOS, new regions or under-18 Try-on are added, these documents need new sections and a fresh review.
