import * as React from "react"
import { OtpInput } from "./otp-input"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof OtpInput> = {
  component: OtpInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "초대코드 입력용 OTP 스타일 컴포넌트. 숫자 한 자리씩 박스에 입력. 붙여넣기 지원.",
      },
    },
  },
  argTypes: {
    length: {
      control: { type: "number", min: 4, max: 8 },
      description: "박스 수 (기본 6)",
    },
    value: { control: "text" },
  },
}
export default meta
type Story = StoryObj<typeof OtpInput>

function Controlled({ length = 6 }: { length?: number }) {
  const [value, setValue] = React.useState("")
  return <OtpInput length={length} value={value} onChange={setValue} />
}

/** 기본 6자리 초대코드 입력. */
export const Default: Story = {
  render: () => <Controlled />,
}

/** 4자리 입력 예시. */
export const FourDigits: Story = {
  render: () => <Controlled length={4} />,
}

/** 값이 채워진 상태. */
export const Filled: Story = {
  render: () => <OtpInput length={6} value="123456" onChange={() => {}} />,
}
