import * as React from "react"
import { overlay } from "overlay-kit"

import { useRecapStats } from "../api/queries"
import { RECAP_CARD_LAYOUT, cardPercent } from "../lib/recap-layout"
import { createRecapImageBlob, saveRecapImage } from "../lib/save-image"
import { computeRecapStats } from "../lib/stats"
import { RECAP_COUNTRY_LABEL, RECAP_COUNTRY_NAME } from "../lib/recap-model"
import { RecapMapPreview } from "./RecapMapPreview"
import type { RecapCardModel } from "../lib/recap-model"

import { useAllPhotos } from "@/entities/photo"
import { selectCurrentPotMembers, usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { Profile } from "@/shared/ui/profile"
import { showToast } from "@/shared/ui/toast"
import { Tooltip } from "@/shared/ui/tooltip"
import { cn } from "@/shared/lib/utils"
import { USE_MOCK } from "@/shared/api/client"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"
import recapLocationIconSrc from "@/shared/assets/icon-recap-location.svg"
import photoMapSrc from "@/shared/assets/photo-map.jpg"

/** 카드 좌하단 라벨 (시안 3196-5847) — 카드 폭 270 기준 값을 cqw로 환산 */
const RECAP_LABEL_PILL =
  "truncate rounded-full px-[1.85cqw] py-[0.93cqw] text-[3.24cqw] leading-[4.63cqw] whitespace-nowrap text-white backdrop-blur-[4px]"

async function exportRecapImage(
  element: HTMLElement | null,
  model: RecapCardModel,
  preparedBlob?: Blob | null
) {
  if (!element) throw new Error("리캡 카드를 찾을 수 없어요")
  try {
    await saveRecapImage(element, model, preparedBlob)
    showToast({
      message: "이미지가 저장되었어요.",
      icon: "check",
      // CTA(bottom 33 + 높이 56) 위 16px — 토스트 위치 규칙(2차 UT)
      className: "bottom-[105px]",
    })
  } catch (error) {
    console.error("리캡 이미지 저장 실패", error)
    showToast({
      message: "이미지 저장을 실패했어요. 다시 시도해 주세요.",
      icon: "alert",
      className: "bottom-[105px]",
    })
  }
}

function RecapOverlay({ unmount }: { unmount: () => void }) {
  const currentPotId = usePotStore((s) => s.currentPotId)
  const potName = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.name ?? ""
  )
  const members = usePotStore(selectCurrentPotMembers)
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)
  const photos = useAllPhotos(currentPotId)
  const recapCardRef = React.useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = React.useState(false)
  const [mapRetryKey, setMapRetryKey] = React.useState(0)
  const [preparedBlob, setPreparedBlob] = React.useState<Blob | null>(null)
  const [isPreparing, setIsPreparing] = React.useState(false)
  const handleMapReady = React.useCallback(() => setMapReady(true), [])
  const handleMapError = React.useCallback(() => {
    setMapReady(false)
  }, [])
  const handleMapRetry = React.useCallback(() => {
    setMapRetryKey((key) => key + 1)
  }, [])
  const localStats = React.useMemo(() => computeRecapStats(photos), [photos])
  const photoSignature = React.useMemo(
    () =>
      photos
        .map((photo) =>
          [
            photo.id,
            photo.region,
            photo.keyword,
            photo.date,
            photo.endDate ?? "",
            photo.thumbnailUrl,
          ].join(":")
        )
        .join("|"),
    [photos]
  )
  const recapStatsQuery = useRecapStats(currentPotId)
  // 지도는 지역당 스티커 1개만 그린다(visibleStickerTrips) — 툴팁·카드의 "핀 개수"는
  // 여행 횟수가 아니라 기록한 지역 수다 (시안 3065-17817 #1 "핀(장소) 총 개수")
  const { regionCount: pinCount } = USE_MOCK
    ? localStats
    : (recapStatsQuery.data ?? localStats)
  const orderedMembers = React.useMemo(
    () =>
      [...members].sort((a, b) => {
        if (a.id === currentUserId) return -1
        if (b.id === currentUserId) return 1
        return 0
      }),
    [currentUserId, members]
  )
  const recapModel = React.useMemo<RecapCardModel>(
    () => ({
      pinCount,
      potName,
      members: orderedMembers.map((member) => member.nickname),
    }),
    [orderedMembers, pinCount, potName]
  )

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") unmount()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [unmount])

  React.useEffect(() => {
    if (!mapReady) return
    const element = recapCardRef.current
    if (!element) return
    let active = true
    setPreparedBlob(null)
    setIsPreparing(true)
    const promise = createRecapImageBlob(element, recapModel)
    void promise
      .then((blob) => {
        if (active) {
          setPreparedBlob(blob)
          setIsPreparing(false)
        }
      })
      .catch(() => {
        if (active) {
          setPreparedBlob(null)
          setIsPreparing(false)
        }
      })
    return () => {
      active = false
    }
  }, [mapReady, photoSignature, recapModel])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="여행 리캡"
      className="fixed inset-y-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 overflow-hidden bg-[#f2faff]"
    >
      {/* 배경 — 지도가 비쳐 보이는 블러(시안의 하늘색~연두색 그라데이션) + 상/하단 흰 그라데이션 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src={photoMapSrc}
          alt=""
          className="absolute inset-0 size-full scale-110 object-cover object-top opacity-70 blur-[18px]"
        />
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[18px]" />
        <div className="absolute inset-x-0 top-0 h-[163px] bg-gradient-to-b from-white/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[249px] bg-gradient-to-b from-transparent via-white/60 to-white opacity-90 backdrop-blur-[2px]" />
      </div>

      <div className="relative flex h-full flex-col pt-[env(safe-area-inset-top)] pb-[max(env(safe-area-inset-bottom),33px)]">
        {/* 상단 — 뒤로가기(좌) · 팟 이름 + 멤버 + 툴팁(중앙) */}
        <div className="relative h-[164px] shrink-0 px-4">
          <ButtonIcon
            aria-label="뒤로가기"
            onClick={unmount}
            className="absolute top-3.5 left-4"
          >
            <img src={iconArrowLeftSrc} alt="" className="size-6" />
          </ButtonIcon>

          <div className="absolute top-3 left-1/2 flex w-fit -translate-x-1/2 flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <p className="text-h3 text-fg-neutral-bold">{potName}</p>
              <div className="flex items-center">
                {orderedMembers.map((member, index) => (
                  <Profile
                    key={member.id}
                    size="md"
                    src={member.profileImageUrl ?? undefined}
                    alt={`${member.nickname} 프로필`}
                    className={index > 0 ? "-ml-2" : undefined}
                  />
                ))}
              </div>
            </div>
            <Tooltip>
              {RECAP_COUNTRY_NAME}에서{" "}
              <span className="text-fg-brand-solid">{pinCount}개의 핀</span>을
              만들었어요
            </Tooltip>
          </div>
        </div>

        {/* 리캡 이미지 미리보기 — 임시 placeholder (최종 그래픽은 추후 확정, 시안 #4) */}
        <div className="relative min-h-0 flex-1 px-4 pb-6">
          <div
            role="img"
            aria-label="리캡 이미지 미리보기"
            data-recap-card
            ref={recapCardRef}
            className="[container-type:inline-size] absolute top-0 left-1/2 aspect-[270/480] h-auto max-h-[calc(100dvh-285px)] w-[min(320px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[32px] border-2 border-[#232936] bg-[#79d5e6] shadow-[0_6px_18px_rgba(35,41,54,0.14)]"
          >
            <div
              className="absolute z-10"
              style={{
                top: cardPercent(RECAP_CARD_LAYOUT.heading.top, 480),
                left: cardPercent(RECAP_CARD_LAYOUT.padding, 270),
              }}
            >
              <div className="flex flex-col gap-[0.93cqw] font-eng font-normal tracking-normal text-[#141820]">
                <div className="flex items-end gap-[0.93cqw] text-[10.19cqw] leading-[10.19cqw] whitespace-nowrap">
                  <span className="text-fg-brand-solid">{pinCount}</span>
                  <span>PINNNED</span>
                </div>
                <span className="text-[8.33cqw] leading-[8.33cqw] whitespace-nowrap">
                  {RECAP_COUNTRY_LABEL}
                </span>
              </div>
            </div>
            <img
              src={recapLocationIconSrc}
              alt=""
              data-recap-location-icon
              className="absolute z-10"
              style={{
                top: cardPercent(RECAP_CARD_LAYOUT.locationIcon.top, 480),
                right: cardPercent(RECAP_CARD_LAYOUT.locationIcon.right, 270),
                width: cardPercent(RECAP_CARD_LAYOUT.locationIcon.width, 270),
                height: cardPercent(RECAP_CARD_LAYOUT.locationIcon.height, 480),
              }}
            />
            <RecapMapPreview
              photos={photos}
              className="absolute inset-0"
              onReady={handleMapReady}
              onError={handleMapError}
              onRetry={handleMapRetry}
              retryKey={mapRetryKey}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
            <div
              className="absolute z-10 flex flex-col items-start gap-[0.93cqw]"
              style={{
                bottom: cardPercent(RECAP_CARD_LAYOUT.labels.bottom, 480),
                left: cardPercent(RECAP_CARD_LAYOUT.labels.left, 270),
                maxWidth: cardPercent(RECAP_CARD_LAYOUT.labels.maxWidth, 270),
              }}
            >
              <span
                className={cn(RECAP_LABEL_PILL, "bg-[#232936] font-semibold")}
              >
                {potName}
              </span>
              <div className="flex flex-wrap gap-[0.93cqw]">
                {orderedMembers.map((member) => (
                  <span
                    key={member.id}
                    className={cn(
                      RECAP_LABEL_PILL,
                      "max-w-full bg-[#232936]/40"
                    )}
                  >
                    @{member.nickname}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4">
          <ButtonCta
            disabled={!mapReady || isPreparing}
            onClick={() =>
              void exportRecapImage(
                recapCardRef.current,
                recapModel,
                preparedBlob
              )
            }
          >
            {isPreparing ? "이미지 준비 중..." : "이미지로 내보내기"}
          </ButtonCta>
        </div>
      </div>
    </div>
  )
}

/**
 * 여행 리캡 화면 (시안 1745-38161) — 지도 위 풀스크린 오버레이(모달).
 * 뒤로가기·ESC로 닫으면 홈(지도)으로 복귀한다.
 */
export function openRecapOverlay(): void {
  overlay.open(({ unmount }) => <RecapOverlay unmount={unmount} />)
}
