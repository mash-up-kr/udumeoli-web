import { QueryFeedback } from "./query-feedback"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof QueryFeedback> = {
  component: QueryFeedback,
  args: {
    message:
      "사진을 불러오지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.",
    onAction: () => {},
  },
}
export default meta
type Story = StoryObj<typeof QueryFeedback>
export const Error: Story = {}
export const Retrying: Story = { args: { pending: true } }
export const Empty: Story = {
  args: {
    message: "아직 여행 기록이 없어요. 지도에 첫 기록을 남겨 보세요.",
    actionLabel: "지도에 기록하기",
  },
}
