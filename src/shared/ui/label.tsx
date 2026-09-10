import { Label as LabelPrimitive } from "radix-ui"
import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // 시안 TextInput의 Heading은 H6-1(600) — H6(700)가 아니다
        "text-h6-1 select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
