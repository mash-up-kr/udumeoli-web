import { afterEach, describe, expect, it, vi } from "vitest"
import { trackPageViewForRoute } from "./analytics-runtime"

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

  it("tracks the initial route and distinct route changes only once", () => {
    trackPageViewForRoute("/")
    trackPageViewForRoute("/")
    trackPageViewForRoute("/map-google")
    trackPageViewForRoute("/map-google")

    expect(trackEventMock).toHaveBeenCalledTimes(2)
    expect(trackEventMock).toHaveBeenNthCalledWith(1, "page_view")
    expect(trackEventMock).toHaveBeenNthCalledWith(2, "page_view")
  })
})
