import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { ButtonCta } from "@/shared/ui/button-cta"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { PRESET_AVATARS, Profile } from "@/shared/ui/profile"
import { TextField } from "@/shared/ui/text-field"
import { showToast } from "@/shared/ui/toast"
import { useSessionStore, useUpdateProfile } from "@/entities/user"
import { RequireAuth } from "@/features/auth"

const NICKNAME_MAX = 6
const NICKNAME_INPUT_MAX = NICKNAME_MAX + 1

function MyProfileEditContent() {
  const router = useRouter()
  const user = useSessionStore((s) => s.currentUser)
  const updateUser = useSessionStore((s) => s.updateUser)
  const updateProfileMutation = useUpdateProfile()

  const originalNickname = user?.nickname ?? ""
  const originalProfileImage = user?.profileImageUrl ?? PRESET_AVATARS[0]
  const initialAvatar = PRESET_AVATARS.indexOf(originalProfileImage)

  const [nickname, setNickname] = React.useState(originalNickname)
  const [customImage, setCustomImage] = React.useState<string | null>(
    initialAvatar >= 0 ? null : originalProfileImage
  )
  const [selectedAvatar, setSelectedAvatar] = React.useState<number | null>(
    initialAvatar >= 0 ? initialAvatar : null
  )
  const [avatarTouched, setAvatarTouched] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const nicknameTooLong = nickname.length > NICKNAME_MAX
  const profileImage =
    customImage ??
    (selectedAvatar != null
      ? PRESET_AVATARS[selectedAvatar]
      : originalProfileImage)
  const changed =
    nickname.trim() !== originalNickname ||
    profileImage !== originalProfileImage
  const canSave = changed && !!nickname.trim() && !nicknameTooLong

  const goMyPage = () => router.navigate({ to: "/my-page", replace: true })

  const handleSave = async () => {
    if (updateProfileMutation.isPending) return
    // 커스텀 이미지는 blob이라 서버 미전송(프리셋 선택 시에만 번호 전송)
    try {
      await updateProfileMutation.mutateAsync({
        nickname: nickname.trim(),
        ...(avatarTouched && selectedAvatar != null
          ? { profileImage: selectedAvatar + 1 }
          : {}),
      })
    } catch {
      showToast({
        message: "프로필 수정에 실패했어요. 다시 시도해 주세요.",
        icon: "alert",
        // 저장 CTA(bottom 32=pb-8 + 높이 56) 위 16px — 토스트 위치 규칙(2차 UT)
        className: "bottom-[104px]",
      })
      return
    }
    updateUser({ nickname: nickname.trim(), profileImageUrl: profileImage })
    await goMyPage()
    showToast({ message: "프로필 수정이 완료됐어요.", icon: "check" })
  }

  return (
    <MobileLayout className="flex min-h-[var(--app-vh)] flex-col bg-bg-neutral-subtle">
      <Header title="프로필 수정" onIconClick={goMyPage} />

      <main className="flex flex-1 flex-col items-center gap-5 px-4 pt-7">
        <Profile
          size="xl"
          type="add-image"
          src={profileImage}
          className="cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onImageClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setCustomImage(URL.createObjectURL(file))
              setSelectedAvatar(null)
            }
          }}
        />

        <p className="text-b6 text-fg-neutral-subtle">
          혹은 기본 아바타를 선택해주세요
        </p>

        <div className="flex w-full items-center justify-center gap-[clamp(1rem,calc((var(--app-vw)_-_311px)/4),2.5rem)]">
          {PRESET_AVATARS.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`기본 아바타 ${i + 1}`}
              aria-pressed={selectedAvatar === i}
              className="rounded-full"
              onClick={() => {
                setSelectedAvatar(i)
                setCustomImage(null)
                setAvatarTouched(true)
              }}
            >
              <Profile
                size="lg"
                type={selectedAvatar === i ? "selected" : "default"}
                src={src}
              />
            </button>
          ))}
        </div>

        <TextField
          placeholder="닉네임을 입력해 주세요."
          value={nickname}
          inputClassName="rounded-xl"
          error={
            nicknameTooLong ? "*닉네임은 최대 6글자까지 가능해요" : undefined
          }
          onChange={(e) =>
            setNickname(e.target.value.slice(0, NICKNAME_INPUT_MAX))
          }
        />
      </main>

      <div className="w-full px-4 pb-8">
        <ButtonCta disabled={!canSave} onClick={handleSave}>
          저장
        </ButtonCta>
      </div>
    </MobileLayout>
  )
}

export function MyProfileEditPage() {
  return (
    <RequireAuth>
      <MyProfileEditContent />
    </RequireAuth>
  )
}
