import { describe, expect, it } from "vitest"

import { expandBox, isInsideBox, isSameBox } from "./viewportBounds"
import type { LatLngBox } from "./viewportBounds"

const viewport: LatLngBox = { south: 37, west: 127, north: 38, east: 128 }

describe("expandBox", () => {
  it("가로·세로 비율만큼 사방으로 넓힌다", () => {
    expect(expandBox(viewport, 0.25)).toEqual({
      south: 36.75,
      west: 126.75,
      north: 38.25,
      east: 128.25,
    })
  })
})

describe("isInsideBox", () => {
  const buffered = expandBox(viewport, 0.25)

  it("뷰포트 안 좌표를 포함한다", () => {
    expect(isInsideBox(buffered, { lat: 37.5, lng: 127.5 })).toBe(true)
  })

  it("버퍼 안(화면 밖) 좌표도 포함한다 — 가장자리 깜빡임 방지", () => {
    expect(isInsideBox(buffered, { lat: 38.2, lng: 128.2 })).toBe(true)
    expect(isInsideBox(viewport, { lat: 38.2, lng: 128.2 })).toBe(false)
  })

  it("버퍼 밖 좌표는 제외한다", () => {
    expect(isInsideBox(buffered, { lat: 35, lng: 129 })).toBe(false)
  })

  it("여행 100개 중 뷰포트+버퍼 안의 것만 남긴다", () => {
    // 경도 126~136을 0.1도 간격으로 채운 100개 — 절반 이상이 화면 밖
    const trips = Array.from({ length: 100 }, (_, i) => ({
      lat: 37.5,
      lng: 126 + i * 0.1,
    }))
    const selected = trips.filter((trip) => isInsideBox(buffered, trip))

    expect(selected.length).toBeLessThan(trips.length)
    expect(selected.every((trip) => isInsideBox(buffered, trip))).toBe(true)
    expect(Math.min(...selected.map((t) => t.lng))).toBeGreaterThanOrEqual(
      buffered.west
    )
    expect(Math.max(...selected.map((t) => t.lng))).toBeLessThanOrEqual(
      buffered.east
    )
  })
})

describe("isSameBox", () => {
  it("값이 같으면 같은 박스로 본다 — 참조 유지용", () => {
    expect(isSameBox(viewport, { ...viewport })).toBe(true)
  })

  it("한 변이라도 다르면 다른 박스다", () => {
    expect(isSameBox(viewport, { ...viewport, north: 38.1 })).toBe(false)
  })

  it("null 조합을 구분한다", () => {
    expect(isSameBox(null, null)).toBe(true)
    expect(isSameBox(viewport, null)).toBe(false)
  })
})
