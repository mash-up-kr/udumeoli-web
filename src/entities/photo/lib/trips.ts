import type { Photo } from "../model/types"

/** 한 지역의 방문 1회 — 연속된 사진 날짜 묶음 (여행 앨범 단위) */
export interface Trip {
  /** 서버 Trip id — 있으면 날짜 휴리스틱보다 우선하는 방문 단위 */
  tripId?: string
  startDate: string
  endDate: string
  /** 이 방문 기간에 업로드된 사진 (날짜 오름차순) */
  photos: Array<Photo>
}

const DAY_MS = 24 * 60 * 60 * 1000

function dateValue(date: string): number {
  const time = Date.parse(date)
  return Number.isFinite(time) ? time : 0
}

function photoEndDate(photo: Photo): string {
  return photo.endDate ?? photo.date
}

function maxDate(a: string, b: string): string {
  return dateValue(a) >= dateValue(b) ? a : b
}

function sortPhotosByDate(photos: Array<Photo>): Array<Photo> {
  return [...photos].sort((a, b) => dateValue(a.date) - dateValue(b.date))
}

/**
 * 같은 지역 사진들을 방문(여행) 단위로 그룹핑 — 최신 방문이 먼저 온다.
 * 서버 Trip id가 있으면 그 단위를 우선하고, 없는 목/레거시 사진만 연속 날짜 휴리스틱으로 묶는다.
 */
export function groupTrips(photos: Array<Photo>): Array<Trip> {
  const byTripId = new Map<string, Array<Photo>>()
  const withoutTripId: Array<Photo> = []
  for (const photo of photos) {
    if (photo.tripId) {
      byTripId.set(photo.tripId, [...(byTripId.get(photo.tripId) ?? []), photo])
    } else {
      withoutTripId.push(photo)
    }
  }

  const keyedTrips: Array<Trip> = []
  for (const [tripId, tripPhotos] of byTripId) {
    const sorted = sortPhotosByDate(tripPhotos)
    const startDate = sorted[0]?.date
    if (!startDate) continue
    keyedTrips.push({
      tripId,
      startDate,
      endDate: sorted.reduce(
        (endDate, photo) => maxDate(endDate, photoEndDate(photo)),
        startDate
      ),
      photos: sorted,
    })
  }

  const legacyTrips: Array<Trip> = []
  for (const photo of sortPhotosByDate(withoutTripId)) {
    const last = legacyTrips.at(-1)
    if (last && dateValue(photo.date) - dateValue(last.endDate) <= DAY_MS) {
      last.endDate = maxDate(last.endDate, photoEndDate(photo))
      last.photos.push(photo)
    } else {
      legacyTrips.push({
        startDate: photo.date,
        endDate: photoEndDate(photo),
        photos: [photo],
      })
    }
  }
  return [...keyedTrips, ...legacyTrips].sort(
    (a, b) =>
      dateValue(b.endDate) - dateValue(a.endDate) ||
      dateValue(b.startDate) - dateValue(a.startDate)
  )
}

/** 방문 기간 표기 — "2026년 7월 20일 ~ 7월 22일" (해가 다르면 종료일에도 연도) */
export function formatTripRange({
  startDate,
  endDate,
}: Pick<Trip, "startDate" | "endDate">): string {
  const fmt = (iso: string, withYear: boolean) => {
    const [y, m, d] = iso.split("-").map(Number)
    return withYear ? `${y}년 ${m}월 ${d}일` : `${m}월 ${d}일`
  }
  if (startDate === endDate) return fmt(startDate, true)
  const sameYear = startDate.slice(0, 4) === endDate.slice(0, 4)
  return `${fmt(startDate, true)} ~ ${fmt(endDate, !sameYear)}`
}
