import { describe, expect, it } from "vitest"

import {
  TRAVEL_KEYWORDS,
  TRAVEL_KEYWORD_OPTIONS,
  regionStrokeForFill,
} from "./keywords"

describe("TRAVEL_KEYWORDS", () => {
  it("서버 TripKeyword enum 5종과 정확히 일치한다", () => {
    expect(TRAVEL_KEYWORDS.map((k) => k.id).sort()).toEqual(
      ["ACTIVITY", "DESSERT", "FOOD", "HEALING", "PHOTO"].sort()
    )
  })

  it("여행 기록 선택지는 Figma 최신 5종 순서로 노출한다", () => {
    expect(TRAVEL_KEYWORD_OPTIONS.map((k) => [k.id, k.label])).toEqual([
      ["FOOD", "맛집"],
      ["DESSERT", "디저트"],
      ["HEALING", "힐링"],
      ["ACTIVITY", "액티비티"],
      ["PHOTO", "사진"],
    ])
  })

  it("지도 핀 컬러는 Figma 여행 지도 핀 정책과 일치한다", () => {
    expect(TRAVEL_KEYWORD_OPTIONS.map((k) => [k.label, k.mapColor])).toEqual([
      ["맛집", "#614F44"],
      ["디저트", "#FA3343"],
      ["힐링", "#479C46"],
      ["액티비티", "#E87545"],
      ["사진", "#20201F"],
    ])
  })
})

describe("regionStrokeForFill", () => {
  it("키워드 채움색(100)마다 같은 계열 외곽선색(500)을 돌려준다", () => {
    for (const keyword of TRAVEL_KEYWORDS) {
      expect(regionStrokeForFill(keyword.fill)).toBe(keyword.stroke)
    }
    expect(regionStrokeForFill("#FFF0B1")).toBe("#dbb71f")
  })

  it("팔레트에 없는 채움색은 undefined", () => {
    expect(regionStrokeForFill("#123456")).toBeUndefined()
  })
})
