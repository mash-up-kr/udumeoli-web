import type { ZoomStage } from "./zoomStage"
import { POPULAR_REGIONS } from "@/entities/region"

export function canShowAvailableRegionMarker({
  zoomStage,
  hasIncompleteTrip,
  region,
}: {
  zoomStage: ZoomStage
  hasIncompleteTrip: boolean
  region: string
}): boolean {
  if (hasIncompleteTrip) return false
  if (zoomStage >= 3) return true
  // 2.5단계: 전 지역 노출 전에 인기지역의 [+]·지역명만 먼저 보여준다
  return zoomStage >= 2.5 && POPULAR_REGIONS.has(region)
}
