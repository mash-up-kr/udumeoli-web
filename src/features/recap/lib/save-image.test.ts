import { describe, expect, it } from "vitest"

import { buildRecapTextMarkup } from "./save-image"

describe("buildRecapTextMarkup", () => {
  it("리캡 통계와 팟·멤버 정보를 SVG markup에 포함한다", () => {
    const markup = buildRecapTextMarkup({
      totalDays: 12,
      pinCount: 8,
      potName: "여행 <팟>",
      members: ["우디 & 머리"],
    })

    expect(markup).toContain(">12</tspan>")
    expect(markup).toContain(">8</tspan>")
    expect(markup).toContain("여행 &lt;팟&gt;")
    expect(markup).toContain("@우디 &amp; 머리")
  })

  it("멤버가 많아도 3열 배치로 이어진다", () => {
    const markup = buildRecapTextMarkup({
      totalDays: 1,
      pinCount: 1,
      potName: "팟",
      members: ["a", "b", "c", "d"],
    })

    expect(markup).toContain('x="16" y="420"')
    expect(markup).toContain('x="112" y="420"')
    expect(markup).toContain('x="16" y="434"')
  })
})
