import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RedirectIfAuthed } from "@/features/auth"

export function LandingPage() {
  return (
    <RedirectIfAuthed>
      <MobileLayout>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-6">
          <h1 className="text-h2">PHOTATO</h1>
          <p className="text-b5 text-muted-foreground">서비스 진입 (placeholder)</p>
        </main>
      </MobileLayout>
    </RedirectIfAuthed>
  )
}
