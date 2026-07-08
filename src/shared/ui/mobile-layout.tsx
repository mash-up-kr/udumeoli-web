import * as React from "react"

import { cn } from "@/shared/lib/utils"

function MobileLayout({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        // 데스크탑에서 aurora 배경 위에 떠 있는 프레임 — 앰비언트 섀도 + 헤어라인
        "mx-auto min-h-dvh w-full max-w-md bg-background shadow-[0px_0px_80px_0px_rgba(142,150,169,0.35)] ring-1 ring-neutral-900/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { MobileLayout }
