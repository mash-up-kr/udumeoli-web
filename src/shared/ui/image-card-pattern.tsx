import { useCallback, useEffect, useRef } from "react"
import type { ComponentProps } from "react"

import type { ImageCardTint } from "@/shared/ui/image-card"
import { cn } from "@/shared/lib/utils"
import { ImageCard } from "@/shared/ui/image-card"

export interface ImageCardPatternItem {
  id: string
  src: string
  /** 지역명 (예: 강릉) */
  title: string
  /** 기간 (예: 3days) */
  subtitle?: string
  /** 미지정 시 blue → indigo → orange 순환 */
  tint?: ImageCardTint
}

/** 슬롯 중심 간 간격(px). 슬롯 `w-41`(164px)·컨테이너 `px-[calc(50%-82px)]`와 맞춰야 함 */
const SLOT_WIDTH = 164
/** 중앙에서 한 슬롯 벗어났을 때 기울기(deg) */
const SIDE_ANGLE = 6
/** 양옆 카드 축소 비율 (160 → 120) */
const SIDE_SCALE = 0.75
/** 한 슬롯 벗어났을 때 원 궤적 낙하량(px) */
const ARC_DROP = 18

const TINT_CYCLE: Array<ImageCardTint> = ["blue", "indigo", "orange"]

/** 중앙 기준 거리(슬롯 단위)에 따라 원 궤적을 따라 도는 변환 */
function arcTransform(offset: number) {
  const distance = Math.max(-1.5, Math.min(1.5, offset))
  const scale = 1 - (1 - SIDE_SCALE) * Math.min(Math.abs(distance), 1)
  return `translateY(${ARC_DROP * distance * distance}px) rotate(${SIDE_ANGLE * distance}deg) scale(${scale})`
}

export interface ImageCardPatternProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  items: Array<ImageCardPatternItem>
  onItemClick?: (item: ImageCardPatternItem) => void
}

/**
 * ImageCardPattern (Figma Image Card v1.0.0).
 *
 * ImageCard를 원 궤적 위에 배치한 가로 스크롤 캐러셀.
 * 중앙에 스냅된 카드는 커지고, 옆으로 밀린 카드는 작아지며 기울어진다.
 */
function ImageCardPattern({
  items,
  onItemClick,
  className,
  ...props
}: ImageCardPatternProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)

  const update = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const center = scroller.scrollLeft + scroller.clientWidth / 2
    for (const slot of scroller.children) {
      const card = slot.firstElementChild
      if (!(slot instanceof HTMLElement) || !(card instanceof HTMLElement)) {
        continue
      }
      const offset =
        (slot.offsetLeft + slot.offsetWidth / 2 - center) / SLOT_WIDTH
      card.style.transform = arcTransform(offset)
    }
  }, [])

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(update)
  }, [update])

  // 마운트·아이템 변경 등 매 렌더 후 현재 스크롤 위치 기준으로 변환 반영
  useEffect(() => {
    update()
  })

  useEffect(() => {
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("resize", update)
      cancelAnimationFrame(rafRef.current)
    }
  }, [update])

  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      className={cn(
        "flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto px-[calc(50%-82px)] [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    >
      {items.map((item, index) => {
        const card = (
          <ImageCard
            src={item.src}
            title={item.title}
            subtitle={item.subtitle}
            tint={item.tint ?? TINT_CYCLE[index % TINT_CYCLE.length]}
          />
        )
        return (
          <div
            key={item.id}
            className="flex h-58 w-41 shrink-0 snap-center items-center justify-center"
          >
            <div
              className="will-change-transform"
              style={{ transform: arcTransform(index) }}
            >
              {onItemClick ? (
                <button type="button" onClick={() => onItemClick(item)}>
                  {card}
                </button>
              ) : (
                card
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { ImageCardPattern }
