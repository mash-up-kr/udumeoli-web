import { ChevronDown, Upload, User } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"

/**
 * 브랜드/홈 헤더 (시안 #21). 배경 투명, 2줄 구조: [로고 · 우측 액션] / [드롭다운].
 * 로고·유저명은 예시 placeholder — 추후 실제 에셋·유저 데이터로 교체.
 */
function AppHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn("flex w-full flex-col items-start gap-2 bg-transparent px-4 py-3", className)}
      {...props}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-h2">PHOTATO</span>
        <div className="flex items-center gap-2">
          <Button variant="surface" size="icon" radius="full" shadow="sm" aria-label="업로드">
            <Upload className="size-5" />
          </Button>
          <Button variant="surface" size="icon" radius="full" shadow="sm" aria-label="프로필">
            <User className="size-5" />
          </Button>
        </div>
      </div>

      <Button variant="surface" size="sm" radius="full" shadow="sm" className="gap-1">
        정민이와나
        <ChevronDown className="size-4" />
      </Button>
    </header>
  )
}

export { AppHeader }
