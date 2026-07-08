import { create } from "zustand"

export type DecorateStep = "color" | "date" | "photo"

interface DecorateState {
  /** 진행 중인 지역명 — null이면 일반 모드 */
  region: string | null
  step: DecorateStep
  start: (region: string) => void
  setStep: (step: DecorateStep) => void
  close: () => void
}

// 첫 여행 등록 플로우 상태 — 지도(점선·잠금)와 페이지(헤더 숨김)가 함께 구독
export const useDecorateStore = create<DecorateState>((set) => ({
  region: null,
  step: "color",
  start: (region) => set({ region, step: "color" }),
  setStep: (step) => set({ step }),
  close: () => set({ region: null, step: "color" }),
}))
