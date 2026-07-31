import type { Photo } from "@/entities/photo"

export interface RecapStats {
  totalDays: number
  regionCount: number
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * 리캡 툴팁 수치 (시안 1745-38161 #3) —
 * "{총 여행 일수}일 동안 {총 여행 지역 수}개의 지역을 다녀왔어요".
 *
 * 총 여행 일수는 사진의 여행 기간(date~endDate)이 걸친 고유 날짜 수 —
 * 같은 날 여러 지역/사진이 겹쳐도 하루로 센다.
 */
export function computeRecapStats(photos: Array<Photo>): RecapStats {
  const days = new Set<string>()
  const regions = new Set<string>()

  for (const photo of photos) {
    regions.add(photo.region)

    const start = Date.parse(photo.date)
    if (!Number.isFinite(start)) continue
    const end = Date.parse(photo.endDate ?? photo.date)
    const last = Number.isFinite(end) && end >= start ? end : start

    // ISO 날짜(YYYY-MM-DD)는 UTC 자정으로 파싱되므로 하루 간격으로 더해도 어긋나지 않는다
    for (let t = start; t <= last; t += DAY_MS) {
      days.add(new Date(t).toISOString().slice(0, 10))
    }
  }

  return { totalDays: days.size, regionCount: regions.size }
}
