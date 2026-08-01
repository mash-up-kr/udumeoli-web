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

    // 목 모드는 potId를 무시하므로 아무 값이나 전달
    const before = await fetchPhotos("pot-ut-1")
    expect(before.some((photo) => photo.uploaderId === "user-1")).toBe(true)
    expect(before.some((photo) => photo.uploaderId !== "user-1")).toBe(true)

    removeSeedPhotosByUploader("user-1")

    const after = await fetchPhotos("pot-ut-1")
    expect(after.some((photo) => photo.uploaderId === "user-1")).toBe(false)
    expect(after.some((photo) => photo.uploaderId !== "user-1")).toBe(true)
  })
})
