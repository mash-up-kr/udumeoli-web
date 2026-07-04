import * as React from "react"
import { overlay } from "overlay-kit"

import { cn } from "@/shared/lib/utils"

export interface ToastOptions {
  message: string
  /** 알림 아이콘(빨간 !) 노출 여부. 기본 false. */
  showIcon?: boolean
  duration?: number
}

const DEFAULT_DURATION_MS = 3000

/** icon-alert (24×24) — 빨간 원형 + 흰 느낌표. 색은 fg-danger-solid. */
function AlertIcon() {
  return (
    <svg
      className="size-6 shrink-0 text-fg-danger-solid"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path
        d="M12 7.5v5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.25" r="1.15" fill="white" />
    </svg>
  )
}

interface ToastProps {
  message: string
  showIcon: boolean
  duration: number
  onDismiss: () => void
}

function Toast({ message, showIcon, duration, onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 px-4">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex max-w-[343px] items-start justify-center gap-2",
          "rounded-full bg-bg-neutral-weak px-5 py-3",
          "shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
        )}
      >
        {showIcon ? <AlertIcon /> : null}
        <span className="min-w-0 flex-1 truncate text-b5 text-fg-neutral-bold">
          {message}
        </span>
      </div>
    </div>
  )
}

export function showToast({
  message,
  showIcon = false,
  duration = DEFAULT_DURATION_MS,
}: ToastOptions) {
  overlay.open(({ unmount }) => (
    <Toast
      message={message}
      showIcon={showIcon}
      duration={duration}
      onDismiss={unmount}
    />
  ))
}
