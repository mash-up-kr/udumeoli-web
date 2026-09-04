export type RecapMapView = {
  center: { lat: number; lng: number }
  zoom: number
  width: number
  height: number
}

export const RECAP_MAP_VIEW: RecapMapView = {
  center: { lat: 36.05, lng: 128.15 },
  // Static Maps API uses integer zoom levels. Keep the export projection in sync.
  zoom: 6,
  width: 360,
  height: 640,
} as const

export const RECAP_MAINLAND_MAP_VIEW: RecapMapView = {
  // 육지 경도 범위는 126.1~129.6 — 중심을 127.5로 두면 동해안(포항·경주)이
  // 카드 오른쪽 밖으로 잘린다. Static Maps가 정수 줌만 받아 줌은 7로 고정.
  center: { lat: 36.3, lng: 127.9 },
  zoom: 7,
  width: 360,
  height: 640,
} as const

export const RECAP_MAINLAND_SCREEN_MAP_VIEW: RecapMapView = {
  ...RECAP_MAINLAND_MAP_VIEW,
  zoom: 6.8,
} as const

export function getRecapMapView(includeIslands: boolean): RecapMapView {
  return includeIslands ? RECAP_MAP_VIEW : RECAP_MAINLAND_MAP_VIEW
}

export function getRecapScreenMapView(includeIslands: boolean): RecapMapView {
  const view = getRecapMapView(includeIslands)
  return includeIslands ? view : RECAP_MAINLAND_SCREEN_MAP_VIEW
}
