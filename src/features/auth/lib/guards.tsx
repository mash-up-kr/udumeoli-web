import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { useSessionStore } from "@/entities/user"

// persist 미들웨어가 localStorage에서 세션을 복원하기 전엔 isAuthenticated가
// 항상 false라, 직접 URL 진입 시 복원 전/후 값이 튀며 오탐 리다이렉트가 난다.
// 복원 완료 전까지는 판정을 보류한다.
//
// hydrated 초기값을 useState 이니셜라이저에서 즉시 계산하면 안 된다 — persist.hasHydrated()는
// 그냥 즉시 값을 읽는 함수라 이미 true를 반환할 수 있는데, isAuthenticated는
// useSyncExternalStore라 첫 렌더에선 hydration mismatch 방지를 위해 구버전 값(false)을
// 한 틱 늦게 갱신한다. 그 사이 hydrated:true + isAuthenticated:false인 순간이 실제로
// 발생해 RequireAuth가 오탐 리다이렉트한다. 항상 마운트 후 effect에서만 true로 전환해
// isAuthenticated의 리렌더 타이밍과 맞춘다.
function useSessionHydrated() {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => {
    // 타입상 persist는 항상 존재하지만, SSR에선 기본 storage(window.localStorage)
    // 생성이 실패해 실제로 undefined가 된다 — 타입이 못 보는 런타임 케이스라 방어 필요
    const persist = useSessionStore.persist as
      | typeof useSessionStore.persist
      | undefined
    if (persist?.hasHydrated() ?? true) {
      setHydrated(true)
      return
    }
    return persist?.onFinishHydration(() => setHydrated(true))
  }, [])
  return hydrated
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const hydrated = useSessionHydrated()
  const router = useRouter()
  React.useEffect(() => {
    if (hydrated && !isAuthenticated) router.navigate({ to: "/" })
  }, [hydrated, isAuthenticated, router])
  if (!hydrated || !isAuthenticated) return null
  return <>{children}</>
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const hydrated = useSessionHydrated()
  const router = useRouter()
  React.useEffect(() => {
    if (hydrated && isAuthenticated) router.navigate({ to: "/map-google" })
  }, [hydrated, isAuthenticated, router])
  if (!hydrated || isAuthenticated) return null
  return <>{children}</>
}
