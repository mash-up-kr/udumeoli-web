import { Link } from "@tanstack/react-router"

import { AppHeader } from "@/widgets/app-header"
import { AppBottomNav, useBottomNavController } from "@/widgets/bottom-nav"
import { TravelMap } from "@/widgets/travel-map"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RequireAuth } from "@/features/auth"

export function MapPage() {
  return (
    <RequireAuth>
      <MobileLayout className="flex h-dvh flex-col">
        <main className="relative flex-1">
          <TravelMap className="absolute inset-0" />

          {/* 지도 위에 떠 있는 브랜드 헤더 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            <AppHeader className="pointer-events-auto" />
          </div>

          {/* TEMP(Phase 2~3에서 실제 진입점으로 교체): 화면 둘러보기용 임시 링크 */}
          <nav className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-3 rounded-full bg-background/90 px-4 py-2 text-b7 underline shadow">
            <Link to="/pots/new">팟 생성</Link>
            <Link to="/pots/join">팟 참여</Link>
            <Link to="/my/profile">프로필</Link>
          </nav>
        </main>

        <AppBottomNav {...useBottomNavController("map")} />
      </MobileLayout>
    </RequireAuth>
  )
}
