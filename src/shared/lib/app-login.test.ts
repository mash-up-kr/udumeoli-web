import { describe, expect, it } from "vitest"

import { isAppLoginPending } from "./app-login"

describe("isAppLoginPending", () => {
  it("accepts only a recent app login", () => {
    expect(isAppLoginPending("1000", 900_999)).toBe(true)
    expect(isAppLoginPending("1000", 901_000)).toBe(false)
    expect(isAppLoginPending("1000", 999)).toBe(false)
    expect(isAppLoginPending(null, 1000)).toBe(false)
    expect(isAppLoginPending("invalid", 1000)).toBe(false)
  })
})
