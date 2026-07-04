import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

// Figma Button - Icon (Large). 흰 배경 · shadow, disabled 시 weak-disabled 토큰.
const buttonIconVariants = cva(
  "inline-flex items-center justify-center rounded-full bg-bg-neutral-weak text-fg-neutral-bold shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)] transition-colors disabled:pointer-events-none disabled:bg-bg-neutral-weak-disabled disabled:text-fg-neutral-bold-disabled",
  {
    variants: {
      // icon: 아이콘 단독 원형 42px(아이콘 24) / label: 아이콘 20 + 라벨 pill
      variant: {
        icon: "size-[42px] [&_svg]:size-6",
        label: "h-[42px] gap-1 px-3 text-h8 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "icon" },
  }
)

/**
 * ButtonIcon (Figma Button - Icon v1.0.0).
 *
 * 지도 위 등에 떠 있는 흰색 아이콘 버튼. variant: icon(원형 단독)·label(아이콘+라벨 pill).
 * 아이콘은 children으로 주입. icon 단독 사용 시 `aria-label` 필수.
 */
function ButtonIcon({
  variant,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonIconVariants>) {
  return (
    <button
      type={type}
      className={cn(buttonIconVariants({ variant }), className)}
      {...props}
    />
  )
}

export { ButtonIcon, buttonIconVariants }
