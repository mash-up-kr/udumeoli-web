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
  ALLOWED_PHOTO_ACCEPT,
  ALLOWED_PHOTO_LABEL,
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_UPLOAD_BYTES,
  MAX_PHOTO_UPLOAD_MB,
  findKeyword,
  groupTrips,
  regionStrokeForFill,
  uploadErrorMessage,
  useAllPhotos,
  useCreatePhoto,
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
  /** 팟원이 먼저 만든 여행에 합류할 때는 날짜/키워드를 고정하고 사진 단계부터 시작한다. */
  collaborationTrip?: CollaborationRecordSeed | null
  onClose?: () => void
  onComplete?: () => void
}

export type CollaborationRecordSeed = {
  startDate: string
  endDate: string
  keyword?: TravelKeywordId
  tripId?: string
}

function parseISODate(iso: string): Date | undefined {
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

/**
 * 여행 기록 플로우 (기간 → 키워드 → 사진·코멘트 → 확인) — Figma 1836-15911.
 * 지도 위 풀스크린 오버레이. 지도 조작은 TravelMapGoogleImpl이 잠금/점선 처리한다.
 */
export function TravelRecordFlow({
  region,
  center,
  collaborationTrip,
  onClose,
  onComplete,
}: TravelRecordFlowProps) {
  const currentPotId = usePotStore((s) => s.currentPotId)
  const currentUser = useSessionStore((s) => s.currentUser)
  const currentUserId = currentUser?.id ?? null
  const setColor = useRegionColorStore((s) => s.setColor)
  const createPhotoMutation = useCreatePhoto()
  const photos = useAllPhotos(currentPotId)
  const step = useRecordStore((s) => s.step)
  const goStep = useRecordStore((s) => s.setStep)
  const setPreview = useRecordStore((s) => s.setPreview)
  const closeStore = useRecordStore((s) => s.close)

  const isCollaboration = Boolean(collaborationTrip)
  const fixedRange = React.useMemo<DateRange | undefined>(() => {
    if (!collaborationTrip) return undefined
    const from = parseISODate(collaborationTrip.startDate)
    const to = parseISODate(collaborationTrip.endDate)
    if (!from) return undefined
    return { from, ...(to ? { to } : {}) }
  }, [collaborationTrip])

  const [range, setRange] = React.useState<DateRange | undefined>(
    () => fixedRange
  )
  const [keywordId, setKeywordId] = React.useState<TravelKeywordId | null>(
    () => collaborationTrip?.keyword ?? null
  )
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const [photoFile, setPhotoFile] = React.useState<File | null>(null)
  const [comment, setComment] = React.useState("")
  const photoInputRef = React.useRef<HTMLInputElement>(null)
  const revisitToastShownRef = React.useRef(false)

  const keyword = findKeyword(keywordId ?? undefined)
  const regionName = formatRegionName(region)

  React.useEffect(() => {
    if (!collaborationTrip) return
    setRange(fixedRange)
    setKeywordId(collaborationTrip.keyword ?? null)
    setPhotoUrl(null)
    setPhotoFile(null)
    setComment("")
  }, [collaborationTrip, fixedRange])

  const closeFlow = React.useCallback(() => {
    closeStore()
    onClose?.()
  }, [closeStore, onClose])

  // 이번 기록이 이 지역의 몇 번째 방문인지 (Figma #3·#5).
  // 팟원이 만든 여행에 합류하는 경우엔 회차가 늘지 않는다 — 그 여행이 몇 번째였는지를
  // 그대로 쓴다 (groupTrips는 최신순이라 뒤에서부터 세면 등록 순서가 된다)
  const nth = React.useMemo(() => {
    const trips = groupTrips(photos.filter((p) => p.region === region))
    if (!collaborationTrip) return trips.length + 1
    const index = trips.findIndex(
      (trip) => trip.startDate === collaborationTrip.startDate
    )
    return index === -1 ? trips.length : trips.length - index
  }, [photos, region, collaborationTrip])
  const revisit = nth > 1

  const handleRangeChange = React.useCallback(
    (nextRange: DateRange | undefined) => {
      setRange(nextRange)
      if (!revisit || !nextRange?.from || revisitToastShownRef.current) return
      revisitToastShownRef.current = true
      // 시안(1836-15756)은 캘린더 카드 위(상단 1/3 지점)에 띄운다 — 하단은 CTA·캘린더가 가린다
      showToast({
        message: "이미 기록한 지역은 새로운 기록으로 쌓여요.",
        icon: "check",
        className: "top-1/3 bottom-auto",
      })
    },
    [revisit]
  )

  const handleBack = () => {
    if (isCollaboration && step === "photo") closeFlow()
    else if (step === "date") closeFlow()
    else if (step === "keyword") goStep("date")
    else if (step === "photo") goStep("keyword")
    else goStep("photo")
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // BE 허용 포맷·용량 제한 — 초과/미지원 파일은 요청 전에 걸러 안내.
    // value를 비워 같은 파일 재선택도 onchange가 뜨게 한다.
    // type이 빈 파일은 업로드 시 image/jpeg 폴백(photo.api)이 있어 통과시킨다
    if (file.type && !ALLOWED_PHOTO_TYPES.includes(file.type)) {
      e.target.value = ""
      showToast({
        message: `${ALLOWED_PHOTO_LABEL} 형식 사진만 등록할 수 있어요.`,
        icon: "alert",
      })
      return
    }
    if (file.size > MAX_PHOTO_UPLOAD_BYTES) {
      e.target.value = ""
      showToast({
        message: `사진은 최대 ${MAX_PHOTO_UPLOAD_MB}MB까지 등록할 수 있어요.`,
        icon: "alert",
      })
      return
    }
    setPhotoFile(file)
    // 재선택 시 이전 blob URL 회수 (최종 커밋된 URL은 목 사진이 계속 사용하므로 그대로 둠)
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

  // 최종 커밋 — 사진(여행) 등록 성공 시 지역 색상(키워드 기준) 반영 후 지도로 복귀
  const handleCommit = async () => {
    if (!photoUrl || !photoFile || !currentUserId || !range?.from) return
    if (createPhotoMutation.isPending) return
    const startDate = toISODate(range.from)
    const endDate = range.to ? toISODate(range.to) : undefined
    try {
      await createPhotoMutation.mutateAsync({
        potId: currentPotId,
        region,
        date: startDate,
        ...(endDate && endDate !== startDate ? { endDate } : {}),
        ...(collaborationTrip?.tripId
          ? { tripId: collaborationTrip.tripId }
          : {}),
        ...(keyword ? { keyword: keyword.id } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
        uploaderId: currentUserId,
        file: photoFile,
        previewUrl: photoUrl,
        center,
      })
    } catch (error) {
      showToast({
        message: uploadErrorMessage(error),
        icon: "alert",
        className: "bottom-[106px]",
      })
      return
    }
    if (keyword) setColor(currentPotId, region, keyword.fill)
    closeFlow()
    onComplete?.()
    // 하단 지역 카드 캐러셀(≈246px) 위로 띄워 겹치지 않게 (Figma 1836-14957 #16)
    showToast({
      message: isCollaboration
        ? "업로드가 완료됐어요"
        : `'${regionName}' 여행 Pinned 완료!`,
      icon: "check",
      className: "bottom-[clamp(180px,32dvh,256px)]",
    })
  }

  const nextDisabled =
    (step === "date" && !range?.from) ||
    (step === "keyword" && keywordId === null) ||
    (step === "photo" && photoUrl === null)

  if (step === "preview" && photoUrl && range?.from) {
    const startDate = toISODate(range.from)
    const endDate = range.to ? toISODate(range.to) : undefined
    return (
      <PreviewStep
        keyword={keyword ?? null}
        startDate={startDate}
        {...(endDate ? { endDate } : {})}
        photoUrl={photoUrl}
        comment={comment}
        nickname={currentUser?.nickname ?? "나"}
        profileImageUrl={currentUser?.profileImageUrl ?? null}
        pending={createPhotoMutation.isPending}
        onBack={handleBack}
        onConfirm={handleCommit}
      />
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
      {/* 지도를 흐리게 깔고 상·하단은 흰 그라디언트로 덮어 글자 가독성 확보 */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[12px]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/65 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-white/65 to-transparent" />

      <div className="relative z-10 flex h-[76px] shrink-0 items-center px-4 pt-[env(safe-area-inset-top)]">
        <ButtonIcon
          aria-label="뒤로 가기"
          onClick={handleBack}
          className="pointer-events-auto"
        >
          <img src={iconArrowLeftSrc} alt="" className="size-6" />
        </ButtonIcon>
      </div>

      {/* 회차 칩 + 스텝 타이틀 */}
      <div className="relative z-10 flex shrink-0 flex-col items-center gap-2 px-4">
        <span className="rounded-full bg-white/40 px-3 py-1 text-h9 text-fg-neutral-solid shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
          {visitLabel(nth, regionName)}
        </span>
        <h2 className="text-center text-h3 whitespace-pre-line text-fg-neutral-bold [text-shadow:0_0_32px_white]">
          {/* 첫 방문은 "기간", 재방문은 "날짜" (Figma 1836-15777 / 1836-15756) */}
          {step === "date"
            ? revisit
              ? "다녀온 날짜를\n선택해 주세요"
              : "다녀온 기간을\n선택해 주세요"
            : null}
          {step === "keyword" ? "여행을 대표할\n키워드를 골라주세요" : null}
          {step === "photo" && keyword ? (
            <>
              <span className="underline" style={{ color: keyword.mapColor }}>
                {keyword.label}!투어
              </span>
              {" 대표 사진 1장을\n업로드 해주세요"}
            </>
          ) : null}
          {step === "photo" && !keyword
            ? "대표 사진 1장을\n업로드 해주세요"
            : null}
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
      <div className="travel-record-step-scroll pointer-events-auto relative flex min-h-0 flex-1 touch-pan-y [scrollbar-width:none] flex-col overflow-y-auto overscroll-contain px-4 pt-4 pb-6 [&::-webkit-scrollbar]:hidden">
        <div
          className={cn(
            "flex flex-col gap-3",
            step === "keyword" && "my-auto",
            step === "date" && "mt-auto",
            step === "photo" &&
              "travel-record-photo-content min-h-0 flex-1 pt-[clamp(24px,8dvh,64px)]"
          )}
        >
          {step === "date" && !isCollaboration ? (
            <DateStep
              range={range}
              onRangeChange={handleRangeChange}
              revisit={revisit}
            />
          ) : null}

          {step === "keyword" && !isCollaboration ? (
            <KeywordStep
              selected={keywordId}
              onSelect={(id) => {
                setKeywordId(id)
                // 선택 즉시 지도 지역에 색 미리보기 (확인 전에도 결과를 볼 수 있게).
                // 완료 시 실제 색칠은 mapColor라(buildMapFills) 미리보기도 같은 색을 쓴다 —
                // 칩용 fill(primitive 100)을 쓰면 모든 테마에서 미리보기가 실제와 어긋난다
                const picked = findKeyword(id)
                setPreview(
                  picked
                    ? {
                        fill: picked.mapColor,
                        stroke:
                          regionStrokeForFill(picked.mapColor) ??
                          picked.mapColor,
                      }
                    : null
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
        accept={ALLOWED_PHOTO_ACCEPT}
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
