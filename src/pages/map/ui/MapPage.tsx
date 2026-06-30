import { Link } from "@tanstack/react-router"

import { AppHeader } from "@/widgets/app-header"
import { AppBottomNav, useBottomNavController } from "@/widgets/bottom-nav"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RequireAuth } from "@/features/auth"

export function MapPage() {
  return (
    <RequireAuth>
      <MobileLayout className="flex min-h-dvh flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-muted">
          <p className="text-b5 text-muted-foreground">메인 지도 (placeholder)</p>
          {/* TEMP(Phase 2~3에서 실제 진입점으로 교체): 화면 둘러보기용 임시 링크 */}
          <nav className="flex flex-col items-center gap-1 text-b6 text-foreground underline">
            <Link to="/pots/new">여행팟 생성</Link>
            <Link to="/pots/join">여행팟 참여</Link>
            <Link to="/my/profile">프로필 수정</Link>
          </nav>
        </main>
        <AppBottomNav {...useBottomNavController("map")} />
      </MobileLayout>
    </RequireAuth>
  )
}
