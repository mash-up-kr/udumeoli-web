import { ImageCard } from "./image-card"
import type { Meta, StoryObj } from "@storybook/react-vite"
import sampleImageSrc from "@/shared/assets/sample.jpeg"

const meta: Meta<typeof ImageCard> = {
  component: ImageCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "피그마 #940-2992 — 흰 테두리 + 상단 틴트 그라디언트 이미지 위에 지역명·기간을 표시하는 태그 모양 카드.",
      },
    },
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["lg", "sm"],
      description: "lg(160×192) · sm(120×144)",
    },
    tint: {
      control: "inline-radio",
      options: ["blue", "orange", "indigo"],
      description: "이미지 상단 그라디언트 색.",
    },
    src: { control: "text", description: "배경 이미지 URL." },
    title: { control: "text", description: "지역명." },
    subtitle: { control: "text", description: "기간." },
  },
  args: {
    src: sampleImageSrc,
    title: "강릉",
    subtitle: "3days",
    size: "lg",
    tint: "blue",
  },
}
export default meta
type Story = StoryObj<typeof ImageCard>

export const Default: Story = {}

/** Large · Small 두 사이즈. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      <ImageCard {...args} size="lg" />
      <ImageCard {...args} size="sm" />
    </div>
  ),
}

/** 틴트 3종. */
export const Tints: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      <ImageCard {...args} tint="blue" />
      <ImageCard {...args} tint="orange" title="강릉" />
      <ImageCard {...args} tint="indigo" title="대전" />
    </div>
  ),
}
