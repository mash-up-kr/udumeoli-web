import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "pointer-events-none animate-pulse rounded-[8px] bg-bg-neutral-solid",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
