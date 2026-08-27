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
  center: { lat: 36.3, lng: 127.5 },
  zoom: 7,
  width: 360,
  height: 640,
} as const

export function getRecapMapView(includeIslands: boolean): RecapMapView {
  return includeIslands ? RECAP_MAP_VIEW : RECAP_MAINLAND_MAP_VIEW
}

export function getRecapScreenMapView(includeIslands: boolean): RecapMapView {
  const view = getRecapMapView(includeIslands)
  return includeIslands ? view : { ...view, zoom: 6.8 }
}
