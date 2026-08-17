import { describe, expect, it } from "vitest"

import { canShowAvailableRegionMarker } from "./availableRegionMarkers"

describe("canShowAvailableRegionMarker", () => {
  it("2단계에서는 인기지역도 [+] 버튼을 노출하지 않는다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2,
        hasIncompleteTrip: false,
      })
    ).toBe(false)

    expect(
      canShowAvailableRegionMarker({
        zoomStage: 1,
        hasIncompleteTrip: false,
      })
    ).toBe(false)
  })

  it("3단계에서는 진행 중인 여행이 없는 지역의 [+] 버튼을 노출한다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasIncompleteTrip: false,
      })
    ).toBe(true)
  })

  it("진행 중인 여행이 있는 지역은 협업 액션 마커가 담당하므로 제외한다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasIncompleteTrip: true,
      })
    ).toBe(false)
  })
})
