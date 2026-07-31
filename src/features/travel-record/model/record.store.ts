import { create } from "zustand"

/** 기록 플로우 단계 — 기간 → 키워드 → 사진·코멘트 → 최종 확인 (Figma 1836-15911) */
export type RecordStep = "date" | "keyword" | "photo" | "preview"

/** 키워드 선택 즉시 지도에 미리 칠할 색 — 100-alpha 채움 + 500 스트로크 (hex) */
export type DecoratePreview = { fill: string; stroke: string }

interface RecordState {
  /** 진행 중인 지역명 — null이면 일반 모드 */
  region: string | null
  step: RecordStep
  preview: DecoratePreview | null
  start: (region: string) => void
  setStep: (step: RecordStep) => void
  setPreview: (preview: DecoratePreview | null) => void
  close: () => void
}

// 여행 기록 플로우 상태 — 지도(강조선·잠금)와 페이지(헤더 숨김)가 함께 구독
export const useRecordStore = create<RecordState>((set) => ({
  region: null,
  step: "date",
  preview: null,
  start: (region) => set({ region, step: "date", preview: null }),
  setStep: (step) => set({ step }),
  setPreview: (preview) => set({ preview }),
  close: () => set({ region: null, step: "date", preview: null }),
}))
