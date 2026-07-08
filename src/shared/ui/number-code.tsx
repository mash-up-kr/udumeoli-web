import * as React from "react"

import { cn } from "@/shared/lib/utils"

export interface NumberCodeProps {
  length?: number
  value: string
  onChange?: (value: string) => void
  /** 허용 문자 — numeric(기본) | alphanumeric(영문 소문자+숫자, 초대코드). */
  mode?: "numeric" | "alphanumeric"
  /** 발급된 코드 표시 등 읽기 전용 노출. 입력·포커스 이동 비활성. */
  readOnly?: boolean
  className?: string
}

/**
 * NumberCode (Figma NumberCode v1.0.0).
 *
 * 초대코드 등을 한 자리씩 입력하는 코드 인풋. 붙여넣기 지원.
 * 셀 44×60 · radius 12 · `bg-neutral-subtle`, 포커스 시 `stroke-neutral-bold` 테두리.
 */
export function NumberCode({
  length = 6,
  value,
  onChange,
  mode = "numeric",
  readOnly = false,
  className,
}: NumberCodeProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])

  const sanitize = (raw: string) =>
    mode === "alphanumeric"
      ? raw.toLowerCase().replace(/[^a-z0-9]/g, "")
      : raw.replace(/\D/g, "")

  const handleChange = (index: number, raw: string) => {
    const char = sanitize(raw).slice(-1)
    if (!char) return
    const next = value.slice(0, index) + char + value.slice(index + 1)
    onChange?.(next)
    if (index < length - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      if (value[index]) {
        onChange?.(value.slice(0, index) + value.slice(index + 1))
      } else if (index > 0) {
        onChange?.(value.slice(0, index - 1) + value.slice(index))
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
    const pasted = sanitize(e.clipboardData.getData("text")).slice(0, length)
    onChange?.(pasted)
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
          inputMode={mode === "numeric" ? "numeric" : "text"}
          maxLength={1}
          readOnly={readOnly}
          tabIndex={readOnly ? -1 : undefined}
          aria-label={`${i + 1}번째 자리`}
          value={value[i] ?? ""}
          onChange={
            readOnly ? undefined : (e) => handleChange(i, e.target.value)
          }
          onKeyDown={readOnly ? undefined : (e) => handleKeyDown(i, e)}
          onPaste={readOnly ? undefined : handlePaste}
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
