import type { ZoomStage } from "./zoomStage"
import { POPULAR_REGIONS } from "@/entities/region"

export function canShowAvailableRegionMarker({
  zoomStage,
  hasTrip,
  region,
}: {
  zoomStage: ZoomStage
  /** 완료 여부와 관계없이 기록이 하나라도 있으면 두 번째 여행은 막는다. */
  hasTrip: boolean
  region: string
}): boolean {
  if (hasTrip) return false
  if (zoomStage >= 3) return true
  // 2.5단계: 전 지역 노출 전에 인기지역의 [+]·지역명만 먼저 보여준다
  return zoomStage >= 2.5 && POPULAR_REGIONS.has(region)
}
