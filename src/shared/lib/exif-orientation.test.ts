import { describe, expect, it } from "vitest"

import { readJpegOrientation } from "./exif-orientation"

// SOI + APP1("Exif\0\0" + TIFF IFD0에 Orientation 태그 하나)로 구성한 최소 JPEG
function jpegWithOrientation(
  orientation: number,
  littleEndian: boolean
): ArrayBuffer {
  const tiff = new Uint8Array(26)
  const view = new DataView(tiff.buffer)
  view.setUint16(0, littleEndian ? 0x4949 : 0x4d4d) // "II" | "MM"
  view.setUint16(2, 42, littleEndian)
  view.setUint32(4, 8, littleEndian) // IFD0 오프셋
  view.setUint16(8, 1, littleEndian) // 엔트리 1개
  view.setUint16(10, 0x0112, littleEndian) // Orientation 태그
  view.setUint16(12, 3, littleEndian) // SHORT 타입
  view.setUint32(14, 1, littleEndian)
  view.setUint16(18, orientation, littleEndian) // SHORT 값은 앞 2바이트
  const payload = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff] // "Exif\0\0"
  const bytes = new Uint8Array([
    0xff,
    0xd8, // SOI
    0xff,
    0xe1, // APP1
    (payload.length + 2) >> 8,
    (payload.length + 2) & 0xff,
    ...payload,
  ])
  return bytes.buffer
}

describe("readJpegOrientation", () => {
  it("리틀엔디언 EXIF에서 orientation을 읽는다", () => {
    expect(readJpegOrientation(jpegWithOrientation(6, true))).toBe(6)
  })

  it("빅엔디언 EXIF에서 orientation을 읽는다", () => {
    expect(readJpegOrientation(jpegWithOrientation(8, false))).toBe(8)
  })

  it("EXIF 없는 JPEG(SOS로 직행)는 null", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0x00, 0x02])
    expect(readJpegOrientation(bytes.buffer)).toBeNull()
  })

  it("JPEG가 아니면 null", () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]) // PNG 시그니처
    expect(readJpegOrientation(bytes.buffer)).toBeNull()
  })
})
