import { afterEach, describe, expect, it, vi } from "vitest"
import { trackPageViewForPath } from "./analytics-runtime"

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}))

vi.mock("./analytics", () => ({
  trackEvent: trackEventMock,
}))

describe("AnalyticsRuntime", () => {
  afterEach(() => {
    trackEventMock.mockReset()
  })

  it("tracks the initial path and distinct path changes only once", () => {
    trackPageViewForPath("/")
    trackPageViewForPath("/")
    trackPageViewForPath("/map-google")
    trackPageViewForPath("/map-google")

    expect(trackEventMock).toHaveBeenCalledTimes(2)
    expect(trackEventMock).toHaveBeenNthCalledWith(1, "page_view")
    expect(trackEventMock).toHaveBeenNthCalledWith(2, "page_view")
  })
})
