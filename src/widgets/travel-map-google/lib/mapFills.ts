import type { ZoomStage } from "./zoomStage"
import type { RegionFill } from "@/entities/region"
import type { PartyMapOverview } from "@/entities/travel-pot"
import type { TravelKeyword, TravelKeywordId } from "@/entities/photo"
import { findKeyword } from "@/entities/photo"
import { REGION_NAME_BY_CODE } from "@/shared/api/region-codes"

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

/** 서버 집계 코드와 프론트 GeoJSON 지역명을 연결해 현재 줌의 색칠을 만든다. */
export function buildPartyMapFills({
  baseFills,
  overview,
}: {
  baseFills: Record<string, RegionFill>
  overview: PartyMapOverview
}): Record<string, RegionFill> {
  const next: Record<string, RegionFill> = { ...baseFills }
  const setColor = (region: string, color: string) => {
    if (Object.hasOwn(next, region) && next[region].type === "image") return
    next[region] = { type: "color", value: color }
  }

  for (const cell of overview.municipalities) {
    const keyword = findKeyword(cell.keyword)
    if (!keyword) continue
    const region = REGION_NAME_BY_CODE[cell.regionCode]
    if (region) setColor(region, keyword.mapColor)
  }

  return next
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
    if (!trip.hasMine) {
      delete next[trip.region]
      continue
    }

    const existing = Object.hasOwn(next, trip.region)
      ? next[trip.region]
      : undefined
    if (existing && existing.type === "image") continue

    const keyword = findKeyword(trip.keyword)
    if (keyword) {
      next[trip.region] = { type: "color", value: keyword.mapColor }
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
  zoomStage: ZoomStage
  mapFills: Record<string, RegionFill>
  provinceAggregates: Array<DisplayFillProvince>
  countryKeyword: TravelKeyword | undefined
  centroids: Array<DisplayFillCentroid>
}): Record<string, RegionFill> {
  if (zoomStage === 0 && countryKeyword && centroids.length > 0) {
    const next: Record<string, RegionFill> = {}
    for (const { name } of centroids) {
      next[name] = { type: "color", value: countryKeyword.mapColor }
    }
    return next
  }

  if (zoomStage >= 2 || provinceAggregates.length === 0) return mapFills

  const next: Record<string, RegionFill> = { ...mapFills }
  for (const aggregate of provinceAggregates) {
    for (const region of aggregate.regions) {
      if (Object.hasOwn(next, region) && next[region].type === "image") continue
      next[region] = { type: "color", value: aggregate.keyword.mapColor }
    }
  }

  return next
}
