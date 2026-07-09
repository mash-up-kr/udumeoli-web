import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ko } from "react-day-picker/locale"

import { cn } from "@/shared/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// getDay() 인덱스(0=일) 기준 요일 라벨
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

const navButton =
  "flex size-10 items-center justify-center rounded-full text-fg-neutral-bold transition-colors hover:bg-bg-neutral-solid disabled:pointer-events-none disabled:opacity-40"

/**
 * react-day-picker 래퍼 (Figma Date Picker v1.0.0).
 *
 * 흰 카드(bg-neutral-weak·rounded-3xl), 한국어·월요일 시작. 셀 36px 원형.
 * Today: bg-brand-weak·fg-brand-solid / Selected: bg-brand-solid·fg-neutral-inverse.
 */
export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ko}
      weekStartsOn={1}
      showOutsideDays
      formatters={{
        formatCaption: (date) =>
          `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
        formatWeekdayName: (date) => WEEKDAYS[date.getDay()],
      }}
      className={className}
      classNames={{
        root: cn(
          "relative w-fit rounded-3xl bg-bg-neutral-weak px-4 py-5",
          classNames?.root
        ),
        months: cn("relative", classNames?.months),
        month: cn("relative flex flex-col gap-1", classNames?.month),
        month_caption: cn("flex h-10 items-center", classNames?.month_caption),
        caption_label: cn(
          "px-2 text-h5-1 text-fg-neutral-bold",
          classNames?.caption_label
        ),
        nav: cn(
          "absolute top-0 right-0 flex h-10 items-center gap-2",
          classNames?.nav
        ),
        button_previous: cn(navButton, classNames?.button_previous),
        button_next: cn(navButton, classNames?.button_next),
        month_grid: cn("w-full border-collapse", classNames?.month_grid),
        // 컨테이너가 w-full로 넓어져도 셀이 왼쪽에 쏠리지 않도록 균등 분배
        weekdays: cn("flex justify-between", classNames?.weekdays),
        weekday: cn(
          "flex size-9 items-center justify-center text-b4 text-fg-neutral-subtle",
          classNames?.weekday
        ),
        weeks: cn("mt-2 flex flex-col gap-2", classNames?.weeks),
        week: cn("flex justify-between", classNames?.week),
        day: cn("size-9 p-0", classNames?.day),
      }}
      components={{
        Chevron: ({ orientation, className: cls }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className={cn("size-6", cls)} />
        },
        DayButton: ({ day, modifiers, className: cls, ...buttonProps }) => (
          <button
            {...buttonProps}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-h6-1 text-fg-neutral-bold transition-colors hover:bg-bg-neutral-solid",
              modifiers.outside && "text-fg-neutral-subtle",
              modifiers.today &&
                "bg-bg-brand-weak text-fg-brand-solid hover:bg-bg-brand-weak",
              modifiers.selected &&
                "bg-bg-brand-solid text-fg-neutral-inverse hover:bg-bg-brand-solid",
              modifiers.disabled && "opacity-40 hover:bg-transparent",
              cls
            )}
          >
            {day.date.getDate()}
          </button>
        ),
      }}
      {...props}
    />
  )
}
