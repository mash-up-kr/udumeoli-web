export function isTravelAlbumRegionEntry(state: unknown): boolean {
  if (typeof state !== "object" || state === null) return false
  return "fromTravelAlbum" in state && state.fromTravelAlbum === true
}
