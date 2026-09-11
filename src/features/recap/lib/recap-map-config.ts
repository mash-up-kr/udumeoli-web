export type RecapMapView = {
  center: { lat: number; lng: number }
  zoom: number
  width: number
  height: number
}

/**
 * 리캡 지도 뷰 — 대한민국을 크게 보여주면서 울릉도·독도가 오른쪽에
 * 살짝 걸리는 전국 뷰.
 * 기록이 본토에만 있어도 영토 전체를 보여준다.
 * Static Maps는 정수 줌만 받으므로 줌 6 고정, 저장·화면이 같은 값을 쓴다.
 * 크기는 카드 비율(9:16)이면서 Static Maps 최대 높이(640)보다 작게 — 저장 시
 * 정적 지도를 640 높이로 받아 위아래를 잘라내야 하단 Google 로고 띠가 카드 밖으로 나간다.
 */
export const RECAP_MAP_VIEW: RecapMapView = {
  center: { lat: 36.05, lng: 128.65 },
  zoom: 6,
  width: 300,
  height: 533.333,
} as const

/** Static Maps 최대 세로 크기 — 뷰보다 크게 받아 로고 띠(하단 약 20px)를 잘라낸다 */
export const RECAP_STATIC_MAP_HEIGHT = 640

export function getRecapMapView(): RecapMapView {
  return RECAP_MAP_VIEW
}
