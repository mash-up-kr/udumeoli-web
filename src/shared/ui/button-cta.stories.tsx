import { ButtonCta } from "./button-cta"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof ButtonCta> = {
  component: ButtonCta,
  tags: ["autodocs"],
  args: { children: "Label", variant: "primary" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "danger"],
    },
    disabled: { control: "boolean" },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Figma Button - CTA v1.0.0. 풀폭 pill 주요 액션 버튼. variant primary·secondary·danger, default/disabled.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[343px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ButtonCta>

export const Playground: Story = {}

/** variant × 상태. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["primary", "secondary", "danger"] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <ButtonCta variant={variant}>Label</ButtonCta>
          <ButtonCta variant={variant} disabled>
            Label
          </ButtonCta>
        </div>
      ))}
    </div>
  ),
}
