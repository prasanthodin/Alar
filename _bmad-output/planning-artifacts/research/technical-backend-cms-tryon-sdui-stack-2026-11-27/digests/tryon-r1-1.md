# Digest tryon-r1-1: AI saree try-on approaches

Accessed 2026-11-27. 23 tool calls (17 web searches, 3 curl batches).

**How to read this.** Page fetching was blocked, so evidence is of two kinds:

- **Fetched**: seven GitHub READMEs read directly through raw.githubusercontent.com.
- **Extract**: a web-search summary of the page, not the page itself. No provider pricing or policy page was read first-hand.

Every price below is therefore an extract, and most come from third-party aggregators. Model names that appear only in aggregators (GPT Image 2.5/2.6, "gemini-nano-banana-2.1", Qwen-Image 2.1/3.0, Seedream 5.0, "FLUX 3 Image") are unverified against the provider.

## Options

| Name | Type | Version and date | Commercial licence | Price per image | Latency | Saree evidence | Source |
|---|---|---|---|---|---|---|---|
| Google Gemini image models ("Nano Banana" family) | General model, API | Gemini 3.1 Flash Image ("Nano Banana 2") and Gemini 3 Pro Image named in an Oct 2026 guide; gemini-2.5-flash-image reported retired 2026-10-02. Exact current ID unverified. | API terms (commercial) | Aggregator figures: $0.045–0.151 (3.1 Flash Image, $0.067 at 1K); $0.134 at 1K/2K and $0.24 at 4K (3 Pro Image); $0.0336 (Flash Lite Image). Not read from Google's page. | Not found | Strongest practitioner signal: three saree projects use Gemini image models (anupam-tryon, cybercodeedulabs, a muapi workflow). anupam-tryon reports border/pallu flattening without prompt work. No measured data. | developer.puter.com (extract); anupam-tryon README (fetched) |
| OpenAI GPT Image | General model, API | gpt-image-2 and "2.5/2.6" named by aggregators; gpt-image-1.5 reported deprecated, shutdown 2026-12-01. Current flagship unverified. | API terms (commercial) | Token-billed. Aggregator estimates for gpt-image-2 at 1024²: $0.006 low, $0.053 medium, $0.211 high. | Not found | One muapi workflow pairs it with Nano Banana for ethnic wear. No results published. | costgoat.com and others (extract) |
| Qwen-Image-Edit-2511 | Open weights, general multi-reference editor | Released 2025-12-23 | Apache-2.0 per ai-trial-room README. A separate extract says the newer "Qwen Image 2.1" is under a research licence that bars commercial use (unverified). | Self-host GPU cost. Hosted Qwen edit $0.03–0.075 (aggregator). | ~1–4 min on a T4 (ai-trial-room presets). ~75 s in one hosted workflow (floyo, anecdotal). | Primary backend of ai-trial-room for sarees and lehengas. Limits stated there: Nivi drape competent, Nauvari poor; border geometry drifts; fine zari softens. | QwenLM/Qwen-Image README, ai-trial-room README (both fetched) |
| FLUX.2 [klein] 4B | Open weights, general multi-reference editor | Released 2026-01-15 | Apache-2.0 for 4B and 4B Base. 9B and FLUX.2 [dev] are non-commercial. | Self-host. Hosted FLUX.2 [pro] edit ~$0.03 per megapixel on fal (aggregator). | "Sub-second on consumer GPUs" (BFL claim) | Fast tier and LoRA-training base in ai-trial-room. No saree results published. | black-forest-labs/flux2 README (fetched) |
| FASHN Try-On v1.6 / Try-On Max | Dedicated try-on API | v1.6 (864×1296). Try-On Max at 1k/2k/4k (~1/4/16 MP). Release dates not retrieved. | Commercial API | v1.6 $0.075 pay-as-you-go, ~$0.049 at volume; Max $0.30 (several vendor blogs agree; FASHN's page not read) | v1.6: ~5 s / 8 s / 12–17 s by mode. Max: ~10 s (fast, 1k) to ~55 s (quality, 4k). From FASHN docs extract. | Categories are tops, bottoms, one-pieces. No saree mention found. Competitor CatalogX calls it weak on sarees and lehengas (biased, single source). | docs.fashn.ai (extract) |
| FASHN VTON v1.5 | Open weights, dedicated try-on | Date not retrieved | Apache-2.0 (the human-parser dependency has its own licence; check it) | Self-host, ~2 GB weights | Not stated | None. Maskless, pixel-space; accepts flat-lay or model garment shots. | fashn-AI/fashn-vton-1.5 README (fetched) |
| Kling Virtual Try-On 3.0 | Dedicated try-on API | Released 2026-09-15 per Kling changelog. Kolors V1/V1.5 reported retired or deprecated on fal and ComfyUI the same date. | Commercial API | 32 units × $0.0035 = ~$0.112 at 1K (Kling developer page extract). Resellers $0.05–0.07, possibly the legacy model. | Not found | None found | kling.ai/dev/model/image, kling.ai/document-api/updates/api (extracts) |
| Google Vertex AI Virtual Try-On | Dedicated try-on API | virtual-try-on-001. **Scheduled retirement 2027-01-20** (another rendering of the doc says 2027-03-15). No dedicated successor found; proposed replacements are Gemini image models. | Commercial API (GCP) | ~$0.06 (third-party; one source flags it as an old snapshot) | Not found | None. Clothing only; up to 4 outputs; SynthID watermark; weaker on hem length for long garments (one source). | GoogleCloudPlatform/vertex-ai-creative-studio issue #1891 (extract) |
| Amazon Nova Canvas try-on | Dedicated try-on API (Bedrock) | Version and date not retrieved | Commercial API (AWS) | $0.04 standard 1024², $0.06 premium; $0.06/$0.08 at 2048² (third-party and an AWS sample cost table) | Not found | None. Garment masks for upper body, lower body, full body, footwear (Claid blog). Official garment-class docs not retrieved. | aws-solutions-library-samples guidance repo, claid.ai (extracts) |
| IDM-VTON, CatVTON, OOTDiffusion | Open weights, dedicated try-on | 2024-era; successors not checked | CC BY-NC-SA 4.0, **non-commercial** (per ai-trial-room README; repos not read directly) | n/a | n/a | Trained on Western-cut datasets; used only as a research baseline in ai-trial-room | ai-trial-room README (fetched) |
| Leffa | Open weights, dedicated try-on | Released 2024-12; last README update 2025-01 | Licence not retrieved | Self-host | 6 s on an A100 | None. Trained on VITON-HD and DressCode. | franciszzj/Leffa README (fetched) |
| TryVastra.ai, TryOnCloud, Perfect Corp YouCam "Sari" API, Genlook, VERA, VastramAI, CatalogX, PatternAI | Vendors claiming Indian wear | Not stated | Commercial SaaS/API | Genlook $0.02 (own claim). Others not found. | Not found | Marketing claims only; no test data on any page. YouCam's sari page contains a "hanbok" copy error, suggesting a template. | Vendor pages (extracts) |

## Claims

| Claim | Source URL | Publisher | pub_date | accessed | confidence | class |
|---|---|---|---|---|---|---|
| A saree cannot be handled by garment-warping try-on models, because the worn shape depends on how the cloth is wrapped; reference-based editing with drape-specific prompts is the workable route. | https://raw.githubusercontent.com/Satya141/ai-trial-room/main/README.md | Satya141 (individual, 0 stars) | repo pushed 2026-09-28 | 2026-11-27 | Medium: a reasoned practitioner claim, not a measurement | saree-fit |
| Open try-on models are trained mostly on frontal poses and Western-cut garments, and draped Indian garments break that assumption. | https://raw.githubusercontent.com/jainjashvardhan/anupam-tryon/main/README.md | jainjashvardhan (individual) | unknown | 2026-11-27 | Medium: agrees with the row above and with BD-VITON | saree-fit |
| Saree-type garments (complex draping, asymmetric layering, high deformation) are under-represented in VITON data; fine-tuning on a 1,013-image cultural dataset (332 sarees) beats zero-shot. Metric values not retrieved. | https://arxiv.org/abs/2603.07291 | arXiv preprint (not peer-reviewed) | 2026-03-07 | 2026-11-27 | Medium: abstract-level only | saree-fit |
| General image models flatten mixed-motif saree borders and pallus into a generic floral border unless the prompt names the components. | anupam-tryon README (above) | jainjashvardhan | unknown | 2026-11-27 | Low-medium: single source, "from real shop use", no data | failure-mode |
| With Qwen-Image-Edit-2511, colour and motif transfer well but border geometry and print placement drift; fine zari and mirror work soften; seated or turned poses and arm occlusion degrade results; a full-length photo is needed or the lower body is hallucinated; skin tone needs checking. | ai-trial-room README (above) | Satya141 | 2026-09-28 | 2026-11-27 | Medium: single source, but a detailed self-reported limits table | failure-mode |
| Qwen-Image 2.1 can add a yellowish cast and grain. | https://floyo.ai/workflows/qwen-image-2-1-outfit-swap-g241en6u0qss | Floyo (vendor) | unknown | 2026-11-27 | Low: anecdotal extract | failure-mode |
| Published mitigations in one pipeline: pose plus human parsing, component-naming drape prompts with per-drape negatives, a second pallu-only pass composited through a mask, a face paste-back blend, colour-statistics matching, and automatic output checks (garment unchanged, background drift, face missing). | ai-trial-room README (above) | Satya141 | 2026-09-28 | 2026-11-27 | Medium: design described, effectiveness not measured | failure-mode |
| A drape LoRA trained on single draped photos improves drape shape but not print fidelity; only paired before/after data teaches garment transfer. | ai-trial-room README (above) | Satya141 | 2026-09-28 | 2026-11-27 | Low-medium: single source | failure-mode |
| An alternative design avoids generating the shopper: warp a flat saree onto fixed studio-model poses with per-pose hand-made masks and staff-marked border and pallu regions, then a diffusion polish; ~100 s for 3 poses. This does not put the saree on the customer. | https://raw.githubusercontent.com/KerithPaul/Sarees-VTON/main/README.md | KerithPaul (individual) | repo pushed 2026-10-22 | 2026-11-27 | Medium: fetched, hobby-scale | other |
| IDM-VTON, CatVTON and OOTDiffusion are CC BY-NC-SA 4.0; FLUX.1 Kontext dev is non-commercial. | ai-trial-room README (above) | Satya141 | 2026-09-28 | 2026-11-27 | Medium: second-hand; original repos blocked | model |
| FLUX.2 [klein] 4B and 4B Base are Apache-2.0 and support multi-reference editing; 9B and [dev] are non-commercial. klein released 2026-01-15, [dev] 2025-11-25. | https://raw.githubusercontent.com/black-forest-labs/flux2/main/README.md | Black Forest Labs | 2026-01-15 | 2026-11-27 | High | model |
| Qwen-Image-Edit-2511 weights were released 2025-12-23 and accept multiple input images. | https://raw.githubusercontent.com/QwenLM/Qwen-Image/main/README.md | Alibaba Qwen | 2025-12-23 | 2026-11-27 | High for date; licence is second-hand (Apache-2.0 per ai-trial-room) | model |
| FASHN VTON v1.5 is Apache-2.0, maskless, ~2 GB, and takes flat-lay or model garment photos. | https://raw.githubusercontent.com/fashn-AI/fashn-vton-1.5/main/README.md | FASHN | unknown | 2026-11-27 | High | model |
| FASHN v1.6 runs at 864×1296 in ~5 to 17 s; Try-On Max outputs 1 to 16 MP in ~10 to 55 s. | https://docs.fashn.ai/api-reference/tryon-v1-6 and https://docs.fashn.ai/api-reference/tryon-max | FASHN | unknown | 2026-11-27 | Medium: official docs, extract only | latency |
| FASHN v1.6 costs $0.075 per image pay-as-you-go; Try-On Max $0.30. | https://fal.ai/learn/tools/best-virtual-try-on-apis-2026 and https://genlook.app/developers/vs/fashn | fal; Genlook (competitor) | 2026 | 2026-11-27 | Medium: two third-party sources agree | pricing |
| Kling Virtual Try-On is billed at 32 units per 1K image at $0.0035 per unit (~$0.112). | https://kling.ai/dev/model/image | Kling | unknown | 2026-11-27 | Medium: official page, extract only; conflicts with reseller prices | pricing |
| Kling released Virtual Try-On 3.0 on 2026-09-15 with better face consistency, compatible with V1/V1.5 parameters. | https://kling.ai/document-api/updates/api | Kling | 2026-09-15 | 2026-11-27 | Medium | model |
| Vertex virtual-try-on-001 retires 2027-01-20 (checked 2026-09-18 by the issue author); suggested replacements are Gemini image models, which are prompt-based editing and not a drop-in. | https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/issues/1891 | Google Cloud repo issue | 2026-09 | 2026-11-27 | Medium: two extracts agree on retirement, differ on date | model |
| Gemini image pricing spans roughly $0.034 to $0.24 per image by model and resolution. | https://developer.puter.com/tutorials/gemini-api-pricing/ | Puter (third party) | 2026-10 | 2026-11-27 | Low-medium: not from Google's page | pricing |
| Nova Canvas costs $0.04 (standard 1024²) to $0.08 (premium 2048²) per image. | https://github.com/aws-solutions-library-samples/guidance-for-virtual-try-ons-on-aws | AWS samples | unknown | 2026-11-27 | Medium | pricing |
| FASHN deletes API outputs after three days; base64 outputs expire after 60 minutes; request history stores placeholders, not images. Input-image lifetime is not stated. Moderation has "permissive" and "conservative" modes (the latter blocks swimwear and underwear). | https://docs.fashn.ai/api-overview/data-retention-privacy | FASHN | unknown | 2026-11-27 | Medium | policy |
| OpenAI terms bar reproducing a person's likeness without express consent and all necessary rights; developers should not process data of children under 13 without zero data retention; ZDR needs approval. | https://openai.com/policies/service-terms/ and https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance | OpenAI | unknown | 2026-11-27 | Medium: extract only | policy |
| Google's image API has separate block reasons for child content and for person/face detection when request settings do not allow them. | https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/gemini-image-responsible-ai | Google Cloud | unknown | 2026-11-27 | Medium: extract only | policy |
| FID/KID measure dataset-level realism and do not verify that the specific garment was transferred; SSIM/LPIPS need paired ground truth that is absent in deployment. | https://arxiv.org/html/2603.13057 (VTON-IQA) and https://arxiv.org/pdf/2602.17636 (CORAL) | arXiv | 2026-02 to 2026-03 | 2026-11-27 | Medium-high: two papers agree | evaluation |
| Practice: FID/KID for realism; LPIPS or DreamSim on the garment region for garment fidelity and on the non-garment region for person preservation; forced-choice user studies (for example 100 samples with 50 raters; 57 raters); newer work adds VLM or learned judges (OpenVTON-Bench, VTON-IQA). No single standard protocol. | https://arxiv.org/pdf/2406.15331, https://arxiv.org/pdf/2601.22725 | arXiv | 2024 to 2026 | 2026-11-27 | Medium | evaluation |
| Universal image editors are competitive with dedicated try-on on conventional cases but struggle with multi-garment reference set-ups. | https://arxiv.org/html/2603.14153v1 | arXiv | 2026-03 | 2026-11-27 | Low-medium: extract; paper not identified by title | other |

## Contradictions

- **Vertex try-on retirement date**: 2027-01-20 in one rendering of Google's page, 2027-03-15 in another. Either way it retires within months of today.
- **Kling try-on price**: ~$0.112 on Kling's developer page versus $0.05–0.07 on resellers, which may be quoting the retired Kolors model.
- **Kling legacy status**: Kling's changelog says no deprecation plan for the legacy API; fal, ComfyUI and a status site say Kolors try-on was retired or deprecated on 2026-09-15.
- **Qwen licence**: Qwen-Image-Edit-2511 is described as Apache-2.0; a separate extract says "Qwen Image 2.1" is research-licensed and bars commercial use. These may be different models; neither licence file was read.
- **Gemini 2.5 Flash Image price**: $0.039 in most sources, $0.015 in one June 2026 article. The model is reported retired, so this is moot.
- **Current flagship names**: aggregators disagree on whether OpenAI's current image model is GPT Image 2, 2.5 or 2.6.
- **FASHN Try-On Max latency**: 10–55 s in FASHN docs versus 20–120 s in a competitor's article.
- **Vertex upload cap**: 7 MB versus 10 MB.
- **Nova Canvas scope**: garments plus footwear (Claid) versus clothing, accessories and furniture (MindStudio).
- **Warping versus editing**: ai-trial-room says warping models cannot do sarees, yet concedes they hold border placement better than editing models on garments they can handle.

## Leads

- Read first-hand, since all were blocked here: ai.google.dev/gemini-api/docs/pricing, the OpenAI pricing and data-controls pages, the Kling developer pricing page, the AWS Bedrock pricing and Nova Canvas try-on docs, fashn.ai pricing.
- BD-VITON full text (arXiv 2603.07291) for saree-specific metric tables and failure figures.
- OpenVTON-Bench (arXiv 2601.22725) and VTON-IQA (arXiv 2603.13057) as ready-made evaluation frameworks.
- ai-trial-room's `compare_backends.py` and its datasets guide: a ready harness for a saree bake-off between Qwen-Image-Edit-2511, FLUX.2 klein 4B and CatVTON.
- Other saree repos surfaced but not read: dshivasaivarun-lgtm/saree-regional-draping-vton (regional drape classification), PrajwalSdharani36/Pallu-Saree-TryOn, cybercodeedulabs/virtual-saree-try-on (staff-corrected border/pallu detection).
- Licences to confirm at source: Qwen-Image-Edit-2511, Leffa, fashn-human-parser, and whether Kling Try-On 3.0 or FASHN Try-On Max accept sarees at all.
- India-specific law (DPDP Act consent and children's data) was outside this brief's searches and matters for the minors question.

## Looked for, not found

- Any independent, measured comparison of general image models or try-on APIs on sarees (border continuity, pallu motif, colour). Only vendor marketing and hobby repos exist.
- Any model card or provider doc that explicitly lists sarees, lehengas or dupattas as unsupported. Exclusion is implied by category lists (tops, bottoms, one-pieces), never stated.
- A public saree try-on dataset for Indian drapes, or a released saree LoRA or fine-tune. BD-VITON (Bangladeshi, 332 sarees) is the nearest; its availability and licence were not confirmed.
- Latency figures for Gemini, GPT Image, Vertex try-on, Nova Canvas and Kling Try-On 3.0.
- Provider statements on full-body photos being blocked by safety filters. One GitHub issue mentions swimwear input moderation on a try-on app; nothing about ordinary full-length photos.
- Google Gemini API terms on data retention, uploads of real people, and under-18 users (only forum questions, unanswered).
- OpenAI's retention window for image inputs.
- A dedicated successor to Vertex virtual-try-on-001.
- Published prices or docs for any Indian-wear vendor API other than Genlook's own $0.02 claim.
- A second independent source for "FASHN is weak on sarees" (only competitor CatalogX says so).

## Blocked hosts

- All non-GitHub hosts were unreachable for page reads and were used only through search extracts: ai.google.dev, docs.cloud.google.com, openai.com, developers.openai.com, kling.ai, docs.fashn.ai, fashn.ai, aws.amazon.com, arxiv.org, fal.ai, huggingface.co, and vendor sites.
- api.github.com: the `/repos/<owner>/<repo>` endpoint was refused for five repos ("GitHub access to this repository is not enabled for this session"); the search endpoint worked.
- raw.githubusercontent.com: worked, except Zheng-Chong/CatVTON `main/README.md`, which returned nothing (branch name or block not determined).
