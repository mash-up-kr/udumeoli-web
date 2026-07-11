import { useEffect, useRef, useState } from "react"
import { PhotoSlot } from "./PhotoSlot"
import type { CSSProperties } from "react"

import { Tooltip } from "@/shared/ui/tooltip"
import { cn } from "@/shared/lib/utils"

export type GallerySlot = {
  memberId: string
  nickname: string
  profileImageUrl: string | null
  photoUrl: string | null
  isMe: boolean
}

type DateSectionProps = {
  dateISO: string
  slots: Array<GallerySlot>
  onAddPhoto: () => void
  /** 사진 슬롯 클릭 — 사진 자세히 보기 */
  onPhotoClick: (photoUrl: string) => void
  /** 방금 업로드한 멤버 — 해당 슬롯에 등록 팝 애니메이션 적용 */
  poppedMemberId?: string | null
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

// 등록 팝(--animate-photo-pop 0.45s)이 끝나고 잠깐 숨 고른 뒤 완료 연출 시작
const POP_DURATION_MS = 450
const CELEBRATE_DELAY_MS = POP_DURATION_MS + 150

// 2026-05-12 → 2026/05/12 (TUE)
function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  const day = WEEKDAYS[new Date(y, m - 1, d).getDay()]
  return `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")} (${day})`
}

/**
 * 갤러리 날짜 섹션 — 날짜 라벨 + 파티 멤버 슬롯 행.
 * 파티 전원 사진 업로드 완료 시 파란 tint, 한 명이라도 미업로드면 회색 tint + add 슬롯 + 툴팁.
 */
export function DateSection({
  dateISO,
  slots,
  onAddPhoto,
  onPhotoClick,
  poppedMemberId,
}: DateSectionProps) {
  const allUploaded = slots.every((s) => s.photoUrl !== null)
  const slotSize = slots.length <= 4 ? 80 : 64
  // 내 슬롯은 add 버튼 자리 그대로 항상 맨 오른쪽, 나머지는 사진 → 미업로드(zzz) 순 (Figma 1260-10921)
  const slotRank = (s: GallerySlot) =>
    s.isMe ? 2 : s.photoUrl !== null ? 0 : 1
  const ordered = [...slots].sort((a, b) => slotRank(a) - slotRank(b))

  // 전원 업로드가 '완료되는 순간'에만 완료 연출(물결 + 파란 tint) 재생 (완료 상태로 열리면 재생 안 함).
  // 내 등록 팝이 트리거면 팝이 끝난 뒤 시작해 두 애니메이션이 순차 재생되게 한다.
  const [celebrate, setCelebrate] = useState(false)
  // 파란 tint는 완료 연출과 함께 켜짐 — 완료 상태로 열리면 처음부터 파랑
  const [completeTint, setCompleteTint] = useState(allUploaded)
  const prevAllUploaded = useRef(allUploaded)
  useEffect(() => {
    const justCompleted = !prevAllUploaded.current && allUploaded
    prevAllUploaded.current = allUploaded
    if (!justCompleted) return
    const delay = poppedMemberId != null ? CELEBRATE_DELAY_MS : 0
    const timer = setTimeout(() => {
      setCelebrate(true)
      setCompleteTint(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [allUploaded, poppedMemberId])

  // 회색은 피그마 raw 값(#c2c7cb 30%) — 대응 토큰 없음, 디자인 확정 시 재검토
  const tint = completeTint ? "bg-blue-500/30" : "bg-[rgba(194,199,203,0.3)]"

  return (
    <section className="flex w-full flex-col items-center gap-4">
      <p className="w-full text-center font-eng text-e2 text-fg-neutral-bold">
        {formatDateLabel(dateISO)}
      </p>

      <div
        className={cn(
          "relative flex w-full items-center justify-center rounded-[24px] py-2 transition-colors duration-1000 ease-out",
          tint
        )}
      >
        {ordered.map((slot, i) => {
          const rotate = i % 2 === 0 ? 4 : -4
          const photoUrl = slot.photoUrl
          const isAdd = slot.isMe && photoUrl === null
          // 물결이 시작되면 팝 클래스를 내려 내 슬롯도 물결에 합류 — 두 애니메이션이 transform을 공유
          const isPopped = slot.memberId === poppedMemberId && !celebrate
          const wiggle = celebrate
          return (
            <div
              key={slot.memberId}
              className={cn(
                "relative -mr-3 flex items-center justify-center p-[3px] last:mr-0",
                isPopped && "animate-photo-pop",
                wiggle && "animate-photo-wiggle"
              )}
              style={
                wiggle
                  ? ({
                      // 이웃끼리 방향을 엇갈리고 delay로 물결 전파
                      "--wiggle-dir": i % 2 === 0 ? 1 : -1,
                      animationDelay: `${i * 70}ms`,
                    } as CSSProperties)
                  : undefined
              }
            >
              {photoUrl !== null ? (
                <PhotoSlot
                  variant="photo"
                  imageUrl={photoUrl}
                  profileSrc={slot.profileImageUrl}
                  size={slotSize}
                  rotate={rotate}
                  onClick={() => onPhotoClick(photoUrl)}
                />
              ) : isAdd ? (
                <PhotoSlot
                  variant="add"
                  size={slotSize}
                  rotate={rotate}
                  onClick={onAddPhoto}
                />
              ) : (
                <PhotoSlot
                  variant="empty"
                  profileSrc={slot.profileImageUrl}
                  size={slotSize}
                  rotate={rotate}
                />
              )}

              {isAdd ? (
                <Tooltip className="absolute top-[calc(100%-14px)] left-1/2 z-20 -translate-x-1/2">
                  사진을 올려주세요!
                </Tooltip>
              ) : null}
            </div>
          )
        })}

        {/* 하단 반투명 블러 띠 */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[42px] rounded-t-[12px] rounded-b-[24px] border border-neutral-50 backdrop-blur-[2px] transition-colors duration-1000 ease-out",
            tint
          )}
        />
      </div>
    </section>
  )
}
