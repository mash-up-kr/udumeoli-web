import * as React from "react"

import { openBottomSheet } from "@/shared/ui/bottom-sheet"
import { DialogSeparator, DialogTitle } from "@/shared/ui/dialog"

interface ProfilePhotoSheetProps {
  close: () => void
  onPick: (url: string) => void
  onRemove: () => void
}

// 갤러리에서 선택 / 프로필 삭제 (회원가입·프로필 수정 공용)
function ProfilePhotoSheet({ close, onPick, onRemove }: ProfilePhotoSheetProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col">
      <DialogTitle className="sr-only">프로필 사진 변경</DialogTitle>
      <button
        type="button"
        className="py-4 text-left text-b4"
        onClick={() => inputRef.current?.click()}
      >
        갤러리에서 선택
      </button>
      <DialogSeparator />
      <button
        type="button"
        className="py-4 text-left text-b4 text-destructive"
        onClick={() => {
          onRemove()
          close()
        }}
      >
        프로필 삭제
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            onPick(URL.createObjectURL(file))
            close()
          }
        }}
      />
    </div>
  )
}

export function openProfilePhotoSheet(opts: {
  onPick: (url: string) => void
  onRemove: () => void
}) {
  openBottomSheet(({ close }) => <ProfilePhotoSheet close={close} {...opts} />, {
    showCloseButton: false,
  })
}
