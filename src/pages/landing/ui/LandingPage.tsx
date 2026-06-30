import { useRouter } from "@tanstack/react-router"

import { Button } from "@/shared/ui/button"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RedirectIfAuthed } from "@/features/auth"

export function LandingPage() {
  const router = useRouter()
  return (
    <RedirectIfAuthed>
      <MobileLayout className="flex min-h-dvh flex-col px-5 pt-16 pb-8">
        <div className="flex flex-1 flex-col">
          <span className="text-h2">PHOTATO</span>
          <p className="mt-3 text-h4 leading-snug whitespace-pre-line text-foreground">
            {"로그인하고\n서비스를 사용해 보세요"}
          </p>
          <div className="mt-8 flex flex-1 items-center justify-center rounded-[20px] bg-muted text-b5 text-muted-foreground">
            그래픽
          </div>
        </div>

        <Button
          variant="kakao"
          size="cta"
          className="w-full"
          onClick={() => router.navigate({ to: "/signup" })}
        >
          카카오로 시작하기
        </Button>
      </MobileLayout>
    </RedirectIfAuthed>
  )
}
