import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { AppHeader } from "@/widgets/app-header"
import { BottomNav } from "@/widgets/bottom-nav"
import { PotSelector } from "@/widgets/pot-dropdown"
import { TravelMapGoogle } from "@/widgets/travel-map-google"
import { AppSplash } from "@/shared/ui/app-splash"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { USE_MOCK } from "@/shared/api/client"
import { RequireAuth } from "@/features/auth"
import { RecapButton } from "@/features/recap"
import { useRecordStore } from "@/features/travel-record"
import { photoKeys, seedUtPhotos } from "@/entities/photo"
import {
  TRIP_100_POT,
  useMyPots,
  usePotStore,
  usePotsHydrated,
} from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"

function MapGooglePageContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search)
  const isUtPreview = searchParams?.get("ut") === "1"
  const isTrip100Demo = USE_MOCK && searchParams?.get("demo") === "100"
  const isSeededPreview = isUtPreview || isTrip100Demo
  // pots가 localStorage에서 복원되기 전엔 항상 빈 배열이라, 복원 전 순간을 "팟 없음"으로
  // 오판해 기존 팟 보유 유저까지 잘못 리다이렉트하지 않도록 복원 완료를 기다린다
  const hydrated = usePotsHydrated()
  // 참여 중인 팟이 하나도 없으면(신규 유저) 지도 대신 여행팟 시작 온보딩으로 보낸다.
  // replace로 이동 — push하면 히스토리에 /map-google이 남아, pot-start에서 뒤로가기 시
  // 다시 이 페이지로 왔다가 팟이 여전히 없어 즉시 pot-start로 튕기는 무한 루프가 생긴다
  const seedUtPots = usePotStore((s) => s.seedUtPots)
  const seededUtPreviewRef = React.useRef(false)
  const confirmJoin = usePotStore((s) => s.confirmJoin)
  const seededTrip100DemoRef = React.useRef(false)
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)
  // 시드 프리뷰는 시드된 store만 본다 — 서버 목록을 덮어써 미리보기가 사라지면 안 된다
  const { hasPot, isPending } = useMyPots(currentUserId, {
    enabled: hydrated && !isSeededPreview,
  })
  const ready = hydrated && !isPending

  React.useEffect(() => {
    if (!hydrated || !isUtPreview || seededUtPreviewRef.current) return
    seededUtPreviewRef.current = true
    seedUtPots()
    seedUtPhotos()
    void queryClient.invalidateQueries({ queryKey: photoKeys.all })
  }, [hydrated, isUtPreview, queryClient, seedUtPots])

  React.useEffect(() => {
    if (!hydrated || !isTrip100Demo || seededTrip100DemoRef.current) return
    seededTrip100DemoRef.current = true
    confirmJoin(TRIP_100_POT)
    void queryClient.invalidateQueries({ queryKey: photoKeys.all })
  }, [confirmJoin, hydrated, isTrip100Demo, queryClient])

  React.useEffect(() => {
    if (ready && !hasPot && !isSeededPreview)
      router.navigate({ to: "/pot-start", replace: true })
  }, [hasPot, isSeededPreview, ready, router])

  const decorating = useRecordStore((s) => s.region !== null)
  const [detailRegion, setDetailRegion] = React.useState<string | null>(null)
  const [canOpenAlbum, setCanOpenAlbum] = React.useState(false)

  const openAlbum = () => router.navigate({ to: "/travel-album" })

  // 팟 판정 전(persist 복원 + myParties 응답)과 pot-start 리다이렉트 대기 구간 —
  // 빈 화면 대신 스플래시로 채운다
  if (!ready || !hasPot) return <AppSplash />

  return (
    <MobileLayout className="flex h-dvh flex-col">
      <main className="relative flex-1">
        <TravelMapGoogle
          className="absolute inset-0"
          onAlbumAvailabilityChange={setCanOpenAlbum}
          onRegionDetailChange={setDetailRegion}
        />

        {!decorating && detailRegion === null ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 pt-[env(safe-area-inset-top)]">
              {/* 헤더 박스 자체는 클릭 통과(AppHeader 기본 pointer-events-none) —
                  빈 영역이 클릭을 먹으면 헤더 아래 사진 핀이 반응하지 못한다 */}
              <AppHeader potSelector={<PotSelector />} />
              {/* RECAP 버튼 — 시안 1745-38063 로고 아래 좌측 */}
              <div className="px-4">
                <RecapButton className="pointer-events-auto" />
              </div>
            </div>

            {/* 하단 내비 — 시안(1745-38063) 기준 바닥에서 33px(홈 인디케이터 영역) 띄움 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[max(env(safe-area-inset-bottom),33px)] z-10">
              <BottomNav
                className="pointer-events-auto"
                albumDisabled={!canOpenAlbum}
                onAlbumClick={openAlbum}
                onMyPageClick={() => router.navigate({ to: "/my-page" })}
              />
            </div>
          </>
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
