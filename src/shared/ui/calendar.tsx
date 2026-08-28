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
 * Today: 회색 원(neutral-500) / Selected: bg-brand-solid·fg-neutral-inverse
 * — 파란 원은 "선택"만 의미하도록 오늘은 무채색으로 구분한다.
 * (시멘틱 토큰에 중간 회색 bg가 없어 프리미티브 neutral-500을 직접 쓴다)
 */
export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ko}
      weekStartsOn={1}
      showOutsideDays
      // 5주짜리 달도 6주로 고정 — 달 이동 시 캘린더 높이가 널뛰지 않게 (모자란 행은 다음 달 날짜를 흐리게)
      fixedWeeks
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
        // month(relative)가 DOM상 뒤에 그려져 캡션 행이 버튼 클릭을 가로채지 않도록 z-10
        nav: cn(
          "absolute top-0 right-0 z-10 flex h-10 items-center gap-2",
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
                "bg-neutral-500 text-fg-neutral-inverse hover:bg-neutral-500",
              modifiers.selected &&
                "bg-bg-brand-solid text-fg-neutral-inverse hover:bg-bg-brand-solid",
              // 기간(range) 선택 — 시작·끝은 solid, 사이 날짜는 weak.
              // 셀 사이에 여백이 있어 막대로 잇지 않고 연한 브랜드 톤의 원형으로 표시한다
              modifiers.range_middle &&
                "bg-bg-brand-weak text-fg-brand-solid hover:bg-bg-brand-weak",
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
