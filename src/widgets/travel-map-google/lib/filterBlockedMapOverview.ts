import type { Photo, TravelKeywordId } from "@/entities/photo"
import type { MapCell, PartyMapOverview } from "@/entities/travel-pot"
import { compareKeywordEntries } from "@/entities/photo"
import { REGION_CODE_BY_NAME } from "@/shared/api/region-codes"

/** 작성자별 원본 기록이 있는 셀만 재집계하고, 나머지 서버 집계는 그대로 유지한다. */
export function filterBlockedMapOverview({
  overview,
  photos,
  blockedAuthorIds,
  potId,
}: {
  overview: PartyMapOverview | undefined
  photos: Array<Photo> | undefined
  blockedAuthorIds: Array<string>
  potId: string
}): PartyMapOverview | undefined {
  if (!overview || !photos || blockedAuthorIds.length === 0) return overview
  const blocked = new Set(blockedAuthorIds)
  const records = photos
    .filter((photo) => photo.potId === potId)
    .map((photo) => ({ photo, code: REGION_CODE_BY_NAME[photo.region] }))
    .filter((record) => record.code)
  const hidden = records.filter(({ photo }) => blocked.has(photo.uploaderId))
  if (hidden.length === 0) return overview

  const filterCell = (cell: MapCell): MapCell | null => {
    const inCell = (record: (typeof records)[number]) =>
      cell.regionCode === "KR" || record.code.startsWith(cell.regionCode)
    if (!hidden.some(inCell)) return cell
    const visible = records.filter(
      (record) => inCell(record) && !blocked.has(record.photo.uploaderId)
    )
    if (visible.length === 0) return null
    const keywords = new Map<TravelKeywordId, number>()
    for (const { photo } of visible) {
      if (photo.keyword)
        keywords.set(photo.keyword, (keywords.get(photo.keyword) ?? 0) + 1)
    }
    return {
      ...cell,
      keyword:
        [...keywords.entries()].sort(compareKeywordEntries)[0]?.[0] ??
        cell.keyword,
      regionCount: new Set(visible.map(({ code }) => code)).size,
      recordedMemberCount: new Set(visible.map(({ photo }) => photo.uploaderId))
        .size,
    }
  }
  const filterCells = (cells: Array<MapCell>) =>
    cells.flatMap((cell) => {
      const filtered = filterCell(cell)
      return filtered ? [filtered] : []
    })
  return {
    ...overview,
    country: overview.country ? filterCell(overview.country) : null,
    provinces: filterCells(overview.provinces),
    municipalities: filterCells(overview.municipalities),
  }
}
