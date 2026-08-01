import recapFolderBodySrc from "../assets/recap-folder-body.svg"
import recapFolderTabSrc from "../assets/recap-folder-tab.svg"
import { openRecapOverlay } from "./openRecapOverlay"

import { cn } from "@/shared/lib/utils"

/**
 * RECAP 버튼 (시안 1745-38063) — 지도 좌상단 로고 아래, 폴더 탭 모양 배지.
 * 클릭 시 리캡 오버레이(모달)를 연다.
 */
export function RecapButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openRecapOverlay}
      className={cn("relative block h-11 w-[55px]", className)}
    >
      <img
        src={recapFolderTabSrc}
        alt=""
        className="absolute top-0 left-0 h-[7.5px] w-[25.5px]"
      />
      <img
        src={recapFolderBodySrc}
        alt=""
        className="absolute bottom-0 left-0 h-[38px] w-full"
      />
      {/* 시안 텍스트: Special Gothic Condensed One 18px — E 타입 토큰(16/20)에 없는 크기 */}
      <span className="absolute inset-x-0 bottom-0 flex h-[38px] items-center justify-center font-eng text-[18px] leading-none text-neutral-900">
        RECAP
      </span>
    </button>
  )
}
