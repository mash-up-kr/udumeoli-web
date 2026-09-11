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

  it("내가 이미 기록한 지역은 두 번째 [+]를 노출하지 않는다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasTrip: true,
        hasMine: true,
        region: "강릉시",
      })
    ).toBe(false)

    expect(
      canShowAvailableRegionMarker({
        zoomStage: 2.5,
        hasTrip: true,
        hasMine: true,
        region: "강릉시",
      })
    ).toBe(false)
  })

  it("팟원이 먼저 기록했지만 내가 아직 기록하지 않은 진행 중 여행은 [+]를 노출한다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasTrip: true,
        hasMine: false,
        isComplete: false,
        region: "강릉시",
      })
    ).toBe(true)
  })

  it("팟원 전체가 완료한 지역은 [+]를 숨긴다", () => {
    expect(
      canShowAvailableRegionMarker({
        zoomStage: 3,
        hasTrip: true,
        hasMine: false,
        isComplete: true,
        region: "강릉시",
      })
    ).toBe(false)
  })
})
