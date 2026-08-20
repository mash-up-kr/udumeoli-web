import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { TripAccordionCard } from "./TripAccordionCard"
import type { MemberRecord } from "./TripAccordionCard"
import type { Photo, Trip } from "@/entities/photo"
import type { PhotoViewerUploader } from "@/features/photo-gallery"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { showToast } from "@/shared/ui/toast"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"
import { RequireAuth } from "@/features/auth"
import { openPhotoViewer } from "@/features/photo-gallery"
import { pickImageFile } from "@/features/photo-upload"
import {
  findKeyword,
  formatTripRange,
  groupTrips,
  useCreatePhoto,
  useDeletePhoto,
  useRegionAlbumPhotos,
} from "@/entities/photo"
import { selectCurrentPotMembers, usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { formatRegionName } from "@/entities/region"

function TravelAlbumRegionContent({ region }: { region: string }) {
  const router = useRouter()
  const currentPotId = usePotStore((s) => s.currentPotId)
  const potName = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.name ?? ""
  )
  const members = usePotStore(selectCurrentPotMembers)
  const createPhotoMutation = useCreatePhoto()
  const currentUser = useSessionStore((s) => s.currentUser)
  const myId = currentUser?.id ?? null

  const regionPhotos = useRegionAlbumPhotos(currentPotId, region)
  const trips = React.useMemo(() => groupTrips(regionPhotos), [regionPhotos])
  const deletePhotoMutation = useDeletePhoto()

  // 멤버 행 정렬 — 나(본인) 최상단 고정, 이후 팟원은 가입 순서대로
  const orderedMembers = React.useMemo(
    () => [
      ...members.filter((m) => m.id === myId),
      ...members.filter((m) => m.id !== myId),
    ],
    [members, myId]
  )

  const toRecords = (trip: Trip): Array<MemberRecord> =>
    orderedMembers.map((member) => {
      const isMe = member.id === myId
      return {
        memberId: member.id,
        // 내 행은 목 멤버 정보 대신 세션 닉네임·프로필 노출 (갤러리와 동일 규칙)
        nickname: isMe
          ? (currentUser?.nickname ?? member.nickname)
          : member.nickname,
        profileImageUrl: isMe
          ? (currentUser?.profileImageUrl ?? member.profileImageUrl)
          : member.profileImageUrl,
        isMe,
        // 같은 방문 기간에 여러 장이면 마지막 등록분 노출
        photo:
          trip.photos.filter((p) => p.uploaderId === member.id).at(-1) ?? null,
      }
    })

  // '기록하기' — 해당 방문 기간의 업로드 플로우(이미지 선택 → 등록) 진입
  const recordTrip = (trip: Trip) => {
    if (!myId) return
    pickImageFile(async (url, file) => {
      // 팟원이 먼저 기록한 방문에 합류하는 업로드 — 그 방문의 키워드를 따라간다
      const keyword = trip.photos.find((p) => p.keyword)?.keyword
      const tripId = trip.photos.find((p) => p.tripId)?.tripId
      try {
        await createPhotoMutation.mutateAsync({
          potId: currentPotId,
          region,
          date: trip.startDate,
          ...(tripId ? { tripId } : {}),
          ...(keyword ? { keyword } : {}),
          uploaderId: myId,
          file,
          previewUrl: url,
        })
        showToast({ message: "업로드가 완료됐어요", icon: "check" })
      } catch {
        showToast({
          message: "업로드에 실패했어요. 다시 시도해 주세요.",
          icon: "alert",
        })
      }
    })
  }

  // 사진 업로더 표시 정보 — 내 사진은 세션 닉네임·프로필, 멤버 탈퇴 등으로 못 찾으면 뱃지 숨김
  const uploaderOf = (photo: Photo): PhotoViewerUploader | undefined => {
    const isMe = photo.uploaderId === myId
    const member = members.find((m) => m.id === photo.uploaderId)
    if (isMe) {
      return {
        nickname: currentUser?.nickname ?? member?.nickname ?? "",
        profileImageUrl:
          currentUser?.profileImageUrl ?? member?.profileImageUrl ?? null,
        isMe: true,
      }
    }
    if (!member) return undefined
    return {
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
      isMe: false,
    }
  }

  // 사진 클릭 — 이미지 상세 보기 (동일 지역 사진끼리 날짜순으로 좌우 스와이프)
  const viewPhoto = (photo: Photo) => {
    const ordered = [...regionPhotos].sort((a, b) => (a.date < b.date ? -1 : 1))
    openPhotoViewer({
      photos: ordered.map((p) => {
        const uploader = uploaderOf(p)
        return {
          id: p.id,
          imageUrl: p.thumbnailUrl,
          ...(p.comment != null ? { comment: p.comment } : {}),
          ...(uploader ? { uploader } : {}),
        }
      }),
      initialId: photo.id,
      onDelete: async (target) => {
        const targetPhoto = regionPhotos.find((p) => p.id === target.id)
        if (targetPhoto) await deletePhotoMutation.mutateAsync(targetPhoto)
      },
    })
  }

  return (
    <MobileLayout className="bg-bg-neutral-subtle pb-8">
      <div className="pt-[env(safe-area-inset-top)]">
        <header className="relative flex h-[76px] items-center px-4">
          <ButtonIcon
            aria-label="뒤로 가기"
            onClick={() => router.history.back()}
            className="relative z-10"
          >
            <img src={iconArrowLeftSrc} alt="" className="size-6" />
          </ButtonIcon>
          <h1 className="pointer-events-none absolute inset-x-0 text-center text-h4 text-fg-neutral-bold [text-shadow:0_0_32px_white]">
            {formatRegionName(region)}
          </h1>
        </header>
      </div>

      {/* 방문(여행) 리스트 — 최신순, 첫 카드만 펼침이 디폴트 */}
      <main className="flex flex-col gap-3 px-4 pt-1">
        {trips.map((trip, i) => {
          // 헤더 타이틀·스티커 — 여행 키워드 기반 (시안 #Keywords Header, "디저트!투어").
          // 키워드 없는 레거시 여행은 팟 이름 + 기본 아이콘 폴백
          const keyword = findKeyword(
            trip.photos.find((p) => p.keyword)?.keyword
          )
          return (
            <TripAccordionCard
              // 서버 tripId가 있으면 그것이 방문 단위 — 같은 시작일의 별개 방문끼리 key 충돌 방지
              key={`${currentPotId}-${trip.tripId ?? trip.startDate}`}
              title={keyword ? `${keyword.label}!투어` : potName}
              {...(keyword ? { stickerSrc: keyword.emojiSrc } : {})}
              dateRange={formatTripRange(trip)}
              records={toRecords(trip)}
              defaultOpen={i === 0}
              onRecord={() => recordTrip(trip)}
              onPhotoClick={viewPhoto}
            />
          )
        })}
      </main>
    </MobileLayout>
  )
}

export function TravelAlbumRegionPage({ region }: { region: string }) {
  return (
    <RequireAuth>
      <TravelAlbumRegionContent region={region} />
    </RequireAuth>
  )
}
