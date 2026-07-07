import { OverlayProvider } from "overlay-kit"

import { Button } from "./button"
import { showToast } from "./toast"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <OverlayProvider>
        <div className="relative h-32">
          <Story />
        </div>
      </OverlayProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "화면 하단에 잠깐 표시되는 알림 (Figma Toast v1.0.0). `showToast()` 명령형 호출, 기본 3초 후 자동 dismiss. 흰 pill · bg-neutral-weak · 라벨 fg-neutral-bold, 선택적 아이콘 — alert(빨간 !)/alert-neutral(검정 !)/check(파란 ✓).",
      },
      story: { inline: false, height: "200px" },
    },
  },
}
export default meta
type Story = StoryObj

/** 기본 (아이콘 없음). */
export const Default: Story = {
  render: () => (
    <Button onClick={() => showToast({ message: "초대코드를 복사했어요" })}>
      토스트 표시
    </Button>
  ),
}

/** 에러 알림 아이콘 (빨간 !). */
export const WithAlertIcon: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({ message: "입력값을 다시 확인해 주세요", icon: "alert" })
      }
    >
      에러 토스트
    </Button>
  ),
}

/** 안내 알림 아이콘 (검정 !) — 로그아웃 완료 등. */
export const WithNeutralAlertIcon: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          message: "로그아웃이 완료됐어요.",
          icon: "alert-neutral",
        })
      }
    >
      안내 토스트
    </Button>
  ),
}

/** 완료 체크 아이콘 (파란 ✓) — 프로필 수정 완료 등. */
export const WithCheckIcon: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({ message: "프로필 수정이 완료됐어요.", icon: "check" })
      }
    >
      완료 토스트
    </Button>
  ),
}

/** duration 조절. 기본 3초, 여기선 5초. */
export const CustomDuration: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({ message: "5초 동안 표시됩니다.", duration: 5000 })
      }
    >
      5초 토스트
    </Button>
  ),
}
