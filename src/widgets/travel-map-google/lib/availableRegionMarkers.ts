export function canShowAvailableRegionMarker({
  zoomStage,
  hasIncompleteTrip,
}: {
  zoomStage: 0 | 1 | 2 | 3
  hasIncompleteTrip: boolean
}): boolean {
  return zoomStage >= 3 && !hasIncompleteTrip
}
