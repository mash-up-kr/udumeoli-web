import { Header } from "./header"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Header> = {
  component: Header,
  tags: ["autodocs"],
  args: {
    type: "screen-info",
    direction: "left",
    icon: true,
    title: "프로필 선택",
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["screen-info", "close"],
      description: "screen-info(뒤로가기 ←) · close(닫기 ✕)",
    },
    direction: {
      control: "inline-radio",
      options: ["left", "center"],
      description:
        "타이틀 정렬. center에서 아이콘은 screen-info=좌 / close=우.",
    },
    icon: { control: "boolean", description: "아이콘 노출 여부." },
    title: { control: "text" },
    onIconClick: { action: "iconClick" },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "화면 상단 헤더 (Figma Header v1.0.0). type(screen-info/close) × direction(left/center) × icon 조합. padding 16/12 · gap 24, 타이틀 text-h5-1 · fg-neutral-bold, 상단 safe-area 반영.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[375px] border border-border">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Header>

/** 조합을 컨트롤에서 바꿔보며 확인. */
export const Playground: Story = {}

/** Screen Info(뒤로가기 ←) — Left / Center. */
export const ScreenInfo: Story = {
  render: (args) => (
    <div className="flex flex-col divide-y divide-border">
      <Header {...args} type="screen-info" direction="left" />
      <Header {...args} type="screen-info" direction="center" />
    </div>
  ),
}

/** Close(닫기 ✕) — Left / Center(우측 ✕). */
export const Close: Story = {
  render: (args) => (
    <div className="flex flex-col divide-y divide-border">
      <Header {...args} type="close" direction="left" />
      <Header {...args} type="close" direction="center" />
    </div>
  ),
}

/** 아이콘 없이 타이틀만 (Left / Center). */
export const TitleOnly: Story = {
  render: (args) => (
    <div className="flex flex-col divide-y divide-border">
      <Header {...args} icon={false} direction="left" />
      <Header {...args} icon={false} direction="center" />
    </div>
  ),
}

/** 전체 변형 매트릭스. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col divide-y divide-border">
      <Header {...args} type="screen-info" direction="left" />
      <Header {...args} type="screen-info" direction="center" />
      <Header {...args} type="close" direction="left" />
      <Header {...args} type="close" direction="center" />
      <Header {...args} icon={false} direction="left" />
      <Header {...args} icon={false} direction="center" />
    </div>
  ),
}
