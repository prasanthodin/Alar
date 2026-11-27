---
title: 'Product brief: Alar, weaver-direct sarees with AI try-on'
status: draft
created: '2026-11-27'
updated: '2026-11-27'
---

# Product brief: Alar

_Working name; see Constraints._

Items marked **[ASSUMPTION]** were proposed by the analyst, not stated by the founder, and are open to correction.

## Executive summary

Alar is a mobile-first shop that sells sarees directly to women in South India, at about Rs 1,500 to 5,000 each. The sarees are woven by the founder's own family and by weaver families the founder knows. Today those sarees reach buyers through a dealer; Alar removes the dealer. It holds its own stock and sells nothing it has not sourced itself.

Buying a saree online today is an act of faith. Research for this brief found the category large (about US$12 billion) and mostly unbranded, with online buyers complaining that colour and fabric do not match the photo and that sarees sold as "pure silk" sometimes are not. Alar answers with three things: sarees whose origin it can name, a full saree view so the buyer sees every part of the design, and an AI try-on that shows the buyer herself wearing it before she pays. Try-on is unproven and ships only if it passes a pre-launch fidelity test.

The first version is built and run by one person using AI coding agents. That constraint shapes everything: a narrow catalogue, one region, prepaid orders only, bought-in components wherever one exists, and a launch date that gives way to scope and quality.

## The problem

A woman choosing a saree in a shop has it draped on her shoulder, sees the pallu and border opened out, and feels the fabric. Online she gets a few photos of a model. She cannot tell how it will look on her, cannot see the whole design, and cannot be sure the colour or the fabric claim is true. When the parcel disappoints, returns are slow and trust is gone.

Weaver families, the founder's own among them, hand their sarees to a dealer and have no direct route to these buyers.

## The solution

- **Weaver-direct catalogue.** Every saree is woven by the founder's family or a weaver family the founder knows personally, and the listing says who wove it.
- **Full saree view.** One continuous, zoomable image of the entire saree, end to end.
- **AI try-on.** An adult shopper uploads a full-length photo, accepts a clear declaration that the photo is processed by AI models, and receives an image of herself in the chosen saree. Results are labelled as AI-generated and are never the only picture of the product.
- **A shop the owner can run alone.** Catalogue, stock, content, screen layouts, AI models and prompts, orders and returns are all managed from the admin without a code release.

## What makes this different

1. **Provenance.** The founder's family weaves these sarees. That is a real advantage and one competitors cannot copy quickly. It counts only if the buyer can see it: who wove it, where, and what the fabric is.
2. **Imagery the buyer can trust.** True colour, the whole design, and a faithful drape.
3. **Try-on on the buyer's own photo, for sarees.** No large Indian platform was found offering this for sarees, though small apps claim to. This is a hypothesis, not a proven advantage: no model has yet been shown to drape a saree faithfully, and no evidence shows try-on raises saree sales.

If try-on turns out only average, provenance and trustworthy imagery must carry the product on their own.

## Who this serves

**[ASSUMPTION] Primary buyer.** A woman of 28 to 45 in a South Indian city such as Chennai, Bengaluru, Hyderabad or Coimbatore. She buys sarees for festivals, family functions and work, already pays by UPI, and today buys from a trusted local shop or an Instagram seller because she does not trust marketplace listings. She would pay Rs 1,500 to 5,000 for a saree she believes is genuine.

**Secondary.** The weaver families, who gain a direct channel, and the owner, who must be able to run the whole business from the admin.

## Success criteria

**[ASSUMPTION] Proposed targets for the six months after launch; no benchmark supports these numbers, so treat them as a starting point.**

| Signal | Target |
|---|---|
| Paid orders | 100 a month by month six |
| "Matched what I saw" rating from buyers | 4.5 out of 5 or better |
| Returns for "not as shown" | Under 5% of orders |
| Repeat buyers within 90 days | 20% |
| Product-page visitors who use try-on | 30% |
| Total try-on spend divided by orders placed | Under Rs 25 |
| Owner time to list a new saree | Under 15 minutes |

**Launch gate for try-on.** Before launch, one test decides whether try-on ships at all: real sarees and real photos, rated by saree buyers for border, pallu and colour fidelity.

## Scope

**In the first version**
- Sarees only, weaver-direct, own stock: about 100 designs at launch with about 10 pieces of each, roughly 1,000 sarees.
- Delivery within South India only; prepaid payment through Razorpay; one shipping provider.
- Whole-rupee, tax-inclusive prices for the shopper; exact tax on the invoice.
- Catalogue, full saree view, try-on for adults with consent, cart, checkout, orders, returns.
- The admin as described above, plus user management; OpenRouter is the first AI provider.
- Website and Android app, with server-driven home, category, product layout and campaign screens.
- **[ASSUMPTION]** iOS follows once the Android app is stable.

**Out of the first version**
- Cash on delivery, other clothing categories, other sellers, try-on for under-18s, regions beyond South India.

## Constraints

- **One builder.** No team; AI coding agents do the building. Every component must be one a single person can operate.
- **Full scope over a fast launch.** The founder first wanted to launch within one to two months, then chose to keep the whole scope and extend the time. **[ASSUMPTION]** The analyst's estimate for one builder is four to six months; it is an estimate, not a commitment.
- **Thin slice first.** A single saree bought end to end (listed, paid for, shipped, returned) must work before any breadth is added.
- **Lowest-cost hosting.** Oracle Cloud's free tier for testing and first deployment.
- **Production grade.** Payments, stock, consent and deletion must be correct from day one, not added later.
- **Renameable.** The product name appears only in configuration and content. The app-store identifier cannot be changed after publishing, so it must not contain the product name.

## What is not yet known

- Whether any AI model drapes a saree faithfully from the shop's product photo.
- Whether buyers want the full saree view.
- What margin the sarees carry once the dealer is removed.
- The budget for try-on images, hosting and marketing.
- Whether Oracle's free tier is dependable enough to take real payments on.
- Whether an unstitched saree above Rs 2,500 is still taxed at 5% (for an accountant).
- Whether India's AI-image labelling rules apply to a shop (for a lawyer).

## Vision

If it works, Alar becomes the place a buyer goes for a saree she can trust: more weaving regions, cash on delivery, iOS, then other clothing with colour and size variants, and eventually a direct, named channel for weavers across India.
