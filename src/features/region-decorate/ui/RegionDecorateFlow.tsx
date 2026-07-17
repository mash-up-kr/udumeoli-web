import * as React from "react"
import { Plus } from "lucide-react"

import { partySlotOffset } from "../lib/slot-layout"
import { useDecorateStore } from "../model/decorate.store"
import type { DecorateStep } from "../model/decorate.store"

import type { RegionFill } from "@/entities/region"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { Calendar } from "@/shared/ui/calendar"
import { ColorSwatch } from "@/shared/ui/color-swatch"
import { Profile } from "@/shared/ui/profile"
import { Tooltip } from "@/shared/ui/tooltip"
import { showToast } from "@/shared/ui/toast"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"
import { usePhotoUploadStore } from "@/entities/photo"
import { selectCurrentPotMembers, usePotStore } from "@/entities/travel-pot"
import { formatRegionName, useRegionColorStore } from "@/entities/region"
import { useSessionStore } from "@/entities/user"

// 피그마 Color Swatch 팔레트 — fill: primitive 100, stroke: primitive 500 토큰 값.
// MapLibre feature-state/paint가 CSS 변수를 해석하지 못해 hex로 직접 저장한다.
const PALETTE = [
  { fill: "#ffc5bf", stroke: "#e8453a" }, // red
  { fill: "#ffdab5", stroke: "#e3800f" }, // orange
  { fill: "#fff0b1", stroke: "#dbb71f" }, // yellow
  { fill: "#c8f0c0", stroke: "#7cb571" }, // green
  { fill: "#d1eafd", stroke: "#6cbcf9" }, // blue
  { fill: "#c4c8ff", stroke: "#7b7fbf" }, // indigo
  { fill: "#e4bfff", stroke: "#b689d7" }, // violet
]

const STEP_TITLE: Record<DecorateStep, (region: string) => string> = {
  color: (region) => `당신에게 ${region}은\n어떤 색상인가요?`,
  date: () => "다녀온 날짜를\n선택해 주세요",
  photo: () => "가장 기억에 남는\n사진 한 장을 올려 주세요",
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
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
  const currentPotId = usePotStore((s) => s.currentPotId)
  const partyMembers = usePotStore(selectCurrentPotMembers)
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)
  const setColor = useRegionColorStore((s) => s.setColor)
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)
  const step = useDecorateStore((s) => s.step)
  const goStep = useDecorateStore((s) => s.setStep)
  const setPreview = useDecorateStore((s) => s.setPreview)
  const onClose = useDecorateStore((s) => s.close)

  const [fill, setFill] = React.useState<RegionFill | null>(null)
  // 캘린더 진입 시 오늘 날짜 기본 선택 (Figma 1319-17083 #4)
  const [date, setDate] = React.useState<Date>(() => new Date())
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const photoInputRef = React.useRef<HTMLInputElement>(null)

  const handleBack = () => {
    if (step === "color") onClose()
    else if (step === "date") {
      // 선택 중이던 날짜는 저장하지 않고 오늘로 초기화 (Figma 1319-17083 #1)
      setDate(new Date())
      goStep("color")
    } else goStep("date")
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
      goStep("photo")
      return
    }
    // photo — 최종 커밋
    if (fill?.type !== "color" || !photoUrl || !currentUserId) return
    setColor(currentPotId, region, fill.value)
    addPhoto({
      id: `up-${region}-${Date.now()}`,
      region,
      date: toISODate(date),
      lat: center.lat,
      lng: center.lng,
      thumbnailUrl: photoUrl,
      uploaderId: currentUserId,
      potId: currentPotId,
    })
    onClose()
    // 지역 상세로 복귀하며 완료 토스트 3초 노출 — 갤러리 패널(하단 244px) 위 (Figma 1340-18364)
    showToast({
      message: "업로드가 완료됐어요",
      icon: "check",
      className: "bottom-[256px]",
    })
  }

  // date 스텝은 오늘이 기본 선택이라 확인이 항상 활성 (Figma 1319-17083 #6)
  const confirmDisabled =
    (step === "color" && fill === null) ||
    (step === "photo" && photoUrl === null)

  // 내 슬롯이 배치의 마지막 자리(우하단 큰 슬롯)에 오도록 정렬
  const orderedMembers = [...partyMembers].sort(
    (a, b) => Number(a.id === currentUserId) - Number(b.id === currentUserId)
  )

  const selectedColor = fill?.type === "color" ? fill.value : null
  const uploadedCount = photoUrl ? 1 : 0

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* 상/하단 화이트 그라디언트 */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/65 to-white/0" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-white/65 to-white/0" />

      {/* 헤더 — 뒤로가기 + 스텝 타이틀 (Figma 1245-8962) */}
      <div className="absolute inset-x-0 top-0 flex flex-col px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex h-[76px] items-center">
          <ButtonIcon
            aria-label="뒤로 가기"
            onClick={handleBack}
            className="pointer-events-auto"
          >
            <img src={iconArrowLeftSrc} alt="" className="size-6" />
          </ButtonIcon>
        </div>
        <h2 className="text-center text-h3 whitespace-pre-line text-fg-neutral-bold [text-shadow:0_0_32px_white]">
          {STEP_TITLE[step](formatRegionName(region))}
        </h2>
      </div>

      {/* Step 3 — 파티 슬롯 (지역이 화면 중앙에 맞춰진 상태 기준 인원수별 배치) */}
      {step === "photo" ? (
        <div className="absolute top-[44%] left-1/2">
          {orderedMembers.map((member, i) => {
            const [dx, dy] = partySlotOffset(orderedMembers.length, i)
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
          <div className="flex w-full [scrollbar-width:none] items-center gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            <ColorSwatch
              variant="empty"
              selected={fill === null}
              aria-label="색상 없음"
              onClick={() => {
                setFill(null)
                setPreview(null)
              }}
            />
            <span className="h-8 w-px shrink-0 rounded-full bg-stroke-neutral-subtle" />
            {PALETTE.map((color) => (
              <ColorSwatch
                key={color.fill}
                variant="color"
                color={color.fill}
                selected={selectedColor === color.fill}
                aria-label={`색상 ${color.fill}`}
                onClick={() => {
                  // 스와치 탭 즉시 지도 채움 미리보기 — 확인 전에 여러 색을 비교
                  setFill({ type: "color", value: color.fill })
                  setPreview(color)
                }}
              />
            ))}
          </div>
        ) : null}

        {step === "date" ? (
          <Calendar
            mode="single"
            required
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
