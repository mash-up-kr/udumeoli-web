import { useRouter } from "@tanstack/react-router"

import { AppHeader } from "@/widgets/app-header"
import { AppBottomNav, useBottomNavController } from "@/widgets/bottom-nav"
import { PotSelector } from "@/widgets/pot-dropdown"
import { TravelMap } from "@/widgets/travel-map"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { showToast } from "@/shared/ui/toast"
import { RequireAuth } from "@/features/auth"

export function MapPage() {
  const router = useRouter()
  return (
    <RequireAuth>
      <MobileLayout className="flex h-dvh flex-col">
        <main className="relative flex-1">
          <TravelMap className="absolute inset-0" />

          {/* 지도 위에 떠 있는 브랜드 헤더 + 여행팟 선택 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            <AppHeader
              className="pointer-events-auto"
              potSelector={<PotSelector />}
              onRecapClick={() => showToast({ message: "준비 중인 기능이에요", type: "info" })}
              onProfileClick={() => router.navigate({ to: "/my" })}
            />
          </div>
        </main>

        <AppBottomNav {...useBottomNavController("map")} />
      </MobileLayout>
    </RequireAuth>
  )
}
