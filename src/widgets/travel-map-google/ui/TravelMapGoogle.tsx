import * as React from "react"
import type { TravelMapImplProps } from "./TravelMapGoogleImpl"

import { cn } from "@/shared/lib/utils"

// Google Maps JS API도 브라우저 전용 → 클라이언트에서만 동적 로드해 SSR 오류 회피.
export function TravelMapGoogle({
  className,
  ...implProps
}: TravelMapImplProps & { className?: string }) {
  const [Impl, setImpl] =
    React.useState<React.ComponentType<TravelMapImplProps> | null>(null)

  React.useEffect(() => {
    let active = true
    void import("./TravelMapGoogleImpl").then((m) => {
      if (active) setImpl(() => m.TravelMapGoogleImpl)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      {Impl ? (
        <Impl {...implProps} />
      ) : (
        <div className="size-full animate-pulse bg-muted" />
      )}
    </div>
  )
}
