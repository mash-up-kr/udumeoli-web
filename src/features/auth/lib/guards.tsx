import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { useMe, useSessionStore } from "@/entities/user"
import { USE_MOCK } from "@/shared/api/client"
import { AppSplash } from "@/shared/ui/app-splash"

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
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)
  const login = useSessionStore((s) => s.login)
  const logout = useSessionStore((s) => s.logout)
  const hydrated = useSessionHydrated()
  const router = useRouter()
  const meQuery = useMe({ enabled: !USE_MOCK && hydrated, retry: false })

  React.useEffect(() => {
    if (!hydrated) return

    if (USE_MOCK) {
      if (!isAuthenticated) router.navigate({ to: "/" })
      return
    }

    if (meQuery.data) {
      login(meQuery.data)
      return
    }

    if (meQuery.isError && !isAuthenticated) {
      logout()
      router.navigate({ to: "/" })
    }
  }, [
    hydrated,
    isAuthenticated,
    login,
    logout,
    meQuery.data,
    meQuery.isError,
    router,
  ])

  // 판정 전·리다이렉트 대기 구간은 빈 화면 대신 스플래시 (실서버에선 me 응답만큼 지속)
  if (USE_MOCK) {
    if (!hydrated || !isAuthenticated) return <AppSplash />
    return <>{children}</>
  }

  // 서버 세션이 확인됐거나, persist된 로컬 세션이 있으면 진입 허용
  const canEnter =
    meQuery.data !== undefined || (isAuthenticated && currentUserId !== null)
  if (!hydrated || !canEnter) return <AppSplash />
  return <>{children}</>
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const hydrated = useSessionHydrated()
  const router = useRouter()

  React.useEffect(() => {
    if (!hydrated) return
    if (!USE_MOCK) return

    // replace — push하면 "/"가 히스토리에 남아 지도에서 뒤로가기 시 "/"로 갔다가
    // 다시 인증됨→지도로 튕기는 왕복이 반복돼 뒤로가기가 아무 일도 안 하는 것처럼 느껴진다
    if (isAuthenticated) router.navigate({ to: "/map-google", replace: true })
  }, [hydrated, isAuthenticated, router])

  if (!hydrated || (USE_MOCK && isAuthenticated)) return <AppSplash />
  return <>{children}</>
}
