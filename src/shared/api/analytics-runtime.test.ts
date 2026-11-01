import { afterEach, describe, expect, it, vi } from "vitest"
import {
  initializeFirebaseRuntime,
  trackPageViewForPath,
} from "./analytics-runtime"

const {
  trackEventMock,
  initializeGoogleAnalyticsMock,
  initializeRemoteConfigMock,
} = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
  initializeGoogleAnalyticsMock: vi.fn(),
  initializeRemoteConfigMock: vi.fn(),
}))

vi.mock("./analytics", () => ({
  trackEvent: trackEventMock,
}))
vi.mock("./google-analytics", () => ({
  initializeGoogleAnalytics: initializeGoogleAnalyticsMock,
}))
vi.mock("./remote-config", () => ({
  initializeRemoteConfig: initializeRemoteConfigMock,
}))

describe("AnalyticsRuntime", () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
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

  it("initializes Remote Config only after Analytics is ready in production", () => {
    vi.stubEnv("DEV", false)
    initializeGoogleAnalyticsMock.mockReturnValue(false)
    initializeFirebaseRuntime()
    expect(initializeRemoteConfigMock).not.toHaveBeenCalled()

    initializeGoogleAnalyticsMock.mockReturnValue(true)
    initializeFirebaseRuntime()
    expect(initializeRemoteConfigMock).toHaveBeenCalledTimes(1)
    expect(
      initializeGoogleAnalyticsMock.mock.invocationCallOrder[1]
    ).toBeLessThan(initializeRemoteConfigMock.mock.invocationCallOrder[0])
  })

  it("opens Remote Config without Analytics in development", () => {
    vi.stubEnv("DEV", true)
    initializeGoogleAnalyticsMock.mockReturnValue(false)
    initializeFirebaseRuntime()
    expect(initializeRemoteConfigMock).toHaveBeenCalledTimes(1)
  })
})
