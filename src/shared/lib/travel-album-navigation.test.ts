import { describe, expect, it } from "vitest"

import { isTravelAlbumRegionEntry } from "./travel-album-navigation"

describe("isTravelAlbumRegionEntry", () => {
  it("accepts the state written when entering from the album", () => {
    expect(isTravelAlbumRegionEntry({ fromTravelAlbum: true })).toBe(true)
  })

  it("rejects direct, refreshed, and unrelated entries", () => {
    expect(isTravelAlbumRegionEntry(undefined)).toBe(false)
    expect(isTravelAlbumRegionEntry({})).toBe(false)
    expect(isTravelAlbumRegionEntry({ fromTravelAlbum: false })).toBe(false)
  })
})
