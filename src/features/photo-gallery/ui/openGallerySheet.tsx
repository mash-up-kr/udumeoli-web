import { MapPin, PencilLine, Plus } from "lucide-react"

import { DateSection } from "./DateSection"
import type { GallerySlot } from "./DateSection"
import type { Photo } from "@/entities/photo"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { DialogTitle } from "@/shared/ui/dialog"
import { openBottomSheet } from "@/shared/ui/bottom-sheet"
import {
  REGION_CENTERS,
  useAllPhotos,
  usePhotoUploadStore,
} from "@/entities/photo"
import { usePotStore } from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { openDatePickerSheet, pickImageFile } from "@/features/photo-upload"

function GallerySheet({ region }: { region: string }) {
  const photos = useAllPhotos().filter((p) => p.region === region)
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)
  const partyMembers = usePotStore(
    (s) => s.pots.find((p) => p.id === s.currentPotId)?.members ?? []
  )
  const currentUserId = useSessionStore((s) => s.currentUser?.id ?? null)

  const byDate = new Map<string, Array<Photo>>()
  for (const p of photos) {
    byDate.set(p.date, [...(byDate.get(p.date) ?? []), p])
  }
  const dates = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1))

  const toSlots = (date: string): Array<GallerySlot> => {
    const group = byDate.get(date) ?? []
    return partyMembers.map((member) => {
      // 같은 유저·같은 날짜에 여러 장이면 마지막 등록분 노출
      const photo = group.filter((p) => p.uploaderId === member.id).at(-1)
      return {
        memberId: member.id,
        nickname: member.nickname,
        profileImageUrl: member.profileImageUrl,
        photoUrl: photo ? photo.thumbnailUrl : null,
        isMe: member.id === currentUserId,
      }
    })
  }

  const registerPhoto = (date: string, url: string) => {
    if (!currentUserId) return
    const center = REGION_CENTERS[region] ?? { lat: 36.2, lng: 127.8 }
    addPhoto({
      id: `up-${region}-${date}-${Date.now()}`,
      region,
      date,
      lat: center.lat,
      lng: center.lng,
      thumbnailUrl: url,
      uploaderId: currentUserId,
    })
  }

  // 날짜 행의 add 슬롯: 날짜 고정, 이미지 선택만
  const uploadForDate = (date: string) => {
    pickImageFile((url) => registerPhoto(date, url))
  }

  // 헤더 추가: 이미지 선택 → 날짜 선택
  const uploadWithDatePicker = () => {
    pickImageFile((url) => {
      openDatePickerSheet((date) => registerPhoto(date, url))
    })
  }

  return (
    <div className="flex max-h-[80vh] flex-col gap-8 pt-1">
      {/* Header — 수정 · 지역명 · 추가 (스크롤과 무관하게 고정) */}
      <div className="flex w-full shrink-0 items-center justify-between gap-4 px-1">
        {/* TODO: 수정 동작 정책 확정 후 연결 (현재 UI만) */}
        <ButtonIcon variant="label" aria-label="수정">
          <PencilLine />
          수정
        </ButtonIcon>
        <DialogTitle className="inline-flex items-center gap-2 rounded-full bg-bg-neutral-inverse px-5 py-2">
          <MapPin className="size-6 text-fg-neutral-inverse" />
          <span className="text-h3 text-fg-neutral-inverse">{region}</span>
        </DialogTitle>
        <ButtonIcon
          variant="label"
          aria-label="사진 추가"
          onClick={uploadWithDatePicker}
        >
          <Plus />
          추가
        </ButtonIcon>
      </div>

      <div className="flex flex-col items-center gap-8 overflow-y-auto pb-4">
        {dates.length === 0 || partyMembers.length === 0 ? (
          <p className="py-8 text-center text-b6 text-fg-neutral-subtle">
            아직 사진이 없어요. + 추가로 등록해 보세요.
          </p>
        ) : (
          dates.map((date) => (
            <DateSection
              key={date}
              dateISO={date}
              slots={toSlots(date)}
              onAddPhoto={() => uploadForDate(date)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function openGallerySheet(region: string) {
  openBottomSheet(() => <GallerySheet region={region} />, {
    showCloseButton: false,
  })
}
