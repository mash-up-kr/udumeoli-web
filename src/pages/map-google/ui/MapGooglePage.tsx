import * as React from "react"

import { AppHeader } from "@/widgets/app-header"
import { PotSelector } from "@/widgets/pot-dropdown"
import { TravelMapGoogle } from "@/widgets/travel-map-google"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { showToast } from "@/shared/ui/toast"
import { RequireAuth } from "@/features/auth"
import { openMyPageModal } from "@/features/my-page"
import { useDecorateStore } from "@/features/region-decorate"

/**
 * Google Maps 이식 스파이크(#76) 확인용 페이지. /map(MapLibre)과 별도,
 * 확정 아님 — PoC 검증 전용. 삭제해도 /map에는 영향 없음.
 */
export function MapGooglePage() {
  const decorating = useDecorateStore((s) => s.region !== null)
  const [detailRegion, setDetailRegion] = React.useState<string | null>(null)

  return (
    <RequireAuth>
      <MobileLayout className="flex h-dvh flex-col">
        <main className="relative flex-1">
          <TravelMapGoogle
            className="absolute inset-0"
            onRegionDetailChange={setDetailRegion}
          />

          {!decorating && detailRegion === null ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 pt-[env(safe-area-inset-top)]">
              <AppHeader
                className="pointer-events-auto"
                potSelector={<PotSelector />}
                onRecapClick={() =>
                  showToast({ message: "준비 중인 기능이에요" })
                }
                onProfileClick={() => openMyPageModal()}
              />
            </div>
          ) : null}
        </main>
      </MobileLayout>
    </RequireAuth>
  )
}
