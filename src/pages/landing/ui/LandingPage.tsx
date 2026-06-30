import { Button } from "@/shared/ui/button"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { MOCK_USER, useSessionStore } from "@/entities/user"
import { RedirectIfAuthed } from "@/features/auth"

export function LandingPage() {
  // TEMP(Phase 1에서 카카오 스텁 로그인으로 교체): 화면 둘러보기용 임시 로그인
  const login = useSessionStore((s) => s.login)
  return (
    <RedirectIfAuthed>
      <MobileLayout>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-h2">PHOTATO</h1>
          <p className="text-b5 text-muted-foreground">서비스 진입 (placeholder)</p>
          <Button onClick={() => login(MOCK_USER)}>둘러보기 시작 (임시 로그인)</Button>
        </main>
      </MobileLayout>
    </RedirectIfAuthed>
  )
}
