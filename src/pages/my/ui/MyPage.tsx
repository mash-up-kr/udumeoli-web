import { AppBottomNav, useBottomNavController } from "@/widgets/bottom-nav"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RequireAuth } from "@/features/auth"

export function MyPage() {
  return (
    <RequireAuth>
      <MobileLayout className="flex min-h-dvh flex-col">
        <main className="flex flex-1 items-center justify-center">
          <p className="text-b5 text-muted-foreground">마이 페이지 (placeholder)</p>
        </main>
        <AppBottomNav {...useBottomNavController("my")} />
      </MobileLayout>
    </RequireAuth>
  )
}
