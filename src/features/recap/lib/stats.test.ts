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
      // 서울 2박 3일 (08-01 ~ 08-03)
      makePhoto({ date: "2026-08-01", endDate: "2026-08-03", region: "서울" }),
      // 같은 기간에 겹치는 강릉 당일 — 날짜는 중복 없이, 지역만 추가
      makePhoto({ date: "2026-08-02", region: "강릉" }),
      // 떨어진 부산 당일
      makePhoto({ date: "2026-08-10", region: "부산" }),
    ])
    expect(stats).toEqual({ totalDays: 4, regionCount: 3, pinCount: 3 })
  })
})
