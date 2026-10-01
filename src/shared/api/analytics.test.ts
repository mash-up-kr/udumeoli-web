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
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
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
})
