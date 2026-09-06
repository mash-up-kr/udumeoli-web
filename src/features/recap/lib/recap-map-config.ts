export type RecapMapView = {
  center: { lat: number; lng: number }
  zoom: number
  width: number
  height: number
}

/**
 * 리캡 지도 뷰 — 제주와 독도까지 프레임에 담기는 전국 뷰.
 * 기록이 본토에만 있어도 영토 전체를 보여준다.
 * Static Maps는 정수 줌만 받으므로 줌 6 고정, 저장·화면이 같은 값을 쓴다.
 */
export const RECAP_MAP_VIEW: RecapMapView = {
  center: { lat: 36.05, lng: 128.15 },
  zoom: 6,
  width: 360,
  height: 640,
} as const

export function getRecapMapView(): RecapMapView {
  return RECAP_MAP_VIEW
}
