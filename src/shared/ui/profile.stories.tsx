import { Profile } from "./profile"
import type { ProfileSize } from "./profile"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Profile> = {
  component: Profile,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    type: {
      control: "inline-radio",
      options: ["default", "selected", "add-image"],
    },
    src: { control: "text" },
  },
  args: { size: "lg", type: "default" },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Figma Profile v1.0.0. 원형 아바타 — size xs(16)/sm(24)/md(32)/lg(60)/xl(120), type default·selected·add-image.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Profile>

export const Playground: Story = {}

const SIZES: Array<ProfileSize> = ["xs", "sm", "md", "lg", "xl"]

/** 사이즈별 (Default). */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {SIZES.map((size) => (
        <Profile key={size} size={size} />
      ))}
    </div>
  ),
}

/** 타입별 (lg 기준). */
export const Types: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Profile size="lg" type="default" />
      <Profile size="lg" type="selected" />
      <Profile size="lg" type="add-image" />
    </div>
  ),
}
