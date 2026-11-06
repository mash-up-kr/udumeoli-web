import { describe, expect, it } from "vitest"
import { filterBlockedMapOverview } from "./filterBlockedMapOverview"
import { buildPartyMapFills } from "./mapFills"
import type { Photo } from "@/entities/photo"
import type { MapCell, PartyMapOverview } from "@/entities/travel-pot"

const cell = (regionCode: string, regionCount = 1): MapCell => ({
  regionCode,
  regionCount,
  keyword: "FOOD",
  recordedMemberCount: 2,
})
const overview: PartyMapOverview = {
  memberCount: 3,
  country: cell("KR", 3),
  provinces: [cell("32", 2), cell("21")],
  municipalities: [cell("32030"), cell("32040"), cell("21")],
}
const photo = (
  id: string,
  region: string,
  uploaderId: string,
  keyword: Photo["keyword"] = "HEALING",
  potId = "pot"
): Photo => ({
  id,
  region,
  uploaderId,
  keyword,
  potId,
  date: "2026-11-06",
  lat: 0,
  lng: 0,
  thumbnailUrl: "test.jpg",
})
const photos = [
  photo("blocked", "강릉시", "blocked", "FOOD"),
  photo("visible", "강릉시", "other"),
  photo("visible2", "동해시", "other"),
  photo("visible3", "부산광역시", "me"),
]
const run = (
  records: Array<Photo> | undefined = photos,
  blockedAuthorIds = ["blocked"]
) =>
  filterBlockedMapOverview({
    overview,
    photos: records,
    blockedAuthorIds,
    potId: "pot",
  })!

describe("차단 기록이 포함된 지도 셀 필터링", () => {
  it("같은 지역의 다른 멤버 기록을 보존하며 대표 키워드·인원만 재계산한다", () => {
    const result = run()
    expect(result.municipalities[0]).toEqual({
      ...cell("32030"),
      keyword: "HEALING",
      recordedMemberCount: 1,
    })
    expect(result.provinces[0]).toEqual({
      ...cell("32", 2),
      keyword: "HEALING",
      recordedMemberCount: 1,
    })
    expect(result.country).toEqual({
      ...cell("KR", 3),
      keyword: "HEALING",
      recordedMemberCount: 2,
    })
    expect(result.memberCount).toBe(3)
    expect(
      buildPartyMapFills({ baseFills: {}, overview: result }).강릉시
    ).toBeDefined()
  })
  it("차단과 관계없는 지역은 서버 셀 자체를 유지한다", () => {
    const result = run()
    expect(result.municipalities[1]).toBe(overview.municipalities[1])
    expect(result.municipalities[2]).toBe(overview.municipalities[2])
    expect(result.provinces[1]).toBe(overview.provinces[1])
  })
  it("차단 기록만 남은 지역만 제거하고 상위 집계에서 그 지역을 제외한다", () => {
    const result = run(photos.filter((item) => item.id !== "visible"))
    expect(result.municipalities.map((item) => item.regionCode)).toEqual([
      "32040",
      "21",
    ])
    expect(result.provinces[0].regionCount).toBe(1)
    expect(result.country?.regionCount).toBe(2)
  })
  it("다른 팟의 차단 기록과 무관한 차단 목록은 현재 오버뷰에 영향을 주지 않는다", () => {
    expect(
      run([photo("other-pot", "강릉시", "blocked", "FOOD", "another-pot")])
    ).toBe(overview)
    expect(run(photos, ["unrelated-user"])).toBe(overview)
    expect(run(photos, [])).toBe(overview)
  })
  it("사진 조회 전에는 서버 오버뷰를 유지하고 차단 해제 시 원본으로 복원한다", () => {
    expect(
      filterBlockedMapOverview({
        overview,
        photos: undefined,
        blockedAuthorIds: ["blocked"],
        potId: "pot",
      })
    ).toBe(overview)
    expect(run(photos, [])).toBe(overview)
    expect(overview.municipalities[0].keyword).toBe("FOOD")
    expect(overview.country?.recordedMemberCount).toBe(2)
  })
  it("현재 팟의 모든 기록이 차단된 경우에만 지도 셀 전체를 비운다", () => {
    const result = run(photos, ["blocked", "other", "me"])
    expect(result.country).toBeNull()
    expect(result.provinces).toEqual([])
    expect(result.municipalities).toEqual([])
    expect(result.memberCount).toBe(overview.memberCount)
  })
})
