import { MapPin, Plus } from "lucide-react"

import type { Photo } from "@/entities/photo"
import { ImageContainer } from "@/shared/ui/image-container"
import { DialogTitle } from "@/shared/ui/dialog"
import { openBottomSheet } from "@/shared/ui/bottom-sheet"
import { REGION_CENTERS, useAllPhotos, usePhotoUploadStore } from "@/entities/photo"
import { openDatePickerSheet, pickImageFile } from "@/features/photo-upload"

function formatKoreanDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}

function GallerySheet({ region }: { region: string }) {
  const photos = useAllPhotos().filter((p) => p.region === region)
  const addPhoto = usePhotoUploadStore((s) => s.addPhoto)

  // 날짜별 그룹 (최신순)
  const byDate = new Map<string, Array<Photo>>()
  for (const p of photos) {
    byDate.set(p.date, [...(byDate.get(p.date) ?? []), p])
  }
  const dates = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1))

  const addForDate = (date: string) => {
    pickImageFile((url) => {
      const center = REGION_CENTERS[region] ?? { lat: 36.2, lng: 127.8 }
      addPhoto({
        id: `up-${region}-${date}-${url}`,
        region,
        date,
        lat: center.lat + (Math.random() - 0.5) * 0.1,
        lng: center.lng + (Math.random() - 0.5) * 0.1,
        thumbnailUrl: url,
        uploaderId: "me",
      })
    })
  }

  return (
    <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-1 text-h5">
          <MapPin className="size-5 text-[#F45B69]" /> {region}
        </DialogTitle>
        <button
          type="button"
          className="text-b5 text-primary"
          onClick={() => openDatePickerSheet(addForDate)}
        >
          + 추가
        </button>
      </div>

      {dates.length === 0 ? (
        <p className="py-8 text-center text-b6 text-muted-foreground">
          아직 사진이 없어요. + 추가로 등록해 보세요.
        </p>
      ) : (
        dates.map((date) => (
          <div key={date} className="flex flex-col gap-2">
            <p className="text-b6 text-muted-foreground">{formatKoreanDate(date)}</p>
            <div className="grid grid-cols-4 gap-2">
              {(byDate.get(date) ?? []).map((p) => (
                <ImageContainer key={p.id} src={p.thumbnailUrl} aspectRatio="square" />
              ))}
              <button
                type="button"
                onClick={() => addForDate(date)}
                className="flex aspect-square items-center justify-center rounded-[8px] border border-dashed text-muted-foreground"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export function openGallerySheet(region: string) {
  openBottomSheet(() => <GallerySheet region={region} />)
}
