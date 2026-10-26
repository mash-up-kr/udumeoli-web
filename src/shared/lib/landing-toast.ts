import { isIos } from "./is-ios"

/**
 * 랜딩으로 돌아가며 띄우는 토스트 위치 — 토스트 위치 규칙(2차 UT): 하단 고정 요소 위 16px.
 * 랜딩 CTA 스택: 바닥 34 + 버튼 56 × n + 간격 12 × (n-1). 카카오·Google 2개, iOS는 Apple까지 3개.
 */
export function landingToastClassName(): string {
  return isIos() ? "bottom-[242px]" : "bottom-[174px]"
}
