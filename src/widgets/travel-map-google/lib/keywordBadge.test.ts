import { describe, expect, it } from "vitest"

import { getKeywordBadgeStyle } from "./keywordBadge"
import { findKeyword } from "@/entities/photo"

describe("getKeywordBadgeStyle", () => {
  it("키워드 대표색을 텍스트와 10% 배경색에 함께 사용한다", () => {
    const dessert = findKeyword("DESSERT")

    if (!dessert) throw new Error("DESSERT 키워드를 찾을 수 없습니다")

    expect(getKeywordBadgeStyle(dessert)).toEqual({
      backgroundColor: "#FA33431A",
      color: "#FA3343",
    })
  })
})
