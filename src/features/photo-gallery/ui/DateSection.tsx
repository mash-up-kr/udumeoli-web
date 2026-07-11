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
  // 회색은 피그마 raw 값(#c2c7cb 30%) — 대응 토큰 없음, 디자인 확정 시 재검토
  const tint = allUploaded ? "bg-blue-500/30" : "bg-[rgba(194,199,203,0.3)]"
  // 내 슬롯은 add 버튼 자리 그대로 항상 맨 오른쪽, 나머지는 사진 → 미업로드(zzz) 순 (Figma 1260-10921)
  const slotRank = (s: GallerySlot) =>
    s.isMe ? 2 : s.photoUrl !== null ? 0 : 1
  const ordered = [...slots].sort((a, b) => slotRank(a) - slotRank(b))

  // 전원 업로드가 '완료되는 순간'에만 행 전체 물결 흔들림 (완료 상태로 열리면 재생 안 함)
  const [celebrate, setCelebrate] = useState(false)
  const prevAllUploaded = useRef(allUploaded)
  useEffect(() => {
    if (!prevAllUploaded.current && allUploaded) setCelebrate(true)
    prevAllUploaded.current = allUploaded
  }, [allUploaded])

  return (
    <section className="flex w-full flex-col items-center gap-4">
      <p className="w-full text-center font-eng text-e2 text-fg-neutral-bold">
        {formatDateLabel(dateISO)}
      </p>

      <div
        className={cn(
          "relative flex w-full items-center justify-center rounded-[24px] py-2 transition-colors duration-500",
          tint
        )}
      >
        {ordered.map((slot, i) => {
          const rotate = i % 2 === 0 ? 4 : -4
          const photoUrl = slot.photoUrl
          const isAdd = slot.isMe && photoUrl === null
          const isPopped = slot.memberId === poppedMemberId
          // 팝이 재생 중인 내 슬롯은 물결에서 제외 — 두 애니메이션이 transform을 공유
          const wiggle = celebrate && !isPopped
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
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[42px] rounded-t-[12px] rounded-b-[24px] border border-neutral-50 backdrop-blur-[2px] transition-colors duration-500",
            tint
          )}
        />
      </div>
    </section>
  )
}
