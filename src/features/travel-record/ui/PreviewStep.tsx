import { formatRecordRange } from "../lib/format"

import type { TravelKeyword } from "@/entities/photo"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { Profile } from "@/shared/ui/profile"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"

// 배경 장식 스티커 — 시안(1836-15652) 좌표 근사: 좌측 세로 산개 3개 + 우상단 1개(회전)
const CONFETTI = [
  "top-[119px] left-[30px] size-[53px] rotate-6",
  "top-[172px] right-[19px] size-[62px] rotate-[79deg]",
  "top-[246px] left-[67px] size-[53px] -rotate-3",
  "top-[380px] left-[7px] size-[53px] rotate-3",
]

/**
 * 기록 최종 확인 (Figma 1836-15652) — 지도 위 blur 오버레이로 미리보기.
 * 정사각 대표 사진(흰 글로우)에 닉네임 칩이 걸치고, 코멘트는 말풍선으로 아래 분리.
 */
export function PreviewStep({
  keyword,
  startDate,
  endDate,
  photoUrl,
  comment,
  nickname,
  profileImageUrl,
  onBack,
  onConfirm,
}: {
  keyword: TravelKeyword
  startDate: string
  endDate?: string
  photoUrl: string
  comment: string
  nickname: string
  profileImageUrl: string | null
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex flex-col overflow-y-auto">
      {/* 지도가 비치는 프로스티드 글라스 — 키워드 색 미리보기(지역 폴리곤)가 아래 깔린다 */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px]" />

      {/* 장식 스티커 — 콘텐츠보다 아래, 배경보다 위 */}
      {CONFETTI.map((pos) => (
        <img
          key={pos}
          src={keyword.emojiSrc}
          alt=""
          aria-hidden
          className={`pointer-events-none absolute z-10 ${pos}`}
        />
      ))}

      <div className="relative z-20 flex h-[76px] shrink-0 items-center px-4 pt-[env(safe-area-inset-top)]">
        <ButtonIcon aria-label="뒤로 가기" onClick={onBack}>
          <img src={iconArrowLeftSrc} alt="" className="size-6" />
        </ButtonIcon>
      </div>

      {/* min-h-0 없이 flex-1 — 낮은 화면에서 내용이 넘치면 잘리는 대신 루트가 스크롤된다 */}
      <div className="relative z-20 flex flex-1 flex-col items-center px-4">
        {/* 날짜 칩 — 키워드 stroke색 배경 (Figma Chip · H9) */}
        <span
          className="rounded-full px-3 py-1 text-h9 text-fg-neutral-inverse drop-shadow-[0px_0px_10px_rgba(142,150,169,0.12)]"
          style={{ backgroundColor: keyword.stroke }}
        >
          {formatRecordRange(startDate, endDate)}
        </span>

        <h2 className="mt-2 text-center text-h3 text-fg-neutral-bold [text-shadow:0_0_32px_white]">
          우리의 여행은
          <br />
          <span className="underline" style={{ color: keyword.stroke }}>
            {keyword.label}!투어
          </span>
        </h2>

        {/* 정사각 대표 사진 — 흰 글로우, 닉네임 칩이 상단에 걸침 */}
        <div className="relative mt-8 w-full">
          <img
            src={photoUrl}
            alt=""
            className="aspect-square w-full rounded-[40px] object-cover shadow-[0px_0px_34px_0px_white]"
          />
          {/* 사진 우상단에 걸치는 대형 키워드 스티커 (시안 134px, -68°) — 진입 시 "빵!" 팝 (Figma #12) */}
          <div className="pointer-events-none absolute -top-8 -right-3 size-[134px] rotate-[-68deg]">
            <img
              src={keyword.emojiSrc}
              alt=""
              aria-hidden
              className="size-full animate-photo-pop"
            />
          </div>
          {/* 닉네임 칩 — 그래픽 스케일 24px 텍스트 (타이포 토큰에 없는 아트워크 크기라 값 고정) */}
          <span className="absolute -top-5 left-1/2 z-10 flex max-w-[70%] -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-2">
            <Profile
              size="sm"
              src={profileImageUrl ?? undefined}
              alt=""
              className="shrink-0"
            />
            <span className="truncate text-[24px] leading-[1.5] font-semibold tracking-[-0.48px] text-black">
              {nickname}
            </span>
          </span>
        </div>

        {/* 코멘트 말풍선 — 사진 아래 20px, 위쪽 화살표 (Figma Tooltip 흰 변형) */}
        {comment ? (
          <span className="relative mt-5 flex h-8 max-w-full items-center rounded-full bg-bg-neutral-weak px-4 drop-shadow-[0px_0px_10px_rgba(142,150,169,0.12)]">
            <svg
              aria-hidden
              viewBox="80 12 18 12"
              className="absolute -top-2 left-1/2 h-3 w-4.5 -translate-x-1/2"
            >
              <path
                d="M87.4883 13.7461C88.2858 12.8252 89.7142 12.8252 90.5117 13.7461L96.5264 20.6904C97.6481 21.9857 96.7281 23.9999 95.0146 24H82.9854C81.2719 23.9999 80.3519 21.9857 81.4736 20.6904L87.4883 13.7461Z"
                className="fill-bg-neutral-weak"
              />
            </svg>
            <span className="truncate text-b6 text-fg-neutral-bold">
              {comment}
            </span>
          </span>
        ) : null}
      </div>

      <div className="relative z-20 shrink-0 px-4 pt-6 pb-[max(env(safe-area-inset-bottom),34px)]">
        <ButtonCta onClick={onConfirm}>지도에 기록하기</ButtonCta>
      </div>
    </div>
  )
}
