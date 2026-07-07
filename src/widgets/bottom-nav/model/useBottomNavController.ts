import { useRouter } from "@tanstack/react-router"

import type { BottomNavKey } from "../ui/AppBottomNav"
import { showToast } from "@/shared/ui/toast"
import { openMyPageModal } from "@/features/my-page"

export function useBottomNavController(activeKey: BottomNavKey) {
  const router = useRouter()
  return {
    activeKey,
    onSelect: (key: BottomNavKey) => {
      if (key === "recap") {
        showToast({ message: "준비 중인 기능이에요" })
        return
      }
      if (key === "my") {
        // 마이페이지는 페이지가 아닌 모달로 노출
        openMyPageModal()
        return
      }
      router.navigate({ to: "/map" })
    },
  }
}
