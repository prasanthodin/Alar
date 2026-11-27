# Idea notes (founder's own words, condensed)

Input for BMAD research and planning. Records what the founder has said so far;
nothing here is validated yet.

## Product
- Fashion e-commerce for India, similar in kind to Myntra / Flipkart, clothing only.
- Starts with sarees. Men's shirts, pants and other clothing follow later.
- Mobile apps for Android and iOS are the main target; a web site as well.

## What makes it different
1. AI try-on: the user uploads a full-length photo; an image-generation model
   shows that user wearing the chosen saree, realistically, before buying.
2. Full saree view: the complete saree, top to bottom, as one image the user can
   open, scroll and inspect to see the whole design.
Intended flow: view the design, try it on, then purchase. Same for other
clothing later.

## Platform requirements stated
- Server-driven UI (SDUI) for the apps.
- Backend language is open: Django, Go, Rust or anything else that responds
  fast is acceptable. Java is excluded. (Earlier the founder named Django;
  that is now a candidate, not a requirement.)
- Whatever stack is chosen must come with an open-source CMS and the related
  admin tooling.
- Microservices are acceptable, including gRPC between services.
- Payments via Razorpay (account exists). Shipping via a delivery API
  (credentials exist).
- Production-level inventory management: product image upload, and variants
  such as colour and size (a shirt has many sizes and colours), stock per
  variant.
- AI prompts and their governance manageable from admin.
- User management, and everything operational manageable from admin.
- Backend, AI model integration and database schema designed for production.

## Process requirements stated
- Use the BMAD method (installed in this repo), not an imitation of it.
- Thorough research, including market research, before any development.
- Then PRD, epics and stories.

## Decided
- Own inventory (the business holds the stock); not a marketplace.

## Not yet decided
- Backend stack, CMS and commerce core (for technical research to recommend).
- Where sarees are sourced; price band; launch region and languages.
- Cash on delivery or prepaid only.
- Which shipping provider.
- Budget and team size.
