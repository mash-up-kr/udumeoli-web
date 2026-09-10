import { describe, expect, it } from "vitest"

import { RECAP_CARD_LAYOUT } from "./recap-layout"
import { buildRecapTextMarkup, staticMapImageMarkup } from "./save-image"

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

describe("staticMapImageMarkup", () => {
  it("뷰보다 길게 받은 정적 지도를 위아래 똑같이 넘치게 깔아 하단 로고 띠를 카드 밖으로 보낸다", () => {
    const view = {
      center: { lat: 36, lng: 128 },
      zoom: 6,
      width: 324,
      height: 576,
    }
    const markup = staticMapImageMarkup(view, 640, "data:map")
    // 카드 폭 270 = 뷰 폭 324 × 0.8333 → 이미지 높이 640 × 0.8333, 넘침 64 × 0.8333 / 2
    expect(markup).toContain('x="0"')
    expect(markup).toContain('width="270"')
    expect(markup).toContain(`height="${(640 * 270) / 324}"`)
    expect(markup).toContain(`y="${(-32 * 270) / 324}"`)
    // 뷰 높이만큼만 카드 안에 보인다: y + height − 카드 높이 = 위쪽 넘침과 같다
    const y = (-32 * 270) / 324
    const height = (640 * 270) / 324
    expect(y + height - 480).toBeCloseTo(-y)
  })
})
