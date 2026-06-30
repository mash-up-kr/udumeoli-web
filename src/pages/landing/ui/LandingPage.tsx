import { useRouter } from "@tanstack/react-router"

import { Button } from "@/shared/ui/button"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RedirectIfAuthed } from "@/features/auth"

export function LandingPage() {
  const router = useRouter()
  return (
    <RedirectIfAuthed>
      {/* Figma: padding 24/20/120/20, gap 48, column align-start */}
      <MobileLayout className="flex h-dvh flex-col items-start gap-12 px-5 pt-6 pb-30">
        <div className="rounded-[10px] bg-muted px-4 py-2 text-b6 text-muted-foreground">로고</div>

        <p className="text-h4 leading-snug whitespace-pre-line text-foreground">
          {"로그인하고\n서비스를 사용해 보세요"}
        </p>

        <div className="flex w-full flex-1 items-center justify-center rounded-[20px] bg-muted text-b5 text-muted-foreground">
          그래픽
        </div>

        <Button size="cta" className="w-full" onClick={() => router.navigate({ to: "/signup" })}>
          카카오로 시작하기
        </Button>
      </MobileLayout>
    </RedirectIfAuthed>
  )
}
