import { Input } from "./input"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Input> = {
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "닉네임을 입력해 주세요" },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "입력 불가 상태.",
    },
    "aria-invalid": {
      control: "boolean",
      description: "오류 상태. 잘못된 입력값일 때 사용.",
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel"],
      description: "입력 형식.",
    },
    placeholder: {
      description: "입력 전 힌트 텍스트.",
    },
  },
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">기본</span>
        <Input placeholder="닉네임을 입력해 주세요" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">입력됨</span>
        <Input defaultValue="우두머리" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">비활성화</span>
        <Input placeholder="닉네임을 입력해 주세요" disabled />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">오류</span>
        <Input placeholder="닉네임을 입력해 주세요" aria-invalid />
      </div>
    </div>
  ),
}
