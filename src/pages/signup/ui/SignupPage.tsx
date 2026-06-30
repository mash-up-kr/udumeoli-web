import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { Image as ImageIcon, MapPin } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { DialogSeparator, DialogTitle } from "@/shared/ui/dialog"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { ProfileContainer } from "@/shared/ui/profile-container"
import { TextField } from "@/shared/ui/text-field"
import { openAlert, openModal } from "@/shared/ui/modal"
import { MOCK_USER, useSessionStore } from "@/entities/user"
import { openProfilePhotoSheet } from "@/features/profile-photo"

// 접근 권한 안내 (최초 진입 모달) — 디자인시스템 권한 모달 정렬
function PermissionContent({ onConfirm }: { onConfirm: () => void }) {
  return (
    <>
      {/* 제목 + 구분선 + 권한 목록을 한 그룹으로 (구분선이 제목에 밀착, 버튼 앞 32 gap) */}
      <div className="flex flex-col gap-4">
        <DialogTitle className="leading-snug">
          편리한 앱 이용을 위해
          <br />
          접근 권한을 허용해주세요.
        </DialogTitle>
        <DialogSeparator />
        <ul className="flex flex-col gap-5">
          <li className="flex items-center gap-3">
            <MapPin className="size-7 shrink-0" />
            <div className="flex flex-col">
              <span className="text-h6-1">위치</span>
              <span className="text-b6 text-muted-foreground">위치 공유</span>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <ImageIcon className="size-7 shrink-0" />
            <div className="flex flex-col">
              <span className="text-h6-1">앨범</span>
              <span className="text-b6 text-muted-foreground">이미지 저장 및 업로드</span>
            </div>
          </li>
        </ul>
      </div>
      <Button className="w-full" onClick={onConfirm}>
        확인
      </Button>
    </>
  )
}

export function SignupPage() {
  const router = useRouter()
  const login = useSessionStore((s) => s.login)
  const [nickname, setNickname] = React.useState("")
  const [profileImage, setProfileImage] = React.useState<string | null>(null)

  // StrictMode/리렌더로 두 번 열리는 것 방지 (1회만)
  const permissionShown = React.useRef(false)
  React.useEffect(() => {
    if (permissionShown.current) return
    permissionShown.current = true
    openModal(({ close }) => <PermissionContent onConfirm={close} />)
  }, [])

  const handleSubmit = async () => {
    const name = nickname.trim()
    login({ ...MOCK_USER, nickname: name, profileImageUrl: profileImage })
    await openAlert({
      title: `${name}님 회원가입이 완료됐어요!`,
      description: "원하는 지역을 클릭해서 사진을 넣으러 가요",
      confirmText: "확인",
    })
    router.navigate({ to: "/map" })
  }

  return (
    <MobileLayout className="flex min-h-dvh flex-col">
      <Header>
        <Header.Back onClick={() => router.navigate({ to: "/" })} />
        <Header.Title>회원가입</Header.Title>
      </Header>

      <main className="flex flex-1 flex-col items-center gap-8 px-5 pt-8">
        <ProfileContainer
          size="lg"
          src={profileImage ?? undefined}
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
        <Button size="cta" className="w-full" disabled={!nickname.trim()} onClick={handleSubmit}>
          완료
        </Button>
      </div>
    </MobileLayout>
  )
}
