import * as React from "react"

import type { Photo } from "@/entities/photo"
import type { ImageCardPatternItem } from "@/shared/ui/image-card-pattern"
import { ImageCardPattern } from "@/shared/ui/image-card-pattern"
import { cn } from "@/shared/lib/utils"
import { formatRegionName } from "@/entities/region"

/**
 * 지도 하단 지역별 사진 커브드 캐러셀 (Figma #1048-5977).
 *
 * 지역마다 카드 1장 — 이미지는 해당 지역의 최신 사진, 부제는 여행 일수(고유 날짜 수).
 * 초기 줌(0단계)에서만 노출되고, 경계선이 그려지는 줌부터는 슬라이드다운으로 사라진다.
 */

// 지역별 사진을 카드 아이템으로 축약 — 최신 사진 순 정렬
function buildItems(photos: Array<Photo>): Array<ImageCardPatternItem> {
  const byRegion = new Map<string, Array<Photo>>()
  for (const p of photos) {
    byRegion.set(p.region, [...(byRegion.get(p.region) ?? []), p])
  }
  return [...byRegion.entries()]
    .map(([region, group]) => {
      const latest = group.reduce((a, b) => (a.date >= b.date ? a : b))
      const days = new Set(group.map((p) => p.date)).size
      return {
        latestDate: latest.date,
        item: {
          id: region,
          src: latest.thumbnailUrl,
          title: formatRegionName(region),
          subtitle: `${days}day${days > 1 ? "s" : ""}`,
        },
      }
    })
    .sort((a, b) => b.latestDate.localeCompare(a.latestDate))
    .map((entry) => entry.item)
}

interface RegionCardCarouselProps {
  photos: Array<Photo>
  visible: boolean
  onSelectRegion: (region: string) => void
}

export function RegionCardCarousel({
  photos,
  visible,
  onSelectRegion,
}: RegionCardCarouselProps) {
  const items = React.useMemo(() => buildItems(photos), [photos])
  if (items.length === 0) return null

  return (
    // 카드(192px)가 슬롯(232px) 안에서 수직 중앙이라 14px만 띄우면
    // 카드 하단이 시안의 홈 인디케이터 위 34px에 놓인다
    <div
      aria-hidden={!visible}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-3.5 z-10 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      )}
    >
      {/* 숨김 상태에선 wrapper pointer-events-none이 클릭을 차단 */}
      <ImageCardPattern
        aria-label="지역별 여행 사진"
        items={items}
        onItemClick={(item) => onSelectRegion(item.id)}
        className={cn(visible && "pointer-events-auto")}
      />
    </div>
  )
}
