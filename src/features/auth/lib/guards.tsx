import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { useSessionStore } from "@/entities/user"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const router = useRouter()
  React.useEffect(() => {
    if (!isAuthenticated) router.navigate({ to: "/" })
  }, [isAuthenticated, router])
  if (!isAuthenticated) return null
  return <>{children}</>
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const router = useRouter()
  React.useEffect(() => {
    if (isAuthenticated) router.navigate({ to: "/map" })
  }, [isAuthenticated, router])
  if (isAuthenticated) return null
  return <>{children}</>
}
