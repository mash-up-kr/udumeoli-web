import { Plus } from "lucide-react"

import { Profile } from "@/shared/ui/profile"
import { cn } from "@/shared/lib/utils"

export type PhotoSlotVariant = "photo" | "empty" | "add"

type PhotoSlotProps = {
  variant: PhotoSlotVariant
  /** variant="photo"일 때 필수 */
  imageUrl?: string
  /** 업로더 프로필 (photo·empty 변형에서 좌상단 뱃지) */
  profileSrc?: string | null
  /** 슬롯 한 변 px — 4명 이하 80, 5~6명 64 */
  size: number
  /** 교차 회전 방향 (deg) */
  rotate: 4 | -4
  /** variant="add" 업로드 트리거 */
  onClick?: () => void
}

/**
 * 갤러리 날짜 행의 파티 멤버 슬롯 (Figma image Frame).
 * photo: 사진 + 프로필 뱃지 / empty: zzz + 프로필 뱃지 / add: 내 빈 슬롯 업로드 버튼
 */
export function PhotoSlot({
  variant,
  imageUrl,
  profileSrc,
  size,
  rotate,
  onClick,
}: PhotoSlotProps) {
  const iconSize = Math.round(size * 0.45)
  const base = cn(
    "relative rounded-[24px] border-3",
    rotate === 4 ? "rotate-4" : "-rotate-4"
  )

  if (variant === "add") {
    return (
      <button
        type="button"
        aria-label="내 사진 등록"
        onClick={onClick}
        className={cn(
          base,
          "flex items-center justify-center border-neutral-800 bg-bg-neutral-subtle drop-shadow-[0px_0px_10px_rgba(142,150,169,0.12)] transition-transform active:scale-95"
        )}
        style={{ width: size, height: size }}
      >
        <Plus
          className="text-fg-neutral-bold"
          style={{ width: iconSize, height: iconSize }}
        />
      </button>
    )
  }

  if (variant === "photo") {
    return (
      <div
        className={cn(
          base,
          "border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={imageUrl}
          alt=""
          className="pointer-events-none absolute inset-0 size-full rounded-[21px] object-cover"
        />
        <Profile
          size="sm"
          src={profileSrc ?? undefined}
          className="absolute top-[7px] left-[7px]"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        base,
        "flex items-center justify-center border-stroke-neutral-inverse bg-bg-neutral-solid drop-shadow-[0px_0px_10px_rgba(142,150,169,0.12)]"
      )}
      style={{ width: size, height: size }}
    >
      <img
        src="/icon-zzz.svg"
        alt="사진 없음"
        style={{ width: iconSize, height: iconSize }}
      />
      <Profile
        size="sm"
        src={profileSrc ?? undefined}
        className="absolute top-[7px] left-[7px]"
      />
    </div>
  )
}
