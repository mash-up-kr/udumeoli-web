import { overlay } from "overlay-kit"
import type { ReactNode } from "react"

import { Button } from "@/shared/ui/button"
import { ButtonCta } from "@/shared/ui/button-cta"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSeparator,
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
export function openAlert({
  title,
  description,
  confirmText = "확인",
}: AlertOptions): Promise<void> {
  return overlay.openAsync<void>(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={() => unmount()}
        // description 없을 땐 명시적 undefined로 Radix a11y 경고 억제
        {...(description ? {} : { "aria-describedby": undefined })}
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
 * 확인/취소 모달(버튼 2개). 확인=true, 취소·바깥클릭·ESC=false로 resolve.
 * Figma 팝업 시안 — 343 카드 · radius 32 · p-16, ButtonCta 취소/확인.
 * destructive면 확인 버튼 danger(빨강).
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
        className="w-[343px] max-w-[calc(100%-2rem)] gap-2 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        <DialogHeader className="items-center gap-1 py-3 text-center">
          <DialogTitle className="text-h5-1 text-fg-neutral-bold">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-b6 text-fg-neutral-subtle">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <ButtonCta
            variant="secondary"
            className="w-25 shrink-0"
            onClick={() => close(false)}
          >
            {cancelText}
          </ButtonCta>
          <ButtonCta
            variant={destructive ? "danger" : "primary"}
            className="flex-1"
            onClick={() => close(true)}
          >
            {confirmText}
          </ButtonCta>
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
        // 커스텀 콘텐츠 모달 — DialogDescription 미사용이므로 경고 억제
        aria-describedby={undefined}
      >
        {render({ close })}
      </DialogContent>
    </Dialog>
  ))
}
