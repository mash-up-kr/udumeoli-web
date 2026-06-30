import { AppBottomNav } from "./AppBottomNav"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof AppBottomNav> = {
  component: AppBottomNav,
  parameters: { layout: "fullscreen" },
  args: { activeKey: "map", onSelect: () => {} },
}
export default meta
type Story = StoryObj<typeof AppBottomNav>

export const MapActive: Story = {}
export const MyActive: Story = { args: { activeKey: "my" } }
