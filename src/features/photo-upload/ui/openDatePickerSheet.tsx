import * as React from "react"

import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { DialogTitle } from "@/shared/ui/dialog"
import { openBottomSheet } from "@/shared/ui/bottom-sheet"

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function DatePickerSheet({ onConfirm }: { onConfirm: (dateISO: string) => void }) {
  const [selected, setSelected] = React.useState<Date>()
  return (
    <div className="flex flex-col gap-5">
      <DialogTitle className="text-h5">다녀온 날짜를 선택해 주세요</DialogTitle>
      <div className="flex justify-center">
        <Calendar mode="single" selected={selected} onSelect={setSelected} />
      </div>
      <Button
        size="cta"
        className="w-full"
        disabled={!selected}
        onClick={() => selected && onConfirm(toISODate(selected))}
      >
        확인
      </Button>
    </div>
  )
}

export function openDatePickerSheet(onPick: (dateISO: string) => void) {
  openBottomSheet(({ close }) => (
    <DatePickerSheet
      onConfirm={(date) => {
        onPick(date)
        close()
      }}
    />
  ))
}
