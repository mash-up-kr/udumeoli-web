import { describe, expect, it } from "vitest"

import { UT_PHOTOS } from "./photo.ut"

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
  it("세 팟 모두 동일한 7개 지역이 시드된다", () => {
    const regionsByPot = new Map<string, Set<string>>()
    for (const p of UT_PHOTOS) {
      if (!regionsByPot.has(p.potId)) regionsByPot.set(p.potId, new Set())
      regionsByPot.get(p.potId)!.add(p.region)
    }
    expect(regionsByPot.size).toBe(3)
    for (const regions of regionsByPot.values()) {
      expect(regions.size).toBe(7)
    }
  })

  it("팟·지역별 고유 일자는 3개다 (카드 3days)", () => {
    for (const group of groupByPotRegion().values()) {
      expect(new Set(group.map((p) => p.date)).size).toBe(3)
    }
  })

  it("가장 최근 일자에는 나(user-1)를 제외한 멤버 3인 전원이 업로드돼 있다", () => {
    for (const group of groupByPotRegion().values()) {
      const latest = group.reduce((a, b) => (a.date >= b.date ? a : b)).date
      const uploaders = group
        .filter((p) => p.date === latest)
        .map((p) => p.uploaderId)
      expect(uploaders).toHaveLength(3)
      expect(new Set(uploaders).size).toBe(3)
      expect(uploaders).not.toContain("user-1")
    }
  })
})
