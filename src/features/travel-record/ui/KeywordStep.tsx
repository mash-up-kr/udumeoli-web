import type { TravelKeywordId } from "@/entities/photo"
import { TRAVEL_KEYWORDS } from "@/entities/photo"
import { cn } from "@/shared/lib/utils"

// 시안(1836-16473)의 칩별 기울기 — 스티커를 흩뿌린 듯한 느낌을 위한 장식값
const TILT = ["", "-rotate-4", "rotate-4", "", "rotate-4"]

/**
 * 키워드 선택 스텝 (Figma 1836-16473 · 1836-16546).
 * 6개 중 1개 선택, 중복 불가 — 선택 시 어두운 칩으로 반전된다.
 */
export function KeywordStep({
  selected,
  onSelect,
}: {
  selected: TravelKeywordId | null
  onSelect: (id: TravelKeywordId) => void
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {TRAVEL_KEYWORDS.map((keyword, i) => {
        const isSelected = keyword.id === selected
        return (
          <button
            key={keyword.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(keyword.id)}
            className={cn(
              "flex items-center gap-[10px] rounded-full px-4 py-2 transition-colors",
              TILT[i],
              isSelected
                ? "bg-bg-neutral-inverse text-fg-neutral-inverse"
                : "bg-bg-neutral-weak/70 text-fg-neutral-bold"
            )}
          >
            <img src={keyword.emojiSrc} alt="" className="size-10 shrink-0" />
            <span className="text-h3 whitespace-nowrap">{keyword.label}</span>
          </button>
        )
      })}
    </div>
  )
}
