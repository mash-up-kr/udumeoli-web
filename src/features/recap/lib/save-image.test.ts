import { describe, expect, it } from "vitest"

import { RECAP_CARD_LAYOUT } from "./recap-layout"
import { buildRecapTextMarkup, staticMapTiles } from "./save-image"

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
    expect(markup).toContain(
      'fill="#6cbcf9" stroke="#141820" stroke-width="1.5"'
    )
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

describe("staticMapTiles", () => {
  const view = {
    center: { lat: 36.43, lng: 127.7 },
    zoom: 6,
    width: 220,
    height: 391.111,
  }
  const [top, bottom] = staticMapTiles(view)

  it("한 단계 높은 줌의 두 장이 카드 전체(0~480)를 덮는다", () => {
    expect(top.zoom).toBe(7)
    expect(top.width).toBe(440)
    expect(top.cardY).toBe(0)
    expect(bottom.cardY).toBeLessThan(top.cardY + top.cardHeight)
    expect(bottom.cardY + bottom.cardHeight).toBeGreaterThan(480)
  })

  it("위 장의 로고 띠는 아래 장이 덮고, 아래 장의 로고 띠는 카드 밖으로 나간다", () => {
    const band = (40 * 270) / 440
    expect(bottom.cardY).toBeLessThan(top.cardY + top.cardHeight - band)
    expect(bottom.cardY + bottom.cardHeight - band).toBeCloseTo(480, 0)
  })

  it("두 장의 중심은 뷰 중심을 사이에 두고 위·아래에 있다", () => {
    expect(top.center.lat).toBeGreaterThan(view.center.lat)
    expect(bottom.center.lat).toBeLessThan(view.center.lat)
    expect(top.center.lng).toBe(view.center.lng)
  })
})
