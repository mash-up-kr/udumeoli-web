import { cn } from "@/shared/lib/utils"
import { Skeleton } from "@/shared/ui/skeleton"
import iconAlertDangerSrc from "@/shared/assets/icon-alert-danger.svg"
import iconZzzSrc from "@/shared/assets/icon-zzz.svg"

/**
 * 멤버 한 명의 자리. 팟 가입 순서로 고정되며, 안 올린 멤버도 빠지지 않는다.
 * 자리 순서가 곧 "누구 자리인지"라 이름·아바타 뱃지는 붙이지 않는다 (시안 3065-14470 #5).
 */
export type MemberSlot = { memberId: string; thumbnailUrl: string | null }

/**
 * 여행 앨범 메인의 지역 카드 (시안 3065-14470).
 * 지역명 + "n/N명" 카운터 + 멤버별 고정 자리 + 미기록 Alert(선택).
 */
export function RegionAlbumCard({
  name,
  slots,
  showAlert,
  onClick,
}: {
  /** 표시용 지역명 (행정 접미사 제거된 상태) */
  name: string
  /** 팟 가입 순서로 고정된 멤버 자리 — 길이가 곧 팟 전체 인원(N) */
  slots: Array<MemberSlot>
  /** 이 지역에 내 기록이 없으면 true */
  showAlert: boolean
  onClick: () => void
}) {
  const recordedCount = slots.filter((slot) => slot.thumbnailUrl).length

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 overflow-hidden rounded-[32px] bg-bg-neutral-weak px-5 py-4 text-left"
    >
      <span className="flex w-full items-center justify-between">
        <span className="text-h5 text-neutral-900">{name}</span>
        <span className="text-h9 text-fg-neutral-subtle">
          {recordedCount}/{slots.length}명
        </span>
      </span>

      {/* 멤버 자리 — 좌측부터 팟 가입 순으로 고정. 안 올린 멤버는 점선 + zzZ */}
      <span className="flex h-[76px] items-center">
        {slots.map((slot, i) => (
          <span
            key={slot.memberId}
            className={cn(
              // bg는 이미지 로드 전 흰 카드 위에서 빈 프레임으로 안 보이게 하는 placeholder
              "relative block size-16 shrink-0 overflow-hidden rounded-[18px] bg-bg-neutral-solid",
              slot.thumbnailUrl
                ? "border-[2.4px] border-neutral-0 shadow-[0px_0px_16px_0px_rgba(142,150,169,0.12)]"
                : "border-[1.5px] border-dashed border-stroke-neutral-subtle",
              i > 0 && "-ml-[38px]",
              i % 2 === 0 ? "rotate-[5deg]" : "rotate-[-10deg]"
            )}
          >
            {slot.thumbnailUrl ? (
              <img
                src={slot.thumbnailUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <img
                src={iconZzzSrc}
                alt=""
                className="absolute top-1/2 left-1/2 w-8 -translate-x-1/2 -translate-y-1/2"
              />
            )}
          </span>
        ))}
      </span>

      {showAlert ? (
        <span className="flex items-center gap-1 text-b8 text-fg-danger-solid">
          <img src={iconAlertDangerSrc} alt="" className="size-4" />
          아직 기록하지 않은 여행이 있어요
        </span>
      ) : null}
    </button>
  )
}

/** 지역 카드 스켈레톤 — 첫 사진 목록 로딩 동안 카드 자리 유지 (지역명 + 이미지 스택 실루엣) */
export function RegionAlbumCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2 rounded-[32px] bg-bg-neutral-weak px-5 py-4">
      <span className="flex w-full items-center justify-between">
        <Skeleton className="h-[27px] w-20" />
        <Skeleton className="h-4 w-8" />
      </span>
      <span className="flex h-[76px] items-center">
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            className={cn(
              "size-16 shrink-0 rounded-[18px]",
              i > 0 && "-ml-[38px]",
              i % 2 === 0 ? "rotate-[5deg]" : "rotate-[-10deg]"
            )}
          />
        ))}
      </span>
    </div>
  )
}
