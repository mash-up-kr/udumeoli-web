import { describe, expect, it } from "vitest"

import { UT_PHOTOS } from "./photo.ut"

const BASE_REGION_COUNT = 7
const DESIGN_PREVIEW_KEYS = new Set([
  "pot-ut-1/강릉시",
  "pot-ut-1/대전광역시",
  "pot-ut-1/서울특별시",
])

// 팟·지역별로 사진을 그룹핑
function groupByPotRegion() {
  const groups = new Map<string, typeof UT_PHOTOS>()
  for (const p of UT_PHOTOS) {
    const key = `${p.potId}/${p.region}`
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  return groups
}

describe("UT_PHOTOS", () => {
  it("세 팟 모두 기본 7개 지역이 시드되고, 기본 팟은 강릉 미리보기 지역을 포함한다", () => {
    const regionsByPot = new Map<string, Set<string>>()
    for (const p of UT_PHOTOS) {
      if (!regionsByPot.has(p.potId)) regionsByPot.set(p.potId, new Set())
      regionsByPot.get(p.potId)!.add(p.region)
    }
    expect(regionsByPot.size).toBe(3)
    expect(regionsByPot.get("pot-ut-1")?.size).toBe(BASE_REGION_COUNT + 1)
    expect(regionsByPot.get("pot-ut-1")?.has("강릉시")).toBe(true)
    expect(regionsByPot.get("pot-ut-2")?.size).toBe(BASE_REGION_COUNT)
    expect(regionsByPot.get("pot-ut-3")?.size).toBe(BASE_REGION_COUNT)
  })

  it("기본 팟·지역별 고유 일자는 최소 3개다", () => {
    for (const [key, group] of groupByPotRegion()) {
      const dateCount = new Set(group.map((p) => p.date)).size
      if (DESIGN_PREVIEW_KEYS.has(key)) {
        expect(dateCount).toBeGreaterThanOrEqual(1)
      } else {
        expect(dateCount).toBe(3)
      }
    }
  })

  it("기존 UT 지역의 가장 최근 일자에는 나(user-1)를 제외한 멤버 3인 전원이 업로드돼 있다", () => {
    for (const [key, group] of groupByPotRegion()) {
      if (DESIGN_PREVIEW_KEYS.has(key)) continue
      const latest = group.reduce((a, b) => (a.date >= b.date ? a : b)).date
      const uploaders = group
        .filter((p) => p.date === latest)
        .map((p) => p.uploaderId)
      expect(uploaders).toHaveLength(3)
      expect(new Set(uploaders).size).toBe(3)
      expect(uploaders).not.toContain("user-1")
    }
  })

  it("기본 팟에 Figma 협업 상태 확인용 seed가 포함된다", () => {
    const groups = groupByPotRegion()

    const gangneung = groups.get("pot-ut-1/강릉시") ?? []
    expect(gangneung.map((p) => p.uploaderId).sort()).toEqual([
      "m-사진작가 정우-2",
      "m-존잘 창우-1",
      "m-축구왕 준표-0",
    ])
    expect(gangneung.every((p) => p.date === "2026-08-01")).toBe(true)
    expect(gangneung.every((p) => p.endDate === "2026-08-02")).toBe(true)

    const latestDaejeon = (groups.get("pot-ut-1/대전광역시") ?? [])
      .filter((p) => p.date === "2026-08-03")
      .map((p) => p.uploaderId)
    expect(latestDaejeon).toEqual(["user-1"])

    const latestSeoul = (groups.get("pot-ut-1/서울특별시") ?? [])
      .filter((p) => p.date === "2026-07-28")
      .map((p) => p.uploaderId)
      .sort()
    expect(latestSeoul).toEqual([
      "m-사진작가 정우-2",
      "m-존잘 창우-1",
      "m-축구왕 준표-0",
      "user-1",
    ])
  })
})
