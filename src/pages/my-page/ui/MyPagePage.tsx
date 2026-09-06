import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import type { TravelPot } from "@/entities/travel-pot"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { ProfileCard } from "@/shared/ui/profile-card"
import { ButtonCta } from "@/shared/ui/button-cta"
import { DialogTitle } from "@/shared/ui/dialog"
import { openConfirm, openModal } from "@/shared/ui/modal"
import { showToast } from "@/shared/ui/toast"
import { USE_MOCK } from "@/shared/api/client"
import { clearTokens, getRefreshToken } from "@/shared/api/token-storage"
import {
  removeSeedPhotosByUploader,
  usePhotoUploadStore,
} from "@/entities/photo"
import { useRegionColorStore } from "@/entities/region"
import { useMyPots, usePotStore } from "@/entities/travel-pot"
import { useMe, useSessionStore, withdrawAccount } from "@/entities/user"
import { RequireAuth, logoutSession } from "@/features/auth"
import { resetMapTipsSeen, resetOnboardingSeen } from "@/features/onboarding"
import { resetCompletionTips } from "@/widgets/travel-map-google"
import iconAlertDangerSrc from "@/shared/assets/icon-alert-danger.svg"
import iconChevronRightSrc from "@/shared/assets/icon-chevron-right.svg"

const APP_VERSION = "v 1.0.0"

const TERMS_URL =
  import.meta.env.VITE_TERMS_NOTION_URL ??
  "https://app.notion.com/p/3c9bee7f5996807eb34ad0588da2c8ab"
const PRIVACY_URL =
  import.meta.env.VITE_PRIVACY_NOTION_URL ??
  "https://app.notion.com/p/3c9bee7f5996804f817eeae28111d964"

// 스플래시(랜딩) CTA(카카오로 시작하기, 바닥 34px + 높이 56) 위 16px — 토스트 위치 규칙(2차 UT)
const SPLASH_TOAST_POSITION = "bottom-[106px]"

const popupModalClassName =
  "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"

const sectionTitleCls = "px-2 py-1 text-h8-1 text-neutral-500"
const menuRowCls = "flex min-h-11 w-full items-center gap-1 px-2 py-3 text-left"
const menuLabelCls = "min-w-0 flex-1 truncate text-h8-1 text-fg-neutral-bold"
const potRowCls =
  "flex min-h-14 w-full items-center justify-between gap-2 overflow-hidden rounded-[24px] border border-stroke-neutral-weak bg-bg-neutral-weak p-4 text-left"

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

function joinedAtTime(joinedAt: string | undefined): number {
  if (!joinedAt) return 0
  const [year, month = "1", day = "1"] = joinedAt.split("-")
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return 0
  }
  return Date.UTC(y, m - 1, d)
}

function MyPotRows({
  pots,
  isLoading,
  isError,
  onPotClick,
}: {
  pots: Array<TravelPot>
  isLoading: boolean
  isError: boolean
  onPotClick: (pot: TravelPot) => void
}) {
  return (
    <section className="flex w-full flex-col gap-2">
      <p className={sectionTitleCls}>내 팟</p>
      <div className="flex w-full flex-col gap-2">
        {isLoading ? (
          <p className="rounded-[24px] border border-stroke-neutral-weak bg-bg-neutral-weak p-4 text-b6 text-fg-neutral-subtle">
            팟을 불러오는 중이에요.
          </p>
        ) : isError ? (
          <p className="rounded-[24px] border border-stroke-neutral-weak bg-bg-neutral-weak p-4 text-b6 text-fg-danger-solid">
            팟 정보를 불러오지 못했어요.
          </p>
        ) : pots.length > 0 ? (
          pots.map((pot) => (
            <button
              key={pot.id}
              type="button"
              className={potRowCls}
              onClick={() => onPotClick(pot)}
            >
              <span className="min-w-0 flex-1 truncate text-h8-1 text-fg-neutral-bold">
                {pot.name}
              </span>
              <img
                src={iconChevronRightSrc}
                alt=""
                className="size-6 shrink-0"
              />
            </button>
          ))
        ) : (
          <p className="rounded-[24px] border border-stroke-neutral-weak bg-bg-neutral-weak p-4 text-b6 text-fg-neutral-subtle">
            참여 중인 팟이 없어요.
          </p>
        )}
      </div>
    </section>
  )
}

function DeleteConfirmContent({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <>
      {/* Figma 3065-13823 — 그래픽 슬롯(60, 아이콘 top 12) · gap 16 · 텍스트 컨테이너 py-8 gap-10 */}
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="mt-3 flex size-12 items-center justify-center rounded-full bg-bg-neutral-subtle">
          <img src={iconAlertDangerSrc} alt="" className="size-9" />
        </span>
        <div className="flex flex-col gap-2.5 py-2">
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
      <div className="flex gap-3">
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

function MyPageContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const localUser = useSessionStore((s) => s.currentUser)
  const logout = useSessionStore((s) => s.logout)
  const selectPot = usePotStore((s) => s.selectPot)
  const resetPots = usePotStore((s) => s.resetPots)
  const clearRegionFills = useRegionColorStore((s) => s.clearAll)
  const removePhotosByUploader = usePhotoUploadStore(
    (s) => s.removePhotosByUploader
  )
  const meQuery = useMe({
    enabled: !USE_MOCK,
    refetchOnMount: "always",
    retry: false,
  })
  const {
    pots,
    isPending: isPotsLoading,
    isError: isPotsError,
  } = useMyPots(localUser?.id ?? null, { refetchOnMount: "always" })

  const user = USE_MOCK ? localUser : (meQuery.data ?? localUser)

  // 최근 입장한 팟이 최상단 (Figma 1959-5326 #2)
  const myPots = React.useMemo(
    () =>
      [...pots].sort(
        (a, b) => joinedAtTime(b.joinedAt) - joinedAtTime(a.joinedAt)
      ),
    [pots]
  )

  const handleLogout = async () => {
    const ok = await openConfirm({
      title: "로그아웃 하시겠어요?",
      confirmText: "로그아웃",
    })
    if (!ok) return
    // 서버 refreshToken 폐기 — 실패해도 로컬 로그아웃은 진행한다
    const refreshToken = getRefreshToken()
    if (!USE_MOCK && refreshToken) {
      void logoutSession(refreshToken).catch(() => {})
    }
    clearTokens()
    logout()
    // me 캐시가 남으면 뒤로가기·재진입 시 RequireAuth가 캐시로 세션을 되살린다(유령 로그인)
    queryClient.clear()
    await router.navigate({ to: "/" })
    showToast({
      message: "로그아웃이 완료됐어요.",
      // 검정 ✓ — 완료 안내 (Figma 3065-20961)
      icon: "check-neutral",
      className: SPLASH_TOAST_POSITION,
    })
  }

  const handleDelete = () => {
    openModal(
      ({ close }) => (
        <DeleteConfirmContent
          onCancel={close}
          onConfirm={async () => {
            close()
            // 서버 탈퇴 먼저 — Bearer 인증이 필요해 clearTokens 전에 호출한다.
            // 실패하면 계정이 서버에 남아 있으므로 로컬 데이터를 지우지 않고 알린다
            try {
              await withdrawAccount()
            } catch {
              showToast({
                message: "계정 삭제에 실패했어요. 다시 시도해 주세요.",
                icon: "alert",
              })
              return
            }
            if (user) {
              removePhotosByUploader(user.id)
              removeSeedPhotosByUploader(user.id)
            }
            // 로컬(localStorage 포함) 계정 데이터 전체 초기화 — 남겨두면 재가입 시
            // 온보딩이 "이미 봤음"으로 스킵돼 가입 완료 후 지도 이동이 멈추는 등
            // 신규 유저 플로우가 이전 계정의 흔적에 걸려 깨진다
            resetPots()
            clearRegionFills()
            resetOnboardingSeen()
            resetMapTipsSeen()
            resetCompletionTips()
            clearTokens() // 토큰이 남으면 Bearer로 여전히 인증됨
            logout()
            // 서버 캐시(me·팟·사진) 전체 폐기 — me가 남으면 RequireAuth가 캐시로 세션을 되살린다
            queryClient.clear()
            await router.navigate({ to: "/" })
            showToast({
              message: "계정 삭제가 완료되었습니다. 감사합니다.",
              // 검정 ✓ — 에러가 아닌 종료 안내 (Figma 3065-20990)
              icon: "check-neutral",
              className: SPLASH_TOAST_POSITION,
            })
          }}
        />
      ),
      { className: popupModalClassName }
    )
  }

  const handlePotClick = (pot: TravelPot) => {
    selectPot(pot.id)
    router.navigate({ to: "/my-page/pot/$potId", params: { potId: pot.id } })
  }

  return (
    <MobileLayout className="flex min-h-[var(--app-vh)] flex-col bg-bg-neutral-subtle">
      <Header
        title="마이페이지"
        onIconClick={() =>
          router.navigate({ to: "/map-google", replace: true })
        }
      />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-2 pb-8">
        <ProfileCard
          nickname={user?.nickname ?? "사용자"}
          profileSrc={user?.profileImageUrl ?? undefined}
          onEdit={() => router.navigate({ to: "/my-page/profile-edit" })}
          className="w-full"
        />

        <div className="flex w-full flex-col gap-4">
          <MyPotRows
            pots={myPots}
            isLoading={isPotsLoading}
            isError={isPotsError}
            onPotClick={handlePotClick}
          />

          <section className="flex w-full flex-col gap-1">
            <p className={sectionTitleCls}>내 정보</p>
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
          </section>

          <div className="h-px w-full bg-stroke-neutral-weak" />

          <section className="flex w-full flex-col gap-1">
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
          </section>
        </div>
      </main>
    </MobileLayout>
  )
}

export function MyPagePage() {
  return (
    <RequireAuth>
      <MyPageContent />
    </RequireAuth>
  )
}
