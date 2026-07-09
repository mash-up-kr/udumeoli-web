import * as React from "react"
import { ArrowLeft, Plus } from "lucide-react"

import { useDecorateStore } from "../model/decorate.store"
import type { DecorateStep } from "../model/decorate.store"

import type { RegionFill } from "@/entities/region"
import { ButtonCta } from "@/shared/ui/button-cta"
import { Calendar } from "@/shared/ui/calendar"
import { ColorSwatch } from "@/shared/ui/color-swatch"
import { ImageContainer } from "@/shared/ui/image-container"
import { Profile } from "@/shared/ui/profile"
import { Tooltip } from "@/shared/ui/tooltip"
import { usePhotoUploadStore } from "@/entities/photo"
import { usePotStore } from "@/entities/travel-pot"
import { useRegionColorStore } from "@/entities/region"
import { useSessionStore } from "@/entities/user"

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

const STEP_TITLE: Record<DecorateStep, (region: string) => string> = {
  color: (region) => `당신에게 ${region}은\n어떤 색상인가요?`,
  date: () => "다녀온 날짜를\n선택해 주세요",
  photo: () => "가장 기억에 남는\n사진 한 장을 올려 주세요",
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// 파티 슬롯 원형 분포 — 지역이 화면 중앙에 고정된 상태라 화면 좌표 기준 배치
function slotOffset(total: number, index: number): [number, number] {
  if (total === 1) return [0, 0]
  const radius = total <= 3 ? 96 : total <= 5 ? 116 : 132
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return [Math.cos(angle) * radius, Math.sin(angle) * radius]
}

const SLOT_SIZE = 80

type RegionDecorateFlowProps = {
  region: string
  /** 사진 등록 좌표 (지역 centroid) */
  center: { lat: number; lng: number }
}

/**
 * 첫 여행 등록 멀티스텝 플로우 (색상 → 날짜 → 사진).
 * 지도 위 풀스크린 오버레이 — 지도 조작은 TravelMapImpl이 잠금/점선 처리.
 */
export function RegionDecorateFlow({
  region,
  center,
}: RegionDecorateFlowProps) {
  const partyMembers = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.members ?? []
  )
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)
  const setColor = useRegionColorStore((s) => s.setColor)
  const setImage = useRegionColorStore((s) => s.setImage)
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)
  const step = useDecorateStore((s) => s.step)
  const goStep = useDecorateStore((s) => s.setStep)
  const onClose = useDecorateStore((s) => s.close)

  const [fill, setFill] = React.useState<RegionFill | null>(null)
  const [date, setDate] = React.useState<Date>()
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const fillInputRef = React.useRef<HTMLInputElement>(null)
  const photoInputRef = React.useRef<HTMLInputElement>(null)

  const handleBack = () => {
    if (step === "color") onClose()
    else if (step === "date") goStep("color")
    else goStep("date")
  }

  const handleFillImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setFill({
        type: "image",
        imageId: `region-img-${region}-${Date.now()}`,
        dataUrl,
      })
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // 재선택 시 이전 blob URL 회수 (최종 커밋된 URL은 addPhoto가 계속 사용하므로 그대로 둠)
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handleConfirm = () => {
    if (step === "color") {
      if (fill) goStep("date")
      return
    }
    if (step === "date") {
      if (date) goStep("photo")
      return
    }
    // photo — 최종 커밋
    if (!fill || !date || !photoUrl || !currentUserId) return
    if (fill.type === "color") setColor(region, fill.value)
    else setImage(region, fill.imageId, fill.dataUrl)
    addPhoto({
      id: `up-${region}-${Date.now()}`,
      region,
      date: toISODate(date),
      lat: center.lat,
      lng: center.lng,
      thumbnailUrl: photoUrl,
      uploaderId: currentUserId,
    })
    onClose()
  }

  const confirmDisabled =
    (step === "color" && fill === null) ||
    (step === "date" && date === undefined) ||
    (step === "photo" && photoUrl === null)

  const selectedColor = fill?.type === "color" ? fill.value : null
  const selectedImage = fill?.type === "image" ? fill : null
  const uploadedCount = photoUrl ? 1 : 0

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* 상/하단 화이트 그라디언트 */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/65 to-white/0" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-white/65 to-white/0" />

      {/* 헤더 — 뒤로가기 + 스텝 타이틀 */}
      <div className="absolute inset-x-0 top-0 flex flex-col px-4 pt-3">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={handleBack}
          className="pointer-events-auto flex size-[42px] items-center justify-center self-start rounded-full bg-bg-neutral-weak shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
        >
          <ArrowLeft className="size-6 text-fg-neutral-bold" />
        </button>
        <h2 className="mt-2 text-center text-h3 whitespace-pre-line text-fg-neutral-bold [text-shadow:0_0_32px_white]">
          {STEP_TITLE[step](region)}
        </h2>
      </div>

      {/* Step 3 — 파티 슬롯 (지역이 화면 중앙에 맞춰진 상태 기준 원형 배치) */}
      {step === "photo" ? (
        <div className="absolute top-[44%] left-1/2">
          {partyMembers.map((member, i) => {
            const [dx, dy] = slotOffset(partyMembers.length, i)
            const isMe = member.id === currentUserId
            return (
              <div
                key={member.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: dx, top: dy }}
              >
                {isMe ? (
                  <div className="relative flex flex-col items-center">
                    <button
                      type="button"
                      aria-label="내 사진 올리기"
                      onClick={() => photoInputRef.current?.click()}
                      className="pointer-events-auto flex items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-stroke-neutral-bold bg-white/90 transition-transform active:scale-95"
                      style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
                    >
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <Plus className="size-8 text-fg-neutral-bold" />
                      )}
                    </button>
                    {!photoUrl ? (
                      <Tooltip className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2">
                        내 사진 올리기
                      </Tooltip>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="relative flex items-center justify-center rounded-3xl border-2 border-dashed border-stroke-neutral-weak bg-white/90"
                    style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
                  >
                    <img
                      src="/icon-zzz.svg"
                      alt="사진 없음"
                      className="size-9 opacity-70"
                    />
                    <Profile
                      size="sm"
                      src={member.profileImageUrl ?? undefined}
                      className="absolute top-[7px] left-[7px]"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : null}

      {/* 하단 패널 — 스텝별 콘텐츠 + 확인 */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col items-center gap-[27px] px-4 pb-[34px]">
        {step === "color" ? (
          <div className="flex w-full items-center gap-4 overflow-x-auto pb-1">
            {selectedImage ? (
              <button
                type="button"
                aria-label="이미지 다시 선택"
                onClick={() => fillInputRef.current?.click()}
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
                onClick={() => fillInputRef.current?.click()}
              />
            )}
            <input
              ref={fillInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFillImageUpload}
            />
            {PALETTE.map((color) => (
              <ColorSwatch
                key={color}
                variant="color"
                color={color}
                selected={selectedColor === color}
                aria-label={`색상 ${color}`}
                onClick={() => setFill({ type: "color", value: color })}
              />
            ))}
          </div>
        ) : null}

        {step === "date" ? (
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            classNames={{ root: "w-full" }}
          />
        ) : null}

        {step === "photo" ? (
          <p className="rounded-full bg-bg-neutral-weak px-4 py-2 text-b6 text-fg-neutral-bold shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
            {partyMembers.length}명 중 {uploadedCount}명이 업로드했어요
          </p>
        ) : null}

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handlePhotoUpload}
        />

        <ButtonCta disabled={confirmDisabled} onClick={handleConfirm}>
          확인
        </ButtonCta>
      </div>
    </div>
  )
}
