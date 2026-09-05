import { describe, expect, it } from "vitest"

import { RECAP_CARD_LAYOUT } from "./recap-layout"
import { buildRecapTextMarkup } from "./save-image"

const { labels } = RECAP_CARD_LAYOUT

function rowYs(markup: string): Array<number> {
  return [...markup.matchAll(/<rect x="[\d.]+" y="([\d.]+)"/g)].map((match) =>
    Number(match[1])
  )
}

describe("buildRecapTextMarkup", () => {
  it("핀 개수·국가·팟 이름·멤버 닉네임을 SVG markup에 담는다", () => {
    const markup = buildRecapTextMarkup({
      pinCount: 8,
      potName: "여행 <팟>",
      members: ["우디 & 머리"],
    })

    expect(markup).toContain(">8</tspan>")
    expect(markup).toContain("in KOREA")
    expect(markup).not.toContain("DAYS")
    expect(markup).toContain("여행 &lt;팟&gt;")
    expect(markup).toContain("@우디 &amp; 머리")
  })

  it("팟 이름 라벨 위로 닉네임 줄이 쌓이고 하단 여백이 고정된다", () => {
    const markup = buildRecapTextMarkup({
      pinCount: 1,
      potName: "팟",
      members: Array.from({ length: 6 }, () => "닉네임여섯글자"),
    })

    const ys = rowYs(markup)
    // 팟 이름 1줄 + 닉네임 2줄 (240px 폭에 태그 3개씩 들어간다)
    const rows = [...new Set(ys)]
    expect(rows).toHaveLength(3)
    expect(rows[1] - rows[0]).toBeCloseTo(labels.height + labels.gap)
    expect(rows.at(-1)! + labels.height).toBeCloseTo(480 - labels.bottom)
  })
})
