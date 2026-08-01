// 지역 여행 기록 완성 툴팁("보러가기") 노출 이력 — 계정 단위 localStorage 저장.
// 지도 Impl(동적 import) 밖에 둬서, 마이페이지 계정 삭제가 Google Maps 번들을
// 끌고 오지 않고도 이력을 초기화할 수 있게 한다.

const COMPLETION_TIP_STORAGE_KEY = "photato-map-completion-tooltips"
const COMPLETION_TIP_MAX_SHOW = 3

type CompletionTipState = Partial<
  Record<string, { count: number; seen?: boolean }>
>

function readCompletionTipState(): CompletionTipState {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(
      window.localStorage.getItem(COMPLETION_TIP_STORAGE_KEY) ?? "{}"
    ) as CompletionTipState
  } catch {
    return {}
  }
}

function writeCompletionTipState(state: CompletionTipState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(COMPLETION_TIP_STORAGE_KEY, JSON.stringify(state))
}

export function markCompletionTipShown(key: string): number {
  const state = readCompletionTipState()
  const prev = state[key] ?? { count: 0 }
  const next = { ...prev, count: prev.count + 1 }
  writeCompletionTipState({ ...state, [key]: next })
  return next.count
}

export function markCompletionTipSeen(key: string) {
  const state = readCompletionTipState()
  const prev = state[key] ?? { count: 0 }
  writeCompletionTipState({ ...state, [key]: { ...prev, seen: true } })
}

export function canShowCompletionTip(key: string): boolean {
  const state = readCompletionTipState()[key]
  return !state?.seen && (state?.count ?? 0) < COMPLETION_TIP_MAX_SHOW
}

/** 계정 삭제 시 노출 이력 초기화 — 재가입 유저에게 새 계정 기준으로 다시 노출 */
export function resetCompletionTips() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(COMPLETION_TIP_STORAGE_KEY)
}
