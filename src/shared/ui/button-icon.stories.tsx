import { UploadIcon } from "lucide-react"

import { ButtonIcon } from "./button-icon"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ButtonIcon> = {
  component: ButtonIcon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "ButtonIcon (Figma Button - Icon v1.0.0). 흰 배경 · shadow 아이콘 버튼. variant: icon(원형 42px, 아이콘 24)·label(아이콘 20 + H8 라벨 pill). disabled 시 weak-disabled 토큰. icon 단독 사용 시 aria-label 필수.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["icon", "label"],
    },
  },
}
export default meta
type Story = StoryObj<typeof ButtonIcon>

/** 아이콘 단독 원형 (Default). */
export const Default: Story = {
  render: () => (
    <ButtonIcon aria-label="공유">
      <UploadIcon />
    </ButtonIcon>
  ),
}

/** 아이콘 + 라벨 pill. */
export const WithLabel: Story = {
  render: () => (
    <ButtonIcon variant="label">
      <UploadIcon />
      label
    </ButtonIcon>
  ),
}

/** Disabled — 두 variant 공통. */
export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ButtonIcon disabled aria-label="공유">
        <UploadIcon />
      </ButtonIcon>
      <ButtonIcon variant="label" disabled>
        <UploadIcon />
        label
      </ButtonIcon>
    </div>
  ),
}
