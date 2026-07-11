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
          "NumberCode (Figma NumberCode v1.0.0). 초대코드 입력용 숫자 코드 인풋 — 한 자리씩 박스에 입력, 붙여넣기 지원. 셀 44×60 · radius 12, 포커스 시 stroke-neutral-bold 테두리, 에러 시 stroke-danger-solid 테두리.",
      },
    },
  },
  argTypes: {
    length: {
      control: { type: "number", min: 4, max: 8 },
      description: "박스 수 (기본 6)",
    },
    value: { control: "text" },
    error: { control: "boolean", description: "에러 테두리 노출" },
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

/** 영문 소문자+숫자 조합 입력 (여행팟 초대코드). */
export const Alphanumeric: Story = {
  render: () => {
    const [value, setValue] = React.useState("")
    return <NumberCode mode="alphanumeric" value={value} onChange={setValue} />
  },
}

/** 발급된 코드 표시용 읽기 전용 (여행팟 생성 완료 모달). */
export const ReadOnly: Story = {
  render: () => <NumberCode length={6} value="121ha1" readOnly />,
}

/** 에러 상태 (Empty / Filled) — 포커스 중에도 danger 테두리 유지. */
export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <div className="flex flex-col gap-4">
      <NumberCode length={6} value="" error onChange={() => {}} />
      <NumberCode length={6} value="123456" error onChange={() => {}} />
    </div>
  ),
}
