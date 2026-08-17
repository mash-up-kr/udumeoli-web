import { describe, expect, it } from "vitest"

import { formatTripRange, groupTrips } from "./trips"
import type { Photo } from "../model/types"

function photo(
  id: string,
  date: string,
  uploaderId = "user-1",
  extra: Partial<Photo> = {}
): Photo {
  return {
    id,
    date,
    uploaderId,
    region: "창원시",
    potId: "pot-1",
    lat: 0,
    lng: 0,
    thumbnailUrl: "",
    ...extra,
  }
}

describe("groupTrips", () => {
  it("연속된 날짜는 방문 1회로 묶이고, 하루 이상 벌어지면 분리된다 (최신 먼저)", () => {
    const trips = groupTrips([
      photo("d", "2026-05-02"),
      photo("a", "2026-07-20"),
      photo("c", "2026-07-21"),
      photo("b", "2026-07-21"),
    ])
    expect(trips.map((t) => [t.startDate, t.endDate])).toEqual([
      ["2026-07-20", "2026-07-21"],
      ["2026-05-02", "2026-05-02"],
    ])
    expect(trips[0].photos).toHaveLength(3)
  })

  it("tripId가 있으면 연속된 날짜라도 다른 방문으로 분리한다", () => {
    const trips = groupTrips([
      photo("first-me", "2026-07-01", "user-1", {
        tripId: "trip-1",
        endDate: "2026-07-02",
      }),
      photo("first-other", "2026-07-01", "user-2", {
        tripId: "trip-1",
        endDate: "2026-07-02",
      }),
      photo("second", "2026-07-03", "user-1", {
        tripId: "trip-2",
      }),
    ])

    expect(trips.map((t) => [t.tripId, t.startDate, t.endDate])).toEqual([
      ["trip-2", "2026-07-03", "2026-07-03"],
      ["trip-1", "2026-07-01", "2026-07-02"],
    ])
  })

  it("tripId가 없는 기간 사진도 endDate를 방문 종료일로 사용한다", () => {
    const trips = groupTrips([
      photo("range", "2026-08-01", "user-1", {
        endDate: "2026-08-03",
      }),
    ])

    expect(trips).toHaveLength(1)
    expect(trips[0]).toMatchObject({
      startDate: "2026-08-01",
      endDate: "2026-08-03",
    })
  })
})

describe("formatTripRange", () => {
  it("당일·기간·연도 걸침을 각각 표기한다", () => {
    expect(
      formatTripRange({ startDate: "2026-07-20", endDate: "2026-07-20" })
    ).toBe("2026년 7월 20일")
    expect(
      formatTripRange({ startDate: "2026-07-20", endDate: "2026-07-22" })
    ).toBe("2026년 7월 20일 ~ 7월 22일")
    expect(
      formatTripRange({ startDate: "2025-12-31", endDate: "2026-01-01" })
    ).toBe("2025년 12월 31일 ~ 2026년 1월 1일")
  })
})
