import "react-day-picker/style.css"
import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ko } from "react-day-picker/locale"

import { cn } from "@/shared/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/** react-day-picker 래퍼. 한국어 로케일 + 프로젝트 토큰. (날짜 선택 시안) */
export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ko}
      className={cn("[--rdp-accent-color:var(--color-primary)]", className)}
      {...props}
    />
  )
}
