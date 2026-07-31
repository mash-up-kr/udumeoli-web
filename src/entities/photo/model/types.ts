import type { TravelKeywordId } from "./keywords"

export interface Photo {
  id: string
  lat: number
  lng: number
  thumbnailUrl: string
  date: string
  uploaderId: string
  region: string
  /** 사진이 속한 여행팟 — 팟별로 지도/갤러리가 분리된다 */
  potId: string
  /** 여행 앨범 상세에서 사진과 함께 노출되는 한 줄 코멘트 */
  comment?: string
  /** 여행을 대표하는 키워드 — 지도 스티커·지역 색상을 결정 (기록 플로우에서 선택) */
  keyword?: TravelKeywordId
  /** 여행 종료일 — 기간으로 등록한 경우에만. 없으면 date 당일 여행 */
  endDate?: string
}
