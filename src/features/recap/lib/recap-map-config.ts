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
 * ponytail: 줌 6 이미지를 늘려 쓰는 만큼 저장 해상도가 낮다 — 거슬리면 줌 7 타일 2장 합성으로.
 * 크기는 카드 비율(9:16)이면서 Static Maps 최대 높이(640)보다 작게 — 저장 시
 * 정적 지도를 640 높이로 받아 위아래를 잘라내야 하단 Google 로고 띠가 카드 밖으로 나간다.
 */
export const RECAP_MAP_VIEW: RecapMapView = {
  // 본토 좌우 여백이 비슷하고, 위로는 제목 아래 고성·아래로는 제주까지 들어오는 중심.
  center: { lat: 36.43, lng: 127.7 },
  zoom: 6,
  width: 220,
  height: 391.111,
} as const

/** Static Maps 최대 세로 크기 — 뷰보다 크게 받아 로고 띠(하단 약 20px)를 잘라낸다 */
export const RECAP_STATIC_MAP_HEIGHT = 640

export function getRecapMapView(): RecapMapView {
  return RECAP_MAP_VIEW
}
