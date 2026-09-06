import * as React from "react"
import { useRouter } from "@tanstack/react-router"

import type { PotMember } from "@/entities/travel-pot"
import {
  useDeleteParty,
  useLeaveParty,
  usePotStore,
  usePotsHydrated,
  useRenameParty,
} from "@/entities/travel-pot"
import { useSessionStore } from "@/entities/user"
import { getGraphQLErrorCode } from "@/shared/api/client"
import { RequireAuth } from "@/features/auth"
import iconAlertDangerSrc from "@/shared/assets/icon-alert-danger.svg"
import iconContentCopySrc from "@/shared/assets/icon-content-copy.svg"
import { cn } from "@/shared/lib/utils"
import { ButtonCta } from "@/shared/ui/button-cta"
import { ButtonIcon } from "@/shared/ui/button-icon"
import { DialogTitle } from "@/shared/ui/dialog"
import { Header } from "@/shared/ui/header"
import { MobileLayout } from "@/shared/ui/mobile-layout"
import { openModal } from "@/shared/ui/modal"
import { Profile } from "@/shared/ui/profile"
import { showToast } from "@/shared/ui/toast"

const sectionTitleCls = "px-2 py-1 text-h8-1 text-neutral-500"
const popupModalClassName =
  "w-[343px] max-w-[calc(100%-2rem)] gap-4 rounded-[32px] p-4 shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]"

function sortedMembers(
  members: Array<PotMember>,
  currentUserId: string | undefined
): Array<PotMember> {
  if (!currentUserId) return members

  return members
    .map((member, joinedOrder) => ({ member, joinedOrder }))
    .sort((a, b) => {
      if (a.member.id === currentUserId && b.member.id !== currentUserId) {
        return -1
      }
      if (b.member.id === currentUserId && a.member.id !== currentUserId) {
        return 1
      }
      return a.joinedOrder - b.joinedOrder
    })
    .map(({ member }) => member)
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // 클립보드 권한이 없거나 미지원이어도 사용 흐름은 토스트까지 유지한다.
  }
}

function inviteLinkFor(code: string): string {
  const origin = window.location.origin
  return `${origin}/pot-start?inviteCode=${encodeURIComponent(code)}`
}

function RoleBadge({ leader }: { leader: boolean }) {
  return (
    <span
      className={cn(
        // 칩 텍스트 12/600/20 (Figma 3065-17307) — 타이포 스케일에 없는 조합이라 값 고정
        "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[12px] leading-5 font-semibold tracking-[-0.1px]",
        // 팟장 칩 배경은 시안이 fg-neutral-solid(neutral-600)를 그대로 쓴다 — inverse(800)보다 한 톤 연함
        leader
          ? "bg-fg-neutral-solid text-fg-neutral-inverse"
          : "bg-neutral-150 text-fg-neutral-solid"
      )}
    >
      {leader ? "팟장" : "팟원"}
    </span>
  )
}

function MemberRow({
  member,
  isMe,
  isLeader,
}: {
  member: PotMember
  isMe: boolean
  isLeader: boolean
}) {
  return (
    <li className="flex min-h-14 w-full items-center rounded-[24px] border border-stroke-neutral-weak bg-bg-neutral-weak px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Profile
          size="md"
          src={member.profileImageUrl ?? undefined}
          alt={`${member.nickname} 프로필`}
        />
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-h7 text-fg-neutral-bold">
            {member.nickname}
            {isMe ? " (ME)" : ""}
          </span>
          <RoleBadge leader={isLeader} />
        </div>
      </div>
    </li>
  )
}

function ConfirmDangerContent({
  title,
  description,
  confirmText,
  onCancel,
  onConfirm,
}: {
  title: string
  description: string
  confirmText: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <>
      {/* Figma 3065-17473·17539 — 그래픽 슬롯(60, 아이콘 top 12) · gap 16 · 텍스트 컨테이너 py-8 gap-10 */}
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="mt-3 flex size-12 items-center justify-center rounded-full bg-bg-neutral-subtle">
          <img src={iconAlertDangerSrc} alt="" className="size-9" />
        </span>
        <div className="flex flex-col gap-2.5 py-2">
          <DialogTitle className="text-h5-1 text-fg-neutral-bold">
            {title}
          </DialogTitle>
          <p className="text-b6 whitespace-pre-line text-fg-neutral-subtle">
            {description}
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
          {confirmText}
        </ButtonCta>
      </div>
    </>
  )
}

function MyPotEditContent({ potId }: { potId: string }) {
  const router = useRouter()
  const user = useSessionStore((s) => s.currentUser)
  const potsHydrated = usePotsHydrated()
  const pot = usePotStore((s) => s.pots.find((p) => p.id === potId))
  const renamePartyMutation = useRenameParty()
  const deletePartyMutation = useDeleteParty()
  const leavePartyMutation = useLeaveParty()
  const [name, setName] = React.useState(pot?.name ?? "")

  const leaderId = pot?.members[0]?.id
  const isMember = !!user && !!pot?.members.some((m) => m.id === user.id)
  const isLeader = !!user && leaderId === user.id
  const trimmedName = name.trim()
  const nameChanged = !!pot && trimmedName !== pot.name
  const canSave = nameChanged && !!trimmedName
  const members = React.useMemo(
    () => sortedMembers(pot?.members ?? [], user?.id),
    [pot?.members, user?.id]
  )

  const goMyPage = React.useCallback(
    () => router.navigate({ to: "/my-page", replace: true }),
    [router]
  )

  React.useEffect(() => {
    if (pot) setName(pot.name)
  }, [pot?.id, pot?.name])

  React.useEffect(() => {
    if (potsHydrated && (!pot || !isMember)) {
      goMyPage()
    }
  }, [goMyPage, isMember, pot, potsHydrated])

  if (!potsHydrated || !pot || !user || !isMember) return null

  const handleSave = async () => {
    if (!canSave || renamePartyMutation.isPending) return
    try {
      await renamePartyMutation.mutateAsync({
        potId: pot.id,
        name: trimmedName,
      })
    } catch {
      showToast({
        message: "이름 변경에 실패했어요",
        icon: "alert",
      })
    }
  }

  const handleCopyCode = async () => {
    await copyToClipboard(pot.inviteCode)
    showToast({
      message: "초대코드가 복사됐어요",
      icon: "check",
    })
  }

  const handleShareInvite = async () => {
    const link = inviteLinkFor(pot.inviteCode)
    await copyToClipboard(link)
    showToast({
      message: "초대 링크가 복사됐어요",
      icon: "check",
    })

    if (typeof navigator.share !== "function") return

    try {
      // title을 넣으면 카톡 등에서 "제목 - 본문"으로 이어 붙여 팟 이름이 중복 노출된다
      // url을 따로 주면 공유 대상이 문구와 링크를 공백으로 이어 붙인다 — 줄바꿈을 위해 text에 포함
      await navigator.share({
        text: `${pot.name} 여행팟에 초대합니다.\n${link}`,
      })
    } catch {
      // 사용자가 OS 공유 시트를 닫은 경우
    }
  }

  const handleDeletePot = () => {
    if (!isLeader) return

    openModal(
      ({ close }) => (
        <ConfirmDangerContent
          title="팟을 삭제하시겠습니까?"
          description={
            "사진을 포함한 모든 데이터가 즉시 영구 삭제됩니다.\n삭제 후에는 복구할 수 없습니다."
          }
          confirmText="팟 삭제"
          onCancel={close}
          onConfirm={async () => {
            close()
            try {
              await deletePartyMutation.mutateAsync(pot.id)
            } catch (error) {
              showToast({
                message:
                  getGraphQLErrorCode(error) === "PARTY_HAS_MEMBERS"
                    ? "팟원이 남아 있어 삭제할 수 없어요"
                    : "팟 삭제에 실패했어요",
                icon: "alert",
              })
              return
            }
            await goMyPage()
          }}
        />
      ),
      { className: popupModalClassName }
    )
  }

  const handleLeavePot = () => {
    openModal(
      ({ close }) => (
        <ConfirmDangerContent
          title="팟을 나가시겠습니까?"
          description={
            "사진을 포함한 모든 데이터가 즉시 영구 삭제됩니다.\n삭제 후에는 복구할 수 없습니다."
          }
          confirmText="나가기"
          onCancel={close}
          onConfirm={async () => {
            close()
            try {
              await leavePartyMutation.mutateAsync({
                potId: pot.id,
                memberId: user.id,
              })
            } catch (error) {
              showToast({
                message:
                  getGraphQLErrorCode(error) === "OWNER_CANNOT_LEAVE"
                    ? "팟장은 팟을 나갈 수 없어요"
                    : "팟 나가기에 실패했어요",
                icon: "alert",
              })
              return
            }
            await goMyPage()
            showToast({ message: "팟에서 나갔습니다", icon: "check" })
          }}
        />
      ),
      { className: popupModalClassName }
    )
  }

  return (
    <MobileLayout className="flex min-h-[var(--app-vh)] flex-col bg-bg-neutral-subtle">
      <Header title={pot.name} onIconClick={goMyPage} />

      <main className="flex flex-1 flex-col px-4 pt-2 pb-8">
        <section className="flex w-full flex-col gap-2">
          <label htmlFor="pot-name" className={sectionTitleCls}>
            팟 이름
          </label>
          <div
            className={cn(
              "flex h-12 w-full items-center gap-2 rounded-full border border-stroke-neutral-subtle bg-bg-neutral-weak px-4 transition-colors focus-within:border-stroke-neutral-bold",
              !trimmedName && nameChanged && "border-stroke-danger-subtle"
            )}
          >
            <input
              id="pot-name"
              value={name}
              placeholder="우리 팟의 이름을 입력해주세요."
              className="min-w-0 flex-1 bg-transparent text-b4 text-fg-neutral-bold outline-none placeholder:text-fg-neutral-bold-disabled"
              onChange={(e) => setName(e.target.value)}
            />
            {nameChanged ? (
              <button
                type="button"
                disabled={!canSave}
                className="flex h-[34px] shrink-0 items-center justify-center rounded-full bg-bg-neutral-inverse px-3 text-h9 text-fg-neutral-inverse transition-colors disabled:bg-bg-neutral-inverse-disabled disabled:text-fg-neutral-inverse-disabled"
                onClick={handleSave}
              >
                저장
              </button>
            ) : null}
          </div>
        </section>

        <section className="mt-6 flex w-full flex-col gap-2">
          <p className={sectionTitleCls}>멤버 ({pot.members.length})</p>
          <ul className="flex w-full flex-col gap-2">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isMe={member.id === user.id}
                isLeader={member.id === leaderId}
              />
            ))}
          </ul>
        </section>

        <section className="mt-4 flex w-full flex-col gap-1">
          <p className={sectionTitleCls}>친구 초대</p>
          <div className="flex min-h-[70px] w-full items-start justify-between gap-3 rounded-2xl border border-bg-neutral-inverse bg-bg-neutral-subtle px-4 py-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-h9 text-fg-neutral-subtle">초대코드</span>
              {/* 시안(3065-17339)은 fg-neutral-bold(800)가 아닌 neutral-900 */}
              <span className="truncate text-h6-1 text-neutral-900">
                {pot.inviteCode}
              </span>
            </div>
            <ButtonIcon aria-label="초대코드 복사" onClick={handleCopyCode}>
              <img src={iconContentCopySrc} alt="" className="size-6" />
            </ButtonIcon>
          </div>
        </section>

        <div className="mt-auto flex w-full flex-col pt-4">
          <ButtonCta onClick={handleShareInvite}>초대 링크 공유하기</ButtonCta>

          <section className="mt-4 flex w-full flex-col gap-3 border-t border-stroke-neutral-weak pt-3">
            {isLeader ? (
              <ButtonCta variant="danger" onClick={handleDeletePot}>
                팟 삭제하기
              </ButtonCta>
            ) : null}
            <ButtonCta variant="secondary" onClick={handleLeavePot}>
              팟 나가기
            </ButtonCta>
          </section>
        </div>
      </main>
    </MobileLayout>
  )
}

export function MyPotEditPage({ potId }: { potId: string }) {
  return (
    <RequireAuth>
      <MyPotEditContent potId={potId} />
    </RequireAuth>
  )
}
