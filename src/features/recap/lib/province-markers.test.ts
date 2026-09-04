import { describe, expect, it } from "vitest"

import { buildProvinceAggregates } from "./province-markers"
import type { RegionShape } from "./province-markers"
import type { Photo } from "@/entities/photo"

function photo(region: string, keyword: Photo["keyword"]): Photo {
  return {
    id: `${region}-${keyword}`,
    lat: 0,
    lng: 0,
    thumbnailUrl: "",
    date: "2026-01-01",
    uploaderId: "u1",
    region,
    potId: "p1",
    keyword,
  }
}

function shapes(
  photosById: Record<string, Array<Photo>> = {}
): Array<RegionShape> {
  return [
    {
      id: "1",
      province: "강원특별자치도",
      center: [10, 20],
      geoCenter: [128, 37],
      photos: photosById["1"] ?? [],
    },
    {
      id: "2",
      province: "강원특별자치도",
      center: [30, 40],
      geoCenter: [129, 38],
      photos: photosById["2"] ?? [],
    },
    {
      id: "3",
      province: "경상북도",
      center: [50, 60],
      geoCenter: [128, 36],
      photos: photosById["3"] ?? [],
    },
    // 도 정보가 없는 지역은 집계에서 빠진다
    { id: "4", center: [0, 0], geoCenter: [0, 0], photos: [] },
  ]
}

describe("buildProvinceAggregates", () => {
  it("기록이 있는 도만, 시군구 centroid 평균 위치로 묶는다", () => {
    const aggregates = buildProvinceAggregates(
      shapes({ "1": [photo("강릉시", "FOOD")] })
    )

    expect(aggregates).toHaveLength(1)
    expect(aggregates[0].province).toBe("강원특별자치도")
    expect(aggregates[0].regionCount).toBe(1)
    // 기록 여부와 무관하게 도 전체 시군구 평균이 중심이 된다
    expect(aggregates[0].position).toEqual([20, 30])
    expect(aggregates[0].geoPosition).toEqual([128.5, 37.5])
  })

  it("도 전체 색칠용으로 소속 시군구를 전부 돌려준다", () => {
    const [gangwon] = buildProvinceAggregates(
      shapes({ "1": [photo("강릉시", "FOOD")] })
    )

    // 기록이 없는 id "2"도 도 단위 색칠 대상이다
    expect(gangwon.regions).toEqual(["1", "2"])
  })

  it("도 대표 키워드는 그 도에서 가장 많이 고른 키워드다", () => {
    const aggregates = buildProvinceAggregates(
      shapes({
        "1": [photo("강릉시", "FOOD")],
        "2": [photo("속초시", "HEALING"), photo("속초시2", "HEALING")],
      })
    )

    expect(aggregates[0].keyword).toBe("HEALING")
    expect(aggregates[0].regionCount).toBe(2)
  })

  it("기록이 없으면 빈 배열", () => {
    expect(buildProvinceAggregates(shapes())).toEqual([])
  })
})
