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
}
