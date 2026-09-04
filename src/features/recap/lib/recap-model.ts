export interface RecapCardModel {
  pinCount: number
  potName: string
  members: Array<string>
}

/** MVP는 국내 여행만 다룬다 — 툴팁·카드에 쓰는 국가명 (시안 3065-17817 #1) */
export const RECAP_COUNTRY_NAME = "대한민국"
export const RECAP_COUNTRY_LABEL = "in KOREA 🇰🇷"
