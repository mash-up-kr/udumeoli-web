import { describe, expect, it } from "vitest"
import { getMapLoadingState } from "./mapLoading"

describe("getMapLoadingState", () => {
  it("waits for both the region layer and Google tiles", () => {
    expect(
      getMapLoadingState({
        implFailed: false,
        geoFailed: false,
        layerReady: true,
        tilesReady: false,
        tilesTimedOut: false,
      })
    ).toBe("loading")
  })

  it("reports GeoJSON errors separately from tile errors", () => {
    expect(
      getMapLoadingState({
        implFailed: false,
        geoFailed: true,
        layerReady: false,
        tilesReady: false,
        tilesTimedOut: false,
      })
    ).toBe("geo-error")
    expect(
      getMapLoadingState({
        implFailed: false,
        geoFailed: false,
        layerReady: true,
        tilesReady: false,
        tilesTimedOut: true,
      })
    ).toBe("tiles-error")
  })

  it("is ready only after both signals arrive", () => {
    expect(
      getMapLoadingState({
        implFailed: false,
        geoFailed: false,
        layerReady: true,
        tilesReady: true,
        tilesTimedOut: false,
      })
    ).toBe("ready")
  })

  it("lets a late tile load override an earlier timeout", () => {
    expect(
      getMapLoadingState({
        implFailed: false,
        geoFailed: false,
        layerReady: true,
        tilesReady: true,
        tilesTimedOut: true,
      })
    ).toBe("ready")
  })

  it("reports dynamic implementation import failures", () => {
    expect(
      getMapLoadingState({
        implFailed: true,
        geoFailed: false,
        layerReady: false,
        tilesReady: false,
        tilesTimedOut: false,
      })
    ).toBe("impl-error")
  })
})
