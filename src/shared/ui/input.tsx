import * as React from "react"

import { cn } from "@/shared/lib/utils"

/**
 * Figma TextInput 필드 (v1.0.0). rounded-12, 상태별 border 토큰.
 * default: stroke-neutral-subtle / focus: stroke-neutral-bold / disabled: bg-neutral-subtle
 * error(aria-invalid): stroke-danger-subtle, focus 시 stroke-danger-solid.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-xl border border-stroke-neutral-subtle bg-bg-neutral-weak px-4 py-3 text-b4 text-fg-neutral-bold transition-colors outline-none",
        "placeholder:text-fg-neutral-bold-disabled",
        "focus-visible:border-stroke-neutral-bold",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-stroke-neutral-subtle-disabled disabled:bg-bg-neutral-subtle",
        "aria-invalid:border-stroke-danger-subtle aria-invalid:focus-visible:border-stroke-danger-solid",
        className
      )}
      {...props}
    />
  )
}

export { Input }
