import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { AppHeader } from "@/widgets/app-header"
import { PotSelector } from "@/widgets/pot-dropdown"
import { TravelMapGoogle } from "@/widgets/travel-map-google"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { openConfirm } from "@/shared/ui/modal"
import { showToast } from "@/shared/ui/toast"
import { RequireAuth } from "@/features/auth"
import { openMyPageModal } from "@/features/my-page"
import { useDecorateStore } from "@/features/region-decorate"
import { photoKeys, seedUtPhotos } from "@/entities/photo"
import { usePotStore } from "@/entities/travel-pot"

export function MapGooglePage() {
  const decorating = useDecorateStore((s) => s.region !== null)
  const [detailRegion, setDetailRegion] = React.useState<string | null>(null)

  const queryClient = useQueryClient()
  const seedUtPot = usePotStore((s) => s.seedUtPot)

  // 상단 공유 버튼 — 1차 UT용 데이터(여행팟+사진) 시드 트리거로 임시 사용
  const loadUtData = async () => {
    const ok = await openConfirm({
      title: "UT용 데이터를 불러올까요?",
      description: "미리 준비된 여행팟과 사진이 세팅돼요.",
    })
    if (!ok) return
    seedUtPhotos()
    seedUtPot()
    await queryClient.invalidateQueries({ queryKey: photoKeys.list() })
    showToast({ message: "UT용 데이터를 불러왔어요" })
  }

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
                onRecapClick={() => void loadUtData()}
                onProfileClick={() => openMyPageModal()}
              />
            </div>
          ) : null}
        </main>
      </MobileLayout>
    </RequireAuth>
  )
}
