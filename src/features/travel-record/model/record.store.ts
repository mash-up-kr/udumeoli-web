import { create } from "zustand"

/** 기록 플로우가 가질 수 있는 단계 (Figma 1836-15911) */
export type RecordStep = "date" | "keyword" | "photo" | "preview"

/**
 * 실제로 밟는 단계 순서 — 시작 단계와 다음/이전 이동이 모두 이 배열 하나에서 나온다.
 *
 * 기획 변경으로 기간 선택("date")을 뺐다. 되돌리려면 이 배열 맨 앞에 "date"를 다시
 * 넣으면 끝이다 — DateStep·캘린더·range 상태·스텝 타이틀은 지우지 않고 남겨 뒀다.
 * 빠져 있는 동안 기록 날짜는 등록 시점(오늘)으로 저장된다 (TravelRecordFlow).
 */
export const RECORD_STEPS: ReadonlyArray<RecordStep> = [
  "keyword",
  "photo",
  "preview",
]

export const FIRST_RECORD_STEP: RecordStep = RECORD_STEPS[0]

/**
 * 순서상 index번째 단계 — 범위를 벗어나면 undefined.
 * 첫 단계에서 뒤로 가면 플로우를 닫고, 마지막 단계에서 다음이 없으면 멈추는 근거다.
 */
export function recordStepAt(index: number): RecordStep | undefined {
  return index >= 0 && index < RECORD_STEPS.length
    ? RECORD_STEPS[index]
    : undefined
}

/** 키워드 선택 즉시 지도에 미리 칠할 색 — 100-alpha 채움 + 500 스트로크 (hex) */
export type DecoratePreview = { fill: string; stroke: string }

interface RecordState {
  /** 진행 중인 지역명 — null이면 일반 모드 */
  region: string | null
  step: RecordStep
  preview: DecoratePreview | null
  start: (region: string, step?: RecordStep) => void
  setStep: (step: RecordStep) => void
  setPreview: (preview: DecoratePreview | null) => void
  close: () => void
}

// 여행 기록 플로우 상태 — 지도(강조선·잠금)와 페이지(헤더 숨김)가 함께 구독
export const useRecordStore = create<RecordState>((set) => ({
  region: null,
  step: FIRST_RECORD_STEP,
  preview: null,
  start: (region, step = FIRST_RECORD_STEP) =>
    set({ region, step, preview: null }),
  setStep: (step) => set({ step }),
  setPreview: (preview) => set({ preview }),
  close: () => set({ region: null, step: FIRST_RECORD_STEP, preview: null }),
}))
