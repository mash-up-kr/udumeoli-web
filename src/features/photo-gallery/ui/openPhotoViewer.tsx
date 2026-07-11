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
        <DialogPrimitive.Content
          data-slot="photo-viewer-content"
          className="fixed inset-0 z-50 bg-bg-neutral-inverse duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          onCloseAutoFocus={() => unmount()}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">사진 자세히 보기</DialogTitle>

          <div className="flex size-full items-center justify-center">
            <img
              src={imageUrl}
              alt=""
              className="max-h-full w-full max-w-md object-contain"
            />
          </div>

          {/* Header — 좌상단 닫기 버튼 (Figma: 헤더 76 · py-8 · 좌우 16) */}
          <div className="absolute inset-x-0 top-0 z-10 mx-auto flex h-[76px] w-full max-w-md items-center px-4 py-2">
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
