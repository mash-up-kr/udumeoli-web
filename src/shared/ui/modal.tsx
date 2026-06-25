import { overlay } from "overlay-kit"
import type { ReactNode } from "react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

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
export function openAlert({ title, description, confirmText = "확인" }: AlertOptions): Promise<void> {
  return overlay.openAsync<void>(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent showCloseButton={false} onCloseAutoFocus={() => unmount()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
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
}

/** 확인/취소 모달(버튼 2개). 확인=true, 취소·바깥클릭·ESC=false로 resolve. (시안 #30) */
export function openConfirm({
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
}: ConfirmOptions): Promise<boolean> {
  return overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close(false)}>
      <DialogContent showCloseButton={false} onCloseAutoFocus={() => unmount()} className="gap-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => close(false)}>
            {cancelText}
          </Button>
          <Button className="flex-1" onClick={() => close(true)}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ))
}

/**
 * 커스텀 내용 모달. render에 close를 넘겨 호출부가 자유롭게 구성. (시안 #28 권한 모달 등)
 * 도메인 콘텐츠(리스트 등)는 호출부에서 주입.
 */
export function openModal(render: (controls: { close: () => void }) => ReactNode): void {
  overlay.open(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent onCloseAutoFocus={() => unmount()}>{render({ close })}</DialogContent>
    </Dialog>
  ))
}
