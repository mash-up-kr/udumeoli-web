import type { TravelKeywordId } from "@/entities/photo"
import { TRAVEL_KEYWORD_OPTIONS } from "@/entities/photo"
import { cn } from "@/shared/lib/utils"

// 시안(3065-15823)의 칩별 기울기 — 스티커를 흩뿌린 듯한 느낌을 위한 장식값.
// 시안은 기울인 칩을 '회전된 바운딩 박스' 크기의 프레임에 담아 12px씩 띄우는데,
// CSS transform은 레이아웃을 차지하지 않아 그만큼 묶음이 납작해진다(시안 354.9 → 코드 326.75).
// 칩 너비 x sin4도 = 약 9px을 margin으로 돌려준다
const TILT = ["", "-rotate-4", "rotate-4", "", "rotate-4"]
const TILT_BLEED = "my-[4.5px]"

/**
 * 키워드 선택 스텝 (Figma 1836-16473 · 1836-16546).
 * 5개 중 1개 선택, 중복 불가 — 선택 시 어두운 칩으로 반전된다.
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
      {TRAVEL_KEYWORD_OPTIONS.map((keyword, i) => {
        const isSelected = keyword.id === selected
        return (
          <button
            key={keyword.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(keyword.id)}
            className={cn(
              "travel-record-keyword-badge flex items-center rounded-full transition-colors",
              TILT[i],
              TILT[i] && TILT_BLEED,
              isSelected
                ? "bg-bg-neutral-inverse text-fg-neutral-inverse"
                : "bg-bg-neutral-weak/70 text-fg-neutral-bold"
            )}
          >
            <img
              src={keyword.emojiSrc}
              alt=""
              className="travel-record-keyword-emoji shrink-0 object-contain"
            />
            <span className="travel-record-keyword-label whitespace-nowrap">
              {keyword.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
