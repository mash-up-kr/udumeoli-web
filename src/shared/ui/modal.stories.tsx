import { OverlayProvider } from "overlay-kit"
import { useState } from "react"

import { Button } from "./button"
import { ButtonCta } from "./button-cta"
import { DialogTitle } from "./dialog"
import { openAlert, openConfirm, openModal } from "./modal"
import type { Meta, StoryObj } from "@storybook/react-vite"
import iconCloseSrc from "@/shared/assets/icon-close.svg"
import iconCameraSrc from "@/shared/assets/icon-camera.svg"

const meta: Meta = {
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
          "overlay-kit 기반 명령형 모달 헬퍼 — openAlert / openConfirm / openModal. 어디서든 함수 호출로 열고 promise로 결과를 받음. 텍스트는 예시 placeholder.",
      },
      story: { inline: false, height: "400px" },
    },
  },
}
export default meta
type Story = StoryObj

/** 시안 #25 — 안내 알림(버튼 1개). */
export const Alert: Story = {
  render: () => (
    <Button
      onClick={() =>
        openAlert({
          title: (
            <>
              {"{닉네임}님"}
              <br />
              회원가입이 완료됐어요!
            </>
          ),
          description: "원하는 지역을 클릭해서 사진을 넣으라고 하기",
        })
      }
    >
      Alert 열기
    </Button>
  ),
}

function ConfirmDemo() {
  const [result, setResult] = useState("")
  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={async () => {
          const ok = await openConfirm({
            title: "로그아웃하시겠습니까?",
            confirmText: "로그아웃",
          })
          setResult(ok ? "로그아웃 확인됨" : "취소됨")
        }}
      >
        Confirm 열기
      </Button>
      {result ? (
        <span className="text-b6 text-muted-foreground">결과: {result}</span>
      ) : null}
    </div>
  )
}

/** 시안 #30 — 확인/취소(버튼 2개). promise로 boolean 결과. */
export const Confirm: Story = { render: () => <ConfirmDemo /> }

/** 계정 삭제 — destructive(빨강 확인 버튼) + 설명 구분선. */
export const DestructiveConfirm: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() =>
        openConfirm({
          title: "계정을 영구적으로 삭제하시겠습니까?",
          description: "복구할 수 없습니다.",
          confirmText: "삭제",
          destructive: true,
        })
      }
    >
      계정 삭제 모달 열기
    </Button>
  ),
}

/** 커스텀 내용 모달(권한 팝업, Figma Bottom Sheet v1.0.0). openModal 옵션으로 스타일·닫기 버튼 제어. */
export const PermissionContent: Story = {
  render: () => (
    <Button
      onClick={() =>
        openModal(
          ({ close }) => (
            <>
              <button
                type="button"
                aria-label="닫기"
                className="absolute top-4 right-4 flex size-7 items-center justify-center"
                onClick={close}
              >
                <img src={iconCloseSrc} alt="" className="size-5" />
              </button>
              <DialogTitle className="py-2 text-center text-h5-1 text-fg-neutral-bold">
                서비스 이용을 위해
                <br />
                접근 권한을 허용해 주세요.
              </DialogTitle>
              <div className="flex h-[100px] items-center rounded-[12px] bg-bg-neutral-subtle p-5">
                <div className="flex items-center gap-3">
                  <img src={iconCameraSrc} alt="" className="size-9 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-h6-1 text-fg-neutral-bold">앨범</span>
                    <span className="text-b8 text-fg-neutral-subtle">
                      이미지 저장 및 업로드
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <ButtonCta
                  variant="secondary"
                  className="w-25 shrink-0"
                  onClick={close}
                >
                  취소
                </ButtonCta>
                <ButtonCta className="flex-1" onClick={close}>
                  확인
                </ButtonCta>
              </div>
            </>
          ),
          {
            className:
              "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
            showCloseButton: false,
          }
        )
      }
    >
      권한 모달 열기
    </Button>
  ),
}
