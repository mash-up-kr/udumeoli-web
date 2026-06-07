import { Button } from "./button"
import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Shared UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "select",
      options: [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ],
    },
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = { args: { variant: "outline" } }

export const Secondary: Story = { args: { variant: "secondary" } }

export const Ghost: Story = { args: { variant: "ghost" } }

export const Destructive: Story = { args: { variant: "destructive" } }

export const Link: Story = { args: { variant: "link" } }

export const Disabled: Story = { args: { disabled: true } }

export const Small: Story = { args: { size: "sm" } }

export const Large: Story = { args: { size: "lg" } }
