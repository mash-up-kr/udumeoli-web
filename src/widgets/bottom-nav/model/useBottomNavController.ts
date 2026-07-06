import { useRouter } from "@tanstack/react-router"

import type { BottomNavKey } from "../ui/AppBottomNav"
import { showToast } from "@/shared/ui/toast"

export function useBottomNavController(activeKey: BottomNavKey) {
  const router = useRouter()
  return {
    activeKey,
    onSelect: (key: BottomNavKey) => {
      if (key === "recap") {
        showToast({ message: "준비 중인 기능이에요" })
        return
      }
      router.navigate({ to: key === "map" ? "/map" : "/my" })
    },
  }
}
