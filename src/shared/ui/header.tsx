import * as React from "react"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/shared/lib/utils"

function HeaderBack({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      className={cn("flex shrink-0 items-center justify-center", className)}
      {...props}
    >
      <ArrowLeft className="size-6" />
    </button>
  )
}

function HeaderTitle({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={cn("truncate text-h5", className)} {...props}>
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
  function HeaderRoot({
    children,
    className,
    transparent = false,
    ...props
  }: React.ComponentProps<"header"> & { transparent?: boolean }) {
    return (
      <header
        className={cn(
          "flex w-full items-center gap-[27px] px-5 py-5",
          transparent ? "bg-transparent" : "bg-background",
          className
        )}
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
