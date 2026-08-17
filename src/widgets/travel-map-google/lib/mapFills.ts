import type { RegionFill } from "@/entities/region"
import type { TravelKeyword, TravelKeywordId } from "@/entities/photo"
import { findKeyword } from "@/entities/photo"

export type MapFillTrip = {
  region: string
  keyword?: TravelKeywordId
  hasMine: boolean
  isComplete: boolean
}

export type DisplayFillProvince = {
  keyword: TravelKeyword
  regions: Array<string>
}

export type DisplayFillCentroid = {
  name: string
}

export function buildMapFills({
  baseFills,
  trips,
  incompleteRegionFill,
}: {
  baseFills: Record<string, RegionFill>
  trips: Iterable<MapFillTrip>
  incompleteRegionFill: string
}): Record<string, RegionFill> {
  const next: Record<string, RegionFill> = { ...baseFills }

  for (const trip of trips) {
    const existing = Object.hasOwn(next, trip.region)
      ? next[trip.region]
      : undefined
    if (existing && existing.type === "image") continue

    const keyword = findKeyword(trip.keyword)
    if (keyword && (trip.hasMine || trip.isComplete)) {
      next[trip.region] = { type: "color", value: keyword.fill }
    } else if (!trip.isComplete) {
      next[trip.region] = { type: "color", value: incompleteRegionFill }
    }
  }

  return next
}

export function buildDisplayFills({
  zoomStage,
  mapFills,
  provinceAggregates,
  countryKeyword,
  centroids,
}: {
  zoomStage: 0 | 1 | 2 | 3
  mapFills: Record<string, RegionFill>
  provinceAggregates: Array<DisplayFillProvince>
  countryKeyword: TravelKeyword | undefined
  centroids: Array<DisplayFillCentroid>
}): Record<string, RegionFill> {
  if (zoomStage === 0 && countryKeyword && centroids.length > 0) {
    const next: Record<string, RegionFill> = {}
    for (const { name } of centroids) {
      next[name] = { type: "color", value: countryKeyword.fill }
    }
    return next
  }

  if (zoomStage >= 2 || provinceAggregates.length === 0) return mapFills

  const next: Record<string, RegionFill> = { ...mapFills }
  for (const aggregate of provinceAggregates) {
    for (const region of aggregate.regions) {
      if (Object.hasOwn(next, region) && next[region].type === "image") continue
      next[region] = { type: "color", value: aggregate.keyword.fill }
    }
  }

  return next
}
