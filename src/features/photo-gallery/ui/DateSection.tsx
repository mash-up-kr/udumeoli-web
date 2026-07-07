import { PhotoSlot } from "./PhotoSlot"

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
 * 내 사진 업로드 완료 시 파란 tint, 미업로드 시 회색 tint + add 슬롯 + 툴팁.
 */
export function DateSection({ dateISO, slots, onAddPhoto }: DateSectionProps) {
  const myUploaded = slots.some((s) => s.isMe && s.photoUrl !== null)
  const slotSize = slots.length <= 4 ? 80 : 64
  // 회색은 피그마 raw 값(#c2c7cb 30%) — 대응 토큰 없음, 디자인 확정 시 재검토
  const tint = myUploaded ? "bg-blue-500/30" : "bg-[rgba(194,199,203,0.3)]"

  return (
    <section className="flex w-full flex-col items-center gap-4">
      <p className="w-full text-center font-eng text-e2 text-fg-neutral-bold">
        {formatDateLabel(dateISO)}
      </p>

      <div
        className={cn(
          "relative flex w-full items-center justify-center rounded-[24px] py-2",
          tint
        )}
      >
        {slots.map((slot, i) => {
          const rotate = i % 2 === 0 ? 4 : -4
          const isAdd = slot.isMe && slot.photoUrl === null
          return (
            <div
              key={slot.memberId}
              className="relative -mr-3 flex items-center justify-center p-[3px] last:mr-0"
            >
              {slot.photoUrl !== null ? (
                <PhotoSlot
                  variant="photo"
                  imageUrl={slot.photoUrl}
                  profileSrc={slot.profileImageUrl}
                  size={slotSize}
                  rotate={rotate}
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
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[42px] rounded-t-[12px] rounded-b-[24px] border border-neutral-50 backdrop-blur-[2px]",
            tint
          )}
        />
      </div>
    </section>
  )
}
