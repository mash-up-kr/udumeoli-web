import { AppBottomNav, useBottomNavController } from "@/widgets/bottom-nav"
import { Button } from "@/shared/ui/button"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { useSessionStore } from "@/entities/user"
import { RequireAuth } from "@/features/auth"

export function MyPage() {
  // TEMP(Phase 4에서 실제 로그아웃 플로우로 교체): 랜딩으로 돌아가기용 임시 로그아웃
  const logout = useSessionStore((s) => s.logout)
  return (
    <RequireAuth>
      <MobileLayout className="flex min-h-dvh flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-b5 text-muted-foreground">마이 페이지 (placeholder)</p>
          <Button variant="secondary" onClick={() => logout()}>
            로그아웃 (임시)
          </Button>
        </main>
        <AppBottomNav {...useBottomNavController("my")} />
      </MobileLayout>
    </RequireAuth>
  )
}
