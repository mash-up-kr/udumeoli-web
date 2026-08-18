import * as React from "react"
import { Plus } from "lucide-react"

import type { TravelKeyword } from "@/entities/photo"
import { Input } from "@/shared/ui/input"

/**
 * 대표 사진·코멘트 스텝 (Figma 1836-15617).
 * 사진 영역 좌상단에 선택한 키워드 스티커가 겹쳐 붙는다.
 */
export function PhotoStep({
  keyword,
  photoUrl,
  onPickPhoto,
  comment,
  onCommentChange,
}: {
  keyword: TravelKeyword | null
  photoUrl: string | null
  onPickPhoto: () => void
  comment: string
  onCommentChange: (value: string) => void
}) {
  return (
    <>
      {/* 사진 영역 — 남는 세로 공간을 모두 차지 (낮은 화면에서도 코멘트·CTA 자리 확보) */}
      <div className="relative min-h-0 w-full flex-1">
        <button
          type="button"
          onClick={onPickPhoto}
          className="size-full overflow-hidden rounded-[32px] bg-bg-neutral-solid/80"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-1 text-fg-neutral-subtle">
              <Plus className="size-6" />
              <span className="text-b6">사진 추가하기</span>
            </span>
          )}
        </button>

        {/* 키워드 스티커 — 사진 좌상단에 걸쳐 배치 */}
        {keyword ? (
          <span className="pointer-events-none absolute -top-3 left-2 flex items-center gap-1 rounded-full bg-bg-neutral-weak px-3 py-1.5 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
            <img
              src={keyword.emojiSrc}
              alt=""
              className="size-8 shrink-0 object-contain"
            />
            <span className="text-h5 text-fg-neutral-bold">
              {keyword.label}
            </span>
          </span>
        ) : null}
      </div>

      <Input
        value={comment}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onCommentChange(e.target.value)
        }
        placeholder="사진 한 줄 설명을 적고 친구와 공유해요"
        maxLength={40}
      />
    </>
  )
}
