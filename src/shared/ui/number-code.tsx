import * as React from "react"

import { cn } from "@/shared/lib/utils"

export interface NumberCodeProps {
  length?: number
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * NumberCode (Figma NumberCode v1.0.0).
 *
 * 초대코드 등 숫자를 한 자리씩 입력하는 코드 인풋. 붙여넣기 지원.
 * 셀 44×60 · radius 12 · `bg-neutral-subtle`, 포커스 시 `stroke-neutral-bold` 테두리.
 */
export function NumberCode({
  length = 6,
  value,
  onChange,
  className,
}: NumberCodeProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1)
    if (!digit) return
    const next = value.slice(0, index) + digit + value.slice(index + 1)
    onChange(next)
    if (index < length - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      if (value[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1))
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index))
        refs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length)
    onChange(pasted)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          aria-label={`${i + 1}번째 숫자`}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "h-[60px] w-11 rounded-[12px] border border-stroke-neutral-weak bg-bg-neutral-subtle",
            "text-center text-b2 text-fg-neutral-bold caret-transparent",
            "outline-none focus:border-stroke-neutral-bold"
          )}
        />
      ))}
    </div>
  )
}
