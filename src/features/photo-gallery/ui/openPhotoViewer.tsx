import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { overlay } from "overlay-kit"
import { ChevronRight, Ellipsis, Trash2, XIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/ui/input"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { ButtonCta } from "@/shared/ui/button-cta"
import { Profile } from "@/shared/ui/profile"
import { showToast } from "@/shared/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/ui/dialog"
import iconCloseSrc from "@/shared/assets/icon-close.svg"
import iconCloseBoldSrc from "@/shared/assets/icon-close-bold.svg"
import iconAlertDangerSrc from "@/shared/assets/icon-alert-danger.svg"

export interface PhotoViewerUploader {
  nickname: string
  profileImageUrl: string | null
  /** 본인 사진 여부 — ME! 뱃지 + 더보기(수정/삭제) 노출 조건 */
  isMe: boolean
}

export interface PhotoViewerItem {
  id: string
  imageUrl: string
  /** 사진 하단 말풍선에 노출되는 코멘트 */
  comment?: string
  /** 업로더 정보 — 없으면 닉네임 뱃지를 숨긴다 (단순 이미지 보기) */
  uploader?: PhotoViewerUploader
}

export interface PhotoViewerOptions {
  /** 좌우 스와이프로 이동할 사진 목록 — 동일 지역 사진만 전달할 것 */
  photos: Array<PhotoViewerItem>
  /** 처음 보여줄 사진 id (기본: 첫 장) */
  initialId?: string
  /** 더보기 > 수정하기로 코멘트 저장 시 호출 — resolve되면 완료 토스트 + 말풍선 갱신. 미지정 시 준비 중 안내 토스트 */
  onEditComment?: (
    photo: PhotoViewerItem,
    comment: string
  ) => Promise<void> | void
  /** 삭제 확정 시 호출 — resolve되면 완료 토스트 후 뷰어를 닫는다 */
  onDelete?: (photo: PhotoViewerItem) => Promise<void> | void
}

// 스와이프 판정 임계값(px) — 이보다 작게 움직이면 탭(UI 토글)으로 처리
const SWIPE_THRESHOLD = 48
// 뱃지(32px) + 사진과의 간격 12px — 사진 상단에서 이만큼 위에 배치
const CHIP_OFFSET = 44
// 사진이 화면을 채우면 코멘트 툴팁은 하단 136px 고정 (Figma case 01-1)
const TOOLTIP_BOTTOM_FIXED = 136

/** 이미지 삭제 확인 팝업 (Figma case 2-3) — 삭제=true, 취소·X·바깥클릭=false */
function confirmDeletePhoto(): Promise<boolean> {
  return overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close(false)}>
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={() => unmount()}
        className="w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={() => close(false)}
          className="absolute top-4 right-4 flex size-7 items-center justify-center text-fg-neutral-bold"
        >
          {/* Figma icon-close 원본 에셋 (3065-14372) — lucide X보다 획이 짧고 둥글다 */}
          <img src={iconCloseSrc} alt="" className="size-5" />
        </button>
        <div className="flex justify-center pt-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-bg-neutral-subtle">
            <img src={iconAlertDangerSrc} alt="" className="size-9" />
          </span>
        </div>
        <DialogHeader className="items-center gap-2.5 py-2 text-center">
          <DialogTitle className="text-h5-1 text-fg-neutral-bold">
            이미지를 삭제하시겠습니까?
          </DialogTitle>
          <DialogDescription className="text-b6 text-fg-neutral-subtle">
            삭제 후에는 복구할 수 없어요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <ButtonCta
            variant="secondary"
            className="w-25 shrink-0"
            onClick={() => close(false)}
          >
            취소
          </ButtonCta>
          <ButtonCta
            variant="danger"
            className="flex-1"
            onClick={() => close(true)}
          >
            삭제
          </ButtonCta>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ))
}

/** 코멘트 수정 팝업 — 저장=새 코멘트, 취소·X·바깥클릭=null */
function EditCommentDialog({
  initial,
  close,
  unmount,
}: {
  initial: string
  close: (result: string | null) => void
  unmount: () => void
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <DialogContent
      showCloseButton={false}
      onCloseAutoFocus={() => unmount()}
      className="w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={() => close(null)}
        className="absolute top-4 right-4 flex size-7 items-center justify-center text-fg-neutral-bold"
      >
        <XIcon className="size-5" />
      </button>
      <DialogHeader className="items-center gap-1 py-2 pt-4 text-center">
        <DialogTitle className="text-h5-1 text-fg-neutral-bold">
          코멘트 수정하기
        </DialogTitle>
        <DialogDescription className="sr-only">
          사진 한 줄 설명을 수정합니다.
        </DialogDescription>
      </DialogHeader>
      {/* 업로드 스텝(PhotoStep)과 동일 스펙 — 40자, 같은 placeholder */}
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
        placeholder="사진 한 줄 설명을 적고 친구와 공유해요"
        maxLength={40}
      />
      <DialogFooter className="gap-3">
        <ButtonCta
          variant="secondary"
          className="w-25 shrink-0"
          onClick={() => close(null)}
        >
          취소
        </ButtonCta>
        <ButtonCta className="flex-1" onClick={() => close(value)}>
          저장
        </ButtonCta>
      </DialogFooter>
    </DialogContent>
  )
}

function promptEditComment(initial: string): Promise<string | null> {
  return overlay.openAsync<string | null>(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close(null)}>
      <EditCommentDialog initial={initial} close={close} unmount={unmount} />
    </Dialog>
  ))
}

/** 닉네임 뱃지 — 흰 pill에 프로필 + 닉네임 (+ 본인이면 ME!) (Figma case 01 · 3번) */
function UploaderChip({ uploader }: { uploader: PhotoViewerUploader }) {
  return (
    <span className="flex h-8 items-center gap-1 rounded-full bg-bg-neutral-weak px-2 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
      <Profile
        size="xs"
        {...(uploader.profileImageUrl ? { src: uploader.profileImageUrl } : {})}
        alt=""
      />
      <span className="max-w-32 truncate text-h6-1 text-fg-neutral-bold">
        {uploader.nickname}
      </span>
      {uploader.isMe ? (
        <span className="flex h-4 items-center justify-center rounded-full bg-bg-brand-solid px-1 font-eng text-e4 text-fg-neutral-inverse">
          ME!
        </span>
      ) : null}
    </span>
  )
}

/** 코멘트 말풍선 — 흰 pill + 위쪽 화살표 (Figma case 01 · 4번) */
function CommentBubble({ comment }: { comment: string }) {
  return (
    <span className="relative flex h-8 items-center rounded-full bg-bg-neutral-weak px-3 drop-shadow-[0px_0px_10px_rgba(142,150,169,0.12)]">
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
      <span className="max-w-[280px] truncate text-b6 text-fg-neutral-bold">
        {comment}
      </span>
    </span>
  )
}

function PhotoViewerContent({
  options,
  close,
  unmount,
}: {
  options: PhotoViewerOptions
  close: () => void
  /** 닫힘 애니메이션 종료 후 오버레이 정리 */
  unmount: () => void
}) {
  const { photos, initialId, onEditComment, onDelete } = options
  const initialIndex = Math.max(
    0,
    photos.findIndex((p) => p.id === initialId)
  )
  const [index, setIndex] = React.useState(initialIndex)
  const [uiHidden, setUiHidden] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  // 뷰어 열림 중 수정된 코멘트 (photoId → comment) — photos는 열 때 스냅샷이라 여기서 덧씌운다
  const [editedComments, setEditedComments] = React.useState<
    Record<string, string | undefined>
  >({})
  const [failed, setFailed] = React.useState(false)
  const [retrySeq, setRetrySeq] = React.useState(0)
  // 렌더된 사진의 상/하단 y(px) — 뱃지·말풍선을 사진 가장자리에 붙이기 위한 측정값
  const [imageBox, setImageBox] = React.useState<{
    top: number
    bottom: number
  } | null>(null)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const dragRef = React.useRef<{ x: number; y: number } | null>(null)
  const swipedRef = React.useRef(false)

  const photo = photos[index]
  const isMine = photo.uploader?.isMe ?? false
  const comment = editedComments[photo.id] ?? photo.comment ?? ""

  // object-contain으로 렌더된 사진의 실제 상/하단 위치 계산 (letterbox ↔ full-bleed 대응)
  const measure = React.useCallback(() => {
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img || !img.naturalWidth || !img.naturalHeight) return
    const { clientWidth: cw, clientHeight: ch } = container
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
    const height = img.naturalHeight * scale
    const top = (ch - height) / 2
    setImageBox({ top, bottom: top + height })
  }, [])

  React.useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [measure])

  const goTo = (next: number) => {
    if (next < 0 || next >= photos.length || next === index) return
    setIndex(next)
    setFailed(false)
    setImageBox(null)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY }
    swipedRef.current = false
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = dragRef.current
    dragRef.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      swipedRef.current = true
      goTo(dx < 0 ? index + 1 : index - 1)
    }
  }

  // 스와이프 직후 발생하는 click은 무시 — 탭일 때만 전체화면(UI 숨김) 토글
  const handleTap = () => {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    setUiHidden((v) => !v)
  }

  const handleEdit = async () => {
    setMenuOpen(false)
    if (!onEditComment) {
      showToast({ message: "준비 중인 기능이에요" })
      return
    }
    const next = await promptEditComment(comment)
    if (next === null) return
    try {
      await onEditComment(photo, next)
    } catch {
      showToast({ message: "수정에 실패했어요", icon: "alert" })
      return
    }
    setEditedComments((prev) => ({ ...prev, [photo.id]: next }))
    showToast({ message: "수정이 완료됐어요.", icon: "check" })
  }

  const handleDelete = async () => {
    setMenuOpen(false)
    const confirmed = await confirmDeletePhoto()
    if (!confirmed) return
    try {
      await onDelete?.(photo)
    } catch {
      showToast({ message: "삭제에 실패했어요", icon: "alert" })
      return
    }
    // 시안(3065-14819)은 완료 토스트인데도 빨간 ! — 삭제라는 파괴적 결과를 강조하는 의도
    showToast({ message: "삭제가 완료됐어요.", icon: "alert" })
    // 마지막 1장 삭제 여부와 무관하게 이전 화면(지역 상세 리스트)으로 복귀
    close()
  }

  return (
    <DialogPrimitive.Content
      data-slot="photo-viewer-content"
      className="fixed inset-y-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 overflow-hidden bg-bg-neutral-inverse duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      aria-describedby={undefined}
      onCloseAutoFocus={() => unmount()}
      onEscapeKeyDown={(e) => {
        if (menuOpen) {
          e.preventDefault()
          setMenuOpen(false)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goTo(index - 1)
        if (e.key === "ArrowRight") goTo(index + 1)
      }}
    >
      <DialogTitle className="sr-only">사진 자세히 보기</DialogTitle>

      {/* 사진 영역 — 탭: UI 숨김 토글 / 좌우 스와이프: 이전·다음 사진 */}
      <div ref={containerRef} className="absolute inset-0">
        {failed ? (
          <div className="flex size-full flex-col items-center justify-center gap-6 px-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-bg-neutral-weak">
              <img src={iconAlertDangerSrc} alt="" className="size-9" />
            </span>
            <p className="text-h5-1 text-fg-neutral-inverse">
              이미지를 불러올 수 없어요
            </p>
            <button
              type="button"
              onClick={() => {
                setFailed(false)
                setRetrySeq((n) => n + 1)
              }}
              className="flex h-14 items-center justify-center rounded-full bg-bg-neutral-weak px-10 text-h6 text-fg-neutral-bold"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={uiHidden ? "화면 정보 보이기" : "화면 정보 숨기기"}
            onClick={handleTap}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="absolute inset-0 touch-pan-y outline-none"
          >
            <img
              key={`${photo.id}-${retrySeq}`}
              ref={imgRef}
              src={photo.imageUrl}
              alt={
                photo.uploader
                  ? `${photo.uploader.nickname}의 여행 사진`
                  : "여행 사진"
              }
              draggable={false}
              onLoad={measure}
              onError={() => setFailed(true)}
              className="size-full object-contain"
            />
          </button>
        )}
      </div>

      {/* 닉네임 뱃지 — 사진 위 12px, 사진이 화면을 채우면 헤더 아래로 클램프 */}
      {photo.uploader && imageBox && !failed ? (
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 transition-opacity",
            uiHidden && "opacity-0"
          )}
          style={{
            top: `max(calc(env(safe-area-inset-top) + 82px), ${imageBox.top - CHIP_OFFSET}px)`,
          }}
        >
          <UploaderChip uploader={photo.uploader} />
        </div>
      ) : null}

      {/* 코멘트 말풍선 — 사진 아래 16px, 사진이 화면을 채우면 하단 136px 고정 */}
      {comment && imageBox && !failed ? (
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 transition-opacity",
            uiHidden && "opacity-0"
          )}
          style={{
            top: `min(${imageBox.bottom + 16}px, calc(100% - ${TOOLTIP_BOTTOM_FIXED + 32}px - env(safe-area-inset-bottom)))`,
          }}
        >
          <CommentBubble comment={comment} />
        </div>
      ) : null}

      {/* Header — 좌 X(닫기) · 우 ⋯(더보기, 내 사진만) */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-20 pt-[env(safe-area-inset-top)] transition-opacity",
          uiHidden && "pointer-events-none opacity-0"
        )}
      >
        <div className="flex h-[76px] items-center justify-between px-4 py-2">
          <DialogPrimitive.Close asChild>
            <ButtonIcon aria-label="닫기">
              <img src={iconCloseBoldSrc} alt="" className="size-6" />
            </ButtonIcon>
          </DialogPrimitive.Close>
          {isMine && !failed ? (
            <ButtonIcon
              aria-label="더보기"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Ellipsis />
            </ButtonIcon>
          ) : null}
        </div>
      </div>

      {/* 수정/삭제 드롭다운 (Figma case 2-1, iOS 시스템 메뉴 스타일) */}
      {menuOpen ? (
        <>
          {/* 드롭다운 열림 중 화면 클릭(X 포함)은 드롭다운 닫기만 수행 */}
          <div
            className="absolute inset-0 z-30"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="absolute right-4 z-40 flex w-[238px] flex-col rounded-[34px] bg-white/85 py-2.5 shadow-[0px_8px_48px_0px_rgba(0,0,0,0.25)] backdrop-blur-xl"
            style={{ top: "calc(env(safe-area-inset-top) + 67px)" }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleEdit}
              className="flex h-[42px] items-center justify-between px-4 text-left text-[17px] tracking-[-0.43px] text-fg-neutral-bold"
            >
              수정하기
              <ChevronRight className="size-4" />
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleDelete}
              className="flex h-[42px] items-center justify-between px-4 text-left text-[17px] tracking-[-0.43px] text-fg-danger-solid"
            >
              삭제하기
              <Trash2 className="size-4" />
            </button>
          </div>
        </>
      ) : null}
    </DialogPrimitive.Content>
  )
}

/**
 * 여행 이미지 상세 보기 — 어두운 전체 화면 뷰어 (Figma 1774-19173 · case 01~04).
 * 닉네임 뱃지·코멘트 말풍선·수정/삭제(내 사진)·전체화면 토글·좌우 스와이프·로드 실패 재시도.
 * 좌상단 X·ESC로 닫기 (드롭다운이 열려 있으면 드롭다운부터 닫힘).
 */
export function openPhotoViewer(options: PhotoViewerOptions): void {
  if (options.photos.length === 0) return
  overlay.open(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogPortal>
        {/* 오버레이 없음 — 갤러리 시트의 dim 위에서 열려 이중 dim 방지 */}
        <PhotoViewerContent options={options} close={close} unmount={unmount} />
      </DialogPortal>
    </Dialog>
  ))
}
