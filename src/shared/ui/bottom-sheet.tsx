import { cva } from "class-variance-authority"
import { Dialog as DialogPrimitive } from "radix-ui"
import { overlay } from "overlay-kit"
import { XIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import type { VariantProps } from "class-variance-authority"

import { Button } from "@/shared/ui/button"
import { Dialog, DialogOverlay, DialogPortal } from "@/shared/ui/dialog"
import { cn } from "@/shared/lib/utils"

const sheetVariants = cva(
  "fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col bg-background text-foreground outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom",
  {
    variants: {
      // #32: edge-to-edge, 상단만 둥금
      // #35: 떠있는 카드, 전체 둥금
      variant: {
        default: "gap-6 rounded-t-[40px] px-5 py-[22px]",
        floating: "bottom-5 w-[calc(100%-2.5rem)] max-w-[335px] gap-8 rounded-[20px] p-5",
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
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof sheetVariants> & { showCloseButton?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="bottom-sheet-content"
        className={cn(sheetVariants({ variant }), className)}
        {...props}
      >
        {showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <Button variant="text" size="icon-sm" className="-ml-1.5 self-start">
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

type BottomSheetOptions = {
  variant?: VariantProps<typeof sheetVariants>["variant"]
  showCloseButton?: boolean
}

/**
 * overlay-kit 기반 명령형 바텀시트. 하단에서 슬라이드업, dim 배경, dismissible.
 * 도메인 콘텐츠는 호출부에서 render로 주입. 닫기는 close().
 * default=풀폭 상단둥금(#32) / floating=떠있는 카드(#35).
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
        onCloseAutoFocus={() => unmount()}
      >
        {render({ close })}
      </BottomSheetContent>
    </Dialog>
  ))
}

export { BottomSheetContent }
