import { cva } from "class-variance-authority"
import { Dialog as DialogPrimitive } from "radix-ui"
import { overlay } from "overlay-kit"
import { ArrowLeft, XIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import type { VariantProps } from "class-variance-authority"

import { Button } from "@/shared/ui/button"
import { Dialog, DialogOverlay, DialogPortal } from "@/shared/ui/dialog"
import { cn } from "@/shared/lib/utils"

const sheetVariants = cva(
  "fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col bg-background text-foreground duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom",
  {
    variants: {
      // default: edge-to-edge, 상단만 둥금 (date picker·갤러리 시트)
      // floating: Figma Bottom Sheet v1.0.0 — 떠있는 카드, radius 32 · p-16
      // full: Figma Modal — 상단 라운드 32 풀높이 화면형 시트 (여행팟 생성·참여)
      variant: {
        default: "gap-6 rounded-t-[40px] px-5 py-[22px]",
        floating:
          "bottom-4 w-[calc(100%-2rem)] max-w-[343px] gap-4 rounded-[32px] bg-bg-neutral-weak p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
        full: "h-[calc(100dvh-54px)] gap-4 rounded-t-[32px] pt-4",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function BottomSheetContent({
  className,
  children,
  variant,
  showCloseButton = true,
  showOverlay = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof sheetVariants> & {
    showCloseButton?: boolean
    showOverlay?: boolean
  }) {
  return (
    <DialogPortal>
      {showOverlay ? <DialogOverlay /> : null}
      <DialogPrimitive.Content
        data-slot="bottom-sheet-content"
        className={cn(sheetVariants({ variant }), className)}
        {...props}
      >
        {showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <Button
              variant="text"
              size="icon-sm"
              className={
                variant === "floating"
                  ? "absolute top-3.5 right-3.5"
                  : "-ml-1.5 self-start"
              }
            >
              <XIcon />
              <span className="sr-only">닫기</span>
            </Button>
          </DialogPrimitive.Close>
        ) : null}
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/** full variant 상단 헤더 — 좌측 아이콘(뒤로 ←/닫기 ✕) + 타이틀 (Figma Modal Header). */
function BottomSheetScreenHeader({
  icon = "close",
  title,
  onIconClick,
  className,
}: {
  icon?: "back" | "close"
  title: ReactNode
  onIconClick?: () => void
  className?: string
}) {
  const Icon = icon === "close" ? XIcon : ArrowLeft
  return (
    <header
      className={cn("flex w-full items-center gap-6 px-4 py-3", className)}
    >
      <button
        type="button"
        aria-label={icon === "close" ? "닫기" : "뒤로 가기"}
        onClick={onIconClick}
        className="flex size-6 shrink-0 items-center justify-center text-fg-neutral-bold"
      >
        <Icon className="size-6" />
      </button>
      <DialogPrimitive.Title
        data-slot="bottom-sheet-screen-title"
        className="min-w-0 flex-1 truncate text-h5-1 text-fg-neutral-bold"
      >
        {title}
      </DialogPrimitive.Title>
    </header>
  )
}

/** 타이틀 + 설명을 감싸는 텍스트 영역. */
function BottomSheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-header"
      className={cn(
        "flex w-full flex-col items-center gap-2.5 py-2 text-center",
        className
      )}
      {...props}
    />
  )
}

function BottomSheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="bottom-sheet-title"
      className={cn("text-h5-1 text-fg-neutral-bold", className)}
      {...props}
    />
  )
}

/** 줄바꿈(\n) 유지. */
function BottomSheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="bottom-sheet-description"
      className={cn(
        "text-b6 whitespace-pre-line text-fg-neutral-subtle",
        className
      )}
      {...props}
    />
  )
}

/** 이미지·일러스트 등 자유 콘텐츠 슬롯. 높이는 콘텐츠 또는 className으로 지정. */
function BottomSheetGraphicSlot({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-graphic-slot"
      className={cn("w-full rounded-[12px] bg-bg-neutral-subtle", className)}
      {...props}
    />
  )
}

/** ButtonCta 나열 영역. 보조 버튼은 `w-25 shrink-0`으로 고정 폭. */
function BottomSheetActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-actions"
      className={cn("flex w-full gap-3", className)}
      {...props}
    />
  )
}

type BottomSheetOptions = {
  variant?: VariantProps<typeof sheetVariants>["variant"]
  showCloseButton?: boolean
  showOverlay?: boolean
  className?: string
}

/**
 * overlay-kit 기반 명령형 바텀시트. 하단에서 슬라이드업, dim 배경, dismissible.
 * 도메인 콘텐츠는 호출부에서 render로 주입. 닫기는 close().
 * default=풀폭 상단둥금 / floating=Figma Bottom Sheet v1.0.0 카드
 * (BottomSheetHeader·Title·Description·GraphicSlot·Actions 조합).
 */
export function openBottomSheet(
  render: (controls: { close: () => void }) => ReactNode,
  options?: BottomSheetOptions
): void {
  overlay.open(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <BottomSheetContent
        variant={options?.variant}
        showCloseButton={options?.showCloseButton}
        showOverlay={options?.showOverlay}
        className={options?.className}
        onCloseAutoFocus={() => unmount()}
        // 커스텀 콘텐츠 시트 — BottomSheetDescription 미사용이므로 경고 억제
        aria-describedby={undefined}
      >
        {render({ close })}
      </BottomSheetContent>
    </Dialog>
  ))
}

export {
  BottomSheetContent,
  BottomSheetScreenHeader,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetGraphicSlot,
  BottomSheetActions,
}
