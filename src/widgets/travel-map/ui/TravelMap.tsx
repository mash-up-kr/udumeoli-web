import * as React from "react"

import { cn } from "@/shared/lib/utils"

// maplibre-gl은 브라우저(WebGL) 전용 → 클라이언트에서만 동적 로드하여 SSR 오류 회피.
export function TravelMap({ className }: { className?: string }) {
  const [Impl, setImpl] = React.useState<React.ComponentType | null>(null)

  React.useEffect(() => {
    let active = true
    void import("./TravelMapImpl").then((m) => {
      if (active) setImpl(() => m.TravelMapImpl)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      {Impl ? <Impl /> : <div className="size-full animate-pulse bg-muted" />}
    </div>
  )
}
