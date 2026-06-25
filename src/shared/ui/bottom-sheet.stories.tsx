import { OverlayProvider } from "overlay-kit"

import { openBottomSheet } from "./bottom-sheet"
import { Button } from "./button"
import { DialogSeparator, DialogTitle } from "./dialog"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "BottomSheet",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <OverlayProvider>
        <Story />
      </OverlayProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "overlay-kit 기반 하단 슬라이드업 시트. default=풀폭 상단둥금(#32), floating=떠있는 카드(#35). 텍스트는 예시 placeholder.",
      },
    },
  },
}
export default meta
type Story = StoryObj

/** 시안 #32 — 표준 바텀시트(정보 확인). */
export const InfoSheet: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(({ close }) => (
          <>
            <DialogTitle>여행팟 정보를 확인해 주세요</DialogTitle>
            <div className="flex w-full flex-col gap-3 rounded-2xl bg-secondary p-4">
              <p className="flex items-baseline gap-2">
                <span className="text-h5">{"{여행팟 이름}"}</span>
                <span className="text-b6 text-muted-foreground">5명 참여 중</span>
              </p>
              <div className="grid grid-cols-3 gap-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-b6">
                    <span className="size-5 rounded-full bg-neutral-300" />
                    {"{닉네임}"}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3">
              <Button className="w-full" onClick={close}>
                맞아요
              </Button>
              <button className="text-b6 text-muted-foreground" onClick={close}>
                참여하지 않고 홈으로 이동
              </button>
            </div>
          </>
        ))
      }
    >
      정보 확인 시트 (#32)
    </Button>
  ),
}

/** 시안 #35 — 플로팅 액션 시트. */
export const ActionSheet: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(
          ({ close }) => (
            <>
              <DialogTitle className="sr-only">프로필 사진 옵션</DialogTitle>
              <div className="flex w-full flex-col">
                <button className="py-3 text-left text-b3" onClick={close}>
                  갤러리에서 선택
                </button>
                <DialogSeparator />
                <button className="py-3 text-left text-b3 text-destructive" onClick={close}>
                  프로필 삭제
                </button>
              </div>
            </>
          ),
          { variant: "floating", showCloseButton: false }
        )
      }
    >
      액션 시트 (#35)
    </Button>
  ),
}
