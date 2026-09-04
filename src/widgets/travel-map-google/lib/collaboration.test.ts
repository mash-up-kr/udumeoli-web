import { describe, expect, it } from "vitest"

import {
  buildCollaborationTrips,
  findLatestCompletedTrip,
  findLatestMissingMineTrip,
  latestTripByRegion,
  mostPickedKeyword,
  resolveRegionAction,
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
  it("한 지역의 대표 여행 하나만 이모지 대상으로 노출한다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("third", "강릉시", "2026-09-01", "user-1", {
          keyword: "FOOD",
        }),
        photo("second", "강릉시", "2026-08-01", "user-1", {
          keyword: "DESSERT",
        }),
        photo("first", "강릉시", "2026-07-01", "user-1", {
          keyword: "PHOTO",
        }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(visibleStickerTrips(trips).map((trip) => trip.key)).toEqual([
      "강릉시|2026-09-01|2026-09-01",
    ])
  })

  it("회차는 지역 전체 여행 기준 — 팟원만 기록한 여행도 회차를 차지하고 노출된다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        // 중복 데이터가 있어도 지역 대표 기록 하나만 지도에 노출한다
        photo("first-me", "강릉시", "2026-07-01", "user-1", {
          keyword: "PHOTO",
        }),
        photo("second-other", "강릉시", "2026-08-01", "m-1", {
          keyword: "DESSERT",
        }),
        photo("third-me", "강릉시", "2026-09-01", "user-1", {
          keyword: "FOOD",
        }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(visibleStickerTrips(trips).map((trip) => trip.key)).toEqual([
      "강릉시|2026-09-01|2026-09-01",
    ])
  })

  it("내가 기록하지 않은 팟원 여행에도 스티커를 노출한다 — 색칠(팟 전체 기준)과 일치", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("mine", "강릉시", "2026-08-01", "user-1", {
          keyword: "FOOD",
        }),
        photo("other", "동해시", "2026-09-01", "m-1", {
          keyword: "DESSERT",
        }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(visibleStickerTrips(trips).map((trip) => trip.region)).toEqual([
      "동해시",
      "강릉시",
    ])
  })
})

describe("resolveRegionAction", () => {
  // 강릉: 1차 여행은 전원 완료, 2차(최신) 여행은 나만 기록 — 스티커가 2개 뜨는 상태
  const 강릉 = () =>
    buildCollaborationTrips({
      photos: [
        photo("first-me", "강릉시", "2026-07-01", "user-1", {
          keyword: "FOOD",
        }),
        photo("first-1", "강릉시", "2026-07-01", "m-1"),
        photo("first-2", "강릉시", "2026-07-01", "m-2"),
        photo("second-me", "강릉시", "2026-09-01", "user-1", {
          keyword: "DESSERT",
        }),
      ],
      members,
      currentUserId: "user-1",
    })

  it("완료된 과거 여행 스티커를 눌러도 최신 여행이 미완료면 다음 여행을 열지 않는다", () => {
    const trips = 강릉()
    const past = trips.find((t) => t.startDate === "2026-07-01")
    expect(past?.isComplete).toBe(true)

    // 과거 여행이 아니라 지역의 최신 여행으로 판정해야 한다
    const latest = latestTripByRegion(trips).get("강릉시")
    expect(
      resolveRegionAction({
        latestTrip: latest,
        zoomStage: 3,
        applyZoomGate: false,
      })
    ).toBe("view-records")
  })

  it("최신 여행이 완료면 기존 기록을 연다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("me", "강릉시", "2026-07-01", "user-1"),
        photo("one", "강릉시", "2026-07-01", "m-1"),
        photo("two", "강릉시", "2026-07-01", "m-2"),
      ],
      members,
      currentUserId: "user-1",
    })
    const latest = latestTripByRegion(trips).get("강릉시")
    expect(
      resolveRegionAction({
        latestTrip: latest,
        zoomStage: 3,
        applyZoomGate: true,
      })
    ).toBe("view-records")
  })

  it("기록 중인 지역도 기존 기록 시트를 연다", () => {
    const trips = buildCollaborationTrips({
      photos: [photo("other", "강릉시", "2026-07-01", "m-1")],
      members,
      currentUserId: "user-1",
    })
    const latest = latestTripByRegion(trips).get("강릉시")
    expect(
      resolveRegionAction({
        latestTrip: latest,
        zoomStage: 3,
        applyZoomGate: true,
      })
    ).toBe("view-records")
  })

  it("완료된 지역은 내가 기록하지 않았어도 기존 기록을 연다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("other-1", "강릉시", "2026-07-01", "m-1"),
        photo("other-2", "강릉시", "2026-07-01", "m-2"),
        photo("other-3", "강릉시", "2026-07-01", "user-1"),
      ],
      members,
      currentUserId: "outside-user",
    })
    const latest = latestTripByRegion(trips).get("강릉시")
    expect(
      resolveRegionAction({
        latestTrip: latest,
        zoomStage: 3,
        applyZoomGate: true,
      })
    ).toBe("view-records")
  })

  it("줌 3단계 미만 폴리곤 클릭은 미완료 지역에서 아무 반응이 없다", () => {
    const trips = buildCollaborationTrips({
      photos: [photo("other", "강릉시", "2026-07-01", "m-1")],
      members,
      currentUserId: "user-1",
    })
    const latest = latestTripByRegion(trips).get("강릉시")
    expect(
      resolveRegionAction({
        latestTrip: latest,
        zoomStage: 2,
        applyZoomGate: true,
      })
    ).toBe("ignore")
    // 스티커처럼 명시적으로 누른 경로는 같은 줌에서도 반응한다
    expect(
      resolveRegionAction({
        latestTrip: latest,
        zoomStage: 2,
        applyZoomGate: false,
      })
    ).toBe("view-records")
  })

  it("기록이 없는 지역은 바로 등록 플로우로 보낸다", () => {
    expect(
      resolveRegionAction({
        latestTrip: undefined,
        zoomStage: 1,
        applyZoomGate: true,
      })
    ).toBe("start-record")
  })
})

describe("mostPickedKeyword", () => {
  it("제일 많이 뽑힌 키워드를 반환한다 (하트 2번 / 빵 1번 → 하트)", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("newest", "속초시", "2026-09-01", "user-1", { keyword: "FOOD" }),
        photo("mid", "동해시", "2026-08-01", "user-1", { keyword: "DESSERT" }),
        photo("old", "강릉시", "2026-07-01", "user-1", { keyword: "DESSERT" }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(mostPickedKeyword(trips)).toBe("DESSERT")
  })

  it("개수가 동일하면 가장 최근 여행의 키워드를 고른다", () => {
    const trips = buildCollaborationTrips({
      photos: [
        photo("new", "동해시", "2026-08-01", "user-1", { keyword: "FOOD" }),
        photo("old", "강릉시", "2026-07-01", "user-1", { keyword: "DESSERT" }),
      ],
      members,
      currentUserId: "user-1",
    })

    expect(mostPickedKeyword(trips)).toBe("FOOD")
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

describe("buildCollaborationTrips 성능 리팩터링 동등성", () => {
  // 최적화 전 구현(정렬 기반)을 그대로 옮겨온 기준 — 결과가 갈리면 실패한다
  function referenceBounds(photos: Array<Photo>) {
    const value = (date: string) => {
      const time = Date.parse(date)
      return Number.isFinite(time) ? time : 0
    }
    const dates = photos.flatMap((p) => [p.date, p.endDate ?? p.date])
    const sorted = [...dates].sort((a, b) => value(a) - value(b))
    const latest = [...photos].sort((a, b) => value(b.date) - value(a.date))[0]
    return {
      startDate: sorted[0] ?? "",
      endDate: sorted[sorted.length - 1] ?? "",
      representativePhotoId: latest.id,
    }
  }

  it("여행 100개에서 기간·대표 사진·정렬 결과가 기존 구현과 같다", () => {
    const regions = ["강릉시", "동해시", "속초시", "양양군", "평창군"]
    const photos: Array<Photo> = []
    for (let i = 0; i < 100; i++) {
      const region = regions[i % regions.length]
      const month = String((i % 12) + 1).padStart(2, "0")
      const day = String((i % 28) + 1).padStart(2, "0")
      const date = `2026-${month}-${day}`
      // 같은 여행에 여러 명이 올린 사진 — 종료일이 있는 사진도 섞는다
      photos.push(
        photo(`p-${i}-a`, region, date, "user-1", { endDate: date }),
        photo(`p-${i}-b`, region, date, "m-1"),
        photo(`p-${i}-c`, region, date, "m-2")
      )
    }

    const trips = buildCollaborationTrips({
      photos,
      members,
      currentUserId: "user-1",
    })

    expect(trips.length).toBeGreaterThan(0)
    for (const trip of trips) {
      const expected = referenceBounds(trip.photos)
      expect({
        startDate: trip.startDate,
        endDate: trip.endDate,
        representativePhotoId: trip.representativePhoto.id,
      }).toEqual(expected)
    }

    // 최신 여행 우선 정렬도 그대로
    const endValues = trips.map((trip) => Date.parse(trip.endDate))
    expect([...endValues].sort((a, b) => b - a)).toEqual(endValues)
  })
})
