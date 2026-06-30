import { ChevronRight } from "lucide-react"

import { Button } from "./button"
import { cn } from "@/shared/lib/utils"

export type LinkListItem =
  | { type: "header"; label: string }
  | { type: "link"; label: string; onClick: () => void }
  | { type: "info"; label: string; value: string }

export interface LinkListProps {
  items: Array<LinkListItem>
  className?: string
}

export function LinkList({ items, className }: LinkListProps) {
  return (
    <ul className={cn("w-full", className)}>
      {items.map((item, i) => {
        if (item.type === "header") {
          return (
            <li key={i} className="px-5 py-1">
              <span className="text-[12px] leading-normal font-semibold tracking-[-0.24px] text-foreground">
                {item.label}
              </span>
            </li>
          )
        }

        if (item.type === "info") {
          return (
            <li
              key={i}
              className="flex w-full items-center justify-between px-5 py-4"
            >
              <span className="text-h8-1 text-foreground">{item.label}</span>
              <span className="text-h8-1 text-foreground">{item.value}</span>
            </li>
          )
        }

        return (
          <li key={i}>
            <Button
              variant="text"
              onClick={item.onClick}
              className="h-auto w-full justify-between px-5 py-4"
            >
              <span className="text-h8-1 text-foreground">{item.label}</span>
              <ChevronRight className="size-5 shrink-0 text-foreground" />
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
