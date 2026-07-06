import { ColorSwatch } from "./color-swatch"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ColorSwatch> = {
  component: ColorSwatch,
  tags: ["autodocs"],
  args: {
    variant: "empty",
    selected: false,
    "aria-label": "색상 없음",
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["empty", "add", "color"],
      description:
        "empty: 색상 없음(대각선) · add: 색상 추가(+) · color: color 값으로 채움.",
    },
    selected: {
      control: "boolean",
      description: "선택 시 stroke-neutral-bold 4px 테두리.",
    },
    color: {
      control: "text",
      description: 'variant가 "color"일 때 채울 색상 값. 토큰 var() 사용 권장.',
    },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Color Swatch (Figma Color Swatch v1.0.0). 48px 스와치 버튼 · 미선택 fg-neutral-subtle 1px, 선택 stroke-neutral-bold 4px 테두리. 아이콘 전용 버튼이므로 aria-label을 함께 전달합니다.",
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ColorSwatch>

/** 색상 없음. */
export const Empty: Story = {}

/** 색상 추가. */
export const Add: Story = {
  args: { variant: "add", "aria-label": "색상 추가" },
}

/** 색상 채움. */
export const Color: Story = {
  args: {
    variant: "color",
    color: "var(--color-red-100)",
    "aria-label": "빨강",
  },
}

/** 선택 상태. */
export const Selected: Story = {
  args: { selected: true },
}

/** 시안 6종 비교 (Unselected / Selected × empty / add / color). */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <ColorSwatch aria-label="색상 없음" />
      <ColorSwatch variant="add" aria-label="색상 추가" />
      <ColorSwatch
        variant="color"
        color="var(--color-red-100)"
        aria-label="빨강"
      />
      <ColorSwatch selected aria-label="색상 없음" />
      <ColorSwatch variant="add" selected aria-label="색상 추가" />
      <ColorSwatch
        variant="color"
        color="var(--color-red-100)"
        selected
        aria-label="빨강"
      />
    </div>
  ),
}
