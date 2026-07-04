import * as React from "react"
import { ImagePlus, MapPin, X } from "lucide-react"

import type { RegionFill } from "@/entities/region"
import { DialogTitle } from "@/shared/ui/dialog"
import { openBottomSheet } from "@/shared/ui/bottom-sheet"
import { useRegionColorStore } from "@/entities/region"

const PALETTE = [
  { label: "코럴", value: "#FF6B6B" },
  { label: "오렌지", value: "#FF9F43" },
  { label: "옐로우", value: "#FECA57" },
  { label: "민트", value: "#1DD1A1" },
  { label: "스카이", value: "#54A0FF" },
  { label: "라벤더", value: "#A29BFE" },
  { label: "핑크", value: "#FD79A8" },
  { label: "그린", value: "#26DE81" },
]

function ColorPickerSheet({ region }: { region: string }) {
  const setColor = useRegionColorStore((s) => s.setColor)
  const setImage = useRegionColorStore((s) => s.setImage)
  const clearFill = useRegionColorStore((s) => s.clearFill)
  const current = useRegionColorStore(
    (s) => s.fills[region] as RegionFill | undefined
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      const imageId = `region-img-${region}-${Date.now()}`
      setImage(region, imageId, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-5">
      <DialogTitle className="flex items-center gap-1.5 text-h5">
        <MapPin className="size-4 text-[#F45B69]" />
        {region}
      </DialogTitle>

      <div className="grid grid-cols-4 gap-3">
        {/* 이미지 업로드 셀 */}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border transition-colors hover:border-foreground/40">
          {current?.type === "image" ? (
            <img
              src={current.dataUrl}
              alt="업로드된 이미지"
              className="size-full rounded-2xl object-cover"
            />
          ) : (
            <>
              <ImagePlus className="size-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">이미지</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageUpload}
          />
        </label>

        {/* 색상 팔레트 */}
        {PALETTE.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            onClick={() => setColor(region, value)}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: value + "33",
              outline:
                current?.type === "color" && current.value === value
                  ? `2.5px solid ${value}`
                  : undefined,
              outlineOffset: "2px",
            }}
          >
            <span
              className="size-6 rounded-full"
              style={{ backgroundColor: value }}
            />
            <span className="text-[10px] text-foreground/60">{label}</span>
          </button>
        ))}
      </div>

      {current && (
        <button
          type="button"
          onClick={() => clearFill(region)}
          className="flex items-center justify-center gap-1 text-b5 text-muted-foreground"
        >
          <X className="size-3.5" />
          꾸미기 지우기
        </button>
      )}
    </div>
  )
}

export function openColorPickerSheet(region: string) {
  openBottomSheet(() => <ColorPickerSheet region={region} />)
}
