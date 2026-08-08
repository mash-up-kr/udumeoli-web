import { describe, expect, it } from "vitest"

import { TRAVEL_KEYWORDS } from "./keywords"

describe("TRAVEL_KEYWORDS", () => {
  it("서버 TripKeyword enum 6종과 정확히 일치한다", () => {
    expect(TRAVEL_KEYWORDS.map((k) => k.id).sort()).toEqual(
      ["ACTIVITY", "CITY", "CULTURE", "FOOD", "HEALING", "NATURE"].sort()
    )
  })
})
