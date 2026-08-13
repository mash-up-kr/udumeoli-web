import type { Photo, TravelKeywordId } from "@/entities/photo"
import type { PotMember } from "@/entities/travel-pot"
import { groupTrips } from "@/entities/photo"

export type CollaborationTrip = {
  key: string
  region: string
  startDate: string
  endDate: string
  photos: Array<Photo>
  uploadedCount: number
  totalMembers: number
  hasMine: boolean
  isComplete: boolean
  missingMemberIds: Array<string>
  keyword?: TravelKeywordId
  representativePhoto: Photo
  tripId?: string
}

function dateValue(date: string): number {
  const time = Date.parse(date)
  return Number.isFinite(time) ? time : 0
}

function tripDateBounds(photos: Array<Photo>): {
  startDate: string
  endDate: string
} {
  const dates = photos.flatMap((photo) => [
    photo.date,
    photo.endDate ?? photo.date,
  ])
  const sorted = [...dates].sort((a, b) => dateValue(a) - dateValue(b))
  if (sorted.length === 0) return { startDate: "", endDate: "" }
  return {
    startDate: sorted[0],
    endDate: sorted[sorted.length - 1],
  }
}

function latestPhoto(photos: Array<Photo>): Photo {
  return [...photos].sort((a, b) => dateValue(b.date) - dateValue(a.date))[0]
}

export function makeCollaborationTripKey({
  region,
  startDate,
  endDate,
}: Pick<CollaborationTrip, "region" | "startDate" | "endDate">): string {
  return `${region}|${startDate}|${endDate}`
}

export function buildCollaborationTrips({
  photos,
  members,
  currentUserId,
}: {
  photos: Array<Photo>
  members: Array<PotMember>
  currentUserId: string | null | undefined
}): Array<CollaborationTrip> {
  const memberIds = members.map((member) => member.id)
  const byRegion = new Map<string, Array<Photo>>()
  for (const photo of photos) {
    byRegion.set(photo.region, [...(byRegion.get(photo.region) ?? []), photo])
  }

  const trips: Array<CollaborationTrip> = []
  for (const [region, regionPhotos] of byRegion) {
    for (const trip of groupTrips(regionPhotos)) {
      if (trip.photos.length === 0) continue

      const uploaders = new Set(trip.photos.map((photo) => photo.uploaderId))
      const uploadedMemberIds = memberIds.filter((id) => uploaders.has(id))
      const missingMemberIds = memberIds.filter((id) => !uploaders.has(id))
      const { startDate, endDate } = tripDateBounds(trip.photos)
      const representativePhoto = latestPhoto(trip.photos)

      trips.push({
        key: makeCollaborationTripKey({ region, startDate, endDate }),
        region,
        startDate,
        endDate,
        photos: trip.photos,
        uploadedCount: uploadedMemberIds.length,
        totalMembers: memberIds.length,
        hasMine: !!currentUserId && uploaders.has(currentUserId),
        isComplete: memberIds.length > 0 && missingMemberIds.length === 0,
        missingMemberIds,
        keyword:
          trip.photos.find((photo) => photo.keyword)?.keyword ??
          representativePhoto.keyword,
        representativePhoto,
        tripId: trip.photos.find((photo) => photo.tripId)?.tripId,
      })
    }
  }

  return trips.sort((a, b) => dateValue(b.endDate) - dateValue(a.endDate))
}

export function findLatestMissingMineTrip(
  trips: Array<CollaborationTrip>
): CollaborationTrip | null {
  return trips.find((trip) => !trip.isComplete && !trip.hasMine) ?? null
}

export function findLatestCompletedTrip(
  trips: Array<CollaborationTrip>
): CollaborationTrip | null {
  return trips.find((trip) => trip.isComplete) ?? null
}

export function latestTripByRegion(
  trips: Array<CollaborationTrip>
): Map<string, CollaborationTrip> {
  const byRegion = new Map<string, CollaborationTrip>()
  for (const trip of trips) {
    if (!byRegion.has(trip.region)) byRegion.set(trip.region, trip)
  }
  return byRegion
}

/**
 * 제일 많이 뽑힌 키워드 — 개수가 동일하면 가장 최근 여행의 키워드 (Figma 줌인 기준 1959-6730).
 * trips는 buildCollaborationTrips가 보장하는 최신순(endDate desc) 정렬을 전제로 한다.
 */
export function mostPickedKeyword(
  trips: Array<CollaborationTrip>
): TravelKeywordId | undefined {
  const counts = new Map<TravelKeywordId, number>()
  for (const trip of trips) {
    if (!trip.keyword) continue
    counts.set(trip.keyword, (counts.get(trip.keyword) ?? 0) + 1)
  }

  let best: TravelKeywordId | undefined
  let bestCount = 0
  // 최신순 순회 + 초과일 때만 교체 → 동수면 먼저 만난(더 최근) 키워드가 유지된다
  for (const trip of trips) {
    if (!trip.keyword) continue
    const count = counts.get(trip.keyword) ?? 0
    if (count > bestCount) {
      best = trip.keyword
      bestCount = count
    }
  }
  return best
}

export type RegionAction =
  /** 아무 반응 없음 — 줌 1·2단계의 미완료 지역 (Figma 1836-15937 #4) */
  | "ignore"
  /** 날짜 확인 팝업 → 팟원이 만든 여행에 합류 (#5) */
  | "confirm-join"
  /** "모두가 기록해야 다음 여행을 기록할 수 있어요!" 토스트 (#7) */
  | "blocked-toast"
  /** 새 여행 등록 플로우 (#8, 기록이 없는 지역 포함) */
  | "start-record"

/**
 * 지역을 눌렀을 때 무엇을 할지 — 폴리곤·키워드 스티커·협업 마커가 공유하는 단일 정책.
 *
 * 판단 기준은 "누른 대상"이 아니라 그 지역의 **최신 여행**이다. 스티커는 지역당 최대
 * 2개라 과거 완료 여행 스티커가 남아 있는데, 그걸 기준으로 삼으면 최신 여행이 미완료인
 * 지역에서도 다음 여행이 열려 "팟원 전원이 완료해야 N+1 등록 가능"(#6) 규칙이 뚫린다.
 */
export function resolveRegionAction({
  latestTrip,
  zoomStage,
  applyZoomGate,
}: {
  /** 그 지역의 최신 여행 — 없으면 아직 아무도 기록하지 않은 지역 */
  latestTrip: CollaborationTrip | undefined
  zoomStage: 0 | 1 | 2 | 3
  /** 폴리곤 클릭처럼 "지역을 눌렀을 뿐"인 경로만 줌 게이트를 적용한다 */
  applyZoomGate: boolean
}): RegionAction {
  if (!latestTrip) return "start-record"
  if (applyZoomGate && !latestTrip.isComplete && zoomStage < 3) return "ignore"
  if (!latestTrip.hasMine) return "confirm-join"
  if (!latestTrip.isComplete) return "blocked-toast"
  return "start-record"
}

/** 한 지역 내 두 번째 여행까지만 이모티콘 노출 (Figma 1836-15937 #1-1) */
const STICKER_VISIT_LIMIT = 2

/**
 * 키워드 스티커를 붙일 여행 — "한 지역 내 두 번째 여행까지, 세 번째 여행부터는 노출 X".
 *
 * 회차는 **지역 전체 여행** 기준으로 세고(내가 안 낀 여행도 회차를 차지한다),
 * 그중 내가 기록한 여행에만 이모지가 붙는다 (#5 "내가 기록 안 했을 경우 이모지 & 색상 노출 안 함").
 * trips는 최신순이라 회차를 세려면 오래된 순으로 뒤집는다.
 */
export function visibleStickerTrips(
  trips: Array<CollaborationTrip>
): Array<CollaborationTrip> {
  const visitCounts = new Map<string, number>()
  const visible: Array<CollaborationTrip> = []

  for (const trip of [...trips].reverse()) {
    const nth = (visitCounts.get(trip.region) ?? 0) + 1
    visitCounts.set(trip.region, nth)
    if (nth > STICKER_VISIT_LIMIT || !trip.hasMine) continue
    visible.push(trip)
  }

  return visible
}
