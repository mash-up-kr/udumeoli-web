import { describe, expect, it } from "vitest"
import { shouldShowZoomGuide } from "./zoomGuide"

const baseState = {
  hasPersistentActions: true,
  dismissed: false,
  mapReady: true,
  photosReady: true,
  photoCount: 0,
}

describe("shouldShowZoomGuide", () => {
  it("hides after the guide is clicked", () => {
    expect(shouldShowZoomGuide({ ...baseState, dismissed: true })).toBe(false)
  })

  it("hides after a photo is registered", () => {
    expect(shouldShowZoomGuide({ ...baseState, photoCount: 1 })).toBe(false)
  })

  it("hides when the photo query is not successful", () => {
    expect(shouldShowZoomGuide({ ...baseState, photosReady: false })).toBe(
      false
    )
  })

  it("hides while the map is loading", () => {
    expect(shouldShowZoomGuide({ ...baseState, mapReady: false })).toBe(false)
  })
})
