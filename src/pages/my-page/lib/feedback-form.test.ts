import { describe, expect, it } from "vitest"

import { FEEDBACK_CONTENT_MAX, canSubmit, ratingLabel } from "./feedback-form"

describe("ratingLabel", () => {
  it("선택 전(0)은 안내 문구", () => {
    expect(ratingLabel(0)).toBe("별을 눌러 만족도를 알려주세요")
  })

  it("점수별 문구", () => {
    expect([1, 2, 3, 4, 5].map(ratingLabel)).toEqual([
      "별로예요",
      "아쉬워요",
      "보통이에요",
      "좋아요!",
      "최고예요!",
    ])
  })
})

describe("canSubmit", () => {
  it("별점 + 공백 아닌 내용이 있어야 true", () => {
    expect(canSubmit(4, "좋아요")).toBe(true)
  })

  it("별점 없으면 false", () => {
    expect(canSubmit(0, "좋아요")).toBe(false)
  })

  it("내용이 공백뿐이면 false", () => {
    expect(canSubmit(4, "   \n")).toBe(false)
  })

  it("5,000자 초과면 false", () => {
    expect(canSubmit(4, "a".repeat(FEEDBACK_CONTENT_MAX))).toBe(true)
    expect(canSubmit(4, "a".repeat(FEEDBACK_CONTENT_MAX + 1))).toBe(false)
  })
})
