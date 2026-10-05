// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { trackEvent } from "./analytics"

describe("analytics client", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubEnv(
      "VITE_ANALYTICS_API_URL",
      "https://pinnned-analytics-production.up.railway.app"
    )
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.history.replaceState(null, "", "/")
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("sends session_started before the first event and keeps IDs stable", async () => {
    trackEvent("page_view")
    await Promise.resolve()
    await Promise.resolve()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const first = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    const second = JSON.parse(fetchMock.mock.calls[1][1].body as string)
    expect(first.eventName).toBe("session_started")
    expect(second.eventName).toBe("page_view")
    expect(first.anonymousId).toBe(second.anonymousId)
    expect(first.sessionId).toBe(second.sessionId)
    expect(first.eventId).not.toBe(second.eventId)
  })

  it("does not block or reject when analytics is unavailable", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"))

    expect(() => trackEvent("login_completed")).not.toThrow()
    await Promise.resolve()
  })

  it("sends the pathname without query and reduces referrer to its origin", async () => {
    window.history.replaceState(
      null,
      "",
      "/map-google?utm_source=google&inviteCode=secret"
    )
    vi.spyOn(document, "referrer", "get").mockReturnValue(
      "https://example.com/private?token=secret"
    )

    trackEvent("page_view")
    await Promise.resolve()
    await Promise.resolve()

    const payload = JSON.parse(fetchMock.mock.calls[1][1].body as string)
    expect(payload.path).toBe("/map-google")
    expect(payload.referrer).toBe("https://example.com")
    expect(payload.utmSource).toBe("google")
  })

  it("keeps tracking when localStorage is unavailable", async () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("blocked")
    })

    expect(() => trackEvent("page_view")).not.toThrow()
    await Promise.resolve()
    await Promise.resolve()

    const payload = JSON.parse(fetchMock.mock.calls[1][1].body as string)
    expect(payload.anonymousId).toBeTruthy()
  })
})
