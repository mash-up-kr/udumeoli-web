import * as React from "react"

import type { TravelKeyword } from "@/entities/photo"
import iconAddSrc from "@/shared/assets/icon-add.svg"
import { Input } from "@/shared/ui/input"

/**
 * 대표 사진·코멘트 스텝 (Figma 3065-15411).
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
    <div className="travel-record-photo-group mx-auto flex w-fit max-w-full flex-col gap-2">
      {/* 피그마 비율(343x377)을 유지하고, 낮은 화면에서는 높이를 줄여 너비를 함께 축소한다. */}
      <div className="travel-record-photo-frame relative aspect-[343/377] w-full max-w-[343px] shrink-0">
        <button
          type="button"
          onClick={onPickPhoto}
          className="size-full overflow-hidden rounded-[40px] border border-white bg-bg-neutral-solid"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="size-full object-cover" />
          ) : (
            // 시안 3241-69080 Add Button — 앨범 빈 타일(RecordTile)과 같은 28 원형 + H8-1 라벨
            <span className="flex size-full flex-col items-center justify-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full border-[2.5px] border-stroke-neutral-bold bg-white/70">
                <img src={iconAddSrc} alt="" className="size-5" />
              </span>
              <span className="text-h8-1 text-fg-neutral-bold">
                사진 추가하기
              </span>
            </span>
          )}
        </button>

        {/* 키워드 스티커 — 사진 좌상단에 살짝 기울여 걸친다.
            시안(3065-15422)이 보고하는 x/y는 회전 노드라 바운딩 박스 윗변이 아니다.
            시안 PNG에서 알약 아랫변(프레임 #eff1f5 위라 경계가 선명)을 직선 피팅해
            역산한 미회전 위치 — 중심이 프레임 윗변보다 1.5 위, 회전각 -6도 */}
        {keyword ? (
          <span className="pointer-events-none absolute top-[-26.5px] left-[7.6px] flex -rotate-6 items-center gap-2.5 rounded-[50px] bg-white/70 px-3.5 py-2">
            <img
              src={keyword.emojiSrc}
              alt=""
              className="size-10 shrink-0 object-contain"
            />
            {/* 이 시안(3065-15424)만 fill이 토큰이 아닌 raw #000이다 */}
            <span className="text-h3 text-black">{keyword.label}</span>
          </span>
        ) : null}
      </div>

      <Input
        className="travel-record-photo-input w-full"
        value={comment}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onCommentChange(e.target.value)
        }
        placeholder="사진 한 줄 설명을 적고 친구와 공유해요"
        maxLength={40}
      />
    </div>
  )
}
