import { cn } from "@/shared/lib/utils"
import iconAlertDangerSrc from "@/shared/assets/icon-alert-danger.svg"

/** 스택에 노출되는 최대 장수 — 넘치면 마지막 장에 +N 오버레이 (시안 1846-3645) */
const MAX_STACK = 8

type StackPhoto = { id: string; thumbnailUrl: string }

/**
 * 여행 앨범 메인의 지역 카드 (시안 1846-3645).
 * 지역명 + 방문 횟수 + 이미지 스택(최신 사진이 맨 앞) + 미기록 Alert(선택).
 */
export function RegionAlbumCard({
  name,
  visitCount,
  photos,
  showAlert,
  onClick,
}: {
  /** 표시용 지역명 (행정 접미사 제거된 상태) */
  name: string
  visitCount: number
  /** 최신 사진이 앞에 오도록 정렬된 목록 */
  photos: Array<StackPhoto>
  /** 내가 업로드하지 않은 과거 방문이 있으면 true */
  showAlert: boolean
  onClick: () => void
}) {
  const overflow = photos.length > MAX_STACK
  const visible = overflow ? photos.slice(0, MAX_STACK) : photos

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 overflow-hidden rounded-[32px] bg-bg-neutral-weak px-5 py-4 text-left"
    >
      <span className="flex w-full items-center justify-between">
        <span className="text-h5 text-neutral-900">{name}</span>
        <span className="text-h9 text-fg-neutral-subtle">{visitCount}회</span>
      </span>

      {/* 이미지 스택 — 최신 사진이 맨 앞(왼쪽), 뒷장이 위로 겹치며 마지막 +N 장은 온전히 노출 */}
      <span className="flex h-[76px] items-center">
        {visible.map((photo, i) => (
          <span
            key={photo.id}
            className={cn(
              "relative block size-16 shrink-0 overflow-hidden rounded-[18px] border-[2.4px] border-neutral-0 shadow-[0px_0px_16px_0px_rgba(142,150,169,0.12)]",
              i > 0 && "-ml-[38px]",
              i % 2 === 0 ? "rotate-[5deg]" : "rotate-[-10deg]"
            )}
          >
            <img
              src={photo.thumbnailUrl}
              alt=""
              className="size-full object-cover"
            />
            {overflow && i === MAX_STACK - 1 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/60 font-eng text-e3 text-fg-neutral-inverse">
                +{photos.length - (MAX_STACK - 1)}
              </span>
            ) : null}
          </span>
        ))}
      </span>

      {showAlert ? (
        <span className="flex items-center gap-1 text-b8 text-fg-danger-solid">
          <img src={iconAlertDangerSrc} alt="" className="size-4" />
          아직 기록이 완료되지 않은 여행이 있어요.
        </span>
      ) : null}
    </button>
  )
}
