/** 바텀시트 드래그 판정 — 스냅 단계 이동과 닫힘을 한 곳에서 결정한다. */

export const SHEET_CLOSE_THRESHOLD = 48
export const SHEET_EXPAND_THRESHOLD = 64
/** px/ms. 이 속도를 넘기면 거리가 짧아도 튕긴 방향으로 판정한다. */
export const SHEET_FLICK_VELOCITY = 0.4

export type SheetDragOutcome = "expand" | "collapse" | "close" | "settle"

/**
 * 아래(+) / 위(−) 이동량과 속도로 놓았을 때의 결말을 정한다.
 * 거리가 모자라도 빠르게 튕겼으면 그 방향으로 넘긴다 — 짧은 플릭이 씹히면 뻑뻑하게 느껴진다.
 */
export function resolveSheetDrag({
  delta,
  velocity,
  expanded,
}: {
  delta: number
  velocity: number
  expanded: boolean
}): SheetDragOutcome {
  const up =
    velocity <= -SHEET_FLICK_VELOCITY || delta <= -SHEET_EXPAND_THRESHOLD
  if (up) return expanded ? "settle" : "expand"

  const down =
    velocity >= SHEET_FLICK_VELOCITY || delta >= SHEET_CLOSE_THRESHOLD
  if (down) return expanded ? "collapse" : "close"

  return "settle"
}
