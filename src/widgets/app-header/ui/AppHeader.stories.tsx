import { AppHeader } from "./AppHeader"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof AppHeader> = {
  component: AppHeader,
  title: "Widgets/AppHeader",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "브랜드/홈 헤더 (시안 #21). 배경 투명, 2줄(로고·액션 / 드롭다운). 로고·유저명은 예시 placeholder — 추후 실제 에셋·데이터로 교체.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof AppHeader>

/** 투명 배경 확인용으로 지도 느낌의 backdrop 위에 배치. */
export const Default: Story = {
  render: () => (
    <div className="bg-blue-200 pb-10">
      <AppHeader />
    </div>
  ),
}
