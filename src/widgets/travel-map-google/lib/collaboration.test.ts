import { describe, expect, it } from "vitest"

import {
  buildCollaborationTrips,
  findLatestCompletedTrip,
  findLatestMissingMineTrip,
  mostPickedKeyword,
  visibleStickerTrips,
} from "./collaboration"
import type { Photo } from "@/entities/photo"
import type { PotMember } from "@/entities/travel-pot"

const members: Array<PotMember> = [
  { id: "user-1", nickname: "정민", profileImageUrl: null },
  { id: "m-1", nickname: "경일", profileImageUrl: null },
  { id: "m-2", nickname: "민지", profileImageUrl: null },
]

function photo(
  id: string,
  region: string,
  date: string,
  uploaderId: string,
  extra: Partial<Photo> = {}
): Photo {
  return {
    id,
    region,
    date,
    uploaderId,
    lat: 37,
    lng: 128,
    thumbnailUrl: `https://example.com/${id}.jpg`,
    potId: "pot-1",
    ...extra,
  }
}

describe("buildCollaborationTrips", () => {
  it("내가 아직 기록하지 않은 최신 미완료 여행을 찾는다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("old", "강릉시", "2026-07-01", "user-1"),
        photo("new", "동해시", "2026-08-01", "m-1", {
          endDate: "2026-08-02",
        }),
      ],
      members,
      currentUserId: "user-1",
    })

    const missing = findLatestMissingMineTrip(trips)
    expect(missing?.region).toBe("동해시")
    expect(missing?.startDate).toBe("2026-08-01")
    expect(missing?.endDate).toBe("2026-08-02")
    expect(missing?.uploadedCount).toBe(1)
    expect(missing?.totalMembers).toBe(3)
  })

  it("팟원 전원이 기록한 여행을 완료 상태로 본다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("me", "강릉시", "2026-08-01", "user-1"),
        photo("one", "강릉시", "2026-08-01", "m-1"),
        photo("two", "강릉시", "2026-08-01", "m-2"),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(findLatestCompletedTrip(trips)?.region).toBe("강릉시")
    expect(trips[0]?.isComplete).toBe(true)
  })

  it("최신 여행이 미완료여도 이전 완료 여행을 찾는다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("new-other", "강릉시", "2026-08-01", "m-1"),
        photo("old-me", "양양군", "2026-07-01", "user-1"),
        photo("old-one", "양양군", "2026-07-01", "m-1"),
        photo("old-two", "양양군", "2026-07-01", "m-2"),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(trips[0]?.region).toBe("강릉시")
    expect(findLatestCompletedTrip(trips)?.region).toBe("양양군")
  })
})

describe("visibleStickerTrips", () => {
  it("내가 기록한 같은 지역 여행은 최신 두 개까지만 이모지 노출 대상으로 반환한다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("third", "강릉시", "2026-09-01", "user-1", {
          keyword: "bread",
        }),
        photo("second", "강릉시", "2026-08-01", "user-1", {
          keyword: "nature",
        }),
        photo("first", "강릉시", "2026-07-01", "user-1", {
          keyword: "shopping",
        }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(visibleStickerTrips(trips).map((trip) => trip.key)).toEqual([
      "강릉시|2026-09-01|2026-09-01",
      "강릉시|2026-08-01|2026-08-01",
    ])
  })

  it("내가 아직 기록하지 않은 여행은 스티커 노출 대상에서 제외한다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("mine", "강릉시", "2026-08-01", "user-1", {
          keyword: "bread",
        }),
        photo("other", "동해시", "2026-09-01", "m-1", {
          keyword: "nature",
        }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(visibleStickerTrips(trips).map((trip) => trip.region)).toEqual([
      "강릉시",
    ])
  })
})

describe("mostPickedKeyword", () => {
  it("제일 많이 뽑힌 키워드를 반환한다 (하트 2번 / 빵 1번 → 하트)", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("newest", "속초시", "2026-09-01", "user-1", { keyword: "bread" }),
        photo("mid", "동해시", "2026-08-01", "user-1", { keyword: "nature" }),
        photo("old", "강릉시", "2026-07-01", "user-1", { keyword: "nature" }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(mostPickedKeyword(trips)).toBe("nature")
  })

  it("개수가 동일하면 가장 최근 여행의 키워드를 고른다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("new", "동해시", "2026-08-01", "user-1", { keyword: "bread" }),
        photo("old", "강릉시", "2026-07-01", "user-1", { keyword: "nature" }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(mostPickedKeyword(trips)).toBe("bread")
  })

  it("키워드가 없는 여행만 있으면 undefined를 반환한다", () => {
    const trips = buildCollaborationTrips({
      photos: [photo("no-keyword", "강릉시", "2026-07-01", "user-1")],
      members,
      currentUserId: "user-1",
    })

    expect(mostPickedKeyword(trips)).toBeUndefined()
  })
})
