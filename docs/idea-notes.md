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
- Backend: Medusa (commerce) + Payload (CMS), TypeScript on Postgres, plus a
  separate try-on worker. Accepted by the founder on 2026-11-27 from the
  technical research recommendation, subject to the one-week spike it
  recommends (Razorpay provider, stock hold for one-of-a-kind pieces, Payload
  block rendered in the app with preview).
- Price band: about Rs 1,500 to 5,000 (founder, 2026-11-27, confirming the
  market research suggestion).
- Prices shown to shoppers are always whole rupees, never decimals.
- Launch region: South India first.
- MVP is prepaid only. Cash on delivery is out of the MVP and comes later.
- Try-on is for adults only at first.
- Before try-on the shopper must be shown a clear declaration that their
  photo is processed by AI models, and must accept the terms and conditions.
  (The founder's dictated words were "process emails"; read here as the
  shopper's images. To confirm.)
- Sarees come directly from weaver families. The founder names this as the
  main difference from other apps.
- The founder builds the product alone using cloud AI agents; a team comes
  later.
- App name: Alar. It may change, so the product must make renaming easy.
- The founder's own family weaves sarees, and so do family friends. Today
  they give their sarees to a dealer. The main agenda is to cut out the
  dealer and sell directly to customers.
- Launch catalogue: about 100 saree designs, about 10 pieces of each.
- Launch within one to two months at most, including all testing.
- Hosting: Oracle Cloud free tier for testing and deployment. For AWS-style
  services in development, the free AWS emulator the founder named
  (dictated as "Flowsys"; read here as Floci, a free LocalStack replacement).
  To confirm.

## AI controls the admin must have (founder, 2026-11-27)
- Image-model routing is admin-managed: which model serves try-on, with the
  ability to switch models without a code release.
- OpenRouter is the preferred way to reach image models over one API.
- Prompts sent to the models are admin-editable.
- In general every AI setting is customisable and controllable from admin.
- Repeated emphasis: everything is to be built to production level.

Notes from a quick check of OpenRouter's public docs (search extracts, not
read in full; verify before the architecture relies on them):
- OpenRouter has a unified image API; reference images are passed as input
  references, honoured only by models that support image input, with limits
  that vary by model. Its model list endpoint reports which parameters each
  model supports.
- OpenRouter documents a zero-data-retention routing option, but nothing
  found says which image models qualify. Shopper photos would pass through
  OpenRouter and the model provider, which matters for consent and retention.
- Self-hosted or fine-tuned models and dedicated try-on APIs (for example
  FASHN) are not reached through OpenRouter, so the try-on worker should
  treat OpenRouter as the default provider behind an interface, not the only
  one.

## Not yet decided
- Where sarees are sourced; which languages at launch.
- Which shipping provider.
- Budget and team size.
