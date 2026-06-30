import { BadgeCheck, CircleDot, Diamond } from "lucide-react"

import { BottomNav } from "@/shared/ui/bottom-nav"

export type BottomNavKey = "map" | "recap" | "my"

const KEYS: Array<BottomNavKey> = ["map", "recap", "my"]

const ITEMS = [
  { icon: <Diamond size={18} />, label: "여행 지도" },
  { icon: <CircleDot size={18} />, label: "리캡 생성" },
  { icon: <BadgeCheck size={18} />, label: "마이" },
]

interface AppBottomNavProps {
  activeKey: BottomNavKey
  onSelect?: (key: BottomNavKey) => void
}

export function AppBottomNav({ activeKey, onSelect }: AppBottomNavProps) {
  return (
    <BottomNav
      items={ITEMS}
      activeIndex={KEYS.indexOf(activeKey)}
      onChange={(i) => onSelect?.(KEYS[i])}
    />
  )
}
