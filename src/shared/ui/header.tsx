import * as React from "react"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/shared/lib/utils"

function HeaderBack({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      className={cn("flex items-center justify-center p-1", className)}
      {...props}
    >
      <ArrowLeft className="size-5" />
    </button>
  )
}

function HeaderTitle({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn("absolute left-1/2 -translate-x-1/2 text-base font-medium", className)}
      {...props}
    >
      {children}
    </h1>
  )
}

function HeaderRight({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("ml-auto flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
}

const Header = Object.assign(
  function HeaderRoot({ children, className, ...props }: React.ComponentProps<"header">) {
    return (
      <header
        className={cn("relative flex h-12 items-center px-4 bg-background", className)}
        {...props}
      >
        {children}
      </header>
    )
  },
  {
    Back: HeaderBack,
    Title: HeaderTitle,
    Right: HeaderRight,
  }
)

export { Header }
