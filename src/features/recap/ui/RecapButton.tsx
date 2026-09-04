import recapMotionPlaySrc from "../assets/recap-motion-play.svg"
import { openRecapOverlay } from "./openRecapOverlay"

import { cn } from "@/shared/lib/utils"

/**
 * RECAP 버튼 (시안 3065-19611) — 지도 우상단 팟 선택 아래, 재생 아이콘 + RECAP 텍스트 배지.
 * 클릭 시 리캡 오버레이(모달)를 연다.
 */
export function RecapButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openRecapOverlay}
      aria-label="리캡 보기"
      className={cn(
        "flex items-center justify-center gap-1 rounded-[12px] bg-bg-neutral-inverse p-2",
        className
      )}
    >
      <img src={recapMotionPlaySrc} alt="" className="size-6" />
      <span className="font-eng text-[18px] leading-[19.66px] text-fg-neutral-inverse">
        RECAP
      </span>
    </button>
  )
}
