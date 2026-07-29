import * as React from "react"
import { useRouter } from "@tanstack/react-router"
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

function MapGooglePageContent() {
  const router = useRouter()
  // 참여 중인 팟이 하나도 없으면(신규 유저) 지도 대신 여행팟 시작 온보딩으로 보낸다
  const hasPot = usePotStore((s) => s.pots.length > 0)
  React.useEffect(() => {
    if (!hasPot) router.navigate({ to: "/pot-start" })
  }, [hasPot, router])

  const decorating = useDecorateStore((s) => s.region !== null)
  const [detailRegion, setDetailRegion] = React.useState<string | null>(null)

  const queryClient = useQueryClient()
  const seedUtPots = usePotStore((s) => s.seedUtPots)

  // 상단 공유 버튼 — 1차 UT용 데이터(여행팟+사진) 시드 트리거로 임시 사용
  const loadUtData = async () => {
    const ok = await openConfirm({
      title: "🥔 UT용 데이터를 불러올까요?",
      description: "미리 준비된 여행팟과 사진이 세팅돼요.",
    })
    if (!ok) return
    seedUtPhotos()
    seedUtPots()
    await queryClient.invalidateQueries({ queryKey: photoKeys.list() })
    // 하단 지역 카드 캐러셀(≈246px) 위로 띄워 겹치지 않게
    showToast({
      message: "UT용 데이터를 불러왔어요",
      icon: "check",
      className: "bottom-[256px]",
    })
  }

  if (!hasPot) return null

  return (
    <MobileLayout className="flex h-dvh flex-col">
      <main className="relative flex-1">
        <TravelMapGoogle
          className="absolute inset-0"
          onRegionDetailChange={setDetailRegion}
        />

        {!decorating && detailRegion === null ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 pt-[env(safe-area-inset-top)]">
            {/* 헤더 박스 자체는 클릭 통과(AppHeader 기본 pointer-events-none) —
                빈 영역이 클릭을 먹으면 헤더 아래 사진 핀이 반응하지 못한다 */}
            <AppHeader
              potSelector={<PotSelector />}
              onRecapClick={() => void loadUtData()}
              onProfileClick={() => openMyPageModal()}
            />
          </div>
        ) : null}
      </main>
    </MobileLayout>
  )
}

export function MapGooglePage() {
  return (
    <RequireAuth>
      <MapGooglePageContent />
    </RequireAuth>
  )
}
