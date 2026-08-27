import { describe, expect, it } from "vitest"

import { canShowAvailableRegionMarker } from "./availableRegionMarkers"

describe("canShowAvailableRegionMarker", () => {
  it("2단계까지는 인기지역도 [+] 버튼을 노출하지 않는다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2,
        hasIncompleteTrip: false,
        region: "강릉시",
      })
    ).toBe(false)

    expect(
      canShowAvailableRegionMarker({
        zoomStage: 1,
        hasIncompleteTrip: false,
        region: "강릉시",
      })
    ).toBe(false)
  })

  it("2.5단계에서는 인기지역만 [+] 버튼을 노출한다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2.5,
        hasIncompleteTrip: false,
        region: "강릉시",
      })
    ).toBe(true)

    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2.5,
        hasIncompleteTrip: false,
        region: "옥천군",
      })
    ).toBe(false)
  })

  it("3단계에서는 진행 중인 여행이 없는 모든 지역의 [+] 버튼을 노출한다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasIncompleteTrip: false,
        region: "옥천군",
      })
    ).toBe(true)
  })

  it("진행 중인 여행이 있는 지역은 협업 액션 마커가 담당하므로 제외한다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasIncompleteTrip: true,
        region: "강릉시",
      })
    ).toBe(false)

    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2.5,
        hasIncompleteTrip: true,
        region: "강릉시",
      })
    ).toBe(false)
  })
})
