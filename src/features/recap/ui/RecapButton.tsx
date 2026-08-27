import recapMotionPlaySrc from "../assets/recap-motion-play.svg"
import { openRecapOverlay } from "./openRecapOverlay"

import { cn } from "@/shared/lib/utils"

/**
 * RECAP 버튼 (시안 2897-28090) — 지도 우상단 팟 선택 아래, 다크 재생 아이콘 배지.
 * 클릭 시 리캡 오버레이(모달)를 연다.
 */
export function RecapButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openRecapOverlay}
      aria-label="리캡 보기"
      className={cn("rounded-[12px] bg-bg-neutral-inverse p-2", className)}
    >
      <img src={recapMotionPlaySrc} alt="" className="size-6" />
    </button>
  )
}
