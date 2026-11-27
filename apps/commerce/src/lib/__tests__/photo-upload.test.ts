import { describe, expect, it } from "vitest"
import multer from "multer"
import { uploadReasonOf } from "../photo-upload"

describe("uploadReasonOf", () => {
  it("names the limit a multipart error hit", () => {
    expect(uploadReasonOf(new multer.MulterError("LIMIT_FILE_SIZE", "files"))).toBe("too_large")
    expect(uploadReasonOf(new multer.MulterError("LIMIT_FILE_COUNT", "files"))).toBe("too_many_files")
    expect(uploadReasonOf(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "files"))).toBe("too_many_files")
    expect(uploadReasonOf(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "other"))).toBe("unexpected_field")
    expect(uploadReasonOf(new multer.MulterError("LIMIT_FIELD_COUNT", "note"))).toBe("unexpected_field")
    expect(uploadReasonOf(new Error("Unexpected end of form"))).toBe("unreadable")
  })
})
