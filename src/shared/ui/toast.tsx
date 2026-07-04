import * as React from "react"
import { overlay } from "overlay-kit"

import { cn } from "@/shared/lib/utils"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

const DEFAULT_DURATION_MS = 3000

// filled 원형 아이콘 — 디자인 시스템 확정 전 인라인 SVG로 대체
const iconColors: Record<ToastType, string> = {
  success: "var(--color-success)",
  error: "var(--color-error)",
  info: "var(--color-error)",
  warning: "var(--color-warning)",
}

function FilledCircleIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="10" style={{ fill: color }} />
      <text
        x="10"
        y="15"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        i
      </text>
    </svg>
  )
}

const typeLabels: Record<ToastType, string> = {
  success: "성공",
  error: "오류",
  info: "안내",
  warning: "경고",
}

interface ToastProps {
  message: string
  type: ToastType
  duration: number
  onDismiss: () => void
}

function Toast({ message, type, duration, onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${typeLabels[type]}: ${message}`}
      className={cn(
        "fixed bottom-8 left-1/2 z-50 -translate-x-1/2",
        "flex items-center gap-2",
        "rounded-full bg-background px-4 py-3.5",
        "shadow-[0px_0px_6.1px_0px_rgba(0,0,0,0.12)]",
        "text-base font-semibold tracking-[-0.24px] whitespace-nowrap text-foreground"
      )}
    >
      <FilledCircleIcon color={iconColors[type]} />
      {message}
    </div>
  )
}

export function showToast({
  message,
  type = "info",
  duration = DEFAULT_DURATION_MS,
}: ToastOptions) {
  overlay.open(({ unmount }) => (
    <Toast
      message={message}
      type={type}
      duration={duration}
      onDismiss={unmount}
    />
  ))
}
