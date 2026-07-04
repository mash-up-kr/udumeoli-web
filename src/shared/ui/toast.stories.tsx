import { OverlayProvider } from "overlay-kit"

import { Button } from "./button"
import { showToast } from "./toast"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "Overlays/Toast",
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
          "화면 하단에 잠깐 표시되는 알림 (Figma Toast v1.0.0). `showToast()` 명령형 호출, 기본 3초 후 자동 dismiss. 흰 pill · bg-neutral-weak · 라벨 fg-neutral-bold, 선택적 알림 아이콘(fg-danger-solid).",
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

/** 알림 아이콘 포함 (showIcon). */
export const WithIcon: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({ message: "입력값을 다시 확인해 주세요", showIcon: true })
      }
    >
      아이콘 토스트
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
