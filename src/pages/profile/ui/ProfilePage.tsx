import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { Button } from "@/shared/ui/button"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { ProfileContainer } from "@/shared/ui/profile-container"
import { TextField } from "@/shared/ui/text-field"
import { useSessionStore } from "@/entities/user"
import { RequireAuth } from "@/features/auth"
import { openProfilePhotoSheet } from "@/features/profile-photo"

export function ProfilePage() {
  const router = useRouter()
  const user = useSessionStore((s) => s.currentUser)
  const updateUser = useSessionStore((s) => s.updateUser)
  const [nickname, setNickname] = React.useState(user?.nickname ?? "")
  const [profileImage, setProfileImage] = React.useState<string | null>(
    user?.profileImageUrl ?? null
  )

  const handleSave = () => {
    updateUser({ nickname: nickname.trim(), profileImageUrl: profileImage })
    router.navigate({ to: "/my" })
  }

  return (
    <RequireAuth>
      <MobileLayout className="flex min-h-dvh flex-col">
        <Header>
          <Header.Back onClick={() => router.navigate({ to: "/my" })} />
          <Header.Title>프로필 수정</Header.Title>
        </Header>

        <main className="flex flex-1 flex-col items-center gap-8 px-5 pt-8">
          <ProfileContainer
            size="lg"
            src={profileImage ?? undefined}
            name={nickname}
            onEdit={() =>
              openProfilePhotoSheet({
                onPick: setProfileImage,
                onRemove: () => setProfileImage(null),
              })
            }
          />
          <TextField
            label="닉네임"
            placeholder="닉네임을 작성해 주세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
          />
        </main>

        <div className="px-5 pb-8">
          <Button size="cta" className="w-full" disabled={!nickname.trim()} onClick={handleSave}>
            완료
          </Button>
        </div>
      </MobileLayout>
    </RequireAuth>
  )
}
