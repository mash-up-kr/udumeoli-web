import { TextField } from "./text-field"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof TextField> = {
  component: TextField,
  tags: ["autodocs"],
  args: { label: "닉네임", placeholder: "닉네임을 작성해 주세요" },
  argTypes: {
    label: { description: "필드 위 라벨." },
    placeholder: { description: "입력 전 힌트." },
    error: { control: "text", description: "오류 메시지. 있으면 빨강 border + 메시지." },
    description: { control: "text", description: "보조 설명(error 없을 때만 표시)." },
    disabled: { control: "boolean", description: "입력 불가." },
  },
  parameters: {
    docs: {
      description: { component: "라벨 + 입력 필드 올인원. label·id·aria 자동 연결." },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[335px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof TextField>

export const Default: Story = {}

/** 시안 3종 재현. */
export const Examples: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <TextField label="닉네임" placeholder="닉네임을 작성해 주세요" />
      <TextField label="초대코드 입력" placeholder="우리 방의 초대코드를 입력해 주세요" />
      <TextField label="여행팟 이름" placeholder="우리 방의 이름을 작성해 주세요" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <TextField label="기본" placeholder="닉네임을 작성해 주세요" />
      <TextField label="입력됨" defaultValue="우두머리" />
      <TextField label="오류" defaultValue="우" error="2자 이상 입력해 주세요" />
      <TextField label="보조 설명" placeholder="닉네임을 작성해 주세요" description="2~10자로 입력하세요" />
      <TextField label="비활성화" placeholder="닉네임을 작성해 주세요" disabled />
    </div>
  ),
}
