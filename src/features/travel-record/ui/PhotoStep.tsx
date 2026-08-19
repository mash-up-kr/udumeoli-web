import * as React from "react"

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
      {/* 피그마 비율(330x382)을 유지하되 좁은 화면에서는 가로폭에 맞춰 축소한다. */}
      <div className="travel-record-photo-frame relative mx-auto aspect-[330/382] w-full max-w-[330px] shrink-0">
        <button
          type="button"
          onClick={onPickPhoto}
          className="size-full overflow-hidden rounded-[40px] border border-white bg-bg-neutral-solid"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full flex-col items-center justify-center text-fg-neutral-subtle">
              <span className="text-h6">+</span>
              <span className="text-h9">사진 추가하기</span>
            </span>
          )}
        </button>

        {/* 키워드 스티커 — 사진 좌상단에 살짝 기울여 걸친다 (Figma 1836-15617) */}
        {keyword ? (
          <span className="pointer-events-none absolute -top-7 -left-1 flex -rotate-6 items-center gap-2.5 rounded-[50px] bg-white/70 px-3.5 py-2">
            <img
              src={keyword.emojiSrc}
              alt=""
              className="size-10 shrink-0 object-contain"
            />
            <span className="text-h3 text-fg-neutral-bold">
              {keyword.label}
            </span>
          </span>
        ) : null}
      </div>

      <Input
        className="travel-record-photo-input mx-auto max-w-[330px]"
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
