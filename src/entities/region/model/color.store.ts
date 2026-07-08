import { create } from "zustand"
import { persist } from "zustand/middleware"

export type RegionFill =
  | { type: "color"; value: string }
  | { type: "image"; imageId: string; dataUrl: string }

interface RegionFillState {
  fills: Record<string, RegionFill>
  setColor: (region: string, value: string) => void
  setImage: (region: string, imageId: string, dataUrl: string) => void
  clearFill: (region: string) => void
}

// 새로고침에도 지도 꾸미기(색·이미지)가 유지되도록 localStorage 영속.
// 이미지 dataUrl이 커서 용량 초과 시 저장만 실패하고 세션 내 동작은 유지된다.
export const useRegionColorStore = create<RegionFillState>()(
  persist(
    (set) => ({
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
    }),
    { name: "photato-region-fills" }
  )
)
