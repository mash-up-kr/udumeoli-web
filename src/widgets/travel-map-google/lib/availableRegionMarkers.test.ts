import { describe, expect, it } from "vitest"

import { canShowAvailableRegionMarker } from "./availableRegionMarkers"

describe("canShowAvailableRegionMarker", () => {
  it("2단계까지는 인기지역도 [+] 버튼을 노출하지 않는다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2,
        hasTrip: false,
        region: "강릉시",
      })
    ).toBe(false)

    expect(
      canShowAvailableRegionMarker({
        zoomStage: 1,
        hasTrip: false,
        region: "강릉시",
      })
    ).toBe(false)
  })

  it("2.5단계에서는 인기지역만 [+] 버튼을 노출한다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2.5,
        hasTrip: false,
        region: "강릉시",
      })
    ).toBe(true)

    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2.5,
        hasTrip: false,
        region: "옥천군",
      })
    ).toBe(false)
  })

  it("3단계에서는 기록이 없는 모든 지역의 [+] 버튼을 노출한다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasTrip: false,
        region: "옥천군",
      })
    ).toBe(true)
  })

  it("이미 기록된 지역은 완료 여부와 관계없이 두 번째 [+]를 노출하지 않는다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasTrip: true,
        region: "강릉시",
      })
    ).toBe(false)

    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2.5,
        hasTrip: true,
        region: "강릉시",
      })
    ).toBe(false)
  })
})
