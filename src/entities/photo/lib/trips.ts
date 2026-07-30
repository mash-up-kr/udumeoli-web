import type { Photo } from "../model/types"

/** 한 지역의 방문 1회 — 연속된 사진 날짜 묶음 (여행 앨범 단위) */
export interface Trip {
  startDate: string
  endDate: string
  /** 이 방문 기간에 업로드된 사진 (날짜 오름차순) */
  photos: Array<Photo>
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * 같은 지역 사진들을 방문(여행) 단위로 그룹핑 — 최신 방문이 먼저 온다.
 * ponytail: 서버가 여행 단위를 내려주기 전까지의 휴리스틱 — 연속된 날짜(1일
 * 간격)를 방문 1회로 묶는다. 하루 걸러 찍은 여행은 방문 2회로 나뉜다.
 */
export function groupTrips(photos: Array<Photo>): Array<Trip> {
  const sorted = [...photos].sort((a, b) => (a.date < b.date ? -1 : 1))
  const trips: Array<Trip> = []
  for (const photo of sorted) {
    const last = trips.at(-1)
    if (last && Date.parse(photo.date) - Date.parse(last.endDate) <= DAY_MS) {
      last.endDate = photo.date
      last.photos.push(photo)
    } else {
      trips.push({
        startDate: photo.date,
        endDate: photo.date,
        photos: [photo],
      })
    }
  }
  return trips.reverse()
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
