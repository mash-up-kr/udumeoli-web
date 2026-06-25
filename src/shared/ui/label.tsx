import { Label as LabelPrimitive } from "radix-ui"
import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-h6 select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
