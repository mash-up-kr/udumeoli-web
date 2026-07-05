import { Chip } from "./chip"
import type { Meta, StoryObj } from "@storybook/react-vite"
import profileDefaultSrc from "@/shared/assets/profile-default.svg"

const meta: Meta<typeof Chip> = {
  component: Chip,
  tags: ["autodocs"],
  args: { label: "정선" },
  argTypes: {
    label: { control: "text" },
    profileSrc: {
      control: "text",
      description: "지정 시 좌측 16px 프로필 표시(With Profile 변형).",
    },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Chip (Figma Chip v1.0.0). 흰 pill · bg-neutral-weak · shadow, 라벨 text-h9 · fg-neutral-bold. profileSrc를 주면 좌측 16px 프로필이 붙습니다.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Chip>

/** 텍스트만. */
export const TextOnly: Story = {}

/** 좌측 프로필 포함. */
export const WithProfile: Story = {
  args: { profileSrc: profileDefaultSrc },
}

/** 두 변형 비교. */
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Chip label="정선" />
      <Chip label="정선" profileSrc={profileDefaultSrc} />
    </div>
  ),
}
