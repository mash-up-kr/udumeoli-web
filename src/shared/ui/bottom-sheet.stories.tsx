import { OverlayProvider } from "overlay-kit"

import {
  BottomSheetActions,
  BottomSheetDescription,
  BottomSheetGraphicSlot,
  BottomSheetHeader,
  BottomSheetScreenHeader,
  BottomSheetTitle,
  openBottomSheet,
} from "./bottom-sheet"
import { Button } from "./button"
import { ButtonCta } from "./button-cta"
import { DialogSeparator, DialogTitle } from "./dialog"
import type { Meta, StoryObj } from "@storybook/react-vite"

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
          "overlay-kit 기반 하단 슬라이드업 시트. floating=Figma Bottom Sheet v1.0.0 카드(Header·Title·Description·GraphicSlot·Actions 조합), default=풀폭 상단둥금(date picker·갤러리류). 텍스트는 예시 placeholder.",
      },
      story: { inline: false, height: "480px" },
    },
  },
}
export default meta
type Story = StoryObj

/** Figma default — 타이틀+설명+버튼. */
export const Default: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(
          ({ close }) => (
            <>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  여행팟 정보를 확인해 주세요.
                </BottomSheetTitle>
                <BottomSheetDescription>
                  {"{닉네임}님\n회원가입이 완료됐어요!"}
                </BottomSheetDescription>
              </BottomSheetHeader>
              <BottomSheetActions>
                <ButtonCta
                  variant="secondary"
                  className="w-25 shrink-0"
                  onClick={close}
                >
                  Label
                </ButtonCta>
                <ButtonCta onClick={close}>Label</ButtonCta>
              </BottomSheetActions>
            </>
          ),
          { variant: "floating" }
        )
      }
    >
      Default
    </Button>
  ),
}

/** Figma information slot — 타이틀+설명 아래 그래픽 슬롯. */
export const InformationSlot: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(
          ({ close }) => (
            <>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  여행팟 정보를 확인해 주세요.
                </BottomSheetTitle>
                <BottomSheetDescription>
                  {"{닉네임}님\n회원가입이 완료됐어요!"}
                </BottomSheetDescription>
              </BottomSheetHeader>
              <BottomSheetGraphicSlot className="h-30" />
              <BottomSheetActions>
                <ButtonCta
                  variant="secondary"
                  className="w-25 shrink-0"
                  onClick={close}
                >
                  Label
                </ButtonCta>
                <ButtonCta onClick={close}>Label</ButtonCta>
              </BottomSheetActions>
            </>
          ),
          { variant: "floating" }
        )
      }
    >
      Information slot
    </Button>
  ),
}

/** Figma graphic slot — 그래픽 슬롯이 상단. */
export const GraphicSlot: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(
          ({ close }) => (
            <>
              <BottomSheetGraphicSlot className="h-30" />
              <BottomSheetHeader>
                <BottomSheetTitle>
                  여행팟 정보를 확인해 주세요.
                </BottomSheetTitle>
                <BottomSheetDescription>
                  {"{닉네임}님\n회원가입이 완료됐어요!"}
                </BottomSheetDescription>
              </BottomSheetHeader>
              <BottomSheetActions>
                <ButtonCta
                  variant="secondary"
                  className="w-25 shrink-0"
                  onClick={close}
                >
                  Label
                </ButtonCta>
                <ButtonCta onClick={close}>Label</ButtonCta>
              </BottomSheetActions>
            </>
          ),
          { variant: "floating" }
        )
      }
    >
      Graphic slot
    </Button>
  ),
}

/** Example — 탈퇴 확인(danger CTA). */
export const WithdrawExample: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(
          ({ close }) => (
            <>
              <BottomSheetHeader>
                <BottomSheetTitle>진짜 탈퇴하시게요?</BottomSheetTitle>
                <BottomSheetDescription>
                  즐거운 여행을 위해서 열심히 놀길 바랍니다.
                </BottomSheetDescription>
              </BottomSheetHeader>
              <BottomSheetActions>
                <ButtonCta
                  variant="secondary"
                  className="w-25 shrink-0"
                  onClick={close}
                >
                  취소
                </ButtonCta>
                <ButtonCta variant="danger" onClick={close}>
                  탈퇴하기
                </ButtonCta>
              </BottomSheetActions>
            </>
          ),
          { variant: "floating" }
        )
      }
    >
      탈퇴 확인
    </Button>
  ),
}

/** Example — 설명 없이 타이틀(2줄)+그래픽. */
export const PermissionExample: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(
          ({ close }) => (
            <>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  {"서비스 이용을 위해\n권한을 달라!"}
                </BottomSheetTitle>
              </BottomSheetHeader>
              <BottomSheetGraphicSlot className="h-30" />
              <BottomSheetActions>
                <ButtonCta
                  variant="secondary"
                  className="w-25 shrink-0"
                  onClick={close}
                >
                  싫어요
                </ButtonCta>
                <ButtonCta onClick={close}>알겠어요~</ButtonCta>
              </BottomSheetActions>
            </>
          ),
          { variant: "floating" }
        )
      }
    >
      권한 요청
    </Button>
  ),
}

/** floating에 자유 콘텐츠 주입(프로필 사진 액션 시트류). */
export const CustomContent: Story = {
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
                <button
                  className="py-3 text-left text-b3 text-destructive"
                  onClick={close}
                >
                  프로필 삭제
                </button>
              </div>
            </>
          ),
          { variant: "floating", showCloseButton: false }
        )
      }
    >
      커스텀 콘텐츠
    </Button>
  ),
}

/** Figma Modal — full variant: 상단 라운드 32 풀높이 화면형 시트 (여행팟 생성·참여). */
export const FullScreen: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(
          ({ close }) => (
            <>
              <BottomSheetScreenHeader
                icon="back"
                title="여행팟 생성"
                onIconClick={close}
              />
              <div className="flex w-full flex-1 flex-col px-4 text-b5">
                콘텐츠 영역
              </div>
              <div className="w-full px-4 pb-8">
                <ButtonCta disabled>다음</ButtonCta>
              </div>
            </>
          ),
          { variant: "full", showCloseButton: false }
        )
      }
    >
      풀높이 화면형 시트
    </Button>
  ),
}

/** 기존 풀폭 상단둥금 시트(date picker·갤러리류) — 이번 Figma 컴포넌트 범위 밖, 유지. */
export const EdgeToEdge: Story = {
  render: () => (
    <Button
      onClick={() =>
        openBottomSheet(({ close }) => (
          <>
            <DialogTitle>여행팟 정보를 확인해 주세요</DialogTitle>
            <div className="flex w-full flex-col gap-3 rounded-2xl bg-secondary p-4">
              <p className="flex items-baseline gap-2">
                <span className="text-h5">{"{여행팟 이름}"}</span>
                <span className="text-b6 text-muted-foreground">
                  5명 참여 중
                </span>
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
      풀폭 시트 (기존)
    </Button>
  ),
}
