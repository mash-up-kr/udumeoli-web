import * as React from "react"
import { useRouterState } from "@tanstack/react-router"

import { trackEvent } from "./analytics"

let lastTrackedPath: string | null = null

export function trackPageViewForPath(pathname: string): void {
  if (lastTrackedPath === pathname) return
  lastTrackedPath = pathname
  trackEvent("page_view")
}

/** 초기 경로와 SPA에서 변경된 각 경로에 page_view를 한 번씩 전송한다. */
export function AnalyticsRuntime() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  React.useEffect(() => {
    trackPageViewForPath(pathname)
  }, [pathname])

  return null
}
