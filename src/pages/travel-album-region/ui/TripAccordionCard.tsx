import * as React from "react"

import iconPotSrc from "../assets/icon-pot.svg"
import iconZzzSrc from "../assets/icon-zzz.svg"
import type { Photo } from "@/entities/photo"
import { cn } from "@/shared/lib/utils"
import { Profile } from "@/shared/ui/profile"
import { Skeleton } from "@/shared/ui/skeleton"
import iconChevronDownSrc from "@/shared/assets/icon-chevron-down.svg"

/** 방문 기간 카드의 멤버 행 데이터 — 나 최상단, 이후 가입 순서 (페이지에서 정렬) */
export interface MemberRecord {
  memberId: string
  nickname: string
  profileImageUrl: string | null
  isMe: boolean
  /** 이 방문 기간에 올린 최신 사진 (없으면 미기록) */
  photo: Photo | null
}

/**
 * 지역 상세의 방문(여행) 아코디언 카드 (시안 1781-24978 · 1860-3398, #Keywords Header).
 * 헤더(키워드 스티커 + "{키워드}!투어" + 기간) 클릭으로 접힘/펼침, 펼치면 멤버별 기록 타일.
 */
export function TripAccordionCard({
  title,
  stickerSrc,
  dateRange,
  records,
  defaultOpen = false,
  uploading = false,
  onRecord,
  onPhotoClick,
}: {
  /** 헤더 타이틀 — 키워드가 있으면 "{키워드.label}!투어", 없으면 팟 이름 폴백 */
  title: string
  /** 헤더 키워드 스티커 — 없으면(레거시 무키워드 여행) 기본 크루아상 아이콘 */
  stickerSrc?: string
  dateRange: string
  records: Array<MemberRecord>
  defaultOpen?: boolean
  /** 이 방문에 내 사진 업로드 진행 중 — 내 빈 타일이 스켈레톤으로 전환 */
  uploading?: boolean
  /** 내 미기록 타일의 '기록하기' CTA 클릭 */
  onRecord: () => void
  onPhotoClick: (photo: Photo) => void
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <section className="w-full overflow-hidden rounded-[24px] bg-bg-neutral-weak">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5"
      >
        <span className="flex items-center gap-3">
          {/* 키워드 스티커 그래픽 — 지도 스티커와 동일 에셋 (시안 Sticker Graphic 48px) */}
          <img
            src={stickerSrc ?? iconPotSrc}
            alt=""
            className="size-12 object-contain"
          />
          <span className="flex flex-col items-start gap-0.5">
            <span className="text-h5 text-neutral-900">{title}</span>
            <span className="text-b7 text-fg-neutral-solid">{dateRange}</span>
          </span>
        </span>
        <img
          src={iconChevronDownSrc}
          alt=""
          className={cn("size-6 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="grid grid-cols-2 gap-[10px] px-3 pt-1 pb-3">
          {records.map((record) => (
            <MemberRecordTile
              key={record.memberId}
              record={record}
              uploading={uploading}
              onRecord={onRecord}
              onPhotoClick={onPhotoClick}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

/** 방문 카드 스켈레톤 — 첫 사진 목록 로딩 동안 펼친 카드 실루엣 (헤더 + 타일 2개) */
export function TripAccordionCardSkeleton() {
  return (
    <section className="w-full rounded-[24px] bg-bg-neutral-weak">
      <div className="flex items-center gap-3 p-5">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-[27px] w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[10px] px-3 pt-1 pb-3">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <Skeleton className="aspect-square w-full rounded-2xl" />
      </div>
    </section>
  )
}

/** 멤버 칩 — 16px 프로필 + 닉네임 (+ 본인이면 ME! 뱃지) */
function MemberChip({
  record,
  onImage,
}: {
  record: MemberRecord
  /** 사진 위에 얹힐 때 텍스트 흰색 */
  onImage: boolean
}) {
  return (
    <span className="flex items-center gap-1">
      <Profile
        size="xs"
        className="shrink-0"
        {...(record.profileImageUrl ? { src: record.profileImageUrl } : {})}
        alt=""
      />
      {/* 닉네임(최대 6자 정책)이 길어도 프로필·ME! 뱃지를 밀어내지 않게 truncate */}
      <span
        className={cn(
          "max-w-20 truncate text-h9",
          onImage ? "text-fg-neutral-inverse" : "text-fg-neutral-bold"
        )}
      >
        {record.nickname}
      </span>
      {record.isMe ? (
        <span className="flex h-4 shrink-0 items-center justify-center rounded-full bg-bg-brand-solid px-1 font-eng text-e4 text-fg-neutral-inverse">
          ME!
        </span>
      ) : null}
    </span>
  )
}

function MemberRecordTile({
  record,
  uploading,
  onRecord,
  onPhotoClick,
}: {
  record: MemberRecord
  uploading: boolean
  onRecord: () => void
  onPhotoClick: (photo: Photo) => void
}) {
  const { photo } = record
  // 로드가 끝난(성공/실패) src — boolean 대신 src를 기억해 사진 교체 시 placeholder가 다시 뜨고,
  // 실패 시에도 settle 처리해 skeleton이 영구히 남지 않는다
  const [settledSrc, setSettledSrc] = React.useState<string | null>(null)

  // 기록 O — 사진 + 코멘트, 클릭 시 이미지 상세 보기
  if (photo) {
    const settle = () => setSettledSrc(photo.thumbnailUrl)
    return (
      <button
        type="button"
        onClick={() => onPhotoClick(photo)}
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-stroke-neutral-weak text-left"
      >
        {/* 이미지 로드 전 pulse placeholder — 로드되면 이미지가 덮고 애니메이션 정지 */}
        {settledSrc === photo.thumbnailUrl ? null : (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
        <img
          src={photo.thumbnailUrl}
          alt={`${record.nickname}의 여행 사진`}
          onLoad={settle}
          onError={settle}
          className="absolute inset-0 size-full object-cover"
        />
        {/* 칩·코멘트 가독성용 상단 그라디언트 (시안: neutral-900 50% → 투명) */}
        <span className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-transparent" />
        <span className="absolute inset-x-[13px] top-[13px] flex flex-col items-start gap-2">
          <MemberChip record={record} onImage />
          {photo.comment ? (
            <span className="line-clamp-2 w-full text-b8 text-fg-neutral-inverse">
              {photo.comment}
            </span>
          ) : null}
        </span>
      </button>
    )
  }

  // 기록 X — 회색 placeholder. 본인이면 '기록하기' CTA, 타인이면 zzZ (클릭 액션 없음)
  return (
    <div
      className={cn(
        "relative aspect-square w-full rounded-2xl border border-stroke-neutral-weak bg-bg-neutral-solid",
        // 내 사진 업로드 중 — 타일 전체가 pulse, CTA는 숨겨 중복 업로드 방지
        record.isMe && uploading && "animate-pulse"
      )}
    >
      <span className="absolute inset-x-[13px] top-[13px] flex">
        <MemberChip record={record} onImage={false} />
      </span>
      {record.isMe && uploading ? null : record.isMe ? (
        <button
          type="button"
          onClick={onRecord}
          className="absolute top-[calc(50%+9px)] left-1/2 flex h-[38px] -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-bg-neutral-inverse px-3 text-h9 text-fg-neutral-inverse"
        >
          기록하기
        </button>
      ) : (
        <>
          <img
            src={iconZzzSrc}
            alt=""
            className="absolute top-1/2 left-1/2 w-[47px] -translate-x-1/2 -translate-y-1/2"
          />
          <span className="sr-only">아직 기록하지 않았어요</span>
        </>
      )}
    </div>
  )
}
