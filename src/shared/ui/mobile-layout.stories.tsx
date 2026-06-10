import { MobileLayout } from "./mobile-layout"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof MobileLayout> = {
  component: MobileLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "모든 페이지에 쓰는 모바일 영역 컨테이너. 최대 너비를 고정하고 화면 중앙에 배치.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof MobileLayout>

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-muted p-4">
      <MobileLayout className="bg-background p-4">
        <p className="text-sm text-muted-foreground">
          max-w-[430px] 중앙 정렬 컨테이너. 양쪽 여백은 배경색으로 처리.
        </p>
      </MobileLayout>
    </div>
  ),
}
