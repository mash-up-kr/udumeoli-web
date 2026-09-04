import type { Photo, TravelKeywordId } from "@/entities/photo"

export type Point = [number, number]

/**
 * 여행지(시군구)가 5개 이하면 시 단위 핀 대신 도 단위로 묶어 노출한다.
 * 6개 이상은 기존대로 시 단위 (시안 3065-17817 #5).
 */
export const PROVINCE_AGGREGATE_MAX_REGIONS = 5

export interface RegionShape {
  /** geojson feature 고유 id — 동명 지역(강원·경남 고성군)을 구분하려면 이름이 아니라 이걸 쓴다 */
  id: string
  /** 소속 도(광역시 포함). geojson에 없으면 도 집계에서 빠진다 */
  province?: string
  /** 카드 좌표계 centroid */
  center: Point | null
  /** 위경도 centroid */
  geoCenter: Point | null
  /** 이 지역에 기록된 사진. 없으면 빈 배열 */
  photos: Array<Photo>
}

export interface ProvinceAggregate {
  province: string
  keyword: TravelKeywordId
  /** 그 도의 시군구 feature id 전체 — 도 단위 모드에선 여기 전부를 대표 색으로 칠한다 */
  regions: Array<string>
  /** 그 도에서 기록한 시군구 수 — 라벨의 "+N" */
  regionCount: number
  position: Point
  geoPosition: Point
}

/** 도 대표 키워드 — 그 도에서 가장 많이 고른 키워드 (동수면 먼저 나온 쪽) */
function pickDominantKeyword(
  photos: Array<Photo>
): TravelKeywordId | undefined {
  const counts = new Map<TravelKeywordId, number>()
  for (const photo of photos) {
    if (!photo.keyword) continue
    counts.set(photo.keyword, (counts.get(photo.keyword) ?? 0) + 1)
  }
  let best: TravelKeywordId | undefined
  let bestCount = 0
  for (const [keyword, count] of counts) {
    if (count > bestCount) {
      best = keyword
      bestCount = count
    }
  }
  return best
}

/**
 * 기록이 있는 도별 집계. 도 중심은 소속 시군구 centroid 평균으로 잡는다 —
 * 별도 도 지오메트리 없이 근사하는 방식은 지도 위젯 1단계와 같다.
 */
export function buildProvinceAggregates(
  shapes: Array<RegionShape>
): Array<ProvinceAggregate> {
  const photosByProvince = new Map<string, Array<Photo>>()
  const recordedByProvince = new Map<string, number>()
  const membersByProvince = new Map<string, Array<string>>()
  const centers = new Map<
    string,
    { x: number; y: number; lng: number; lat: number; count: number }
  >()

  for (const { id, province, center, geoCenter, photos } of shapes) {
    if (!province || !center || !geoCenter) continue
    membersByProvince.set(province, [
      ...(membersByProvince.get(province) ?? []),
      id,
    ])
    const accumulated = centers.get(province) ?? {
      x: 0,
      y: 0,
      lng: 0,
      lat: 0,
      count: 0,
    }
    accumulated.x += center[0]
    accumulated.y += center[1]
    accumulated.lng += geoCenter[0]
    accumulated.lat += geoCenter[1]
    accumulated.count += 1
    centers.set(province, accumulated)

    if (photos.length === 0) continue
    photosByProvince.set(province, [
      ...(photosByProvince.get(province) ?? []),
      ...photos,
    ])
    recordedByProvince.set(
      province,
      (recordedByProvince.get(province) ?? 0) + 1
    )
  }

  return [...photosByProvince].flatMap(([province, provincePhotos]) => {
    const keyword = pickDominantKeyword(provincePhotos)
    const center = centers.get(province)
    if (!keyword || !center) return []
    return [
      {
        province,
        keyword,
        regions: membersByProvince.get(province) ?? [],
        regionCount: recordedByProvince.get(province) ?? 0,
        position: [center.x / center.count, center.y / center.count] as Point,
        geoPosition: [
          center.lng / center.count,
          center.lat / center.count,
        ] as Point,
      },
    ]
  })
}
