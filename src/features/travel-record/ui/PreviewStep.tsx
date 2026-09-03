import { formatRecordRange } from "../lib/format"
import type { CSSProperties } from "react"

import type { TravelKeyword } from "@/entities/photo"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { Profile } from "@/shared/ui/profile"
import iconArrowLeftSrc from "@/shared/assets/icon-arrow-left.svg"

type PreviewMotionStyle = CSSProperties &
  Partial<Record<`--record-preview-${string}`, string>>

const DECORATIVE_STICKERS = [
  {
    id: "top-left",
    frameClassName: "top-[119px] left-[30px] size-[53px]",
    imageClassName: "size-full",
    rotate: "0deg",
    delay: "70ms",
    startX: "136px",
    startY: "168px",
  },
  {
    id: "title-right",
    frameClassName: "top-[172px] left-[294px] size-[62px]",
    imageClassName: "size-[53px]",
    rotate: "79deg",
    delay: "150ms",
    startX: "-116px",
    startY: "106px",
  },
  {
    id: "mid-left",
    frameClassName: "top-[246px] left-[67px] size-[53px]",
    imageClassName: "size-full",
    rotate: "0deg",
    delay: "115ms",
    startX: "102px",
    startY: "44px",
  },
  {
    id: "photo-left",
    frameClassName: "top-[380px] left-[7px] size-[53px]",
    imageClassName: "size-full",
    rotate: "0deg",
    delay: "210ms",
    startX: "158px",
    startY: "-74px",
  },
]

const FANFARE_PARTICLES = [
  {
    id: "p1",
    className: "size-[13px]",
    x: "-126px",
    y: "-174px",
    rotate: "-54deg",
    delay: "0ms",
  },
  {
    id: "p2",
    className: "size-[10px]",
    x: "112px",
    y: "-116px",
    rotate: "82deg",
    delay: "35ms",
  },
  {
    id: "p3",
    className: "size-[16px]",
    x: "-94px",
    y: "-28px",
    rotate: "-26deg",
    delay: "55ms",
  },
  {
    id: "p4",
    className: "size-[12px]",
    x: "144px",
    y: "36px",
    rotate: "116deg",
    delay: "75ms",
  },
]

function previewMotionStyle({
  rotate,
  delay,
  startX,
  startY,
  burstX,
  burstY,
}: {
  rotate?: string
  delay?: string
  startX?: string
  startY?: string
  burstX?: string
  burstY?: string
}): PreviewMotionStyle {
  return {
    ...(rotate ? { "--record-preview-rotate": rotate } : {}),
    ...(delay ? { "--record-preview-delay": delay } : {}),
    ...(startX ? { "--record-preview-start-x": startX } : {}),
    ...(startY ? { "--record-preview-start-y": startY } : {}),
    ...(burstX ? { "--record-preview-burst-x": burstX } : {}),
    ...(burstY ? { "--record-preview-burst-y": burstY } : {}),
  }
}

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
  pending = false,
  onBack,
  onConfirm,
}: {
  keyword: TravelKeyword | null
  startDate: string
  endDate?: string
  photoUrl: string
  comment: string
  nickname: string
  profileImageUrl: string | null
  /** 사진 등록 요청 진행 중 — CTA 비활성 + 라벨 전환 */
  pending?: boolean
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex flex-col overflow-hidden">
      {/* 지도가 비치는 프로스티드 글라스 — 키워드 색 미리보기(지역 폴리곤)가 아래 깔린다 */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[12px]" />

      {/* 장식 스티커 — 파티클과 같은 최상위 레이어(z-30). 콘텐츠(z-20) 아래 두면 사진에 가려진다 */}
      {keyword
        ? DECORATIVE_STICKERS.map((sticker) => (
            <span
              key={sticker.id}
              aria-hidden
              className={`pointer-events-none absolute z-30 flex animate-record-preview-sticker-pop items-center justify-center ${sticker.frameClassName}`}
              style={previewMotionStyle({
                rotate: sticker.rotate,
                delay: sticker.delay,
                startX: sticker.startX,
                startY: sticker.startY,
              })}
            >
              <img
                src={keyword.emojiSrc}
                alt=""
                className={`record-preview-sticker-img ${sticker.imageClassName}`}
              />
            </span>
          ))
        : null}

      {keyword
        ? FANFARE_PARTICLES.map((particle) => (
            <img
              key={particle.id}
              src={keyword.emojiSrc}
              alt=""
              aria-hidden
              className={`record-preview-sticker-img pointer-events-none absolute top-[310px] left-1/2 z-30 animate-record-preview-particle ${particle.className}`}
              style={previewMotionStyle({
                rotate: particle.rotate,
                delay: particle.delay,
                burstX: particle.x,
                burstY: particle.y,
              })}
            />
          ))
        : null}

      <div className="relative z-20 flex h-[76px] shrink-0 items-center px-4 pt-[env(safe-area-inset-top)]">
        <ButtonIcon aria-label="뒤로 가기" onClick={onBack}>
          <img src={iconArrowLeftSrc} alt="" className="size-6" />
        </ButtonIcon>
      </div>

      {/* min-h-0 + flex-1 — 사진이 남는 높이에 맞춰 줄어들어 어떤 화면 높이에서도 스크롤이 없다 */}
      <div className="relative z-20 flex min-h-0 flex-1 flex-col items-center px-4 pt-[clamp(48px,9dvh,76px)]">
        {/* 날짜 칩 — 키워드 대표색(mapColor) 배경 (Figma Chip · H9).
            stroke는 지역 폴리곤 외곽선 팔레트라 키워드 색과 다르다 (사진이 디저트 빨강으로 보이던 원인) */}
        <span
          className="rounded-full px-3 py-1 text-h9 text-fg-neutral-inverse drop-shadow-[0px_0px_10px_rgba(142,150,169,0.12)]"
          style={{ backgroundColor: keyword?.mapColor ?? "#232936" }}
        >
          {formatRecordRange(startDate, endDate)}
        </span>

        <h2 className="mt-2 text-center text-h3 whitespace-pre-line text-fg-neutral-bold [text-shadow:0_0_32px_white]">
          {keyword ? (
            <>
              우리의 여행은
              <br />
              <span className="underline" style={{ color: keyword.mapColor }}>
                {keyword.label}!투어
              </span>
            </>
          ) : (
            "우리의 여행 기록을\n지도에 남길게요"
          )}
        </h2>

        {/* 정사각 대표 사진 — 흰 글로우, 닉네임 칩이 상단에 걸침.
            낮은 화면에선 CTA가 스크롤 없이 보이도록 폭을 줄인다 (record-preview-photo-frame).
            칩·스티커가 사진을 따라가도록 래퍼 자체를 줄인다 */}
        <div className="record-preview-photo-frame relative mt-8">
          <img
            src={photoUrl}
            alt=""
            className="aspect-square w-full animate-record-preview-photo-in rounded-[40px] object-cover shadow-[0px_0px_34px_0px_white]"
          />
          {/* 사진 우상단에 걸치는 대형 키워드 스티커 (시안 134px, -68°) — 진입 시 "빵!" 팝 (Figma #12) */}
          {keyword ? (
            <div
              className="pointer-events-none absolute top-[5px] right-[clamp(-62px,-16vw,-48px)] z-30 flex size-[clamp(132px,46vw,174px)] animate-record-preview-sticker-pop items-center justify-center"
              style={previewMotionStyle({
                rotate: "-68deg",
                delay: "170ms",
                startX: "-104px",
                startY: "60px",
              })}
            >
              <img
                src={keyword.emojiSrc}
                alt=""
                aria-hidden
                className="record-preview-sticker-img size-[77%]"
              />
            </div>
          ) : null}
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
        <ButtonCta disabled={pending} onClick={onConfirm}>
          {pending ? "기록 중..." : "지도에 기록하기"}
        </ButtonCta>
      </div>
    </div>
  )
}
