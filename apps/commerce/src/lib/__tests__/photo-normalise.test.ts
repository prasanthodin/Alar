import { describe, expect, it } from "vitest"
import sharp from "sharp"
import { normalisePhoto } from "../photo-normalise"

/** True when an EXIF block has a GPS section (the GPSInfo pointer, tag 0x8825, in either byte order). */
function hasGps(exif: Buffer | undefined): boolean {
  return !!exif && (exif.includes(Buffer.from([0x88, 0x25])) || exif.includes(Buffer.from([0x25, 0x88])))
}

/** A small photo with GPS position and camera details in its EXIF, rotated by its orientation tag. */
async function phonePhoto(format: "jpeg" | "png" | "webp") {
  return sharp({ create: { width: 40, height: 20, channels: 3, background: { r: 128, g: 0, b: 32 } } })
    .withMetadata({ orientation: 6 })
    .withExif({
      IFD0: { Make: "PhoneMaker", Model: "Phone 9" },
      IFD3: { GPSLatitudeRef: "N", GPSLatitude: "12/1 58/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "77/1 35/1 0/1" },
    })
    .toFormat(format)
    .toBuffer()
}

describe("normalisePhoto", () => {
  it.each([
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["webp", "image/webp"],
  ] as const)("re-encodes a %s in the same format with no EXIF, GPS or device details", async (format, type) => {
    const input = await phonePhoto(format)
    const before = await sharp(input).metadata()
    expect(hasGps(before.exif)).toBe(true)
    expect(input.includes(Buffer.from("PhoneMaker"))).toBe(true)
    const out = await normalisePhoto(input, type)
    expect(out?.type).toBe(type)
    const meta = await sharp(out!.bytes).metadata()
    expect(meta.format).toBe(format)
    expect(meta.exif).toBeUndefined()
    expect(meta.xmp).toBeUndefined()
    expect(out!.bytes.includes(Buffer.from("PhoneMaker"))).toBe(false)
  })

  it("turns the photo upright from its EXIF orientation", async () => {
    const out = await normalisePhoto(await phonePhoto("jpeg"), "image/jpeg")
    const meta = await sharp(out!.bytes).metadata()
    expect([meta.width, meta.height]).toEqual([20, 40])
    expect(meta.orientation).toBeUndefined()
  })

  it("refuses a fake JPEG, a type that differs from the bytes and non-images", async () => {
    const fake = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from("not really a photo".repeat(20))])
    expect(await normalisePhoto(fake, "image/jpeg")).toBeNull()
    expect(await normalisePhoto(await phonePhoto("png"), "image/jpeg")).toBeNull()
    expect(await normalisePhoto(Buffer.from("GIF89a000000"), "image/gif")).toBeNull()
  })
})
