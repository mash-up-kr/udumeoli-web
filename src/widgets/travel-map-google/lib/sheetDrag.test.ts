import { describe, expect, it } from "vitest"
import { resolveSheetDrag } from "./sheetDrag"

const drag = (delta: number, expanded = false, velocity = 0) =>
  resolveSheetDrag({ delta, velocity, expanded })

describe("resolveSheetDrag — 거리 판정", () => {
  it("위로 충분히 끌면 확장한다", () => {
    expect(drag(-64)).toBe("expand")
  })

  it("초기 높이에서 아래로 충분히 끌면 닫는다", () => {
    expect(drag(48)).toBe("close")
  })

  it("확장 상태에서 아래로 끌면 닫지 않고 초기 높이로 내려간다", () => {
    expect(drag(48, true)).toBe("collapse")
  })

  it("이미 확장이면 더 위로 끌어도 제자리", () => {
    expect(drag(-200, true)).toBe("settle")
  })

  it("임계값 미만이면 원래 높이로 돌아간다", () => {
    expect(drag(47)).toBe("settle")
    expect(drag(-63)).toBe("settle")
    expect(drag(0, true)).toBe("settle")
  })
})

describe("resolveSheetDrag — 플릭 판정", () => {
  it("거리가 모자라도 아래로 튕기면 닫는다", () => {
    expect(drag(10, false, 0.4)).toBe("close")
  })

  it("거리가 모자라도 위로 튕기면 확장한다", () => {
    expect(drag(-10, false, -0.4)).toBe("expand")
  })

  it("확장 상태에서 아래로 튕기면 한 단계만 내려간다", () => {
    expect(drag(10, true, 0.9)).toBe("collapse")
  })

  it("임계 속도 미만은 거리 판정을 따른다", () => {
    expect(drag(10, false, 0.39)).toBe("settle")
  })

  it("아래로 많이 끌었어도 위로 튕기며 놓으면 확장이 이긴다", () => {
    expect(drag(120, false, -0.8)).toBe("expand")
  })
})
