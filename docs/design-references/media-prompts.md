# Image and video prompts for the design mockups

Prompts used to generate the placeholder media through Higgsfield.

**Status, 2026-11-27:** all of sections 1, 3, 4, 5 and 6, one close-up from
section 2 and video 1 from section 7 were generated from this session and are
in the design canvas. Web-sized copies are in
`_bmad-output/planning-artifacts/ux-designs/ux-saree-commerce-2026-11-27/.working/design-canvas/assets/`,
named by section and number. The originals (2k and 4k PNG) stay in the
founder's Higgsfield account.

Cost note: the unlimited Nano Banana Pro allowance does not apply when
Higgsfield is called from Claude Code; it applies in Claude chat, Cowork and
ChatGPT. From Claude Code each image costs 2 credits and a 5-second 1080p
Seedance 2.5 video costs 80. This run used 24 images and 1 video, 128 credits.
The model list reports Nano Banana Pro jobs under the internal name
`nano_banana_2`.

## Rule for using these images

These images are for design mockups, banners, category thumbnails and
marketing. **They must never be shown as the product photo of a saree that is
for sale.** A shopper who buys from an AI picture and receives something
different has been misled, and the PRD forbids it (FR-12, FR-34: the Owner
confirms that product photos show the true colour). Real photos of the real
sarees replace every placeholder before launch.

## Settings

| Use | Model | Aspect ratio | Resolution |
|---|---|---|---|
| Product card and product page | Nano Banana Pro | 4:5 | 2k |
| Category thumbnail | Nano Banana Pro | 4:5 (cropped to 5:6 in the app) | 1k |
| Home banner | Nano Banana Pro | 3:2 | 2k |
| Full-length saree view | Nano Banana Pro | 21:9 | 4k |
| Banner video | Seedance 2.5, mode `t2v` or `omni_reference` with a start image | 16:9 | 1080p, 5 seconds, audio off |

Add this line to the end of every image prompt:

> Photorealistic studio product photography, soft even daylight, true-to-life
> colours, sharp focus on the weave, no text, no logo, no watermark, no border,
> no jewellery brand marks.

## 1. Product photos, saree on a model (4:5)

One prompt per saree. Keep the wording after the colour description identical
so the set looks like one shoot.

**Base wording (append to each):**

> worn by an Indian woman in her early thirties, standing, three-quarter body
> from head to knee, relaxed natural pose, one hand lightly holding the pallu,
> calm friendly expression, hair tied back, minimal gold earrings, plain
> matching blouse. Saree draped in the Nivi style with neat front pleats and
> the pallu falling over the left shoulder so the border and pallu design are
> clearly visible. Seamless very light warm-grey studio backdrop, soft shadow
> on the floor only, camera at chest height, 85 mm lens look.

1. **Arani silk, maroon:** A deep maroon pure silk saree with a broad gold
   zari temple border (a row of small triangles) and a pallu with fine gold
   stripes,
2. **Kanchipuram silk, violet:** A rich violet Kanchipuram silk saree with a
   plain wide gold zari border and small gold buttas scattered on the body,
3. **Kanchipuram silk, emerald:** An emerald green Kanchipuram silk saree with
   a contrasting rani-pink border edged in gold zari and a pink pallu,
4. **Soft silk, peacock blue:** A peacock blue soft silk saree with a plain
   mustard-gold border and a lightly striped pallu,
5. **Kasavu cotton, ivory:** An off-white Kerala kasavu cotton saree with a
   red and gold border,
6. **Chettinad cotton, mustard:** A mustard yellow Chettinad cotton saree with
   a maroon checked border and a striped pallu,
7. **Tussar silk, rust:** A rust orange tussar silk saree with a bottle-green
   border and a textured matte finish,
8. **Banarasi silk, navy:** A navy blue Banarasi silk saree with gold floral
   brocade on the pallu and a narrow gold border,

## 2. Product photos, second and third images (4:5)

Run these for each saree in section 1, replacing the description.

- **Back view:** `[saree description] worn by the same woman, seen from behind,
  three-quarter body, the pallu spread across the back to show its full
  design.` Then the base wording without the pose sentence.
- **Fabric close-up:** `Extreme close-up of [saree description], filling the
  frame: the border meeting the body of the saree, individual threads and the
  zari texture visible, fabric lying flat with one soft fold, lit from the
  side to show the weave. No person.`
- **Folded:** `[saree description], neatly folded into a rectangle and placed on
  a very light warm-grey surface, border facing the camera, shot from directly
  above. No person.`

## 3. Full-length saree view (21:9, 4k)

> A complete unstitched saree laid perfectly flat and straight, shown from end
> to end in one frame, photographed from directly above: [saree description].
> The plain blouse piece is at the far left, the main body with its border
> runs along the middle, and the decorated pallu is at the far right. Both
> long edges are parallel to the frame, no folds, no wrinkles, no perspective
> distortion, even shadowless light, very light warm-grey surface visible as a
> thin margin all round. No person, no hands, no props.

A real saree is about five times longer than it is wide, wider than any ratio
the model offers, so this image shows a shortened saree. It is good enough to
design and test the zoom viewer; the real viewer needs a real photograph.

## 4. Category thumbnails (4:5, 1k)

> A single [category] folded neatly and standing upright against a seamless
> soft lavender backdrop (#EDE8FF), centred, soft even light, the border or
> main detail facing the camera. No person.

Replace `[category]` with each of:

- Sarees: `stack of three folded silk sarees in maroon, emerald and violet`
- Silk: `folded maroon silk saree with a gold zari border`
- Cotton: `folded off-white cotton saree with a red border`
- Wedding: `folded red and gold bridal silk saree`
- Festive: `folded mustard yellow silk saree with a maroon border`
- New in: `folded violet silk saree with gold buttas`
- Under ₹2,500: `folded pink cotton saree with a thin gold border`
- Shirts: `folded navy blue cotton men's shirt with the collar on top`
- Dhotis: `folded white cotton dhoti with a gold border`

## 5. Home banners (3:2, 2k)

Leave the left third of the frame calm and empty: the app places the headline
there.

1. **Pongal edit:**
   > Two Indian women in their thirties standing together and smiling, one in
   > a maroon silk saree with a gold border, one in an emerald silk saree with
   > a pink border, in a bright courtyard with a kolam on the floor and
   > sugarcane stalks behind them, morning light. The women are in the right
   > two-thirds of the frame; the left third is a plain softly blurred cream
   > wall.
2. **Wedding silks:**
   > An Indian woman in a red and gold bridal Kanchipuram silk saree, seated
   > gracefully, looking to the side, warm lamp light, a softly blurred
   > traditional carved wooden doorway behind her. She is in the right half of
   > the frame; the left half is dark and softly blurred.
3. **Everyday cottons:**
   > An Indian woman in a light mustard cotton saree walking and laughing in a
   > sunlit veranda with potted plants, natural candid feel. She is in the
   > right half of the frame; the left half is a plain pale wall.
4. **Try it on you** (for the try-on feature):
   > An Indian woman holding a phone at arm's length and smiling at the
   > screen, wearing a plain kurta, standing in a tidy bedroom in daylight; on
   > a chair beside her a folded violet silk saree. She is in the right half
   > of the frame; the left half is a plain pale wall.

## 6. Later category, menswear (4:5)

> A navy blue handloom cotton long-sleeved shirt with a spread collar worn by
> an Indian man in his late twenties, standing, from head to mid-thigh, hands
> relaxed, sleeves rolled once, black trousers, calm expression. Seamless very
> light warm-grey studio backdrop, soft shadow on the floor only.

## 7. Banner video (Seedance 2.5)

Settings: aspect ratio 16:9, duration 5, resolution 1080p, `generate_audio`
false. For the steadiest result, generate the still first with a banner prompt
from section 5, then use mode `omni_reference` with that image as the
`start_image`.

1. **Silk in motion** (text only, mode `t2v`):
   > A slow, smooth close-up of maroon silk fabric with a gold zari border
   > rippling gently as it is drawn across the frame from right to left, soft
   > daylight catching the weave, shallow depth of field, very light grey
   > background. One continuous shot, no cuts, no text, no people, no logo.
2. **Pongal banner comes alive** (with banner 1 as the start image):
   > The two women stay in place and smile; a light breeze moves the ends of
   > their sarees and the leaves behind them; the camera pushes in very
   > slowly. Natural, calm motion. No new objects, no text, no cuts.

## Not yet generated

Back view and folded view for each saree (section 2), close-ups for the other
seven sarees, and video 2 (Pongal banner with a start image). Run them when a
screen needs them.
