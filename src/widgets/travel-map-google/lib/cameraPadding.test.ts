import { describe, expect, it } from "vitest"

import { getRecordCameraPadding } from "./cameraPadding"

describe("getRecordCameraPadding", () => {
  it("디자인 기준 화면에서는 기존 여백을 유지한다", () => {
    expect(getRecordCameraPadding(375, 812)).toEqual({
      top: 170,
      bottom: 330,
      left: 48,
      right: 48,
    })
  })

  it("짧은 화면에서는 지도에 남는 최소 영역을 보장하도록 세로 여백을 줄인다", () => {
    const padding = getRecordCameraPadding(320, 568)

    expect(padding).toEqual({
      top: 132,
      bottom: 256,
      left: 24,
      right: 24,
    })
    expect(568 - padding.top - padding.bottom).toBeGreaterThanOrEqual(180)
  })

  it("좁은 화면에서도 좌우 여백은 최소값을 유지한다", () => {
    expect(getRecordCameraPadding(280, 400)).toMatchObject({
      left: 24,
      right: 24,
    })
  })
})
