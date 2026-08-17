import { POPULAR_REGIONS } from "@/entities/region"

export function canShowAvailableRegionMarker({
  name,
  zoomStage,
  hasFill,
  hasPhoto,
}: {
  name: string
  zoomStage: 0 | 1 | 2 | 3
  hasFill: boolean
  hasPhoto: boolean
}): boolean {
  if (zoomStage < 2 || hasFill || hasPhoto) return false
  return zoomStage >= 3 || POPULAR_REGIONS.has(name)
}
