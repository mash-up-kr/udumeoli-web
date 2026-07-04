import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

// Figma Button - CTA (Large). 풀폭 pill, 라벨 H6. variant별 default/disabled 토큰.
const ctaVariants = cva(
  "flex w-full items-center justify-center rounded-full p-4 text-center text-h6 transition-colors disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-bg-neutral-inverse text-fg-neutral-inverse disabled:bg-bg-neutral-inverse-disabled disabled:text-fg-neutral-inverse-disabled",
        secondary:
          "bg-bg-neutral-subtle text-fg-neutral-bold disabled:bg-bg-neutral-subtle-disabled disabled:text-fg-neutral-bold-disabled",
        danger:
          "bg-bg-danger-solid text-fg-neutral-inverse disabled:bg-bg-danger-solid-disabled disabled:text-fg-neutral-inverse-disabled",
      },
    },
    defaultVariants: { variant: "primary" },
  }
)

/**
 * ButtonCta (Figma Button - CTA v1.0.0).
 *
 * 화면 하단 등에 쓰는 풀폭 주요 액션 버튼. variant: primary·secondary·danger.
 * `disabled` 시 variant별 disabled 토큰 적용.
 */
function ButtonCta({
  variant,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & VariantProps<typeof ctaVariants>) {
  return (
    <button
      type={type}
      className={cn(ctaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { ButtonCta, ctaVariants }
