export type MapLoadingSignals = {
  implFailed: boolean
  geoFailed: boolean
  layerReady: boolean
  tilesReady: boolean
  tilesTimedOut: boolean
}

export type MapLoadingState =
  | "loading"
  | "ready"
  | "impl-error"
  | "geo-error"
  | "tiles-error"

export function getMapLoadingState({
  implFailed,
  geoFailed,
  layerReady,
  tilesReady,
  tilesTimedOut,
}: MapLoadingSignals): MapLoadingState {
  if (layerReady && tilesReady) return "ready"
  if (implFailed) return "impl-error"
  if (geoFailed) return "geo-error"
  if (tilesTimedOut) return "tiles-error"
  return "loading"
}
