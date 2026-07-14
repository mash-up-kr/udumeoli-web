import { create } from "zustand"

export type RegionFill =
  | { type: "color"; value: string }
  | { type: "image"; imageId: string; dataUrl: string }

interface RegionFillState {
  /** 팟별 지도 꾸미기 — potId → (지역명 → 채움) */
  fillsByPot: Record<string, Record<string, RegionFill>>
  setColor: (potId: string, region: string, value: string) => void
  setImage: (
    potId: string,
    region: string,
    imageId: string,
    dataUrl: string
  ) => void
  clearFill: (potId: string, region: string) => void
  /** 계정 삭제 시 지도 꾸미기 전체 초기화. */
  clearAll: () => void
}

// 러프 단계 in-memory 스토어 — 사진 목 데이터처럼 새로고침 시 함께 초기화된다.
// (persist는 실제 API 연동 시 재검토)
export const useRegionColorStore = create<RegionFillState>()((set) => ({
  fillsByPot: {},
  setColor: (potId, region, value) =>
    set((s) => ({
      fillsByPot: {
        ...s.fillsByPot,
        [potId]: {
          ...s.fillsByPot[potId],
          [region]: { type: "color", value },
        },
      },
    })),
  setImage: (potId, region, imageId, dataUrl) =>
    set((s) => ({
      fillsByPot: {
        ...s.fillsByPot,
        [potId]: {
          ...s.fillsByPot[potId],
          [region]: { type: "image", imageId, dataUrl },
        },
      },
    })),
  clearFill: (potId, region) =>
    set((s) => {
      const { [region]: _, ...rest } = s.fillsByPot[potId] ?? {}
      return { fillsByPot: { ...s.fillsByPot, [potId]: rest } }
    }),
  clearAll: () => set({ fillsByPot: {} }),
}))
