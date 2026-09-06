import { describe, expect, it } from "vitest"

import {
  FIRST_RECORD_STEP,
  RECORD_STEPS,
  recordStepAt,
  useRecordStore,
} from "./record.store"

describe("record.store", () => {
  it("시작·종료 단계가 RECORD_STEPS 첫 단계를 따른다", () => {
    expect(FIRST_RECORD_STEP).toBe(RECORD_STEPS[0])

    useRecordStore.getState().start("강릉시")
    expect(useRecordStore.getState().step).toBe(RECORD_STEPS[0])

    useRecordStore.getState().setStep("photo")
    useRecordStore.getState().close()
    expect(useRecordStore.getState().step).toBe(RECORD_STEPS[0])
    expect(useRecordStore.getState().region).toBeNull()
  })

  it("양 끝에서는 recordStepAt이 undefined를 준다 — 닫기·멈춤의 근거", () => {
    expect(recordStepAt(-1)).toBeUndefined()
    expect(recordStepAt(RECORD_STEPS.length)).toBeUndefined()
    expect(recordStepAt(0)).toBe(RECORD_STEPS[0])
  })

  it("플로우에 없는 단계는 인덱스가 -1이라 뒤로 가기가 플로우를 닫는다", () => {
    // TravelRecordFlow의 이동은 RECORD_STEPS 인덱스만 본다 —
    // 빠진 단계("date")를 억지로 넣어도 이전 단계가 없어 닫히는 쪽으로 떨어진다
    const index = RECORD_STEPS.indexOf("date")
    expect(recordStepAt(index - 1)).toBeUndefined()
    expect(recordStepAt(index + 1)).toBe(RECORD_STEPS[0])
  })
})
