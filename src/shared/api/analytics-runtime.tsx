import * as React from "react"
import { useRouterState } from "@tanstack/react-router"

import { trackEvent } from "./analytics"

let lastTrackedRoute: string | null = null

export function trackPageViewForRoute(routeKey: string): void {
  if (lastTrackedRoute === routeKey) return
  lastTrackedRoute = routeKey
  trackEvent("page_view")
}

/** 초기 경로와 SPA에서 변경된 각 경로에 page_view를 한 번씩 전송한다. */
export function AnalyticsRuntime() {
  const location = useRouterState({
    select: (state) => state.location,
  })
  const routeKey = `${location.pathname}${location.searchStr}`

  React.useEffect(() => {
    trackPageViewForRoute(routeKey)
  }, [routeKey])

  return null
}
