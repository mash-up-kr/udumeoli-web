import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { RecordTile, RecordTileSkeleton } from "./RecordTile"
import type { RecordMember } from "./RecordTile"
import type { Photo } from "@/entities/photo"
import type { PhotoViewerUploader } from "@/features/photo-gallery"
import { cn } from "@/shared/lib/utils"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { DEFAULT_PROFILE_SRC } from "@/shared/ui/profile"
import { showToast } from "@/shared/ui/toast"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"
import { RequireAuth } from "@/features/auth"
import { openPhotoViewer } from "@/features/photo-gallery"
import { pickImageFile } from "@/features/photo-upload"
import {
  findKeyword,
  groupTrips,
  uploadErrorMessage,
  useCreatePhoto,
  useDeletePhoto,
  usePhotos,
  useRegionAlbumPhotos,
  useUpdatePhotoComment,
} from "@/entities/photo"
import { selectCurrentPotMembers, usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { formatRegionName } from "@/entities/region"

/** 그리드 카드 1개 — 사진 1장(기록 O) 또는 멤버 placeholder(기록 X, photo null) */
interface RecordCard {
  key: string
  member: RecordMember
  photo: Photo | null
}

function TravelAlbumRegionContent({ region }: { region: string }) {
  const router = useRouter()
  const currentPotId = usePotStore((s) => s.currentPotId)
  const members = usePotStore(selectCurrentPotMembers)
  const createPhotoMutation = useCreatePhoto()
  const currentUser = useSessionStore((s) => s.currentUser)
  const myId = currentUser?.id ?? null

  const regionPhotos = useRegionAlbumPhotos(currentPotId, region)
  const deletePhotoMutation = useDeletePhoto()
  const updateCommentMutation = useUpdatePhotoComment()
  // 같은 쿼리 키라 요청은 중복되지 않는다 — 첫 로딩 스켈레톤 판단용
  const { isPending: isPhotosPending } = usePhotos(currentPotId)
  // 내 사진 업로드 진행 중 — 내 빈 타일이 스켈레톤으로 전환
  const [uploading, setUploading] = React.useState(false)

  // 멤버 정렬 — 나(본인) 최상단 고정, 이후 팟원은 가입 순서대로 (정책 2·4, 마이페이지와 동일)
  const orderedMembers = React.useMemo<Array<RecordMember>>(
    () =>
      [
        ...members.filter((m) => m.id === myId),
        ...members.filter((m) => m.id !== myId),
      ].map((member) => {
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
        }
      }),
    [members, myId, currentUser]
  )

  // 기록 카드 — 멤버 순서대로 그 멤버의 사진(최신순) 1장당 카드 1개, 미기록이면 placeholder 1개 (정책 4)
  const cards = React.useMemo(
    () =>
      orderedMembers.flatMap<RecordCard>((member) => {
        const photos = regionPhotos
          .filter((p) => p.uploaderId === member.memberId)
          .sort((a, b) => (a.date < b.date ? 1 : -1))
        if (photos.length === 0) {
          return [{ key: member.memberId, member, photo: null }]
        }
        return photos.map((photo) => ({ key: photo.id, member, photo }))
      }),
    [orderedMembers, regionPhotos]
  )
  const uploadedIds = new Set(regionPhotos.map((p) => p.uploaderId))

  // 키워드 칩 — 지역 사진의 키워드를 종류별 집계, 많은 순 (정책 3). 사진 0장이면 칩 영역 미노출
  const keywordCounts = new Map<string, number>()
  for (const photo of regionPhotos) {
    if (photo.keyword) {
      keywordCounts.set(
        photo.keyword,
        (keywordCounts.get(photo.keyword) ?? 0) + 1
      )
    }
  }
  const keywords = [...keywordCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => findKeyword(id as NonNullable<Photo["keyword"]>))
    .filter((keyword): keyword is NonNullable<typeof keyword> =>
      Boolean(keyword)
    )

  // 내 사진 올리기 — 이 지역의 최신 방문에 합류하는 업로드(이미지 선택 → 등록), 지도 시트와 동일 (정책 4-1)
  const recordTrip = () => {
    const trip = groupTrips(regionPhotos).at(0)
    if (!trip || !myId || createPhotoMutation.isPending) return
    pickImageFile(async (url, file) => {
      // 팟원이 먼저 기록한 방문에 합류하는 업로드 — 그 방문의 키워드를 따라간다
      const keyword = trip.photos.find((p) => p.keyword)?.keyword
      const tripId = trip.photos.find((p) => p.tripId)?.tripId
      setUploading(true)
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
      } catch (error) {
        showToast({ message: uploadErrorMessage(error), icon: "alert" })
      } finally {
        setUploading(false)
      }
    })
  }

  // 사진 업로더 표시 정보 — 내 사진은 세션 닉네임·프로필, 멤버 탈퇴 등으로 못 찾으면 뱃지 숨김
  const uploaderOf = (photo: Photo): PhotoViewerUploader | undefined => {
    const member = orderedMembers.find((m) => m.memberId === photo.uploaderId)
    if (!member) return undefined
    return {
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
      isMe: member.isMe,
    }
  }

  // 사진 클릭 — 이미지 상세 보기 (동일 지역 사진끼리 날짜순으로 좌우 스와이프)
  const viewPhoto = (photo: Photo) => {
    const ordered = [...regionPhotos].sort((a, b) => (a.date < b.date ? -1 : 1))
    openPhotoViewer({
      photos: ordered.map((p) => {
        const uploader = uploaderOf(p)
        const keywordIconSrc = findKeyword(p.keyword)?.emojiSrc
        return {
          id: p.id,
          imageUrl: p.thumbnailUrl,
          ...(p.comment != null ? { comment: p.comment } : {}),
          ...(keywordIconSrc ? { keywordIconSrc } : {}),
          ...(uploader ? { uploader } : {}),
        }
      }),
      initialId: photo.id,
      onEditComment: async (target, comment) => {
        const targetPhoto = regionPhotos.find((p) => p.id === target.id)
        if (targetPhoto)
          await updateCommentMutation.mutateAsync({
            photo: targetPhoto,
            comment,
          })
      },
      onDelete: async (target) => {
        const targetPhoto = regionPhotos.find((p) => p.id === target.id)
        if (targetPhoto) await deletePhotoMutation.mutateAsync(targetPhoto)
      },
    })
  }

  // 1인팟은 1열 블록 카드, 2인 이상은 2열 그리드 (정책 4 · case 01/02)
  const single = orderedMembers.length === 1
  const tileClassName = single ? "aspect-[3/5]" : undefined

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
        {/* 멤버 프로필 나열 + "n/N명 기록 완료" — n은 이 지역에 올린 멤버 수, N은 팟 전체 (정책 2).
            올린 멤버는 실선, 안 올린 멤버는 점선 프로필 */}
        <div className="flex items-center justify-center gap-1.5 pb-4">
          <div className="flex -space-x-1">
            {orderedMembers.map((member) => (
              <img
                key={member.memberId}
                src={member.profileImageUrl ?? DEFAULT_PROFILE_SRC}
                alt=""
                className={cn(
                  "size-6 rounded-full border bg-bg-neutral-weak object-cover",
                  uploadedIds.has(member.memberId)
                    ? "border-solid border-stroke-neutral-weak"
                    : "border-dashed border-stroke-neutral-subtle"
                )}
              />
            ))}
          </div>
          <p className="text-b7 text-fg-neutral-subtle">
            <span className="text-h9 text-fg-neutral-bold">
              {uploadedIds.size}
            </span>
            /{orderedMembers.length}명 기록 완료
          </p>
        </div>
      </div>

      {keywords.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {keywords.map((keyword) => (
            <span
              key={keyword.id}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-b7"
              // 키워드 대표색 10% 배경 + 대표색 글자 — 지도 시트 칩과 동일
              style={{
                backgroundColor: `${keyword.mapColor}1a`,
                color: keyword.mapColor,
              }}
            >
              <img
                src={keyword.emojiSrc}
                alt=""
                className="size-5 object-contain"
              />
              {keyword.label} {keywordCounts.get(keyword.id)}
            </span>
          ))}
        </div>
      ) : null}

      <main
        className={cn(
          "grid gap-2.5 px-4",
          single ? "grid-cols-1" : "grid-cols-2"
        )}
      >
        {/* 첫 로딩(캐시·세션 업로드도 없을 때)만 스켈레톤 — 데이터가 있으면 바로 카드 */}
        {isPhotosPending && regionPhotos.length === 0 ? (
          <>
            <RecordTileSkeleton className={tileClassName} />
            {single ? null : <RecordTileSkeleton />}
          </>
        ) : (
          cards.map((card) => (
            <RecordTile
              key={card.key}
              member={card.member}
              photo={card.photo}
              uploading={uploading}
              onRecord={recordTrip}
              onPhotoClick={viewPhoto}
              className={tileClassName}
            />
          ))
        )}
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
