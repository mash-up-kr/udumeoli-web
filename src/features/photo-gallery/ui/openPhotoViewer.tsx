import { Dialog as DialogPrimitive } from "radix-ui"
import { overlay } from "overlay-kit"

import { ButtonIcon } from "@/shared/ui/button-icon"
import { Dialog, DialogPortal, DialogTitle } from "@/shared/ui/dialog"
import iconCloseBoldSrc from "@/shared/assets/icon-close-bold.svg"

/**
 * 갤러리 사진 자세히 보기 — 어두운 전체 화면에 사진 확대 노출 (Figma 1319-14954).
 * 좌상단 X 버튼·ESC로 닫기.
 */
export function openPhotoViewer(imageUrl: string): void {
  overlay.open(({ isOpen, close, unmount }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogPortal>
        {/* 오버레이 없음 — 갤러리 시트의 dim 위에서 열려 이중 dim 방지 */}
        <DialogPrimitive.Content
          data-slot="photo-viewer-content"
          className="fixed inset-y-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 bg-bg-neutral-inverse duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          onCloseAutoFocus={() => unmount()}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">사진 자세히 보기</DialogTitle>

          <div className="flex size-full items-center justify-center">
            <img
              src={imageUrl}
              alt=""
              className="max-h-full w-full object-contain"
            />
          </div>

          {/* Header — 좌상단 닫기 버튼 (Figma: 헤더 76 · py-8 · 좌우 16) */}
          <div className="absolute inset-x-0 top-0 z-10 flex h-[76px] items-center px-4 py-2">
            <DialogPrimitive.Close asChild>
              <ButtonIcon aria-label="닫기">
                <img src={iconCloseBoldSrc} alt="" className="size-6" />
              </ButtonIcon>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  ))
}
