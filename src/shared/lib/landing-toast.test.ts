import { describe, expect, it, vi } from "vitest"

import { landingToastClassName } from "./landing-toast"

vi.mock("./is-ios", () => ({ isIos: vi.fn() }))
const { isIos } = await import("./is-ios")

describe("landingToastClassName", () => {
  it("iOS는 CTA 3개(34+56×3+12×2) 위 16px", () => {
    vi.mocked(isIos).mockReturnValue(true)
    expect(landingToastClassName()).toBe("bottom-[242px]")
  })

  it("그 외는 CTA 2개(34+56×2+12) 위 16px", () => {
    vi.mocked(isIos).mockReturnValue(false)
    expect(landingToastClassName()).toBe("bottom-[174px]")
  })
})
