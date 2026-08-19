import { describe, expect, it } from "vitest"

import { planBoundarySync, recordedProvinceKey } from "./boundarySync"
import type { BoundarySnapshot } from "./boundarySync"

const base: BoundarySnapshot = {
  stage: 1,
  recordedProvinceKey: "강원특별자치도,경상남도",
  hasNationRecord: true,
}

describe("recordedProvinceKey", () => {
  it("Set 순서가 달라도 같은 키를 만든다", () => {
    expect(recordedProvinceKey(new Set(["경상남도", "강원특별자치도"]))).toBe(
      recordedProvinceKey(new Set(["강원특별자치도", "경상남도"]))
    )
  })
})

describe("planBoundarySync", () => {
  it("첫 호출은 항상 갱신한다", () => {
    expect(planBoundarySync(null, base)).toEqual({
      skip: false,
      restyleProvinces: true,
    })
  })

  it("stage·기록 도 집합이 그대로면 건너뛴다 — idle마다 전체 순회 방지", () => {
    expect(planBoundarySync(base, { ...base })).toEqual({
      skip: true,
      restyleProvinces: false,
    })
  })

  it("stage가 바뀌면 갱신하되 province 스타일은 다시 칠하지 않는다", () => {
    expect(planBoundarySync(base, { ...base, stage: 2 })).toEqual({
      skip: false,
      restyleProvinces: false,
    })
  })

  it("기록된 도 집합이 바뀌면 province 스타일을 다시 칠한다", () => {
    expect(
      planBoundarySync(base, { ...base, recordedProvinceKey: "강원특별자치도" })
    ).toEqual({ skip: false, restyleProvinces: true })
  })

  it("국가 기록 여부가 바뀌면 갱신한다", () => {
    expect(planBoundarySync(base, { ...base, hasNationRecord: false })).toEqual(
      { skip: false, restyleProvinces: false }
    )
  })
})
