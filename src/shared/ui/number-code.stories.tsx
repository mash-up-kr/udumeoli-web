import * as React from "react"
import { NumberCode } from "./number-code"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof NumberCode> = {
  component: NumberCode,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "NumberCode (Figma NumberCode v1.0.0). 초대코드 입력용 숫자 코드 인풋 — 한 자리씩 박스에 입력, 붙여넣기 지원. 셀 44×60 · radius 12, 포커스 시 stroke-neutral-bold 테두리.",
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
type Story = StoryObj<typeof NumberCode>

function Controlled({ length = 6 }: { length?: number }) {
  const [value, setValue] = React.useState("")
  return <NumberCode length={length} value={value} onChange={setValue} />
}

/** 기본 6자리 초대코드 입력 (Empty). 클릭하면 Focused 테두리. */
export const Default: Story = {
  render: () => <Controlled />,
}

/** 4자리 입력 예시. */
export const FourDigits: Story = {
  render: () => <Controlled length={4} />,
}

/** 값이 채워진 상태 (Filled). */
export const Filled: Story = {
  render: () => <NumberCode length={6} value="123456" onChange={() => {}} />,
}
