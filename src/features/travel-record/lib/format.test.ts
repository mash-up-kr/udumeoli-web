import { describe, expect, it } from "vitest"

import { formatRecordRange, visitLabel } from "./format"

describe("visitLabel", () => {
  it("10회차까지는 고유어 서수, 11회차부터는 숫자로 표기한다", () => {
    expect(visitLabel(1, "강릉")).toBe("첫 번째 강릉")
    expect(visitLabel(2, "강릉")).toBe("두 번째 강릉")
    expect(visitLabel(10, "강릉")).toBe("열 번째 강릉")
    expect(visitLabel(11, "강릉")).toBe("11 번째 강릉")
  })
})

describe("formatRecordRange", () => {
  it("당일·같은 달·다른 달을 각각 다르게 표기한다", () => {
    expect(formatRecordRange("2026-08-01")).toBe("26.08.01")
    // 종료일이 시작일과 같으면 당일 표기 (range 선택에서 하루만 고른 경우)
    expect(formatRecordRange("2026-08-01", "2026-08-01")).toBe("26.08.01")
    expect(formatRecordRange("2026-08-01", "2026-08-02")).toBe("26.08.01~02")
    expect(formatRecordRange("2026-08-30", "2026-09-02")).toBe("26.08.30~09.02")
  })
})
