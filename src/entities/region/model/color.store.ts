import { create } from "zustand"

export type RegionFill =
  | { type: "color"; value: string }
  | { type: "image"; imageId: string; dataUrl: string }

interface RegionFillState {
  fills: Record<string, RegionFill>
  setColor: (region: string, value: string) => void
  setImage: (region: string, imageId: string, dataUrl: string) => void
  clearFill: (region: string) => void
}

export const useRegionColorStore = create<RegionFillState>((set) => ({
  fills: {},
  setColor: (region, value) =>
    set((s) => ({ fills: { ...s.fills, [region]: { type: "color", value } } })),
  setImage: (region, imageId, dataUrl) =>
    set((s) => ({
      fills: { ...s.fills, [region]: { type: "image", imageId, dataUrl } },
    })),
  clearFill: (region) =>
    set((s) => {
      const { [region]: _, ...rest } = s.fills
      return { fills: rest }
    }),
}))
