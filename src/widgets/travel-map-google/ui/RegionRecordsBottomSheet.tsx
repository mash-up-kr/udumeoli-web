import { useRef, useState } from "react"
import { resolveSheetDrag } from "../lib/sheetDrag"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"
import type { PotMember } from "@/entities/travel-pot"
import type { Photo } from "@/entities/photo"
import { findKeyword, groupTrips, useAllPhotos } from "@/entities/photo"
import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { formatRegionName } from "@/entities/region"
import { cn } from "@/shared/lib/utils"
import { DEFAULT_PROFILE_SRC } from "@/shared/ui/profile"
import { BottomSheetTitle } from "@/shared/ui/bottom-sheet"
import iconAddSrc from "@/shared/assets/icon-add.svg"
import iconZzzSrc from "@/shared/assets/icon-zzz.svg"

type RegionRecordsBottomSheetProps = {
  region: string
  members: Array<PotMember>
  photos: Array<Photo>
  onClose: () => void
  onAddPhoto: () => void
}

function MemberChip({
  member,
  isMe,
  onImage,
}: {
  member: PotMember
  isMe: boolean
  onImage: boolean
}) {
  const currentUser = useSessionStore((s) => s.currentUser)
  const profileImageUrl = isMe
    ? (currentUser?.profileImageUrl ?? member.profileImageUrl)
    : member.profileImageUrl
  const nickname = isMe
    ? (currentUser?.nickname ?? member.nickname)
    : member.nickname

  return (
    <span className="flex min-w-0 items-center gap-1">
      <img
        src={profileImageUrl ?? DEFAULT_PROFILE_SRC}
        alt=""
        className="size-4 shrink-0 rounded-full border border-stroke-neutral-weak object-cover"
      />
      <span
        className={cn(
          "max-w-24 truncate text-h9",
          onImage ? "text-fg-neutral-inverse" : "text-fg-neutral-bold"
        )}
      >
        {nickname}
      </span>
      {isMe ? (
        <span className="shrink-0 rounded-full bg-bg-brand-solid px-1 font-eng text-e4 text-fg-neutral-inverse">
          ME!
        </span>
      ) : null}
    </span>
  )
}

function RecordTile({
  member,
  photo,
  isMe,
  onAddPhoto,
  className,
}: {
  member: PotMember
  photo: Photo | undefined
  isMe: boolean
  onAddPhoto: () => void
  className?: string
}) {
  if (!photo) {
    return (
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-[17px] border bg-bg-neutral-solid",
          className,
          isMe
            ? "border-dashed border-stroke-neutral-subtle"
            : "border-solid border-stroke-neutral-weak"
        )}
      >
        <div className="absolute inset-x-3.5 top-3.5">
          <MemberChip member={member} isMe={isMe} onImage={false} />
        </div>
        {isMe ? (
          <button
            type="button"
            onClick={onAddPhoto}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-h8 text-fg-neutral-bold"
          >
            <img src={iconAddSrc} alt="" className="size-9" />내 사진 올리기
          </button>
        ) : (
          <img
            src={iconZzzSrc}
            alt="아직 기록하지 않았어요"
            className="absolute top-1/2 left-1/2 w-[47px] -translate-x-1/2 -translate-y-1/2"
          />
        )}
      </div>
    )
  }

  const keyword = findKeyword(photo.keyword)
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-[17px] border border-stroke-neutral-weak bg-bg-neutral-solid",
        className
      )}
    >
      <img
        src={photo.thumbnailUrl}
        alt={`${member.nickname}의 ${keyword?.label ?? "여행"} 사진`}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-transparent" />
      <div className="absolute inset-x-3.5 top-3.5 flex flex-col gap-2">
        <MemberChip member={member} isMe={isMe} onImage />
        {photo.comment ? (
          <p className="line-clamp-2 text-b8 text-fg-neutral-inverse">
            {photo.comment}
          </p>
        ) : null}
      </div>
      {keyword ? (
        <img
          src={keyword.emojiSrc}
          alt={keyword.label}
          className="absolute top-3.5 right-3.5 size-7 object-contain"
        />
      ) : null}
    </div>
  )
}

/** 한 지역을 다시 등록하지 않고, 팟의 기존 기록을 둘러보는 시트. */
export function RegionRecordsBottomSheet({
  region,
  members,
  photos,
  onClose,
  onAddPhoto,
}: RegionRecordsBottomSheetProps) {
  const currentUserId = useSessionStore((s) => s.currentUser?.id)
  const potId = usePotStore((s) => s.currentPotId)
  const livePhotos = useAllPhotos(potId).filter(
    (photo) => photo.region === region
  )
  const regionPhotos =
    livePhotos.length > 0
      ? livePhotos
      : photos.filter((photo) => photo.region === region)
  const latestTrip = groupTrips(regionPhotos)[0]
  const [expanded, setExpanded] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  // 드래그로 끝난 제스처의 뒤따르는 click을 삼켜, 타일 버튼 오작동을 막는다
  const suppressClick = useRef(false)
  const frame = useRef(0)
  /** 본문에서 눌렀지만 아직 시트가 가져가지 않은 제스처의 시작 y. */
  const pending = useRef<number | null>(null)
  const drag = useRef<{
    startY: number
    startOffset: number
    lastY: number
    lastT: number
    velocity: number
  } | null>(null)

  // 시트는 항상 최대 높이로 두고, 낮은 단계는 아래로 밀어 만든다 — 높이가 아니라
  // transform만 바뀌므로 매 프레임 레이아웃 없이 컴포지터에서 처리된다.
  const initialHeight =
    members.length === 2
      ? "calc(var(--app-vh) * 0.29)"
      : members.length >= 5
        ? "calc(var(--app-vh) - 94px)"
        : members.length === 1
          ? "calc(var(--app-vh) * 0.52)"
          : "calc(var(--app-vh) * 0.61)"
  const restY = (isExpanded: boolean) =>
    isExpanded
      ? "0px"
      : `max(0px, calc(min(720px, var(--app-vh) - 32px) - ${initialHeight}))`

  const setY = (value: string) =>
    sheetRef.current?.style.setProperty("--sheet-y", value)

  const claim = (event: ReactPointerEvent<HTMLElement>, fromY: number) => {
    const sheet = sheetRef.current
    if (!sheet) return
    drag.current = {
      startY: fromY,
      // fixed bottom-0 기준이라 아래로 민 만큼이 그대로 뷰포트 밖으로 나간 높이가 된다
      startOffset: Math.max(
        0,
        Math.round(sheet.getBoundingClientRect().bottom - window.innerHeight)
      ),
      lastY: fromY,
      lastT: event.timeStamp,
      velocity: 0,
    }
    // 손가락이 자식(타일·버튼)을 벗어나도 move/up이 계속 들어오게 한다
    sheet.setPointerCapture(event.pointerId)
    sheet.style.transitionDuration = "0s"
    sheet.style.willChange = "transform"
  }

  const beginPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary) return
    suppressClick.current = false
    pending.current = null
    const target = event.target as HTMLElement
    if (target.closest("[data-sheet-drag]")) {
      claim(event, event.clientY)
      return
    }
    // 본문에서 시작한 제스처는 일단 네이티브 스크롤에 맡기고, 맨 위에서 아래로
    // 끄는 순간에만 시트가 가져간다 — 스크롤과 드래그가 서로를 끊지 않게.
    pending.current = event.clientY
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const startY = pending.current
    if (startY !== null) {
      if (event.clientY <= startY) return
      if ((bodyRef.current?.scrollTop ?? 0) > 0) return
      pending.current = null
      claim(event, event.clientY)
      return
    }
    const state = drag.current
    if (!state) return
    const dt = event.timeStamp - state.lastT
    if (dt > 0) state.velocity = (event.clientY - state.lastY) / dt
    state.lastY = event.clientY
    state.lastT = event.timeStamp
    event.preventDefault()
    // 포인터는 프레임보다 빨리 들어온다 — 프레임당 한 번만 쓴다
    const y = Math.max(0, state.startOffset + event.clientY - state.startY)
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => setY(`${y}px`))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const state = drag.current
    drag.current = null
    pending.current = null
    cancelAnimationFrame(frame.current)
    const sheet = sheetRef.current
    if (sheet?.hasPointerCapture(event.pointerId)) {
      sheet.releasePointerCapture(event.pointerId)
    }
    if (!state || !sheet) return
    // pointercancel은 clientY를 믿을 수 없어 마지막 move 좌표를 쓴다
    const endY = event.type === "pointerup" ? event.clientY : state.lastY
    if (Math.abs(endY - state.startY) > 6) suppressClick.current = true

    sheet.style.transitionDuration = ""
    sheet.style.willChange = ""
    const outcome = resolveSheetDrag({
      delta: endY - state.startY,
      velocity: state.velocity,
      expanded,
    })
    if (outcome === "close") {
      onClose()
      return
    }
    // 목표 위치를 지금 바로 써 넣는다 — 쉬는 값으로 한 프레임 되돌아갔다가
    // 리렌더 후 다시 움직이는 튐을 막는다
    const nextExpanded = outcome === "settle" ? expanded : outcome === "expand"
    setY(restY(nextExpanded))
    if (outcome !== "settle") setExpanded(nextExpanded)
  }

  const keywordCounts = new Map<string, number>()
  for (const photo of regionPhotos) {
    if (photo.keyword) {
      keywordCounts.set(
        photo.keyword,
        (keywordCounts.get(photo.keyword) ?? 0) + 1
      )
    }
  }
  const keywords = [...keywordCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => findKeyword(id as NonNullable<Photo["keyword"]>))
    .filter((keyword): keyword is NonNullable<typeof keyword> =>
      Boolean(keyword)
    )

  return (
    <div
      ref={sheetRef}
      onPointerDownCapture={beginPointer}
      onPointerMoveCapture={handlePointerMove}
      onPointerUpCapture={handlePointerUp}
      onPointerCancelCapture={handlePointerUp}
      onClickCapture={(event) => {
        if (!suppressClick.current) return
        suppressClick.current = false
        event.preventDefault()
        event.stopPropagation()
      }}
      style={{ "--sheet-y": restY(expanded) } as CSSProperties}
      className="pointer-events-auto flex h-[min(720px,calc(var(--app-vh)_-_32px))] translate-y-[var(--sheet-y)] flex-col overflow-hidden rounded-t-[28px] bg-background transition-transform duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] select-none [-webkit-tap-highlight-color:transparent]"
    >
      <button
        type="button"
        data-sheet-handle
        data-sheet-drag
        className="flex h-8 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        aria-label="아래로 밀어 닫기"
      >
        <span className="h-1.5 w-9 rounded-full bg-neutral-200" />
      </button>
      <div
        data-sheet-drag
        className="flex shrink-0 touch-none items-start gap-4 px-4 pt-5 pb-4"
      >
        <div className="min-w-0">
          <BottomSheetTitle className="text-left text-h5-1">
            {formatRegionName(region)}
          </BottomSheetTitle>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {keywords.map((keyword) => (
              <span
                key={keyword.id}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-b7"
                style={{
                  backgroundColor: `${keyword.mapColor}1a`,
                  color: keyword.mapColor,
                }}
              >
                <img
                  src={keyword.emojiSrc}
                  alt=""
                  className="size-5 object-contain"
                />
                {keyword.label} {keywordCounts.get(keyword.id)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        ref={bodyRef}
        className={cn(
          // touch-action은 상속되지 않으므로 스크롤 컨테이너에 직접 건다.
          // 세로 패닝만 열어 네이티브 스크롤(관성·바운스)을 그대로 쓰고,
          // 맨 위에서 아래로 끄는 순간은 handlePointerMove가 시트 드래그로 가져간다.
          "grid min-h-0 flex-1 touch-pan-y content-start items-start overflow-y-auto overscroll-contain px-4 pb-4",
          members.length === 1 ? "grid-cols-1 gap-2.5" : "grid-cols-2 gap-2.5"
        )}
      >
        {members.map((member) => {
          const photo = latestTrip.photos
            .filter((item) => item.uploaderId === member.id)
            .at(-1)
          return (
            <RecordTile
              key={member.id}
              member={member}
              photo={photo}
              isMe={member.id === currentUserId}
              onAddPhoto={onAddPhoto}
              className={members.length === 1 ? "aspect-[0.91]" : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
