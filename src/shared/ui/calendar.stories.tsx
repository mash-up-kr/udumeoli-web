import * as React from "react"
import { Calendar } from "./calendar"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  parameters: {
    layout: "centered",
    docs: {
      description: { component: "react-day-picker 기반 날짜 선택 캘린더 (한국어)." },
    },
  },
}
export default meta
type Story = StoryObj<typeof Calendar>

/** 단일 날짜 선택. */
export const Single: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date>()
    return <Calendar mode="single" selected={date} onSelect={setDate} />
  },
}
