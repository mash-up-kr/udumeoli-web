import { AppSplash } from "./app-splash"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof AppSplash> = {
  component: AppSplash,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "라우트 진입 판정 중 전체 화면 대기 상태. 스플래시 모션 영상 1회 재생(로드 전엔 하늘 배경 poster). 랜딩은 children으로 CTA를 얹어 공유하고, onMotionEnd(영상 종료·로드 실패)를 CTA 노출 시점으로 쓴다.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof AppSplash>

export const Default: Story = {}
