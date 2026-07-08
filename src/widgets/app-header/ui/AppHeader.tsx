import { Upload, User } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"
import iconChevronDownSrc from "@/shared/assets/icon-chevron-down.svg"
import logoPhotatoSrc from "@/shared/assets/logo-photato.svg"

/**
 * 브랜드/홈 헤더 (시안 #21). 배경 투명, 2줄 구조: [로고 · 우측 액션] / [여행팟 선택].
 * potSelector를 주입하면 하단 영역에 렌더(페이지에서 widgets/pot-dropdown 합성).
 * onRecapClick(리캡 생성)·onProfileClick(마이)는 페이지에서 라우팅/토스트 주입.
 */
function AppHeader({
  className,
  potSelector,
  onRecapClick,
  onProfileClick,
  ...props
}: ComponentProps<"header"> & {
  potSelector?: ReactNode
  onRecapClick?: () => void
  onProfileClick?: () => void
}) {
  return (
    <header
      className={cn(
        "flex w-full flex-col items-start gap-2 bg-transparent px-4 py-3",
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center justify-between">
        <img
          src={logoPhotatoSrc}
          alt="PHOTATO"
          className="h-[60px] w-[120px]"
        />
        <div className="flex items-center gap-3">
          <Button
            variant="surface"
            size="icon"
            radius="full"
            shadow="sm"
            className="size-[42px] bg-white/75 text-blue-900 backdrop-blur-[2px]"
            aria-label="리캡 생성"
            onClick={onRecapClick}
          >
            <Upload className="size-[18px]" />
          </Button>
          <Button
            variant="surface"
            size="icon"
            radius="full"
            shadow="sm"
            className="size-[42px] bg-white/75 text-blue-900 backdrop-blur-[2px]"
            aria-label="마이"
            onClick={onProfileClick}
          >
            <User className="size-[18px]" />
          </Button>
        </div>
      </div>

      {potSelector ?? (
        <button
          type="button"
          className="flex items-center justify-center gap-1 rounded-full bg-bg-neutral-subtle py-2 pr-3 pl-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
        >
          <span className="text-b5 text-fg-neutral-bold">정민이와나</span>
          <img src={iconChevronDownSrc} alt="" className="size-6" />
        </button>
      )}
    </header>
  )
}

export { AppHeader }
