import * as React from "react"

import iconZzzSrc from "../assets/icon-zzz.svg"
import type { Photo } from "@/entities/photo"
import { findKeyword } from "@/entities/photo"
import { cn } from "@/shared/lib/utils"
import { Profile } from "@/shared/ui/profile"
import { Skeleton } from "@/shared/ui/skeleton"
import iconAddSrc from "@/shared/assets/icon-add.svg"

/** 기록 카드의 멤버 표시 정보 — 나 최상단, 이후 가입 순서 (페이지에서 정렬) */
export interface RecordMember {
  memberId: string
  nickname: string
  profileImageUrl: string | null
  isMe: boolean
}

/** 멤버 칩 — 16px 프로필 + 닉네임 (+ 본인이면 ME! 뱃지, 정책 4-4) */
function MemberChip({
  member,
  onImage,
}: {
  member: RecordMember
  /** 사진 위에 얹힐 때 텍스트 흰색 */
  onImage: boolean
}) {
  return (
    <span className="flex items-center gap-1">
      <Profile
        size="xs"
        className="shrink-0"
        {...(member.profileImageUrl ? { src: member.profileImageUrl } : {})}
        alt=""
      />
      {/* 닉네임(최대 6자 정책)이 길어도 프로필·ME! 뱃지를 밀어내지 않게 truncate */}
      <span
        className={cn(
          "max-w-20 truncate text-h9",
          onImage ? "text-fg-neutral-inverse" : "text-fg-neutral-bold"
        )}
      >
        {member.nickname}
      </span>
      {member.isMe ? (
        <span className="flex h-4 shrink-0 items-center justify-center rounded-full bg-bg-brand-solid px-1 font-eng text-e4 text-fg-neutral-inverse">
          ME!
        </span>
      ) : null}
    </span>
  )
}

/** 기록 카드 스켈레톤 — 첫 사진 목록 로딩 동안의 타일 실루엣 */
export function RecordTileSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("aspect-square w-full rounded-2xl", className)} />
  )
}

/**
 * 지역 상세의 기록 카드 (Figma 3212-66144 · 정책 4-1~4-4).
 * 기록 O: 사진 + 멤버 칩 + 코멘트(2줄) + 키워드 스티커(우상단), 클릭 시 이미지 상세 보기.
 * 기록 X: 본인이면 점선 테두리 + '내 사진 올리기' CTA, 타인이면 zzZ placeholder(클릭 액션 없음).
 */
export function RecordTile({
  member,
  photo,
  uploading = false,
  onRecord,
  onPhotoClick,
  className,
}: {
  member: RecordMember
  /** null이면 미기록 카드 */
  photo: Photo | null
  /** 내 사진 업로드 진행 중 — 내 빈 타일이 스켈레톤으로 전환 */
  uploading?: boolean
  /** 내 미기록 타일의 '내 사진 올리기' 클릭 */
  onRecord: () => void
  onPhotoClick: (photo: Photo) => void
  /** 1인팟 1열 카드처럼 비율을 바꿀 때 */
  className?: string
}) {
  // 로드가 끝난(성공/실패) src — boolean 대신 src를 기억해 사진 교체 시 placeholder가 다시 뜨고,
  // 실패 시에도 settle 처리해 skeleton이 영구히 남지 않는다
  const [settledSrc, setSettledSrc] = React.useState<string | null>(null)

  // 기록 O — 사진 + 코멘트, 클릭 시 이미지 상세 보기 (정책 4-3)
  if (photo) {
    const keyword = findKeyword(photo.keyword)
    const settle = () => setSettledSrc(photo.thumbnailUrl)
    return (
      <button
        type="button"
        onClick={() => onPhotoClick(photo)}
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-2xl border border-stroke-neutral-weak text-left",
          className
        )}
      >
        {/* 이미지 로드 전 pulse placeholder — 로드되면 이미지가 덮고 애니메이션 정지 */}
        {settledSrc === photo.thumbnailUrl ? null : (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
        <img
          src={photo.thumbnailUrl}
          alt={`${member.nickname}의 ${keyword?.label ?? "여행"} 사진`}
          onLoad={settle}
          onError={settle}
          className="absolute inset-0 size-full object-cover"
        />
        {/* 칩·코멘트 가독성용 상단 그라디언트 (시안: neutral-900 50% → 투명) */}
        <span className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-transparent" />
        <span className="absolute inset-x-[13px] top-[13px] flex flex-col items-start gap-2 pr-9">
          <MemberChip member={member} onImage />
          {photo.comment ? (
            <span className="line-clamp-2 w-full text-b8 text-fg-neutral-inverse">
              {photo.comment}
            </span>
          ) : null}
        </span>
        {keyword ? (
          <img
            src={keyword.emojiSrc}
            alt=""
            className="absolute top-[13px] right-[13px] size-7 object-contain"
          />
        ) : null}
      </button>
    )
  }

  // 기록 X — 본인은 점선 테두리 + '내 사진 올리기' CTA(정책 4-1), 타인은 zzZ(정책 4-2)
  return (
    <div
      className={cn(
        "relative aspect-square w-full rounded-2xl border bg-bg-neutral-solid",
        member.isMe
          ? "border-dashed border-stroke-neutral-subtle"
          : "border-solid border-stroke-neutral-weak",
        // 내 사진 업로드 중 — 타일 전체가 pulse, CTA는 숨겨 중복 업로드 방지
        member.isMe && uploading && "animate-pulse",
        className
      )}
    >
      <span className="absolute inset-x-[13px] top-[13px] flex">
        <MemberChip member={member} onImage={false} />
      </span>
      {member.isMe && uploading ? null : member.isMe ? (
        <button
          type="button"
          onClick={onRecord}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-h8 text-fg-neutral-bold"
        >
          <img src={iconAddSrc} alt="" className="size-9" />내 사진 올리기
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
