import zoomGuideArrowsSrc from "../assets/zoom-guide-arrows.svg"

import { cn } from "@/shared/lib/utils"

/**
 * 줌인 가이드 툴팁 (시안 2822-8047) — 사진을 아직 등록하지 않은 유저에게
 * 지도 중앙에 노출. 클릭 시 3단계(상세) 줌으로 카메라를 이동시킨다.
 */
export function ZoomInGuide({
  className,
  onClick,
}: {
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute top-[calc(50%+9px)] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-[24px] bg-neutral-0/60 px-10 py-3 backdrop-blur-[6px]",
        className
      )}
    >
      <img
        src={zoomGuideArrowsSrc}
        alt=""
        className="size-8 animate-zoom-guide-arrows motion-reduce:animate-none"
      />
      <span className="text-center text-h7 text-fg-neutral-bold">
        줌인해서 여행지를
        <br />
        선택해보세요!
      </span>
    </button>
  )
}
