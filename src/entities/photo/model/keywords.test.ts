import { describe, expect, it } from "vitest"

import { TRAVEL_KEYWORDS, TRAVEL_KEYWORD_OPTIONS } from "./keywords"

describe("TRAVEL_KEYWORDS", () => {
  it("서버 TripKeyword enum 6종과 정확히 일치한다", () => {
    expect(TRAVEL_KEYWORDS.map((k) => k.id).sort()).toEqual(
      ["ACTIVITY", "CITY", "CULTURE", "FOOD", "HEALING", "NATURE"].sort()
    )
  })

  it("여행 기록 선택지는 Figma 최신 5종 순서로 노출한다", () => {
    expect(TRAVEL_KEYWORD_OPTIONS.map((k) => [k.id, k.label])).toEqual([
      ["FOOD", "맛집"],
      ["NATURE", "디저트"],
      ["HEALING", "힐링"],
      ["ACTIVITY", "액티비티"],
      ["CITY", "사진"],
    ])
  })
})
