import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { ButtonCta } from "@/shared/ui/button-cta"
import { DialogTitle } from "@/shared/ui/dialog"
import { DEFAULT_PROFILE_SRC, Profile } from "@/shared/ui/profile"
import { TextField } from "@/shared/ui/text-field"
import {
  BottomSheetScreenHeader,
  openBottomSheet,
} from "@/shared/ui/bottom-sheet"
import { openConfirm, openModal } from "@/shared/ui/modal"
import { showToast } from "@/shared/ui/toast"
import { photoKeys, resetUtPhotos, usePhotoUploadStore } from "@/entities/photo"
import { usePotStore } from "@/entities/travel-pot"
import { useRegionColorStore } from "@/entities/region"
import { useSessionStore } from "@/entities/user"
import iconAlertSrc from "@/shared/assets/icon-alert.svg"
import iconChevronRightSrc from "@/shared/assets/icon-chevron-right.svg"

const APP_VERSION = "v 1.0.0"

// TODO: 실제 노션 페이지 URL 확정 시 교체
const TERMS_URL = "https://www.notion.so"
const PRIVACY_URL = "https://www.notion.so"

// 온보딩(SignupPage)과 동일한 기본 아바타 후보·닉네임 규칙
const DEFAULT_AVATARS = [
  DEFAULT_PROFILE_SRC,
  DEFAULT_PROFILE_SRC,
  DEFAULT_PROFILE_SRC,
  DEFAULT_PROFILE_SRC,
]
const NICKNAME_MAX = 6
const NICKNAME_INPUT_MAX = NICKNAME_MAX + 1

// 스플래시(랜딩) CTA(카카오로 시작하기, 바닥 34px + 높이 56) 위 12px에 완료 토스트 노출
const SPLASH_TOAST_POSITION = "bottom-[102px]"

const popupModalClassName =
  "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"

const menuRowCls = "flex w-full items-center gap-1 px-2 py-3 text-left"
const menuLabelCls = "min-w-0 flex-1 truncate text-h8-1 text-fg-neutral-bold"

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

// 계정 관련 브라우저 저장소 초기화 — 온보딩 노출 여부·영속 스토어·쿠키까지 지워서
// 재가입 시 첫 진입(온보딩)부터 다시 시작되게 한다
function clearAccountStorage() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("photato-")) localStorage.removeItem(key)
  }
  sessionStorage.clear()
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim()
    if (name)
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

// 계정 삭제 재확인 팝업 — 알림 아이콘 + 데이터 영구 삭제 안내 + 취소/계정 삭제(danger)
function DeleteConfirmContent({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4 pt-4 text-center">
        <span className="flex size-[60px] items-center justify-center rounded-full bg-bg-neutral-subtle">
          <img src={iconAlertSrc} alt="" className="size-9" />
        </span>
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-h5-1 text-fg-neutral-bold">
            계정을 삭제하시겠습니까?
          </DialogTitle>
          <p className="text-b6 whitespace-pre-line text-fg-neutral-subtle">
            {
              "사진을 포함한 모든 데이터가 즉시 영구 삭제됩니다.\n삭제 후에는 복구할 수 없습니다."
            }
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <ButtonCta
          variant="secondary"
          className="w-25 shrink-0"
          onClick={onCancel}
        >
          취소
        </ButtonCta>
        <ButtonCta variant="danger" className="flex-1" onClick={onConfirm}>
          계정 삭제
        </ButtonCta>
      </div>
    </>
  )
}

function MenuView({
  onEditProfile,
  onClose,
}: {
  onEditProfile: () => void
  onClose: () => void
}) {
  const router = useRouter()
  const user = useSessionStore((s) => s.currentUser)
  const logout = useSessionStore((s) => s.logout)
  const removePhotosByUploader = usePhotoUploadStore(
    (s) => s.removePhotosByUploader
  )
  const resetPots = usePotStore((s) => s.resetPots)
  const clearAllFills = useRegionColorStore((s) => s.clearAll)
  const queryClient = useQueryClient()

  // 로그아웃 진행 후 스플래시 화면 이동 + 완료 토스트
  const handleLogout = async () => {
    const ok = await openConfirm({
      title: "로그아웃 하시겠어요?",
      confirmText: "로그아웃",
    })
    if (!ok) return
    logout()
    onClose()
    await router.navigate({ to: "/" })
    showToast({
      message: "로그아웃이 완료됐어요.",
      icon: "alert-neutral",
      className: SPLASH_TOAST_POSITION,
    })
  }

  // 계정 삭제: 업로드 사진·팟·UT 시드·사진 캐시까지 전부 비워
  // 재가입 시 신규 유저 기준 빈 상태에서 다시 시작되게 한다
  const handleDelete = () => {
    openModal(
      ({ close }) => (
        <DeleteConfirmContent
          onCancel={close}
          onConfirm={async () => {
            close()
            if (user) {
              removePhotosByUploader(user.id)
            }
            resetPots()
            resetUtPhotos()
            queryClient.removeQueries({ queryKey: photoKeys.all })
            clearAllFills()
            logout()
            clearAccountStorage()
            onClose()
            await router.navigate({ to: "/" })
            showToast({
              message: "계정 삭제가 완료되었습니다. 감사합니다.",
              icon: "alert",
              className: SPLASH_TOAST_POSITION,
            })
          }}
        />
      ),
      { className: popupModalClassName }
    )
  }

  return (
    <>
      <BottomSheetScreenHeader
        icon="back"
        title="마이페이지"
        onIconClick={onClose}
      />
      <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto px-4">
        <button
          type="button"
          onClick={onEditProfile}
          className="flex w-full items-center gap-5 rounded-[24px] border border-neutral-100 bg-bg-neutral-subtle px-3 py-4 text-left"
        >
          <Profile
            size="lg"
            src={user?.profileImageUrl ?? undefined}
            alt={user?.nickname}
          />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-h5 text-fg-neutral-bold">
              {user?.nickname ?? "사용자"}
            </span>
            <span className="flex items-center gap-1 text-h8-1 text-fg-neutral-subtle">
              프로필 수정
              <img src={iconChevronRightSrc} alt="" className="size-4" />
            </span>
          </span>
        </button>

        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full flex-col gap-1">
            <p className="w-full px-2 py-1 text-h8-1 text-neutral-500">
              내 정보
            </p>
            <button
              type="button"
              className={menuRowCls}
              onClick={() => openExternal(TERMS_URL)}
            >
              <span className={menuLabelCls}>이용 약관</span>
              <img src={iconChevronRightSrc} alt="" className="size-5" />
            </button>
            <button
              type="button"
              className={menuRowCls}
              onClick={() => openExternal(PRIVACY_URL)}
            >
              <span className={menuLabelCls}>개인정보처리방침</span>
              <img src={iconChevronRightSrc} alt="" className="size-5" />
            </button>
          </div>

          <div className="h-px w-full bg-stroke-neutral-weak" />

          <div className="flex w-full flex-col gap-1">
            <div className={menuRowCls}>
              <span className={menuLabelCls}>버전 정보</span>
              <span className="text-b5 text-fg-neutral-bold">
                {APP_VERSION}
              </span>
            </div>
            <button type="button" className={menuRowCls} onClick={handleLogout}>
              <span className={menuLabelCls}>로그아웃</span>
            </button>
            <button type="button" className={menuRowCls} onClick={handleDelete}>
              <span className={menuLabelCls}>계정 삭제</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ProfileEditView({ onBack }: { onBack: () => void }) {
  const user = useSessionStore((s) => s.currentUser)
  const updateUser = useSessionStore((s) => s.updateUser)

  const originalNickname = user?.nickname ?? ""
  const originalImage = user?.profileImageUrl ?? null
  // 기존 이미지가 기본 아바타면 해당 아바타 선택 상태로 진입
  const initialAvatar = originalImage
    ? DEFAULT_AVATARS.indexOf(originalImage)
    : -1

  const [nickname, setNickname] = React.useState(originalNickname)
  const [customImage, setCustomImage] = React.useState<string | null>(
    initialAvatar >= 0 ? null : originalImage
  )
  const [selectedAvatar, setSelectedAvatar] = React.useState<number | null>(
    initialAvatar >= 0 ? initialAvatar : null
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const nicknameTooLong = nickname.length > NICKNAME_MAX
  const profileImage =
    customImage ??
    (selectedAvatar != null ? DEFAULT_AVATARS[selectedAvatar] : null)

  // 저장 활성화: 닉네임/아바타 중 하나라도 기존 값과 달라야 함.
  // 기본 아바타는 이미지가 같아도 "다른 위치" 선택이면 변경으로 취급, 재클릭(같은 위치)은 비활성 유지.
  const initialAvatarIndex = initialAvatar >= 0 ? initialAvatar : null
  const imageChanged =
    customImage != null
      ? customImage !== originalImage
      : selectedAvatar !== initialAvatarIndex
  const changed = nickname.trim() !== originalNickname || imageChanged
  const canSave = changed && !!nickname.trim() && !nicknameTooLong

  const handleSave = () => {
    updateUser({ nickname: nickname.trim(), profileImageUrl: profileImage })
    onBack()
    showToast({ message: "프로필 수정이 완료됐어요.", icon: "check" })
  }

  return (
    <>
      <BottomSheetScreenHeader
        icon="back"
        title="프로필 수정"
        onIconClick={onBack}
      />
      <div className="flex w-full flex-1 flex-col items-center gap-5 overflow-y-auto px-4 pt-3">
        {/* 프로필 이미지·카메라 배지 클릭 → 갤러리/파일에서 사진 선택 (온보딩과 동일) */}
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
      </div>
      <div className="w-full px-4 pb-[34px]">
        <ButtonCta disabled={!canSave} onClick={handleSave}>
          저장
        </ButtonCta>
      </div>
    </>
  )
}

function MyPageSheet({ close }: { close: () => void }) {
  const [view, setView] = React.useState<"menu" | "edit">("menu")

  return view === "edit" ? (
    <ProfileEditView onBack={() => setView("menu")} />
  ) : (
    <MenuView onEditProfile={() => setView("edit")} onClose={close} />
  )
}

/** 마이페이지 풀높이 모달 — 프로필 수정 / 약관 링크 / 로그아웃 / 계정 삭제. */
export function openMyPageModal() {
  openBottomSheet(({ close }) => <MyPageSheet close={close} />, {
    variant: "full",
    showCloseButton: false,
  })
}
