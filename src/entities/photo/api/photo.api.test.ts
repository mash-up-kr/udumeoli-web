import { afterEach, describe, expect, it } from "vitest"

import {
  fetchPhotos,
  removeSeedPhotosByUploader,
  resetUtPhotos,
  seedUtPhotos,
  tripToPhotos,
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

describe("tripToPhotos", () => {
  const trip = {
    id: "trip-1",
    regionCode: "11",
    createdAt: "2026-07-01T09:30:00Z",
    records: [
      {
        member: { id: "user-1" },
        recorded: true,
        keyword: "FOOD" as const,
        comment: "맛집 투어",
        image: { id: "img-1", originalUrl: "o1", thumbnailUrl: null },
      },
      {
        member: { id: "user-2" },
        recorded: false,
        keyword: null,
        comment: null,
        image: null,
      },
    ],
  }

  it("recorded=true인 record만 Photo로 평면화한다", () => {
    const photos = tripToPhotos(trip, "pot-1")
    expect(photos).toHaveLength(1)
    expect(photos[0]).toMatchObject({
      id: "trip-1:user-1",
      tripId: "trip-1",
      imageId: "img-1",
      uploaderId: "user-1",
      region: "서울특별시", // REGION_NAME_BY_CODE["11"]
      keyword: "FOOD",
      comment: "맛집 투어",
      // 여행 기간이 없어져 핀 등록일(createdAt)의 날짜 부분이 시간축이다
      date: "2026-07-01",
      thumbnailUrl: "o1", // 썸네일 null이면 원본 폴백
      potId: "pot-1",
    })
  })

  it("키워드는 핀이 아니라 올린 사람의 기록에서 가져온다", () => {
    const other = {
      ...trip,
      records: [{ ...trip.records[0], keyword: "DESSERT" as const }],
    }
    expect(tripToPhotos(other, "pot-1")[0].keyword).toBe("DESSERT")
  })
})
