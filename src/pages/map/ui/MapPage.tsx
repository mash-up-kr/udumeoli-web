import { AppHeader } from "@/widgets/app-header"
import { AppBottomNav, useBottomNavController } from "@/widgets/bottom-nav"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RequireAuth } from "@/features/auth"

export function MapPage() {
  return (
    <RequireAuth>
      <MobileLayout className="flex min-h-dvh flex-col">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center bg-muted">
          <p className="text-b5 text-muted-foreground">메인 지도 (placeholder)</p>
        </main>
        <AppBottomNav {...useBottomNavController("map")} />
      </MobileLayout>
    </RequireAuth>
  )
}
