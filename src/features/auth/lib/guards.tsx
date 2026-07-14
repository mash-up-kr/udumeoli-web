import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { useSessionStore } from "@/entities/user"

// persist 미들웨어가 localStorage에서 세션을 복원하기 전엔 isAuthenticated가
// 항상 false라, 직접 URL 진입 시 복원 전/후 값이 튀며 오탐 리다이렉트가 난다.
// 복원 완료 전까지는 판정을 보류한다.
function useSessionHydrated() {
  const [hydrated, setHydrated] = React.useState(
    useSessionStore.persist.hasHydrated()
  )
  React.useEffect(() => {
    return useSessionStore.persist.onFinishHydration(() => setHydrated(true))
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
    if (hydrated && isAuthenticated) router.navigate({ to: "/map" })
  }, [hydrated, isAuthenticated, router])
  if (!hydrated || isAuthenticated) return null
  return <>{children}</>
}
