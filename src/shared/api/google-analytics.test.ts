// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { initializeGoogleAnalytics } from "./google-analytics"

const { initializeAnalyticsMock } = vi.hoisted(() => ({
  initializeAnalyticsMock: vi.fn(),
}))

vi.mock("firebase/analytics", () => ({
  initializeAnalytics: initializeAnalyticsMock,
}))

const FIREBASE_ENV = {
  VITE_FIREBASE_API_KEY: "test-api-key",
  VITE_FIREBASE_PROJECT_ID: "test-project",
  VITE_FIREBASE_APP_ID: "1:1:web:test",
  VITE_FIREBASE_MEASUREMENT_ID: "G-TEST",
}

describe("Google Analytics initialization", () => {
  beforeEach(() => {
    vi.stubEnv("PROD", true)
    window.history.replaceState(null, "", "/")
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.getElementById("google-analytics")?.remove()
    delete window.dataLayer
    delete window.gtag
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    initializeAnalyticsMock.mockReset()
  })

  it("does not load in development", () => {
    vi.stubEnv("PROD", false)
    expect(initializeGoogleAnalytics()).toBe(false)
    expect(window.gtag).toBeUndefined()
    expect(document.getElementById("google-analytics")).toBeNull()
  })

  it.each(["/login/callback", "/login/callback/"])(
    "waits for authentication to leave %s before loading once",
    (pathname) => {
      window.history.replaceState(null, "", `${pathname}?code=private-code`)
      expect(initializeGoogleAnalytics()).toBe(false)
      expect(window.gtag).toBeUndefined()
      expect(document.getElementById("google-analytics")).toBeNull()

      window.history.replaceState(null, "", "/signup")
      expect(initializeGoogleAnalytics()).toBe(true)
      expect(initializeGoogleAnalytics()).toBe(true)
      window.history.replaceState(null, "", "/pot-start")
      initializeGoogleAnalytics()

      expect(document.querySelectorAll("#google-analytics")).toHaveLength(1)
      expect(window.dataLayer?.map((command) => command[0])).toEqual([
        "js",
        "config",
      ])
      expect(Array.from(window.dataLayer![1])).toEqual([
        "config",
        "G-0D3HZ92ZME",
        { page_referrer: "" },
      ])
      const script = document.getElementById("google-analytics")
      expect(script?.getAttribute("src")).toBe(
        "https://www.googletagmanager.com/gtag/js?id=G-0D3HZ92ZME"
      )
      expect((script as HTMLScriptElement).async).toBe(true)
    }
  )

  it("removes sensitive referrer paths and queries", () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue(
      "https://www.pinnned.co.kr/login/callback?code=private-code"
    )
    initializeGoogleAnalytics()
    expect(window.dataLayer?.[1][2]).toEqual({
      page_referrer: "https://www.pinnned.co.kr",
    })
  })

  it("uses Firebase Analytics instead of the manual loader when configured", () => {
    Object.entries(FIREBASE_ENV).forEach(([key, value]) =>
      vi.stubEnv(key, value)
    )
    vi.spyOn(document, "referrer", "get").mockReturnValue(
      "https://www.pinnned.co.kr/login/callback?code=private-code"
    )

    expect(initializeGoogleAnalytics()).toBe(true)
    // SDK가 넘겨준 config 객체를 초기화 중 제자리에서 바꾼다(firebase_origin·update·firebase_id 추가).
    // 경로가 바뀔 때마다 새 옵션으로 다시 부르면 analytics/already-initialized로 던지므로 한 번만 불러야 한다.
    expect(initializeGoogleAnalytics()).toBe(true)

    expect(initializeAnalyticsMock).toHaveBeenCalledTimes(1)
    expect(initializeAnalyticsMock.mock.calls[0][0]?.options).toMatchObject({
      projectId: "test-project",
      measurementId: "G-TEST",
    })
    expect(initializeAnalyticsMock.mock.calls[0][1]).toEqual({
      config: { page_referrer: "https://www.pinnned.co.kr" },
    })
    expect(window.gtag).toBeUndefined()
    expect(document.getElementById("google-analytics")).toBeNull()
  })

  it("does not access browser APIs during SSR", () => {
    vi.stubGlobal("window", undefined)
    expect(initializeGoogleAnalytics).not.toThrow()
  })
})
