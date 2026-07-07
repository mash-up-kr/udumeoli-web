import * as React from "react"

import type { RegionFill } from "@/entities/region"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ColorSwatch } from "@/shared/ui/color-swatch"
import { DialogTitle } from "@/shared/ui/dialog"
import { ImageContainer } from "@/shared/ui/image-container"
import { openBottomSheet } from "@/shared/ui/bottom-sheet"
import { useRegionColorStore } from "@/entities/region"

// 피그마 Color Swatch 팔레트 — primitive 100 계열 토큰 값.
// MapLibre feature-state가 CSS 변수를 해석하지 못해 hex로 직접 저장한다.
const PALETTE = [
  "#ffc5bf", // --color-red-100
  "#ffdab5", // --color-orange-100
  "#fff0b1", // --color-yellow-100
  "#c8f0c0", // --color-green-100
  "#d1eafd", // --color-blue-100
  "#c4c8ff", // --color-indigo-100
  "#e4bfff", // --color-violet-100
]

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
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const selectedColor = pending?.type === "color" ? pending.value : null
  const selectedImage = pending?.type === "image" ? pending : null

  return (
    <div className="flex flex-col gap-6.75 px-1 pt-1 pb-2">
      <DialogTitle className="sr-only">{region} 색칠하기</DialogTitle>

      {/* 스와치 행 — 가로 스크롤 */}
      <div className="flex items-center gap-4 overflow-x-auto pb-1">
        <ColorSwatch
          variant="empty"
          selected={pending === null}
          aria-label="색상 없애기"
          onClick={() => setPending(null)}
        />

        {/* 구분선 */}
        <div className="h-8 w-px shrink-0 bg-fg-neutral-subtle" />

        {/* 이미지 업로드 */}
        {selectedImage ? (
          <button
            type="button"
            aria-label="이미지 다시 선택"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <ImageContainer
              src={selectedImage.dataUrl}
              className="size-12 rounded-[12px] border-4 border-stroke-neutral-bold"
            />
          </button>
        ) : (
          <ColorSwatch
            variant="add"
            aria-label="이미지 추가"
            onClick={() => fileInputRef.current?.click()}
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageUpload}
        />

        {/* 색상 스와치 */}
        {PALETTE.map((color) => (
          <ColorSwatch
            key={color}
            variant="color"
            color={color}
            selected={selectedColor === color}
            aria-label={`색상 ${color}`}
            onClick={() => setPending({ type: "color", value: color })}
          />
        ))}
      </div>

      <ButtonCta onClick={handleConfirm}>확인</ButtonCta>
    </div>
  )
}

export function openColorPickerSheet(region: string) {
  openBottomSheet(
    ({ close }) => <ColorPickerSheet region={region} close={close} />,
    {
      showCloseButton: false,
      showOverlay: false,
      className: "bg-transparent shadow-none",
    }
  )
}
