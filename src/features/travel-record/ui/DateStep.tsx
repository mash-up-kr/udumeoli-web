import type { DateRange } from "react-day-picker"

import { Calendar } from "@/shared/ui/calendar"
import iconCheckCircleSrc from "@/shared/assets/icon-check-circle.svg"

/**
 * 기간 선택 스텝 (Figma 1836-15777 · 1836-15756).
 * 재방문(2회차 이상)이면 캘린더 위에 안내 배너를 함께 노출한다.
 */
export function DateStep({
  range,
  onRangeChange,
  revisit,
}: {
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
  /** 이미 기록이 있는 지역인지 — 안내 배너 노출 조건 (Figma #6) */
  revisit: boolean
}) {
  return (
    <>
      {revisit ? (
        <div className="flex w-full items-center gap-2 rounded-full bg-bg-neutral-weak px-4 py-3 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]">
          <img src={iconCheckCircleSrc} alt="" className="size-5 shrink-0" />
          <p className="text-b6 text-fg-neutral-bold">
            이미 기록한 지역은 새로운 기록으로 쌓여요.
          </p>
        </div>
      ) : null}

      <Calendar
        mode="range"
        selected={range}
        onSelect={onRangeChange}
        classNames={{ root: "w-full" }}
      />
    </>
  )
}
