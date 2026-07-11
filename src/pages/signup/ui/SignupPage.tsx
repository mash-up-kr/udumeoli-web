import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import { ButtonCta } from "@/shared/ui/button-cta"
import { DialogTitle } from "@/shared/ui/dialog"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { DEFAULT_PROFILE_SRC, Profile } from "@/shared/ui/profile"
import { TextField } from "@/shared/ui/text-field"
import { openModal } from "@/shared/ui/modal"
import { MOCK_USER, useSessionStore } from "@/entities/user"
import { openOnboardingOverlay } from "@/features/onboarding"
import iconAlertDangerSrc from "@/shared/assets/icon-alert-danger.svg"
import iconCameraSrc from "@/shared/assets/icon-camera.svg"
import iconCloseSrc from "@/shared/assets/icon-close.svg"

// 기본 아바타 후보 4종 — 현재 이미지가 1개뿐이라 동일 이미지로 채움 (추후 교체 예정)
const DEFAULT_AVATARS = [
  DEFAULT_PROFILE_SRC,
  DEFAULT_PROFILE_SRC,
  DEFAULT_PROFILE_SRC,
  DEFAULT_PROFILE_SRC,
]

// 유효 최대 6글자. 입력은 7글자까지 허용해 초과 시도를 감지하고 에러를 보여준다.
const NICKNAME_MAX = 6
const NICKNAME_INPUT_MAX = NICKNAME_MAX + 1

// 팝업 카드 공통 스타일 (Figma Bottom Sheet v1.0.0 — 권한·가입완료 팝업)
const popupModalClassName =
  "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"

function PermissionContent({
  onClose,
  onCancel,
}: {
  onClose: () => void
  onCancel: () => void
}) {
  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        className="absolute top-4 right-4 flex size-7 items-center justify-center"
        onClick={onClose}
      >
        <img src={iconCloseSrc} alt="" className="size-5" />
      </button>
      <DialogTitle className="py-2 text-center text-h5-1 text-fg-neutral-bold">
        서비스 이용을 위해
        <br />
        접근 권한을 허용해 주세요.
      </DialogTitle>
      <div className="flex h-[100px] items-center rounded-[12px] bg-bg-neutral-subtle p-5">
        <div className="flex items-center gap-3">
          <img src={iconCameraSrc} alt="" className="size-9 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="text-h6-1 text-fg-neutral-bold">앨범</span>
            <span className="text-b8 text-fg-neutral-subtle">
              이미지 저장 및 업로드
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <ButtonCta
          variant="secondary"
          className="w-25 shrink-0"
          onClick={onCancel}
        >
          취소
        </ButtonCta>
        <ButtonCta className="flex-1" onClick={onClose}>
          확인
        </ButtonCta>
      </div>
    </>
  )
}

// 권한 필요 안내 팝업 — 접근 권한 팝업에서 취소 시 노출, 확인만 제공 (Figma 1210-9229)
// 확인(onConfirm)은 접근 권한 팝업 재노출로, X(onClose)는 그냥 닫기
function PermissionRequiredContent({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        className="absolute top-4 right-4 flex size-7 items-center justify-center"
        onClick={onClose}
      >
        <img src={iconCloseSrc} alt="" className="size-5" />
      </button>
      <div className="flex flex-col items-center gap-4 pt-4 text-center">
        <img src={iconAlertDangerSrc} alt="" className="size-9" />
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-h5-1 text-fg-neutral-bold">
            원활한 서비스 이용을 위해
            <br />
            갤러리 접근 권한을 허용해 주세요
          </DialogTitle>
          <p className="text-b6 text-fg-neutral-subtle">
            갤러리 접근 권한 허용 시, 이미지 업로드가 가능합니다.
          </p>
        </div>
      </div>
      <ButtonCta onClick={onConfirm}>확인</ButtonCta>
    </>
  )
}

// 접근 권한 확인 플로우 — 취소 → 권한 필요 안내, 안내의 확인 → 접근 권한 팝업 재노출 순환
function openPermissionFlow() {
  openModal(
    ({ close }) => (
      <PermissionContent
        onClose={close}
        onCancel={() => {
          close()
          openModal(
            ({ close: closeRequired }) => (
              <PermissionRequiredContent
                onClose={closeRequired}
                onConfirm={() => {
                  closeRequired()
                  openPermissionFlow()
                }}
              />
            ),
            { className: popupModalClassName, showCloseButton: false }
          )
        }}
      />
    ),
    { className: popupModalClassName, showCloseButton: false }
  )
}

// 가입 완료 팝업 — /map 이동 후 표시 (그래픽은 추후 교체 예정 placeholder)
// 확인 버튼(onConfirm)만 온보딩으로 이어지고, X(onClose)는 그냥 닫는다
function SignupCompleteContent({
  nickname,
  onClose,
  onConfirm,
}: {
  nickname: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        className="absolute top-4 right-4 flex size-7 items-center justify-center"
        onClick={onClose}
      >
        <img src={iconCloseSrc} alt="" className="size-5" />
      </button>
      <div className="h-[120px] rounded-[12px] bg-bg-neutral-subtle" />
      <div className="flex flex-col gap-[10px] py-2 text-center">
        <DialogTitle className="text-h5-1 text-fg-neutral-bold">
          {nickname}님
          <br />
          회원가입이 완료되었어요!
        </DialogTitle>
        <p className="text-b6 text-fg-neutral-subtle">
          친구와 함께 최고의 여행 순간을 담아 보세요.
        </p>
      </div>
      <ButtonCta onClick={onConfirm}>확인</ButtonCta>
    </>
  )
}

export function SignupPage() {
  const router = useRouter()
  const login = useSessionStore((s) => s.login)
  const [nickname, setNickname] = React.useState("")
  // 입력은 막지 않고(한글 IME 조합 안전), 초과 시 에러 표시 + 다음 버튼만 비활성.
  const nicknameTooLong = nickname.length > NICKNAME_MAX
  // 갤러리/파일에서 고른 커스텀 이미지. 있으면 기본 아바타 선택보다 우선.
  const [customImage, setCustomImage] = React.useState<string | null>(null)
  // 기본 아바타 후보 중 선택 인덱스 — 첫 번째가 기본 선택. 커스텀 이미지 선택 시 해제.
  const [selectedAvatar, setSelectedAvatar] = React.useState<number | null>(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const profileImage =
    customImage ??
    (selectedAvatar != null ? DEFAULT_AVATARS[selectedAvatar] : null)

  // StrictMode/리렌더로 두 번 열리는 것 방지 (1회만)
  const permissionShown = React.useRef(false)
  React.useEffect(() => {
    if (permissionShown.current) return
    permissionShown.current = true
    openPermissionFlow()
  }, [])

  // 가입 완료 → /map으로 이동한 뒤 완료 팝업 표시 (OverlayProvider가 __root에 있어 라우트 이동 후에도 열 수 있음)
  const handleSubmit = async () => {
    const name = nickname.trim()
    login({ ...MOCK_USER, nickname: name, profileImageUrl: profileImage })
    await router.navigate({ to: "/map" })
    openModal(
      ({ close }) => (
        <SignupCompleteContent
          nickname={name}
          onClose={close}
          onConfirm={() => {
            // 확인 → 첫 진입 간단 온보딩 시작 (1회만 노출)
            close()
            openOnboardingOverlay()
          }}
        />
      ),
      { className: popupModalClassName, showCloseButton: false }
    )
  }

  return (
    <MobileLayout className="flex min-h-dvh flex-col">
      <Header direction="center" icon={false} title="프로필 선택" />

      <main className="flex flex-1 flex-col items-center gap-5 px-4 pt-7">
        {/* 프로필 이미지·카메라 배지 클릭 → 갤러리/파일에서 사진 선택 */}
        <Profile
          size="xl"
          type="add-image"
          src={profileImage ?? undefined}
          className="cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
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

        {/* 간격: 375px에서 16px(디자인 기준), 화면이 넓어지면 뷰포트 따라 최대 40px까지 확장 */}
        <div className="flex w-full items-center justify-center gap-[clamp(1rem,calc((100vw-311px)/4),2.5rem)]">
          {DEFAULT_AVATARS.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`기본 아바타 ${i + 1}`}
              aria-pressed={selectedAvatar === i}
              className="rounded-full"
              onClick={() => {
                setSelectedAvatar(i)
                setCustomImage(null)
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
          error={
            nicknameTooLong ? "*닉네임은 최대 6글자까지 가능해요" : undefined
          }
          onChange={(e) =>
            setNickname(e.target.value.slice(0, NICKNAME_INPUT_MAX))
          }
        />
      </main>

      <div className="px-4 pb-8">
        <ButtonCta
          disabled={!nickname.trim() || nicknameTooLong}
          onClick={handleSubmit}
        >
          다음
        </ButtonCta>
      </div>
    </MobileLayout>
  )
}
