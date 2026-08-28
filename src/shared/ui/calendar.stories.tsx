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
          "react-day-picker 기반 날짜 선택 캘린더 (Figma Date Picker v1.0.0). 한국어·월요일 시작, 오늘은 무채색 원·선택만 브랜드 컬러 원. 항상 6주 고정 렌더(fixedWeeks)로 달 이동 시 높이가 흔들리지 않는다.",
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

/** 다녀온 날짜 선택 — 오늘 이후는 비활성화 (여행 기록·사진 업로드 플로우). */
export const PastOnly: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date>()
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={{ after: new Date() }}
      />
    )
  },
}
