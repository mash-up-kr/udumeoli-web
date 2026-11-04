export const FEEDBACK_CONTENT_MAX = 5000

const RATING_PROMPT = "별을 눌러 만족도를 알려주세요"
const RATING_LABELS = [
  "별로예요",
  "아쉬워요",
  "보통이에요",
  "좋아요!",
  "최고예요!",
]

function isValidRating(rating: number): boolean {
  return (
    Number.isInteger(rating) && rating >= 1 && rating <= RATING_LABELS.length
  )
}

/** 별점 아래 캡션 — 선택 전 안내 문구, 선택 후 점수별 문구. */
export function ratingLabel(rating: number): string {
  return isValidRating(rating) ? RATING_LABELS[rating - 1] : RATING_PROMPT
}

/** 별점 선택 + 내용(공백 제외 1자 이상, 최대 5,000자)이 모두 있어야 전송 가능. */
export function canSubmit(rating: number, content: string): boolean {
  return (
    isValidRating(rating) &&
    content.trim().length > 0 &&
    content.length <= FEEDBACK_CONTENT_MAX
  )
}
