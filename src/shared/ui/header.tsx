import { ArrowLeft, X } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

type HeaderType = "screen-info" | "close"
type HeaderDirection = "left" | "center"

/**
 * 화면 상단 헤더 (Design System v1.0.0 · Figma Header).
 *
 * - `type`: `screen-info`(뒤로가기 ←) · `close`(닫기 ✕)
 * - `direction`: `left`(아이콘+타이틀 좌측 정렬) · `center`(타이틀 중앙, 아이콘은 screen-info=좌 / close=우)
 * - `icon`: 아이콘 노출 여부
 *
 * 컨테이너 padding 16/12 · gap 24, 타이틀 text-h5-1 · fg-neutral-bold.
 * 상단 padding에 설치형 PWA 상태바 safe-area 반영.
 */
function Header({
  type = "screen-info",
  direction = "left",
  icon = true,
  title,
  onIconClick,
  className,
  ...props
}: Omit<ComponentProps<"header">, "title"> & {
  type?: HeaderType
  direction?: HeaderDirection
  icon?: boolean
  title?: ReactNode
  onIconClick?: () => void
}) {
  const Icon = type === "close" ? X : ArrowLeft

  const iconButton = (
    <button
      type="button"
      aria-label={type === "close" ? "닫기" : "뒤로 가기"}
      onClick={onIconClick}
      className="flex size-6 shrink-0 items-center justify-center text-fg-neutral-bold"
    >
      <Icon className="size-6" />
    </button>
  )
  const spacer = <span className="size-6 shrink-0" aria-hidden />

  // pt: 설치형 PWA 상태바 safe-area + 기본 12px. 브라우저 탭에선 inset=0.
  const base =
    "flex w-full items-center gap-6 bg-transparent px-4 pt-[calc(env(safe-area-inset-top)_+_0.75rem)] pb-3"
  const titleCls = "min-w-0 flex-1 truncate text-h5-1 text-fg-neutral-bold"

  if (direction === "center") {
    return (
      <header className={cn(base, className)} {...props}>
        {icon && type !== "close" ? iconButton : spacer}
        <h1 className={cn(titleCls, "text-center")}>{title}</h1>
        {icon && type === "close" ? iconButton : spacer}
      </header>
    )
  }

  return (
    <header className={cn(base, className)} {...props}>
      {icon ? iconButton : null}
      <h1 className={cn(titleCls, "text-left")}>{title}</h1>
    </header>
  )
}

export { Header }
export type { HeaderType, HeaderDirection }
