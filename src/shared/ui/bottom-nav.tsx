import * as React from "react"

import { cn } from "@/shared/lib/utils"

export interface BottomNavItem {
  icon: React.ReactNode
  label: string
}

export interface BottomNavProps {
  items: Array<BottomNavItem>
  activeIndex: number
  onChange?: (index: number) => void
  className?: string
}

export function BottomNav({
  items,
  activeIndex,
  onChange,
  className,
}: BottomNavProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start justify-center gap-3",
        "border-t border-neutral-150 bg-background",
        "px-6.25 pt-4 pb-5",
        className
      )}
    >
      {items.map((item, i) => {
        const isActive = i === activeIndex
        return (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange?.(i)}
            className={cn(
              "relative flex w-25.5 flex-col items-center justify-center gap-px",
              "px-2 pt-1.5 pb-1.75",
              "text-center",
              isActive ? "text-foreground" : "text-neutral-300"
            )}
          >
            {isActive && (
              <span className="absolute -inset-x-0.5 inset-y-0 rounded-full bg-neutral-150" />
            )}
            <span className="relative z-10 flex items-center justify-center text-h5 leading-none">
              {item.icon}
            </span>
            <span className="relative z-10 text-[12px] leading-normal font-semibold tracking-[-0.24px]">
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
