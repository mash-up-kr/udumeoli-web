// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { initializeGoogleAnalytics } from "./google-analytics"

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
  })

  it("does not load in development", () => {
    vi.stubEnv("PROD", false)
    initializeGoogleAnalytics()
    expect(window.gtag).toBeUndefined()
    expect(document.getElementById("google-analytics")).toBeNull()
  })

  it.each(["/login/callback", "/login/callback/"])(
    "waits for authentication to leave %s before loading once",
    (pathname) => {
      window.history.replaceState(null, "", `${pathname}?code=private-code`)
      initializeGoogleAnalytics()
      expect(window.gtag).toBeUndefined()
      expect(document.getElementById("google-analytics")).toBeNull()

      window.history.replaceState(null, "", "/signup")
      initializeGoogleAnalytics()
      initializeGoogleAnalytics()
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

  it("does not access browser APIs during SSR", () => {
    vi.stubGlobal("window", undefined)
    expect(initializeGoogleAnalytics).not.toThrow()
  })
})
