import { describe, expect, it } from "vitest"

import { computeRecapStats } from "./stats"

import type { Photo } from "@/entities/photo"

function makePhoto(overrides: Partial<Photo> & Pick<Photo, "date">): Photo {
  return {
    id: `p-${overrides.date}-${overrides.region ?? "서울"}`,
    lat: 0,
    lng: 0,
    thumbnailUrl: "",
    uploaderId: "u1",
    region: "서울",
    potId: "pot-1",
    ...overrides,
  }
}

describe("computeRecapStats", () => {
  it("사진이 없으면 0일·0개 지역", () => {
    expect(computeRecapStats([])).toEqual({
      totalDays: 0,
      regionCount: 0,
      pinCount: 0,
    })
  })

  it("기간 사진은 date~endDate 전체를, 겹치는 날짜는 한 번만 센다", () => {
    const stats = computeRecapStats([
      makePhoto({ date: "2026-08-01", endDate: "2026-08-03", region: "서울" }),
      makePhoto({ date: "2026-08-02", region: "강릉" }),
      makePhoto({ date: "2026-08-10", region: "부산" }),
    ])
    expect(stats).toEqual({ totalDays: 4, regionCount: 3, pinCount: 3 })
  })

  it("지역별 방문 횟수를 한 번씩 계산한다", () => {
    expect(
      computeRecapStats([
        makePhoto({ date: "2026-07-01", region: "서울" }),
        makePhoto({ date: "2026-07-05", region: "서울" }),
        makePhoto({ date: "2026-08-10", region: "부산" }),
      ])
    ).toMatchObject({ regionCount: 2, pinCount: 3 })
  })
})
