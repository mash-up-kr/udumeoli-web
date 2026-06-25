import * as React from "react"

import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { cn } from "@/shared/lib/utils"

/**
 * 라벨 + 입력 필드 올인원 (시안 라벨/필드 패턴).
 * label·id·aria를 자동 연결. error가 있으면 빨강 border + 메시지.
 * 필드 단독은 Input, 라벨 단독은 Label 사용.
 */
function TextField({
  label,
  error,
  description,
  id,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  label?: React.ReactNode
  error?: React.ReactNode
  description?: React.ReactNode
}) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <Input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-b6 text-destructive">
          {error}
        </span>
      ) : description ? (
        <span className="text-b6 text-muted-foreground">{description}</span>
      ) : null}
    </div>
  )
}

export { TextField }
