export function shouldShowZoomGuide({
  hasPersistentActions,
  dismissed,
  mapReady,
  photosReady,
  photoCount,
}: {
  hasPersistentActions: boolean
  dismissed: boolean
  mapReady: boolean
  photosReady: boolean
  photoCount: number
}): boolean {
  return (
    hasPersistentActions &&
    mapReady &&
    photosReady &&
    photoCount === 0 &&
    !dismissed
  )
}
