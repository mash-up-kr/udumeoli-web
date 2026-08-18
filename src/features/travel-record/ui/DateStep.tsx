import type { DateRange } from "react-day-picker"

import { Calendar } from "@/shared/ui/calendar"

/**
 * 기간 선택 스텝 (Figma 1836-15777 · 1836-15756).
 * 재방문 안내는 날짜 선택 시 TravelRecordFlow에서 토스트로 노출한다.
 */
export function DateStep({
  range,
  onRangeChange,
}: {
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
}) {
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={onRangeChange}
      classNames={{ root: "w-full" }}
    />
  )
}
