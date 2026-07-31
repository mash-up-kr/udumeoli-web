const KOREAN_ORDINALS = [
  "첫",
  "두",
  "세",
  "네",
  "다섯",
  "여섯",
  "일곱",
  "여덟",
  "아홉",
  "열",
]

/**
 * 방문 회차 라벨 — "첫 번째 강릉" (Figma 1836-15911 #3·#5).
 * 11회차부터는 고유어 서수가 길어져 숫자로 표기한다.
 */
export function visitLabel(nth: number, regionName: string): string {
  const ordinal = KOREAN_ORDINALS[nth - 1] ?? `${nth}`
  return `${ordinal} 번째 ${regionName}`
}

/**
 * 기록 기간 표기 — "26.08.01~02" (Figma 1836-15652).
 * 당일이면 시작일만, 같은 달이면 종료일은 일자만, 달이 다르면 월·일을 모두 적는다.
 */
export function formatRecordRange(startISO: string, endISO?: string): string {
  const [sy, sm, sd] = startISO.split("-")
  const start = `${sy.slice(2)}.${sm}.${sd}`
  if (!endISO || endISO === startISO) return start
  const [, em, ed] = endISO.split("-")
  return em === sm ? `${start}~${ed}` : `${start}~${em}.${ed}`
}
