import { cva } from "class-variance-authority"
import { Plus } from "lucide-react"
import type { VariantProps } from "class-variance-authority"
import type { CSSProperties, ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

const colorSwatchVariants = cva(
  "relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px]",
  {
    variants: {
      variant: {
        empty: "bg-bg-neutral-weak",
        add: "bg-bg-neutral-weak",
        color: "",
      },
      selected: {
        true: "border-4 border-stroke-neutral-bold",
        false: "border border-fg-neutral-subtle",
      },
    },
    defaultVariants: {
      variant: "empty",
      selected: false,
    },
  }
)

/**
 * Color Swatch (Design System v1.0.0 · Figma Color Swatch).
 *
 * 48px 정사각 스와치 버튼. `selected` 시 `stroke-neutral-bold` 4px 테두리,
 * 미선택 시 `fg-neutral-subtle` 1px 테두리.
 * - `empty`: 색상 없음 — `fg-danger-solid` 대각선 표시
 * - `add`: 색상 추가 — + 아이콘 표시
 * - `color`: `color` 값으로 채워진 스와치
 *
 * 아이콘 전용 버튼이므로 사용처에서 `aria-label`을 전달한다.
 */
function ColorSwatch({
  variant = "empty",
  selected = false,
  color,
  className,
  style,
  type = "button",
  ...props
}: Omit<ComponentProps<"button">, "children" | "color"> &
  VariantProps<typeof colorSwatchVariants> & {
    /** `variant="color"`일 때 채울 색상 값. 토큰 var() 사용 권장. */
    color?: CSSProperties["backgroundColor"]
  }) {
  return (
    <button
      type={type}
      aria-pressed={selected === true}
      className={cn(colorSwatchVariants({ variant, selected }), className)}
      style={variant === "color" ? { backgroundColor: color, ...style } : style}
      {...props}
    >
      {variant === "empty" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          fill="none"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full text-fg-danger-solid"
        >
          <path
            d="M48 0L0 48"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
      {variant === "add" ? (
        <Plus
          aria-hidden="true"
          className="size-6 text-fg-neutral-subtle"
          strokeWidth={3.75}
        />
      ) : null}
    </button>
  )
}

export { ColorSwatch, colorSwatchVariants }
