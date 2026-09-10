import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { RegionAlbumCard, RegionAlbumCardSkeleton } from "./RegionAlbumCard"
import type { Photo } from "@/entities/photo"
import { AppHeader } from "@/widgets/app-header"
import { BottomNav } from "@/widgets/bottom-nav"
import { PotSelector } from "@/widgets/pot-dropdown"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { RequireAuth } from "@/features/auth"
import { useAllPhotos, usePhotos } from "@/entities/photo"
import { selectCurrentPotMembers, usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { formatRegionName } from "@/entities/region"

function TravelAlbumPageContent() {
  const router = useRouter()
  const currentPotId = usePotStore((s) => s.currentPotId)
  // 자리 순서는 팟 가입 순 — 스토어가 그 순서로 내려준다
  const members = usePotStore(selectCurrentPotMembers)
  // 앨범 목 시드는 fetchPhotos(목)에서 병합 — 지도와 동일한 목록을 본다
  const photos = useAllPhotos(currentPotId)
  // 같은 쿼리 키라 요청은 중복되지 않는다 — 첫 로딩 스켈레톤 판단용
  const { isPending: isPhotosPending } = usePhotos(currentPotId)
  const myId = useSessionStore((s) => s.currentUser?.id ?? null)

  // 지역별 카드 데이터 — 멤버 자리(가입 순 고정)·미기록 Alert (시안 3065-14470).
  // 자리는 팟 멤버 수만큼 항상 만들고, 안 올린 멤버 자리는 thumbnailUrl이 null이다.
  const regions = React.useMemo(() => {
    const byRegion = new Map<string, Array<Photo>>()
    for (const p of photos) {
      byRegion.set(p.region, [...(byRegion.get(p.region) ?? []), p])
    }
    return [...byRegion.entries()]
      .map(([region, list]) => {
        const latestByMember = new Map<string, Photo>()
        for (const photo of list) {
          const previous = latestByMember.get(photo.uploaderId)
          if (!previous || previous.date <= photo.date) {
            latestByMember.set(photo.uploaderId, photo)
          }
        }
        return {
          region,
          slots: members.map((member) => ({
            memberId: member.id,
            thumbnailUrl: latestByMember.get(member.id)?.thumbnailUrl ?? null,
          })),
          showAlert: myId !== null && !latestByMember.has(myId),
          // 핀에 기간이 없어져 등록일이 유일한 시간축이다 — 최근 등록 지역이 위로
          latestDate: list.reduce(
            (latest, photo) => (photo.date > latest ? photo.date : latest),
            ""
          ),
        }
      })
      .sort((a, b) => (a.latestDate < b.latestDate ? 1 : -1))
  }, [photos, members, myId])

  return (
    <MobileLayout className="flex min-h-[var(--app-vh)] flex-col bg-bg-neutral-subtle">
      <div className="pt-[env(safe-area-inset-top)]">
        <AppHeader potSelector={<PotSelector />} />
      </div>

      {/* 지역 카드 리스트 — 하단 내비(지구본 포함)와 겹치지 않게 바닥 여백 확보 */}
      <main className="mt-2 flex flex-1 flex-col gap-3 px-4 pb-[190px]">
        {/* 첫 로딩(캐시·세션 업로드도 없을 때)만 스켈레톤 — 데이터가 있으면 바로 카드 */}
        {isPhotosPending && regions.length === 0
          ? [0, 1, 2].map((i) => <RegionAlbumCardSkeleton key={i} />)
          : null}
        {regions.map((r) => (
          <RegionAlbumCard
            key={r.region}
            name={formatRegionName(r.region)}
            slots={r.slots}
            showAlert={r.showAlert}
            onClick={() =>
              router.navigate({
                to: "/travel-album/$region",
                params: { region: r.region },
              })
            }
          />
        ))}
      </main>

      {/* 하단 내비 — 지도 화면과 동일하게 바닥에서 34px(홈 인디케이터 영역) 띄움 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),34px)] z-10">
        <BottomNav
          className="pointer-events-auto"
          active="album"
          onGlobeClick={() => router.navigate({ to: "/map-google" })}
          onMyPageClick={() => router.navigate({ to: "/my-page" })}
        />
      </div>
    </MobileLayout>
  )
}

export function TravelAlbumPage() {
  return (
    <RequireAuth>
      <TravelAlbumPageContent />
    </RequireAuth>
  )
}
