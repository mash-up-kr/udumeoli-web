import { Tooltip } from "./tooltip"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "피그마 #1066-7440 — 중앙 화살표가 달린 어두운 말풍선 (direction: top·bottom). 표시/위치 제어는 사용하는 쪽에서 담당.",
      },
    },
  },
  args: { children: "사진을 올려주세요!" },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {}

/** 텍스트 길이에 따라 폭이 늘어난다. */
export const LongText: Story = {
  args: { children: "이미지는 최대 5장까지 올릴 수 있어요!" },
}

/** 아래쪽 화살표 — 대상 위에 띄울 때 (초대코드 발급 CTA 안내). */
export const BottomArrow: Story = {
  args: {
    direction: "bottom",
    children: "최대 6명까지 함께할 수 있어요. (1/6)",
  },
}
