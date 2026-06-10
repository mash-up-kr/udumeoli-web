import * as React from "react"

import { cn } from "@/shared/lib/utils"

function MobileLayout({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-[430px] min-h-svh", className)} {...props}>
      {children}
    </div>
  )
}

export { MobileLayout }
