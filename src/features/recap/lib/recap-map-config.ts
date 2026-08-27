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
