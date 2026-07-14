import { useRef, useState } from "react"
import { MapPin, PencilLine, Plus } from "lucide-react"

import { DateSection } from "./DateSection"
import { openPhotoViewer } from "./openPhotoViewer"
import type { PointerEvent as ReactPointerEvent } from "react"
import type { GallerySlot } from "./DateSection"
import type { Photo } from "@/entities/photo"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { showToast } from "@/shared/ui/toast"
import {
  REGION_CENTERS,
  useAllPhotos,
  usePhotoUploadStore,
} from "@/entities/photo"
import { formatRegionName } from "@/entities/region"
import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { openDatePickerSheet, pickImageFile } from "@/features/photo-upload"

// Figma 812 프레임 기준(1319-14756): 지도 뷰 top 568 → 노출 높이 244, 리스트 뷰 top 54
const PEEK_VISIBLE = 244
// 스냅 위치와 무관하게 이만큼 끌면 드래그 방향으로 전환 (플릭 제스처)
const SWIPE_THRESHOLD = 80

type GalleryPanelProps = {
  region: string
  /** true=리스트 뷰(top 54) / false=지도 뷰(하단 244px 노출) */
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

/**
 * 지역 상세 갤러리 패널 — 지도 위에 상시 노출되는 드래그 시트 (dim 없음).
 * 핸들 드래그로 지도 뷰 ↔ 리스트 뷰 전환, 날짜 리스트는 패널 안에서 스크롤.
 */
export function GalleryPanel({
  region,
  expanded,
  onExpandedChange,
}: GalleryPanelProps) {
  const currentPotId = usePotStore((s) => s.currentPotId)
  const photos = useAllPhotos(currentPotId).filter((p) => p.region === region)
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)
  const partyMembers = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.members ?? []
  )
  const currentUser = useSessionStore((s) => s.currentUser)
  const currentUserId = currentUser?.id ?? null
  // 방금 업로드한 날짜 — 해당 행의 내 슬롯에 등록 팝 애니메이션
  const [poppedDate, setPoppedDate] = useState<string | null>(null)

  // 드래그는 translate3d(GPU 컴포지터)로만 움직이고, 이동 중엔 리렌더 없이
  // ref로 transform을 직접 갱신해 프레임 드랍을 막는다. 스냅 복귀만 CSS transition.
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{
    pointerY: number
    offset: number
    max: number
  } | null>(null)

  // 패널은 리스트 뷰 위치(top 54)에 고정하고 translateY로 지도 뷰까지 내림
  const restingTransform = expanded
    ? "translate3d(0, 0, 0)"
    : `translate3d(0, max(0px, calc(100% - ${PEEK_VISIBLE}px)), 0)`

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current
    if (!panel) return
    const max = Math.max(0, panel.clientHeight - PEEK_VISIBLE)
    dragStartRef.current = {
      pointerY: e.clientY,
      offset: expanded ? 0 : max,
      max,
    }
    panel.style.transitionDuration = "0s"
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current
    const panel = panelRef.current
    if (!start || !panel) return
    const next = Math.min(
      start.max,
      Math.max(0, start.offset + (e.clientY - start.pointerY))
    )
    panel.style.transform = `translate3d(0, ${next}px, 0)`
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current
    const panel = panelRef.current
    dragStartRef.current = null
    if (!start || !panel) return
    panel.style.transitionDuration = ""

    const dy = e.clientY - start.pointerY
    const offset = Math.min(start.max, Math.max(0, start.offset + dy))
    const nextExpanded =
      dy <= -SWIPE_THRESHOLD
        ? true
        : dy >= SWIPE_THRESHOLD
          ? false
          : offset < start.max / 2 // 중간점 기준 가까운 쪽

    if (nextExpanded === expanded) {
      // 상태가 그대로면 리렌더가 없으므로 직접 제자리 복귀
      panel.style.transform = restingTransform
    } else {
      onExpandedChange(nextExpanded)
    }
  }

  const byDate = new Map<string, Array<Photo>>()
  for (const p of photos) {
    byDate.set(p.date, [...(byDate.get(p.date) ?? []), p])
  }
  const dates = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1))

  const toSlots = (date: string): Array<GallerySlot> => {
    const group = byDate.get(date) ?? []
    return partyMembers.map((member) => {
      // 같은 유저·같은 날짜에 여러 장이면 마지막 등록분 노출
      const photo = group.filter((p) => p.uploaderId === member.id).at(-1)
      const isMe = member.id === currentUserId
      return {
        memberId: member.id,
        // 내 슬롯은 목 멤버 정보 대신 로그인한 세션 닉네임·프로필 노출
        nickname: isMe
          ? (currentUser?.nickname ?? member.nickname)
          : member.nickname,
        profileImageUrl: isMe
          ? (currentUser?.profileImageUrl ?? member.profileImageUrl)
          : member.profileImageUrl,
        photoUrl: photo ? photo.thumbnailUrl : null,
        isMe,
      }
    })
  }

  const registerPhoto = (date: string, url: string) => {
    if (!currentUserId) return
    const center = REGION_CENTERS[region] ?? { lat: 36.2, lng: 127.8 }
    addPhoto({
      id: `up-${region}-${date}-${Date.now()}`,
      region,
      date,
      lat: center.lat,
      lng: center.lng,
      thumbnailUrl: url,
      uploaderId: currentUserId,
      potId: currentPotId,
    })
    setPoppedDate(date)
    // 지도 뷰에선 패널(하단 244px 노출) 위로, 리스트 뷰(풀스크린)에선 기본 하단 위치
    showToast({
      message: "업로드가 완료됐어요",
      icon: "check",
      className: expanded ? undefined : "bottom-[256px]",
    })
  }

  // 날짜 행의 add 슬롯: 날짜 고정, 이미지 선택만
  const uploadForDate = (date: string) => {
    pickImageFile((url) => registerPhoto(date, url))
  }

  // 헤더 추가: 이미지 선택 → 날짜 선택
  const uploadWithDatePicker = () => {
    pickImageFile((url) => {
      openDatePickerSheet((date) => registerPhoto(date, url))
    })
  }

  return (
    <div
      ref={panelRef}
      className="absolute inset-x-0 top-[54px] bottom-0 z-20 flex flex-col overflow-hidden rounded-t-[40px] bg-background shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)] transition-transform duration-300 ease-out will-change-transform"
      style={{ transform: restingTransform }}
    >
      {/* 드래그 핸들 — 지도 뷰 ↔ 리스트 뷰 전환 (Figma #4·4-1, 핸들 위 14 아래 20) */}
      <div
        className="flex w-full shrink-0 cursor-grab touch-none justify-center pt-3.5 pb-5 active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="h-[5px] w-9 rounded-full bg-neutral-200" />
      </div>

      {/* Header — 수정 · 지역명 · 추가 */}
      <div className="flex w-full shrink-0 items-center justify-between gap-4 px-6">
        <ButtonIcon
          variant="label"
          aria-label="수정"
          onClick={() => showToast({ message: "준비 중인 기능이에요" })}
        >
          <PencilLine />
          수정
        </ButtonIcon>
        <span className="inline-flex items-center gap-2 rounded-full bg-bg-neutral-inverse px-5 py-2">
          <MapPin className="size-6 text-fg-neutral-inverse" />
          <span className="text-h3 text-fg-neutral-inverse">
            {formatRegionName(region)}
          </span>
        </span>
        <ButtonIcon
          variant="label"
          aria-label="사진 추가"
          onClick={uploadWithDatePicker}
        >
          <Plus />
          추가
        </ButtonIcon>
      </div>

      {/* 날짜별 갤러리 — 헤더와 Spacing/x6(24px), 넘치면 패널 안에서 스크롤 */}
      <div className="mt-6 flex flex-1 flex-col items-center gap-8 overflow-y-auto px-5 pb-4">
        {dates.length === 0 || partyMembers.length === 0 ? (
          <p className="py-8 text-center text-b6 text-fg-neutral-subtle">
            아직 사진이 없어요. + 추가로 등록해 보세요.
          </p>
        ) : (
          dates.map((date) => (
            <DateSection
              key={date}
              dateISO={date}
              slots={toSlots(date)}
              onAddPhoto={() => uploadForDate(date)}
              onPhotoClick={openPhotoViewer}
              poppedMemberId={poppedDate === date ? currentUserId : null}
            />
          ))
        )}
      </div>
    </div>
  )
}
