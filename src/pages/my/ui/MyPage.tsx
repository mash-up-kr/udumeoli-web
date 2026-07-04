import { useRouter } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"

import { AppBottomNav, useBottomNavController } from "@/widgets/bottom-nav"
import { Button } from "@/shared/ui/button"
import { LinkList } from "@/shared/ui/link-list"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { ProfileContainer } from "@/shared/ui/profile-container"
import { openConfirm } from "@/shared/ui/modal"
import { showToast } from "@/shared/ui/toast"
import { useSessionStore } from "@/entities/user"
import { RequireAuth } from "@/features/auth"

export function MyPage() {
  const router = useRouter()
  const user = useSessionStore((s) => s.currentUser)
  const logout = useSessionStore((s) => s.logout)

  const handleLogout = async () => {
    const ok = await openConfirm({
      title: "로그아웃하시겠습니까?",
      confirmText: "로그아웃",
    })
    if (!ok) return
    logout()
    router.navigate({ to: "/" })
  }

  const handleDelete = async () => {
    const ok = await openConfirm({
      title: "계정을 영구적으로 삭제하시겠습니까?",
      description: "복구할 수 없습니다.",
      confirmText: "삭제",
      destructive: true,
    })
    if (!ok) return
    logout()
    showToast({ message: "계정 삭제가 완료되었습니다. 감사합니다." })
    router.navigate({ to: "/" })
  }

  const notReady = () => showToast({ message: "준비 중인 기능이에요" })

  return (
    <RequireAuth>
      <MobileLayout className="flex h-dvh flex-col">
        <main className="flex flex-1 flex-col overflow-y-auto pt-6">
          <button
            type="button"
            onClick={() => router.navigate({ to: "/my/profile" })}
            className="flex items-center gap-3 px-5 py-2 text-left"
          >
            <ProfileContainer
              size="md"
              src={user?.profileImageUrl ?? undefined}
              name={user?.nickname}
            />
            <div className="flex flex-col">
              <span className="text-h5">{user?.nickname ?? "사용자"}</span>
              <span className="flex items-center text-b7 text-muted-foreground">
                프로필 수정
                <ChevronRight className="size-3.5" />
              </span>
            </div>
          </button>

          <div className="mt-4">
            <LinkList
              items={[
                { type: "header", label: "정보" },
                { type: "link", label: "1:1 문의", onClick: notReady },
                { type: "link", label: "이용약관", onClick: notReady },
                { type: "link", label: "개인정보처리방침", onClick: notReady },
                { type: "info", label: "현재 버전", value: "v1.0.0" },
              ]}
            />
          </div>

          <div className="mt-auto flex flex-col items-center gap-3 px-5 py-6">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
            <button
              type="button"
              className="text-b7 text-muted-foreground underline"
              onClick={handleDelete}
            >
              계정 삭제
            </button>
          </div>
        </main>

        <AppBottomNav {...useBottomNavController("my")} />
      </MobileLayout>
    </RequireAuth>
  )
}
