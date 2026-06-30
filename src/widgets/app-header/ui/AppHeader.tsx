import { ChevronDown, Upload, User } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"

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
      className={cn("flex w-full flex-col items-start gap-2 bg-transparent px-4 py-3", className)}
      {...props}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-h2">PHOTATO</span>
        <div className="flex items-center gap-2">
          <Button
            variant="surface"
            size="icon"
            radius="full"
            shadow="sm"
            className="bg-white/60 backdrop-blur-[2px]"
            aria-label="리캡 생성"
            onClick={onRecapClick}
          >
            <Upload className="size-5" />
          </Button>
          <Button
            variant="surface"
            size="icon"
            radius="full"
            shadow="sm"
            className="bg-white/60 backdrop-blur-[2px]"
            aria-label="마이"
            onClick={onProfileClick}
          >
            <User className="size-5" />
          </Button>
        </div>
      </div>

      {potSelector ?? (
        <Button variant="surface" size="sm" radius="full" shadow="sm" className="gap-1">
          정민이와나
          <ChevronDown className="size-4" />
        </Button>
      )}
    </header>
  )
}

export { AppHeader }
