import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { detectImageType, imageExtension } from "../image-type"

const bytes = (...values: number[]) => Uint8Array.from(values)
const ascii = (text: string) => Uint8Array.from([...text].map((c) => c.charCodeAt(0)))

describe("detectImageType", () => {
  it("recognises JPEG, PNG and WebP by their first bytes", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg")
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe("image/png")
    expect(detectImageType(ascii("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp")
  })

  it("recognises the sample saree photos", () => {
    const file = join(__dirname, "../../../../mobile/public/mock/1-1-maroon.jpg")
    expect(detectImageType(readFileSync(file))).toBe("image/jpeg")
  })

  it("refuses anything else", () => {
    expect(detectImageType(ascii("GIF89a......"))).toBeNull()
    expect(detectImageType(ascii("%PDF-1.7"))).toBeNull()
    expect(detectImageType(ascii("RIFF\0\0\0\0WAVE"))).toBeNull()
    expect(detectImageType(bytes())).toBeNull()
    expect(detectImageType(bytes(0xff, 0xd8))).toBeNull()
  })

  it("gives each type its extension", () => {
    expect(imageExtension("image/jpeg")).toBe("jpg")
    expect(imageExtension("image/png")).toBe("png")
    expect(imageExtension("image/webp")).toBe("webp")
  })
})
