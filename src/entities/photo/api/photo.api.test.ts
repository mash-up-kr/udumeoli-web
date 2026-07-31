import { afterEach, describe, expect, it } from "vitest"

import {
  fetchPhotos,
  removeSeedPhotosByUploader,
  resetUtPhotos,
  seedUtPhotos,
} from "./photo.api"

describe("removeSeedPhotosByUploader", () => {
  afterEach(() => {
    resetUtPhotos()
  })

  it("UT 시드 사진 중 삭제된 업로더의 사진만 제외한다", async () => {
    resetUtPhotos()
    seedUtPhotos()

    const before = await fetchPhotos()
    expect(before.some((photo) => photo.uploaderId === "user-1")).toBe(true)
    expect(before.some((photo) => photo.uploaderId !== "user-1")).toBe(true)

    removeSeedPhotosByUploader("user-1")

    const after = await fetchPhotos()
    expect(after.some((photo) => photo.uploaderId === "user-1")).toBe(false)
    expect(after.some((photo) => photo.uploaderId !== "user-1")).toBe(true)
  })
})
