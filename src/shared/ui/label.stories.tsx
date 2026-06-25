import { Input } from "./input"
import { Label } from "./label"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Label> = {
  component: Label,
  tags: ["autodocs"],
  args: { children: "닉네임" },
  parameters: {
    docs: {
      description: {
        component: "Radix Label 기반 라벨(text-h6). htmlFor로 입력과 연결하면 클릭 시 포커스 이동.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {}

/** htmlFor로 입력과 연결 (라벨 클릭 → 입력 포커스). */
export const WithInput: Story = {
  render: () => (
    <div className="flex w-[335px] flex-col gap-2">
      <Label htmlFor="nickname">닉네임</Label>
      <Input id="nickname" placeholder="닉네임을 작성해 주세요" />
    </div>
  ),
}
