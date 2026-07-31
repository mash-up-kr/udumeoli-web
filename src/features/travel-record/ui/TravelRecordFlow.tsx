import * as React from "react"

import { visitLabel } from "../lib/format"
import { useRecordStore } from "../model/record.store"
import { DateStep } from "./DateStep"
import { KeywordStep } from "./KeywordStep"
import { PhotoStep } from "./PhotoStep"
import { PreviewStep } from "./PreviewStep"
import type { DateRange } from "react-day-picker"

import type { TravelKeywordId } from "@/entities/photo"
import {
  findKeyword,
  groupTrips,
  useAllPhotos,
  usePhotoUploadStore,
} from "@/entities/photo"
import { formatRegionName, useRegionColorStore } from "@/entities/region"
import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { cn } from "@/shared/lib/utils"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { showToast } from "@/shared/ui/toast"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

type TravelRecordFlowProps = {
  region: string
  /** 사진 등록 좌표 (지역 centroid) */
  center: { lat: number; lng: number }
}

/**
 * 여행 기록 플로우 (기간 → 키워드 → 사진·코멘트 → 확인) — Figma 1836-15911.
 * 지도 위 풀스크린 오버레이. 지도 조작은 TravelMapGoogleImpl이 잠금/점선 처리한다.
 */
export function TravelRecordFlow({ region, center }: TravelRecordFlowProps) {
  const currentPotId = usePotStore((s) => s.currentPotId)
  const currentUser = useSessionStore((s) => s.currentUser)
  const currentUserId = currentUser?.id ?? null
  const setColor = useRegionColorStore((s) => s.setColor)
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)
  const photos = useAllPhotos(currentPotId)
  const step = useRecordStore((s) => s.step)
  const goStep = useRecordStore((s) => s.setStep)
  const setPreview = useRecordStore((s) => s.setPreview)
  const onClose = useRecordStore((s) => s.close)

  const [range, setRange] = React.useState<DateRange | undefined>()
  const [keywordId, setKeywordId] = React.useState<TravelKeywordId | null>(null)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const [comment, setComment] = React.useState("")
  const photoInputRef = React.useRef<HTMLInputElement>(null)

  const keyword = findKeyword(keywordId ?? undefined)
  const regionName = formatRegionName(region)

  // 이번 기록이 이 지역의 몇 번째 방문인지 — 기존 방문 수 + 1 (Figma #3·#5)
  const nth = React.useMemo(() => {
    const regionPhotos = photos.filter((p) => p.region === region)
    return groupTrips(regionPhotos).length + 1
  }, [photos, region])

  const handleBack = () => {
    if (step === "date") onClose()
    else if (step === "keyword") goStep("date")
    else if (step === "photo") goStep("keyword")
    else goStep("photo")
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

  const handleNext = () => {
    if (step === "date") goStep("keyword")
    else if (step === "keyword") goStep("photo")
    else if (step === "photo") goStep("preview")
  }

  // 최종 커밋 — 지역 색상(키워드 기준) + 사진 등록 후 지도로 복귀
  const handleCommit = () => {
    if (!keyword || !photoUrl || !currentUserId || !range?.from) return
    const startDate = toISODate(range.from)
    const endDate = range.to ? toISODate(range.to) : undefined
    setColor(currentPotId, region, keyword.fill)
    addPhoto({
      id: `up-${region}-${Date.now()}`,
      region,
      date: startDate,
      ...(endDate && endDate !== startDate ? { endDate } : {}),
      lat: center.lat,
      lng: center.lng,
      thumbnailUrl: photoUrl,
      uploaderId: currentUserId,
      potId: currentPotId,
      keyword: keyword.id,
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    })
    onClose()
    // 하단 지역 카드 캐러셀(≈246px) 위로 띄워 겹치지 않게 (Figma 1836-14957 #16)
    showToast({
      message: `'${regionName}' 여행 Pinned 완료!`,
      icon: "check",
      className: "bottom-[256px]",
    })
  }

  const nextDisabled =
    (step === "date" && !range?.from) ||
    (step === "keyword" && keywordId === null) ||
    (step === "photo" && photoUrl === null)

  if (step === "preview" && keyword && photoUrl && range?.from) {
    const startDate = toISODate(range.from)
    const endDate = range.to ? toISODate(range.to) : undefined
    return (
      <PreviewStep
        keyword={keyword}
        startDate={startDate}
        {...(endDate ? { endDate } : {})}
        photoUrl={photoUrl}
        comment={comment}
        nickname={currentUser?.nickname ?? "나"}
        profileImageUrl={currentUser?.profileImageUrl ?? null}
        onBack={handleBack}
        onConfirm={handleCommit}
      />
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
      {/* 지도를 흐리게 깔고 상·하단은 흰 그라디언트로 덮어 글자 가독성 확보 */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/65 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-white/65 to-transparent" />

      <div className="relative flex h-[76px] shrink-0 items-center px-4 pt-[env(safe-area-inset-top)]">
        <ButtonIcon
          aria-label="뒤로 가기"
          onClick={handleBack}
          className="pointer-events-auto"
        >
          <img src={iconArrowLeftSrc} alt="" className="size-6" />
        </ButtonIcon>
      </div>

      {/* 회차 칩 + 스텝 타이틀 */}
      <div className="relative flex shrink-0 flex-col items-center gap-2 px-4">
        <span className="rounded-full bg-white/40 px-3 py-1 text-h9 text-fg-neutral-solid shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
          {visitLabel(nth, regionName)}
        </span>
        <h2 className="text-center text-h3 whitespace-pre-line text-fg-neutral-bold [text-shadow:0_0_32px_white]">
          {step === "date" ? "다녀온 기간을\n선택해 주세요" : null}
          {step === "keyword" ? "여행을 대표할\n키워드를 골라주세요" : null}
          {step === "photo" && keyword ? (
            <>
              <span className="underline" style={{ color: keyword.stroke }}>
                {keyword.label}!투어
              </span>
              {" 대표 사진 1장을\n업로드 해주세요"}
            </>
          ) : null}
        </h2>
        {step === "keyword" ? (
          <p className="text-h8-1 text-fg-neutral-solid [text-shadow:0_0_32px_white]">
            키워드 스티커를 지도 위에 붙일 수 있어요
          </p>
        ) : null}
      </div>

      {/* 스텝 콘텐츠 — date는 하단(캘린더), keyword는 중앙, photo는 남는 공간을 채움.
          낮은 화면에서 캘린더가 타이틀을 덮지 않도록 넘치면 스크롤한다 (justify-end 대신
          margin auto — justify-end + overflow 조합은 넘칠 때 위쪽이 잘려 접근 불가) */}
      <div className="pointer-events-auto relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4">
        <div
          className={cn(
            "flex flex-col gap-3",
            step === "keyword" && "my-auto",
            step === "date" && "mt-auto",
            step === "photo" && "min-h-0 flex-1"
          )}
        >
          {step === "date" ? (
            <DateStep
              range={range}
              onRangeChange={setRange}
              revisit={nth > 1}
            />
          ) : null}

          {step === "keyword" ? (
            <KeywordStep
              selected={keywordId}
              onSelect={(id) => {
                setKeywordId(id)
                // 선택 즉시 지도 지역에 색 미리보기 (확인 전에도 결과를 볼 수 있게)
                const picked = findKeyword(id)
                setPreview(
                  picked ? { fill: picked.fill, stroke: picked.stroke } : null
                )
              }}
            />
          ) : null}

          {step === "photo" && keyword ? (
            <PhotoStep
              keyword={keyword}
              photoUrl={photoUrl}
              onPickPhoto={() => photoInputRef.current?.click()}
              comment={comment}
              onCommentChange={setComment}
            />
          ) : null}
        </div>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handlePhotoUpload}
      />

      <div className="pointer-events-auto relative shrink-0 px-4 pt-6 pb-[max(env(safe-area-inset-bottom),34px)]">
        <ButtonCta disabled={nextDisabled} onClick={handleNext}>
          확인
        </ButtonCta>
      </div>
    </div>
  )
}
