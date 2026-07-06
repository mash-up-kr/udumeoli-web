import { ProfileCard } from "./profile-card"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ProfileCard> = {
  component: ProfileCard,
  tags: ["autodocs"],
  args: { nickname: "닉네임" },
  argTypes: {
    nickname: { control: "text" },
    profileSrc: { control: "text" },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Figma ProfileCard v1.0.0. 60px 프로필 + 닉네임(H5) + '프로필 수정' 링크.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ProfileCard>

export const Default: Story = {}
