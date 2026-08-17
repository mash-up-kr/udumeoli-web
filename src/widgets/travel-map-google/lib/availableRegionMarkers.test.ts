import { describe, expect, it } from "vitest"

import { canShowAvailableRegionMarker } from "./availableRegionMarkers"

describe("canShowAvailableRegionMarker", () => {
  it("2단계에서는 인기지역만 [+] 버튼을 먼저 노출한다", () => {
    expect(
      canShowAvailableRegionMarker({
        name: "강릉시",
        zoomStage: 2,
        hasFill: false,
        hasPhoto: false,
      })
    ).toBe(true)

    expect(
      canShowAvailableRegionMarker({
        name: "영월군",
        zoomStage: 2,
        hasFill: false,
        hasPhoto: false,
      })
    ).toBe(false)
  })

  it("3단계에서는 모든 미등록 지역의 [+] 버튼을 노출한다", () => {
    expect(
      canShowAvailableRegionMarker({
        name: "영월군",
        zoomStage: 3,
        hasFill: false,
        hasPhoto: false,
      })
    ).toBe(true)
  })

  it("색칠이나 사진이 있는 지역은 줌 단계와 무관하게 제외한다", () => {
    expect(
      canShowAvailableRegionMarker({
        name: "강릉시",
        zoomStage: 3,
        hasFill: true,
        hasPhoto: false,
      })
    ).toBe(false)

    expect(
      canShowAvailableRegionMarker({
        name: "강릉시",
        zoomStage: 3,
        hasFill: false,
        hasPhoto: true,
      })
    ).toBe(false)
  })
})
