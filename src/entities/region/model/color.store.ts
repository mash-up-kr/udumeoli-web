import { create } from "zustand"

export type RegionFill =
  | { type: "color"; value: string }
  | { type: "image"; imageId: string; dataUrl: string }

interface RegionFillState {
  fills: Record<string, RegionFill>
  setColor: (region: string, value: string) => void
  setImage: (region: string, imageId: string, dataUrl: string) => void
  clearFill: (region: string) => void
  /** 계정 삭제 시 지도 꾸미기 전체 초기화. */
  clearAll: () => void
}

// 러프 단계 in-memory 스토어 — 사진 목 데이터처럼 새로고침 시 함께 초기화된다.
// (persist는 실제 API 연동 시 재검토)
export const useRegionColorStore = create<RegionFillState>()((set) => ({
  fills: {},
  setColor: (region, value) =>
    set((s) => ({
      fills: { ...s.fills, [region]: { type: "color", value } },
    })),
  setImage: (region, imageId, dataUrl) =>
    set((s) => ({
      fills: { ...s.fills, [region]: { type: "image", imageId, dataUrl } },
    })),
  clearFill: (region) =>
    set((s) => {
      const { [region]: _, ...rest } = s.fills
      return { fills: rest }
    }),
  clearAll: () => set({ fills: {} }),
}))
