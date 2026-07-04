import * as React from "react"

import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { cn } from "@/shared/lib/utils"

/**
 * TextInput (Figma v1.0.0) — 라벨 + 입력 + (선택) 글자수 카운터 + 에러 메시지.
 *
 * label·id·aria 자동 연결. `error`가 있으면 danger border + 메시지.
 * `maxLength` 지정 시 우측에 `현재/최대` 카운터 표시.
 */
function TextField({
  label,
  error,
  description,
  id,
  className,
  maxLength,
  value,
  ...props
}: React.ComponentProps<typeof Input> & {
  label?: React.ReactNode
  error?: React.ReactNode
  description?: React.ReactNode
}) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const showCounter = maxLength != null
  const count = typeof value === "string" ? value.length : 0

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={inputId} className="text-fg-neutral-bold">
          {label}
        </Label>
      ) : null}
      <div className="relative">
        <Input
          id={inputId}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(showCounter && "pr-16")}
          {...props}
        />
        {showCounter ? (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-b4 text-fg-neutral-subtle">
            {count}/{maxLength}
          </span>
        ) : null}
      </div>
      {error ? (
        <span id={errorId} className="text-b8 text-fg-danger-solid">
          {error}
        </span>
      ) : description ? (
        <span className="text-b8 text-fg-neutral-subtle">{description}</span>
      ) : null}
    </div>
  )
}

export { TextField }
