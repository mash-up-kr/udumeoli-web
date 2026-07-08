import * as React from "react"
import { overlay } from "overlay-kit"

import { cn } from "@/shared/lib/utils"

export type ToastIcon = "alert" | "alert-neutral" | "check"

export interface ToastOptions {
  message: string
  /** 좌측 아이콘 — alert(빨간 !, 에러) / alert-neutral(검정 !, 안내) / check(파란 ✓, 완료). 기본 없음. */
  icon?: ToastIcon
  duration?: number
  /** 위치 등 컨테이너 오버라이드 (예: 시트 CTA 위 `bottom-[106px]`). */
  className?: string
}

const DEFAULT_DURATION_MS = 3000

/** icon-alert (24×24) — Figma 원본 path. 색은 호출부에서 지정 (danger/neutral). */
function AlertIcon({ className }: { className: string }) {
  return (
    <svg
      className={cn("size-6 shrink-0", className)}
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

/** icon-check-circle (24×24) — Figma 원본 path. 색은 fg-brand-solid. */
function CheckIcon() {
  return (
    <svg
      className="size-6 shrink-0 text-fg-brand-solid"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M10.5821 13.5909L8.58763 11.5964C8.38046 11.389 8.11921 11.2854 7.80387 11.2854C7.48871 11.2854 7.22746 11.389 7.02012 11.5964C6.81296 11.8035 6.71038 12.0648 6.71238 12.3801C6.71438 12.6953 6.81896 12.9565 7.02613 13.1636L9.78063 15.9181C10.01 16.146 10.2775 16.2599 10.5834 16.2599C10.889 16.2599 11.1559 16.146 11.3839 15.9181L16.9441 10.3576C17.1515 10.1505 17.2551 9.89029 17.2551 9.57713C17.2551 9.26379 17.1515 9.00354 16.9441 8.79637C16.737 8.58904 16.4757 8.48537 16.1604 8.48537C15.8452 8.48537 15.584 8.58904 15.3769 8.79637L10.5821 13.5909ZM12.0001 22.2034C10.585 22.2034 9.25713 21.9357 8.01663 21.4004C6.77596 20.865 5.69679 20.1386 4.77912 19.2211C3.86162 18.3035 3.13521 17.2243 2.59987 15.9836C2.06454 14.7431 1.79688 13.4153 1.79688 12.0001C1.79688 10.585 2.06454 9.25712 2.59987 8.01662C3.13521 6.77596 3.86162 5.69679 4.77912 4.77912C5.69679 3.86162 6.77596 3.13521 8.01663 2.59987C9.25713 2.06454 10.585 1.79688 12.0001 1.79688C13.4153 1.79688 14.7431 2.06454 15.9836 2.59987C17.2243 3.13521 18.3035 3.86162 19.2211 4.77912C20.1386 5.69679 20.865 6.77596 21.4004 8.01662C21.9357 9.25712 22.2034 10.585 22.2034 12.0001C22.2034 13.4153 21.9357 14.7431 21.4004 15.9836C20.865 17.2243 20.1386 18.3035 19.2211 19.2211C18.3035 20.1386 17.2243 20.865 15.9836 21.4004C14.7431 21.9357 13.4153 22.2034 12.0001 22.2034Z"
        fill="currentColor"
      />
    </svg>
  )
}

interface ToastProps {
  message: string
  icon?: ToastIcon
  duration: number
  className?: string
  onDismiss: () => void
}

function Toast({ message, icon, duration, className, onDismiss }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div
      className={cn(
        // z-[60]: 모달/시트(z-50, body 끝 portal)가 열려 있어도 토스트가 항상 위에 보이도록
        "fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 px-4",
        className
      )}
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex max-w-[343px] items-start justify-center gap-2",
          "rounded-full bg-bg-neutral-weak px-5 py-3",
          "shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
        )}
      >
        {icon === "alert" ? (
          <AlertIcon className="text-fg-danger-solid" />
        ) : null}
        {icon === "alert-neutral" ? (
          <AlertIcon className="text-fg-neutral-bold" />
        ) : null}
        {icon === "check" ? <CheckIcon /> : null}
        <span className="min-w-0 flex-1 truncate text-b5 text-fg-neutral-bold">
          {message}
        </span>
      </div>
    </div>
  )
}

export function showToast({
  message,
  icon,
  duration = DEFAULT_DURATION_MS,
  className,
}: ToastOptions) {
  overlay.open(({ unmount }) => (
    <Toast
      message={message}
      icon={icon}
      duration={duration}
      className={className}
      onDismiss={unmount}
    />
  ))
}
