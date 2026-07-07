import { overlay } from "overlay-kit"
import type { ReactNode } from "react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSeparator,
  DialogTitle,
} from "@/shared/ui/dialog"
import { cn } from "@/shared/lib/utils"

/**
 * overlay-kit 기반 명령형 모달 헬퍼.
 * 열기/닫기·결과는 overlay-kit이, 모달 UI·a11y는 Radix Dialog가 담당.
 * 앱 전역에 OverlayProvider(__root.tsx)가 깔려 있어야 동작.
 *
 * openAsync의 `close(value)` 호출이 곧 promise resolve + 닫기.
 */

type AlertOptions = {
  title: ReactNode
  description?: ReactNode
  confirmText?: string
}

/** 안내 알림 모달(버튼 1개). 확인·바깥클릭·ESC 시 resolve. (시안 #25) */
export function openAlert({
  title,
  description,
  confirmText = "확인",
}: AlertOptions): Promise<void> {
  return overlay.openAsync<void>(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent showCloseButton={false} onCloseAutoFocus={() => unmount()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <>
              <DialogSeparator className="my-1" />
              <DialogDescription>{description}</DialogDescription>
            </>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button className="w-full" onClick={() => close()}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ))
}

type ConfirmOptions = {
  title: ReactNode
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  /** 위험 동작(계정 삭제 등) — 확인 버튼을 빨강 솔리드로. */
  destructive?: boolean
}

/**
 * 확인/취소 모달(버튼 2개). 확인=true, 취소·바깥클릭·ESC=false로 resolve. (시안 #30)
 * description이 있으면 제목 아래 구분선 노출. destructive면 확인 버튼 빨강.
 */
export function openConfirm({
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  return overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close(false)}>
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={() => unmount()}
        className="gap-6"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <>
              <DialogSeparator className="my-1" />
              <DialogDescription>{description}</DialogDescription>
            </>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            size="lg"
            className="px-7"
            onClick={() => close(false)}
          >
            {cancelText}
          </Button>
          <Button
            size="lg"
            className={cn(
              "flex-1",
              destructive && "bg-destructive text-white hover:bg-destructive/90"
            )}
            onClick={() => close(true)}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ))
}

type ModalOptions = {
  /** DialogContent 스타일 오버라이드 (폭·radius·padding 등). */
  className?: string
  /** 기본 닫기(X) 버튼 노출 여부. 커스텀 닫기 아이콘을 쓸 때 false. */
  showCloseButton?: boolean
}

/**
 * 커스텀 내용 모달. render에 close를 넘겨 호출부가 자유롭게 구성. (시안 #28 권한 모달 등)
 * 도메인 콘텐츠(리스트 등)는 호출부에서 주입.
 */
export function openModal(
  render: (controls: { close: () => void }) => ReactNode,
  options?: ModalOptions
): void {
  overlay.open(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className={options?.className}
        showCloseButton={options?.showCloseButton}
        onCloseAutoFocus={() => unmount()}
      >
        {render({ close })}
      </DialogContent>
    </Dialog>
  ))
}
