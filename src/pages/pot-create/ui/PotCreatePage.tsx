import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RequireAuth } from "@/features/auth"

export function PotCreatePage() {
  return (
    <RequireAuth>
      <MobileLayout>
        <main className="flex min-h-dvh items-center justify-center p-6">
          <p className="text-b5 text-muted-foreground">여행팟 생성 (placeholder)</p>
        </main>
      </MobileLayout>
    </RequireAuth>
  )
}
