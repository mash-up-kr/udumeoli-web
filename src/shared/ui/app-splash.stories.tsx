import { AppSplash } from "./app-splash"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof AppSplash> = {
  component: AppSplash,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "라우트 진입 판정 중 전체 화면 대기 상태 (Figma 2632-37319). 하늘 배경 + 아웃라인 워드마크·키워드 스티커 클러스터.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof AppSplash>

export const Default: Story = {}
