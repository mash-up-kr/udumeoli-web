import * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "radix-ui"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // 배경 O — 시안의 다크 버튼(#2A2A2C/#202025). CTA·pill·아이콘(배경O)·아이콘+글자.
        solid: "bg-primary text-primary-foreground hover:bg-primary/80",
        // 배경 흰색(#FFF) — 흰 원형 아이콘 버튼 등. 그림자는 shadow prop으로.
        surface: "bg-background text-foreground hover:bg-muted",
        // 배경 X — 텍스트 버튼 / 아이콘(배경X). 투명, 글자·아이콘만.
        text: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        outline:
          "border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        kakao: "bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90",
      },
      size: {
        default: "h-9 gap-1.5 px-2.5",
        sm: "h-8 gap-1 px-2.5",
        lg: "h-10 gap-1.5 px-2.5",
        xl: "h-14 gap-2 px-6 text-base",
        // 풀폭 CTA(#6: h61). 폭은 w-full + 부모 좌우 패딩으로 반응형 처리.
        cta: "h-[61px] gap-2.5 px-2.5 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
      // 테두리 굴곡 — 시안 기준 3단계(12 / 24 / 완전 둥금).
      radius: {
        md: "rounded-[12px]",
        lg: "rounded-[24px]",
        full: "rounded-full",
      },
      // 그림자 — 시안 기준 2종 + 없음.
      shadow: {
        none: "",
        sm: "shadow-[0_0_4px_0_rgba(0,0,0,0.2)]",
        lg: "shadow-[0_0_14px_0_rgba(45,45,45,0.25)]",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
      radius: "md",
      shadow: "none",
    },
  }
)

function Button({
  className,
  variant = "solid",
  size = "default",
  radius = "md",
  shadow = "none",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, radius, shadow, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
