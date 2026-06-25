import * as React from "react"

import { cn } from "@/shared/lib/utils"

function MobileLayout({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto min-h-dvh w-full max-w-md bg-background", className)} {...props}>
      {children}
    </div>
  )
}

export { MobileLayout }
