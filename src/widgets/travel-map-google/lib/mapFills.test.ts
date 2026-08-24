import { describe, expect, it } from "vitest"

import { buildCollaborationTrips, latestTripByRegion } from "./collaboration"
import {
  buildDisplayFills,
  buildMapFills,
  buildPartyMapFills,
} from "./mapFills"
import type { RegionFill } from "@/entities/region"
import type { Photo } from "@/entities/photo"
import { TRIP_100_POT } from "@/entities/travel-pot"
import { TRAVEL_KEYWORDS } from "@/entities/photo"

const healing = TRAVEL_KEYWORDS.find((keyword) => keyword.id === "HEALING")!
const food = TRAVEL_KEYWORDS.find((keyword) => keyword.id === "FOOD")!
const nature = TRAVEL_KEYWORDS.find((keyword) => keyword.id === "NATURE")!
const incompleteFill = "#9eb8ac"

describe("buildMapFills", () => {
  it("최신 완료 여행 키워드가 과거 저장 색보다 우선한다", () => {
    const fills = buildMapFills({
      baseFills: {
        강릉시: { type: "color", value: food.fill },
      },
      trips: [
        {
          region: "강릉시",
          keyword: "NATURE",
          hasMine: true,
          isComplete: true,
        },
      ],
      incompleteRegionFill: incompleteFill,
    })

    expect(fills.강릉시).toEqual({ type: "color", value: nature.mapColor })
  })

  it("내가 아직 기록하지 않은 최신 미완성 여행은 과거 저장 색을 숨긴다", () => {
    const fills = buildMapFills({
      baseFills: {
        강릉시: { type: "color", value: food.fill },
      },
      trips: [
        {
          region: "강릉시",
          keyword: "NATURE",
          hasMine: false,
          isComplete: false,
        },
      ],
      incompleteRegionFill: incompleteFill,
    })

    expect(fills.강릉시).toBeUndefined()
  })

  it("내가 기록한 미완성 여행은 키워드가 없을 때만 미완성 상태 색을 쓴다", () => {
    const fills = buildMapFills({
      baseFills: {},
      trips: [
        {
          region: "강릉시",
          hasMine: true,
          isComplete: false,
        },
      ],
      incompleteRegionFill: incompleteFill,
    })

    expect(fills.강릉시).toEqual({ type: "color", value: incompleteFill })
  })

  it("사진 채움은 여행 상태 색으로 덮지 않는다", () => {
    const imageFill: RegionFill = {
      type: "image",
      imageId: "image-1",
      dataUrl: "data:image/png;base64,test",
    }
    const fills = buildMapFills({
      baseFills: { 강릉시: imageFill },
      trips: [
        {
          region: "강릉시",
          keyword: "NATURE",
          hasMine: true,
          isComplete: true,
        },
      ],
      incompleteRegionFill: incompleteFill,
    })

    expect(fills.강릉시).toBe(imageFill)
  })

  it("내가 아직 기록하지 않은 최신 여행은 사진 채움도 숨긴다", () => {
    const imageFill: RegionFill = {
      type: "image",
      imageId: "image-1",
      dataUrl: "data:image/png;base64,test",
    }
    const fills = buildMapFills({
      baseFills: { 강릉시: imageFill },
      trips: [
        {
          region: "강릉시",
          keyword: "NATURE",
          hasMine: false,
          isComplete: false,
        },
      ],
      incompleteRegionFill: incompleteFill,
    })

    expect(fills.강릉시).toBeUndefined()
  })

  it("목 데모처럼 모든 멤버가 기록한 여행은 모두 키워드 색으로 칠한다", () => {
    const keyword = "FOOD"
    const demoPhotos: Array<Photo> = Array.from({ length: 100 }).flatMap(
      (_, i) =>
        TRIP_100_POT.members.map((member, memberIndex) => ({
          id: `demo-${i}-${member.id}`,
          potId: TRIP_100_POT.id,
          region: `지역-${i}`,
          keyword,
          lat: 37 + i * 0.001,
          lng: 127 + i * 0.001,
          date: "2025-07-15",
          uploaderId: member.id,
          thumbnailUrl: `https://example.com/demo-${i}-${memberIndex}.jpg`,
        }))
    )
    const trips = buildCollaborationTrips({
      photos: demoPhotos,
      members: TRIP_100_POT.members,
      currentUserId: "user-1",
    })
    const fills = buildMapFills({
      baseFills: {},
      trips: latestTripByRegion(trips).values(),
      incompleteRegionFill: incompleteFill,
    })

    expect(trips).toHaveLength(100)
    expect(trips.every((trip) => trip.isComplete)).toBe(true)
    expect(trips.every((trip) => trip.hasMine)).toBe(true)
    expect(Object.values(fills).every((fill) => fill.type === "color")).toBe(
      true
    )
    expect(
      Object.values(fills).some(
        (fill) => fill.type === "color" && fill.value === incompleteFill
      )
    ).toBe(false)
  })
})

describe("buildDisplayFills", () => {
  it("0단계는 전국 대표 키워드로 모든 지역을 칠한다", () => {
    const fills = buildDisplayFills({
      zoomStage: 0,
      mapFills: {},
      provinceAggregates: [],
      countryKeyword: healing,
      centroids: [{ name: "강릉시" }, { name: "속초시" }],
    })

    expect(fills).toEqual({
      강릉시: { type: "color", value: healing.mapColor },
      속초시: { type: "color", value: healing.mapColor },
    })
  })

  it("1단계는 도 대표 키워드로 도 소속 지역을 칠하되 사진 채움은 유지한다", () => {
    const imageFill: RegionFill = {
      type: "image",
      imageId: "image-1",
      dataUrl: "data:image/png;base64,test",
    }
    const fills = buildDisplayFills({
      zoomStage: 1,
      mapFills: {
        속초시: imageFill,
      },
      provinceAggregates: [
        {
          keyword: food,
          regions: ["강릉시", "속초시"],
        },
      ],
      countryKeyword: undefined,
      centroids: [],
    })

    expect(fills).toEqual({
      강릉시: { type: "color", value: food.mapColor },
      속초시: imageFill,
    })
  })

  it("2단계 이상은 지역별 지도 채움을 그대로 쓴다", () => {
    const mapFills: Record<string, RegionFill> = {
      강릉시: { type: "color", value: nature.mapColor },
    }
    const fills = buildDisplayFills({
      zoomStage: 2,
      mapFills,
      provinceAggregates: [
        {
          keyword: food,
          regions: ["강릉시", "속초시"],
        },
      ],
      countryKeyword: healing,
      centroids: [{ name: "강릉시" }, { name: "속초시" }],
    })

    expect(fills).toBe(mapFills)
  })
})

describe("buildPartyMapFills", () => {
  const overview = {
    memberCount: 4,
    country: {
      regionCode: "KR",
      keyword: "NATURE" as const,
      regionCount: 2,
      visitCount: 3,
      recordedMemberCount: 4,
    },
    provinces: [
      {
        regionCode: "32",
        keyword: "FOOD" as const,
        regionCount: 2,
        visitCount: 3,
        recordedMemberCount: 3,
      },
    ],
    municipalities: [
      {
        regionCode: "32030",
        keyword: "FOOD" as const,
        regionCount: 1,
        visitCount: 2,
        recordedMemberCount: 2,
      },
    ],
  }

  it("시군구 집계는 regionCode로 해당 지역만 칠한다", () => {
    expect(
      buildPartyMapFills({
        baseFills: {},
        overview,
      })
    ).toEqual({ 강릉시: { type: "color", value: food.mapColor } })
  })

  it("사용자가 저장한 이미지 채움은 서버 색상보다 우선한다", () => {
    const imageFill: RegionFill = {
      type: "image",
      imageId: "image-1",
      dataUrl: "data:image/png;base64,test",
    }
    expect(
      buildPartyMapFills({
        baseFills: { 강릉시: imageFill },
        overview,
      }).강릉시
    ).toBe(imageFill)
  })
})
