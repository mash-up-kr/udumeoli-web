import { useRouter } from "@tanstack/react-router"
import iconZzzSrc from "@/shared/assets/icon-zzz.svg"
import { useBlockedAuthorStore, useBlockedAuthors } from "@/entities/photo"
import { useSessionStore } from "@/entities/user"
import { RequireAuth } from "@/features/auth"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { showToast } from "@/shared/ui/toast"

function BlockedUsersContent() {
  const router = useRouter()
  const accountId = useSessionStore((state) => state.currentUser?.id)
  const authors = useBlockedAuthors(accountId)
  const failed = useBlockedAuthorStore((state) =>
    accountId ? state.errors[accountId] : false
  )
  if (!accountId) return null
  return (
    <MobileLayout className="flex min-h-[var(--app-vh)] flex-col bg-bg-neutral-subtle pb-[max(env(safe-area-inset-bottom),34px)]">
      <Header
        title="차단한 사용자"
        onIconClick={() => {
          void router.navigate({ to: "/my-page" })
        }}
      />
      <main className="flex flex-1 flex-col gap-4 px-4 py-4">
        {failed ? (
          <p role="alert" className="text-b6 text-fg-danger-solid">
            차단 목록을 읽지 못했어요. 브라우저 저장소 설정을 확인해 주세요.
          </p>
        ) : authors.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-bg-neutral-solid">
              <img src={iconZzzSrc} alt="" className="w-[47px]" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-h6 text-fg-neutral-bold">
                차단한 사용자가 없어요
              </h2>
              <p className="text-b6 text-fg-neutral-subtle">
                차단한 사용자는 이곳에서
                <br />
                확인하고 해제할 수 있어요.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {authors.map((author) => (
              <li
                key={author.id}
                className="flex min-w-0 items-center justify-between gap-3 border-b border-stroke-neutral-weak py-2"
              >
                <span className="min-w-0 truncate text-h7">
                  {author.nickname}
                </span>
                <button
                  type="button"
                  aria-label={`${author.nickname} 차단 해제`}
                  className="min-h-11 shrink-0 px-2 text-h8 text-fg-brand-solid"
                  onClick={() => {
                    try {
                      useBlockedAuthorStore
                        .getState()
                        .unblock(accountId, author.id)
                      showToast({
                        message: "차단을 해제했어요.",
                        icon: "check",
                      })
                    } catch {
                      showToast({
                        message: "차단 해제를 저장하지 못했어요.",
                        icon: "alert",
                      })
                    }
                  }}
                >
                  해제
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </MobileLayout>
  )
}

export function BlockedUsersPage() {
  return (
    <RequireAuth>
      <BlockedUsersContent />
    </RequireAuth>
  )
}
