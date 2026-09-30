export type RecapMapView = {
  center: { lat: number; lng: number }
  zoom: number
  width: number
  height: number
}

/**
 * 리캡 지도 뷰 — 본토와 제주를 카드 가운데에 크게 담는 뷰 (시안 3983-43789).
 * 울릉도·독도까지 넣으면 본토가 왼쪽 위로 치우치고 작아져 프레임에서 제외한다.
 * Static Maps는 정수 줌만 받으므로 줌 6 고정 — 확대는 뷰 크기(width·height)를 줄여서
 * 하고, 화면 지도는 카드 폭에 맞춰 소수 줌으로 같은 범위를 맞춘다.
 * 저장은 한 단계 높은 줌의 정적 지도 두 장을 이어 붙인다 (save-image staticMapTiles).
 * 크기는 카드 비율(9:16).
 */
export const RECAP_MAP_VIEW: RecapMapView = {
  // 본토 좌우 여백이 비슷하고, 위로는 제목 아래 고성·아래로는 제주까지 들어오는 중심.
  center: { lat: 36.43, lng: 127.7 },
  zoom: 6,
  width: 220,
  height: 391.111,
} as const

/** Static Maps 최대 세로 크기 — 저장용 정적 지도 한 장의 높이 */
export const RECAP_STATIC_MAP_HEIGHT = 640

export function getRecapMapView(): RecapMapView {
  return RECAP_MAP_VIEW
}
