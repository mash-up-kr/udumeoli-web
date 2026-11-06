import type { BlockedAuthor } from "@/entities/photo"
import { useBlockedAuthorStore } from "@/entities/photo"
import { useSessionStore } from "@/entities/user"
import { openConfirm } from "@/shared/ui/modal"
import { showToast } from "@/shared/ui/toast"

export async function confirmBlockAuthor(
  accountId: string,
  author: BlockedAuthor
): Promise<boolean> {
  if (accountId === author.id) return false
  const confirmed = await openConfirm({
    title: `${author.nickname}님을 차단하시겠습니까?`,
    description:
      "차단하면 이 기기에서 해당 사용자의 사진과 코멘트가 숨겨집니다.\n마이페이지에서 언제든 해제할 수 있습니다.",
    confirmText: "차단하기",
    destructive: true,
  })
  if (!confirmed || useSessionStore.getState().currentUser?.id !== accountId)
    return false
  try {
    useBlockedAuthorStore.getState().block(accountId, author)
    showToast({ message: "이 브라우저에서 차단했어요.", icon: "check" })
    return true
  } catch {
    showToast({
      message:
        "차단 목록을 저장하지 못했어요. 브라우저 저장소 설정을 확인해 주세요.",
      icon: "alert",
    })
    return false
  }
}
