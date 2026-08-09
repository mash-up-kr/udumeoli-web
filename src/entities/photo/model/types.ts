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
  /** 서버 Trip id — record 삭제·기존 여행 기록(recordTrip)에 필요. 목 사진엔 없다 */
  tripId?: string
  /** 서버 Image id — 코멘트만 수정할 때 recordTrip 재전송에 필요 */
  imageId?: string
}
