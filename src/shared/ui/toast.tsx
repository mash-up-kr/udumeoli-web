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

/** icon-alert (24×24) — Figma 원본 path. 색은 fg-danger-solid. */
function AlertIcon() {
  return (
    <svg
      className="size-6 shrink-0 text-fg-danger-solid"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        transform="translate(1.797 1.797)"
        d="M11.0383 15.0695C11.2638 14.8448 11.3765 14.5665 11.3765 14.2345C11.3765 13.9025 11.2643 13.6227 11.0398 13.395C10.8151 13.1675 10.5367 13.0538 10.2045 13.0538C9.8725 13.0538 9.59375 13.1675 9.36825 13.395C9.14275 13.6227 9.03 13.9025 9.03 14.2345C9.03 14.5665 9.14225 14.8448 9.36675 15.0695C9.59142 15.2942 9.86983 15.4065 10.202 15.4065C10.534 15.4065 10.8128 15.2942 11.0383 15.0695ZM11.0115 10.8857C11.231 10.6663 11.3408 10.3969 11.3408 10.0778V6.21525C11.3408 5.89608 11.231 5.62667 11.0115 5.407C10.7918 5.1875 10.5224 5.07775 10.2032 5.07775C9.88408 5.07775 9.61467 5.1875 9.395 5.407C9.1755 5.62667 9.06575 5.89608 9.06575 6.21525V10.0778C9.06575 10.3969 9.1755 10.6663 9.395 10.8857C9.61467 11.1054 9.88408 11.2153 10.2032 11.2153C10.5224 11.2153 10.7918 11.1054 11.0115 10.8857ZM10.2032 20.4065C8.78808 20.4065 7.46025 20.1388 6.21975 19.6035C4.97908 19.0682 3.89992 18.3417 2.98225 17.4242C2.06475 16.5066 1.33833 15.4274 0.803 14.1867C0.267667 12.9462 0 11.6184 0 10.2032C0 8.78808 0.267667 7.46025 0.803 6.21975C1.33833 4.97908 2.06475 3.89992 2.98225 2.98225C3.89992 2.06475 4.97908 1.33833 6.21975 0.803C7.46025 0.267667 8.78808 0 10.2032 0C11.6184 0 12.9463 0.267667 14.1868 0.803C15.4274 1.33833 16.5066 2.06475 17.4243 2.98225C18.3418 3.89992 19.0682 4.97908 19.6035 6.21975C20.1388 7.46025 20.4065 8.78808 20.4065 10.2032C20.4065 11.6184 20.1388 12.9462 19.6035 14.1867C19.0682 15.4274 18.3418 16.5066 17.4243 17.4242C16.5066 18.3417 15.4274 19.0682 14.1868 19.6035C12.9463 20.1388 11.6184 20.4065 10.2032 20.4065Z"
        fill="currentColor"
      />
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
