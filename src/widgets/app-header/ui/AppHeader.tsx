import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/shared/lib/utils"
import iconChevronDownSrc from "@/shared/assets/icon-chevron-down.svg"
import logoPhotatoSrc from "@/shared/assets/logo-photato.svg"

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
      <img src={logoPhotatoSrc} alt="PHOTATO" className="h-[60px] w-[120px]" />

      {potSelector ? (
        <div className="pointer-events-auto">{potSelector}</div>
      ) : (
        <button
          type="button"
          className="pointer-events-auto flex items-center justify-center gap-1 rounded-full bg-bg-neutral-subtle py-2 pr-3 pl-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
        >
          <span className="text-b5 text-fg-neutral-bold">정민이와나</span>
          <img src={iconChevronDownSrc} alt="" className="size-6" />
        </button>
      )}
    </header>
  )
}

export { AppHeader }
