import { create } from "zustand"

export type DecorateStep = "color" | "date" | "photo"

/** 색상 스와치 탭 즉시 지도에 미리 칠할 색 — 100-alpha 채움 + 500 스트로크 (hex) */
export type DecoratePreview = { fill: string; stroke: string }

interface DecorateState {
  /** 진행 중인 지역명 — null이면 일반 모드 */
  region: string | null
  step: DecorateStep
  preview: DecoratePreview | null
  start: (region: string) => void
  setStep: (step: DecorateStep) => void
  setPreview: (preview: DecoratePreview | null) => void
  close: () => void
}

// 첫 여행 등록 플로우 상태 — 지도(강조선·잠금)와 페이지(헤더 숨김)가 함께 구독
export const useDecorateStore = create<DecorateState>((set) => ({
  region: null,
  step: "color",
  preview: null,
  start: (region) => set({ region, step: "color", preview: null }),
  setStep: (step) => set({ step }),
  setPreview: (preview) => set({ preview }),
  close: () => set({ region: null, step: "color", preview: null }),
}))
