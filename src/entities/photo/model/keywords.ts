import emojiCameraSrc from "@/shared/assets/emoji-camera.svg"
import emojiCroissantSrc from "@/shared/assets/emoji-croissant.svg"
import emojiFerrisWheelSrc from "@/shared/assets/emoji-ferris-wheel.svg"
import emojiShoppingBagSrc from "@/shared/assets/emoji-shopping-bag.svg"
import emojiTreeSrc from "@/shared/assets/emoji-tree.svg"

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
  /** 키워드 스티커 이모지 — 선택 화면·지도 위 스티커에 공통 사용 */
  emojiSrc: string
  /** 지역 채움색 (primitive 100) — 색상 선택 스텝이 없어 키워드로 자동 결정 */
  fill: string
  /** 지역 외곽선 (primitive 500) */
  stroke: string
}

/**
 * 여행 대표 키워드 (Figma 1836-16473).
 *
 * ponytail: 서버 enum 6종 확정, 라벨·이모지·색상은 임시 매핑(HEALING←감성,
 * FOOD←빵, CITY←쇼핑, CULTURE 신규) — 디자인 확정 시 이 배열만 교체.
 * 색상값은 Color Swatch 팔레트의 primitive 100(fill) / 500(stroke).
 */
export const TRAVEL_KEYWORDS: Array<TravelKeyword> = [
  {
    id: "HEALING",
    label: "힐링",
    emojiSrc: emojiCameraSrc,
    fill: "#c4c8ff",
    stroke: "#7b7fbf",
  },
  {
    id: "ACTIVITY",
    label: "액티비티",
    emojiSrc: emojiFerrisWheelSrc,
    fill: "#fff0b1",
    stroke: "#dbb71f",
  },
  {
    id: "FOOD",
    label: "맛집",
    emojiSrc: emojiCroissantSrc,
    fill: "#ffdab5",
    stroke: "#e3800f",
  },
  {
    id: "NATURE",
    label: "자연",
    emojiSrc: emojiTreeSrc,
    fill: "#c8f0c0",
    stroke: "#7cb571",
  },
  {
    id: "CITY",
    label: "도시",
    emojiSrc: emojiShoppingBagSrc,
    fill: "#ffc5bf",
    stroke: "#e8453a",
  },
  {
    id: "CULTURE",
    label: "문화",
    emojiSrc: emojiCameraSrc,
    fill: "#ffd3f2",
    stroke: "#c65fae",
  },
]

export function findKeyword(
  id: TravelKeywordId | undefined
): TravelKeyword | undefined {
  return TRAVEL_KEYWORDS.find((k) => k.id === id)
}
