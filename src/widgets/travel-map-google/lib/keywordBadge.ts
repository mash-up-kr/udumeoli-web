import type { TravelKeyword } from "@/entities/photo"

/** Figma 키워드 배지: 키워드 대표색 10% 배경 + 대표색 텍스트. */
export function getKeywordBadgeStyle(keyword: TravelKeyword) {
  return {
    backgroundColor: `${keyword.mapColor}1A`,
    color: keyword.mapColor,
  }
}
