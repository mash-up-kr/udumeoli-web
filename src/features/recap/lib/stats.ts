import type { Photo } from "@/entities/photo"
import { groupTrips } from "@/entities/photo"

export interface RecapStats {
  regionCount: number
  pinCount: number
}

/**
 * 리캡 툴팁·카드 수치 (시안 3065-17817 #1) —
 * "{국가명}에서 {N}개의 핀을 만들었어요".
 */
export function computeRecapStats(photos: Array<Photo>): RecapStats {
  const photosByRegion = new Map<string, Array<Photo>>()

  for (const photo of photos) {
    const regionPhotos = photosByRegion.get(photo.region)
    if (regionPhotos) {
      regionPhotos.push(photo)
    } else {
      photosByRegion.set(photo.region, [photo])
    }
  }

  return {
    regionCount: photosByRegion.size,
    pinCount: [...photosByRegion.values()].reduce(
      (count, regionPhotos) => count + groupTrips(regionPhotos).length,
      0
    ),
  }
}
