import emojiCameraSrc from "@/shared/assets/emoji-camera.svg"
import emojiCroissantSrc from "@/shared/assets/emoji-croissant.svg"
import emojiFerrisWheelSrc from "@/shared/assets/emoji-ferris-wheel.svg"
import emojiShoppingBagSrc from "@/shared/assets/emoji-shopping-bag.svg"
import emojiTreeSrc from "@/shared/assets/emoji-tree.svg"

export type TravelKeywordId =
  | "bread"
  | "vibe"
  | "shopping"
  | "activity"
  | "nature"

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
 * 키워드↔색상 매핑은 시안 annotation "임시 컬러 매칭" 기준:
 * 빵→Orange · 감성→Indigo · 쇼핑→Red · 액티비티→Yellow · 자연→Green.
 * 색상값은 Color Swatch 팔레트의 primitive 100(fill) / 500(stroke).
 * ponytail: 키워드 목록·색상 모두 시안상 "임시" — 팀 확정 후 이 배열만 교체하면 된다.
 */
export const TRAVEL_KEYWORDS: Array<TravelKeyword> = [
  {
    id: "bread",
    label: "빵",
    emojiSrc: emojiCroissantSrc,
    fill: "#ffdab5",
    stroke: "#e3800f",
  },
  {
    id: "vibe",
    label: "감성",
    emojiSrc: emojiCameraSrc,
    fill: "#c4c8ff",
    stroke: "#7b7fbf",
  },
  {
    id: "shopping",
    label: "쇼핑",
    emojiSrc: emojiShoppingBagSrc,
    fill: "#ffc5bf",
    stroke: "#e8453a",
  },
  {
    id: "activity",
    label: "액티비티",
    emojiSrc: emojiFerrisWheelSrc,
    fill: "#fff0b1",
    stroke: "#dbb71f",
  },
  {
    id: "nature",
    label: "자연",
    emojiSrc: emojiTreeSrc,
    fill: "#c8f0c0",
    stroke: "#7cb571",
  },
]

export function findKeyword(
  id: TravelKeywordId | undefined
): TravelKeyword | undefined {
  return TRAVEL_KEYWORDS.find((k) => k.id === id)
}
