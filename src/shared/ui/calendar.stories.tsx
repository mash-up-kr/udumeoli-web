import * as React from "react"
import { Calendar } from "./calendar"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "react-day-picker 기반 날짜 선택 캘린더 (Figma Date Picker v1.0.0). 한국어·월요일 시작, 오늘/선택 상태 브랜드 컬러.",
      },
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

/** 특정 날짜가 선택된 상태. */
export const Preselected: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(2026, 6, 9)
    )
    return (
      <Calendar
        mode="single"
        month={new Date(2026, 6, 1)}
        selected={date}
        onSelect={setDate}
      />
    )
  },
}
