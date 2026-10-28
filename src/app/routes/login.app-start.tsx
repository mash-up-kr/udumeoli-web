import * as React from "react"
import { createFileRoute, useSearch } from "@tanstack/react-router"

import { API_BASE_URL } from "@/shared/api/client"
import { APP_LOGIN_MARKER } from "@/shared/lib/app-login"

export const Route = createFileRoute("/login/app-start")({
  validateSearch: (search: Record<string, unknown>) => ({
    provider:
      search.provider === "kakao" ||
      search.provider === "apple" ||
      search.provider === "google"
        ? search.provider
        : undefined,
  }),
  component: AppLoginStart,
})

function AppLoginStart() {
  const { provider } = useSearch({ from: "/login/app-start" })

  React.useEffect(() => {
    if (!provider) {
      window.location.replace("/")
      return
    }
    window.sessionStorage.setItem(APP_LOGIN_MARKER, String(Date.now()))
    const callback = encodeURIComponent(
      `${window.location.origin}/login/callback`
    )
    window.location.replace(
      `${API_BASE_URL}/oauth2/authorization/${provider}?frontendRedirect=${callback}`
    )
  }, [provider])

  return null
}
