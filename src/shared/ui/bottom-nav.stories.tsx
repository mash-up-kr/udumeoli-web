import * as React from "react"
import { BadgeCheck, CircleDot, Diamond } from "lucide-react"
import { BottomNav } from "./bottom-nav"
import type { Meta, StoryObj } from "@storybook/react-vite"

const defaultItems = [
  { icon: <Diamond size={18} />, label: "여행 지도" },
  { icon: <CircleDot size={18} />, label: "리캡 생성" },
  { icon: <BadgeCheck size={18} />, label: "마이" },
]

const meta: Meta<typeof BottomNav> = {
  component: BottomNav,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "모바일 바텀 탭 바. 아이콘 + 라벨 탭 목록과 activeIndex로 제어.",
      },
    },
    layout: "fullscreen",
  },
  args: {
    items: defaultItems,
    activeIndex: 0,
  },
  argTypes: {
    activeIndex: {
      control: { type: "number", min: 0, max: 2 },
    },
  },
}
export default meta
type Story = StoryObj<typeof BottomNav>

/** 첫 번째 탭 활성. */
export const Default: Story = {}

/** 탭 클릭 시 active 변경. */
export const Interactive: Story = {
  render: (args) => {
    const [active, setActive] = React.useState(0)
    return <BottomNav {...args} activeIndex={active} onChange={setActive} />
  },
}

/** 두 번째 탭 활성. */
export const SecondActive: Story = {
  args: { activeIndex: 1 },
}
