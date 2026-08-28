import type { DateRange } from "react-day-picker"

import { Calendar } from "@/shared/ui/calendar"

/**
 * 기간 선택 스텝 (Figma 1836-15777 · 1836-15756).
 * 재방문 안내는 날짜 선택 시 TravelRecordFlow에서 토스트로 노출한다.
 */
export function DateStep({
  range,
  onRangeChange,
  revisit = false,
}: {
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
  revisit?: boolean
}) {
  if (revisit) {
    return (
      <Calendar
        mode="single"
        selected={range?.from}
        onSelect={(date) =>
          onRangeChange(date ? { from: date, to: undefined } : undefined)
        }
        // 다녀온 날짜 기록이라 미래 날짜는 선택 불가
        disabled={{ after: new Date() }}
        classNames={{ root: "travel-record-calendar w-full" }}
      />
    )
  }

  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={onRangeChange}
      // 다녀온 날짜 기록이라 미래 날짜는 선택 불가
      disabled={{ after: new Date() }}
      classNames={{ root: "travel-record-calendar w-full" }}
    />
  )
}
