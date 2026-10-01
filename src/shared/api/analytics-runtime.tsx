import * as React from "react"
import { useRouterState } from "@tanstack/react-router"

import { trackEvent } from "./analytics"

let lastTrackedRoute: string | null = null

export function trackPageViewForRoute(routeKey: string): void {
  if (lastTrackedRoute === routeKey) return
  lastTrackedRoute = routeKey
  trackEvent("page_view")
}

/** Sends one page_view for the initial route and each distinct SPA location. */
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
