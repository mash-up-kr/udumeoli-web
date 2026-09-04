export const RECAP_CARD_SIZE = {
  width: 270,
  height: 480,
} as const

/**
 * 리캡 카드 내부 좌표 (시안 3196-5847, 432×768 기준을 카드 폭 270에 맞춰 1.6로 나눈 값).
 * 화면 미리보기는 cardPercent()로, 저장 이미지는 SVG 좌표로 같은 값을 쓴다.
 */
export const RECAP_CARD_LAYOUT = {
  /** 좌우 여백 (Figma px-24) */
  padding: 15,
  heading: {
    /** 상단 여백 (Figma pt-72) */
    top: 45,
    /** "{N} PINNNED" — Figma 44/44 */
    pinFontSize: 27.5,
    pinBaseline: 68,
    /** "in KOREA 🇰🇷" — Figma 36/36 */
    countryFontSize: 22.5,
    countryBaseline: 93,
  },
  locationIcon: {
    top: 45,
    right: 15,
    width: 17.5,
    height: 20.42,
  },
  /** 좌하단 팟 이름 + 팟원 닉네임 라벨 (Figma pb-78, 태그는 14/20 + px8 py4) */
  labels: {
    left: 15,
    bottom: 48.75,
    height: 17.5,
    gap: 2.5,
    fontSize: 8.75,
    paddingX: 5,
    /** 라벨 줄바꿈 기준 폭 (카드 폭 - 좌우 여백) */
    maxWidth: 240,
  },
} as const

export function cardPercent(value: number, size: number): string {
  return `${(value / size) * 100}%`
}

const CJK = /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/

/**
 * SVG는 텍스트 폭을 재주지 않는다 — 한글 1em·그 외 0.55em으로 근사한다.
 * ponytail: 실측이 필요해지면 canvas measureText로 교체.
 */
export function estimateTextWidth(text: string, fontSize: number): number {
  let units = 0
  for (const character of text) units += CJK.test(character) ? 1 : 0.55
  return units * fontSize
}
