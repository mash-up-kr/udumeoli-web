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

export function visibleStickerTrips(
  trips: Array<CollaborationTrip>
): Array<CollaborationTrip> {
  const counts = new Map<string, number>()
  const visible: Array<CollaborationTrip> = []

  for (const trip of trips) {
    if (!trip.hasMine) continue
    const count = counts.get(trip.region) ?? 0
    if (count >= 2) continue
    counts.set(trip.region, count + 1)
    visible.push(trip)
  }

  return visible
}
