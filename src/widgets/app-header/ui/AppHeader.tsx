import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/shared/lib/utils"
import iconChevronDownIosSrc from "@/shared/assets/icon-chevron-down-ios.svg"
import logoSrc from "@/shared/assets/logo-pinnned.svg"

/**
 * 브랜드/홈 헤더 (시안 1745-38063). 배경 투명, 1줄 구조: [로고 · 여행팟 선택].
 * potSelector를 주입하면 우측에 렌더(페이지에서 widgets/pot-dropdown 합성).
 */
function AppHeader({
  className,
  potSelector,
  ...props
}: ComponentProps<"header"> & {
  potSelector?: ReactNode
}) {
  return (
    // 지도 위에 떠 있으므로 헤더 박스 자체는 클릭을 통과시키고,
    // 실제 인터랙티브 요소(팟 선택)에만 pointer-events를 준다
    <header
      className={cn(
        "pointer-events-none flex w-full items-center justify-between bg-transparent px-4 py-3",
        className
      )}
      {...props}
    >
      {/* 로고 (시안 2386-16530, 120×28) */}
      <div className="flex h-[60px] items-center">
        <img src={logoSrc} alt="Pinnned" className="h-7" />
      </div>

      {potSelector ? (
        <div className="pointer-events-auto">{potSelector}</div>
      ) : (
        <button
          type="button"
          // 시안 1893-19524: 반투명 흰색(60%) + blur 필 (글자색 #2d446c → 최근접 토큰 blue-900)
          className="pointer-events-auto flex h-[42px] items-center justify-center gap-2 rounded-full bg-neutral-0/60 px-4 py-2 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.05)] backdrop-blur-[2px]"
        >
          <span className="text-h6-1 text-blue-900">정민이와나</span>
          <img src={iconChevronDownIosSrc} alt="" className="size-5" />
        </button>
      )}
    </header>
  )
}

export { AppHeader }
