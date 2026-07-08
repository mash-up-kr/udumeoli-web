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
/** 인접 카드 사이 바퀴 각도(deg) — 시안의 사이드 카드 기울기 */
const STEP_ANGLE = 6
/** 바퀴 반지름(px) — 한 칸(6°) 회전 시 카드가 정확히 한 슬롯만큼 이동하는 크기 */
const RADIUS = Math.round(SLOT_WIDTH / Math.sin((STEP_ANGLE * Math.PI) / 180))
/** 컨테이너(h-58, 232px) 안 카드 중심 y */
const CARD_CENTER_Y = 116
/** 양옆 카드 축소 비율 (160 → 120) */
const SIDE_SCALE = 0.75

const TINT_CYCLE: Array<ImageCardTint> = ["blue", "indigo", "orange"]

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
 * 화면 아래에 중심을 둔 큰 바퀴 위에 카드를 6° 간격으로 고정해 두고,
 * 가로 스크롤 진행도로 바퀴 하나만 회전시키는 커브드 캐러셀.
 * 프레임당 스타일 변경이 바퀴 rotate + 근접 카드 scale뿐(transform 전용)이라
 * 레이아웃·페인트 없이 GPU 합성만으로 움직인다.
 * 드래그·관성·스냅은 위에 겹친 투명 슬롯 스크롤러(네이티브 scroll-snap)가 담당한다.
 */
function ImageCardPattern({
  items,
  onItemClick,
  className,
  ...props
}: ImageCardPatternProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const rafRef = useRef(0)

  const update = useCallback(() => {
    const scroller = scrollerRef.current
    const wheel = wheelRef.current
    if (!scroller || !wheel) return
    const progress = scroller.scrollLeft / SLOT_WIDTH
    wheel.style.transform = `rotate(${-progress * STEP_ANGLE}deg)`
    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const distance = Math.min(Math.abs(index - progress), 1)
      const scale = 1 - (1 - SIDE_SCALE) * distance
      card.style.transform = `translate(-50%, -50%) scale(${scale})`
    })
  }, [])

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(update)
  }, [update])

  // 중앙 카드 탭 → 액션, 사이드 카드 탭 → 해당 카드를 중앙으로 스냅
  const handleItemClick = useCallback(
    (item: ImageCardPatternItem, index: number) => {
      const scroller = scrollerRef.current
      if (!scroller) return
      const target = index * SLOT_WIDTH
      if (Math.abs(scroller.scrollLeft - target) < SLOT_WIDTH / 2) {
        onItemClick?.(item)
        return
      }
      scroller.scrollTo({
        left: target,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      })
    },
    [onItemClick]
  )

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
    <div className={cn("relative h-58 overflow-hidden", className)} {...props}>
      {/* 바퀴 — 컨테이너 아래로 이어진 원의 중심. 크기 0, rotate만 갱신 */}
      <div aria-hidden className="absolute inset-0">
        <div
          ref={wheelRef}
          className="absolute left-1/2 size-0 will-change-transform"
          style={{ top: CARD_CENTER_Y + RADIUS }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              // size-0이어야 transform-origin이 바퀴 중심점과 일치해 회전 궤적이 원을 유지한다
              className="absolute top-0 left-0 size-0"
              style={{
                transform: `rotate(${index * STEP_ANGLE}deg) translateY(-${RADIUS}px)`,
              }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[index] = el
                }}
                // size-0 부모 안에서는 폭이 0이 되어 translate(-50%)가 무효 —
                // 카드(lg, 160×192) 크기를 명시해 % 변환 기준 박스를 복원한다
                className="h-48 w-40 will-change-transform"
                style={{
                  transform: `translate(-50%, -50%) scale(${index === 0 ? 1 : SIDE_SCALE})`,
                }}
              >
                <ImageCard
                  src={item.src}
                  title={item.title}
                  subtitle={item.subtitle}
                  tint={item.tint ?? TINT_CYCLE[index % TINT_CYCLE.length]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 투명 슬롯 스크롤러 — 드래그·관성·스냅 담당, 슬롯이 탭 대상 */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="absolute inset-0 flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain px-[calc(50%-82px)] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex h-full w-41 shrink-0 snap-center items-center justify-center"
          >
            {/* 탭 영역은 슬롯 전체가 아닌 카드 실크기(160×192)로 한정 */}
            {onItemClick ? (
              <button
                type="button"
                aria-label={
                  item.subtitle ? `${item.title} ${item.subtitle}` : item.title
                }
                className="h-48 w-40"
                onClick={() => handleItemClick(item, index)}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export { ImageCardPattern }
