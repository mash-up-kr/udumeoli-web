import mapStickerActivitySrc from "@/shared/assets/map-stickers/activity.png"
import mapStickerDessertSrc from "@/shared/assets/map-stickers/dessert.png"
import mapStickerFoodSrc from "@/shared/assets/map-stickers/food.png"
import mapStickerHealingSrc from "@/shared/assets/map-stickers/healing.png"
import mapStickerPhotoSrc from "@/shared/assets/map-stickers/photo.png"
import mapPinActivitySrc from "@/shared/assets/map-stickers/pin-activity.svg"
import mapPinDessertSrc from "@/shared/assets/map-stickers/pin-dessert.svg"
import mapPinFoodSrc from "@/shared/assets/map-stickers/pin-food.svg"
import mapPinHealingSrc from "@/shared/assets/map-stickers/pin-healing.svg"
import mapPinPhotoSrc from "@/shared/assets/map-stickers/pin-photo.svg"

export type TravelKeywordId =
  | "HEALING"
  | "ACTIVITY"
  | "FOOD"
  | "NATURE"
  | "CITY"
  | "CULTURE"

export interface TravelKeyword {
  id: TravelKeywordId
  label: string
  /** 키워드 스티커 그래픽 — 선택 화면·지도 위 스티커에 공통 사용 */
  emojiSrc: string
  /** 지도 핀·스티커 전용 그래픽 (Figma 2343-16755) */
  mapStickerSrc: string
  /** 지도 핀 배경 (Figma 2374-17008 Union) */
  mapPinSrc: string
  /** 지도 전용 대표색 — 폴리곤 fill은 렌더링 레이어에서 40% opacity 처리 */
  mapColor: string
  /** 지도 스티커 PNG를 1:1 박스에 넣는 방식 */
  mapStickerFit?: "food" | "cover" | "bottom"
  /** 지역 채움색 (primitive 100) — 색상 선택 스텝이 없어 키워드로 자동 결정 */
  fill: string
  /** 지역 외곽선 (primitive 500) */
  stroke: string
}

/**
 * 서버 TripKeyword enum 6종.
 *
 * Figma 최신 정책의 표시 카테고리는 5종(맛집·디저트·힐링·액티비티·사진)이지만,
 * 백엔드 GraphQL enum은 아직 6종이라 프론트에서 라벨과 스티커만 alias한다.
 * NATURE는 디저트, CITY/CULTURE는 사진으로 노출한다.
 */
export const TRAVEL_KEYWORDS: Array<TravelKeyword> = [
  {
    id: "HEALING",
    label: "힐링",
    emojiSrc: mapStickerHealingSrc,
    mapStickerSrc: mapStickerHealingSrc,
    mapPinSrc: mapPinHealingSrc,
    mapColor: "#479C46",
    mapStickerFit: "bottom",
    fill: "#c4c8ff",
    stroke: "#7b7fbf",
  },
  {
    id: "ACTIVITY",
    label: "액티비티",
    emojiSrc: mapStickerActivitySrc,
    mapStickerSrc: mapStickerActivitySrc,
    mapPinSrc: mapPinActivitySrc,
    mapColor: "#F37C13",
    mapStickerFit: "cover",
    fill: "#fff0b1",
    stroke: "#dbb71f",
  },
  {
    id: "FOOD",
    label: "맛집",
    emojiSrc: mapStickerFoodSrc,
    mapStickerSrc: mapStickerFoodSrc,
    mapPinSrc: mapPinFoodSrc,
    mapColor: "#614F44",
    mapStickerFit: "food",
    fill: "#ffdab5",
    stroke: "#e3800f",
  },
  {
    id: "NATURE",
    label: "디저트",
    emojiSrc: mapStickerDessertSrc,
    mapStickerSrc: mapStickerDessertSrc,
    mapPinSrc: mapPinDessertSrc,
    mapColor: "#FA3343",
    mapStickerFit: "cover",
    fill: "#ffd6da",
    stroke: "#fa3343",
  },
  {
    id: "CITY",
    label: "사진",
    emojiSrc: mapStickerPhotoSrc,
    mapStickerSrc: mapStickerPhotoSrc,
    mapPinSrc: mapPinPhotoSrc,
    mapColor: "#20201F",
    mapStickerFit: "bottom",
    fill: "#ffc5bf",
    stroke: "#e8453a",
  },
  {
    id: "CULTURE",
    label: "사진",
    emojiSrc: mapStickerPhotoSrc,
    mapStickerSrc: mapStickerPhotoSrc,
    mapPinSrc: mapPinPhotoSrc,
    mapColor: "#20201F",
    mapStickerFit: "bottom",
    fill: "#d7d7d7",
    stroke: "#20201f",
  },
]

const keywordById = Object.fromEntries(
  TRAVEL_KEYWORDS.map((keyword) => [keyword.id, keyword])
) as Record<TravelKeywordId, TravelKeyword>

/** 여행 기록 선택 화면에 노출하는 Figma 최신 5종 카테고리 */
export const TRAVEL_KEYWORD_OPTIONS: Array<TravelKeyword> = [
  keywordById.FOOD,
  keywordById.NATURE,
  keywordById.HEALING,
  keywordById.ACTIVITY,
  keywordById.CITY,
]

export function findKeyword(
  id: TravelKeywordId | undefined
): TravelKeyword | undefined {
  return id ? keywordById[id] : undefined
}
