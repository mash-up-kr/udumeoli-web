import * as React from "react"
import { useRouter, useRouterState } from "@tanstack/react-router"

import { trackEvent } from "./analytics"
import { initializeGoogleAnalytics } from "./google-analytics"

let lastTrackedPath: string | null = null

export function trackPageViewForPath(pathname: string): void {
  if (lastTrackedPath === pathname) return
  lastTrackedPath = pathname
  trackEvent("page_view")
}

/** 초기 경로와 SPA에서 변경된 각 경로에 page_view를 한 번씩 전송한다. */
export function AnalyticsRuntime() {
  const router = useRouter()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  React.useEffect(() => {
    // Router는 주소 변경을 배치한다. GA가 이전 콜백 URL을 읽지 않도록 먼저 반영한다.
    router.history.flush()
    initializeGoogleAnalytics()
    trackPageViewForPath(pathname)
  }, [pathname, router])

  return null
}
