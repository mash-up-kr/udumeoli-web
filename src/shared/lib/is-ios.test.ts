import { describe, expect, it } from "vitest"

import { isIos } from "./is-ios"

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1"
const IPAD_LEGACY =
  "Mozilla/5.0 (iPad; CPU OS 12_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1"
// iPadOS 13+ 사파리는 데스크톱 사이트 요청이 기본이라 Mac으로 위장한다
const IPADOS_DESKTOP_MODE =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
const MAC_SAFARI = IPADOS_DESKTOP_MODE
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.71 Mobile Safari/537.36"
const WINDOWS_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

describe("isIos", () => {
  it("iPhone 사파리·크롬은 iOS", () => {
    expect(isIos({ userAgent: IPHONE_SAFARI, maxTouchPoints: 5 })).toBe(true)
    expect(isIos({ userAgent: IPHONE_CHROME, maxTouchPoints: 5 })).toBe(true)
  })

  it("구형 iPad UA는 iOS", () => {
    expect(isIos({ userAgent: IPAD_LEGACY, maxTouchPoints: 5 })).toBe(true)
  })

  it("Mac으로 위장한 iPadOS는 터치 지원으로 구분한다", () => {
    expect(isIos({ userAgent: IPADOS_DESKTOP_MODE, maxTouchPoints: 5 })).toBe(
      true
    )
    expect(isIos({ userAgent: MAC_SAFARI, maxTouchPoints: 0 })).toBe(false)
  })

  it("Android·Windows는 iOS 아님", () => {
    expect(isIos({ userAgent: ANDROID_CHROME, maxTouchPoints: 5 })).toBe(false)
    expect(isIos({ userAgent: WINDOWS_CHROME, maxTouchPoints: 10 })).toBe(false)
  })
})
