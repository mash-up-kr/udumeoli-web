import * as React from "react"
import { ImagePlus, MapPin } from "lucide-react"

import type { RegionFill } from "@/entities/region"
import { DialogTitle } from "@/shared/ui/dialog"
import { openBottomSheet } from "@/shared/ui/bottom-sheet"
import { useRegionColorStore } from "@/entities/region"

const PALETTE = [
  "#ff8a80", // red
  "#ffb347", // orange
  "#ffe066", // yellow
  "#7dde72", // green
  "#74b9ff", // blue
  "#8c8fff", // indigo
  "#c77dff", // violet
]

const SWATCH_BASE =
  "shrink-0 size-12 rounded-xl border border-[#8e96a9] overflow-hidden transition-all"

function ColorPickerSheet({
  region,
  close,
}: {
  region: string
  close: () => void
}) {
  const setColor = useRegionColorStore((s) => s.setColor)
  const setImage = useRegionColorStore((s) => s.setImage)
  const clearFill = useRegionColorStore((s) => s.clearFill)
  const current = useRegionColorStore(
    (s) => s.fills[region] as RegionFill | undefined
  )

  const [pending, setPending] = React.useState<RegionFill | null>(
    current ?? null
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      const imageId = `region-img-${region}-${Date.now()}`
      setPending({ type: "image", imageId, dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleConfirm = () => {
    if (!pending) {
      clearFill(region)
    } else if (pending.type === "color") {
      setColor(region, pending.value)
    } else {
      setImage(region, pending.imageId, pending.dataUrl)
    }
    close()
  }

  const isNoneSelected = pending === null
  const selectedColor = pending?.type === "color" ? pending.value : null
  const selectedImage = pending?.type === "image" ? pending : null

  return (
    <div className="flex flex-col gap-6 px-4 pt-1 pb-2">
      <DialogTitle className="flex items-center gap-1.5 text-h5">
        <MapPin className="size-4 text-[#F45B69]" />
        {region}
      </DialogTitle>

      {/* 색상/이미지 선택 행 */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {/* 없애기 (X 사선) */}
        <button
          type="button"
          aria-label="색상 없애기"
          onClick={() => setPending(null)}
          className={`${SWATCH_BASE} relative flex items-center justify-center bg-white ${isNoneSelected ? "border-2 border-[#232936]" : ""}`}
        >
          {/* 사선 X */}
          <svg
            viewBox="0 0 48 48"
            className="absolute inset-0 size-full"
            aria-hidden
          >
            <line
              x1="8"
              y1="40"
              x2="40"
              y2="8"
              stroke="#F45B69"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* 구분선 */}
        <div className="h-8 w-px shrink-0 bg-[#8e96a9]/40" />

        {/* 이미지 업로드 */}
        <label
          className={`${SWATCH_BASE} relative flex cursor-pointer flex-col items-center justify-center gap-0.5 bg-white ${selectedImage ? "border-2 border-[#232936]" : ""}`}
        >
          {selectedImage ? (
            <img
              src={selectedImage.dataUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-5 text-[#8e96a9]" />
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageUpload}
          />
        </label>

        {/* 색상 스와치 */}
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            onClick={() => setPending({ type: "color", value: color })}
            className={`${SWATCH_BASE} ${selectedColor === color ? "border-2 border-[#232936]" : ""}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* 확인 버튼 */}
      <button
        type="button"
        onClick={handleConfirm}
        className="w-full rounded-full bg-[#232936] py-4 text-center text-[16px] leading-6 font-bold tracking-tight text-white transition-opacity active:opacity-80"
      >
        확인
      </button>
    </div>
  )
}

export function openColorPickerSheet(region: string) {
  openBottomSheet(({ close }) => (
    <ColorPickerSheet region={region} close={close} />
  ))
}
