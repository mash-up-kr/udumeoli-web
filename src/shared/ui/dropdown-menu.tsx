import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { cn } from "@/shared/lib/utils"
import { usePortalContainer } from "@/shared/ui/portal-container"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const container = usePortalContainer()
  return (
    <DropdownMenuPrimitive.Portal container={container ?? undefined}>
      <DropdownMenuPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={16}
        className={cn(
          "z-50 flex w-[238px] max-w-[var(--radix-dropdown-menu-content-available-width)] flex-col rounded-[34px] bg-bg-neutral-weak/85 py-2.5 shadow-[0px_8px_48px_0px_rgba(0,0,0,0.25)] backdrop-blur-xl outline-none",
          className
        )}
        onKeyDown={(event) => event.stopPropagation()}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex h-[42px] cursor-pointer items-center justify-between px-4 text-left text-[17px] tracking-[-0.43px] text-fg-neutral-bold outline-none data-highlighted:bg-bg-neutral-solid data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
