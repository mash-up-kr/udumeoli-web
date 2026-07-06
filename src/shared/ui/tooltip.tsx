import type { ComponentProps } from "react"

import { cn } from "@/shared/lib/utils"

export type TooltipProps = ComponentProps<"div">

/**
 * Tooltip (Figma Tooltip v1.0.0).
 *
 * 상단 중앙 화살표가 달린 어두운 말풍선. 표시/위치 제어는 사용하는 쪽에서 담당.
 */
function Tooltip({ className, children, ...props }: TooltipProps) {
  return (
    <div
      role="tooltip"
      className={cn(
        "relative inline-flex h-8 items-center justify-center rounded-full bg-bg-neutral-inverse px-4 py-1 drop-shadow-[0px_0px_10px_rgba(142,150,169,0.12)]",
        className
      )}
      {...props}
    >
      <svg
        aria-hidden
        viewBox="80 12 18 12"
        className="absolute -top-2 left-1/2 h-3 w-4.5 -translate-x-1/2"
      >
        <path
          d="M87.4883 13.7461C88.2858 12.8252 89.7142 12.8252 90.5117 13.7461L96.5264 20.6904C97.6481 21.9857 96.7281 23.9999 95.0146 24H82.9854C81.2719 23.9999 80.3519 21.9857 81.4736 20.6904L87.4883 13.7461Z"
          className="fill-bg-neutral-inverse"
        />
      </svg>
      <p className="text-center text-b6 whitespace-nowrap text-fg-neutral-inverse">
        {children}
      </p>
    </div>
  )
}

export { Tooltip }
